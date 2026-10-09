# pank-os — THE HUMAN EXPERIMENT

The interactive portfolio of **K S Pankaj**. It opens with an ASCII "python" that interrupts his name, asks you to meet an AI character (HIM / HER), then unfolds as an editorial photo-essay: the person, a horizontal laboratory of projects, transmissions (writing), an honestly empty trophy room, and a quiet contact ending.

> Status: first meaningful release. See [`TASKS.md`](TASKS.md) for exactly what is done, what is a placeholder, and what is not connected.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # state machine + knowledge retrieval
npm run build      # typecheck + production build → dist/
npm run preview
```

Requires Node 20+. No environment variables are needed; see `.env.example` for the optional ones.

## What is in it

| Piece | Where |
|---|---|
| ASCII opening (canvas, skippable, adaptive) | `src/opening/` |
| Pinned horizontal scenes, ASCII-developing photos, yellow line, marquees, fireworks | `src/fx/` |
| Ink characters | `src/character/` |
| HIM / HER choice + two character configs | `src/choice/`, `src/content/characters.ts` |
| Editorial world (chapters I–V) | `src/world/` |
| Project facts (verified against repos) | `src/content/projects.ts` |
| AI companion (state machine, provider interface, mock, voice, consent-gated memory) | `src/companion/` |
| Optional WebGL room (lazy three.js chunk) | `src/world/TrophyScene.tsx` |

Content is separate from layout: edit `src/content/*` and the site updates.

## Make it yours (needs you)

- `public/portrait.jpg` — your photo for the final chapter (a placeholder shows until it exists).
- `src/content/profile.ts` — verify the LinkedIn handle (résumé prints `pankqz`), location, and anything marked `[VERIFY]`.
- `src/content/posts.ts` — replace the three **SAMPLE** posts with real writing.
- `src/content/achievements.ts` — add verified wins when they exist.
- Reference images for the python: see `docs/ASSETS.md`.

## Deploy

GitHub Pages workflow included (`.github/workflows/pages.yml`); enable **Settings → Pages → Source: GitHub Actions**. Details in [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md).

## Honest limits

No language model, voice service or backend is connected. The companion answers from a built-in script over the site's own content. Accounts and server-side memory are designed but **not implemented**.
