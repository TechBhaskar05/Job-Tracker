import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-bg-950 p-6">
          <div className="bg-bg-800 border border-border rounded-xl p-12 max-w-[480px] text-center shadow-lg">
            <div className="text-5xl mb-4">⚠️</div>
            <h2 className="text-text-100 mb-2 text-2xl">Something went wrong</h2>
            <p className="text-text-300 text-sm mb-6">
              {process.env.NODE_ENV === 'development' ? this.state.error?.message : 'An unexpected error occurred.'}
            </p>
            <button onClick={() => window.location.reload()} className="bg-accent text-white border-none rounded px-6 py-2.5 text-sm font-semibold cursor-pointer">
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
