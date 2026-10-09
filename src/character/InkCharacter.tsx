import { forwardRef, useEffect, useId, useImperativeHandle, useRef } from 'react'
import type { CharacterConfig } from '../content/characters'
import type { CharState } from '../companion/machine'
import { useFx } from '../lib/fx'

/**
 * Big hand-drawn ink characters (original designs, drawn in code).
 * Swap point: when generated portrait frames exist, set avatar.kind = 'frames' (docs/ASSETS.md).
 * Animation runs in one rAF loop that writes attributes directly — React never re-renders per frame.
 */
interface Props {
  config: CharacterConfig
  state: CharState
  /** css height; width follows the 600x900 viewBox */
  height?: number | string
  className?: string
  /** follow the pointer with eyes/head */
  track?: boolean
  label?: string
}
export interface InkHandle { svg: SVGSVGElement | null }

const INK = '#0d0e0d'
const SKIN = '#ece7da'
const CLOTH = '#171918'

const eyeAlmond = (x: number, y: number, w = 34) => `M${x - w} ${y} Q${x} ${y - 24} ${x + w} ${y} Q${x} ${y + 19} ${x - w} ${y} Z`

function Eye({ x, y, lashes, id }: { x: number; y: number; lashes: boolean; id: string }) {
  return (
    <g>
      <clipPath id={`${id}-clip-${x}`}><path d={eyeAlmond(x, y)} /></clipPath>
      <path d={eyeAlmond(x, y)} fill="#f6f2e8" />
      <g clipPath={`url(#${id}-clip-${x})`}>
        <g data-part="pupil">
          <circle cx={x} cy={y} r={14} fill="#2a2b2a" />
          <circle cx={x} cy={y} r={14} fill={`url(#${id}-iris)`} />
          <circle cx={x} cy={y} r={6.5} fill={INK} />
          <circle cx={x - 5} cy={y - 5} r={3.4} fill="#fff" />
        </g>
        <path data-part="lid" d={`M${x - 40} ${y - 26} H${x + 40} V${y + 22} H${x - 40} Z`} fill={SKIN} style={{ transformBox: 'fill-box', transformOrigin: 'top', transform: 'scaleY(0)' }} />
      </g>
      <path d={`M${x - 37} ${y + 1} Q${x} ${y - 26} ${x + 37} ${y - 1}`} fill="none" stroke={INK} strokeWidth={4.5} strokeLinecap="round" />
      <path d={`M${x - 26} ${y + 12} Q${x} ${y + 21} ${x + 26} ${y + 11}`} fill="none" stroke={INK} strokeOpacity={0.35} strokeWidth={1.6} />
      {lashes && (
        <g stroke={INK} strokeWidth={2.4} strokeLinecap="round">
          {x < 300
            ? <><path d={`M${x - 35} ${y - 1} l-9 -7`} /><path d={`M${x - 30} ${y - 7} l-7 -9`} /><path d={`M${x - 22} ${y - 12} l-4 -10`} /></>
            : <><path d={`M${x + 35} ${y - 1} l9 -7`} /><path d={`M${x + 30} ${y - 7} l7 -9`} /><path d={`M${x + 22} ${y - 12} l4 -10`} /></>}
        </g>
      )}
    </g>
  )
}

