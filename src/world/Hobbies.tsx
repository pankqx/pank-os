import { useEffect, useRef } from 'react'
import { hobbies } from '../content/hobbies'
import { useFx } from '../lib/fx'

/** Hobbies as pieces you can throw around. Keyboard users get a plain list (pieces are buttons that flip to the joke). */
export function Hobbies() {
  const board = useRef<HTMLDivElement>(null)
  const { level } = useFx()

  useEffect(() => {
    const el = board.current
    if (!el) return
    const pieces = Array.from(el.querySelectorAll<HTMLElement>('.piece'))
    const W = () => el.clientWidth, H = () => el.clientHeight
    const cols = W() < 700 ? 2 : 4, rowsN = Math.ceil(pieces.length / cols)
    const st = pieces.map((_, i) => ({ x: ((i % cols) + 0.1 + ((i * 37) % 10) / 40) / (cols - 0.6), y: (Math.floor(i / cols) + ((i * 53) % 10) / 30) / Math.max(1, rowsN - 0.7), r: ((i * 37) % 24) - 12, vx: 0, vy: 0 }))
    st.forEach((q) => { q.x = Math.min(1, q.x); q.y = Math.min(1, q.y) })
    const place = () => pieces.forEach((p, i) => {
      const s = st[i]
      p.style.transform = `translate(${(s.x * (W() - p.offsetWidth)).toFixed(1)}px, ${(s.y * (H() - p.offsetHeight)).toFixed(1)}px) rotate(${s.r.toFixed(1)}deg)`
    })
    place()
    let drag = -1, ox = 0, oy = 0, moved = false
    const down = (e: PointerEvent) => {
      const t = (e.target as HTMLElement).closest('.piece') as HTMLElement | null
      if (!t) return
      drag = pieces.indexOf(t); moved = false
      const r = t.getBoundingClientRect()
      ox = e.clientX - r.left; oy = e.clientY - r.top
      t.setPointerCapture(e.pointerId)
      t.classList.add('lift')
    }
    const move = (e: PointerEvent) => {
      if (drag < 0) return
      const b = el.getBoundingClientRect(), p = pieces[drag]
      const nx = (e.clientX - b.left - ox) / Math.max(1, W() - p.offsetWidth)
      const ny = (e.clientY - b.top - oy) / Math.max(1, H() - p.offsetHeight)
      st[drag].vx = nx - st[drag].x; st[drag].vy = ny - st[drag].y
      st[drag].x = Math.min(1, Math.max(0, nx)); st[drag].y = Math.min(1, Math.max(0, ny))
      st[drag].r = Math.max(-25, Math.min(25, st[drag].vx * 600))
      moved = true
      place()
    }
    const up = () => {
      if (drag < 0) return
      pieces[drag].classList.remove('lift')
      if (moved) pieces[drag].dataset.dragged = '1'
      drag = -1
    }
    el.addEventListener('pointerdown', down)
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    // gentle idle float
    let raf = 0, t0 = performance.now()
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick)
      if (drag >= 0 || level === 'min') return
      const t = (now - t0) / 1000
      pieces.forEach((p, i) => { if (!p.classList.contains('lift')) p.style.translate = `0 ${(Math.sin(t * 1.2 + i) * 4).toFixed(1)}px` })
    }
    raf = requestAnimationFrame(tick)
    addEventListener('resize', place)
    return () => { cancelAnimationFrame(raf); el.removeEventListener('pointerdown', down); window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); removeEventListener('resize', place) }
  }, [level])

  return (
    <div className="hobbies">
      <p className="mono dim">OFF THE CLOCK — drag the pieces around, click one to flip it</p>
      <div className="hobby-board" ref={board}>
        {hobbies.map((h) => (
          <button key={h.name} className="piece" onClick={(e) => { const t = e.currentTarget; if (t.dataset.dragged) { delete t.dataset.dragged; return } t.classList.toggle('flip') }}>
            <span className="front"><span className="ico" aria-hidden="true">{h.icon}</span><b>{h.name}</b></span>
            <span className="back serif">{h.joke}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
