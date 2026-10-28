import { Component, type ErrorInfo, type ReactNode } from "react";

interface State { error: Error | null }
/** Keeps a failure in one page/widget from blanking the whole app. */
export class ErrorBoundary extends Component<{ children: ReactNode; compact?: boolean }, State> {
  state: State = { error: null };
  static getDerivedStateFromError(error: Error): State { return { error }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error("UI error", error, info.componentStack); }
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className={`text-center ${this.props.compact ? "p-4" : "py-5 container"}`}>
        <div className="empty-icon mb-3"><i className="ri-cloud-off-line" /></div>
        <h2 className="h5 fw-bold">Something went wrong here</h2>
        <p className="text-muted">The rest of the site is still working. Please try again.</p>
        <button className="btn btn-primary me-2" onClick={() => this.setState({ error: null })}>Try again</button>
        <a className="btn btn-outline-secondary" href="/">Back home</a>
      </div>
    );
  }
}
