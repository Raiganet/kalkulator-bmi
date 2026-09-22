# Stage 6 — Deploy Checklist

1. Deploy seluruh isi project, termasuk `monetization-config.js`.
2. Pastikan production domain tetap `https://kalkulatoronline.my.id`.
3. Buka situs dalam incognito, pilih **Hanya esensial**, dan pastikan tidak ada request Google Analytics.
4. Ulangi incognito, pilih **Izinkan analytics**, lalu cek Realtime Google Analytics untuk event seperti `calculator_open` dan `calculator_complete`.
5. Uji BMI, Cicilan, Kehamilan, dan Konversi; pastikan tombol **Bagikan / Salin / Kartu / Ulangi** tampil setelah hasil.
6. Uji **Kartu**: browser desktop seharusnya mengunduh PNG jika file sharing tidak didukung; perangkat yang mendukung Web Share file dapat langsung membuka share sheet.
7. Hitung beberapa kali lalu kembali ke beranda; panel **Paling sering dipakai** harus terisi dari data lokal browser.
8. DevTools > Application > Service Workers: pastikan cache versi `ko-v7` aktif dan halaman kalkulator tetap terbuka saat Offline.
9. Jalankan Lighthouse dari domain production setelah deploy. Stage 6 mengurangi request font duplikat dan menambahkan pengukuran Core Web Vitals, tetapi skor final tergantung hosting, jaringan, dan response production.
10. Biarkan `monetization-config.js` dengan `enabled: false` sampai konten sponsor benar-benar siap. Untuk AdSense/iklan pihak ketiga, tambahkan consent kategori advertising terlebih dahulu.
