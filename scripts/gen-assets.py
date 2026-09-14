"""生成 SEO 用的社交分享图与标准尺寸 App 图标。"""
from pathlib import Path
from PIL import Image

ROOT = Path(r"D:\origin\xianyu_fengmian")
PUBLIC = ROOT / "public"

report = []


def crop_to_ratio(img: Image.Image, ratio: float) -> Image.Image:
    """按目标宽高比居中裁剪。"""
    w, h = img.size
    if w / h > ratio:
        new_w = int(round(h * ratio))
        left = (w - new_w) // 2
        return img.crop((left, 0, left + new_w, h))
    new_h = int(round(w / ratio))
    top = (h - new_h) // 2
    return img.crop((0, top, w, top + new_h))


def pad_to_square(img: Image.Image) -> Image.Image:
    """居中补透明边到正方形。"""
    w, h = img.size
    side = max(w, h)
    canvas = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    canvas.paste(img, ((side - w) // 2, (side - h) // 2), img if img.mode == "RGBA" else None)
    return canvas


# ---------- 1. OG Image 1200x630 ----------
src = ROOT / "docs" / "screenshot-editorial.png"
shot = Image.open(src).convert("RGB")
og = crop_to_ratio(shot, 1200 / 630).resize((1200, 630), Image.LANCZOS)
og_path = PUBLIC / "og-cover.png"
og.save(og_path, "PNG", optimize=True)
report.append(f"og-cover.png      {og.size[0]}x{og.size[1]}  {og_path.stat().st_size} bytes")

# ---------- 2. App 图标（正方形，透明底） ----------
logo = Image.open(PUBLIC / "logo.png").convert("RGBA")
square = pad_to_square(logo)

for size, name in ((512, "icon-512.png"), (192, "icon-192.png"), (180, "apple-touch-icon.png")):
    icon = square.resize((size, size), Image.LANCZOS)
    out = PUBLIC / name
    icon.save(out, "PNG", optimize=True)
    report.append(f"{name:<18}{size}x{size}  {out.stat().st_size} bytes")

print("\n".join(report))
print("logo.png alpha present:", logo.mode)
