import * as Sentry from "@sentry/nextjs";

Sentry.init({
    dsn: "https://9a9fd70f0554dd985db05536aba9d8bb@o4509112408473600.ingest.us.sentry.io/4509113328336896",
    integrations: [
        Sentry.feedbackIntegration({
            // Additional SDK configuration goes in here, for example:
            colorScheme: "system",
        }),
    ],
});