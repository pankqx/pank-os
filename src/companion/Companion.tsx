import { useCallback, useEffect, useRef, useState } from 'react'
import { characters, type CharacterId } from '../content/characters'
import { AsciiAvatar } from './AsciiAvatar'
import { transition, speakingMs, type CharEvent, type CharState } from './machine'
import { getReply, activeProviderLabel, type ChatMessage } from './provider'
import { clearMemory, hasConsent, loadMemory, saveMemory, setConsent } from './memory'
import { listen, speak, sttSupported, stopSpeaking, ttsSupported } from './voice'

interface Props { character: CharacterId; onSwitchCharacter: (c: CharacterId) => void }
interface Line extends ChatMessage { link?: string }

const SUGGEST = ['What has he built?', 'Tell me about EventZee', 'Is Flow & Magic real?', 'How do I contact him?']

export default function Companion({ character, onSwitchCharacter }: Props) {
  const cfg = characters[character]
  const other = characters[character === 'ash' ? 'rhea' : 'ash']
  const [open, setOpen] = useState(false)
  const [state, setState] = useState<CharState>('IDLE')
  const [lines, setLines] = useState<Line[]>([])
  const [text, setText] = useState('')
  const [audio, setAudio] = useState(false)
  const [mic, setMic] = useState(false)
  const [note, setNote] = useState('')
  const [memory, setMemory] = useState(hasConsent())
  const [showMem, setShowMem] = useState(false)
  const timer = useRef<number>(0)
  const stopMic = useRef<() => void>(() => {})
  const abort = useRef<AbortController | null>(null)
  const log = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const fire = useCallback((e: CharEvent) => setState((s) => transition(s, e)), [])
  const later = (ms: number, fn: () => void) => { clearTimeout(timer.current); timer.current = window.setTimeout(fn, ms) }

  // fresh conversation per character (or restore consented memory)
  useEffect(() => {
    const restored = loadMemory()
    setLines(restored)
    setState('IDLE')
    return () => { stopSpeaking(); stopMic.current(); abort.current?.abort(); clearTimeout(timer.current) }
  }, [character])

  useEffect(() => { log.current?.scrollTo({ top: log.current.scrollHeight }) }, [lines, state])
  useEffect(() => { if (memory) saveMemory(lines) }, [lines, memory])

  const greet = useCallback(() => {
    if (lines.length) return
    setLines([{ role: 'assistant', text: cfg.greeting }])
    fire('GREET')
    if (audio) speak(cfg.greeting, cfg, () => fire('SPOKEN_DONE'))
    else later(speakingMs(cfg.greeting), () => fire('SPOKEN_DONE'))
  }, [lines.length, cfg, audio, fire])

  const toggle = () => {
    const next = !open
    setOpen(next)
    if (next) { greet(); setTimeout(() => inputRef.current?.focus(), 50) }
    else { stopSpeaking(); stopMic.current(); setMic(false); fire('RESET') }
  }

  const send = async (raw: string) => {
    const q = raw.trim().slice(0, 500)
    if (!q || state === 'THINKING') return
    setText(''); setNote('')
    const history: Line[] = [...lines, { role: 'user', text: q }]
    setLines(history)
    fire('SEND')
    abort.current?.abort()
    abort.current = new AbortController()
    const to = window.setTimeout(() => abort.current?.abort(), 15000)
    try {
      const r = await getReply(history, cfg, abort.current.signal)
      clearTimeout(to)
      setLines([...history, { role: 'assistant', text: r.text, link: r.link }])
      if (r.fellBack) setNote('The hosted model was unreachable, so the built-in script answered.')
      fire('REPLY_READY')
      if (audio) speak(r.text, cfg, () => fire('SPOKEN_DONE'))
      else later(speakingMs(r.text), () => fire('SPOKEN_DONE'))
    } catch {
      clearTimeout(to)
      fire('FAIL')
      setNote('I lost the thread (network or timeout). Your message is still above — try sending it again.')
      later(2500, () => fire('RESET'))
    }
  }

  const toggleMic = () => {
    if (mic) { stopMic.current(); setMic(false); fire('BLUR_INPUT'); return }
    setNote('Listening… press the mic again to stop. Chrome-based browsers send speech to their own recognition service.')
    setMic(true); fire('FOCUS_INPUT')
    stopMic.current = listen(
      (t, final) => { setText(t); if (final) { setMic(false); void send(t) } },
      () => { setMic(false); fire('BLUR_INPUT') },
      (m) => { setNote(m); setMic(false); fire('BLUR_INPUT') },
    )
  }

  const end = () => {
    stopSpeaking(); stopMic.current(); setMic(false)
    abort.current?.abort()
    clearMemory()
    setLines([{ role: 'assistant', text: cfg.style.farewell }])
    fire('RESET')
    setNote('Conversation ended and any saved copy deleted.')
  }

  const toggleMemory = (on: boolean) => { setMemory(on); setConsent(on); if (on) saveMemory(lines) }
  const aria = state === 'THINKING' ? cfg.style.thinking[0] : ''

  return (
    <div className="companion" data-open={open} style={{ ['--accent' as string]: cfg.accent }}>
      {!open && (
        <button className="comp-fab mono" onClick={toggle} aria-label={`Talk to ${cfg.name}, an AI character`}>
          <AsciiAvatar config={cfg} state="IDLE" size={72} />
          <span>talk to {cfg.name}<small>AI character</small></span>
        </button>
      )}
      {open && (
        <section className="comp-panel" role="dialog" aria-label={`Conversation with ${cfg.name}, an AI character`}>
          <header className="comp-head">
            <AsciiAvatar config={cfg} state={state} size={150} />
            <div className="comp-id">
              <h2 className="display">{cfg.name}</h2>
              <p className="mono ai-badge">AI CHARACTER · {state.toLowerCase()}</p>
              <p className="mono dim sm">{activeProviderLabel()}</p>
            </div>
            <div className="comp-actions mono">
              <button onClick={() => { end(); onSwitchCharacter(other.id) }} title={`Switch to ${other.name}`}>⇄ {other.name}</button>
              <button onClick={end}>end chat</button>
              <button onClick={toggle} aria-label="Close companion">✕</button>
            </div>
          </header>

          <div className="comp-log" ref={log} role="log" aria-live="polite" aria-label="Conversation">
            {lines.map((l, i) => (
              <p key={i} className={`line ${l.role}`}>
                <span className="mono who">{l.role === 'user' ? 'you' : cfg.name.toLowerCase()}</span>
                {l.text}
                {l.link && <a className="mono" href={l.link}> → show me</a>}
              </p>
            ))}
            {state === 'THINKING' && <p className="line assistant dim mono">{aria}</p>}
            {note && <p className="note mono" role="status">{note}</p>}
          </div>

          {lines.length <= 1 && (
            <div className="suggest mono">
              {SUGGEST.map((s) => <button key={s} onClick={() => send(s)}>{s}</button>)}
            </div>
          )}

          <form className="comp-input" onSubmit={(e) => { e.preventDefault(); void send(text) }}>
            <input ref={inputRef} value={text} maxLength={500} placeholder={mic ? 'listening…' : `Ask ${cfg.name} something`} aria-label={`Message ${cfg.name}`}
              onFocus={() => fire('FOCUS_INPUT')} onBlur={() => fire('BLUR_INPUT')} onChange={(e) => setText(e.target.value)} />
            {sttSupported() && <button type="button" className={`mic mono ${mic ? 'rec' : ''}`} onClick={toggleMic} aria-pressed={mic} aria-label={mic ? 'Stop listening' : 'Start voice input'}>{mic ? '● stop' : 'mic'}</button>}
            <button type="submit" className="mono send" disabled={!text.trim() || state === 'THINKING'}>send</button>
          </form>

          <footer className="comp-foot mono">
            {ttsSupported() && (
              <label><input type="checkbox" checked={audio} onChange={(e) => { setAudio(e.target.checked); if (!e.target.checked) stopSpeaking() }} /> voice replies</label>
            )}
            <label><input type="checkbox" checked={memory} onChange={(e) => toggleMemory(e.target.checked)} /> remember this chat on this device</label>
            <button type="button" onClick={() => setShowMem((v) => !v)} aria-expanded={showMem}>what’s saved?</button>
            {showMem && (
              <div className="mem">
                <p>{memory ? `${lines.length} message(s) stored in this browser only.` : 'Nothing is stored. Memory is off.'}</p>
                <button type="button" onClick={() => { clearMemory(); setNote('Saved copy deleted.') }}>delete saved chat</button>
              </div>
            )}
          </footer>
        </section>
      )}
    </div>
  )
}
