# Stage 7 — Growth & Content System

Tanggal: 23 September 2026

## Fitur baru
- Halaman `kalkulator-populer.html`: pilihan cepat + ranking penggunaan lokal.
- Halaman `statistik.html`: dashboard local-only (total hitungan, kalkulator unik, favorit, ranking, kategori, aktivitas 7 hari, recent).
- Timeline aktivitas menyimpan URL kalkulator + timestamp saja; tidak menyimpan input atau nilai hasil.
- Export statistik JSON privacy-safe dan reset statistik terpisah dari favorit/riwayat.
- FAQ kontekstual otomatis untuk 17 kalkulator + FAQPage JSON-LD dinamis.
- Internal linking kontekstual otomatis (bacaan dan kalkulator lanjutan).
- Result Card Studio dengan tema Gradient/Clean/Dark, catatan opsional, tanggal, unduh PNG, dan file sharing.
- Search global sekarang menemukan halaman Kalkulator Populer dan Statistik Saya.
- Consent manager memiliki preferensi iklan pihak ketiga terpisah; consent analytics tidak pernah mengaktifkan iklan.
- Fondasi AdSense tersedia namun `enabled: false` secara default.
- PWA cache `ko-v8` termasuk halaman Populer dan Statistik.

## SEO
- `kalkulator-populer.html` ditambahkan ke sitemap.
- `statistik.html` diberi `noindex, nofollow, noarchive` karena isinya personal/local-only.
- FAQ tiap kalkulator menghasilkan schema FAQPage sesuai konten yang ditampilkan.

## Privasi
- Statistik lokal dan share-card diproses di perangkat.
- AdSense tidak dimuat tanpa advertising consent.
- Tidak ada nilai input/hasil yang dikirim melalui event analytics Stage 7.
