import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'

interface RouteErrorBoundaryProps {
  children: ReactNode
}

interface RouteErrorBoundaryState {
  error: Error | null
}

// Without this, a render error inside any routed page (e.g. BookingPage) throws
// past React with no boundary to catch it, which unmounts silently rather than
// showing what broke — surfaces the real error instead of a blank page.
export default class RouteErrorBoundary extends Component<
  RouteErrorBoundaryProps,
  RouteErrorBoundaryState
> {
  state: RouteErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): RouteErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Route render error:', error, info.componentStack)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-6 text-center">
          <p className="font-heading text-lg text-heading">Что-то пошло не так</p>
          <p className="max-w-xs font-body text-xs text-text/50">{this.state.error.message}</p>
        </div>
      )
    }
    return this.props.children
  }
}
