import { useEffect, useState } from 'react'

export function parseHash(h: string): { section: string; sub: string } {
  const [section = '', sub = ''] = h.replace(/^#\/?/, '').split('/')
  return { section, sub }
}

export function useHash() {
  const [hash, setHash] = useState(() => parseHash(location.hash))
  useEffect(() => {
    const on = () => setHash(parseHash(location.hash))
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  return hash
}
