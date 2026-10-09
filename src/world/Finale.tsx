import { useCallback, useEffect, useRef } from 'react'
import { HorizontalScene, useSceneProgress } from '../fx/HorizontalScene'
import { InkCharacter, svgToImage, type InkHandle } from '../character/InkCharacter'
import { CharacterStage } from '../companion/CharacterStage'
import type { Conversation } from '../companion/useConversation'
import { clamp, smooth } from '../fx/ticker'
import { useFx } from '../lib/fx'
import { Electric } from '../fx/Electric'

const GLYPHS = '01#%@*+=-:.<>/\\'

/** The AI human arrives at the end: streams of glyphs fly in sideways and assemble into a figure the height of the screen. */
function Arrival({ conv, onSwitch }: { conv: Conversation; onSwitch: () => void }) {
  const frame = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const figure = useRef<HTMLDivElement>(null)
  const chat = useRef<HTMLDivElement>(null)
  const lines = useRef<HTMLDivElement>(null)
  const ink = useRef<InkHandle>(null)
  const pts = useRef<{ tx: number; ty: number; sx: number; sy: number; d: number; c: string; col: number }[]>([])
  const box = useRef({ x: 0, y: 0, w: 0, h: 0, W: 0, H: 0 })
  const greeted = useRef(false)
  const { level } = useFx()

  // sample the drawn character into particle targets
  useEffect(() => {
    let cancelled = false
    const build = async () => {
      const svg = ink.current?.svg, fr = frame.current, cv = canvas.current
      if (!svg || !fr || !cv) return
      const fb = fr.getBoundingClientRect(), sb = svg.getBoundingClientRect()
      const W = fb.width, H = fb.height
      const dpr = Math.min(devicePixelRatio || 1, 1.5)
      cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + 'px'; cv.style.height = H + 'px'
      cv.getContext('2d')!.setTransform(dpr, 0, 0, dpr, 0, 0)
      box.current = { x: sb.left - fb.left, y: sb.top - fb.top, w: sb.width, h: sb.height, W, H }
      try {
        const step = level === 'full' ? 7 : 11
        const img = await svgToImage(svg, Math.round(sb.width / step), Math.round(sb.height / step))
        if (cancelled) return
        const off = document.createElement('canvas')
        off.width = img.width; off.height = img.height
        const g = off.getContext('2d')!
        g.drawImage(img, 0, 0)
        const d = g.getImageData(0, 0, off.width, off.height).data
        const out: typeof pts.current = []
        for (let y = 0; y < off.height; y++) for (let x = 0; x < off.width; x++) {
          const i = (y * off.width + x) * 4
          if (d[i + 3] < 60) continue
          const lum = (d[i] + d[i + 1] + d[i + 2]) / 765
          if (lum < 0.09 && Math.random() < 0.55) continue
          out.push({
            tx: box.current.x + x * step, ty: box.current.y + y * step,
            sx: Math.random(), sy: Math.random() * H,
            d: Math.random(), c: GLYPHS[(x * 7 + y * 13) % GLYPHS.length], col: lum,
          })
        }
        pts.current = out
      } catch (err) { console.warn("[finale] particle build failed", err) }
    }
    const t = window.setTimeout(build, 300)
    const ro = new ResizeObserver(() => build())
    if (frame.current) ro.observe(frame.current)
    return () => { cancelled = true; clearTimeout(t); ro.disconnect() }
  }, [conv.cfg.id, level])

  const on = useCallback((p: number) => {
    const cv = canvas.current, fig = figure.current, ch = chat.current
    if (!cv || !fig || !ch) return
    const k = clamp((p - 0.04) / 0.76) // assembly progress
    const L = frame.current!.getBoundingClientRect().left
    const reveal = smooth((p - 0.74) / 0.14)
    fig.style.opacity = reveal.toFixed(3)
    cv.style.opacity = (1 - reveal * 0.85).toFixed(3)
    ch.style.opacity = smooth((p - 0.86) / 0.12).toFixed(3)
    ch.style.pointerEvents = p > 0.9 ? 'auto' : 'none'
    if (lines.current) {
      Array.from(lines.current.children).forEach((el, i) => {
        const a = smooth((p - (0.25 + i * 0.16)) / 0.08) * (1 - smooth((p - (0.38 + i * 0.16)) / 0.06))
        ;(el as HTMLElement).style.opacity = (i === 2 ? smooth((p - 0.57) / 0.08) * (1 - smooth((p - 0.86) / 0.05)) : a).toFixed(3)
      })
    }
    if (p > 0.92 && !greeted.current) { greeted.current = true; conv.greet() }
    const ctx = cv.getContext('2d')!
    const { W, H } = box.current
    ctx.clearRect(0, 0, W, H)
    if (!pts.current.length || reveal >= 1) return
    ctx.font = '9px "JetBrains Mono Variable", monospace'
    ctx.textBaseline = 'middle'
    const accent = conv.cfg.accent
    let lastFill = ''
    for (const q of pts.current) {
      const e = smooth(clamp((k - q.d * 0.45) / 0.55))
      const wob = (1 - e) * Math.sin(q.d * 40 + p * 30) * 30
      const sx = q.sx * innerWidth - L + Math.sin(p * 9 + q.d * 20) * 60
      const x = sx + (q.tx - sx) * e
      const y = q.sy + (q.ty - q.sy) * e + wob
      const fill = e > 0.98 ? (q.col > 0.6 ? '#ece7da' : accent) : q.d > 0.7 ? accent : '#7d807a'
      if (fill !== lastFill) { ctx.fillStyle = fill; lastFill = fill }
      ctx.fillText(e > 0.98 ? (q.col > 0.6 ? '#' : q.c) : q.c, x, y)
    }
  }, [conv])
  useSceneProgress(on)

  return (
    <div className="fin-arrival" ref={frame}>
      <canvas ref={canvas} className="fin-canvas" aria-hidden="true" />
      <div className="fin-lines serif" ref={lines} aria-hidden="true">
        <p>Oh — you scrolled all the way.</p>
        <p>Hold still. I’m assembling.</p>
        <p>I’m {conv.cfg.name}. An AI, not a person — but I read every repo.</p>
      </div>
      <div className="fin-figure" ref={figure}>
        <InkCharacter ref={ink} config={conv.cfg} state={conv.state} height="92vh" label={`${conv.cfg.name}, an AI character, full height`} />
        <Electric bolts={4} />
      </div>
      <div className="fin-chat" ref={chat}>
        <CharacterStage conv={conv} mode="inline" onSwitch={onSwitch} hideCharacter />
      </div>
    </div>
  )
}

export function Finale({ conv, onSwitch }: { conv: Conversation; onSwitch: () => void }) {
  return (
    <HorizontalScene id="meet" label="Finale: meet the AI character" className="finale" tail={0.06}>
      <div className="fin-intro">
        <p className="mono dim">EPILOGUE — ONE MORE THING</p>
        <h2 className="display">You’ve met the human.</h2>
        <p className="display outline">Now meet the other one.</p>
        <p className="mono hint">keep scrolling → something is coming</p>
      </div>
      <Arrival conv={conv} onSwitch={onSwitch} />
    </HorizontalScene>
  )
}
