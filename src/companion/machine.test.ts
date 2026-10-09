import { describe, expect, it } from 'vitest'
import { transition, speakingMs } from './machine'

describe('character state machine', () => {
  it('greets only from idle', () => {
    expect(transition('IDLE', 'GREET')).toBe('GREETING')
    expect(transition('THINKING', 'GREET')).toBe('THINKING')
  })
  it('send → thinking → speaking → idle', () => {
    let s = transition('LISTENING', 'SEND')
    expect(s).toBe('THINKING')
    s = transition(s, 'REPLY_READY')
    expect(s).toBe('SPEAKING')
    expect(transition(s, 'SPOKEN_DONE')).toBe('IDLE')
  })
  it('reply is ignored unless thinking', () => {
    expect(transition('IDLE', 'REPLY_READY')).toBe('IDLE')
  })
  it('errors recover with reset', () => {
    expect(transition('THINKING', 'FAIL')).toBe('ERROR')
    expect(transition('ERROR', 'RESET')).toBe('IDLE')
  })
  it('speaking time is bounded', () => {
    expect(speakingMs('hi')).toBeGreaterThanOrEqual(900)
    expect(speakingMs('word '.repeat(500))).toBe(9000)
  })
})
