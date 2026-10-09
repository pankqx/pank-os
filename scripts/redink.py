import sys, numpy as np, cv2
from PIL import Image, ImageOps
from rembg import remove, new_session
sess = new_session('u2net_human_seg')
src, name, maxh = sys.argv[1], sys.argv[2], int(sys.argv[3])
im = ImageOps.exif_transpose(Image.open(src)).convert('RGB')
s = maxh / im.height
im = im.resize((int(im.width*s), int(im.height*s)), Image.LANCZOS)
mask = np.asarray(remove(im, session=sess, only_mask=True))
rgb = np.asarray(im)
bgr = cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR)
st = cv2.stylization(bgr, sigma_s=40, sigma_r=0.35)
g = cv2.cvtColor(st, cv2.COLOR_BGR2GRAY)
g = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8)).apply(g)
g = g.astype(np.float32) / 255
g = np.power(g, 0.68)
# posterize to ink tones
levels = np.array([0.04, 0.22, 0.45, 0.72, 0.97])
idx = np.clip((g * len(levels)).astype(int), 0, len(levels) - 1)
post = levels[idx]
soft = cv2.GaussianBlur(post, (0, 0), 0.8)
tone = soft * 0.65 + g * 0.35
# ink edges
raw = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)
raw = cv2.bilateralFilter(raw, 7, 50, 7)
edges = cv2.adaptiveThreshold(raw, 255, cv2.ADAPTIVE_THRESH_MEAN_C, cv2.THRESH_BINARY, 11, 5).astype(np.float32) / 255
ink = np.clip(tone * (0.15 + 0.85 * edges), 0, 1)
# hatching in deep shadows
H, W = ink.shape
yy, xx = np.mgrid[0:H, 0:W]
hatch = (((xx + yy) % 6) < 2)
ink[(tone < 0.16) & hatch] *= 0.5
# subtle red in the darkest shadows
out = np.dstack([ink, ink, ink])
red = np.array([0.86, 0.08, 0.2])
shadow = np.clip((0.12 - tone) / 0.12, 0, 1)[..., None] * 0.0
out = out * (1 - shadow) + red * shadow * 0.6 + out * shadow * 0.4
# sticker outline
m = (mask > 120).astype(np.uint8)
m = cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
k = max(4, H // 140)
outer = cv2.dilate(m, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * k + 1, 2 * k + 1)))
rgba = np.zeros((H, W, 4), np.float32)
rgba[..., :3] = 1.0
rgba[..., 3] = outer
inner = m.astype(bool)
rgba[inner, :3] = out[inner]
alpha = cv2.GaussianBlur(rgba[..., 3], (0, 0), 0.7)
rgba[..., 3] = alpha
# crop to content
ys, xs = np.where(alpha > 0.05)
pad = 10
y0, y1, x0, x1 = max(0, ys.min() - pad), min(H, ys.max() + pad), max(0, xs.min() - pad), min(W, xs.max() + pad)
rgba = rgba[y0:y1, x0:x1]
Image.fromarray((rgba * 255).astype(np.uint8), 'RGBA').save(f'{name}.webp', quality=82, method=6)
print(name, rgba.shape)
