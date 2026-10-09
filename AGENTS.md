# AGENTS.md — rules for AI coding agents

## Architecture in one paragraph
Vite + React 19 + TypeScript (strict). `App.tsx` is a three-stage machine: `opening → choice → world`. The world is lazy-loaded. Content lives in `src/content/*` (data only); presentation lives in `src/world/*`, `src/opening/*`, `src/choice/*`; the AI companion lives in `src/companion/*` and talks to the rest of the site only through props, hash links and `FxProvider`.

## Non-negotiables
1. **Never invent facts.** Project claims must come from the repo README/docs or the résumé; update `evidence` in `projects.ts` when you change them. Separate `built` from `planned`. No fabricated awards, posts, testimonials, emails or profiles. Placeholder content must be visibly labelled (e.g. SAMPLE).
2. **The companion is an AI and says so.** Never present it as human. No microphone or audio without a click. Memory is off by default and consent-gated (`companion/memory.ts`).
3. **Progressive enhancement.** Everything must work without WebGL, with reduced motion (`useFx().level === 'min'`) and on touch. New heavy things are `lazy()` and wrapped in `ErrorBoundary`.
4. **No secrets in Git.** Only `VITE_*` public values in the client. Service-role keys never touch browser code.
5. **Commits** use the repository owner's configured git identity as sole author. Do not add `Co-Authored-By` trailers or tool names to commits.

## Design consistency
Read `docs/DESIGN.md` first. One palette (void, bone, acid, signal), three type families, monospace for machine voice, serif for human voice, Archivo Black-weight caps for headlines. No gradient orbs, SaaS cards, purple, glass panels. Every animation needs a narrative reason.

## Testing expectations
- `npm run typecheck && npm test && npm run build` must pass.
- For UI changes, open the real site (Playwright scripts in `scripts/`: `qa.mjs`, `gl.mjs`, `shoot.mjs`) and inspect screenshots at 1440×900 and 390×844; check the console for errors.
- Do not claim something was tested if it was not.
