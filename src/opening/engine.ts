// Procedural ASCII opening. Pure canvas, no DOM nodes per character.
// Timeline (seconds): void 0–1.2 · python 1.2–· · name assembles 3.0–4.6 · python crosses name 4.4–5.8 · stabilise 6.0–7.0.

export const DURATION = 7.2

const RAMP = ' .:-=+*#%@'
const PY_RAMP = ' .:;+=xX#%@'
const SCRAMBLE = 'PANKAJ01<>/\\#%@&$'

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const smooth = (v: number) => {
  const x = clamp(v)
  return x * x * (3 - 2 * x)
}
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const hash = (x: number, y: number) => {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453
  return s - Math.floor(s)
}
function vnoise(x: number, y: number) {
  const xi = Math.floor(x), yi = Math.floor(y)
  const xf = x - xi, yf = y - yi
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf)
  return lerp(lerp(hash(xi, yi), hash(xi + 1, yi), u), lerp(hash(xi, yi + 1), hash(xi + 1, yi + 1), u), v)
}

export interface PythonConfig {
  segments: number
  spacing: number // seconds of path delay between segments
  headRadius: number // fraction of min(viewport)
  taper: number
  palette: string[]
}
export const defaultPython: PythonConfig = { segments: 90, spacing: 0.03, headRadius: 0.085, taper: 0.7, palette: ['#c8ff2e', '#ff4b2b'] }

export interface Pointer { x: number; y: number; active: boolean }

export class AsciiOpening {
  cols = 0
  rows = 0
  cw = 0
  ch = 0
  private mask: Uint8Array = new Uint8Array(0)
  private nameRect = { cx: 0, cy: 0, w: 0, h: 0 }
  private fontReady = false
  private stack = false
  private ticks = 0
  constructor(public width: number, public height: number, public cell: number, public py: PythonConfig = defaultPython) {
    this.resize(width, height, cell)
  }

  resize(w: number, h: number, cell: number) {
    this.width = w
    this.height = h
    this.cell = cell
    this.cw = cell * 0.62
    this.ch = cell
    this.cols = Math.ceil(w / this.cw)
    this.rows = Math.ceil(h / this.ch)
    this.stack = w / h < 0.95
    this.buildMask()
  }

  setFontReady() {
    this.fontReady = true
    this.buildMask()
  }

  private fontFamily() {
    return this.fontReady ? '"Archivo Variable", "Archivo", Impact, sans-serif' : 'Impact, "Arial Black", sans-serif'
  }

  /** Name layout in pixels; shared by the ASCII mask and the final crisp type. */
  layout() {
    const lines = this.stack ? ['K S', 'PANKAJ'] : ['K S PANKAJ']
    const maxW = this.width * (this.stack ? 0.86 : 0.8)
    const probe = document.createElement('canvas').getContext('2d')!
    let fs = 200
    probe.font = `900 ${fs}px ${this.fontFamily()}`
    const widest = Math.max(...lines.map((l) => probe.measureText(l).width))
    fs = Math.min(fs * (maxW / widest), this.height * (this.stack ? 0.2 : 0.3))
    return { lines, fs, lh: fs * 0.98 }
  }

  private buildMask() {
    if (typeof document === 'undefined') return
    const { lines, fs, lh } = this.layout()
    const c = document.createElement('canvas')
    c.width = this.cols
    c.height = this.rows
    const g = c.getContext('2d')!
    g.scale(1 / this.cw, 1 / this.ch)
    g.fillStyle = '#fff'
    g.textAlign = 'center'
    g.textBaseline = 'middle'
    g.font = `900 ${fs}px ${this.fontFamily()}`
    const total = lh * lines.length
    const cy = this.height * 0.5
    lines.forEach((l, i) => g.fillText(l, this.width / 2, cy - total / 2 + lh * (i + 0.5)))
    const d = g.getImageData(0, 0, this.cols, this.rows).data
    this.mask = new Uint8Array(this.cols * this.rows)
    for (let i = 0; i < this.mask.length; i++) this.mask[i] = d[i * 4 + 3] > 110 ? 1 : 0
    this.nameRect = { cx: this.width / 2, cy, w: this.width * 0.8, h: total }
  }

  // ---- python path: enters from the left, then eats the name left → right ----------------
  private pos(tau: number): [number, number] {
    const W = this.width, H = this.height
    const low = H * 0.82
    if (tau < 3.0) {
      const k = smooth((tau - 1.0) / 2.0)
      return [lerp(-W * 0.45, W * 0.14, k), low + Math.sin(tau * 4.2) * H * 0.045]
    }
    const k = clamp((tau - 3.0) / 2.6)
    const e = k * k * (3 - 2 * k) * 0.6 + k * 0.4
    const rise = smooth((tau - 3.0) / 0.55)
    return [lerp(W * 0.14, W * 1.4, e), lerp(low + Math.sin(3.0 * 4.2) * H * 0.045, this.nameRect.cy, rise) + Math.sin(tau * 7) * this.nameRect.h * 0.2 * rise]
  }
  /** has this name cell been eaten at time t? */
  private eaten(px: number, x: number, y: number, t: number, headX: number, R: number) {
    if (t < 3.05) return false
    if (t < 5.5) return px < headX - R * 0.2
    const h = Math.sin(x * 91.3 + y * 17.7) * 43758.5453
    return h - Math.floor(h) > smooth((t - 5.5) / 0.9)
  }

