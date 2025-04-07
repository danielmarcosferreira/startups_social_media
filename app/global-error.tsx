"use client";

import * as Sentry from "@sentry/nextjs";
import NextError from "next/error";
import { useEffect, useState } from "react";

interface ErrorProps {
  error: Error & { digest?: string; statusCode?: number };
}

export default function GlobalError({ error }: ErrorProps) {
  const [eventId, setEventId] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState<boolean>(false);

  useEffect(() => {
    // Only run once to prevent duplicate reporting
    let capturedEventId: string | null = null;

    // Capture the exception and get the event ID
    Sentry.withScope((scope) => {
      // Add additional context to the error
      scope.setTag("errorLocation", "global-error-boundary");
      scope.setLevel("error");
      
      // Add any additional context that might be helpful
      scope.setExtra("errorMessage", error.message);
      scope.setExtra("errorStack", error.stack);
      scope.setExtra("errorDigest", error.digest);
      
      // Capture the exception and get the event ID
      capturedEventId = Sentry.captureException(error);
      setEventId(capturedEventId);
    });
    
    // After the error is captured and we have an eventId, we can show the dialog
    if (capturedEventId && typeof window !== 'undefined') {
      // Use a small timeout to ensure the UI has rendered before showing dialog
      setTimeout(() => {
        try {
          Sentry.showReportDialog({
            eventId: capturedEventId,
            // The custom dialog options are now set globally in sentry.client.config.ts
            // so we don't need to repeat them here
          });
          setShowDialog(true);
        } catch (dialogError) {
          console.error("Failed to show Sentry dialog:", dialogError);
        }
      }, 500);
    }
  }, [error]);

  return (
    <html>
      <body>
        <div className="error-container" style={{
          margin: '0 auto',
          maxWidth: '800px',
          padding: '40px 20px',
          textAlign: 'center',
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}>
          <div style={{ marginBottom: '30px' }}>
            <h1 style={{ color: '#e11d48', fontSize: '28px', marginBottom: '16px' }}>Something went wrong!</h1>
            <p style={{ fontSize: '16px', color: '#4b5563', marginBottom: '8px' }}>We're sorry, but an unexpected error has occurred.</p>
            <p style={{ fontSize: '16px', color: '#4b5563', marginBottom: '24px' }}>Our team has been notified and is working to fix the issue.</p>
            
            {/* Display error details in development */}
            {process.env.NODE_ENV === 'development' && (
              <div style={{ 
                textAlign: 'left', 
                background: '#f8f9fa', 
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                padding: '16px',
                marginBottom: '24px',
                overflow: 'auto',
                maxHeight: '300px'
              }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#1f2937' }}>Error Details:</h3>
                <p style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#1f2937' }}><strong>Message:</strong> {error.message}</p>
                {error.digest && (
                  <p style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#1f2937' }}><strong>Digest:</strong> {error.digest}</p>
                )}
                {error.stack && (
                  <>
                    <p style={{ margin: '4px 0', fontSize: '14px', color: '#1f2937' }}><strong>Stack:</strong></p>
                    <pre style={{ margin: '0', fontSize: '12px', color: '#374151', whiteSpace: 'pre-wrap' }}>{error.stack}</pre>
                  </>
                )}
              </div>
            )}
            
            {/* Show button to manually trigger feedback dialog in case the automatic one fails */}
            {eventId && !showDialog && (
              <div>
                <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
                  Please help us understand what went wrong:
                </p>
                <button 
                  onClick={() => {
                    try {
                      Sentry.showReportDialog({ eventId });
                      setShowDialog(true);
                    } catch (dialogError) {
                      console.error("Failed to show manual dialog:", dialogError);
                    }
                  }}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#6C63FF',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: '500'
                  }}
                >
                  Report this issue
                </button>
              </div>
            )}

            {/* Help user understand what to do next */}
            <div style={{ marginTop: '30px' }}>
              <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
                You can try:
              </p>
              <ul style={{ listStyle: 'none', padding: '0', margin: '0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li>
                  <a href="/" style={{ color: '#6C63FF', textDecoration: 'none', fontSize: '16px' }}>
                    Return to homepage
                  </a>
                </li>
                <li>
                  <a href="javascript:window.location.reload()" style={{ color: '#6C63FF', textDecoration: 'none', fontSize: '16px' }}>
                    Refresh the page
                  </a>
                </li>
              </ul>
            </div>
          </div>
          
          {/* NextError is the default Next.js error component - hidden in production */}
          {process.env.NODE_ENV === 'development' && (
            <div style={{ marginTop: '2rem', opacity: 0.7 }}>
              <NextError statusCode={error.statusCode || 500} />
            </div>
          )}
        </div>
      </body>
    </html>
  );
}
