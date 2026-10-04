import React from "react";

/*
 * What error boundaries do NOT catch:
 *   - errors thrown inside event handlers (onClick, onChange, …)
 *   - errors in async code (setTimeout, fetch callbacks, …)
 *   - unhandled promise rejections
 * Boundaries only catch errors during render, in lifecycle methods,
 * and in constructors of descendants.
 */

interface ErrorBoundaryProps {
  children: React.ReactNode;
  label?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    // Pure: only flip the state, no side effects.
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error(`[ErrorBoundary${this.props.label ? `: ${this.props.label}` : ""}]`, error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center">
          <p className="text-sm font-medium">
            {this.props.label ? `${this.props.label} crashed` : "Something went wrong"}
          </p>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false })}
            className="rounded-md border px-3 py-1 text-sm hover:bg-muted"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
