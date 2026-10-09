import type { ChatMessage } from './provider'

// Local-only, consent-gated memory. A server-side version is documented but NOT implemented.
const CONSENT = 'pankos.memory.consent'
const DATA = 'pankos.memory.v1'

export function hasConsent(): boolean {
  try { return localStorage.getItem(CONSENT) === 'yes' } catch { return false }
}
export function setConsent(on: boolean) {
  try {
    if (on) localStorage.setItem(CONSENT, 'yes')
    else { localStorage.removeItem(CONSENT); localStorage.removeItem(DATA) }
  } catch { /* unavailable */ }
}
export function loadMemory(): ChatMessage[] {
  if (!hasConsent()) return []
  try {
    const v = JSON.parse(localStorage.getItem(DATA) ?? '[]')
    return Array.isArray(v) ? v.filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.text === 'string').slice(-40) : []
  } catch { return [] }
}
export function saveMemory(msgs: ChatMessage[]) {
  if (!hasConsent()) return
  try { localStorage.setItem(DATA, JSON.stringify(msgs.slice(-40))) } catch { /* quota or unavailable */ }
}
export function clearMemory() {
  try { localStorage.removeItem(DATA) } catch { /* ignore */ }
}
