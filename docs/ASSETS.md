# Assets & licences

| Asset | Source | Licence | Notes |
|---|---|---|---|
| Archivo Variable | `@fontsource-variable/archivo` | SIL OFL 1.1 | self-hosted |
| JetBrains Mono Variable | `@fontsource-variable/jetbrains-mono` | SIL OFL 1.1 | self-hosted |
| Instrument Serif | `@fontsource/instrument-serif` | SIL OFL 1.1 | self-hosted |
| React, React DOM | npm | MIT | |
| three.js 0.170 | npm | MIT | lazy chunk |
| Vite, Vitest, TypeScript | npm | MIT / Apache-2.0 | dev only |

No images, textures, models or audio are bundled. Everything visual is procedural (canvas/SVG/CSS). GSAP and Theatre.js are **not** used, so their licences do not apply.

## Replacing placeholders
- **Portrait:** put `public/portrait.jpg` (≈1200×1500, ≤300 kB). It is shown greyscale.
- **Python reference:** not yet supported. Plan: render the reference to an offscreen canvas, sample luminance per cell into a `Float32Array`, and use it as the coverage field in `AsciiOpening.render` instead of the segment chain (`PythonConfig` is the seam).
- **3D characters:** set `avatar.kind: 'glb'` and `avatar.src` in `characters.ts`, add a GLB renderer component, and lazy-load it from `AsciiAvatar`'s call sites. Check licences first: Ready Player Me (terms/attribution), VRoid (per-model licence), Mixamo (Adobe terms), CC0 models from Quaternius/Kenney. Do not adopt anything without recording its licence here.
