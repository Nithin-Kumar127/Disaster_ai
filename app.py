import os
import io
import base64

import streamlit as st
import torch
import torch.nn as nn
import torch.nn.functional as F
import torchvision.models as models
import cv2
import numpy as np
from PIL import Image, ImageOps
import boto3
from botocore.exceptions import BotoCoreError, ClientError
from groq import Groq

# ============================================================
# 0. S3 CLOUD BACKUP HELPER & GROQ CONFIG
# ============================================================
S3_BUCKET = "disaster-ai-storage-nithin"
S3_REGION = "ap-south-1"

# Fetch Groq API Key safely from Environment Variables or Streamlit secrets
GROQ_API_KEY = os.environ.get("GROQ_API_KEY", st.secrets.get("GROQ_API_KEY", ""))
VISION_MODEL = "qwen/qwen3.8-27b"

def upload_to_s3(file_bytes, filename):
    """Uploads uploaded image bytes directly to AWS S3 bucket."""
    try:
        s3 = boto3.client("s3", region_name=S3_REGION)
        s3.upload_fileobj(io.BytesIO(file_bytes), S3_BUCKET, f"uploads/{filename}")
        return True
    except (BotoCoreError, ClientError) as e:
        st.sidebar.warning(f"S3 Backup Warning: {e}")
        return False


def encode_image_for_api(img_rgb, max_dim=640, quality=70):
    """Resizes and encodes RGB array to base64 JPEG for Groq Vision API."""
    h, w = img_rgb.shape[:2]
    scale = max_dim / max(h, w)
    if scale < 1:
        img_rgb = cv2.resize(img_rgb, (int(w * scale), int(h * scale)))
    img_bgr = cv2.cvtColor(img_rgb, cv2.COLOR_RGB2BGR)
    _, buf = cv2.imencode(".jpg", img_bgr, [cv2.IMWRITE_JPEG_QUALITY, quality])
    return base64.b64encode(buf).decode("utf-8")


def generate_rescue_briefing(overlay_img_rgb, pred_mask, class_names, groq_api_key, scene_id="scene"):
    """Calls Groq Vision API (qwen/qwen3.8-27b) to generate a 4-part Rescue Briefing."""
    if not groq_api_key:
        return "⚠️ GROQ_API_KEY missing. Please set your API key in environment variables or Streamlit secrets."

    client = Groq(api_key=groq_api_key)
    
    # Class stats string
    unique, counts = np.unique(pred_mask, return_counts=True)
    total = pred_mask.size
    stats_parts = [f"{class_names[u]}: {100*c/total:.1f}%" for u, c in zip(unique, counts) if 100*c/total > 0.05]
    stats_str = ", ".join(stats_parts)

    overlay_b64 = encode_image_for_api(overlay_img_rgb)

    prompt = (
        f"Post-disaster satellite scene '{scene_id}'. Overlay colors: green=no damage, "
        f"yellow=minor, orange=major, red=destroyed. Model pixel stats: {stats_str}.\n\n"
        "Give a rescue-ops briefing as plain text with exactly these four labeled sections, "
        "each on its own line, no markdown formatting, no asterisks:\n\n"
        "ROADS: <one or two sentences>\n"
        "INFRASTRUCTURE: <one or two sentences>\n"
        "ACCESS: <one or two sentences>\n"
        "ACTIONS: <numbered list of 3 short action items, each on its own line>\n\n"
        "Be concise but always finish every sentence completely."
    )

    try:
        response = client.chat.completions.create(
            model=VISION_MODEL,
            messages=[{
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt},
                    {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{overlay_b64}"}},
                ],
            }],
            temperature=0.2,
            max_tokens=700,
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"❌ Groq API Call Failed: {str(e)}"

