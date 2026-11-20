import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    message: '',
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Application boundary caught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-[#FBF9F5] px-4">
          <div className="max-w-md border border-[#183D35]/15 bg-[#F6F0E7] p-8 text-center">
            <h1 className="font-display text-3xl text-[#183D35]">Something needs attention</h1>
            <p className="mt-3 text-sm text-[#252525]/80">
              We encountered an unexpected error while loading this view. Please refresh to restore your session.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-6 inline-flex items-center justify-center bg-[#183D35] px-5 py-2.5 text-xs font-medium text-[#FBF9F5] hover:bg-[#112C26]"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
