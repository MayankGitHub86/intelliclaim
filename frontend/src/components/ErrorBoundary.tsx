import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

// Simple Error Fallback Component
export function ErrorFallback({ error, resetError }: { error: Error; resetError: () => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-red-50/30 dark:to-red-950/30 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle className="text-red-600 dark:text-red-400">Something went wrong</CardTitle>
          <CardDescription>
            An unexpected error occurred. Please try refreshing the page or contact support if the problem persists.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <p className="text-sm font-medium text-red-800 dark:text-red-200 mb-2">Error Details:</p>
            <p className="text-xs text-red-600 dark:text-red-300 font-mono break-all">
              {error.message}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => window.location.reload()}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh Page
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-border hover:bg-muted/50 rounded-lg transition-colors"
            >
              <Home className="w-4 h-4" />
              Go Home
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Hook for handling async errors in functional components
export const useErrorHandler = () => {
  const [error, setError] = React.useState(null);

  const resetError = () => setError(null);

  const handleError = (error: Error) => {
    console.error('Async error:', error);
    setError(error);
  };

  const handleAsyncError = (asyncFn: () => Promise<any>) => {
    return async () => {
      try {
        await asyncFn();
      } catch (error) {
        handleError(error as Error);
      }
    };
  };

  if (error) {
    return <ErrorFallback error={error} resetError={resetError} />;
  }

  return { handleError, resetError, handleAsyncError };
};
