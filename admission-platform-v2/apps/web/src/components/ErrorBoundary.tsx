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
 * Catches any unhandled render error in the subtree and redirects to /error
 * with the error details passed as location state.
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

    // Navigate to the error page, passing error details as location state.
    // Use replace so the broken page is removed from the history stack.
    window.history.replaceState(
      {
        type: 'crash',
        errorName: error.name,
        message: error.message,
        componentStack: info.componentStack,
        timestamp: new Date().toISOString(),
      },
      '',
      '/error'
    );
    // Force React Router to pick up the new location
    window.dispatchEvent(new PopStateEvent('popstate'));
  }

  render() {
    // While error state is being processed, render nothing to avoid a flash
    if (this.state.hasError) {
      return null;
    }
    return this.props.children;
  }
}
