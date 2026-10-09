/* Hand-drawn (in code) scenes for the story — no photos. Each scene takes k: 0..1 (stop-motion progress). */
export type SceneKey = 'script' | 'graph' | 'chart' | 'chess' | 'code' | 'orbit'

const CREAM = '#f4ede0', INK = '#111', RED = '#d8143a', YEL = '#ffd60a'
const clamp = (v: number) => Math.min(1, Math.max(0, v))
const S = { stroke: INK, strokeWidth: 7, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const }

function Script({ k }: { k: number }) {
  const lines = ['INT. MY ROOM — 2:47 AM', 'A laptop. A cold coffee.', 'A developer stares at the screen.', 'ME (V.O.)', '“Make a normal portfolio?”', '(beat)', '“…No.”']
  const n = Math.round(clamp(k * 1.15) * lines.length)
  return (
    <g>
      <g transform="rotate(-6 300 320)">
        <rect x="120" y="70" width="360" height="470" rx="6" fill={CREAM} {...S} />
        <path d="M120 70 h360 v40 h-360z" fill={RED} {...S} />
        <text x="300" y="98" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="17" fontWeight="700" fill={CREAM}>SHORT FILM · DRAFT 07</text>
        {lines.slice(0, n).map((l, i) => (
          <text key={i} x={i === 3 ? 300 : i === 4 || i === 6 ? 300 : i === 5 ? 300 : 150} y={150 + i * 50} textAnchor={i >= 3 ? 'middle' : 'start'} fontFamily="JetBrains Mono, monospace" fontSize={i === 0 ? 17 : 16} fontWeight={i === 0 || i === 3 ? 800 : 500} fill={INK}>{l}</text>
        ))}
        <rect x={n >= lines.length ? 340 : 150} y={150 + Math.min(n, lines.length - 1) * 50 + 8} width="10" height="20" fill={RED} />
      </g>
      {/* clapperboard */}
      <g transform={`translate(400 420) rotate(${-14 + clamp(k * 3) * 0} )`}>
        <rect x="0" y="40" width="170" height="110" fill={INK} {...S} />
        <g transform={`rotate(${-28 + 28 * clamp(k * 2.2 - 1)} 0 40)`}>
          <rect x="0" y="10" width="170" height="30" fill={CREAM} {...S} />
          {[0, 1, 2, 3].map((i) => <path key={i} d={`M${20 + i * 40} 10 l20 30 h-18 l-20 -30z`} fill={INK} />)}
        </g>
        <text x="85" y="105" textAnchor="middle" fontFamily="Archivo Variable, Impact, sans-serif" fontWeight="900" fontSize="28" fill={YEL}>TAKE 1</text>
      </g>
      {/* pen */}
      <g transform="translate(70 380) rotate(38)"><rect x="0" y="0" width="34" height="200" rx="10" fill={YEL} {...S} /><path d="M0 200 L17 250 L34 200 Z" fill={CREAM} {...S} /></g>
    </g>
  )
}

const NODES: [number, number, string, number][] = [
  [300, 300, 'ideas', 34], [150, 170, 'ProntoPy', 20], [450, 160, 'Paroh', 20], [500, 320, 'PEECE', 18], [430, 470, 'EventZee', 18], [170, 450, 'scripts', 18],
  [95, 300, 'chess', 14], [300, 110, '3 AM', 14], [300, 500, 'friends', 14], [540, 220, 'blog', 12], [70, 140, 'gym', 12], [230, 560, 'cricket', 12], [540, 520, 'trading', 12], [380, 250, 'rizz', 10],
]
const LINKS = [[0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6], [0, 7], [0, 8], [2, 9], [1, 10], [8, 11], [3, 12], [0, 13], [1, 7], [2, 3], [5, 6], [4, 8], [5, 11]]

