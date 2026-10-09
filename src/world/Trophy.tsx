import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { Fireworks, type FireworksHandle } from '../fx/Fireworks'
import { useFx } from '../lib/fx'
import { ErrorBoundary } from '../lib/ErrorBoundary'
import { milestones, plinths } from '../content/achievements'

const TrophyScene = lazy(() => import('./TrophyScene'))

export function Trophy() {
  const room = useRef<HTMLDivElement>(null)
  const { level, webgl } = useFx()
  const [failed, setFailed] = useState(false)
  const use3d = level === 'full' && webgl && !failed
  const fw = useRef<FireworksHandle>(null)
  const ledger = useRef<HTMLDivElement>(null)
  const [cheers, setCheers] = useState(0)
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { fw.current?.show(5); io.disconnect() } }, { threshold: 0.35 })
    if (ledger.current) io.observe(ledger.current)
    return () => io.disconnect()
  }, [])
  const pop = (e: React.PointerEvent | React.FocusEvent, big = false) => {
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect()
    fw.current?.burst(r.left + 60, r.top + r.height / 2, big)
  }
  const jokes = ['Celebrate anyway', 'Again?', 'Okay, one more', 'This is a lot of fireworks for zero trophies', 'He’ll win something eventually', 'Fine. Unlimited fireworks.']
  const move = (e: React.PointerEvent) => {
    const r = room.current!.getBoundingClientRect()
    room.current!.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`)
    room.current!.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`)
  }
  return (
    <section id="trophy" className="chapter trophy" aria-labelledby="trophy-h">
      <div className="room" ref={room} onPointerMove={move}>
        <p className="mono dim">CHAPTER IV</p>
        <h2 id="trophy-h" className="display">The Trophy Room</h2>
        <p className="serif lead">Under construction. Apparently the trophies require evidence.</p>
        {use3d && (
          <ErrorBoundary label="the 3D room" fallback={null}>
            <Suspense fallback={null}><TrophyScene onFail={() => setFailed(true)} /></Suspense>
          </ErrorBoundary>
        )}
        <ul className="plinths" data-3d={use3d} aria-label="Empty plinths">
          {plinths.map((p, i) => (
            <li key={p.label} style={{ ['--i' as string]: i }}>
              <svg viewBox="0 0 120 150" aria-hidden="true">
                <path d="M30 10h60v8H30z" /><path d="M20 18h80v116H20z" /><path d="M10 134h100v10H10z" />
              </svg>
              <span className="mono plaque">{p.label}</span>
              <span className="mono dim sm">{p.caption}</span>
            </li>
          ))}
        </ul>
      </div>

      <Fireworks ref={fw} />
      <div className="ledger" ref={ledger}>
        <h3 className="mono">THINGS THAT HAVE ACTUALLY HAPPENED</h3>
        <p className="mono dim sm">Participation is not winning, and a certificate is not a trophy. Each row names its source. Hover a row: small crackers for small wins.</p>
        <button className="cheer mono" onClick={() => { fw.current?.show(7); setCheers((c) => c + 1) }}>🎆 {jokes[Math.min(cheers, jokes.length - 1)]}</button>
        <ul>
          {milestones.map((m) => (
            <li key={m.title} onPointerEnter={(e) => pop(e)} onFocus={(e) => pop(e)} tabIndex={0}>
              <span className="mono badge" data-kind={m.kind}>{m.kind}</span>
              <span className="serif">{m.title}</span>
              <span className="mono dim">{m.detail}{m.when ? ` (${m.when})` : ''} · <i>{m.source}</i></span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
