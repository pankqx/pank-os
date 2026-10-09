# TASKS

Legend: ✅ done and checked · 🟡 done, partly verified · ⬜ not started · ⛔ needs you / external

## Done
- ✅ Audit (repo was empty; READMEs of all pankqx repos read on 2026-10-09)
- ✅ ASCII opening: canvas, python, name assembly/interruption/stabilisation, skip (button, Enter, Space, Esc), pointer disturbance, adaptive downgrade, still frame for reduced motion
- ✅ HIM/HER selection with wipe transition; two configs (`characters.ts`); AI labelling
- ✅ Chapters I–V, hash deep links (`#lab/eventzee`), keys 1–5, dossier pages
- ✅ Horizontal lab strip: native scroll (touch, trackpad, shift+wheel), arrow keys, buttons, no scroll hijacking
- ✅ Six bespoke project compositions; PEECE seal/verify demo uses real WebCrypto
- ✅ Transmissions (filter, accordion, newsletter form that refuses to pretend)
- ✅ Trophy Room (honest) + evidence ledger
- ✅ Companion: text chat, state machine (tested), mock provider (tested), remote-provider interface, consent-gated local memory with view/delete, speech input/output behind clicks
- ✅ Lazy three.js trophy room with SVG/CSS fallback
- ✅ Production build; unit tests pass

## v2 — story & motion pass (2026-10-09)
- ✅ Your photos (Goa, two kicks, garden, bakery, GitHub avatar) converted to ink art with `scripts/ink.py` (subject cut-out + hatching + pen lines). The suit photo was deliberately **not** used.
- ✅ Chapter I is now a pinned horizontal photo essay: prints develop out of ASCII as they reach the centre; ghost negatives drift behind in parallax; a yellow line draws across the track
- ✅ One yellow line threads down the whole site as you scroll
- ✅ Big hand-drawn ink characters (Ash, Rhea): blink, follow the pointer, talk (mouth sync to replies), react, think. Original designs; the hooded wallpaper was used only for mood
- ✅ Companion is now a full-screen stage (character ~94vh) with speech bubble + typewriter
- ✅ Finale: a pinned horizontal sequence where glyph streams assemble into the full-height character, who then greets you and chats inline
- ✅ Fireworks in the Trophy Room (on arrival, on hovering milestones, and a "Celebrate anyway" button that gets increasingly tired)
- ✅ Humour in Transmissions (reading-time jokes, rejected titles, writer's-block countdown); kinetic marquees and caution tape between chapters; scroll reveals; ring cursor; lab cards tilt
- ⛔ AI-generated portraits were requested but the connected Higgsfield account has 0 credits; the characters accept generated frames later (docs/ASSETS.md)

## Partly verified
- 🟡 Visual QA: headless Chromium at 1440×900, 1200×800 and 390×844; opening, choice, all chapters, dossier, deep link, companion chat, keyboard (Enter/arrows/1–5/strip), reduced motion, WebGL trophy room and its fallback; console clean. Not tested on real phones, Safari or Firefox.
- 🟡 Voice: code written, **not exercised** (headless browser has no mic/speech).
- 🟡 Remote companion provider: written, **never run against a real endpoint**.
- 🟡 Accessibility: semantic landmarks, focus handling, labels, reduced motion; **no screen-reader or axe pass yet**.

## Not done / needs you
- ⛔ Portrait photo → `public/portrait.jpg`
- ⛔ Python reference image → density-map support is designed (`PythonConfig`) but **not implemented**
- ⛔ Real 3D character models (placeholders are ASCII busts) — see `docs/ASSETS.md`
- ⛔ Real posts; verified achievements; confirm LinkedIn handle and location
- ⛔ A language model for the companion (needs a provider + key + a serverless proxy)
- ⬜ Backend: accounts, server-side memory, newsletter provider. Schema drafted in `supabase/schema.sql`, **not applied, not tested**
- ⬜ Opening sound design (deliberately omitted; must start muted if added)
- ⬜ Theatre.js / GSAP not used — native CSS/JS sufficed; revisit only if choreography needs it
- ⬜ Playwright regression tests in CI

## Known limitations
- Opening animation cost grows with viewport area; `lite` mode doubles cell size. Very large 4K windows may still drop frames.
- Companion replies are scripted retrieval, not conversation: it will say "I don't have that on record" often.
- Hash routing is used so GitHub Pages needs no rewrites; deep links to `#lab/slug` skip the intro.
