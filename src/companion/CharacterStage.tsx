import { useEffect, useRef, useState } from 'react'
import { characters } from '../content/characters'
import { InkCharacter } from '../character/InkCharacter'
import type { Conversation } from './useConversation'
import { activeProviderLabel } from './provider'
import { sttSupported, ttsSupported } from './voice'
import { clearMemory } from './memory'

const SUGGEST = ['What has he built?', 'Tell me about EventZee', 'Has he won anything?', 'Is Flow & Magic real?', 'How do I contact him?']

/** Typewriter for the speech bubble (instant with reduced motion). */
function useTyped(text: string) {
  const [n, setN] = useState(0)
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { setN(text.length); return }
    setN(0)
    let i = 0
    const id = window.setInterval(() => { i += 2; setN(i); if (i >= text.length) clearInterval(id) }, 18)
    return () => clearInterval(id)
  }, [text])
  return text.slice(0, n)
}

interface Props {
  conv: Conversation
  mode: 'overlay' | 'inline'
  onClose?: () => void
  onSwitch: () => void
  hideCharacter?: boolean
}

export function CharacterStage({ conv, mode, onClose, onSwitch, hideCharacter }: Props) {
  const { cfg, state, lines } = conv
  const other = characters[cfg.id === 'ash' ? 'rhea' : 'ash']
  const lastBot = [...lines].reverse().find((l) => l.role === 'assistant')
  const typed = useTyped(state === 'THINKING' ? cfg.style.thinking[0] : lastBot?.text ?? cfg.introduction)
  const [showLog, setShowLog] = useState(false)
  const [showMem, setShowMem] = useState(false)
  const input = useRef<HTMLInputElement>(null)
  const log = useRef<HTMLDivElement>(null)
  useEffect(() => { log.current?.scrollTo({ top: log.current.scrollHeight }) }, [lines, showLog])

  return (
    <div className={`stage stage-${mode}`} style={{ ['--accent' as string]: cfg.accent }}>
      <div className="stage-copy">
        <div className="stage-top mono">
          <span className="ai-badge">AI CHARACTER · {state.toLowerCase()}</span>
          <div className="stage-actions">
            <button onClick={onSwitch}>⇄ meet {other.name}</button>
            <button onClick={conv.end}>end chat</button>
            {onClose && <button onClick={onClose} aria-label="Close">✕ close</button>}
          </div>
        </div>
        <h2 className="display stage-name">{cfg.name}</h2>
        <p className="mono dim stage-tag">{cfg.tagline} · {activeProviderLabel()}</p>

        <div className="bubble" aria-live="polite">
          <p className="serif">{typed}<span className="caret-b" aria-hidden="true" /></p>
          {lastBot?.link && state !== 'THINKING' && <a className="mono" href={lastBot.link} onClick={onClose}>→ show me</a>}
        </div>
        {conv.note && <p className="note mono" role="status">{conv.note}</p>}

        <div className="suggest mono">
          {SUGGEST.map((s) => <button key={s} onClick={() => conv.send(s)} disabled={state === 'THINKING'}>{s}</button>)}
        </div>

        <form className="stage-input" onSubmit={(e) => { e.preventDefault(); void conv.send(conv.draft) }}>
          <input ref={input} value={conv.draft} maxLength={500} placeholder={conv.mic ? 'listening…' : `Say something to ${cfg.name}…`} aria-label={`Message ${cfg.name}`}
            onFocus={() => conv.fire('FOCUS_INPUT')} onBlur={() => conv.fire('BLUR_INPUT')} onChange={(e) => conv.setDraft(e.target.value)} />
          {sttSupported() && <button type="button" className={`mono mic ${conv.mic ? 'rec' : ''}`} onClick={conv.toggleMic} aria-pressed={conv.mic}>{conv.mic ? '● stop' : '🎙 talk'}</button>}
          <button type="submit" className="mono send" disabled={!conv.draft.trim() || state === 'THINKING'}>send</button>
        </form>

        <div className="stage-foot mono">
          {ttsSupported() && <label><input type="checkbox" checked={conv.audio} onChange={(e) => conv.setAudio(e.target.checked)} /> voice replies</label>}
          <label><input type="checkbox" checked={conv.memory} onChange={(e) => conv.toggleMemory(e.target.checked)} /> remember on this device</label>
          <button type="button" onClick={() => setShowLog((v) => !v)} aria-expanded={showLog}>transcript ({lines.length})</button>
          <button type="button" onClick={() => setShowMem((v) => !v)} aria-expanded={showMem}>what’s saved?</button>
        </div>
        {showMem && (
          <div className="mem mono">
            <p>{conv.memory ? `${lines.length} message(s) stored in this browser only.` : 'Nothing is stored. Memory is off.'}</p>
            <button type="button" onClick={() => { clearMemory(); conv.setNote('Saved copy deleted.') }}>delete saved chat</button>
          </div>
        )}
        {showLog && (
          <div className="stage-log" ref={log} role="log" aria-label="Transcript">
            {lines.map((l, i) => <p key={i} className={`line ${l.role}`}><span className="mono who">{l.role === 'user' ? 'you' : cfg.name.toLowerCase()}</span>{l.text}</p>)}
          </div>
        )}
      </div>
      {!hideCharacter && (
        <button className="stage-figure" onClick={conv.poke} aria-label={`Poke ${cfg.name} (she or he reacts)`} tabIndex={-1}>
          <InkCharacter config={cfg} state={state} height={mode === 'overlay' ? '94vh' : '88vh'} />
        </button>
      )}
    </div>
  )
}
