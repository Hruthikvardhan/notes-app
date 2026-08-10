import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('Uncaught error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center text-center p-6">
          <h1 className="font-display text-2xl font-semibold mb-2">Something went wrong</h1>
          <p className="text-ink/60 dark:text-gray-400 mb-4">Try reloading the page. If the problem continues, your notes are safe on the server.</p>
          <button onClick={() => window.location.reload()} className="text-accent-500 font-medium">
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