function Defs({ id, accent }: { id: string; accent: string }) {
  return (
    <defs>
      <pattern id={`${id}-hatch`} width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(38)">
        <line x1="0" y1="0" x2="0" y2="7" stroke={INK} strokeWidth="2.2" />
      </pattern>
      <pattern id={`${id}-cross`} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(-42)">
        <line x1="0" y1="0" x2="0" y2="6" stroke={INK} strokeWidth="1.8" />
      </pattern>
      <pattern id={`${id}-cloth`} width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(30)">
        <line x1="0" y1="0" x2="0" y2="9" stroke="#3a3d39" strokeWidth="1.4" />
      </pattern>
      <pattern id={`${id}-stipple`} width="9" height="9" patternUnits="userSpaceOnUse">
        <circle cx="2" cy="3" r="1.1" fill={INK} /><circle cx="6.5" cy="7" r="0.9" fill={INK} /><circle cx="7" cy="1.5" r="0.7" fill={INK} />
      </pattern>
      <radialGradient id={`${id}-iris`}>
        <stop offset="0.45" stopColor={accent} stopOpacity="0" />
        <stop offset="1" stopColor={accent} stopOpacity="0.55" />
      </radialGradient>
      <radialGradient id={`${id}-halo`} cx="0.5" cy="0.45" r="0.5">
        <stop offset="0" stopColor={accent} stopOpacity="0.22" />
        <stop offset="1" stopColor={accent} stopOpacity="0" />
      </radialGradient>
      <linearGradient id={`${id}-shadeR`} x1="0" x2="1">
        <stop offset="0.48" stopColor="#fff" stopOpacity="0" />
        <stop offset="0.95" stopColor="#fff" stopOpacity="1" />
      </linearGradient>
      <linearGradient id={`${id}-shadeL`} x1="1" x2="0">
        <stop offset="0.5" stopColor="#fff" stopOpacity="0" />
        <stop offset="0.95" stopColor="#fff" stopOpacity="1" />
      </linearGradient>
      <linearGradient id={`${id}-shadeTop`} x1="0" x2="0" y1="0" y2="1">
        <stop offset="0" stopColor="#fff" stopOpacity="1" />
        <stop offset="0.42" stopColor="#fff" stopOpacity="0" />
      </linearGradient>
      <mask id={`${id}-mR`}><rect width="600" height="900" fill={`url(#${id}-shadeR)`} /></mask>
      <mask id={`${id}-mL`}><rect width="600" height="900" fill={`url(#${id}-shadeL)`} /></mask>
      <mask id={`${id}-mTop`}><rect x="0" y="200" width="600" height="500" fill={`url(#${id}-shadeTop)`} /></mask>
      <filter id={`${id}-glow`} x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="7" result="b" />
        <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>
      <filter id={`${id}-grain`}>
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4" />
        <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.09 0" />
        <feComposite in2="SourceGraphic" operator="in" />
      </filter>
    </defs>
  )
}

function Mouth({ id }: { id: string }) {
  return (
    <g data-part="mouth">
      <ellipse data-part="mouth-in" cx="300" cy="563" rx="21" ry="0.1" fill={INK} />
      <path data-part="lip-low" d="M268 561 Q300 574 332 561" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" />
      <path d="M266 561 Q284 552 300 556 Q316 552 334 561" fill="none" stroke={INK} strokeWidth="3.4" strokeLinecap="round" />
      <path d="M284 584 Q300 590 316 584" fill="none" stroke={INK} strokeOpacity="0.3" strokeWidth="2" />
      <title>{id ? '' : ''}</title>
    </g>
  )
}

