import type { Milestone } from './types'

// Evidence only. Participation is labelled as participation. Add wins here when they exist.
export const milestones: Milestone[] = [
  { kind: 'COMPLETED', title: 'PEECE — card lounge with sealed decks', detail: 'Four games, ledger, rivals, docs, engine tests.', source: 'github.com/pankqx/peece (STATUS.md)' },
  { kind: 'PARTICIPATED', title: 'GATEWAYS 2026 hackathon', detail: 'Team http dino, Paroh Twin (“HumanTwin AI”). Result: not recorded here.', when: '2026', source: 'github.com/pankqx/paroh-twin' },
  { kind: 'ORGANISED', title: 'Eleven Bytes coding event', detail: 'Hosted and coordinated; participants from 25+ colleges.', source: 'résumé' },
  { kind: 'FOUNDED', title: 'DAT Community (Developer & Tester)', detail: 'Co-founded an open Discord community for builders and learners.', source: 'résumé' },
  { kind: 'CERTIFIED', title: 'NPTEL · IBM SkillsBuild · Infosys Springboard', detail: 'Cybersecurity, AI, Python — coursework certificates, not competitions.', when: '2025', source: 'résumé' },
]

export const plinths = [
  { label: 'FIRST PRIZE', caption: 'awaiting evidence' },
  { label: 'BEST PROJECT', caption: 'awaiting evidence' },
  { label: 'OPEN-SOURCE MERGE', caption: 'awaiting evidence' },
]
