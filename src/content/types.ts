export type ProjectStatus = 'shipped' | 'in-progress' | 'experimental' | 'concept' | 'archived'
export type ArtKey = 'eventzee' | 'paroh' | 'twin' | 'flow' | 'peece' | 'brownie' | 'none'

export interface Project {
  slug: string
  name: string
  kicker: string // one-line editorial hook
  status: ProjectStatus
  statusNote: string // honest, specific
  featured: boolean // gets a full composition in the horizontal lab
  art: ArtKey
  idea: string // the problem / idea
  why: string
  built: string[] // verified, implemented
  planned: string[] // stated roadmap only
  stack: string[]
  decisions: string[]
  tradeoffs: string[] // honest limitations from the repo's own docs
  repo: string
  live?: string
  evidence: string // where the facts above come from
}

export interface Post {
  slug: string
  title: string
  date: string // ISO
  category: 'Engineering' | 'Design' | 'Experiment' | 'Note'
  excerpt: string
  body: string[]
  cover?: string
  project?: string // project slug
  status: 'published' | 'draft' | 'sample'
}

export interface Milestone {
  kind: 'COMPLETED' | 'PARTICIPATED' | 'ORGANISED' | 'CERTIFIED' | 'FOUNDED'
  title: string
  detail: string
  when?: string
  source: string
}

export interface LinkItem {
  label: string
  href: string
  handle: string
  note?: string
}
