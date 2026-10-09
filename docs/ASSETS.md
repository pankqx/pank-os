# Assets & licences

| Asset | Source | Licence | Notes |
|---|---|---|---|
| Archivo Variable | `@fontsource-variable/archivo` | SIL OFL 1.1 | self-hosted |
| JetBrains Mono Variable | `@fontsource-variable/jetbrains-mono` | SIL OFL 1.1 | self-hosted |
| Instrument Serif | `@fontsource/instrument-serif` | SIL OFL 1.1 | self-hosted |
| React, React DOM | npm | MIT | |
| three.js 0.170 | npm | MIT | lazy chunk |
| Vite, Vitest, TypeScript | npm | MIT / Apache-2.0 | dev only |

| Photos in `public/photos/` | supplied by K S Pankaj, converted with `scripts/ink.py` | his own | suit/ID-lanyard photo excluded at his request |
| Ink characters (Ash, Rhea) | drawn in code, `src/character/InkCharacter.tsx` | project code (MIT) | original designs |

No textures, 3D models or audio are bundled. The "hooded girl" desktop wallpaper he shared shows a real person, so it was used only as a mood reference (hood, warm rim light, close framing) — never traced.

### Regenerating photo art
`pip install rembg onnxruntime opencv-python-headless pillow numpy`, then `python3 scripts/ink.py photo.jpg name 1400`, and copy `name.webp` + `name-cut.webp` into `public/photos/` and `src/content/photos.ts`.

### Swapping in generated portraits later
Generate per character: neutral, eyes closed, mouth open (same seed/reference). Add a frames renderer next to `InkCharacter` and switch on `avatar.kind`. The state machine already drives blink/speak timing. GSAP and Theatre.js are **not** used, so their licences do not apply.

## Replacing placeholders
- **Portrait:** put `public/portrait.jpg` (≈1200×1500, ≤300 kB). It is shown greyscale.
- **Python reference:** not yet supported. Plan: render the reference to an offscreen canvas, sample luminance per cell into a `Float32Array`, and use it as the coverage field in `AsciiOpening.render` instead of the segment chain (`PythonConfig` is the seam).
- **3D characters:** set `avatar.kind: 'glb'` and `avatar.src` in `characters.ts`, add a GLB renderer component, and lazy-load it from `AsciiAvatar`'s call sites. Check licences first: Ready Player Me (terms/attribution), VRoid (per-model licence), Mixamo (Adobe terms), CC0 models from Quaternius/Kenney. Do not adopt anything without recording its licence here.
