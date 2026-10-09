import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

/** The Royal Trophy: one huge gold cup, slowly turning under a spotlight. Renders only while visible. */
export default function TrophyScene({ onFail }: { onFail: () => void }) {
  const host = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = host.current!
    let renderer: THREE.WebGLRenderer
    try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' }) } catch { onFail(); return }
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.domElement.setAttribute('aria-hidden', 'true')
    el.appendChild(renderer.domElement)
    const scene = new THREE.Scene()
    const pm = new THREE.PMREMGenerator(renderer)
    scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture
    const cam = new THREE.PerspectiveCamera(30, 1, 0.1, 100)
    cam.position.set(0, 1.6, 11)

    const gold = new THREE.MeshStandardMaterial({ color: 0xffc83a, metalness: 1, roughness: 0.22 })
    const dark = new THREE.MeshStandardMaterial({ color: 0x15100c, metalness: 0.4, roughness: 0.5 })
    const trophy = new THREE.Group()
    // cup profile (lathe)
    const pts = [[0, 0], [0.55, 0], [0.6, 0.08], [0.25, 0.2], [0.18, 0.9], [0.32, 1.05], [0.95, 1.3], [1.28, 1.9], [1.42, 2.8], [1.46, 3.3], [1.38, 3.32], [1.3, 2.85], [1.16, 2.0], [0.8, 1.5], [0.2, 1.3], [0, 1.28]].map(([x, y]) => new THREE.Vector2(x, y))
    const cup = new THREE.Mesh(new THREE.LatheGeometry(pts, 96), gold)
    trophy.add(cup)
    for (const s of [-1, 1]) {
      const h = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.09, 16, 48, Math.PI * 1.15), gold)
      h.position.set(s * 1.45, 2.45, 0)
      h.rotation.z = s > 0 ? -Math.PI * 0.55 : Math.PI * 1.55
      trophy.add(h)
    }
    const star = new THREE.Mesh(new THREE.OctahedronGeometry(0.28), gold)
    star.position.y = 3.75
    trophy.add(star)
    const base1 = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.45, 2.2), dark); base1.position.y = -0.22
    const base2 = new THREE.Mesh(new THREE.BoxGeometry(2.7, 0.35, 2.7), dark); base2.position.y = -0.62
    const plate = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.24, 0.02), gold); plate.position.set(0, -0.22, 1.11)
    trophy.add(base1, base2, plate)
    trophy.position.y = -1.6
    scene.add(trophy)
    scene.add(new THREE.AmbientLight(0xffffff, 0.25))
    const spot = new THREE.SpotLight(0xfff1c4, 160, 30, 0.38, 0.5, 1.2)
    spot.position.set(0, 9, 5); spot.target = trophy
    const red = new THREE.PointLight(0xff2244, 30, 20); red.position.set(-4, 1, 3)
    scene.add(spot, red)

    const size = () => { const w = el.clientWidth, h = el.clientHeight; renderer.setSize(w, h); cam.aspect = w / h; cam.updateProjectionMatrix() }
    size()
    const ro = new ResizeObserver(size); ro.observe(el)
    let raf = 0, visible = true, px = 0
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting }); io.observe(el)
    const mv = (e: PointerEvent) => { px = (e.clientX / innerWidth) * 2 - 1 }
    addEventListener('pointermove', mv)
    const t0 = performance.now()
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick)
      if (!visible || document.hidden) return
      const t = (now - t0) / 1000
      trophy.rotation.y = t * 0.45 + px * 0.6
      star.rotation.y = t * 2
      trophy.position.y = -1.6 + Math.sin(t * 1.2) * 0.06
      renderer.render(scene, cam)
    }
    raf = requestAnimationFrame(tick)
    return () => { cancelAnimationFrame(raf); io.disconnect(); ro.disconnect(); removeEventListener('pointermove', mv); pm.dispose(); renderer.dispose(); renderer.domElement.remove() }
  }, [onFail])
  return <div ref={host} className="trophy-3d" />
}
