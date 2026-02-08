import { Component, ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import { AlertCircle } from 'lucide-react'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Something went wrong
            </h2>
            
            <p className="text-gray-600 mb-6">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Reload Page
              </button>
              
              <Link
                to="/"
                className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors no-underline"
              >
                Go Home
              </Link>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">
                  Error Details
                </summary>
                <pre className="mt-2 text-xs bg-gray-100 p-3 rounded overflow-auto max-h-40">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
