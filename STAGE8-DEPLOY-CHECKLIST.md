# Stage 8 GAS — Deploy Checklist

- [x] Buat Apps Script project dan salin `gas-backend/Code.gs`.
- [x] Tambahkan sementara `ADMIN_EMAIL_SETUP` dan `ADMIN_PASSWORD_SETUP` di Script Properties.
- [x] Jalankan `setupCms()` sekali.
- [x] Pastikan Spreadsheet CMS berhasil dibuat dan URL-nya muncul di execution log.
- [x] Deploy Apps Script sebagai Web App: **Execute as Me**, access **Anyone**. *(URL /exec sudah tersedia; pastikan setting access memang Anyone saat deployment).*
- [x] Salin URL `/exec` ke `cms-config.js` dan set `enabled: true`.
- [ ] Buka `WEB_APP_URL?action=health` dan pastikan `ok:true`.
- [ ] Deploy website ke production.
- [ ] Login `/admin.html` menggunakan email/password admin.
- [ ] Uji Draft → Preview → Publish.
- [ ] Buka browser/incognito lain dan pastikan konten published termuat dari GAS.
- [ ] Periksa sheet `CMS_Audit` setelah login/publish.
- [ ] Pastikan source GitHub tidak berisi password admin.
- [ ] Pastikan kalkulator tetap berjalan saat `cms-config.js enabled:false`.
- [ ] Uji PWA update/cache setelah deploy.
