import type { CharacterConfig } from '../content/characters'
import type { CharState } from './machine'

export const AV_ROWS = 34
export const AV_COLS = 70
const WX = 1.7 // world width
const WY = 1.5 // world height

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const ellipse = (x: number, y: number, cx: number, cy: number, rx: number, ry: number) => {
  const dx = (x - cx) / rx, dy = (y - cy) / ry
  return dx * dx + dy * dy
}
const hash = (x: number, y: number) => {
  const s = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453
  return s - Math.floor(s)
}

const SKIN = ' .,:-=+*'
const HAIR = '%#@&W'
const BONE = '#ece7da'

export interface AvatarFrame { state: CharState; t: number; look: number /* -1..1 */ }

/** Placeholder ASCII bust. Replace by a GLB renderer when avatar.kind === 'glb' (docs/ASSETS.md). */
export function drawAvatar(ctx: CanvasRenderingContext2D, w: number, h: number, cfg: CharacterConfig, f: AvatarFrame, color: string) {
  const a = cfg.avatar
  const cellH = h / AV_ROWS
  const cellW = w / AV_COLS
  ctx.clearRect(0, 0, w, h)
  ctx.font = `${Math.floor(cellH * 1.0)}px "JetBrains Mono Variable", ui-monospace, monospace`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  const breathe = Math.sin(f.t * 1.3) * 0.008
  const lean = a.headTilt * 0.03 + f.look * 0.03 + (f.state === 'LISTENING' ? 0.04 : 0) + (f.state === 'THINKING' ? -0.025 : 0)
  const bob = f.state === 'SPEAKING' ? Math.sin(f.t * 7) * 0.006 : 0
  const hx = lean
  const hy = 0.5 + bob + breathe
  const blink = (f.t * 0.37) % 1 > 0.965 || (f.state === 'REACTING' && Math.sin(f.t * 14) > 0.4)
  const [lx, ly] = a.light
  const ll = Math.hypot(lx, ly, 0.8)
  const speaking = f.state === 'SPEAKING' || f.state === 'GREETING'
  const mouthCh = f.state === 'ERROR' ? '~' : speaking ? ['o', '=', 'O', '-'][Math.floor(f.t * 9) % 4] : f.state === 'REACTING' ? 'v' : '-'

  const eyeY = hy - 0.035 - (f.state === 'THINKING' ? 0.03 : 0)
  const eyeDx = 0.105
  const look = f.look * 0.03
  const halfW = (0.55 / AV_COLS) * WX
  const halfH = (0.55 / AV_ROWS) * WY

  for (let r = 0; r < AV_ROWS; r++) {
    for (let c = 0; c < AV_COLS; c++) {
      const x = ((c + 0.5) / AV_COLS - 0.5) * WX
      const y = ((r + 0.5) / AV_ROWS) * WY
      let ch = ''
      let alpha = 0
      let col = color

      const shRx = 0.36 + 0.36 * a.shoulders
      const sh = ellipse(x, y, 0, 1.52 + breathe, shRx, 0.5)
      const neck = Math.abs(x - hx * 0.4) < 0.09 && y > 0.82 && y < 1.12
      const head = ellipse(x, y, hx, hy, 0.29, 0.37)
      const face = ellipse(x, y, hx, hy + 0.05, 0.245, 0.32)
      const hairTopY = hy - 0.17 + (1 - a.hairTop) * 0.06
      const cap = ellipse(x, y, hx, hy - 0.07, 0.325, 0.37 + a.hairTop * 0.07) < 1 && !(face < 1 && y > hairTopY)
      const long = a.hairLength > 0.4
      const curtain = long && Math.abs(x - hx) > 0.2 && Math.abs(x - hx) < 0.36 && y > hy - 0.12 && y < hy + 0.12 + a.hairLength * 0.8 && face >= 0.95
      const sideShort = !long && Math.abs(x - hx) > 0.235 && Math.abs(x - hx) < 0.31 && y > hy - 0.16 && y < hy - 0.02
      const isHair = cap || curtain || sideShort

      if (isHair) {
        ch = HAIR[Math.floor(hash(c * 0.37, r * 0.71) * HAIR.length)]
        alpha = 0.5 + 0.2 * hash(c, r) + (Math.sin(c * 0.8 + f.t * 0.5 + r * 0.25) > 0.7 ? 0.2 : 0)
      } else if (head < 1) {
        const nx = (x - hx) / 0.29, ny = (y - hy) / 0.37
        const nz = Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny))
        const d = clamp((nx * lx + ny * ly + nz * 0.8) / ll)
        const dens = 0.2 + d * 0.7
        ch = SKIN[Math.floor(clamp(dens) * (SKIN.length - 1))]
        alpha = 0.4 + dens * 0.55
      } else if (neck) {
        ch = ':'
        alpha = 0.3
      } else if (sh < 1) {
        const nx = x / shRx, ny = (y - 1.52) / 0.5
        const nz = Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny))
        const d = clamp((nx * lx + ny * ly + nz * 0.8) / ll)
        const collar = Math.abs(x) < 0.11 && y < 1.16 + Math.abs(x) * 1.6
        ch = collar ? '.' : ' =+*#%'[Math.floor(clamp(0.2 + d * 0.8) * 5)]
        alpha = collar ? 0.25 : 0.22 + d * 0.5
      }

      // face features in bone, drawn only where there is face
      if (head < 0.92 && !isHair) {
        const eye = (ex: number) => Math.abs(x - (hx + ex + look)) < halfW && Math.abs(y - eyeY) < halfH
        if (eye(-eyeDx) || eye(eyeDx)) {
          ch = f.state === 'THINKING' ? '`' : blink ? '-' : f.state === 'ERROR' ? 'x' : 'O'
          alpha = 1; col = BONE
        }
        if (a.accessory === 'glasses') {
          const ring = (ex: number) => { const dx = Math.abs(x - (hx + ex + look)), dy = Math.abs(y - eyeY); return dx < 0.085 && dy < 0.07 && (dx > 0.05 || dy > 0.04) }
          if (ring(-eyeDx) || ring(eyeDx)) { ch = '#'; alpha = 0.95; col = BONE }
          else if (Math.abs(x - hx - look) < 0.035 && Math.abs(y - eyeY) < halfH) { ch = '-'; alpha = 0.9; col = BONE }
        }
        if ((f.state === 'REACTING' || f.state === 'THINKING') && Math.abs(y - (eyeY - 0.1)) < halfH && (Math.abs(x - hx - eyeDx) < 0.06 || Math.abs(x - hx + eyeDx) < 0.06)) { ch = '^'; alpha = 0.9; col = BONE }
        if (Math.abs(x - hx - look * 0.5) < halfW * 0.6 && Math.abs(y - (hy + 0.08)) < halfH * 0.8) { ch = '.'; alpha = 1; col = BONE }
        if (Math.abs(x - hx) < halfW && Math.abs(y - (hy + 0.21)) < halfH) { ch = mouthCh; alpha = 1; col = BONE }
        if (f.state === 'ERROR' && hash(c, r + Math.floor(f.t * 12)) > 0.94) { ch = '#%@&'[Math.floor(hash(r, c) * 4)]; alpha = 0.9 }
      }

      if (ch && ch !== ' ') {
        ctx.fillStyle = col
        ctx.globalAlpha = clamp(alpha)
        ctx.fillText(ch, (c + 0.5) * cellW, (r + 0.5) * cellH)
      }
    }
  }
  ctx.globalAlpha = 1
}
