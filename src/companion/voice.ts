import type { CharacterConfig } from '../content/characters'

// Browser-native speech only: no audio leaves the device through this code except what the
// browser's own SpeechRecognition service does (Chrome sends audio to Google). Both are opt-in per click.
type SR = { lang: string; interimResults: boolean; continuous: boolean; start(): void; stop(): void; abort(): void; onresult: ((e: any) => void) | null; onend: (() => void) | null; onerror: ((e: any) => void) | null }

const Ctor = (): (new () => SR) | null => {
  const w = window as unknown as { SpeechRecognition?: new () => SR; webkitSpeechRecognition?: new () => SR }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}
export const sttSupported = () => typeof window !== 'undefined' && !!Ctor()
export const ttsSupported = () => typeof window !== 'undefined' && 'speechSynthesis' in window

export function listen(onText: (t: string, final: boolean) => void, onEnd: () => void, onError: (m: string) => void) {
  const C = Ctor()
  if (!C) { onError('Speech input is not supported in this browser.'); return () => {} }
  const r = new C()
  r.lang = 'en-IN'
  r.interimResults = true
  r.continuous = false
  r.onresult = (e) => {
    const res = e.results[e.results.length - 1]
    onText(res[0].transcript, res.isFinal)
  }
  r.onerror = (e) => onError(e.error === 'not-allowed' ? 'Microphone permission was denied.' : `Speech input error: ${e.error}`)
  r.onend = onEnd
  try { r.start() } catch { onError('Could not start the microphone.') }
  return () => { try { r.abort() } catch { /* already stopped */ } }
}

export function speak(text: string, cfg: CharacterConfig, onDone: () => void) {
  if (!ttsSupported()) return onDone()
  const u = new SpeechSynthesisUtterance(text)
  u.lang = cfg.voice.lang
  u.pitch = cfg.voice.pitch
  u.rate = cfg.voice.rate
  const voices = speechSynthesis.getVoices()
  const v = cfg.voice.preferNames.map((n) => voices.find((x) => x.name.includes(n))).find(Boolean) ?? voices.find((x) => x.lang === cfg.voice.lang)
  if (v) u.voice = v
  u.onend = onDone
  u.onerror = onDone
  speechSynthesis.cancel()
  speechSynthesis.speak(u)
}
export const stopSpeaking = () => { if (ttsSupported()) speechSynthesis.cancel() }
