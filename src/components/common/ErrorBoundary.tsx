import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[300px] flex items-center justify-center p-6">
          <div className="instrument-card rounded-2xl p-6 max-w-md w-full text-center space-y-4 border-2 border-red-500">
            <h2 className="font-display text-xl font-bold text-red-600">Console Runtime Fault</h2>
            <p className="text-xs text-steel leading-relaxed">
              {this.state.error?.message || 'An unexpected error occurred in the application.'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="tactile-btn px-4 py-2 rounded-xl bg-ink text-white font-mono text-xs font-semibold"
            >
              Reboot Console
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
