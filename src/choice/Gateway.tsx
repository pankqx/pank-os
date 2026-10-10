import { useEffect, useRef, useState } from 'react'
import { characters, type CharacterId } from '../content/characters'
import { InkCharacter } from '../character/InkCharacter'
import { FireBackdrop } from '../fx/FireBackdrop'
import { useFx } from '../lib/fx'

const GOAL = 7
const SNACKS = ['⚡', '♞', '✎', '☕', '🍦', '♥', '{ }', '🏏', '🎬', '📈']

interface P { x: number; y: number; vx: number; vy: number; life: number; c: string }

/** Before you enter: feed the python, then steer it into the person you want to meet. */
export function Gateway({ onChoose }: { onChoose: (id: CharacterId) => void }) {
  const cv = useRef<HTMLCanvasElement>(null)
  const [eaten, setEaten] = useState(0)
  const [open, setOpen] = useState(false)
  const [picked, setPicked] = useState<CharacterId | null>(null)
  const pickedRef = useRef<CharacterId | null>(null)
  const openRef = useRef(false)
  const { level } = useFx()
  const still = level === 'min'

  const choose = (id: CharacterId) => {
    if (pickedRef.current) return
    pickedRef.current = id
    setPicked(id)
    window.setTimeout(() => onChoose(id), 700)
  }
  const unlock = () => { openRef.current = true; setOpen(true) }

  useEffect(() => {
    if (still) { unlock(); return }
    const c = cv.current!, g = c.getContext('2d')!
    let W = 0, H = 0
    const size = () => {
      const d = Math.min(devicePixelRatio || 1, 2)
      W = innerWidth; H = innerHeight
      c.width = W * d; c.height = H * d; c.style.width = W + 'px'; c.style.height = H + 'px'
      g.setTransform(d, 0, 0, d, 0, 0)
    }
    size()
    addEventListener('resize', size)

    const N0 = 26
    const segs = Array.from({ length: 70 }, (_, i) => ({ x: W * 0.2 - i * 6, y: H * 0.6 }))
    let len = N0
    const target = { x: W * 0.5, y: H * 0.55 }
    let auto = true, autoT = 0
    const keys = new Set<string>()
    const move = (e: PointerEvent) => { target.x = e.clientX; target.y = e.clientY; auto = false }
    const kd = (e: KeyboardEvent) => { if (e.key.startsWith('Arrow')) { keys.add(e.key); auto = false; e.preventDefault() } }
    const ku = (e: KeyboardEvent) => keys.delete(e.key)
    addEventListener('pointermove', move)
    addEventListener('pointerdown', move)
    addEventListener('keydown', kd)
    addEventListener('keyup', ku)

    const food: { x: number; y: number; s: string; t: number }[] = []
    const spawn = () => food.push({ x: W * (0.15 + Math.random() * 0.7), y: H * (0.3 + Math.random() * 0.55), s: SNACKS[Math.floor(Math.random() * SNACKS.length)], t: 0 })
    spawn(); spawn(); spawn()
    const parts: P[] = []
    const burst = (x: number, y: number, n = 26, col = '#ffd60a') => {
      for (let i = 0; i < n; i++) { const a = Math.random() * 6.283, s = 1 + Math.random() * 4; parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 1, c: Math.random() > 0.3 ? col : '#fff' }) }
    }
    let count = 0, raf = 0, t = 0
    const portals = () => [
      { id: 'roman' as CharacterId, x: W * 0.2, y: H * 0.62, r: Math.min(W, H) * 0.13 },
      { id: 'reenu' as CharacterId, x: W * 0.8, y: H * 0.62, r: Math.min(W, H) * 0.13 },
    ]

    const tick = () => {
      raf = requestAnimationFrame(tick)
      t += 1 / 60
      g.clearRect(0, 0, W, H)
      // steering
      if (keys.size) {
        if (keys.has('ArrowLeft')) target.x -= 9
        if (keys.has('ArrowRight')) target.x += 9
        if (keys.has('ArrowUp')) target.y -= 9
        if (keys.has('ArrowDown')) target.y += 9
        target.x = Math.max(0, Math.min(W, target.x)); target.y = Math.max(0, Math.min(H, target.y))
      } else if (auto) {
        autoT += 0.012
        const f = food[0]
        target.x = f ? f.x + Math.cos(autoT * 3) * 30 : W / 2 + Math.cos(autoT) * W * 0.3
        target.y = f ? f.y + Math.sin(autoT * 3) * 30 : H / 2 + Math.sin(autoT * 1.3) * H * 0.2
      }
      const h = segs[0]
      const dx = target.x - h.x, dy = target.y - h.y, d = Math.hypot(dx, dy)
      const sp = Math.min(auto ? 6 : 11, d * 0.12)
      if (d > 1) { h.x += (dx / d) * sp + Math.sin(t * 9) * 0.8; h.y += (dy / d) * sp + Math.cos(t * 9) * 0.8 }
      for (let i = 1; i < segs.length; i++) {
        const a = segs[i - 1], b = segs[i]
        const ex = b.x - a.x, ey = b.y - a.y, el = Math.hypot(ex, ey) || 1
        const gap = 9
        b.x = a.x + (ex / el) * gap; b.y = a.y + (ey / el) * gap
      }
      // portals
      if (openRef.current) {
        for (const p of portals()) {
          const pulse = 1 + Math.sin(t * 3) * 0.05
          const gr = g.createRadialGradient(p.x, p.y, p.r * 0.2, p.x, p.y, p.r * 1.6)
          gr.addColorStop(0, 'rgba(255,214,10,0.25)'); gr.addColorStop(1, 'rgba(255,214,10,0)')
          g.fillStyle = gr; g.beginPath(); g.arc(p.x, p.y, p.r * 1.6, 0, 6.283); g.fill()
          g.strokeStyle = '#ffd60a'; g.lineWidth = 3; g.setLineDash([10, 8]); g.lineDashOffset = -t * 40
          g.beginPath(); g.arc(p.x, p.y, p.r * pulse, 0, 6.283); g.stroke(); g.setLineDash([])
          if (!pickedRef.current && Math.hypot(h.x - p.x, h.y - p.y) < p.r * 0.8) { burst(p.x, p.y, 80); choose(p.id) }
        }
      }
      // food
      if (openRef.current && food.length) { food.forEach((f) => burst(f.x, f.y, 14)); food.length = 0 }
      for (let i = food.length - 1; i >= 0; i--) {
        const f = food[i]; f.t += 1 / 60
        const bob = Math.sin(f.t * 3 + i) * 6
        g.save(); g.shadowColor = '#ffd60a'; g.shadowBlur = 22
        g.fillStyle = 'rgba(255,214,10,0.18)'; g.beginPath(); g.arc(f.x, f.y + bob, 26 + Math.sin(f.t * 5) * 3, 0, 6.283); g.fill()
        g.font = '26px system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#fff7c2'
        g.fillText(f.s, f.x, f.y + bob); g.restore()
        if (Math.hypot(h.x - f.x, h.y - f.y - bob) < 34 && !openRef.current) {
          food.splice(i, 1); burst(f.x, f.y); len = Math.min(segs.length, len + 6); count++
          setEaten(count)
          if (count >= GOAL) { unlock(); burst(W * 0.2, H * 0.62, 60); burst(W * 0.8, H * 0.62, 60) }
          else spawn()
        }
      }
      // python body: glow pass + solid pass, tapering
      g.lineCap = 'round'; g.lineJoin = 'round'
      for (const pass of [0, 1]) {
        for (let i = len - 1; i > 0; i--) {
          const a = segs[i], b = segs[i - 1], k = 1 - i / len
          g.strokeStyle = pass === 0 ? 'rgba(255,214,10,0.18)' : i % 4 < 2 ? '#ffd60a' : '#e8b800'
          g.lineWidth = (pass === 0 ? 34 : 18) * (0.35 + k * 0.65)
          g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke()
        }
      }
      // head
      const nx = segs[0].x - segs[2].x, ny = segs[0].y - segs[2].y, nl = Math.hypot(nx, ny) || 1
      const fx = nx / nl, fy = ny / nl, px_ = -fy, py_ = fx
      g.save(); g.translate(h.x, h.y); g.rotate(Math.atan2(fy, fx))
      g.fillStyle = '#ffd60a'; g.strokeStyle = '#111'; g.lineWidth = 2
      g.beginPath(); g.ellipse(4, 0, 22, 15, 0, 0, 6.283); g.fill(); g.stroke()
      if (Math.sin(t * 7) > 0.3) { g.strokeStyle = '#ff2d4b'; g.lineWidth = 2.4; g.beginPath(); g.moveTo(24, 0); g.lineTo(36, 0); g.lineTo(42, -5); g.moveTo(36, 0); g.lineTo(42, 5); g.stroke() }
      g.restore()
      for (const s of [-1, 1]) { g.fillStyle = '#b3102a'; g.beginPath(); g.arc(h.x + fx * 10 + px_ * 7 * s, h.y + fy * 10 + py_ * 7 * s, 3.4, 0, 6.283); g.fill() }
      // particles
      for (let i = parts.length - 1; i >= 0; i--) {
        const q = parts[i]; q.x += q.vx; q.y += q.vy; q.vy += 0.05; q.life -= 0.02
        if (q.life <= 0) { parts.splice(i, 1); continue }
        g.globalAlpha = q.life; g.fillStyle = q.c; g.fillRect(q.x, q.y, 3, 3)
      }
      g.globalAlpha = 1
    }
    raf = requestAnimationFrame(tick)
    return () => { cancelAnimationFrame(raf); removeEventListener('resize', size); removeEventListener('pointermove', move); removeEventListener('pointerdown', move); removeEventListener('keydown', kd); removeEventListener('keyup', ku) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [still])

  return (
    <main className="gate" data-open={open} data-picked={picked ?? ''}>
      <FireBackdrop intensity={0.65} focus={[0.5, 0.55]} seed={5} />
      <canvas ref={cv} className="gate-canvas" aria-hidden="true" />
      <header className="gate-head">
        <p className="mono">BEFORE YOU ENTER</p>
        <h1 className="display">{open ? 'Pick your guide.' : 'Feed the python.'}</h1>
        <p className="serif">{open ? 'Steer the python into Roman or Reenu — or just click one. Both are AI guides.' : 'It already ate my name. Move your mouse, drag a finger or use the arrow keys.'}</p>
        {!open && (
          <div className="gate-meter mono" aria-live="polite">
            <span>{eaten}/{GOAL} snacks</span>
            <i><b style={{ transform: `scaleX(${eaten / GOAL})` }} /></i>
            <button onClick={unlock}>skip the game →</button>
          </div>
        )}
      </header>
      {open && (['roman', 'reenu'] as CharacterId[]).map((id) => (
        <button key={id} className={`portal portal-${id}`} onClick={() => choose(id)} data-on={picked === id} aria-label={`Meet ${characters[id].name}, an AI guide`} style={{ ['--accent' as string]: characters[id].accent }}>
          <span className="portal-face"><InkCharacter config={characters[id]} state={picked === id ? 'GREETING' : 'IDLE'} height="34vh" track={false} /></span>
          <span className="portal-name display">{characters[id].name}</span>
          <span className="mono portal-tag">{id === 'roman' ? 'HIM · dry wit' : 'HER · warm & curious'}</span>
        </button>
      ))}
      <p className="gate-foot mono">AI guides, not people. Your pick is remembered on this device only.</p>
    </main>
  )
}
