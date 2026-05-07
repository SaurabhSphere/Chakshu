import { Component } from 'react';
import { Button } from './Button';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error, errorInfo) {
    // Keep diagnostics in the console for development.
    console.error('Unhandled UI error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-secondary-50 to-white flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white border border-secondary-200 rounded-xl shadow-lg p-6 text-center">
            <h1 className="text-xl font-bold text-secondary-900 mb-2">Something went wrong</h1>
            <p className="text-secondary-600 mb-4">
              The page crashed unexpectedly. Reload the app to continue.
            </p>
            {import.meta.env.DEV && this.state.error?.message && (
              <p className="text-xs text-danger-700 bg-danger-50 border border-danger-200 rounded p-2 mb-4 break-words">
                {this.state.error.message}
              </p>
            )}
            <Button onClick={this.handleReload} variant="primary" fullWidth>
              Reload App
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
