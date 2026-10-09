import type { Post } from './types'

// Stories Pankaj told me (2026-10-10), written up in his voice as first drafts. Edit freely — they're yours.
export const posts: Post[] = [
  {
    slug: 'naac-thirteen-months',
    title: 'Thirteen months as a one-person IT department',
    date: '2026-10-10',
    category: 'Story',
    excerpt: 'Before my MCA, the government college I studied at needed to get through NAAC accreditation. The teachers were brilliant at teaching and not at Canva. So I became the chief editor, the IT team and the help desk.',
    scene: 'script',
    readingJoke: 'reading time: 4 min · actual project time: 13 months',
    status: 'published',
    body: [
      'NAAC accreditation is the exam a college sits for. Every department, every record, every photo of every event has to be collected, written up and presented — in criteria, modules, PDFs and a website that actually opens.',
      'Its teachers were excellent at their subjects and very new to the digital side of things. Somebody had to sit in the middle. For thirteen months, as a freelancer, that somebody was me.',
      '## What I actually did',
      'I worked on roughly seven to eight of the criteria modules. I was the chief editor: collecting information from every department, drafting the documents, turning them into clean PDFs and designing everything in Canva. I crafted the college brochure from scratch. I looked after the website and the IT team, and I taught teachers and students how to organise the material so the next person wouldn’t start from zero.',
      '> The hardest part wasn’t the design. It was getting every department to send the same file, in the same format, before the same deadline.',
      '## What I can’t show you',
      'Almost nothing — the documents are confidential, so this story has no screenshots. What I can show you is what it taught me: how to run a project nobody else understands yet, how to teach without making people feel slow, and how to keep going when the deadline moves closer and the files don’t.',
      'Thirteen months, a lot of PDFs, and one of the most useful things I’ve ever done.',
    ],
  },
  {
    slug: 'rockstar-of-the-school',
    title: 'Rockstar of the school (evidence not found)',
    date: '2026-10-10',
    category: 'Story',
    excerpt: 'At school I won second prize for drama at the DCL competition at Christ University. I have no photos. I have one principal who called me the rockstar of the school.',
    scene: 'orbit',
    readingJoke: 'reading time: 2 min · evidence: my memory',
    status: 'published',
    body: [
      'In school I was in every extra-curricular activity that would have me. Drama was the one that stuck.',
      'We took second prize for drama at the DCL competition at Christ University. I’d show you the photos, but I lost them, which is the most on-brand thing about this website: a trophy room with no trophies, and a prize with no pictures.',
      '> The principal called me the rockstar of the school. I have decided that counts as a certificate.',
      'What drama gave me was not the prize. It was learning that a room can be moved, that timing is a skill, and that a story told well beats a fact told loudly. I still write short-film scripts. This site is, in a way, another one.',
    ],
  },
  {
    slug: 'the-community-that-didnt-make-it',
    title: 'The community I started, and why it stopped',
    date: '2026-10-10',
    category: 'Lesson',
    excerpt: 'DAT Community was entirely my idea. I spread it, I gathered the people. It didn’t survive — most people chose quick profit over long-term growth.',
    scene: 'graph',
    readingJoke: 'reading time: 3 min · lessons: kept',
    status: 'published',
    body: [
      'DAT stood for Developer & Tester: a place where developers, testers, AI/ML learners, creators and marketers could learn, build, test and promote products together.',
      'The idea was entirely mine. I talked about it to everyone, I gathered people, I set it up.',
      '## What happened',
      'It stopped. Not because people weren’t talented, but because most of them chose quick profit over long-term growth. A community only works when people put in before they take out, and we never got past that.',
      '> I couldn’t make it last. I could make it start. Both of those are worth knowing about yourself.',
      'I’d do it again — differently. Smaller. With fewer people and more patience. If you’re building something like that, I’d love to help.',
    ],
  },
  {
    slug: 'emotions-are-expensive',
    title: 'Trading taught me that emotions are expensive',
    date: '2026-10-10',
    category: 'Lesson',
    excerpt: 'I traded intraday. I made money first, which was the worst thing that could have happened. Then I let my feelings place the trades.',
    scene: 'chart',
    readingJoke: 'reading time: 2 min · cheaper than the lesson',
    status: 'published',
    body: [
      'I started trading and the first stretch went well. That early profit felt like skill. It wasn’t; it was luck wearing a nice shirt.',
      'Then came emotional trading: chasing losses, doubling down, staying in because leaving felt like admitting something. I gave back everything I had made and then a lot more.',
      '> The most expensive indicator on any chart is how you feel about it.',
      'So I stopped. What I kept is the habit of writing down what went wrong — which, if you’ve read this far, you’ll notice is the whole theme of this website.',
    ],
  },
]

export const unfinished = [
  { title: 'Flow & Magic', note: 'a repository with a licence and a dream' },
  { title: 'ProntoPy public launch', note: 'private beta, polishing' },
  { title: 'Paroh on phones', note: 'Android path documented, not a store release' },
  { title: 'PEECE online mode', note: 'specified in docs, not built' },
  { title: 'My reading list', note: 'still reading it' },
]

export const rejectedTitles = [
  'Ten things I learned from kicking a signpost',
  'My code works and I don’t know why: a memoir',
  'Monads? In this economy?',
  'A brief history of “just one more feature”',
  'git push --force: a love story',
]
