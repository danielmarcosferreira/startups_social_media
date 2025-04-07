// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever the client side of your app loads.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://9a9fd70f0554dd985db05536aba9d8bb@o4509112408473600.ingest.us.sentry.io/4509113328336896",

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: true,

  // Enable user feedback functionality
  autoSessionTracking: true,
  enableUserFeedback: true,
  
  // Configure the user feedback dialog
  reportDialogOptions: {
    title: "We've noticed an error",
    subtitle: "Our team has been notified.",
    subtitle2: "If you'd like to help, tell us what happened below.",
    labelName: "Name",
    labelEmail: "Email",
    labelComments: "What happened?",
    labelClose: "Close",
    labelSubmit: "Submit",
    errorGeneric: "An unknown error occurred while submitting your report. Please try again.",
    errorFormEntry: "Some fields were invalid. Please correct the errors and try again.",
    successMessage: "Your feedback has been sent. Thank you!",
  },
  
  // Configure the Sentry User Feedback dialog
  replaysOnErrorSampleRate: 1.0,
  
  // This sets the 'environment' tag to differentiate between production and development
  environment: process.env.NODE_ENV,
  
  // Add beforeSend to enrich and filter events
  beforeSend(event, hint) {
    // Don't send events if we're in development
    if (process.env.NODE_ENV === 'development' && !event.exception) {
      return null;
    }

    // Add any additional context or user information
    // This can be customized based on your authentication setup
    const user = typeof window !== 'undefined' ? window.__CURRENT_USER : null;
    if (user) {
      event.user = {
        id: user.id,
        email: user.email,
        username: user.username,
        // Add other user information as needed
      };
    }

    return event;
  },

  // Configure what Sentry should monitor
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay({
      // Additional options for the Replay integration
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
});

// Add this to your window object
declare global {
  interface Window {
    __CURRENT_USER?: {
      id: string;
      email?: string;
      username?: string;
    };
  }
}
