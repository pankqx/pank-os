import { useEffect, useRef } from 'react'
import * as THREE from 'three'

/** Enhancement only: three empty plinths under a spotlight that follows the pointer. Renders on demand, pauses off-screen. */
export default function TrophyScene({ onFail }: { onFail: () => void }) {
  const host = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = host.current!
    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' })
    } catch {
      onFail()
      return
    }
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75))
    el.appendChild(renderer.domElement)
    renderer.domElement.setAttribute('aria-hidden', 'true')

    const scene = new THREE.Scene()
    const cam = new THREE.PerspectiveCamera(32, 1, 0.1, 50)
    cam.position.set(0, 2.2, 9)
    const mat = new THREE.MeshStandardMaterial({ color: 0x2a2d2b, roughness: 0.55, metalness: 0.1 })
    const edge = new THREE.LineBasicMaterial({ color: 0x7d807a })
    const group = new THREE.Group()
    for (const x of [-5.8, 0, 5.8]) {
      const g = new THREE.BoxGeometry(1.6, 2.2, 1.6)
      const m = new THREE.Mesh(g, mat)
      m.position.set(x, 0, 0)
      group.add(m)
      const l = new THREE.LineSegments(new THREE.EdgesGeometry(g), edge)
      l.position.copy(m.position)
      group.add(l)
      const cap = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.14, 1.9), mat)
      cap.position.set(x, 1.17, 0)
      group.add(cap)
    }
    scene.add(group)
    scene.add(new THREE.AmbientLight(0x404440, 0.9))
    const spot = new THREE.SpotLight(0xece7da, 90, 22, 0.35, 0.6, 1.4)
    spot.position.set(0, 8, 4)
    scene.add(spot, spot.target)

    const N = 260
    const pos = new Float32Array(N * 3)
    for (let i = 0; i < N; i++) { pos[i * 3] = (Math.random() - 0.5) * 12; pos[i * 3 + 1] = Math.random() * 6 - 1.5; pos[i * 3 + 2] = (Math.random() - 0.5) * 6 }
    const dust = new THREE.Points(new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(pos, 3)), new THREE.PointsMaterial({ size: 0.03, color: 0xece7da, transparent: true, opacity: 0.5 }))
    scene.add(dust)

    const ptr = { x: 0, y: 0 }
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      ptr.x = ((e.clientX - r.left) / r.width) * 2 - 1
      ptr.y = ((e.clientY - r.top) / r.height) * 2 - 1
    }
    const size = () => {
      const w = el.clientWidth, h = el.clientHeight
      renderer.setSize(w, h)
      cam.aspect = w / h
      cam.updateProjectionMatrix()
    }
    size()
    const ro = new ResizeObserver(size)
    ro.observe(el)
    window.addEventListener('pointermove', move)

    let raf = 0, visible = true
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting })
    io.observe(el)
    const t0 = performance.now()
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick)
      if (!visible || document.hidden) return
      const t = (now - t0) / 1000
      spot.target.position.set(ptr.x * 7, -0.5, 0)
      cam.position.x += (ptr.x * 0.8 - cam.position.x) * 0.04
      cam.lookAt(0, 0.3, 0)
      dust.rotation.y = t * 0.03
      dust.position.y = Math.sin(t * 0.3) * 0.1
      renderer.render(scene, cam)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      io.disconnect(); ro.disconnect()
      window.removeEventListener('pointermove', move)
      scene.traverse((o) => { const m = o as THREE.Mesh; m.geometry?.dispose?.() })
      mat.dispose(); edge.dispose()
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [onFail])

  return <div ref={host} className="trophy-3d" />
}
