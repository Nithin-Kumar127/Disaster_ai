import os
import io
import time
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
# 0. CONFIG & SAFE SECRETS MANAGEMENT
# ============================================================
S3_BUCKET = "disaster-ai-storage-nithin"
S3_REGION = "ap-south-1"

# REPLACE WITH YOUR ACTUAL SNS TOPIC ARN CREATED IN AWS CONSOLE
SNS_TOPIC_ARN = "arn:aws:sns:ap-south-1:123456789012:Disaster-Emergency-Alerts"

# Safely load Groq API Key without throwing StreamlitSecretNotFoundError
GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")
if not GROQ_API_KEY:
    try:
        GROQ_API_KEY = st.secrets.get("GROQ_API_KEY", "")
    except Exception:
        GROQ_API_KEY = ""

VISION_MODEL = "qwen/qwen3.8-27b"


# ============================================================
# 1. CLOUD INTEGRATIONS (S3, SNS, GROQ)
# ============================================================
def upload_to_s3(file_bytes, filename):
    """Uploads uploaded image bytes directly to AWS S3 bucket."""
    try:
        s3 = boto3.client("s3", region_name=S3_REGION)
        s3.upload_fileobj(io.BytesIO(file_bytes), S3_BUCKET, f"uploads/{filename}")
        return True
    except (BotoCoreError, ClientError) as e:
        st.sidebar.warning(f"S3 Backup Warning: {e}")
        return False


def send_sns_emergency_alert(destroyed_pct, scene_summary):
    """Triggers AWS SNS Emergency Notification when severe damage threshold is exceeded."""
    if "YOUR_ACCOUNT_ID" in SNS_TOPIC_ARN:
        return False, "SNS ARN not updated with valid Account ID in app.py"

    try:
        sns = boto3.client("sns", region_name=S3_REGION)

        message = (
            f"🚨 CRITICAL DISASTER ALERT DETECTED\n"
            f"------------------------------------\n"
            f"Severe Structural Impact: {destroyed_pct:.2f}% Destroyed Buildings\n\n"
            f"AI Assessment Summary:\n{scene_summary}\n\n"
            f"Action Required: Emergency USAR teams dispatched to target sector.\n"
            f"View Operations Dashboard: http://15.206.174.67"
        )

        response = sns.publish(
            TopicArn=SNS_TOPIC_ARN,
            Subject=f"🚨 URGENT: Critical Damage Escalation ({destroyed_pct:.1f}% Destroyed)",
            Message=message,
        )
        return True, response.get("MessageId", "Published")
    except Exception as e:
        return False, str(e)


def encode_image_for_api(img_rgb, max_dim=640, quality=70):
    """Resizes and encodes RGB array to base64 JPEG for Groq Vision API."""
    h, w = img_rgb.shape[:2]
    scale = max_dim / max(h, w)
    if scale < 1:
        img_rgb = cv2.resize(img_rgb, (int(w * scale), int(h * scale)))
    img_bgr = cv2.cvtColor(img_rgb, cv2.COLOR_RGB2BGR)
    _, buf = cv2.imencode(".jpg", img_bgr, [cv2.IMWRITE_JPEG_QUALITY, quality])
    return base64.b64encode(buf).decode("utf-8")


def generate_rescue_briefing(
    overlay_img_rgb, pred_mask, class_names, groq_api_key, scene_id="scene"
):
    """Calls Groq Vision API to generate a 4-part Rescue Briefing."""
    if not groq_api_key:
        return "⚠️ GROQ_API_KEY missing. Please enter your API key in the sidebar."

    try:
        client = Groq(api_key=groq_api_key)

        unique, counts = np.unique(pred_mask, return_counts=True)
        total = pred_mask.size
        stats_parts = [
            f"{class_names[u]}: {100 * c / total:.1f}%"
            for u, c in zip(unique, counts)
            if 100 * c / total > 0.05
        ]
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

        response = client.chat.completions.create(
            model=VISION_MODEL,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{overlay_b64}"
                            },
                        },
                    ],
                }
            ],
            temperature=0.2,
            max_tokens=700,
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"❌ Groq API Call Failed: {str(e)}"


