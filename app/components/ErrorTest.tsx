"use client";

import * as Sentry from "@sentry/nextjs";
import { useState } from "react";

export default function ErrorTest() {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [lastEventId, setLastEventId] = useState<string | null>(null);

  // Set user context for testing
  const setUserContext = () => {
    // Set user context in Sentry
    Sentry.setUser({
      id: "test-user-123",
      email: "test@example.com",
      username: "TestUser",
    });

    // Also set the global context variable that our config uses
    if (typeof window !== "undefined") {
      (window as any).__CURRENT_USER = {
        id: "test-user-123",
        email: "test@example.com",
        username: "TestUser",
      };
    }

    setMessage("User context set! Any errors will now include this user information.");
  };

  // Trigger a handled error (with try/catch)
  const triggerHandledError = () => {
    try {
      // Intentionally throw an error for testing
      throw new Error("This is a test handled error");
    } catch (err) {
      const error = err as Error;
      setError(error);
      
      // Capture the error with Sentry
      Sentry.withScope((scope) => {
        scope.setTag("errorType", "handled");
        scope.setLevel("error");
        const eventId = Sentry.captureException(error);
        setLastEventId(eventId);
        setMessage(`Handled error captured! Event ID: ${eventId}`);
      });
    }
  };

  // Trigger an unhandled error
  const triggerUnhandledError = () => {
    // This will cause an unhandled error that should be caught by the global error boundary
    const obj: any = null;
    obj.nonExistentMethod(); // This will throw a TypeError
  };

  // Manually show the feedback dialog
  const showFeedbackDialog = () => {
    // Create a message first
    const eventId = Sentry.captureMessage("User initiated feedback");
    setLastEventId(eventId);
    
    // Show the dialog with the event ID
    Sentry.showReportDialog({
      eventId,
      title: "We value your feedback",
      subtitle: "If you'd like to help us improve, please tell us what happened",
      subtitle2: "Your feedback is appreciated!"
    });
    
    setMessage(`Feedback dialog shown for event ID: ${eventId}`);
  };

  // Create a sample error event to show on the page
  const createErrorEvent = () => {
    const error = new Error("This is a test error event");
    error.stack = `Error: This is a test error event
    at createErrorEvent (ErrorTest.tsx:67:19)
    at button onClick (ErrorTest.tsx:117:33)
    at HTMLUnknownElement.callCallback (react-dom.development.js:4164:14)`;
    
    setError(error);
    setMessage("Sample error created (not sent to Sentry)");
  };

  return (
    <div style={{
      maxWidth: "800px",
      margin: "40px auto",
      padding: "30px",
      backgroundColor: "#f9fafb",
      borderRadius: "8px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
      fontFamily: "system-ui, -apple-system, sans-serif"
    }}>
      <h1 style={{ fontSize: "24px", marginBottom: "20px", color: "#111827" }}>
        Sentry Error Reporting Test
      </h1>
      
      <p style={{ fontSize: "16px", marginBottom: "24px", color: "#4b5563" }}>
        This component helps test Sentry error reporting and user feedback functionality.
        Follow the steps below in order.
      </p>
      
      {message && (
        <div style={{
          padding: "12px 16px",
          backgroundColor: "#dbeafe",
          borderRadius: "6px",
          marginBottom: "24px",
          fontSize: "14px",
          color: "#1e40af"
        }}>
          {message}
        </div>
      )}
      
      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        <button
          onClick={setUserContext}
          style={{
            padding: "10px 16px",
            backgroundColor: "#4f46e5",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "16px"
          }}
        >
          Step 1: Set User Context
        </button>
        
        <button
          onClick={createErrorEvent}
          style={{
            padding: "10px 16px",
            backgroundColor: "#0ea5e9",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "16px"
          }}
        >
          Step 2: Create Sample Error (Local Only)
        </button>
        
        <button
          onClick={triggerHandledError}
          style={{
            padding: "10px 16px",
            backgroundColor: "#f59e0b",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "16px"
          }}
        >
          Step 3: Trigger Handled Error
        </button>
        
        <button
          onClick={showFeedbackDialog}
          style={{
            padding: "10px 16px",
            backgroundColor: "#10b981",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "16px"
          }}
        >
          Step 4: Show Feedback Dialog Manually
        </button>
        
        <button
          onClick={triggerUnhandledError}
          style={{
            padding: "10px 16px",
            backgroundColor: "#ef4444",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "16px",
            marginTop: "10px"
          }}
        >
          Step 5: Trigger Unhandled Error (Will Crash)
        </button>
      </div>
      
      {error && (
        <div style={{
          marginTop: "30px",
          padding: "16px",
          backgroundColor: "#fee2e2",
          borderRadius: "6px",
          border: "1px solid #fecaca"
        }}>
          <h3 style={{ fontSize: "16px", marginBottom: "8px", color: "#b91c1c" }}>
            Error Details:
          </h3>
          <p style={{ margin: "0 0 8px 0", fontSize: "14px" }}>
            <strong>Message:</strong> {error.message}
          </p>
          {error.stack && (
            <>
              <p style={{ margin: "0 0 4px 0", fontSize: "14px" }}>
                <strong>Stack:</strong>
              </p>
              <pre style={{
                margin: "0",
                padding: "8px",
                backgroundColor: "#fff1f2",
                borderRadius: "4px",
                overflow: "auto",
                fontSize: "12px",
                color: "#881337",
                maxHeight: "200px"
              }}>
                {error.stack}
              </pre>
            </>
          )}
          
          {lastEventId && (
            <p style={{ marginTop: "12px", fontSize: "14px" }}>
              <strong>Sentry Event ID:</strong> {lastEventId}
            </p>
          )}
        </div>
      )}
      
      <div style={{ marginTop: "30px", padding: "16px", backgroundColor: "#f3f4f6", borderRadius: "6px" }}>
        <h3 style={{ fontSize: "16px", marginBottom: "8px", color: "#1f2937" }}>Testing Instructions:</h3>
        <ol style={{ margin: "0", paddingLeft: "20px", fontSize: "14px", color: "#4b5563" }}>
          <li>Click "Set User Context" to add user information to Sentry errors</li>
          <li>Try the "Create Sample Error" to see what error details look like (not sent to Sentry)</li>
          <li>Use "Trigger Handled Error" to send a handled exception to Sentry</li>
          <li>Try "Show Feedback Dialog Manually" to test the feedback form without an error</li>
          <li>Finally, use "Trigger Unhandled Error" to test the global error boundary (this will crash the page)</li>
          <li>After testing, check your Sentry dashboard to verify events and user feedback</li>
        </ol>
      </div>
    </div>
  );
}
