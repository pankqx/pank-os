// The stop-motion opener of Chapter I. First person, jokes intended. Drawn scenes, no photos.
import type { SceneKey } from '../art/Scenes'
export interface Beat { scene: SceneKey; alt: string; line: string; sub: string; sfx?: string; from: [number, number, number, number]; to: [number, number, number, number]; zap?: boolean; focus?: [number, number] }
// from/to: [x vw offset, y vh offset, rotate deg, scale]
export const beats: Beat[] = [
  { scene: 'script', alt: 'A short-film script being typed at 2:47 AM, with a clapperboard', line: 'It starts at 2:47 AM.', sub: 'I write short films. This one is about a portfolio that refused to be normal.', sfx: 'ACTION!', from: [-30, 10, -8, 0.85], to: [0, 0, 0, 1], focus: [0.55, 0.5] },
  { scene: 'graph', alt: 'An Obsidian-style graph of ideas connected to projects and hobbies', line: 'My brain is a graph.', sub: 'Every idea links to three others. Two of them become projects.', from: [20, 6, 6, 0.8], to: [0, 0, 0, 1.05], zap: true, focus: [0.5, 0.5] },
  { scene: 'chart', alt: 'A candlestick chart that climbs, then crashes, labelled feelings.exe', line: 'I tried trading.', sub: 'The chart went up. Then my feelings started placing the orders.', sfx: 'CRASH', from: [-40, -6, -4, 0.9], to: [2, 0, 2, 1.05], focus: [0.45, 0.5] },
  { scene: 'chess', alt: 'A chess knight leaping while a sacrificed queen falls off the board', line: 'So now I play chess.', sub: 'Sacrifice the queen. On purpose. Mostly.', sfx: 'CHECK!', from: [40, 8, 8, 0.85], to: [0, 0, -2, 1.05], focus: [0.55, 0.5] },
  { scene: 'code', alt: 'A bug being kicked out of a laptop', line: 'And I write code.', sub: 'A bug appeared in production. I handled it professionally.', sfx: 'WHAM!', from: [-10, 10, -3, 0.9], to: [0, 0, 1, 1.08], zap: true, focus: [0.5, 0.48] },
  { scene: 'orbit', alt: 'Everything I do, orbiting a lightning bolt', line: 'Okay. Enough showing off.', sub: 'Let me show you the inside ↓', from: [0, 0, 0, 0.9], to: [0, 0, 0, 1], zap: true, focus: [0.5, 0.5] },
]
