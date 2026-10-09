import { useRef } from 'react'
import { milestones, plinths } from '../content/achievements'

export function Trophy() {
  const room = useRef<HTMLDivElement>(null)
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
        <ul className="plinths" aria-label="Empty plinths">
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

      <div className="ledger">
        <h3 className="mono">THINGS THAT HAVE ACTUALLY HAPPENED</h3>
        <p className="mono dim sm">Participation is not winning, and a certificate is not a trophy. Each row names its source.</p>
        <ul>
          {milestones.map((m) => (
            <li key={m.title}>
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
