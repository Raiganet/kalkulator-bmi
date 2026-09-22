# Stage 2 — UI System v3

Stage 2 menyatukan tampilan KalkulatorOnline tanpa mengubah rumus/perhitungan kalkulator.

## Perubahan utama

- Mengganti design system global menjadi **UI System v3** di `app.css`.
- Navbar desktop/mobile diseragamkan di seluruh halaman publik.
- Menghapus markup navbar lama (`.navbar`) yang sebelumnya hanya disembunyikan.
- Footer lama (`.footer`) diganti dengan satu footer premium yang konsisten.
- Bottom navigation mobile diseragamkan: Beranda, Cari, Kesehatan, Keuangan, Tema.
- Drawer mobile disederhanakan dan memakai state/accessibility yang konsisten.
- State menu aktif sekarang mengikuti halaman/kategori yang sedang dibuka.
- Homepage diubah menjadi portal kalkulator:
  - copy hero diperbaiki,
  - grid kalkulator dipindahkan lebih dekat ke hero,
  - label `17 kalkulator • 2 panduan`,
  - trust indicators,
  - card kategori yang lebih informatif.
- Data grid homepage sekarang memakai sumber `CALCS` dari `app.js`; duplikasi `DATA` di `index.html` dihapus.
- Card kalkulator, form, input, selector gender, tombol utama, result card, related tools, artikel, tabel, dan footer memakai style bersama.
- Responsivitas mobile/tablet/desktop diperketat.
- Label form otomatis dihubungkan ke input bila `id` tersedia.
- Result calculator diberi `aria-live="polite"`.
- Semua halaman publik non-offline kini memiliki satu elemen `<main id="main">` untuk skip-link/accessibility.
- Service worker cache di-bump dari `ko-v2` ke `ko-v3` agar CSS/JS Stage 2 tidak tertahan cache lama.

## Yang sengaja tidak diubah

- Rumus BMI, BMR, Kalori, Cicilan, Kehamilan, dan kalkulator lainnya.
- Struktur fitur khusus seperti Timer Kontraksi, Tendangan, dan Ukuran Janin.
- SEO/PWA offline precache penuh; itu dijadwalkan untuk Stage 4.

## Validasi

- 27 halaman publik memakai shared navbar + footer v3.
- 0 markup navbar lama tersisa.
- 0 footer lama tersisa.
- 0 duplicate HTML ID terdeteksi.
- 0 referensi file lokal yang hilang.
- 29 blok JavaScript inline + `app.js` + `sw.js` lolos syntax check.
- Smoke test browser:
  - homepage merender 19 item,
  - drawer mobile membuka dengan benar,
  - Kalkulator Kalori menghitung dan menampilkan hasil,
  - Cicilan dengan bunga 0% tetap bekerja,
  - Kalkulator Kehamilan tidak menghasilkan duplicate-function error.
- Preview visual diuji pada viewport desktop 1440px dan mobile 390px.
