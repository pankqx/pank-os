import { useEffect, useRef, useState } from 'react'
import type { ArtKey } from '../content/types'

/** One bespoke composition per featured project. All illustrative data is labelled as such. */

const qr = (n = 17) => {
  const cells: boolean[] = []
  const finder = (x: number, y: number) => (x < 5 && y < 5) || (x >= n - 5 && y < 5) || (x < 5 && y >= n - 5)
  for (let y = 0; y < n; y++)
    for (let x = 0; x < n; x++) {
      const h = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453
      cells.push(finder(x, y) ? (x % 4 !== 0 && x % 4 !== 3 ? true : y % 4 !== 1) || (x === 0 || y === 0) : h - Math.floor(h) > 0.5)
    }
  return cells
}

function useInView<T extends Element>() {
  const ref = useRef<T>(null)
  const [seen, setSeen] = useState(false)
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setSeen(true), { threshold: 0.35 })
    if (ref.current) io.observe(ref.current)
    return () => io.disconnect()
  }, [])
  return [ref, seen] as const
}

function EventzeeArt() {
  const [ref, seen] = useInView<HTMLDivElement>()
  const labels = ['HACKATHON', 'WORKSHOP', 'FEST', 'QUIZ', 'TALK', 'SPORTS']
  const cells = qr()
  return (
    <div ref={ref} className="art art-ez" data-ordered={seen} role="img" aria-label="Illustration: scattered event names snapping into an ordered list beside a QR ticket">
      <div className="ez-chaos">
        {labels.map((l, i) => (
          <span key={l} style={{ ['--i' as string]: i, ['--r' as string]: `${(i * 37) % 50 - 25}deg`, ['--x' as string]: `${(i * 53) % 90}px`, ['--y' as string]: `${(i * 29) % 70 - 30}px` }}>{l}</span>
        ))}
      </div>
      <div className="ez-ticket">
        <div className="ez-stub mono">ADMIT ONE<br /><b>STUDENT</b></div>
        <svg viewBox="0 0 17 17" shapeRendering="crispEdges" className="ez-qr" aria-hidden="true">
          {cells.map((on, i) => on && <rect key={i} x={i % 17} y={Math.floor(i / 17)} width="1" height="1" />)}
        </svg>
        <div className="ez-note mono dim">illustration · not a real ticket</div>
      </div>
    </div>
  )
}

function ParohArt() {
  return (
    <div className="art art-paroh" role="img" aria-label="Illustration: a journal entry stored as a Markdown file with frontmatter">
      <div className="paper">
        <div className="paper-path mono">~/Paroh/2026-10/2026-10-03.md</div>
        <pre className="mono">{`---
mood: calm
tags: [sample, illustration]
---
`}</pre>
        <p className="hand">a day is one file.<br />open it in any editor.<span className="caret" /></p>
        <div className="paper-foot mono">sample entry · the file format is real, the words are not</div>
      </div>
    </div>
  )
}

function TwinArt() {
  const [facts, setFacts] = useState([
    { t: 'has a lab report due Friday', ok: false },
    { t: 'prefers studying at night', ok: false },
    { t: 'wants to ship a side project', ok: false },
  ])
  const approved = facts.filter((f) => f.ok).length
  return (
    <div className="art art-twin">
      <svg viewBox="0 0 220 220" className="twin-sky" role="img" aria-label={`${approved} of 3 sample facts approved, shown as stars`}>
        <circle cx="110" cy="130" r="26" fill="none" stroke="currentColor" strokeWidth="1.4" />
        <path d="M70 200c6-34 24-42 40-42s34 8 40 42" fill="none" stroke="currentColor" strokeWidth="1.4" />
        {[[40, 40], [175, 55], [150, 20]].map(([x, y], i) => (
          <g key={i} className={facts[i].ok ? 'star on' : 'star'} transform={`translate(${x} ${y})`}>
            <path d="M0-12 3-3 12 0 3 3 0 12-3 3-12 0-3-3Z" />
          </g>
        ))}
      </svg>
      <ul className="twin-facts mono">
        {facts.map((f, i) => (
          <li key={f.t} data-ok={f.ok}>
            <span>{f.t}</span>
            <button onClick={() => setFacts(facts.map((x, j) => (j === i ? { ...x, ok: !x.ok } : x)))} aria-pressed={f.ok}>
              {f.ok ? 'approved ✓' : 'approve?'}
            </button>
          </li>
        ))}
      </ul>
      <p className="mono dim twin-cap">sample facts · nothing becomes a star until you approve it</p>
    </div>
  )
}

