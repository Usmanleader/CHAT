import React, { ReactNode, ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error);
    console.error('Error info:', errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          backgroundColor: '#050b1a',
          color: '#e2e8f0',
          fontFamily: 'Inter, sans-serif',
          padding: '20px'
        }}>
          <h1 style={{ fontSize: '2em', marginBottom: '10px', color: '#ef4444' }}>
            App Error
          </h1>
          <p style={{ fontSize: '1.1em', marginBottom: '20px' }}>
            Something went wrong. Details below:
          </p>
          <div style={{
            backgroundColor: '#1e293b',
            padding: '20px',
            borderRadius: '8px',
            maxWidth: '600px',
            wordBreak: 'break-all',
            fontSize: '0.9em',
            color: '#cbd5e1'
          }}>
            <p><strong>Error:</strong></p>
            <p>{this.state.error?.message}</p>
            <p><strong>Stack:</strong></p>
            <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.8em' }}>
              {this.state.error?.stack}
            </pre>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
