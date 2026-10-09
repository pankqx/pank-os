import type { Milestone } from './types'

// Evidence only. Participation is labelled as participation. Unverified is labelled unverified.
export const milestones: Milestone[] = [
  { kind: 'LED', title: 'NAAC accreditation — chief editor & digital lead', detail: '13 months freelancing for a government college: 7–8 criteria modules, brochure, website, IT team, training teachers and students. Documents confidential.', source: 'my own account' },
  { kind: 'COMPLETED', title: 'PEECE — card lounge with sealed decks', detail: 'Four games, ledger, rivals, docs, engine tests.', source: 'github.com/pankqx/peece' },
  { kind: 'PARTICIPATED', title: 'GATEWAYS 2026 hackathon', detail: 'Team http dino, Paroh Twin (“HumanTwin AI”).', when: '2026', source: 'github.com/pankqx/paroh-twin' },
  { kind: 'ORGANISED', title: 'Eleven Bytes coding event', detail: 'Hosted and coordinated; participants from 25+ colleges.', source: 'résumé' },
  { kind: 'FOUNDED', title: 'DAT Community', detail: 'My idea, my people. It wound down when most chose quick profit over long-term growth.', source: 'my own account' },
  { kind: 'WON (UNVERIFIED)', title: '2nd prize, drama — DCL competition, Christ University', detail: 'School days. Photos lost. The principal called me the rockstar of the school.', source: 'my memory and one principal' },
  { kind: 'CERTIFIED', title: 'NPTEL · IBM SkillsBuild · Infosys Springboard', detail: 'Cybersecurity, AI, Python — coursework, not competitions.', when: '2025', source: 'résumé' },
]
