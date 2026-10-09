# Architecture

```
main.tsx → FxProvider → App (stage machine)
  Opening (canvas engine) → Choice → World (lazy)
                                       ├ Nav · Prologue · Lab · Transmissions · Trophy(+TrophyScene lazy) · Contact
                                       ├ ProjectPage (hash dossier)
                                       └ Companion (lazy)
```

**Rendering strategy:** Opening is a single 2D canvas (never per-character DOM), time-driven, capped DPR, cell size adapts; sustained >34ms frames call `useFx().downgrade()`. Avatars are small canvases that pause off-screen. Three.js is a separate lazy chunk (~120 kB gz) loaded only when `level==='full'` and WebGL exists, after the visitor reaches the Trophy Room.

**FX levels:** `full | lite | min`, from reduced-motion, device memory/cores, save-data and coarse small screens; user override persisted in `localStorage` (guarded).

**Routing:** hash only — `#person|lab|transmissions|trophy|contact`, `#lab/<slug>`. A hash on first load skips the intro.

**Character state machine:** `companion/machine.ts` — `IDLE, GREETING, LISTENING, THINKING, SPEAKING, REACTING, ERROR` with events `GREET, FOCUS_INPUT, BLUR_INPUT, SEND, REPLY_READY, SPOKEN_DONE, REACT, FAIL, RESET`. The avatar and panel only read state.

**Data model:** `Project`, `Post`, `Milestone`, `LinkItem` in `content/types.ts`. Companion `KnowledgeEntry` is *derived* from the same content (`companion/knowledge.ts`), so it cannot drift.

**Backend interfaces (not implemented):** `ChatProvider` (mock/remote), `memory.ts` (local; swap for Supabase), newsletter endpoint. Draft schema: `supabase/schema.sql`.

**Security boundaries:** browser holds only public config. Remote provider sends the last 12 messages + knowledge snippets, never identifiers. Server (when built) must validate input, rate-limit, enforce RLS (`user_id = auth.uid()`), and keep provider keys in server env.
