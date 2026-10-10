import { useCallback, useEffect, useRef, useState } from 'react'
import { HorizontalScene, useSceneProgress } from '../fx/HorizontalScene'
import { clamp } from '../fx/ticker'
import { useFx } from '../lib/fx'

/**
 * "One line." — the opening chapter. A single glowing yellow line runs through a horizontal film:
 * as you scroll, it draws a film clapper, a graph of ideas, a crashing chart, a chess knight, a laptop
 * and finally my monogram. One line, everything I make.
 */
interface Panel {
  word: string
  kicker: string
  title: string
  sub: string
  d: string
  extras?: (k: number) => React.ReactNode
}

const node = (x: number, y: number, r: number) => `L${x - r} ${y} a${r} ${r} 0 1 0 ${2 * r} 0 a${r} ${r} 0 1 0 ${-2 * r} 0 M${x - r} ${y}`

const PANELS: Panel[] = [
  {
    word: 'LINE', kicker: '00 — PROLOGUE', title: 'One line.', sub: 'Everything I make starts the same way — with a single line.',
    d: 'M0 620 L330 620 L370 560 L410 700 L450 580 L480 620 L560 620 L640 520 L730 600 L640 680 L780 690 L900 690 L900 640 L1000 620',
  },
  {
    word: 'SCRIPTS', kicker: '01 — 2:47 AM', title: 'It becomes a story.', sub: 'I write short films at midnight. This site is one of them.',
    d: 'M0 620 C200 620 360 620 520 620 L520 470 L500 380 L560 372 L590 455 L620 450 L590 365 L650 357 L680 440 L710 435 L680 352 L740 344 L770 425 L800 420 L770 340 L860 330 L880 410 L520 470 L880 470 L880 720 L520 720 L520 620 C520 780 820 800 1000 620',
    extras: (k) => (
      <g opacity={k > 0.85 ? 1 : 0} className="ol-fade">
        <text x="545" y="540" className="ol-mono">SCENE 07 · TAKE 03</text>
        <text x="545" y="590" className="ol-mono">DIR. PANKAJ</text>
        <text x="545" y="640" className="ol-mono">“make it weird.”</text>
      </g>
    ),
  },
  {
    word: 'GRAPH', kicker: '02 — HOW I THINK', title: 'It becomes a graph.', sub: 'Every idea links to three others. Two of them turn into projects.',
    d: `M0 620 C220 620 380 560 548 520 ${node(560, 520, 12)} L692 556 ${node(720, 560, 28)} L720 532 L720 432 ${node(720, 420, 12)} L720 432 L720 532 L848 540 ${node(860, 540, 12)} L848 540 L748 560 L755 668 ${node(760, 680, 12)} L748 680 L612 690 ${node(600, 690, 12)} L588 690 L560 532 M612 690 C760 820 900 720 1000 620`,
    extras: (k) => (
      <g opacity={k > 0.85 ? 1 : 0} className="ol-fade">
        {[['ideas', 720, 610], ['ProntoPy', 560, 492], ['Paroh', 720, 392], ['PEECE', 860, 512], ['chess', 760, 720], ['3 AM', 600, 730]].map(([t, x, y]) => (
          <text key={t as string} x={x as number} y={y as number} textAnchor="middle" className="ol-label">{t}</text>
        ))}
      </g>
    ),
  },
  {
    word: 'CRASH', kicker: '03 — A LESSON', title: 'It becomes a chart.', sub: 'I traded. It went up. Then my feelings started placing the orders.',
    d: 'M0 620 L470 620 L520 600 L560 612 L600 562 L640 574 L680 502 L720 522 L760 432 L790 396 L800 410 L830 700 L850 668 L880 712 L900 690 L1000 620',
    extras: (k) => (
      <g opacity={k > 0.85 ? 1 : 0} className="ol-fade">
        <text x="740" y="370" className="ol-label">“I’m a genius.”</text>
        <text x="760" y="760" className="ol-label red">feelings.exe</text>
      </g>
    ),
  },
  {
    word: 'CHECK', kicker: '04 — NOW', title: 'It becomes a knight.', sub: 'So now I play chess instead. I sacrifice the queen. On purpose. Mostly.',
    d: 'M0 620 C260 620 420 720 570 720 L870 720 L870 690 L840 680 L820 640 L800 560 C790 500 820 460 840 420 C850 390 830 360 790 350 L770 318 L750 352 C700 350 640 390 610 440 L560 500 L575 530 L620 520 C650 520 680 500 700 510 C680 560 640 600 640 660 L620 680 L600 690 L570 690 L570 720 C700 820 900 760 1000 620',
    extras: (k) => <circle cx="690" cy="430" r="9" className="ol-dot" opacity={k > 0.85 ? 1 : 0} />,
  },
  {
    word: 'BUILD', kicker: '05 — ALWAYS', title: 'It becomes a product.', sub: 'Websites that feel like places. Digital products people open twice.',
    d: 'M0 620 C260 620 400 690 520 680 L900 680 L860 640 L560 640 L520 680 L560 640 L560 420 L860 420 L860 640 L680 470 L640 530 L680 590 L720 600 L760 460 L800 470 L840 530 L800 590 C860 700 940 680 1000 620',
  },
  {
    word: 'INSIDE', kicker: '06 — HELLO', title: 'It becomes me.', sub: 'Okay, enough showing off. Let me show you the inside ↓',
    d: 'M0 620 C220 620 400 760 520 760 L520 360 C760 340 800 380 800 460 C800 560 700 580 520 570',
    extras: (k) => <g opacity={k > 0.95 ? 1 : 0} className="ol-fade"><circle cx="520" cy="570" r="12" className="ol-dot spark" /><text x="830" y="520" className="ol-label">P, for Pankaj.</text></g>,
  },
]

