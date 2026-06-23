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
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          minHeight: '100vh', background: 'var(--bg-950)', padding: 24,
        }}>
          <div style={{
            background: 'var(--bg-800)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-xl)', padding: 48, maxWidth: 480,
            textAlign: 'center', boxShadow: 'var(--shadow-lg)',
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
            <h2 style={{ color: 'var(--text-100)', marginBottom: 8, fontSize: 24 }}>Something went wrong</h2>
            <p style={{ color: 'var(--text-300)', fontSize: 14, marginBottom: 24 }}>
              {process.env.NODE_ENV === 'development' ? this.state.error?.message : 'An unexpected error occurred.'}
            </p>
            <button onClick={() => window.location.reload()} style={{
              background: 'var(--accent)', color: '#fff', border: 'none',
              borderRadius: 'var(--radius-md)', padding: '10px 24px',
              fontSize: 14, fontWeight: 600, cursor: 'pointer',
            }}>
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
