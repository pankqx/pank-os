// Verified against the supplied résumé (K_S_Pankaj_Software_Developer_Intern.pdf). Edit freely.
export const profile = {
  name: 'K S PANKAJ',
  short: 'Pankaj',
  role: 'Software developer — product & full-stack',
  location: 'Mangaluru, India', // [VERIFY] inferred from university; confirm or remove
  study: 'MCA, St Aloysius (Deemed to be University), 2025 – present',
  priorStudy: 'B.Sc. Computer Science & Mathematics, Government First Grade College, 2022 – 2025',
  roles: [
    { title: 'Software Developer Intern', org: 'Prasanna Technologies Pvt. Ltd.', when: 'Jun 2026' },
    { title: 'Freelance Software Developer', org: 'House of Anaika', when: 'May 2026' },
  ],
  community: [
    'Co-founder, DAT Community — an open Discord for developers, testers and AI/ML learners',
    'Head of IT Team, GFGC Malur',
    'Host & coordinator, Eleven Bytes — a coding event with participants from 25+ colleges',
  ],
  skills: ['Python', 'Kotlin', 'Java', 'C#', 'JavaScript / TypeScript', 'React', 'Node / Express', 'ASP.NET Core MVC', 'Android', 'PostgreSQL', 'MySQL', 'Firestore', 'MongoDB', 'Docker', 'Git'],
} as const

export const links = [
  { label: 'Email', href: 'mailto:pankqx@gmail.com', handle: 'pankqx@gmail.com' },
  { label: 'GitHub', href: 'https://github.com/pankqx', handle: 'github.com/pankqx' },
  // [VERIFY] The résumé prints linkedin.com/in/pankqz (ends in z). Confirm before launch.
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/pankqz', handle: 'linkedin.com/in/pankqz', note: 'taken from résumé — verify spelling' },
] satisfies { label: string; href: string; handle: string; note?: string }[]
