import numpy as np, cv2, sys
from PIL import Image, ImageOps
from rembg import remove, new_session
sess = new_session('u2net_human_seg')
im = ImageOps.exif_transpose(Image.open(sys.argv[1])).convert('RGB')
im.thumbnail((900, 900))
mask = np.asarray(remove(im, session=sess, only_mask=True)) > 120
g = cv2.cvtColor(np.asarray(im), cv2.COLOR_RGB2GRAY)
g = cv2.bilateralFilter(g, 9, 60, 9)
g = cv2.createCLAHE(2.0, (8, 8)).apply(g)
e = cv2.Canny(g, 40, 110)
e[~cv2.dilate(mask.astype(np.uint8), np.ones((5, 5), np.uint8)).astype(bool)] = 0
# outline of the silhouette
sil, _ = cv2.findContours(mask.astype(np.uint8), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
cs, _ = cv2.findContours(e, cv2.RETR_LIST, cv2.CHAIN_APPROX_NONE)
H, W = g.shape
paths = []
def add(c, eps, minlen):
    if cv2.arcLength(c, False) < minlen: return
    a = cv2.approxPolyDP(c, eps, False)
    if len(a) < 2: return
    d = 'M' + ' L'.join(f'{p[0][0]} {p[0][1]}' for p in a)
    paths.append(d)
for c in sil: add(c, 1.2, 80)
for c in sorted(cs, key=lambda c: -cv2.arcLength(c, False)): add(c, 0.9, 26)
paths = paths[:900]
svg = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}">' + ''.join(f'<path d="{d}"/>' for d in paths) + '</svg>'
open(sys.argv[2], 'w').write(svg)
print(len(paths), W, H, len(svg)//1024, 'kB')
