import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  componentStack: string | null;
}

/**
 * Catches any unhandled render error in the subtree and renders an inline
 * error UI. The BrowserRouter lives *outside* this boundary (in main.tsx)
 * so the router stays alive, but we render the fallback directly here to
 * avoid any dependency on React Router hooks inside a class component.
 *
 * Class component required — React error boundaries cannot be function components.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, componentStack: null };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error('❌ [ErrorBoundary] Uncaught render error:', error);
    this.setState({ componentStack: info.componentStack });
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const { error, componentStack } = this.state;
    const timestamp = new Date().toISOString();

    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #f8fafc, #e0e7ff)', padding: '1rem' }}>
        <div style={{ width: '100%', maxWidth: '42rem' }}>
          {/* Main card */}
          <div style={{ textAlign: 'center', padding: '3rem 2rem', background: '#fff', borderRadius: '1rem', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', marginBottom: '1rem' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '1.5rem' }}>⚠️</div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.75rem' }}>Something went wrong</h1>
            <p style={{ color: '#64748b', marginBottom: '2rem', lineHeight: 1.6 }}>
              An unexpected error occurred. Your progress has been saved. Try reloading — if the problem persists, contact support.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => window.location.reload()}
                style={{ padding: '0.75rem 1.5rem', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '0.5rem', fontWeight: 600, cursor: 'pointer', fontSize: '0.95rem' }}
              >
                Reload page
              </button>
              <button
                onClick={() => { window.location.href = '/'; }}
                style={{ padding: '0.75rem 1.5rem', background: '#f1f5f9', color: '#374151', border: 'none', borderRadius: '0.5rem', fontWeight: 600, cursor: 'pointer', fontSize: '0.95rem' }}
              >
                Go home
              </button>
            </div>
          </div>

          {/* Technical details */}
          {error && (
            <div style={{ background: '#fff', borderRadius: '1rem', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1rem 1.5rem', background: '#fff1f2', borderBottom: '1px solid #fecdd3' }}>
                <span style={{ color: '#ef4444', fontFamily: 'monospace', fontWeight: 600, fontSize: '0.875rem' }}>
                  {error.name}
                </span>
                <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: '#94a3b8', fontFamily: 'monospace' }}>{timestamp}</span>
              </div>
              <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #f1f5f9' }}>
                <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Message</p>
                <p style={{ fontFamily: 'monospace', fontSize: '0.875rem', color: '#ef4444', wordBreak: 'break-all' }}>{error.message}</p>
              </div>
              {componentStack && (
                <div style={{ padding: '1rem 1.5rem' }}>
                  <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Component stack</p>
                  <pre style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#475569', background: '#f8fafc', borderRadius: '0.5rem', padding: '1rem', overflow: 'auto', maxHeight: '14rem', whiteSpace: 'pre', lineHeight: 1.6, margin: 0 }}>
                    {componentStack.trim()}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }
}
