# Stage 8 Deploy Checklist

## Sebelum deploy
- [ ] Jalankan syntax check seluruh file JavaScript.
- [ ] Pastikan `admin.html` memiliki `noindex,nofollow,noarchive`.
- [ ] Pastikan `admin.html` tidak masuk sitemap.
- [ ] Jika belum ingin Cloud CMS, biarkan `cms-config.js` `enabled: false`.
- [ ] Jika Cloud CMS diaktifkan, isi `apiKey`, `projectId`, lalu deploy Firestore Security Rules dengan UID admin.
- [ ] Jangan upload service-account private key ke repository.

## Setelah deploy
- [ ] Buka homepage dan satu halaman kalkulator; pastikan fallback konten tampil normal.
- [ ] Buka `/admin.html`.
- [ ] Ubah teks kecil → Simpan Draft → Preview.
- [ ] Login Firebase admin.
- [ ] Publish satu perubahan uji.
- [ ] Buka incognito/new browser dan verifikasi konten publik termuat dari Firestore.
- [ ] Uji FAQ override dan periksa structured data tetap valid.
- [ ] Uji perubahan daftar tarif PPN.
- [ ] Uji house sponsor jika diaktifkan.
- [ ] Pastikan PWA update ke cache `ko-v9`.

## Jika publish gagal
1. Cek `cms-config.js`.
2. Pastikan Email/Password Authentication aktif.
3. Pastikan akun admin login dengan akun dengan UID yang sama seperti Firestore Rules.
4. Cek rule `match /cms/site`.
5. Periksa Console browser / Network request ke Firestore.

## Rollback cepat
- Admin → Backup & Restore → Import JSON backup → Publish.
- Jika Firestore bermasalah, set `cms-config.js` `enabled: false`; website otomatis kembali ke bundled defaults.