# ============================================================
# 1. MODEL ARCHITECTURE  (identical to Colab - do not edit)
# ============================================================
class ConvBlock(nn.Module):
    def __init__(self, in_ch, out_ch):
        super().__init__()
        self.block = nn.Sequential(
            nn.Conv2d(in_ch, out_ch, kernel_size=3, padding=1, bias=False),
            nn.BatchNorm2d(out_ch), nn.ReLU(inplace=True),
            nn.Conv2d(out_ch, out_ch, kernel_size=3, padding=1, bias=False),
            nn.BatchNorm2d(out_ch), nn.ReLU(inplace=True),
        )

    def forward(self, x):
        return self.block(x)


class UpBlock(nn.Module):
    def __init__(self, in_ch, skip_ch, out_ch):
        super().__init__()
        self.reduce = nn.Conv2d(in_ch, out_ch, kernel_size=1)
        self.conv = ConvBlock(out_ch + skip_ch, out_ch)

    def forward(self, x, skip):
        x = F.interpolate(x, size=skip.shape[-2:], mode="bilinear", align_corners=False)
        x = self.reduce(x)
        x = torch.cat([x, skip], dim=1)
        return self.conv(x)


class SharedResNetEncoder(nn.Module):
    def __init__(self, pretrained=False):
        super().__init__()
        resnet = models.resnet34(weights=None)
        self.stem = nn.Sequential(resnet.conv1, resnet.bn1, resnet.relu, resnet.maxpool)
        self.layer1 = resnet.layer1
        self.layer2 = resnet.layer2
        self.layer3 = resnet.layer3
        self.layer4 = resnet.layer4

    def forward(self, x):
        x = self.stem(x)
        s1 = self.layer1(x)
        s2 = self.layer2(s1)
        s3 = self.layer3(s2)
        s4 = self.layer4(s3)
        return s1, s2, s3, s4


def change_aware_fuse(f_pre, f_post):
    diff = torch.abs(f_pre - f_post)
    return torch.cat([f_pre, f_post, diff], dim=1)


class SiameseUNet(nn.Module):
    def __init__(self, num_classes=5, pretrained_backbone=False):
        super().__init__()
        self.encoder = SharedResNetEncoder(pretrained=pretrained_backbone)
        self.up4 = UpBlock(in_ch=512 * 3, skip_ch=256 * 3, out_ch=256)
        self.up3 = UpBlock(in_ch=256,     skip_ch=128 * 3, out_ch=128)
        self.up2 = UpBlock(in_ch=128,     skip_ch=64 * 3,  out_ch=64)
        self.final_conv = ConvBlock(64, 32)
        self.classifier = nn.Conv2d(32, num_classes, kernel_size=1)

    def forward(self, i_pre, i_post):
        p1, p2, p3, p4 = self.encoder(i_pre)
        q1, q2, q3, q4 = self.encoder(i_post)
        f1 = change_aware_fuse(p1, q1)
        f2 = change_aware_fuse(p2, q2)
        f3 = change_aware_fuse(p3, q3)
        f4 = change_aware_fuse(p4, q4)
        d = self.up4(f4, f3)
        d = self.up3(d, f2)
        d = self.up2(d, f1)
        d = F.interpolate(d, scale_factor=4, mode="bilinear", align_corners=False)
        d = self.final_conv(d)
        return self.classifier(d)


# ============================================================
# 2. INFERENCE HELPERS (same logic as Colab)
# ============================================================
CLASS_NAMES = ["No damage", "Minor damage", "Major damage", "Destroyed", "Background / no building"]
CLASS_COLORS = {
    0: (0, 255, 0),
    1: (255, 255, 0),
    2: (255, 165, 0),
    3: (255, 0, 0),
    4: (0, 0, 0),
}
BACKGROUND_CLASS = 4
WEIGHTS_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "best_siamese_unet_xbd.pth")


def class_mask_to_rgb(class_mask):
    H, W = class_mask.shape
    rgb = np.zeros((H, W, 3), dtype=np.uint8)
    for cls_idx, color in CLASS_COLORS.items():
        rgb[class_mask == cls_idx] = color
    return rgb