/* ------------------------------ RHEA ------------------------------ */
function Rhea({ id, accent }: { id: string; accent: string }) {
  const face = 'M300 255 C370 255 410 322 410 420 C410 520 372 600 330 630 C315 640 285 640 270 630 C228 600 190 520 190 420 C190 322 230 255 300 255 Z'
  const hoodOuter = 'M300 88 C432 88 522 190 527 380 C532 560 510 690 486 780 C420 820 180 820 114 780 C90 690 68 560 73 380 C78 190 168 88 300 88 Z'
  const hoodInner = 'M300 206 C382 206 442 272 449 382 C456 502 440 600 410 664 C384 722 336 752 300 756 C264 752 216 722 190 664 C160 600 144 502 151 382 C158 272 218 206 300 206 Z'
  return (
    <>
      <ellipse cx="300" cy="420" rx="300" ry="380" fill={`url(#${id}-halo)`} />
      {/* body */}
      <path d="M30 900 C40 800 100 742 175 722 C225 708 255 704 300 705 C345 704 375 708 425 722 C500 742 560 800 570 900 Z" fill={CLOTH} />
      <path d="M30 900 C40 800 100 742 175 722 C225 708 255 704 300 705 C345 704 375 708 425 722 C500 742 560 800 570 900 Z" fill={`url(#${id}-cloth)`} />
      {/* neck */}
      <path d="M262 600 L256 720 Q300 742 344 720 L338 600 Z" fill={SKIN} />
      <path d="M262 600 L256 720 Q300 742 344 720 L338 600 Z" fill={`url(#${id}-hatch)`} opacity="0.75" />
      <g data-part="head">
        {/* hair behind face */}
        <path data-part="sway" d="M196 330 C170 430 168 560 190 700 L240 700 C220 600 214 470 228 360 Z M404 330 C430 430 432 560 410 700 L360 700 C380 600 386 470 372 360 Z" fill="#1d1f1e" />
        {/* face */}
        <path d={face} fill={SKIN} />
        <g mask={`url(#${id}-mR)`}><path d={face} fill={`url(#${id}-hatch)`} /></g>
        <g mask={`url(#${id}-mTop)`}><path d={face} fill={`url(#${id}-cross)`} /></g>
        <path d={face} fill="none" stroke={INK} strokeWidth="2.5" />
        {/* freckles */}
        <g fill={INK} opacity="0.55">
          {[[262, 480], [272, 488], [252, 492], [338, 482], [328, 490], [348, 494], [280, 470], [322, 470]].map(([x, y]) => <circle key={`${x}${y}`} cx={x} cy={y} r="1.6" />)}
        </g>
        {/* brows */}
        <path data-part="brow-l" d="M212 392 Q246 374 283 386" fill="none" stroke={INK} strokeWidth="5.5" strokeLinecap="round" />
        <path data-part="brow-r" d="M317 386 Q354 374 388 392" fill="none" stroke={INK} strokeWidth="5.5" strokeLinecap="round" />
        <Eye x={252} y={433} lashes id={id} />
        <Eye x={348} y={433} lashes id={id} />
        {/* nose */}
        <path d="M301 442 C298 470 289 492 292 505 C298 513 309 511 315 504" fill="none" stroke={INK} strokeWidth="2.6" strokeLinecap="round" />
        <Mouth id="" />
        {/* bangs + strands */}
        <g data-part="sway">
          <path d="M200 350 C220 270 290 238 400 300 C370 292 340 300 318 322 C330 300 300 292 282 300 C270 316 252 330 236 360 C232 340 236 322 244 306 C226 318 210 334 200 350 Z" fill="#1d1f1e" />
          <g fill="none" stroke="#5a5d58" strokeWidth="1.4" opacity="0.8">
            <path d="M232 300 C262 278 312 270 372 296" /><path d="M222 330 C248 296 290 284 330 300" /><path d="M206 360 C198 450 196 560 212 690" /><path d="M394 360 C404 450 404 560 390 690" />
          </g>
        </g>
      </g>
      {/* hood */}
      <path d={`${hoodOuter} ${hoodInner}`} fillRule="evenodd" fill="#101211" />
      <path d={`${hoodOuter} ${hoodInner}`} fillRule="evenodd" fill={`url(#${id}-cloth)`} />
      <g fill="none" stroke="#2c2f2d" strokeWidth="3">
        <path d="M150 300 C118 380 112 520 134 690" /><path d="M450 300 C482 380 488 520 466 690" /><path d="M210 170 C250 140 350 140 390 170" />
        <path d="M120 250 C104 300 96 380 98 440" />
      </g>
      <path d={hoodInner} fill="none" stroke="#2c2f2d" strokeWidth="6" />
      {/* drawstrings */}
      <g stroke={SKIN} strokeWidth="3" strokeLinecap="round" opacity="0.85">
        <path d="M270 748 C262 790 256 830 258 868" /><path d="M330 748 C338 790 344 830 342 868" />
      </g>
      <rect x="252" y="866" width="12" height="20" rx="3" fill={accent} /><rect x="336" y="866" width="12" height="20" rx="3" fill={accent} />
      {/* rim light (left) */}
      <path d="M300 90 C170 90 80 190 75 380 C70 560 98 700 128 788" fill="none" stroke={accent} strokeWidth="5" strokeLinecap="round" filter={`url(#${id}-glow)`} />
      <path d="M196 330 C176 420 170 520 186 640" fill="none" stroke={accent} strokeWidth="2.4" opacity="0.7" filter={`url(#${id}-glow)`} />
    </>
  )
}

