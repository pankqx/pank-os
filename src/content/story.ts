// The stop-motion opener of Chapter I. First person, jokes intended.
const art = (f: string) => `${import.meta.env.BASE_URL}art/${f}`
export interface Beat { img: string; alt: string; line: string; sub: string; sfx?: string; from: [number, number, number, number]; to: [number, number, number, number]; zap?: boolean; focus?: [number, number] }
// from/to: [x vw-center offset %, y %, rotate deg, scale]
export const beats: Beat[] = [
  { img: art('stand.webp'), alt: 'Me, arms crossed', line: 'Hi. I’m Pankaj.', sub: 'Someone told me to make a normal portfolio.', from: [0, 4, 0, 0.92], to: [0, 0, 0, 1], focus: [0.5, 0.55] },
  { img: art('fly.webp'), alt: 'Me, mid-air', line: 'I said “sure”.', sub: 'Then I left the ground.', sfx: 'WHOOSH', from: [-60, 18, -14, 0.9], to: [42, -10, 10, 1.05], focus: [0.4, 0.5] },
  { img: art('kick.webp'), alt: 'Me, flying kick', line: 'A bug appeared in production.', sub: 'I handled it professionally.', sfx: 'WHAM!', from: [55, 0, 8, 0.85], to: [-6, 0, -3, 1.08], zap: true, focus: [0.5, 0.48] },
  { img: art('goa.webp'), alt: 'Me in sunglasses', line: 'Victory lap to Goa.', sub: 'Sunglasses: on. Humility: loading…', sfx: '✦ SHINE ✦', from: [30, 10, 4, 0.82], to: [10, 0, 0, 1.06], focus: [0.6, 0.45] },
  { img: art('smile.webp'), alt: 'Me, smiling', line: 'Rizz level: compiling…', sub: '…build succeeded. 0 warnings.', sfx: 'RIZZ.EXE', from: [-20, 8, -3, 0.9], to: [-4, 0, 1, 1.12], zap: true, focus: [0.42, 0.5] },
  { img: art('stand.webp'), alt: 'Me, arms crossed again', line: 'Okay. Enough showing off.', sub: 'Let me show you the inside ↓', from: [0, 0, 0, 1], to: [0, 0, 0, 0.94], focus: [0.5, 0.55] },
]
