import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { useFx } from '../lib/fx'
import { ErrorBoundary } from '../lib/ErrorBoundary'
import { Fireworks, type FireworksHandle } from '../fx/Fireworks'
import { milestones } from '../content/achievements'

const TrophyScene = lazy(() => import('./TrophyScene'))

function TrophySvg() {
  return (
    <svg className="trophy-svg" viewBox="0 0 300 400" aria-hidden="true">
      <defs><linearGradient id="gold" x1="0" x2="1"><stop offset="0" stopColor="#8a5a00" /><stop offset="0.45" stopColor="#ffd86b" /><stop offset="0.6" stopColor="#fff2c2" /><stop offset="1" stopColor="#b07a00" /></linearGradient></defs>
      <path d="M70 40 H230 C230 150 200 200 150 210 C100 200 70 150 70 40 Z" fill="url(#gold)" />
      <path d="M70 60 C20 60 20 140 85 150 M230 60 C280 60 280 140 215 150" fill="none" stroke="url(#gold)" strokeWidth="12" />
      <rect x="138" y="208" width="24" height="70" fill="url(#gold)" />
      <rect x="95" y="278" width="110" height="30" fill="url(#gold)" />
      <rect x="75" y="308" width="150" height="40" fill="#1a1410" />
      <path d="M150 10 l8 16 18 3 -13 12 3 18 -16 -8 -16 8 3 -18 -13 -12 18 -3 Z" fill="#ffd60a" />
    </svg>
  )
}

export function Trophy() {
  const { level, webgl } = useFx()
  const [failed, setFailed] = useState(false)
  const use3d = level === 'full' && webgl && !failed
  const fw = useRef<FireworksHandle>(null)
  const ledger = useRef<HTMLDivElement>(null)
  const room = useRef<HTMLDivElement>(null)
  const [cheers, setCheers] = useState(0)
  const fail = useCallback(() => setFailed(true), [])
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { fw.current?.show(6); io.disconnect() } }, { threshold: 0.3 })
    if (room.current) io.observe(room.current)
    return () => io.disconnect()
  }, [])
  const pop = (e: React.PointerEvent | React.FocusEvent) => {
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect()
    fw.current?.burst(r.left + 60, r.top + r.height / 2)
  }
  const jokes = ['Celebrate anyway', 'Again?', 'Okay, one more', 'This is a lot of fireworks for zero trophies', 'The royal one is coming, relax', 'Fine. Unlimited fireworks.']

  return (
    <section id="trophy" className="chapter trophy" aria-labelledby="trophy-h">
      <Fireworks ref={fw} />
      <div className="royal" ref={room}>
        <div className="royal-copy">
          <p className="mono dim">CHAPTER IV — THE TROPHY ROOM</p>
          <h2 id="trophy-h" className="display">The Royal Trophy<br /><span className="outline">is in the making.</span></h2>
          <p className="serif lead">Size: huge. Material: effort. Status: being earned, one commit at a time. Until it arrives, here it is anyway — so you know what it’ll look like.</p>
          <button className="cheer mono" onClick={() => { fw.current?.show(8); setCheers((c) => c + 1) }}>🎆 {jokes[Math.min(cheers, jokes.length - 1)]}</button>
        </div>
        <div className="royal-stage">
          <div className="royal-glow" aria-hidden="true" />
          {use3d ? (
            <ErrorBoundary label="the 3D trophy" fallback={<TrophySvg />}>
              <Suspense fallback={<TrophySvg />}><TrophyScene onFail={fail} /></Suspense>
            </ErrorBoundary>
          ) : <TrophySvg />}
          <p className="mono plaque">ROYAL TROPHY · ENGRAVING PENDING</p>
        </div>
      </div>

      <div className="ledger" ref={ledger}>
        <h3 className="mono">THINGS THAT HAVE ACTUALLY HAPPENED</h3>
        <p className="mono dim sm">Participation is not winning, unverified is labelled unverified, and a certificate is not a trophy. Hover a row: small crackers for small wins.</p>
        <ul>
          {milestones.map((m) => (
            <li key={m.title} onPointerEnter={pop} onFocus={pop} tabIndex={0}>
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