  /** Draws one frame. `fx`: 'full' | 'lite'. Returns nothing; caller owns rAF. */
  render(ctx: CanvasRenderingContext2D, t: number, pointer: Pointer, fx: 'full' | 'lite' = 'full') {
    const { cols, rows, cw, ch } = this
    const W = this.width, H = this.height
    ctx.fillStyle = '#08090a'
    ctx.fillRect(0, 0, W, H)
    ctx.font = `${Math.round(this.cell * 0.95)}px "JetBrains Mono Variable", ui-monospace, monospace`
    ctx.textBaseline = 'middle'
    ctx.textAlign = 'center'
    this.ticks++

    // Python coverage field (computed sparsely into a small buffer of segment data).
    const pyAmp = smooth((t - 1.0) / 0.5) * (1 - smooth((t - 5.9) / 0.5))
    const N = this.py.segments
    const R0 = Math.min(W, H) * this.py.headRadius
    const sx = new Float32Array(N), sy = new Float32Array(N), sr = new Float32Array(N)
    for (let i = 0; i < N; i++) {
      const p = this.pos(t - i * this.py.spacing)
      sx[i] = p[0]; sy[i] = p[1]
      const f = i / (N - 1)
      sr[i] = R0 * (1 - this.py.taper * Math.pow(f, 0.85)) * (i === 0 ? 1.12 : 1) * (0.85 + 0.15 * Math.sin(f * 14 - t * 3))
    }
    const hx = sx[0] - sx[2], hy = sy[0] - sy[2]
    const hl = Math.hypot(hx, hy) || 1
    const fwd: [number, number] = [hx / hl, hy / hl]

    const nameAmt = smooth((t - 1.2) / 1.4)
    const calm = smooth((t - 5.3) / 1.0)
    const bg = lerp(1, 0.3, calm)
    const emerge = smooth(t / 1.6)
    const showName = t >= 1.2
    const chomp = t > 3.0 && t < 5.6 ? 0.55 + 0.45 * Math.sin(t * 16) : 0.25

    let lastFill = ''
    const put = (ch_: string, x: number, y: number, color: string) => {
      if (color !== lastFill) { ctx.fillStyle = color; lastFill = color }
      ctx.fillText(ch_, x, y)
    }

    for (let y = 0; y < rows; y++) {
      const py_ = (y + 0.5) * ch
      for (let x = 0; x < cols; x++) {
        const px = (x + 0.5) * cw
        let ox = 0, oy = 0

        // pointer disturbance
        let pd = 0
        if (pointer.active) {
          const d = Math.hypot(px - pointer.x, py_ - pointer.y)
          if (d < 120) { pd = 1 - d / 120; ox += (hash(x, y + this.ticks) - 0.5) * cw * 1.6 * pd; oy += (hash(y, x + this.ticks) - 0.5) * ch * 0.8 * pd }
        }

        // python coverage
        let cov = 0, segI = -1
        let head = 0
        if (pyAmp > 0.01) {
          // head: a big wedge ellipse oriented along travel, with chomping jaws
          const dx0 = px - sx[0], dy0 = py_ - sy[0]
          const u = dx0 * fwd[0] + dy0 * fwd[1], v = -dx0 * fwd[1] + dy0 * fwd[0]
          const HR = sr[0] * pyAmp * 1.25
          const taper = 1 - Math.max(0, u) / (HR * 2.4)
          const q = (u * u) / (HR * HR * 3.2) + (v * v) / (HR * HR * taper * taper * 1.1)
          if (q < 1 && u > -HR * 0.9) {
            const jaw = chomp * (u - HR * 0.15) * 0.55
            if (!(u > HR * 0.15 && Math.abs(v) < jaw)) head = 1 - q
          }
          for (let i = 3; i < N; i += fx === 'lite' ? 2 : 1) {
            const dx = px - sx[i], dy = py_ - sy[i]
            const r = sr[i] * pyAmp
            if (Math.abs(dx) > r || Math.abs(dy) > r) continue
            const d = Math.hypot(dx, dy)
            if (d < r) {
              const c = 1 - d / r
              if (c > cov) { cov = c; segI = i }
            }
          }
        }

        const mi = y * cols + x
        const inName = showName && this.mask[mi] === 1

        // 1) python on top — head first
        if (head > 0.02) {
          const edge = head < 0.18
          put(edge ? 'X' : head > 0.6 ? '@' : '#', px + ox, py_ + oy, edge ? '#c8ff2e' : `rgba(200,255,46,${0.55 + head * 0.45})`)
          continue
        }
        if (cov > 0.04) {
          const f = segI / (N - 1)
          const scale = ((x + ((y >> 1) & 1)) & 1) === 0 ? 0 : -1.2
          let idx = Math.floor(clamp(cov * 1.25 + (cov > 0.2 ? scale * 0.12 : 0)) * (PY_RAMP.length - 1))
          idx = Math.max(1, Math.min(PY_RAMP.length - 1, idx))
          const belly = Math.sin(f * 30 + cov * 3 - t * 2) > 0.55
          const col = belly ? `rgba(255,75,43,${0.55 + cov * 0.4})` : `rgba(200,255,46,${0.35 + cov * 0.65})`
          put(PY_RAMP[idx], px + ox, py_ + oy, col)
          continue
        }

        // 2) name (ASCII assembling), then crisp type takes over in `calm`
        if (inName && this.eaten(px, x, y, t, sx[0], sr[0])) {
          // crumbs just behind the jaws
          if (t < 5.5 && px > sx[0] - sr[0] * 2.2 && hash(x + this.ticks, y) > 0.6) put(SCRAMBLE[(x + this.ticks) % SCRAMBLE.length], px + ox, py_ + oy + (sx[0] - px) * 0.15, 'rgba(255,75,43,0.8)')
          continue
        }
        if (inName) {
          const thr = hash(x * 3.1, y * 1.7) * 0.7 + (x / cols) * 0.3
          const rev = t > 5.5 ? 1 : nameAmt - thr
          if (rev > 0) {
            // proximity to snake → disturbance
            let near = 0
            for (let i = 0; i < Math.min(N, 10); i++) {
              const d = Math.hypot(px - sx[i], py_ - sy[i])
              near = Math.max(near, clamp(1 - d / (sr[i] * 2.4 + 1)) * pyAmp)
            }
            const settle = clamp(rev / 0.12)
            const flicker = settle < 1 || near > 0.1
            const chr = flicker ? SCRAMBLE[Math.floor(hash(x + this.ticks * 0.37, y) * SCRAMBLE.length)] : '#'
            const jitter = near * ch * 0.9 * Math.sin(x * 0.7 + t * 25)
            const a = (1 - calm) * (0.35 + 0.65 * settle)
            if (a > 0.02) {
              const col = near > 0.12 ? `rgba(200,255,46,${a})` : `rgba(236,231,218,${a})`
              put(chr, px + ox, py_ + oy + jitter, col)
            }
            continue
          }
        }

        // 3) background field
        const n = vnoise(x * 0.09 + t * 0.35, y * 0.13 - t * 0.2) * 0.7 + vnoise(x * 0.31 - t * 0.6, y * 0.4) * 0.3
        const gate = emerge * (0.28 + 0.4 * Math.sin(t * 0.8 + x * 0.05) * 0.5 + 0.2)
        let v = clamp((n - (0.72 - gate * 0.55)) * 2.4) * bg
        if (pd > 0) v = Math.max(v, pd * 0.9)
        if (v > 0.05) {
          const idx = Math.floor(v * (RAMP.length - 1))
          const ch2 = pd > 0.2 ? SCRAMBLE[Math.floor(hash(x, y + this.ticks) * SCRAMBLE.length)] : RAMP[idx]
          const base = pd > 0.2 ? '200,255,46' : '120,126,118'
          put(ch2, px + ox, py_ + oy, `rgba(${base},${clamp(v * (pd > 0.2 ? 1 : 0.7))})`)
        }
      }
    }

    // python eyes + tongue on top
    if (pyAmp > 0.3) {
      const perp: [number, number] = [-fwd[1], fwd[0]]
      const r = sr[0] * pyAmp
      for (const s of [-1, 1]) {
        put('O', sx[0] + fwd[0] * r * 0.7 + perp[0] * r * 0.62 * s, sy[0] + fwd[1] * r * 0.7 + perp[1] * r * 0.62 * s, '#ff4b2b')
      }
      if (Math.sin(t * 9) > 0.2 && chomp < 0.4) { for (let k = 1; k <= 3; k++) put(k === 3 ? '<' : '-', sx[0] + fwd[0] * r * (1.9 + k * 0.25), sy[0] + fwd[1] * r * (1.9 + k * 0.25), '#ff4b2b') }
    }

    // crisp composed type
    if (calm > 0.01) {
      const { lines, fs, lh } = this.layout()
      ctx.save()
      ctx.globalAlpha = calm
      ctx.fillStyle = '#ece7da'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.font = `900 ${fs}px ${this.fontFamily()}`
      const total = lh * lines.length
      lines.forEach((l, i) => ctx.fillText(l, W / 2, H / 2 - total / 2 + lh * (i + 0.5)))
      ctx.font = `${Math.max(11, Math.round(this.cell * 0.9))}px "JetBrains Mono Variable", ui-monospace, monospace`
      ctx.fillStyle = '#c8ff2e'
      ctx.fillText('THE HUMAN EXPERIMENT', W / 2, H / 2 + total / 2 + this.cell * 2.2)
      ctx.restore()
    }
  }

  /** A single static composed frame for reduced-motion / minimum effects. */
  renderStatic(ctx: CanvasRenderingContext2D) {
    this.render(ctx, DURATION - 0.1, { x: 0, y: 0, active: false }, 'lite')
  }
}
