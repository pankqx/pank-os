// Photos supplied by Pankaj, converted to ink (scripts/ink.py). Captions are jokes, not claims.
export interface Specimen { n: string; src: string; cut: string; title: string; caption: string; note?: string; shape: 'portrait' | 'landscape' | 'circle'; alt: string }
const b = (f: string) => `${import.meta.env.BASE_URL}photos/${f}`

export const specimens: Specimen[] = [
  { n: '01', src: b('goa.webp'), cut: b('goa-cut.webp'), shape: 'portrait', title: 'The tourist', caption: 'Sunglasses: on. Expression: loading…', note: 'very old building, for scale', alt: 'Ink drawing of Pankaj in sunglasses in front of an old red-stone church' },
  { n: '02', src: b('jump.webp'), cut: b('jump-cut.webp'), shape: 'portrait', title: 'Airborne', caption: 'Debugging technique #4: leave the ground and see if the bug follows.', note: 'gravity: pending review', alt: 'Ink drawing of Pankaj mid-air in a jumping kick' },
  { n: '03', src: b('kick-sign.webp'), cut: b('kick-sign-cut.webp'), shape: 'landscape', title: 'The composting unit incident', caption: 'Holding the pole for balance, not for drama. The sign survived.', note: 'witnesses: 1 tree', alt: 'Ink drawing of Pankaj doing a flying kick while holding a sign pole labelled Composting Unit' },
  { n: '04', src: b('garden.webp'), cut: b('garden-cut.webp'), shape: 'portrait', title: 'Arms crossed', caption: 'The pose of a build that passed on the first try. Rarely photographed.', note: 'rare sighting', alt: 'Ink drawing of Pankaj standing with arms crossed in a garden' },
  { n: '05', src: b('bakery.webp'), cut: b('bakery-cut.webp'), shape: 'portrait', title: 'Golden hour', caption: 'Natural habitat: near bakeries, late afternoon. Approach with brownies.', note: 'see also: The Brownie Press', alt: 'Ink drawing of Pankaj smiling outside a bakery' },
  { n: '06', src: b('avatar.webp'), cut: b('avatar-cut.webp'), shape: 'circle', title: 'The GitHub version', caption: 'Same human, compiled to 1s and 0s. Mostly 1s on good days.', note: 'github.com/pankqx', alt: 'Ink version of Pankaj’s GitHub avatar made of digits' },
]