# ============================================================
# 2. MODEL ARCHITECTURE
# ============================================================
class ConvBlock(nn.Module):
    def __init__(self, in_ch, out_ch):
        super().__init__()
        self.block = nn.Sequential(
            nn.Conv2d(in_ch, out_ch, kernel_size=3, padding=1, bias=False),
            nn.BatchNorm2d(out_ch),
            nn.ReLU(inplace=True),
            nn.Conv2d(out_ch, out_ch, kernel_size=3, padding=1, bias=False),
            nn.BatchNorm2d(out_ch),
            nn.ReLU(inplace=True),
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
        self.up3 = UpBlock(in_ch=256, skip_ch=128 * 3, out_ch=128)
        self.up2 = UpBlock(in_ch=128, skip_ch=64 * 3, out_ch=64)
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
# 3. INFERENCE PIPELINE
# ============================================================
CLASS_NAMES = ["No damage", "Minor damage", "Major damage", "Destroyed", "Background"]
CLASS_COLORS = {
    0: (0, 255, 0),
    1: (255, 255, 0),
    2: (255, 165, 0),
    3: (255, 0, 0),
    4: (0, 0, 0),
}
BACKGROUND_CLASS = 4
WEIGHTS_PATH = os.path.join(
    os.path.dirname(os.path.abspath(__file__)), "best_siamese_unet_xbd.pth"
)


def class_mask_to_rgb(class_mask):
    H, W = class_mask.shape
    rgb = np.zeros((H, W, 3), dtype=np.uint8)
    for cls_idx, color in CLASS_COLORS.items():
        rgb[class_mask == cls_idx] = color
    return rgb


@torch.no_grad()
def run_tiled_inference(
    model, pre_img_rgb, post_img_rgb, device, patch_size=256, progress=None
):
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
            pre_tile = pre_pad[y : y + patch_size, x : x + patch_size]
            post_tile = post_pad[y : y + patch_size, x : x + patch_size]

            pre_t = (
                torch.from_numpy(pre_tile)
                .permute(2, 0, 1)
                .float()
                .div(255.0)
                .unsqueeze(0)
                .to(device)
            )
            post_t = (
                torch.from_numpy(post_tile)
                .permute(2, 0, 1)
                .float()
                .div(255.0)
                .unsqueeze(0)
                .to(device)
            )

            logits = model(pre_t, post_t)
            tile_pred = (
                torch.argmax(logits, dim=1).squeeze(0).cpu().numpy().astype(np.uint8)
            )
            pred_full[y : y + patch_size, x : x + patch_size] = tile_pred

            done += 1
            if progress is not None:
                progress.progress(done / total)

    return pred_full[:H, :W]


def overlay_from_mask(pred_mask, post_img_rgb, alpha=0.4):
    color_mask = class_mask_to_rgb(pred_mask)
    overlay = post_img_rgb.copy().astype(np.float32)
    foreground = pred_mask != BACKGROUND_CLASS
    overlay[foreground] = (1 - alpha) * post_img_rgb[foreground].astype(
        np.float32
    ) + alpha * color_mask[foreground].astype(np.float32)
    return overlay.astype(np.uint8)


def load_uploaded_rgb(uploaded_file):
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
    return [
        (CLASS_NAMES[i], int(counts[i]), 100.0 * counts[i] / total) for i in range(5)
    ]


@st.cache_resource
def load_model(weights_path, _mtime, _size):
    model = SiameseUNet(num_classes=5, pretrained_backbone=False)
    checkpoint = torch.load(weights_path, map_location=torch.device("cpu"))

    meta = {}
    if isinstance(checkpoint, dict) and "model_state_dict" in checkpoint:
        state_dict = checkpoint["model_state_dict"]
        meta = {
            "epoch": checkpoint.get("epoch"),
            "macro_f1": checkpoint.get("macro_f1"),
        }
    else:
        state_dict = checkpoint

    state_dict = {
        k.replace("module.", "", 1) if k.startswith("module.") else k: v
        for k, v in state_dict.items()
    }

    model.load_state_dict(state_dict, strict=True)
    model.eval()
    return model, meta


# ============================================================
# 4. STREAMLIT UI (FUTURISTIC & PROFESSIONAL)
# ============================================================
st.set_page_config(
    page_title="AegisAI | Satellite Disaster Intelligence",
    page_icon="🛰️",
    layout="wide",
    initial_sidebar_state="expanded",
)

# Custom CSS styling for a dark-mode, command-center aesthetic
st.markdown(
    """
    <style>
    .main {
        background-color: #0e1117;
        font-family: 'Inter', sans-serif;
    }
    .stMetric {
        background-color: #1e222d;
        border-radius: 10px;
        padding: 12px;
        border: 1px solid #2e364f;
    }
    .metric-card {
        background-color: #1a1f2c;
        border: 1px solid #2d3748;
        border-radius: 8px;
        padding: 15px;
        margin-bottom: 10px;
    }
    .status-badge {
        padding: 4px 10px;
        border-radius: 6px;
        font-size: 12px;
        font-weight: bold;
    }
    </style>
""",
    unsafe_allow_html=True,
)

# Header Banner
st.markdown(
    """
<div style="background: linear-gradient(90deg, #1e2640 0%, #0e1117 100%); padding: 20px; border-radius: 12px; border-left: 6px solid #00d2ff; margin-bottom: 25px;">
    <h1 style="color: #ffffff; margin:0; font-size: 28px;">🛰️ AegisAI — Tactical Satellite Disaster Intelligence System v1.0</h1>
    <p style="color: #8a99ad; margin: 5px 0 0 0; font-size: 14px;">Automated Change-Detection Segmentation • AWS S3 & SNS Integration • Groq Vision AI Briefing</p>
</div>
""",
    unsafe_allow_html=True,
)

if not os.path.exists(WEIGHTS_PATH):
    st.error(f"Critical System Failure: Weights file missing at `{WEIGHTS_PATH}`")
    st.stop()

st_info = os.stat(WEIGHTS_PATH)
model, ckpt_meta = load_model(WEIGHTS_PATH, st_info.st_mtime, st_info.st_size)

# Sidebar Control Center
with st.sidebar:
    st.image("https://img.icons8.com/color/96/satellite.png", width=60)
    st.markdown("### Command Center")
    st.markdown("---")

    alpha = st.slider("Overlay Opacity", 0.1, 0.9, 0.4, 0.05)
    sns_alert_enabled = st.checkbox("Enable AWS SNS Escalation Alert", value=True)

    st.markdown("---")
    st.markdown("### Vision AI Key")
    groq_key_input = st.text_input(
        "Groq API Key",
        value=GROQ_API_KEY,
        type="password",
        help="Used for multi-modal scene analysis.",
    )
    if groq_key_input:
        GROQ_API_KEY = groq_key_input

    st.markdown("---")
    st.markdown("### Classification Legend")
    for i, name in enumerate(CLASS_NAMES[:4]):
        r, g, b = CLASS_COLORS[i]
        st.markdown(
            f"<div style='display:flex; align-items:center; margin-bottom: 6px;'>"
            f"<span style='width:14px; height:14px; background:rgb({r},{g},{b}); border-radius:3px; margin-right:10px;'></span>"
            f"<span style='color:#e2e8f0; font-size:13px;'>{name}</span>"
            f"</div>",
            unsafe_allow_html=True,
        )

    st.markdown("---")
    st.markdown("### Infrastructure Telemetry")
    st.caption(f"**Storage Node:** `s3://{S3_BUCKET}`")
    st.caption(f"**SNS Endpoint:** Active (`{S3_REGION}`)")
    st.caption(f"**Backbone Weights:** {st_info.st_size / 1e6:.1f} MB")

# Main Image Upload Section
col1, col2 = st.columns(2)
with col1:
    pre_file = st.file_uploader(
        "Upload PRE-Disaster Imagery", type=["png", "jpg", "jpeg", "tif", "tiff"]
    )
with col2:
    post_file = st.file_uploader(
        "Upload POST-Disaster Imagery", type=["png", "jpg", "jpeg", "tif", "tiff"]
    )

if pre_file and post_file:
    pre_img = load_uploaded_rgb(pre_file)
    post_img = load_uploaded_rgb(post_file)

    if pre_img.shape[:2] != post_img.shape[:2]:
        st.warning(
            "Dimension Mismatch Detected: Auto-resizing pre-disaster tile to align dimensions."
        )
        pre_img = cv2.resize(
            pre_img,
            (post_img.shape[1], post_img.shape[0]),
            interpolation=cv2.INTER_AREA,
        )

    c1, c2 = st.columns(2)
    c1.image(pre_img, caption="Pre-Disaster Reference Tile", use_container_width=True)
    c2.image(post_img, caption="Post-Disaster Impact Tile", use_container_width=True)

    if st.button(
        "⚡ Execute Tactical Damage Assessment",
        type="primary",
        use_container_width=True,
    ):
        start_time = time.time()

        bar = st.progress(0.0, text="Running change-aware tiled inference...")
        pred_mask = run_tiled_inference(
            model, pre_img, post_img, torch.device("cpu"), patch_size=256, progress=bar
        )
        bar.empty()

        exec_time = time.time() - start_time

        overlay = overlay_from_mask(pred_mask, post_img, alpha=alpha)
        mask_rgb = class_mask_to_rgb(pred_mask)

        st.markdown("### 📊 Tactical Assessment Overlays")
        o1, o2 = st.columns(2)
        o1.image(
            overlay, caption="Change Segmentation Overlay", use_container_width=True
        )
        o2.image(
            mask_rgb, caption="Raw Damage Classification Map", use_container_width=True
        )

        # Metric Metrics Dashboard
        dist = class_distribution(pred_mask)
        destroyed_pct = dist[3][2]
        major_pct = dist[2][2]

        m1, m2, m3, m4 = st.columns(4)
        m1.metric("Execution Latency", f"{exec_time:.2f}s")
        m2.metric("Destroyed Buildings", f"{destroyed_pct:.2f}%")
        m3.metric("Major Structural Damage", f"{major_pct:.2f}%")
        m4.metric("Intact Structures", f"{dist[0][2]:.2f}%")

        # Class Table
        st.markdown("### 📈 Pixel Distribution Breakdown")
        st.table(
            {
                "Classification Category": [d[0] for d in dist],
                "Pixel Volume": [f"{d[1]:,}" for d in dist],
                "Coverage Proportion": [f"{d[2]:.2f}%" for d in dist],
            }
        )

        # --- AI RESCUE BRIEFING SECTION ---
        st.markdown("---")
        st.markdown("### 🚨 Emergency Response Briefing (Groq Vision AI)")

        with st.spinner("Generating automated rescue-ops protocol..."):
            briefing = generate_rescue_briefing(
                overlay, pred_mask, CLASS_NAMES, GROQ_API_KEY
            )
            st.info(briefing)

        # --- AWS SNS AUTOMATED EMERGENCY ESCALATION ---
        if sns_alert_enabled and destroyed_pct > 5.0:
            st.markdown("---")
            st.markdown("### 📡 AWS SNS Emergency Escalation Trigger")
            alert_success, msg_id = send_sns_emergency_alert(destroyed_pct, briefing)
            if alert_success:
                st.success(
                    f"🚨 **Critical Alert Broadcast Sent!** AWS SNS published escalation message to field commanders. (Message ID: `{msg_id}`)"
                )
            else:
                st.warning(f"AWS SNS Broadcast Standby: {msg_id}")