@torch.no_grad()
def run_tiled_inference(model, pre_img_rgb, post_img_rgb, device, patch_size=256, progress=None):
    H, W = post_img_rgb.shape[:2]
    pad_h = (patch_size - H % patch_size) % patch_size
    pad_w = (patch_size - W % patch_size) % patch_size

    pre_pad = cv2.copyMakeBorder(pre_img_rgb, 0, pad_h, 0, pad_w, cv2.BORDER_REFLECT)
    post_pad = cv2.copyMakeBorder(post_img_rgb, 0, pad_h, 0, pad_w, cv2.BORDER_REFLECT)
    Hp, Wp = pre_pad.shape[:2]

    pred_full = np.zeros((Hp, Wp), dtype=np.uint8)
    model.eval()

    ys = list(range(0, Hp, patch_size))
    xs = list(range(0, Wp, patch_size))
    total, done = len(ys) * len(xs), 0

    for y in ys:
        for x in xs:
            pre_tile = pre_pad[y:y + patch_size, x:x + patch_size]
            post_tile = post_pad[y:y + patch_size, x:x + patch_size]

            pre_t = torch.from_numpy(pre_tile).permute(2, 0, 1).float().div(255.0).unsqueeze(0).to(device)
            post_t = torch.from_numpy(post_tile).permute(2, 0, 1).float().div(255.0).unsqueeze(0).to(device)

            logits = model(pre_t, post_t)
            tile_pred = torch.argmax(logits, dim=1).squeeze(0).cpu().numpy().astype(np.uint8)
            pred_full[y:y + patch_size, x:x + patch_size] = tile_pred

            done += 1
            if progress is not None:
                progress.progress(done / total)

    return pred_full[:H, :W]


def overlay_from_mask(pred_mask, post_img_rgb, alpha=0.4):
    color_mask = class_mask_to_rgb(pred_mask)
    overlay = post_img_rgb.copy().astype(np.float32)
    foreground = pred_mask != BACKGROUND_CLASS
    overlay[foreground] = (
        (1 - alpha) * post_img_rgb[foreground].astype(np.float32)
        + alpha * color_mask[foreground].astype(np.float32)
    )
    return overlay.astype(np.uint8)


def load_uploaded_rgb(uploaded_file):
    """Decode an upload to a clean 8-bit RGB array (handles EXIF rotation, alpha, palette, 16-bit)."""
    raw_bytes = uploaded_file.getvalue()
    upload_to_s3(raw_bytes, uploaded_file.name)
    img = Image.open(io.BytesIO(raw_bytes))
    img = ImageOps.exif_transpose(img)
    if img.mode in ("I;16", "I"):
        arr = np.array(img).astype(np.float32)
        arr = (arr / max(arr.max(), 1) * 255).astype(np.uint8)
        img = Image.fromarray(arr).convert("RGB")
    else:
        img = img.convert("RGB")
    return np.array(img)


def class_distribution(mask):
    counts = np.bincount(mask.ravel(), minlength=5)
    total = counts.sum()
    return [(CLASS_NAMES[i], int(counts[i]), 100.0 * counts[i] / total) for i in range(5)]


# ============================================================
# 3. MODEL LOADING
# ============================================================
@st.cache_resource
def load_model(weights_path, _mtime, _size):
    model = SiameseUNet(num_classes=5, pretrained_backbone=False)
    checkpoint = torch.load(weights_path, map_location=torch.device("cpu"))

    meta = {}
    if isinstance(checkpoint, dict) and "model_state_dict" in checkpoint:
        state_dict = checkpoint["model_state_dict"]
        meta = {"epoch": checkpoint.get("epoch"), "macro_f1": checkpoint.get("macro_f1")}
    else:
        state_dict = checkpoint

    state_dict = {k.replace("module.", "", 1) if k.startswith("module.") else k: v
                  for k, v in state_dict.items()}

    model.load_state_dict(state_dict, strict=True)
    model.eval()
    return model, meta


# ============================================================
# 4. STREAMLIT UI
# ============================================================
st.set_page_config(page_title="AI Disaster Assessment v1.0", layout="wide")
st.title("🛰️ AI Satellite Disaster Damage Assessment v1.0")

if not os.path.exists(WEIGHTS_PATH):
    st.error(f"Weights file not found: {WEIGHTS_PATH}")
    st.stop()