function PanelArt({ i, panel }: { i: number; panel: Panel }) {
  const path = useRef<SVGPathElement>(null)
  const glow = useRef<SVGPathElement>(null)
  const head = useRef<SVGGElement>(null)
  const trail = useRef<SVGGElement>(null)
  const wrap = useRef<HTMLDivElement>(null)
  const [k, setK] = useState(0)
  const kRef = useRef(0)
  const { level } = useFx()
  const intro = useRef(i === 0 ? 0 : 1)
  const narrow = typeof window !== 'undefined' && window.innerWidth < 760

  const apply = useCallback((local: number) => {
    const el = path.current
    if (!el) return
    const v = clamp(i === 0 ? Math.max(local, intro.current) : local)
    if (Math.abs(v - kRef.current) < 0.002 && v !== 0 && v !== 1) return
    kRef.current = v
    el.style.strokeDashoffset = String(1 - v)
    glow.current!.style.strokeDashoffset = String(1 - v)
    const L = el.getTotalLength()
    const p = el.getPointAtLength(L * v)
    head.current!.setAttribute('transform', `translate(${p.x} ${p.y})`)
    head.current!.style.opacity = v > 0.001 && v < 0.999 ? '1' : '0'
    Array.from(trail.current!.children).forEach((c, n) => {
      const q = el.getPointAtLength(Math.max(0, L * v - (n + 1) * 14))
      c.setAttribute('cx', String(q.x)); c.setAttribute('cy', String(q.y))
      ;(c as SVGElement).style.opacity = head.current!.style.opacity === '1' ? String(0.8 - n * 0.12) : '0'
    })
    wrap.current!.style.setProperty('--k', v.toFixed(3))
    setK((old) => (Math.abs(old - v) > 0.04 || v === 1 || v === 0 ? v : old))
  }, [i])

  useSceneProgress(useCallback((p: number) => {
    const n = PANELS.length - 1
    const local = level === 'min' ? 1 : clamp((p * n - i + 0.75) / 0.8)
    apply(local)
  }, [apply, i, level]))

  // the very first panel draws itself once on arrival
  useEffect(() => {
    if (i !== 0) return
    if (level === 'min') { intro.current = 1; apply(1); return }
    let raf = 0
    const t0 = performance.now()
    const f = (now: number) => { intro.current = Math.min(1, (now - t0) / 1800); apply(0); if (intro.current < 1) raf = requestAnimationFrame(f) }
    raf = requestAnimationFrame(f)
    return () => cancelAnimationFrame(raf)
  }, [i, level, apply])

  return (
    <div className="ol-panel" ref={wrap}>
      <span className="ol-word display" data-speed={i % 2 ? '-0.08' : '0.1'} aria-hidden="true">{panel.word}</span>
      <div className="ol-copy">
        <p className="mono ol-kicker">{panel.kicker}</p>
        <h3 className="display ol-title">{panel.title}</h3>
        <p className="serif ol-sub"><span>{panel.sub}</span></p>
      </div>
      <svg className="ol-svg" viewBox={narrow ? '420 280 560 560' : '0 0 1000 1000'} preserveAspectRatio={narrow ? 'xMidYMid meet' : 'xMidYMid slice'} aria-hidden="true">
        <path ref={glow} d={panel.d} pathLength={1} className="ol-glow" />
        <path ref={path} d={panel.d} pathLength={1} className="ol-path" />
        {panel.extras?.(k)}
        <g ref={trail}>{[0, 1, 2, 3, 4, 5].map((n) => <circle key={n} r={4 - n * 0.5} className="ol-trail" />)}</g>
        <g ref={head} className="ol-head"><circle r="18" className="ol-halo" /><circle r="6" /></g>
      </svg>
    </div>
  )
}

function Progress() {
  const bar = useRef<HTMLElement>(null)
  const num = useRef<HTMLSpanElement>(null)
  useSceneProgress(useCallback((p: number) => {
    if (bar.current) bar.current.style.transform = `scaleX(${p})`
    if (num.current) num.current.textContent = String(Math.round(p * (PANELS.length - 1))).padStart(2, '0')
  }, []))
  return (
    <div className="ol-progress mono" aria-hidden="true">
      <span ref={num}>00</span> / {String(PANELS.length - 1).padStart(2, '0')}
      <i><b ref={bar} /></i>
      <em>scroll ↓ — the line goes sideways</em>
    </div>
  )
}

export function OneLine() {
  return (
    <HorizontalScene id="person" label="Chapter I: one line that becomes everything I make" className="oneline" overlay={<Progress />} tail={0.1}>
      {PANELS.map((p, i) => <PanelArt key={p.word} i={i} panel={p} />)}
    </HorizontalScene>
  )
}