function Graph({ k }: { k: number }) {
  const shown = Math.round(clamp(k * 1.2) * NODES.length)
  return (
    <g fontFamily="JetBrains Mono, monospace">
      {LINKS.map(([a, b], i) => {
        if (a >= shown || b >= shown) return null
        const A = NODES[a], B = NODES[b]
        return <line key={i} x1={A[0]} y1={A[1]} x2={B[0]} y2={B[1]} stroke={i % 3 === 0 ? YEL : CREAM} strokeWidth={i % 3 === 0 ? 4 : 2.5} opacity={0.9} />
      })}
      {NODES.slice(0, shown).map(([x, y, l, r], i) => (
        <g key={l}>
          <circle cx={x} cy={y} r={r} fill={i === 0 ? RED : CREAM} stroke={INK} strokeWidth={5} />
          {i === 0 && <circle cx={x} cy={y} r={r + 14} fill="none" stroke={YEL} strokeWidth="3" strokeDasharray="6 8" />}
          <text x={x} y={y + r + 22} textAnchor="middle" fontSize={i === 0 ? 22 : 16} fontWeight="700" fill={CREAM} stroke={INK} strokeWidth="4" paintOrder="stroke">{l}</text>
        </g>
      ))}
    </g>
  )
}

const CANDLES = [[360, 330], [340, 300], [310, 320], [300, 260], [270, 285], [255, 220], [230, 240], [215, 170], [180, 195], [175, 140], [180, 470], [460, 520]]
function Chart({ k }: { k: number }) {
  const shown = Math.round(clamp(k * 1.15) * CANDLES.length)
  return (
    <g>
      <rect x="60" y="70" width="480" height="470" rx="10" fill="#160608" {...S} />
      {[0, 1, 2, 3, 4].map((i) => <line key={i} x1="80" x2="520" y1={130 + i * 90} y2={130 + i * 90} stroke="#3a1a1f" strokeWidth="2" />)}
      {CANDLES.slice(0, shown).map(([o, c], i) => {
        const x = 100 + i * 36, up = c < o, top = Math.min(o, c), h = Math.max(8, Math.abs(c - o))
        return (
          <g key={i}>
            <line x1={x + 11} x2={x + 11} y1={top - 18} y2={top + h + 18} stroke={up ? CREAM : RED} strokeWidth="4" />
            <rect x={x} y={top} width="22" height={h} fill={up ? CREAM : RED} stroke={INK} strokeWidth="4" />
          </g>
        )
      })}
      {shown >= 11 && <text x="330" y="430" textAnchor="middle" fontFamily="Archivo Variable, Impact, sans-serif" fontWeight="900" fontSize="44" fill={YEL} stroke={INK} strokeWidth="6" paintOrder="stroke" transform="rotate(-8 330 430)">feelings.exe</text>}
      {shown >= 6 && shown < 11 && <text x="160" y="120" fontFamily="JetBrains Mono, monospace" fontWeight="800" fontSize="22" fill={CREAM}>“I’m a genius.”</text>}
    </g>
  )
}

function Chess({ k }: { k: number }) {
  const fall = clamp(k * 1.6 - 0.3)
  return (
    <g>
      <g transform="translate(70 330) skewX(-18)">
        {Array.from({ length: 16 }, (_, i) => <rect key={i} x={(i % 4) * 110} y={Math.floor(i / 4) * 60} width="110" height="60" fill={(i + Math.floor(i / 4)) % 2 ? INK : CREAM} stroke={INK} strokeWidth="4" />)}
      </g>
      {/* knight */}
      <g transform={`translate(${170 + clamp(k * 2) * 40} ${110 - Math.sin(clamp(k * 2) * Math.PI) * 50})`}>
        <path d="M60 300 L60 250 C40 230 50 190 80 170 C60 150 40 120 70 80 C90 50 130 20 170 40 C200 55 215 95 210 140 C206 180 190 210 170 250 L170 300 Z" fill={CREAM} {...S} />
        <path d="M80 170 C100 160 120 165 135 175" fill="none" {...S} />
        <circle cx="150" cy="80" r="8" fill={INK} />
        <path d="M110 40 L120 10 L140 38" fill={CREAM} {...S} />
        <rect x="40" y="300" width="150" height="34" rx="6" fill={RED} {...S} />
      </g>
      {/* the queen, sacrificed */}
      <g transform={`translate(${410 + fall * 60} ${250 + fall * 200}) rotate(${fall * 95})`} opacity={1 - fall * 0.3}>
        <path d="M-40 90 L-30 20 L-50 -20 L-20 0 L0 -40 L20 0 L50 -20 L30 20 L40 90 Z" fill={RED} {...S} />
        <rect x="-50" y="90" width="100" height="24" rx="6" fill={RED} {...S} />
      </g>
    </g>
  )
}

