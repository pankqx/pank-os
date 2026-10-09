# Design system

**Colour** (`src/styles/global.css`): `--void #08090a` ground · `--bone #ece7da` text · `--acid #c8ff2e` signal/alive · `--signal #ff4b2b` danger/python belly · `--dim #7d807a`, `--faint #3a3d39` structure · `--paper #e9dfc8` (only inside the Paroh artifact). No purple, no gradients except the pointer spotlight and card glows tied to a character accent.

**Type:** Archivo Variable 900, uppercase, tight (-0.03em), line-height .88 for headlines · Instrument Serif for human voice and leads · JetBrains Mono for labels, UI, machine voice. Fonts are self-hosted via Fontsource (OFL).

**Spacing:** `--gutter` clamp(16px, 4vw, 56px); chapters pad 72–160px vertically; 1px `--faint` rules separate chapters.

**Motion language:** things *resolve* (scatter → align, noise → letter, wipe → scene). Durations 0.25–1.1s with `--ease`. Python/ASCII is the only continuous animation; it is skippable and has a still frame. `data-fx='min'` collapses all CSS motion.

**Composition:** Opening = full-bleed canvas. Choice = two tall cards, outlined word fills on hover. World = rail left (bottom bar on phones), generous asymmetry (12-col grid in Chapter I), horizontal strip in II, ledger table in IV, quiet two-column ending.

**Responsive:** ≤960px rail becomes a bottom bar; artifacts become 88vw stacked cards; dossier single column. Companion lifts above the bar.

**Accessibility:** landmarks, skip link, `aria-current`, `aria-live` logs, focus-visible acid outline, keyboard for strip/nav/dossier/companion, no autoplay audio, reduced-motion → still opening + no CSS motion. Contrast: bone/acid on void passes AA; `--dim` is used for secondary text only (verify with a tool before launch).
