#!/usr/bin/env python3
"""Generate PlaySchool favicon set + social share card (og:image)."""
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os

OUT = "assets"
os.makedirs(OUT, exist_ok=True)

# ---------- locate a bold font ----------
FONT_CANDIDATES = [
    "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
    "/System/Library/Fonts/Helvetica.ttc",
]
import matplotlib
FONT_BOLD = None
for c in FONT_CANDIDATES:
    if os.path.exists(c):
        FONT_BOLD = c
        break
if FONT_BOLD is None:
    import matplotlib.font_manager as fm
    FONT_BOLD = fm.findfont(fm.FontProperties(weight="bold"))

def vgrad(w, h, top, bottom):
    """vertical gradient image from top rgb to bottom rgb"""
    t = np.linspace(0, 1, h)[:, None, None]
    top = np.array(top, dtype=float)[None, None, :]
    bot = np.array(bottom, dtype=float)[None, None, :]
    arr = top * (1 - t) + bot * t
    return Image.fromarray(np.repeat(arr, w, axis=1).astype(np.uint8), "RGB")

GREEN = (101, 163, 13)
GREEN_DEEP = (77, 124, 15)
AMBER = (245, 158, 11)
TEAL = (13, 148, 136)
LIGHT = (232, 245, 233)
LIGHT2 = (215, 236, 210)

# ---------- favicon: rounded-square green gradient + white play triangle ----------
def make_favicon(size):
    S = size * 4  # supersample
    img = vgrad(S, S, GREEN, GREEN_DEEP).convert("RGBA")
    # rounded mask
    mask = Image.new("L", (S, S), 0)
    d = ImageDraw.Draw(mask)
    d.rounded_rectangle([0, 0, S - 1, S - 1], radius=int(S * 0.22), fill=255)
    img.putalpha(mask)
    d = ImageDraw.Draw(img)
    # play triangle
    cx, cy = S / 2, S / 2
    w, h = S * 0.34, S * 0.40
    d.polygon([(cx - w / 2, cy - h / 2), (cx - w / 2, cy + h / 2), (cx + w / 2, cy)],
              fill=(255, 255, 255, 255))
    img = img.resize((size, size), Image.LANCZOS)
    return img

make_favicon(32).save(f"{OUT}/favicon-32.png")
make_favicon(180).save(f"{OUT}/apple-touch-icon.png")

# ---------- social share card 1200x630 ----------
W, H = 1200, 630
card = vgrad(W, H, (255, 255, 255), LIGHT).convert("RGBA")

# soft accent blobs
blobs = Image.new("RGBA", (W, H), (0, 0, 0, 0))
bd = ImageDraw.Draw(blobs)
bd.ellipse([-180, -220, 420, 300], fill=(*GREEN, 34))
bd.ellipse([820, 300, 1420, 830], fill=(*AMBER, 30))
bd.ellipse([880, -160, 1340, 260], fill=(*TEAL, 26))
blobs = blobs.filter(ImageFilter.GaussianBlur(60))
card = Image.alpha_composite(card, blobs)

d = ImageDraw.Draw(card)

# brand mark: rounded green square + white play
mark = make_favicon(120)
card.alpha_composite(mark, (90, 96))

f_brand = ImageFont.truetype(FONT_BOLD, 92)
f_tag = ImageFont.truetype(FONT_BOLD, 40)
f_sub = ImageFont.truetype(FONT_BOLD, 30)

d.text((240, 108), "PlaySchool", font=f_brand, fill=(34, 51, 42, 255))

# tagline
d.text((94, 280), "Learn Python · GenAI · Agentic AI", font=f_tag, fill=(77, 124, 15, 255))
d.text((94, 350), "in 60-second animated reels you watch, not read.", font=f_sub, fill=(106, 125, 108, 255))

# emoji chips (drawn as rounded rects with emoji glyph)
f_emoji = ImageFont.truetype("/System/Library/Fonts/Apple Color Emoji.ttc", 64)
chips = [("🐍", "Python", AMBER), ("🧠", "GenAI", GREEN), ("🤖", "Agentic", TEAL)]
x = 94
for e, label, col in chips:
    tw = d.textlength(label, font=f_sub)
    cw = int(96 + tw + 40)
    d.rounded_rectangle([x, 440, x + cw, 530], radius=45, fill=(255, 255, 255, 235),
                        outline=(*col, 200), width=3)
    d.text((x + 26, 452), e, font=f_emoji, embedded_color=True)
    d.text((x + 104, 470), label, font=f_sub, fill=(34, 51, 42, 255))
    x += cw + 26

# footer url
f_url = ImageFont.truetype(FONT_BOLD, 24)
url = "realsharadyadav.github.io/playschool"
d.text((94, 570), url, font=f_url, fill=(154, 171, 156, 255))

card.convert("RGB").save(f"{OUT}/og-card.png", quality=92)
print("done:", os.listdir(OUT))
