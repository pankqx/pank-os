import { Component, type ReactNode } from 'react'

interface P { children: ReactNode; label: string; fallback?: ReactNode }
export class ErrorBoundary extends Component<P, { err: Error | null }> {
  state = { err: null as Error | null }
  static getDerivedStateFromError(err: Error) { return { err } }
  componentDidCatch(err: Error) { console.error(`[${this.props.label}]`, err) }
  render() {
    if (!this.state.err) return this.props.children
    return this.props.fallback ?? (
      <div role="alert" className="boundary mono">
        <p>Something in {this.props.label} broke. The rest of the site is fine.</p>
        <button onClick={() => this.setState({ err: null })}>try again</button>
      </div>
    )
  }
}
