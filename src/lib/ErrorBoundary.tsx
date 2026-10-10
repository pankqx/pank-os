import { Component, type ReactNode } from 'react'

interface P { children: ReactNode; label: string; fallback?: ReactNode }
export class ErrorBoundary extends Component<P, { err: Error | null }> {
  state = { err: null as Error | null }
  static getDerivedStateFromError(err: Error) { return { err } }
  componentDidCatch(err: Error) {
    console.error(`[${this.props.label}]`, err)
    // after a deploy, an old tab can ask for a chunk that no longer exists: reload once to pick up the new build
    if (/dynamically imported|Loading chunk|module script|Importing a module/i.test(String(err?.message))) {
      try { if (!sessionStorage.getItem('pankos.reloaded')) { sessionStorage.setItem('pankos.reloaded', '1'); location.reload() } } catch { /* ignore */ }
    }
  }
  render() {
    if (!this.state.err) return this.props.children
    return this.props.fallback ?? (
      <div role="alert" className="boundary mono">
        <p>Something in {this.props.label} broke. The rest of the site is fine.</p>
        <button onClick={() => location.reload()}>try again</button>
      </div>
    )
  }
}