st_info = os.stat(WEIGHTS_PATH)
model, ckpt_meta = load_model(WEIGHTS_PATH, st_info.st_mtime, st_info.st_size)

with st.sidebar:
    st.header("Settings")
    alpha = st.slider("Overlay opacity", 0.1, 0.9, 0.4, 0.05)
    show_diag = st.checkbox("Show diagnostics", value=True)
    
    # Allow passing Groq Key dynamically in Sidebar if not in env
    groq_key_input = st.text_input("Groq API Key", value=GROQ_API_KEY, type="password")
    if groq_key_input:
        GROQ_API_KEY = groq_key_input

    st.markdown("**Legend**")
    for i, name in enumerate(CLASS_NAMES[:4]):
        r, g, b = CLASS_COLORS[i]
        st.markdown(
            f"<span style='display:inline-block;width:14px;height:14px;background:rgb({r},{g},{b});"
            f"margin-right:8px;border:1px solid #888'></span>{name}",
            unsafe_allow_html=True,
        )
    st.caption("Pixels with no detected building are left untouched.")
    st.caption(f"📦 Cloud Storage Active: `s3://{S3_BUCKET}`")
    if show_diag:
        st.markdown("**Loaded weights**")
        st.caption(f"{os.path.basename(WEIGHTS_PATH)} - {st_info.st_size / 1e6:.1f} MB")
        if ckpt_meta:
            st.caption(f"epoch={ckpt_meta.get('epoch')}  macro_f1={ckpt_meta.get('macro_f1')}")

col1, col2 = st.columns(2)
with col1:
    pre_file = st.file_uploader("Upload PRE-disaster image", type=["png", "jpg", "jpeg", "tif", "tiff"])
with col2:
    post_file = st.file_uploader("Upload POST-disaster image", type=["png", "jpg", "jpeg", "tif", "tiff"])

if pre_file and post_file:
    pre_img = load_uploaded_rgb(pre_file)
    post_img = load_uploaded_rgb(post_file)

    if pre_img.shape[:2] != post_img.shape[:2]:
        st.warning(
            f"Pre is {pre_img.shape[1]}x{pre_img.shape[0]} and post is {post_img.shape[1]}x{post_img.shape[0]}. "
            "Resizing the pre image to match the post image."
        )
        pre_img = cv2.resize(pre_img, (post_img.shape[1], post_img.shape[0]), interpolation=cv2.INTER_AREA)

    c1, c2 = st.columns(2)
    c1.image(pre_img, caption="Pre-disaster", use_container_width=True)
    c2.image(post_img, caption="Post-disaster", use_container_width=True)

    if st.button("Run Damage Analysis", type="primary"):
        bar = st.progress(0.0, text="Running tiled inference...")
        pred_mask = run_tiled_inference(model, pre_img, post_img, torch.device("cpu"), patch_size=256, progress=bar)
        bar.empty()

        overlay = overlay_from_mask(pred_mask, post_img, alpha=alpha)
        mask_rgb = class_mask_to_rgb(pred_mask)

        o1, o2 = st.columns(2)
        o1.image(overlay, caption="Damage overlay on post-disaster image", use_container_width=True)
        o2.image(mask_rgb, caption="Raw predicted class map (black = background)", use_container_width=True)

        dist = class_distribution(pred_mask)
        st.subheader("Predicted Class Distribution")
        st.table({
            "Class": [d[0] for d in dist],
            "Pixels": [d[1] for d in dist],
            "% of image": [f"{d[2]:.2f}%" for d in dist],
        })

        # --- RECOVERY / RESCUE BRIEFING VIA GROQ VISION ---
        st.markdown("---")
        st.subheader("🚨 AI Rescue-Ops Briefing")
        with st.spinner("Analyzing scene with Groq Vision Model..."):
            briefing = generate_rescue_briefing(overlay, pred_mask, CLASS_NAMES, GROQ_API_KEY)
            st.text_area("Rescue Protocol Briefing", value=briefing, height=220)