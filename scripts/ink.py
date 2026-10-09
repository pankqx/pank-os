# Photo → ink art converter used for public/photos (needs: pip install rembg onnxruntime opencv-python-headless pillow numpy)
# usage: python3 scripts/ink.py <photo> <out-name> <max-px>
import sys, numpy as np, cv2
from PIL import Image, ImageOps, ImageFilter
from rembg import remove, new_session
sess = new_session('u2net_human_seg')
src, name, maxw = sys.argv[1], sys.argv[2], int(sys.argv[3])
im = ImageOps.exif_transpose(Image.open(src)).convert('RGB')
im.thumbnail((maxw, maxw), Image.LANCZOS)
mask = remove(im, session=sess, only_mask=True)
m = cv2.GaussianBlur(np.asarray(mask).astype(np.float32)/255, (0, 0), 1.2)
g = cv2.cvtColor(np.asarray(im), cv2.COLOR_RGB2GRAY)
H, W = g.shape
yy, xx = np.mgrid[0:H, 0:W]
# --- subject: local contrast + lifted midtones, fine hatching + pen lines
cl = cv2.createCLAHE(clipLimit=2.6, tileGridSize=(8, 8)).apply(g)
s = cv2.bilateralFilter(cl, 7, 40, 7).astype(np.float32) / 255
s = np.power(s, 0.75)
def hatch(a, levels):
    out = np.ones_like(a)
    for thr, per, sg, wd in levels:
        out[(a < thr) & ((((xx*sg + yy) % per) / per) < wd)] = 0
    return out
fgt = hatch(s, [(0.70, 5, 1, .28), (0.50, 5, -1, .3), (0.32, 4, 1, .45), (0.17, 4, -1, .6), (0.08, 3, 1, .8)])
e1 = cv2.GaussianBlur(cl, (0, 0), 1.0).astype(np.float32); e2 = cv2.GaussianBlur(cl, (0, 0), 2.6).astype(np.float32)
pen = np.clip(1 - np.maximum(0, (e2 - e1) - 3) / 10, 0, 1)
fg = np.minimum(fgt, pen)
# --- background: simple pen sketch, no blobs
bgs = cv2.bilateralFilter(g, 9, 60, 9)
bgs = cv2.GaussianBlur(bgs, (0, 0), 2.2)
edges = cv2.Canny(bgs, 30, 80)
edges = cv2.dilate(edges, np.ones((1, 1), np.uint8))
b = bgs.astype(np.float32)/255
bgt = hatch(b, [(0.30, 9, 1, .22), (0.15, 8, -1, .3)])
bg = np.minimum(bgt, 1 - edges.astype(np.float32)/255 * 0.85)
bg = 1 - (1 - bg) * 0.42
res = fg * m + bg * (1 - m)
rng = np.random.default_rng(3)
paper = 0.955 + rng.normal(0, .012, res.shape)
res = np.clip(res * paper + 0.02, 0, 1)
Image.fromarray((res*255).astype(np.uint8)).save(f'{name}.webp', quality=78, method=6)
fgo = Image.fromarray((np.clip(fg*0.95+0.02, 0, 1)*255).astype(np.uint8)).convert('LA')
fgo.putalpha(mask)
fgo.save(f'{name}-cut.webp', quality=78, method=6)
print(name, W, H)
