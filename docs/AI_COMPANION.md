# AI companion

**Characters** (`src/content/characters.ts`): **Ash** (HIM) — dry, precise, cites the repo. **Rhea** (HER) — curious, playful, asks a follow-up. Differences are temperament, not gender stereotypes. Each has its own greeting, openers, uncertainty line, farewell, voice preferences, accent and avatar parameters.

**Conversation architecture:** `Companion.tsx` (UI + state machine) → `getReply()` (`provider.ts`) → provider. `mockProvider` retrieves from `buildKnowledge()` and answers in the character's voice; with `VITE_COMPANION_ENDPOINT` set it tries `remoteProvider` first and falls back to the mock with a visible note. The remote contract is `POST {messages, character, knowledge[]} → {reply}` and is **untested**.

**Knowledge:** derived from `src/content/*` only. If it isn't there the companion says it doesn't know. Unit-tested for Flow & Magic (concept) and for "no awards".

**Voice:** mic button → browser `SpeechRecognition` (Chrome-family sends audio to the browser vendor's service; the UI says so). "voice replies" checkbox (off by default) → `speechSynthesis`. Nothing starts without a click. Not yet exercised on a real device.

**Privacy & memory:** off by default. Checkbox "remember this chat on this device" stores ≤40 messages in `localStorage` after explicit consent; "what's saved?" shows the count; "delete saved chat" and "end chat" erase it. No server storage exists. No sensitive-trait inference. The companion states it is an AI in the greeting, header badge and aria-labels.

**Provider abstraction:** implement `ChatProvider.reply(history, ctx, signal)`; the UI does not change. Production use needs a serverless proxy holding the key, input validation and rate limiting. Do not claim free unrestricted production voice.

**v2 presentation:** `useConversation` holds all chat state and is shared by the full-screen overlay (`Companion.tsx`) and the finale (`world/Finale.tsx`). `CharacterStage` renders the big `InkCharacter`, a speech bubble with a typewriter, suggestions, input, voice and memory controls. Clicking the character pokes it (REACTING).

**v4 (2026-10-10):** personal questions get scripted jokes (`RULES` in `provider.ts`) — they never state facts about his private life. "Wanna know Pankaj's GF?" (chip, chat reply and a one-time pop-up) shows `BaitCard`: it opens WhatsApp with a prefilled message *to* Pankaj (`whatsapp` in `content/profile.ts`). The visitor presses send themselves; the site stores and transmits nothing. Visitor analytics are not implemented (would need a privacy-friendly service such as GoatCounter plus a notice).
