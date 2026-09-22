# Stage 3 — Smart Features

Stage 3 adds personalization and result utilities while keeping the app static, lightweight, and account-free.

## Added

- Favorites for calculator cards and calculator pages.
- Personalized **Favoritmu** section on the homepage.
- **Terakhir digunakan** list stored locally in the browser.
- Local calculation history (maximum 20 entries) with a clear-history action.
- History stores concise output summaries instead of full form input data.
- Share result using the Web Share API when available.
- Copy result with clipboard fallback.
- **Hitung ulang** action that returns focus to the calculator inputs.
- Smarter related-calculator recommendations based on calculator context.
- Persistent Metric / Imperial selector for:
  - BMI
  - Kalori
  - BMR
  - Air Minum
  - WHtR
  - Body Fat
- Unit preference is reused across supported calculators.
- BMI result units adapt to Metric / Imperial mode.

## Storage

All personalization data stays in browser `localStorage`:

- `ko-favorites-v1`
- `ko-recent-v1`
- `ko-history-v1`
- `ko-units`

No account or backend database is required.

## PWA

- Service worker cache version bumped from `ko-v3` to `ko-v4` so Stage 3 assets refresh correctly after deployment.

## Smoke tests

- BMI 65 kg / 170 cm => 22.5.
- BMI 143 lb / 67 in => 22.4 with Imperial labels/result units.
- Favorite toggle updates homepage personalized section.
- Calculation creates local history and recent-calculator entries.
- Cicilan Rp12,000,000, DP Rp0, bunga 0%, 12 bulan => Rp1,000,000/month, total interest Rp0.
- `app.js` and `sw.js` pass Node syntax validation.
- 29 executable inline JavaScript blocks pass syntax validation.
