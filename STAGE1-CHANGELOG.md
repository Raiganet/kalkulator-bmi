# Stage 1 — Stabilization & Bug Fix

## Perbaikan yang diterapkan

- Hasil kalkulator sekarang tersembunyi saat halaman pertama dibuka dan baru muncul setelah perhitungan.
- Kalkulator Kehamilan dibersihkan dari fungsi perhitungan ganda yang mengakses elemen DOM yang tidak tersedia.
- Karakter sisa setelah penutup HTML pada halaman Kehamilan dihapus.
- Pencarian hero di beranda sekarang mempunyai dropdown hasil sendiri.
- Tombol Cari pada bottom navigation mobile sekarang membuka drawer dan langsung memfokuskan pencarian mobile.
- Status aksesibilitas drawer (`aria-hidden` dan `aria-expanded`) sekarang ikut berubah ketika menu dibuka/ditutup.
- Penutupan drawer sekarang memulihkan scroll body secara konsisten.
- Ditambahkan ruang aman bawah pada mobile agar konten tidak tertutup bottom navigation.
- Kalkulator Cicilan sekarang menerima bunga 0% dan memvalidasi harga/DP/jangka waktu dengan lebih aman.
- Kalkulator Body Fat memvalidasi domain rumus `log10()` agar tidak menghasilkan `NaN`/`Infinity` dari input yang tidak valid.
- Selector gender pada BMR, Kalori, dan Body Fat tidak lagi bergantung pada global `event.target`.
- Syntax error FAQ schema di halaman Panduan Install diperbaiki.
- Syntax error pada `sw.js` diperbaiki agar service worker dapat diparse/didaftarkan.

## Validasi

- 39 blok/file JavaScript: syntax check PASS.
- Referensi aset/file lokal yang hilang: 0.
- Duplicate HTML IDs: 0.
- Regression checks Stage 1: PASS.

## Catatan

Stage 1 sengaja tidak melakukan redesign besar atau restrukturisasi seluruh halaman. Pembersihan design system, navbar/footer lama, dan konsolidasi CSS/komponen direncanakan untuk Stage 2.
