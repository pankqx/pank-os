// First-person facts, from the résumé and from what Pankaj told me directly (2026-10-10). Edit freely.
export const profile = {
  name: 'K S PANKAJ',
  short: 'Pankaj',
  role: 'I build websites, digital products and the occasional beautiful mistake',
  location: 'Mangaluru, India',
  study: 'MCA, St Aloysius (Deemed to be University), 2025 – present',
  roles: [
    { title: 'Software Developer Intern', org: 'Prasanna Technologies Pvt. Ltd.', when: 'Jun 2026' },
    { title: 'Freelance Software Developer', org: 'House of Anaika', when: 'May 2026' },
    { title: 'Chief editor & digital lead, NAAC accreditation (freelance)', org: 'a government college', when: '13 months' },
  ],
  community: [
    'Started DAT Community (Developer & Tester) — the idea was mine, I gathered the people',
    'Hosted Eleven Bytes — a coding event with participants from 25+ colleges',
    'Ran a college IT team and taught teachers their way around the digital side of things',
  ],
  skills: ['Python', 'Kotlin', 'Java', 'C#', 'JavaScript / TypeScript', 'React', 'Node / Express', 'ASP.NET Core MVC', 'Android', 'PostgreSQL', 'MySQL', 'Firestore', 'MongoDB', 'Docker', 'Git', 'Canva', 'Storytelling'],
  makes: [
    { what: 'Websites that feel like places', note: 'like this one — opening scene, characters, a python with an appetite' },
    { what: 'Digital products', note: 'tools people open twice: ProntoPy, Paroh, The Brownie Press' },
    { what: 'Stories', note: 'short-film scripts, blogs, photo essays — and this site' },
  ],
} as const

export const links = [
  { label: 'Email', href: 'mailto:pankqx@gmail.com', handle: 'pankqx@gmail.com' },
  { label: 'GitHub', href: 'https://github.com/pankqx', handle: 'github.com/pankqx' },
  // [VERIFY] The résumé prints linkedin.com/in/pankqz (ends in z). Confirm before launch.
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/pankqz', handle: 'linkedin.com/in/pankqz', note: 'taken from résumé — verify spelling' },
] satisfies { label: string; href: string; handle: string; note?: string }[]
