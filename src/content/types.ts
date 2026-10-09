export type ProjectStatus = 'shipped' | 'in-progress' | 'experimental' | 'concept' | 'archived'
export type ArtKey = 'algopath' | 'eventzee' | 'paroh' | 'twin' | 'flow' | 'peece' | 'brownie' | 'none'

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
  repo?: string // omitted for private repos
  live?: string
  evidence: string // where the facts above come from
  how?: string[] // plain explanation of how it works, step by step
  gallery?: { src: string; caption: string }[]
  cta?: { label: string; href: string }
}

export interface Post {
  slug: string
  title: string
  date: string // ISO
  category: 'Story' | 'Engineering' | 'Design' | 'Experiment' | 'Note' | 'Lesson'
  excerpt: string
  /** paragraphs; a string starting with '## ' is a heading, '> ' a pull quote, '![caption](src)' an image */
  body: string[]
  cover?: string
  project?: string // project slug
  readingJoke?: string
  status: 'published' | 'draft' | 'sample'
}

export interface Milestone {
  kind: 'COMPLETED' | 'PARTICIPATED' | 'ORGANISED' | 'CERTIFIED' | 'FOUNDED' | 'WON (UNVERIFIED)' | 'LED'
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
