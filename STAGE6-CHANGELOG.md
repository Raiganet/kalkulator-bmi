# Stage 6 — Production Hardening & Engagement

## Production hardening
- Added privacy-safe analytics event layer. No calculator input values or numeric health/finance results are sent as custom analytics events.
- Added guarded runtime/unhandled-rejection handling and non-sensitive error telemetry.
- Added Core Web Vitals collection (LCP, CLS, INP, FCP) that is only sent after analytics consent.
- Added `prefers-reduced-motion` support and lazy/async image decoding enhancements.
- Pinned Lucide CDN to `1.47.0` across pages and added a consistent preconnect/fallback loading path.
- Added strict-origin referrer policy metadata.
- Service Worker cache bumped to `ko-v7`; monetization config added to precache.

## Engagement
- Added local “Paling sering dipakai” ranking based only on calculation count in this browser.
- Added a fourth result action: generate/share/download a branded 1080×1080 PNG result card locally in the browser.
- Added privacy-safe events for calculator completion, favorites, search selection, category filters, result actions, unit changes, theme changes, PWA install/update.

## Monetization-ready foundation
- Added `monetization-config.js`, disabled by default.
- Supports an optional first-party/house sponsor card without loading third-party advertising code.
- Third-party advertising intentionally not enabled; advertising consent would need to be added first.

## Privacy
- Updated privacy copy to explain local usage ranking and analytics event boundaries.
