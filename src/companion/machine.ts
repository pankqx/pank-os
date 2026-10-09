// Character behaviour as a pure state machine. UI and avatar both read this; nothing else decides animation.
export type CharState = 'IDLE' | 'GREETING' | 'LISTENING' | 'THINKING' | 'SPEAKING' | 'REACTING' | 'ERROR'
export type CharEvent =
  | 'GREET'
  | 'FOCUS_INPUT'
  | 'BLUR_INPUT'
  | 'SEND'
  | 'REPLY_READY'
  | 'SPOKEN_DONE'
  | 'REACT'
  | 'FAIL'
  | 'RESET'

export function transition(s: CharState, e: CharEvent): CharState {
  switch (e) {
    case 'GREET': return s === 'IDLE' ? 'GREETING' : s
    case 'FOCUS_INPUT': return s === 'IDLE' ? 'LISTENING' : s
    case 'BLUR_INPUT': return s === 'LISTENING' ? 'IDLE' : s
    case 'SEND': return 'THINKING'
    case 'REPLY_READY': return s === 'THINKING' ? 'SPEAKING' : s
    case 'SPOKEN_DONE': return s === 'GREETING' || s === 'SPEAKING' || s === 'REACTING' ? 'IDLE' : s
    case 'REACT': return s === 'IDLE' || s === 'LISTENING' ? 'REACTING' : s
    case 'FAIL': return 'ERROR'
    case 'RESET': return 'IDLE'
  }
}

/** Rough reading time so SPEAKING lasts as long as the text takes to say. */
export function speakingMs(text: string): number {
  const words = text.trim().split(/\s+/).length
  return Math.min(9000, Math.max(900, words * 260))
}
