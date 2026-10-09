import { useEffect, useRef } from 'react'
import { AsciiOpening, DURATION } from './engine'
import { useFx } from '../lib/fx'

export function Opening({ onDone }: { onDone: () => void }) {
  const ref = useRef<HTMLCanvasElement>(null)
  const { level, downgrade } = useFx()
  const doneRef = useRef(false)
  const startRef = useRef(performance.now())

  const finish = () => {
    if (doneRef.current) return
    doneRef.current = true
    onDone()
  }

  useEffect(() => {
    const canvas = ref.current!
    const ctx = canvas.getContext('2d', { alpha: false })!
    const lite = level !== 'full'
    const dpr = Math.min(window.devicePixelRatio || 1, lite ? 1 : 2)
    const baseCell = window.innerWidth < 700 ? 12 : 15
    const cellSize = lite ? Math.round(baseCell * 1.45) : baseCell
    let eng: AsciiOpening | null = null

    const size = () => {
      const w = window.innerWidth, h = window.innerHeight
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      canvas.style.width = w + 'px'
      canvas.style.height = h + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      if (eng) eng.resize(w, h, cellSize)
      else eng = new AsciiOpening(w, h, cellSize)
    }
    size()
    const e = eng!

    Promise.all([document.fonts.load('900 100px "Archivo Variable"'), document.fonts.load('15px "JetBrains Mono Variable"')])
      .then(() => e.setFontReady())
      .catch(() => {})

    const pointer = { x: 0, y: 0, active: false }
    const move = (ev: PointerEvent) => { pointer.x = ev.clientX; pointer.y = ev.clientY; pointer.active = true }
    const leave = () => { pointer.active = false }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerleave', leave)
    window.addEventListener('resize', size)

    let raf = 0
    let stopped = false
    let slow = 0
    let last = performance.now()
    const t0 = startRef.current

    if (level === 'min') {
      // Reduced motion / minimum effects: one composed frame, no animation.
      const draw = () => e.renderStatic(ctx)
      draw()
      document.fonts.ready.then(() => { e.setFontReady(); draw() })
      const id = window.setTimeout(finish, 1800)
      return () => { clearTimeout(id); window.removeEventListener('pointermove', move); window.removeEventListener('pointerleave', leave); window.removeEventListener('resize', size) }
    }

    const loop = (now: number) => {
      if (stopped) return
      const dt = now - last
      last = now
      const t = (now - t0) / 1000
      if (dt > 34) slow++
      else slow = Math.max(0, slow - 1)
      if (slow > 25) { slow = 0; downgrade() }
      e.render(ctx, Math.min(t, DURATION), pointer, lite ? 'lite' : 'full')
      if (t > DURATION + 0.6) { finish(); return }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    return () => {
      stopped = true
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerleave', leave)
      window.removeEventListener('resize', size)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level])

  useEffect(() => {
    const key = (ev: KeyboardEvent) => {
      if (ev.key === 'Enter' || ev.key === ' ' || ev.key === 'Escape') { ev.preventDefault(); finish() }
    }
    window.addEventListener('keydown', key)
    return () => window.removeEventListener('keydown', key)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="opening" role="presentation">
      <h1 className="sr-only">K S PANKAJ — The Human Experiment</h1>
      <canvas ref={ref} aria-hidden="true" />
      <div className="opening-meta mono" aria-hidden="true">
        <span>SOUND: OFF</span>
        <span>{level === 'full' ? 'FX: FULL' : level === 'lite' ? 'FX: LITE' : 'FX: STILL'}</span>
      </div>
      <button className="skip mono" onClick={finish} autoFocus>
        SKIP <span aria-hidden="true">▸</span>
      </button>
    </div>
  )
}