/* ------------------------------ ASH ------------------------------ */
const curls: [number, number, number][] = [[188, 330, 30], [200, 280, 36], [228, 236, 38], [268, 205, 40], [312, 196, 42], [356, 210, 40], [392, 246, 36], [414, 292, 32], [420, 336, 26], [244, 270, 30], [300, 240, 34], [350, 260, 30], [282, 280, 26], [326, 286, 24]]

function Ash({ id, accent }: { id: string; accent: string }) {
  const face = 'M300 248 C376 248 416 318 416 422 C416 516 386 590 346 626 C326 642 274 642 254 626 C214 590 184 516 184 422 C184 318 224 248 300 248 Z'
  return (
    <>
      <ellipse cx="300" cy="420" rx="300" ry="380" fill={`url(#${id}-halo)`} />
      {/* body: tee + open overshirt */}
      <path d="M24 900 C34 796 96 738 176 718 C226 706 256 702 300 703 C344 702 374 706 424 718 C504 738 566 796 576 900 Z" fill="#232523" />
      <path d="M24 900 C34 796 96 738 176 718 C226 706 256 702 300 703 C344 702 374 706 424 718 C504 738 566 796 576 900 Z" fill={`url(#${id}-cloth)`} />
      <path d="M214 714 L262 900 L338 900 L386 714 C360 706 330 703 300 703 C270 703 240 706 214 714 Z" fill={CLOTH} />
      <path d="M244 708 Q300 760 356 708" fill="none" stroke="#3a3d39" strokeWidth="5" />
      <g fill="none" stroke="#3a3d39" strokeWidth="4"><path d="M214 714 L178 760 L240 790" /><path d="M386 714 L422 760 L360 790" /></g>
      {/* neck */}
      <path d="M258 600 L254 714 Q300 744 346 714 L342 600 Z" fill={SKIN} />
      <path d="M258 600 L254 714 Q300 744 346 714 L342 600 Z" fill={`url(#${id}-hatch)`} opacity="0.8" />
      <g data-part="head">
        {/* ears */}
        <ellipse cx="186" cy="452" rx="17" ry="34" fill={SKIN} stroke={INK} strokeWidth="2.5" />
        <ellipse cx="414" cy="452" rx="17" ry="34" fill={SKIN} stroke={INK} strokeWidth="2.5" />
        <path d={face} fill={SKIN} />
        <g mask={`url(#${id}-mL)`}><path d={face} fill={`url(#${id}-hatch)`} /></g>
        {/* stubble */}
        <clipPath id={`${id}-jaw`}><path d="M196 500 C210 580 250 630 300 636 C350 630 390 580 404 500 C380 540 340 530 300 528 C260 530 220 540 196 500 Z" /></clipPath>
        <rect x="180" y="490" width="240" height="160" fill={`url(#${id}-stipple)`} clipPath={`url(#${id}-jaw)`} opacity="0.75" />
        <path d={face} fill="none" stroke={INK} strokeWidth="2.6" />
        <path data-part="brow-l" d="M210 386 Q246 372 284 382" fill="none" stroke={INK} strokeWidth="7" strokeLinecap="round" />
        <path data-part="brow-r" d="M316 382 Q354 372 390 386" fill="none" stroke={INK} strokeWidth="7" strokeLinecap="round" />
        <Eye x={250} y={432} lashes={false} id={id} />
        <Eye x={350} y={432} lashes={false} id={id} />
        {/* glasses */}
        <g fill="none" stroke={INK} strokeWidth="5">
          <rect x="200" y="400" width="96" height="66" rx="16" /><rect x="304" y="400" width="96" height="66" rx="16" />
          <path d="M292 424 Q300 414 308 424" /><path d="M200 420 L170 432" /><path d="M400 420 L430 432" />
        </g>
        <clipPath id={`${id}-lens`}><rect x="200" y="400" width="96" height="66" rx="16" /><rect x="304" y="400" width="96" height="66" rx="16" /></clipPath>
        <g clipPath={`url(#${id}-lens)`}><path data-part="glint" d="M190 480 L230 390 L246 390 L206 480 Z" fill="#fff" opacity="0.55" /></g>
        {/* nose */}
        <path d="M302 474 C300 488 292 500 294 509 C300 516 311 514 317 507" fill="none" stroke={INK} strokeWidth="2.8" strokeLinecap="round" />
        <path d="M262 540 Q300 530 338 540" fill="none" stroke={INK} strokeOpacity="0.5" strokeWidth="3" />
        <Mouth id="" />
        {/* hair */}
        <g data-part="sway">
          {curls.map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} fill="#181a19" />)}
          <g fill="none" stroke="#5a5d58" strokeWidth="1.5" opacity="0.85">
            {curls.map(([x, y, r], i) => <path key={i} d={`M${x - r * 0.5} ${y + r * 0.1} a${r * 0.45} ${r * 0.45} 0 1 1 ${r * 0.6} ${r * 0.35}`} />)}
          </g>
        </g>
      </g>
      {/* rim light (right) */}
      <path d="M356 186 C420 206 452 268 446 340" fill="none" stroke={accent} strokeWidth="5" strokeLinecap="round" filter={`url(#${id}-glow)`} />
      <path d="M416 420 C416 516 388 588 348 624" fill="none" stroke={accent} strokeWidth="3" opacity="0.8" filter={`url(#${id}-glow)`} />
      <path d="M424 718 C504 738 566 796 576 900" fill="none" stroke={accent} strokeWidth="4" filter={`url(#${id}-glow)`} />
    </>
  )
}

