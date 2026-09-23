# Stage 8 — Admin CMS (GAS Edition)

## Perubahan utama

- Backend CMS Firebase/Firestore diganti sepenuhnya menjadi **Google Apps Script + Google Spreadsheet**.
- `admin.html` tetap memakai workflow **Draft → Preview → Publish**.
- `cms-runtime.js` membaca konten publik dari endpoint GAS dengan fallback bundled defaults + cache lokal.
- `cms-admin.js` memakai login/session GAS dan publish ke Spreadsheet.
- `cms-config.js` hanya memerlukan `webAppUrl` GAS; tidak menyimpan password/secret admin.
- Ditambahkan folder `gas-backend/` berisi `Code.gs` dan `appsscript.json`.
- Ditambahkan `CMS-SETUP-GAS.md` untuk setup langkah demi langkah.

## Backend GAS

- Public content endpoint: `GET ?action=content`.
- Health endpoint: `GET ?action=health`.
- Admin login, load, publish, logout melalui POST form-urlencoded.
- Password admin disimpan sebagai salted SHA-256 hash di Script Properties.
- Password plaintext setup dihapus otomatis setelah `setupCms()`.
- Session admin default 4 jam menggunakan Script Cache.
- Login rate limiting.
- `LockService` untuk publish.
- Spreadsheet otomatis memiliki `CMS_Content` dan `CMS_Audit`.
- Audit log tidak menyimpan password atau payload sensitif pengguna.

## Privasi

- GAS CMS hanya menyimpan konten website/config CMS.
- Input dan angka hasil kalkulator pengguna tidak dikirim ke GAS.
- Statistik pribadi Stage 7 tetap local-only.

## PWA

- Cache Service Worker dinaikkan ke `ko-v10`.
- Request ke `script.google.com` / `script.googleusercontent.com` tidak disimpan sebagai app-shell cache.