function FlowArt() {
  return (
    <div className="art art-flow" role="img" aria-label="Concept sketch: a speech waveform becoming slide frames">
      <div className="wave" aria-hidden="true">
        {Array.from({ length: 28 }, (_, i) => <i key={i} style={{ ['--d' as string]: `${i * 70}ms`, ['--h' as string]: `${20 + ((i * 37) % 70)}%` }} />)}
      </div>
      <div className="frames" aria-hidden="true">
        <div /><div /><div />
      </div>
      <p className="mono flow-cap">CONCEPT — nothing here is built. The repo holds a licence and a promise.</p>
    </div>
  )
}

const SUITS = ['♠', '♥', '♦', '♣']
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']
const hex = (b: ArrayBuffer) => [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, '0')).join('')
async function sha(s: string) {
  return hex(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)))
}

function PeeceArt() {
  const [deck, setDeck] = useState<string[] | null>(null)
  const [seal, setSeal] = useState('')
  const [check, setCheck] = useState('')
  const canCrypto = typeof crypto !== 'undefined' && !!crypto.subtle
  const shuffle = async () => {
    const d = SUITS.flatMap((s) => RANKS.map((r) => r + s))
    const rnd = new Uint32Array(d.length)
    crypto.getRandomValues(rnd)
    for (let i = d.length - 1; i > 0; i--) { const j = rnd[i] % (i + 1); [d[i], d[j]] = [d[j], d[i]] }
    setDeck(d); setCheck(''); setSeal(await sha(d.join(',')))
  }
  const verify = async () => deck && setCheck((await sha(deck.join(','))) === seal ? 'match — the deck did not change after sealing' : 'MISMATCH')
  return (
    <div className="art art-peece">
      <div className="card-back" aria-hidden="true"><span>♠</span></div>
      <div className="peece-ui mono">
        <button onClick={shuffle} disabled={!canCrypto}>1 · shuffle &amp; seal a deck</button>
        <code className="hash" aria-live="polite">{seal ? `SHA-256 ${seal.slice(0, 24)}…` : 'no deck sealed yet'}</code>
        <button onClick={verify} disabled={!deck}>2 · reveal &amp; verify</button>
        <p className="verdict" aria-live="polite">{check}</p>
        {deck && check && <p className="dim deck">{deck.slice(0, 8).join(' ')} …</p>}
        <p className="dim cap">This runs in your browser with WebCrypto — the same idea PEECE uses before every bet.</p>
      </div>
    </div>
  )
}

function BrownieArt() {
  return (
    <div className="art art-brownie" role="img" aria-label="Illustration: a consolidated WhatsApp order message built from a cart">
      <div className="wa">
        <p className="mono dim">to: the owner · via WhatsApp</p>
        <p>Hi! I’d like to order:</p>
        <p>• Brownie box (sample) ×2<br />• Brownie box (sample) ×1</p>
        <p>Delivery: Mangaluru<br />Estimated total: ₹— </p>
        <p className="mono dim sm">Nothing is sent automatically. The owner confirms on WhatsApp.</p>
      </div>
      <p className="mono dim cap">sample message · real menu and prices are not published yet</p>
    </div>
  )
}

export function Art({ kind }: { kind: ArtKey }) {
  switch (kind) {
    case 'eventzee': return <EventzeeArt />
    case 'paroh': return <ParohArt />
    case 'twin': return <TwinArt />
    case 'flow': return <FlowArt />
    case 'peece': return <PeeceArt />
    case 'brownie': return <BrownieArt />
    default: return null
  }
}
