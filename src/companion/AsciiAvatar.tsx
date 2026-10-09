import { useEffect, useRef } from 'react'
import type { CharacterConfig } from '../content/characters'
import type { CharState } from './machine'
import { drawAvatar, AV_COLS, AV_ROWS } from './avatar'
import { useFx } from '../lib/fx'

interface Props {
  config: CharacterConfig
  state: CharState
  size?: number // css height px
  look?: number
  className?: string
  label?: string
}

export function AsciiAvatar({ config, state, size = 360, look = 0, className, label }: Props) {
  const ref = useRef<HTMLCanvasElement>(null)
  const stateRef = useRef(state)
  const lookRef = useRef(look)
  stateRef.current = state
  lookRef.current = look
  const { level } = useFx()

  useEffect(() => {
    const canvas = ref.current!
    const ctx = canvas.getContext('2d')!
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const h = size
    const w = Math.round((size * AV_COLS * 0.55) / AV_ROWS)
    canvas.width = w * dpr
    canvas.height = h * dpr
    canvas.style.width = w + 'px'
    canvas.style.height = h + 'px'
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    let raf = 0, visible = true, last = 0
    const t0 = performance.now()
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting })
    io.observe(canvas)
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame)
      if (!visible || document.hidden) return
      const interval = level === 'full' ? 1000 / 24 : 1000 / 12
      if (now - last < interval) return
      last = now
      drawAvatar(ctx, w, h, config, { state: stateRef.current, t: (now - t0) / 1000, look: lookRef.current }, config.accent)
    }
    if (level === 'min') {
      drawAvatar(ctx, w, h, config, { state: stateRef.current, t: 0, look: 0 }, config.accent)
      return () => io.disconnect()
    }
    raf = requestAnimationFrame(frame)
    return () => { cancelAnimationFrame(raf); io.disconnect() }
  }, [config, size, level])

  return <canvas ref={ref} className={className} role="img" aria-label={label ?? `${config.name}, an AI character (placeholder ASCII avatar)`} />
}
