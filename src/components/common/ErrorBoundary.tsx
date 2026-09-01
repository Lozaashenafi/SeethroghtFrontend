import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  /** Optional fallback UI. If omitted, a default error screen is shown. */
  fallback?: ReactNode;
  /** Called when an error is caught. Useful for logging. */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.props.onError?.(error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
          <AlertTriangle className="mb-4 h-12 w-12 text-orange-500" />
          <h2 className="mb-2 text-lg font-semibold text-[var(--color-text)]">
            Something went wrong
          </h2>
          <p className="mb-6 max-w-md text-sm text-[var(--color-text-secondary)]">
            An unexpected error occurred. You can try reloading the page or
            navigating back.
          </p>
          <button
            onClick={this.handleReset}
            className="inline-flex items-center gap-2 border-2 border-[var(--color-text)] bg-[var(--color-text)] px-4 py-2 text-sm font-medium text-[var(--color-bg)] transition-colors hover:bg-transparent hover:text-[var(--color-text)]"
          >
            <RefreshCw size={14} />
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
