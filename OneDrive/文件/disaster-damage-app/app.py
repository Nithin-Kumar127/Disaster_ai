import streamlit as st
import torch
import torch.nn as nn
import torch.nn.functional as F
import torchvision.models as models
import cv2
import numpy as np
from matplotlib.patches import Patch
import matplotlib.pyplot as plt

# ==========================================
# 1. MODEL DEFINITION (Siamese U-Net)
# ==========================================
class DecoderBlock(nn.Module):
    def __init__(self, in_channels, skip_channels, out_channels):
        super().__init__()
        self.up = nn.ConvTranspose2d(in_channels, in_channels // 2, kernel_size=2, stride=2)
        self.conv = nn.Sequential(
            nn.Conv2d(in_channels // 2 + skip_channels, out_channels, kernel_size=3, padding=1),
            nn.BatchNorm2d(out_channels),
            nn.ReLU(inplace=True),
            nn.Conv2d(out_channels, out_channels, kernel_size=3, padding=1),
            nn.BatchNorm2d(out_channels),
            nn.ReLU(inplace=True),
        )

    def forward(self, x, skip):
        x = self.up(x)
        if x.shape != skip.shape:
            x = F.interpolate(x, size=skip.shape[2:], mode="bilinear", align_corners=False)
        x = torch.cat([x, skip], dim=1)
        return self.conv(x)

class SiameseUNet(nn.Module):
    def __init__(self, num_classes=5):
        super().__init__()
        resnet = models.resnet50(weights=None)
        self.initial_conv = nn.Sequential(resnet.conv1, resnet.bn1, resnet.relu)
        self.maxpool = resnet.maxpool
        self.encoder1 = resnet.layer1
        self.encoder2 = resnet.layer2
        self.encoder3 = resnet.layer3
        self.encoder4 = resnet.layer4

        self.bridge = nn.Sequential(
            nn.Conv2d(2048 * 2, 1024, kernel_size=3, padding=1),
            nn.BatchNorm2d(1024),
            nn.ReLU(inplace=True)
        )

        self.decoder4 = DecoderBlock(1024, 1024 * 2, 512)
        self.decoder3 = DecoderBlock(512, 512 * 2, 256)
        self.decoder2 = DecoderBlock(256, 256 * 2, 128)
        self.decoder1 = DecoderBlock(128, 64 * 2, 64)

        self.final_upsample = nn.Sequential(
            nn.ConvTranspose2d(64, 32, kernel_size=2, stride=2),
            nn.BatchNorm2d(32),
            nn.ReLU(inplace=True),
            nn.Conv2d(32, num_classes, kernel_size=1)
        )

    def forward(self, pre, post):
        input_size = pre.shape[2:]
        x1_pre = self.maxpool(self.initial_conv(pre))
        x2_pre = self.encoder1(x1_pre)
        x3_pre = self.encoder2(x2_pre)
        x4_pre = self.encoder3(x3_pre)
        x5_pre = self.encoder4(x4_pre)

        x1_post = self.maxpool(self.initial_conv(post))
        x2_post = self.encoder1(x1_post)
        x3_post = self.encoder2(x2_post)
        x4_post = self.encoder3(x3_post)
        x5_post = self.encoder4(x4_post)

        x = self.bridge(torch.cat([x5_pre, x5_post], dim=1))
        x = self.decoder4(x, torch.cat([x4_pre, x4_post], dim=1))
        x = self.decoder3(x, torch.cat([x3_pre, x3_post], dim=1))
        x = self.decoder2(x, torch.cat([x2_pre, x2_post], dim=1))
        x = self.decoder1(x, torch.cat([x1_pre, x1_post], dim=1))

        out = self.final_upsample(x)
        if out.shape[2:] != input_size:
            out = F.interpolate(out, size=input_size, mode="bilinear", align_corners=False)
        return out

# ==========================================
# 2. STREAMLIT UI & INFERENCE PIPELINE
# ==========================================
st.set_page_config(page_title="AI Disaster Assessment", layout="wide")
st.title("🛰️ AI Satellite Disaster Damage Assessment v1.0")
st.write("Upload pre- and post-disaster satellite imagery to generate automated damage overlays.")

@st.cache_resource
def load_model():
    model = SiameseUNet(num_classes=5)
    model.load_state_dict(torch.load("best_siamese_unet_xbd.pth", map_location=torch.device("cpu")))
    model.eval()
    return model

model = load_model()

col1, col2 = st.columns(2)
with col1:
    pre_file = st.file_uploader("Upload Pre-Disaster Image", type=["png", "jpg", "jpeg"])
with col2:
    post_file = st.file_uploader("Upload Post-Disaster Image", type=["png", "jpg", "jpeg"])

if pre_file and post_file:
    pre_bytes = np.frombuffer(pre_file.read(), np.uint8)
    pre_img = cv2.imdecode(pre_bytes, cv2.IMREAD_COLOR)
    pre_img = cv2.cvtColor(pre_img, cv2.COLOR_BGR2RGB)

    post_bytes = np.frombuffer(post_file.read(), np.uint8)
    post_img = cv2.imdecode(post_bytes, cv2.IMREAD_COLOR)
    post_img = cv2.cvtColor(post_img, cv2.COLOR_BGR2RGB)

    orig_h, orig_w = post_img.shape[:2]

    if st.button("Run Damage Analysis"):
        with st.spinner("Processing satellite imagery..."):
            pre_resized = cv2.resize(pre_img, (256, 256))
            post_resized = cv2.resize(post_img, (256, 256))

            pre_tensor = torch.from_numpy(pre_resized).permute(2, 0, 1).float() / 255.0
            post_tensor = torch.from_numpy(post_resized).permute(2, 0, 1).float() / 255.0

            with torch.no_grad():
                output = model(pre_tensor.unsqueeze(0), post_tensor.unsqueeze(0))
                pred_mask_256 = torch.argmax(output, dim=1).squeeze(0).numpy()

            pred_mask = cv2.resize(pred_mask_256.astype(np.uint8), (orig_w, orig_h), interpolation=cv2.INTER_NEAREST)

            COLOR_PALETTE = np.array([
                [0, 0, 0],       # 0: Background
                [0, 255, 0],     # 1: No Damage
                [255, 255, 0],   # 2: Minor Damage
                [255, 128, 0],   # 3: Major Damage
                [255, 0, 0]      # 4: Destroyed
            ], dtype=np.uint8)

            color_mask = COLOR_PALETTE[pred_mask]
            overlay = post_img.copy()
            building_pixels = (pred_mask > 0)

            if building_pixels.any():
                overlay[building_pixels] = (0.6 * color_mask[building_pixels] + 0.4 * post_img[building_pixels]).astype(np.uint8)

            st.image(overlay, caption="AI Semantic Segmentation Overlay", use_column_width=True)