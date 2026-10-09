import type { Post } from './types'

// No published writing exists yet. These are LAYOUT SAMPLES and are labelled as such in the UI.
// Replace with real posts; set status: 'published' to remove the "sample" ribbon.
export const posts: Post[] = [
  {
    slug: 'sample-honest-readmes',
    title: 'Write the “Known limitations” section first',
    date: '2026-10-09',
    category: 'Engineering',
    excerpt: 'EventZee’s README admits its passwords are stored in plain text. That sentence does more for trust than any feature list.',
    body: [
      'SAMPLE — layout demonstration, not published writing.',
      'Idea to expand: how listing what a project cannot do changes the way readers evaluate what it can do. Evidence to cite: the EventZee, Brownie Press and QuizApp READMEs all keep a limitations list.',
    ],
    project: 'eventzee',
    status: 'sample',
  },
  {
    slug: 'sample-consent-gate',
    title: 'A consent gate is a UI pattern, not a legal footer',
    date: '2026-10-03',
    category: 'Design',
    excerpt: 'In Paroh Twin nothing becomes memory until a person presses Approve. Notes on designing that moment.',
    body: [
      'SAMPLE — layout demonstration, not published writing.',
      'Idea to expand: candidate facts, the approval tray, and why the dashboard states where each number comes from.',
    ],
    project: 'paroh-twin',
    status: 'sample',
  },
  {
    slug: 'sample-snake-in-ascii',
    title: 'How the python in the intro is drawn',
    date: '2026-10-09',
    category: 'Experiment',
    excerpt: 'A body of circles following a path, turned into a density ramp. No sprite, no video.',
    body: [
      'SAMPLE — layout demonstration, not published writing.',
      'Idea to expand: coverage field → character ramp, why the cell size adapts to frame time, and what the pointer does to letters.',
    ],
    status: 'sample',
  },
]

export const unfinished = [
  { title: 'Flow & Magic', note: 'repository contains a licence and nothing else' },
  { title: 'Paroh on phones', note: 'Android path documented, not a store release' },
  { title: 'PEECE online mode', note: 'specified in docs, not built' },
  { title: 'Real 3D companions', note: 'this site ships ASCII placeholders until models are chosen' },
]
