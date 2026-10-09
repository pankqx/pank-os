import { projects } from '../content/projects'
import { profile, links } from '../content/profile'
import { milestones } from '../content/achievements'

// The companion's ONLY source of facts. Built from the same content files the site renders.
export interface KnowledgeEntry { id: string; title: string; keywords: string[]; text: string; link?: string; facets?: Record<'summary' | 'built' | 'limits' | 'planned' | 'stack', string> }

const STATUS: Record<string, string> = { shipped: 'completed', 'in-progress': 'in progress', experimental: 'experimental', concept: 'a concept only', archived: 'archived' }

export function buildKnowledge(): KnowledgeEntry[] {
  const out: KnowledgeEntry[] = [
    {
      id: 'about',
      title: 'About Pankaj',
      keywords: ['who', 'pankaj', 'about', 'creator', 'person', 'study', 'student', 'education', 'mca', 'intern', 'internship', 'job', 'experience', 'work', 'role'],
      text: `${profile.name} is a ${profile.role.toLowerCase()}. ${profile.study}. ${profile.roles.map((r) => `${r.title} at ${r.org} (${r.when})`).join('; ')}.`,
      link: '#person',
    },
    {
      id: 'community',
      title: 'Community and leadership',
      keywords: ['community', 'discord', 'dat', 'eleven', 'bytes', 'lead', 'leadership', 'host', 'organise', 'organize', 'event'],
      text: profile.community.join('. ') + '.',
    },
    {
      id: 'skills',
      title: 'Skills',
      keywords: ['skills', 'languages', 'stack', 'tech', 'technology', 'know', 'tools'],
      text: `Tools listed on his résumé: ${profile.skills.join(', ')}.`,
    },
    {
      id: 'contact',
      title: 'Contact',
      keywords: ['contact', 'email', 'reach', 'hire', 'linkedin', 'github', 'message', 'talk', 'hello'],
      text: links.map((l) => `${l.label}: ${l.handle}`).join('; ') + '. (The LinkedIn handle is copied from his résumé and still needs checking.)',
      link: '#contact',
    },
    {
      id: 'trophy',
      title: 'Awards and achievements',
      keywords: ['award', 'awards', 'achievement', 'achievements', 'won', 'win', 'prize', 'trophy', 'hackathon', 'certificate'],
      text: `He has no awards on record, and the Trophy Room says so on purpose. What is on record: ${milestones.map((m) => `${m.kind.toLowerCase()} — ${m.title}`).join('; ')}.`,
      link: '#trophy',
    },
    {
      id: 'site',
      title: 'This website',
      keywords: ['site', 'website', 'portfolio', 'python', 'snake', 'ascii', 'built', 'how', 'this', 'why', 'experiment'],
      text: 'This site is "The Human Experiment": an ASCII intro with a python that interrupts his name, two AI characters, and chapters for the person, the lab, writing, the trophy room and contact. The faces are placeholder ASCII avatars until real 3D models are chosen.',
    },
    {
      id: 'me',
      title: 'What the companion is',
      keywords: ['you', 'ai', 'bot', 'human', 'real', 'model', 'llm', 'chatgpt', 'claude', 'remember', 'memory', 'privacy'],
      text: 'I am an AI character, not a person. By default I answer from a built-in script over this site’s content (no language model is connected). I only keep a conversation on your device if you switch memory on, and you can view or delete it.',
    },
  ]
  for (const p of projects) {
    out.push({
      id: p.slug,
      title: p.name,
      keywords: [p.slug, ...p.name.toLowerCase().split(/[^a-z0-9]+/), ...p.stack.map((s) => s.toLowerCase()), p.status],
      text:
        `${p.name} is ${STATUS[p.status]}. ${p.idea} ` +
        (p.built.length ? `Implemented per the repo: ${p.built.slice(0, 4).join('; ')}. ` : 'Nothing is implemented yet. ') +
        (p.tradeoffs.length ? `Honest limits: ${p.tradeoffs[0]} ` : '') +
        `Stack: ${p.stack.join(', ')}.`,
      link: `#lab/${p.slug}`,
      facets: {
        summary: `${p.name} is ${STATUS[p.status]}. ${p.idea}${p.built.length ? '' : ' Nothing is implemented yet.'}`,
        built: p.built.length ? `Per the repo, implemented: ${p.built.slice(0, 4).join('; ')}.` : 'Nothing is implemented yet — the repository has no code to describe.',
        limits: p.tradeoffs.length ? `Honest limits: ${p.tradeoffs.join(' ')}` : 'The repo lists no limits.',
        planned: p.planned.length ? `Planned (the repo’s own list): ${p.planned.join('; ')}.` : 'Nothing is planned on record.',
        stack: `Stack: ${p.stack.join(', ')}.`,
      },
    })
  }
  out.push({
    id: 'projects',
    title: 'Projects overview',
    keywords: ['project', 'projects', 'built', 'build', 'made', 'make', 'portfolio', 'work', 'apps', 'show', 'best', 'favourite', 'favorite'],
    text: `Projects on record: ${projects.map((p) => `${p.name} (${STATUS[p.status]})`).join(', ')}.`,
    link: '#lab',
  })
  return out
}

const STOP = new Set('the a an and or of to in on for is are was be it its this that what which who how do does did can you your about tell me with as at by from i my'.split(' '))
export const tokens = (s: string) => s.toLowerCase().split(/[^a-z0-9]+/).filter((w) => w && !STOP.has(w))

export function retrieve(query: string, kb: KnowledgeEntry[], n = 2): KnowledgeEntry[] {
  const q = new Set(tokens(query))
  if (!q.size) return []
  const scored = kb.map((e) => {
    let s = 0
    for (const k of e.keywords) if (q.has(k)) s += 3
    for (const w of tokens(e.title)) if (q.has(w)) s += 4
    for (const w of tokens(e.text)) if (q.has(w)) s += 0.25
    return { e, s }
  })
  return scored.filter((x) => x.s >= 3).sort((a, b) => b.s - a.s).slice(0, n).map((x) => x.e)
}
