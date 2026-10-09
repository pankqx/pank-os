import type { CharacterConfig } from '../content/characters'
import { buildKnowledge, retrieve, type KnowledgeEntry } from './knowledge'

export interface ChatMessage { role: 'user' | 'assistant'; text: string }
export interface ChatContext { character: CharacterConfig; knowledge: KnowledgeEntry[] }
export interface Reply { text: string; link?: string; source: string }

/** Swap implementations without touching any UI. */
export interface ChatProvider {
  id: 'mock' | 'remote'
  label: string
  reply(history: ChatMessage[], ctx: ChatContext, signal?: AbortSignal): Promise<Reply>
}

const pick = <T,>(arr: T[], seed: number) => arr[seed % arr.length]
const hash = (s: string) => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7)

/** Development provider. No model, no network: scripted answers over the knowledge base. */
export const mockProvider: ChatProvider = {
  id: 'mock',
  label: 'built-in script (no AI model connected)',
  async reply(history, { character, knowledge }) {
    await new Promise((r) => setTimeout(r, 450 + Math.random() * 500))
    const q = history[history.length - 1]?.text ?? ''
    const s = character.style
    const seed = hash(q)
    if (/^\s*(hi|hello|hey|namaste|yo)\b/i.test(q)) {
      return { text: `${character.name} here — an AI character. Ask about a project, how this site was built, or how to reach Pankaj.`, source: 'script' }
    }
    if (/\b(i am|i'm|im|my name|i like|i love|i build|i'm building|i work)\b/i.test(q)) {
      const ask = character.id === 'reenu' ? ' What are you working on right now?' : ''
      return { text: `Noted — I'll take your word for it, and I won't store it unless you've switched memory on.${ask}`, source: 'script' }
    }
    const hits = retrieve(q, knowledge, 1)
    if (!hits.length) return { text: s.uncertain + ' Try asking about a project by name, or "how do I contact him?".', source: 'none' }
    const e = hits[0]
    let body = e.text
    if (e.facets) {
      const f = e.facets
      body = /limit|problem|weak|flaw|honest|issue|insecure|security|wrong/i.test(q) ? f.limits
        : /stack|tech|language|framework|made with|built with/i.test(q) ? f.stack
        : /plan|roadmap|next|future/i.test(q) ? f.planned
        : /feature|does|implemented|built|work/i.test(q) ? f.built
        : f.summary + ' Ask about its limits, stack, or what’s built.'
    }
    return { text: `${pick(s.openers, seed)} ${body}`, link: e.link, source: e.id }
  },
}

const ENDPOINT = import.meta.env.VITE_COMPANION_ENDPOINT as string | undefined

/** Optional hosted provider. UNTESTED against a real service — see docs/AI_COMPANION.md. */
export const remoteProvider: ChatProvider = {
  id: 'remote',
  label: 'hosted model',
  async reply(history, ctx, signal) {
    if (!ENDPOINT) throw new Error('no endpoint configured')
    const r = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      signal,
      body: JSON.stringify({ messages: history.slice(-12), character: ctx.character.id, knowledge: ctx.knowledge.map((k) => ({ id: k.id, text: k.text })) }),
    })
    if (!r.ok) throw new Error(`provider ${r.status}`)
    const j = (await r.json()) as { reply?: string }
    if (typeof j.reply !== 'string' || !j.reply) throw new Error('malformed reply')
    return { text: j.reply.slice(0, 2000), source: 'remote' }
  },
}

export async function getReply(history: ChatMessage[], character: CharacterConfig, signal?: AbortSignal): Promise<Reply & { fellBack?: boolean }> {
  const ctx = { character, knowledge: knowledge() }
  if (ENDPOINT) {
    try {
      return await remoteProvider.reply(history, ctx, signal)
    } catch {
      const r = await mockProvider.reply(history, ctx, signal)
      return { ...r, fellBack: true }
    }
  }
  return mockProvider.reply(history, ctx, signal)
}

let kb: KnowledgeEntry[] | null = null
const knowledge = () => (kb ??= buildKnowledge())
export const activeProviderLabel = () => (ENDPOINT ? remoteProvider.label + ' (falls back to script)' : mockProvider.label)
