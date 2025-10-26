'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    // You can log the error to an error reporting service here
    // For example: Sentry, LogRocket, etc.
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
          <Card className="p-6 bg-gray-800 border-gray-700 max-w-md w-full">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <AlertTriangle className="w-12 h-12 text-red-400" />
              </div>
              
              <h2 className="text-xl font-semibold text-white mb-2">
                Something went wrong
              </h2>
              
              <p className="text-gray-400 mb-6">
                We encountered an unexpected error. Please try again.
              </p>
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mb-4 text-left">
                  <summary className="text-sm text-gray-300 cursor-pointer mb-2">
                    Error Details (Development)
                  </summary>
                  <pre className="text-xs text-red-300 bg-gray-900 p-2 rounded overflow-auto">
                    {this.state.error.message}
                    {this.state.error.stack && (
                      <>
                        {'\n\nStack Trace:'}
                        {'\n'}
                        {this.state.error.stack}
                      </>
                    )}
                  </pre>
                </details>
              )}
              
              <div className="flex gap-3 justify-center">
                <Button
                  onClick={this.handleRetry}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Reload Page
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

// Hook version for functional components
export function useErrorHandler() {
  return (error: Error, errorInfo?: ErrorInfo) => {
    console.error('Error caught by useErrorHandler:', error, errorInfo)
    
    // You can log the error to an error reporting service here
    // For example: Sentry, LogRocket, etc.
  }
}
