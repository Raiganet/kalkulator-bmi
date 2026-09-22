# Stage 7 — Deploy Checklist

1. Deploy seluruh isi project, termasuk `kalkulator-populer.html`, `statistik.html`, dan `monetization-config.js`.
2. Pastikan domain utama tetap `https://kalkulatoronline.my.id`.
3. Setelah deploy, hard refresh / update PWA untuk mengambil cache `ko-v8`.
4. Uji: satu perhitungan -> Statistik Saya -> ranking/aktivitas berubah.
5. Uji Result Card -> pilih tema -> Unduh PNG.
6. Uji Pengaturan cookie: Analytics dan Iklan pihak ketiga merupakan toggle terpisah.
7. Monetisasi tetap aman/off selama `KO_MONETIZATION.enabled` masih `false`.
8. Jika kelak mengaktifkan AdSense, isi client + slot ID, ubah mode ke `adsense`, lalu audit kebijakan consent/cookie sesuai wilayah target sebelum `enabled: true`.
9. Jalankan Lighthouse dari URL production untuk Performance, Accessibility, Best Practices, SEO, dan PWA.
