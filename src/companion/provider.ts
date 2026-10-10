import type { CharacterConfig } from '../content/characters'
import { buildKnowledge, retrieve, type KnowledgeEntry } from './knowledge'

export interface ChatMessage { role: 'user' | 'assistant'; text: string }
export interface ChatContext { character: CharacterConfig; knowledge: KnowledgeEntry[] }
export interface Reply { text: string; link?: string; source: string; bait?: boolean }

/** Swap implementations without touching any UI. */
export interface ChatProvider {
  id: 'mock' | 'remote'
  label: string
  reply(history: ChatMessage[], ctx: ChatContext, signal?: AbortSignal): Promise<Reply>
}

const pick = <T,>(arr: T[], seed: number) => arr[seed % arr.length]

// Personal questions get jokes, not facts. Nothing here claims anything true about his private life.
const FALLBACK = [
  'That’s not in my files yet — Pankaj is still writing his own lore.',
  'Great question. Pankaj will answer it personally, right after he finishes “one more feature”.',
  'I asked him. He said “interesting” and opened VS Code. So… no comment.',
]
const RULES: [RegExp, string[], boolean?][] = [
  [/\b(gf|girl ?friend|crush|wife|marri|single|dating|date|love life|lover|relationship|propos)/i, [
    'Classified. Level-5 clearance. BUT — he said he’ll tell you personally. Drop your Insta or WhatsApp below 👇',
    'Ah, the forbidden question. The python guards that file. Leave your number below and he’ll text you the name himself 😏',
  ], true],
  [/\b(age|how old|birthday|born)\b/i, ['Old enough to have quit trading, young enough to believe he’ll finish everything by Sunday.']],
  [/\b(salary|rich|money|net worth|earn|paid|broke)\b/i, ['His net worth is mostly GitHub commits, one confident chess opening and a lesson from trading that was… expensive. Next question 😅']],
  [/\b(trad|stock|market|crypto|intraday|bsc)\w*/i, ['He made money, then let his feelings place the orders. Now his only position is “long on building things”. Lesson: emotion is the most expensive indicator.']],
  [/\b(handsome|cute|hot|look|tall|height|ugly|smart)\b/i, ['Officially: tall enough to reach the top shelf of Stack Overflow. Unofficially: ask Reenu, she’s biased.']],
  [/\b(where|live|from|city|hometown)\b/i, ['Mangaluru — close to the beach, far from his bugs (most days).']],
  [/\b(food|eat|favou?rite food|ice ?cream|hungry)\b/i, ['Ice cream at midnight, brownies on deadline days. He codes on sugar and optimism.']],
  [/\b(chess|elo|rating)\b/i, ['He sacrifices the queen. On purpose. Mostly. His rating is “emotionally stable”.']],
  [/\b(gym|workout|muscle|fit)\b/i, ['Gym is debugging for muscles. Some days the build fails. He still shows up.']],
  [/\b(hobb|free time|weekend|fun)\w*/i, ['Short-film scripts at 2 AM, blogging, chess, cricket, gym, hackathons, travelling and coding. Sleep is listed as “planned”.']],
  [/\b(who are you|are you (real|human|ai)|bot)\b/i, ['I’m an AI sidekick living in this site. Not a person, not his girlfriend, definitely not his manager.']],
  [/\b(hire|job|intern|work with|collab)\w*/i, ['Yes please — he’s open to internships and collaborations and he’s a team player. Email pankqx@gmail.com before he gets distracted by another side project.']],
]
function funny(q: string, _id: string, seed: number): Reply | null {
  for (const [re, lines, bait] of RULES) if (re.test(q)) return { text: lines[seed % lines.length], source: 'joke', bait: !!bait }
  return null
}
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
    const fun = funny(q, character.id, seed)
    if (fun) return fun
    if (/\b(i am|i'm|im|my name|i like|i love|i build|i'm building|i work)\b/i.test(q)) {
      const ask = character.id === 'reenu' ? ' What are you working on right now?' : ''
      return { text: `Noted — I'll take your word for it, and I won't store it unless you've switched memory on.${ask}`, source: 'script' }
    }
    const hits = retrieve(q, knowledge, 1)
    if (!hits.length) return { text: pick(FALLBACK, seed) + ' (Or ask about a project — there I’m actually useful.)', source: 'none' }
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
