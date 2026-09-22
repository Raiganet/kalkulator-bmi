# Stage 4 — SEO + PWA + Analytics

Tanggal: 22 September 2026

## SEO
- Canonical diseragamkan ke `https://kalkulatoronline.my.id` pada 27 halaman publik.
- Sitemap diperbarui menjadi 27 URL publik dengan `lastmod` 2026-09-22.
- `offline.html` diberi `noindex, nofollow` dan dikeluarkan dari sitemap.
- Open Graph dan Twitter Card diterapkan konsisten pada seluruh halaman publik.
- Ditambahkan `og-image.png` 1200×630 untuk social preview.
- Structured data JSON-LD diperbarui:
  - `WebSite + SearchAction` untuk homepage.
  - `WebApplication` untuk semua kalkulator.
  - `Article` untuk halaman panduan/artikel.
  - `FAQPage` untuk FAQ.
  - `WebPage` untuk halaman informasi.
  - `BreadcrumbList` pada halaman publik.
- SearchAction `/?s=` sekarang benar-benar diteruskan ke pencarian website melalui `app.js`.
- `robots.txt` disederhanakan dan menunjuk sitemap canonical.

## PWA
- Cache service worker dinaikkan `ko-v4` → `ko-v5`.
- Semua halaman kalkulator inti dan aset lokal utama diprecache agar tersedia offline setelah instalasi/aktivasi service worker.
- Navigasi offline mendukung URL dengan query string menggunakan `ignoreSearch`/pathname fallback.
- Ditambahkan notifikasi update aplikasi dengan tombol `Perbarui` dan `Nanti`.
- Service worker melakukan update check berkala selama tab aktif (maks. sekali/jam).
- Tombol Install sekarang mengarahkan ke panduan install jika browser tidak menyediakan prompt native (termasuk Safari/iOS).
- Manifest ditingkatkan dengan:
  - `id`, `display_override`, orientation, language.
  - PNG icon 192×192 dan 512×512.
  - maskable icon.
  - 4 app shortcuts: BMI, Kalori, Kehamilan, Cicilan.

## Analytics & Privasi
- Google Analytics tidak lagi dimuat langsung dari HTML.
- `cookie-consent.js` dipasang pada 27 halaman publik.
- Analytics hanya dimuat setelah pengguna memilih `Izinkan analytics`.
- Pilihan `Hanya esensial` tidak memuat Google Analytics.
- Ditambahkan pengaturan privasi yang dapat dibuka kembali dari footer melalui `Pengaturan cookie`.
- Preferensi consent disimpan sebagai `ko-consent-v1`.
- Legacy `cookieConsent` tetap dibaca untuk migrasi pengguna lama.
- Privacy Policy ditulis ulang agar sesuai dengan implementasi aktual:
  - kalkulator tanpa login,
  - favorites/recent/history/unit menggunakan localStorage,
  - analytics opsional,
  - fitur inti tetap aktif tanpa analytics.

## QA
- 27/27 halaman publik memiliki canonical.
- 27/27 halaman publik memiliki OG/Twitter metadata.
- 27/27 halaman publik memuat consent manager.
- 27 URL sitemap unik dan sesuai halaman publik.
- Semua JSON-LD berhasil diparse.
- `app.js`, `sw.js`, `cookie-consent.js`, dan seluruh file JS standalone lolos `node --check`.
- 20 blok JavaScript inline lolos syntax check.
- 0 referensi file lokal hilang.
- 43/43 resource precache service worker ditemukan di project.
- Ukuran asset diverifikasi:
  - Android icon 192×192.
  - Android icon 512×512.
  - Apple icon 180×180.
  - OG image 1200×630.

## Catatan deploy
Setelah deploy, pastikan domain utama di hosting adalah `kalkulatoronline.my.id` dan hostname `www` diarahkan/redirect ke domain utama agar konsisten dengan canonical SEO.
