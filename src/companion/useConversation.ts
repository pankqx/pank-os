import { useCallback, useEffect, useRef, useState } from 'react'
import { characters, type CharacterId } from '../content/characters'
import { transition, speakingMs, type CharEvent, type CharState } from './machine'
import { getReply, type ChatMessage } from './provider'
import { clearMemory, hasConsent, loadMemory, saveMemory, setConsent } from './memory'
import { listen, speak, stopSpeaking } from './voice'

export interface Line extends ChatMessage { link?: string; bait?: boolean }

/** All conversation logic in one place, shared by the overlay and the finale stage. */
export function useConversation(character: CharacterId) {
  const cfg = characters[character]
  const [state, setState] = useState<CharState>('IDLE')
  const [lines, setLines] = useState<Line[]>([])
  const [audio, setAudioState] = useState(false)
  const [mic, setMic] = useState(false)
  const [note, setNote] = useState('')
  const [memory, setMemory] = useState(hasConsent())
  const [draft, setDraft] = useState('')
  const timer = useRef(0)
  const stopMic = useRef<() => void>(() => {})
  const abort = useRef<AbortController | null>(null)
  const linesRef = useRef<Line[]>([])
  linesRef.current = lines
  const audioRef = useRef(audio)
  audioRef.current = audio

  const fire = useCallback((e: CharEvent) => setState((s) => transition(s, e)), [])
  const later = (ms: number, fn: () => void) => { clearTimeout(timer.current); timer.current = window.setTimeout(fn, ms) }
  const say = useCallback((text: string) => {
    if (audioRef.current) speak(text, cfg, () => fire('SPOKEN_DONE'))
    else later(speakingMs(text), () => fire('SPOKEN_DONE'))
  }, [cfg, fire])

  useEffect(() => {
    setLines(loadMemory())
    setState('IDLE')
    setNote('')
    return () => { stopSpeaking(); stopMic.current(); abort.current?.abort(); clearTimeout(timer.current) }
  }, [character])
  useEffect(() => { if (memory) saveMemory(lines) }, [lines, memory])

  const greet = useCallback(() => {
    if (linesRef.current.length) return
    setLines([{ role: 'assistant', text: cfg.greeting }])
    fire('GREET')
    say(cfg.greeting)
  }, [cfg, fire, say])

  const send = useCallback(async (raw: string) => {
    const q = raw.trim().slice(0, 500)
    if (!q) return
    setDraft(''); setNote('')
    const history: Line[] = [...linesRef.current, { role: 'user', text: q }]
    setLines(history)
    fire('SEND')
    abort.current?.abort()
    const ac = new AbortController()
    abort.current = ac
    const to = window.setTimeout(() => ac.abort(), 15000)
    try {
      const r = await getReply(history, cfg, ac.signal)
      clearTimeout(to)
      setLines([...history, { role: 'assistant', text: r.text, link: r.link, bait: r.bait }])
      if (r.fellBack) setNote('The hosted model was unreachable, so the built-in script answered.')
      fire('REPLY_READY')
      say(r.text)
    } catch {
      clearTimeout(to)
      fire('FAIL')
      setNote('I lost the thread (network or timeout). Try sending it again.')
      later(2500, () => fire('RESET'))
    }
  }, [cfg, fire, say])

  const toggleMic = useCallback(() => {
    if (mic) { stopMic.current(); setMic(false); fire('BLUR_INPUT'); return }
    setNote('Listening… tap the mic again to stop. Chrome-based browsers send speech to their own recognition service.')
    setMic(true); fire('FOCUS_INPUT')
    stopMic.current = listen(
      (t, final) => { setDraft(t); if (final) { setMic(false); void send(t) } },
      () => { setMic(false); fire('BLUR_INPUT') },
      (m) => { setNote(m); setMic(false); fire('BLUR_INPUT') },
    )
  }, [mic, fire, send])

  const end = useCallback(() => {
    stopSpeaking(); stopMic.current(); setMic(false); abort.current?.abort()
    clearMemory()
    setLines([{ role: 'assistant', text: cfg.style.farewell }])
    fire('RESET')
    setNote('Conversation ended and any saved copy deleted.')
  }, [cfg, fire])

  const setAudio = useCallback((on: boolean) => { setAudioState(on); if (!on) stopSpeaking() }, [])
  const toggleMemory = useCallback((on: boolean) => { setMemory(on); setConsent(on); if (on) saveMemory(linesRef.current) }, [])
  const poke = useCallback(() => { fire('REACT'); later(900, () => fire('SPOKEN_DONE')) }, [fire])

  return { cfg, state, lines, draft, setDraft, send, greet, end, fire, poke, audio, setAudio, mic, toggleMic, note, setNote, memory, toggleMemory }
}
export type Conversation = ReturnType<typeof useConversation>