function Code({ k }: { k: number }) {
  const kick = clamp(k * 1.8 - 0.4)
  const code = ['def ship_it():', '    build()', '    test()  # mostly', '    deploy()', '    celebrate()']
  return (
    <g>
      <rect x="70" y="90" width="460" height="300" rx="16" fill="#0e100f" {...S} />
      <rect x="40" y="390" width="520" height="40" rx="10" fill={CREAM} {...S} />
      {code.map((l, i) => <text key={i} x="100" y={150 + i * 42} fontFamily="JetBrains Mono, monospace" fontSize="22" fill={i === 2 ? YEL : CREAM}>{l}</text>)}
      {kick > 0.6 && <text x="390" y="360" fontFamily="JetBrains Mono, monospace" fontWeight="800" fontSize="22" fill="#c8ff2e">✓ fixed</text>}
      {/* the bug */}
      <g transform={`translate(${380 + kick * 260} ${240 - kick * 260}) rotate(${kick * 540})`}>
        <ellipse cx="0" cy="0" rx="34" ry="44" fill={RED} {...S} />
        <line x1="0" y1="-44" x2="0" y2="44" stroke={INK} strokeWidth="5" />
        {[-20, 0, 20].map((y) => <g key={y}><line x1="-34" y1={y} x2="-58" y2={y - 10} {...S} /><line x1="34" y1={y} x2="58" y2={y - 10} {...S} /></g>)}
        <circle cx="0" cy="-54" r="16" fill={INK} />
      </g>
      {/* the foot of justice */}
      <g transform={`translate(${200 + kick * 150} ${520 - kick * 280}) rotate(${-40 + kick * 30})`}>
        <path d="M0 0 L120 -10 C160 -10 180 10 180 30 L180 50 L-10 50 Z" fill={CREAM} {...S} />
        <path d="M-10 50 L180 50" stroke={RED} strokeWidth="14" />
      </g>
    </g>
  )
}

function Orbit({ k }: { k: number }) {
  const a = k * Math.PI * 2
  const items = ['✎', '♞', '▮▯', '◉', '⚡', '🏏']
  return (
    <g>
      <circle cx="300" cy="300" r="190" fill="none" stroke={CREAM} strokeWidth="3" strokeDasharray="4 12" />
      <circle cx="300" cy="300" r="120" fill="none" stroke={YEL} strokeWidth="3" strokeDasharray="10 10" />
      <g transform="translate(300 300)">
        <path d="M-30 -110 L50 -110 L15 -10 L70 -10 L-40 130 L-10 20 L-60 20 Z" fill={YEL} {...S} />
      </g>
      {items.map((t, i) => {
        const r = i % 2 ? 190 : 120, ang = a + (i / items.length) * Math.PI * 2
        return (
          <g key={i} transform={`translate(${300 + Math.cos(ang) * r} ${300 + Math.sin(ang) * r})`}>
            <circle r="38" fill={i % 3 === 0 ? RED : CREAM} {...S} />
            <text y="13" textAnchor="middle" fontSize="36" fontWeight="900" fill={i % 3 === 0 ? CREAM : INK} fontFamily="JetBrains Mono, monospace">{t}</text>
          </g>
        )
      })}
    </g>
  )
}

export function Scene({ kind, k = 1, className, label }: { kind: SceneKey; k?: number; className?: string; label?: string }) {
  const C = { script: Script, graph: Graph, chart: Chart, chess: Chess, code: Code, orbit: Orbit }[kind]
  return (
    <svg className={`scene ${className ?? ''}`} viewBox="0 0 600 600" role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      <C k={k} />
    </svg>
  )
}