export const InkCharacter = forwardRef<InkHandle, Props>(function InkCharacter({ config, state, height = '80vh', className, track = true, label }, ref) {
  const svg = useRef<SVGSVGElement>(null)
  const stateRef = useRef(state)
  stateRef.current = state
  const raw = useId().replace(/:/g, '')
  const id = `ink${raw}`
  const { level } = useFx()
  useImperativeHandle(ref, () => ({ svg: svg.current }), [])

  useEffect(() => {
    const root = svg.current!
    const q = (s: string) => Array.from(root.querySelectorAll<SVGGraphicsElement>(`[data-part="${s}"]`))
    const head = q('head')[0], pupils = q('pupil'), lids = q('lid'), sway = q('sway'), glint = q('glint')[0]
    const browL = q('brow-l')[0], browR = q('brow-r')[0]
    const inner = q('mouth-in')[0], lipLow = q('lip-low')[0]
    const body = root.querySelector<SVGGElement>('[data-part="breath"]')!

    let tx = 0, ty = 0, lx = 0, ly = 0
    const onMove = (e: PointerEvent) => {
      if (!track) return
      const r = root.getBoundingClientRect()
      tx = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (window.innerWidth * 0.45)))
      ty = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height * 0.45)) / (window.innerHeight * 0.5)))
    }
    window.addEventListener('pointermove', onMove)

    let nextBlink = performance.now() + 1500, blinkStart = -1
    let raf = 0, visible = true
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting })
    io.observe(root)
    const t0 = performance.now()
    const still = level === 'min'

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame)
      if (!visible || document.hidden) return
      const t = (now - t0) / 1000
      const s = stateRef.current
      // gaze target by state
      let gx = tx, gy = ty
      if (s === 'THINKING') { gx = -0.7; gy = -0.9 }
      if (s === 'LISTENING') { gx = tx * 0.4; gy = 0.1 }
      lx += (gx - lx) * 0.08
      ly += (gy - ly) * 0.08
      const breath = still ? 0 : Math.sin(t * 1.25) * 3
      body.setAttribute('transform', `translate(0 ${breath.toFixed(2)})`)
      const tilt = lx * 4 + (s === 'LISTENING' ? 5 : 0) + (s === 'REACTING' ? Math.sin(t * 9) * 2 : 0)
      head.setAttribute('transform', `rotate(${tilt.toFixed(2)} 300 660) translate(${(lx * 6).toFixed(1)} ${(ly * 3).toFixed(1)})`)
      pupils.forEach((p) => p.setAttribute('transform', `translate(${(lx * 9).toFixed(2)} ${(ly * 6).toFixed(2)})`))
      sway.forEach((g) => g.setAttribute('transform', `rotate(${(Math.sin(t * 0.9) * 0.8 - lx * 1.2).toFixed(2)} 300 260)`))
      // blink
      let lid = 0
      if (!still && now > nextBlink && blinkStart < 0) blinkStart = now
      if (blinkStart > 0) {
        const k = (now - blinkStart) / 150
        lid = k < 1 ? k : k < 2 ? 2 - k : 0
        if (k >= 2) { blinkStart = -1; nextBlink = now + 2200 + Math.random() * 3200 }
      }
      if (s === 'ERROR') lid = 0.45
      lids.forEach((l) => (l.style.transform = `scaleY(${lid.toFixed(3)})`))
      // brows
      const b = s === 'REACTING' ? -10 : s === 'THINKING' ? -6 : s === 'ERROR' ? 5 : s === 'LISTENING' ? -3 : 0
      browL.setAttribute('transform', `translate(0 ${b})`)
      browR.setAttribute('transform', `translate(0 ${s === 'THINKING' ? 2 : b})${s === 'ERROR' ? ' rotate(-6 352 384)' : ''}`)
      // mouth
      let open = 0
      if (s === 'SPEAKING' || s === 'GREETING') open = still ? 0.3 : Math.abs(Math.sin(t * 11.5)) * (0.5 + 0.5 * Math.abs(Math.sin(t * 3.1)))
      if (s === 'REACTING') open = 0.45
      inner.setAttribute('ry', (0.1 + open * 11).toFixed(2))
      inner.setAttribute('cy', (562 + open * 4).toFixed(2))
      lipLow.setAttribute('d', `M268 561 Q300 ${(574 + open * 16).toFixed(1)} 332 561`)
      if (glint) glint.setAttribute('transform', `translate(${(((t * 60) % 520) - 60).toFixed(1)} 0)`)
    }
    raf = requestAnimationFrame(frame)
    return () => { cancelAnimationFrame(raf); io.disconnect(); window.removeEventListener('pointermove', onMove) }
  }, [track, level, config.id])

  const C = config.id === 'rhea' ? Rhea : Ash
  return (
    <svg ref={svg} className={className} viewBox="0 0 600 900" style={{ height, width: 'auto', aspectRatio: '600 / 900', display: 'block' }} role="img" aria-label={label ?? `${config.name}, an AI character (illustration)`}>
      <Defs id={id} accent={config.accent} />
      <g data-part="breath"><C id={id} accent={config.accent} /></g>
      <rect width="600" height="900" filter={`url(#${id}-grain)`} opacity="0.6" style={{ pointerEvents: 'none', mixBlendMode: 'multiply' }} />
    </svg>
  )
})

/** Serialise an inline SVG into an Image (used by the ASCII assembly effect). */
export function svgToImage(svgEl: SVGSVGElement, w: number, h: number): Promise<HTMLImageElement> {
  const clone = svgEl.cloneNode(true) as SVGSVGElement
  clone.setAttribute('width', String(w))
  clone.setAttribute('height', String(h))
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  const url = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(new XMLSerializer().serializeToString(clone))
  return new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = url })
}
