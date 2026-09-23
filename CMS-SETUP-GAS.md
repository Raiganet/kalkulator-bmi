# Setup Google Apps Script untuk KalkulatorOnline CMS

Stage 8 GAS Edition memakai:

- **Google Apps Script Web App** sebagai API/server CMS.
- **Google Spreadsheet** sebagai penyimpanan konten + audit log.
- **Script Properties** untuk email admin, salt, password hash, dan Spreadsheet ID.
- **Script Cache** untuk session admin sementara (default 4 jam).

Website tetap berjalan memakai `cms-defaults.js` jika GAS belum aktif atau sedang tidak tersedia.

## 1. Buat project Google Apps Script

1. Buka `script.google.com`.
2. Buat project baru, misalnya **KalkulatorOnline CMS**.
3. Salin isi `gas-backend/Code.gs` ke file `Code.gs`.
4. Jika ingin, salin juga `gas-backend/appsscript.json` melalui **Project Settings → Show "appsscript.json" manifest file in editor**.

## 2. Siapkan akun admin pertama

Di Apps Script buka **Project Settings → Script Properties** lalu buat dua property sementara:

```text
ADMIN_EMAIL_SETUP = email-admin-anda
ADMIN_PASSWORD_SETUP = password-kuat-minimal-10-karakter
```

Jangan menaruh password ini di GitHub, Vercel, `cms-config.js`, atau Spreadsheet.

Kembali ke editor dan jalankan function:

```text
setupCms
```

Pada eksekusi pertama Google akan meminta izin membuat/mengakses Spreadsheet.

`setupCms()` akan:

1. membuat Spreadsheet **KalkulatorOnline CMS Data** secara otomatis jika belum ada;
2. membuat sheet `CMS_Content` dan `CMS_Audit`;
3. menyimpan `SPREADSHEET_ID` di Script Properties;
4. membuat salt + hash SHA-256 password;
5. menyimpan `ADMIN_EMAIL`, `ADMIN_SALT`, dan `ADMIN_PASSWORD_HASH`;
6. menghapus `ADMIN_EMAIL_SETUP` dan `ADMIN_PASSWORD_SETUP` plaintext.

Lihat **Execution log** untuk URL Spreadsheet yang dibuat.

## 3. Deploy sebagai Web App

Apps Script → **Deploy → New deployment → Web app**.

Gunakan:

```text
Execute as: Me
Who has access: Anyone
```

Alasan `Anyone`: halaman publik KalkulatorOnline perlu membaca konten CMS tanpa login. Endpoint publish tetap membutuhkan token session admin yang hanya diterbitkan setelah login berhasil.

Klik **Deploy**, lalu salin URL yang berakhir dengan:

```text
https://script.google.com/macros/s/AKfy.../exec
```

Gunakan URL `/exec`, bukan URL `/dev`.

## 4. Hubungkan website ke GAS

Edit `cms-config.js`:

```js
window.KO_CMS_CONFIG = {
  enabled: true,
  gas: {
    webAppUrl: 'https://script.google.com/macros/s/AKfy.../exec'
  },
  cacheTtlMs: 300000
};
```

Tidak ada password/admin secret di file tersebut. URL Web App memang endpoint publik.

## 5. Tes server

Buka di browser:

```text
WEB_APP_URL?action=health
```

Harus mengembalikan JSON dengan `"ok":true`.

Lalu buka:

```text
WEB_APP_URL?action=content
```

Sebelum publish pertama biasanya menghasilkan `found:false`. Itu normal karena website akan memakai konten bawaan.

## 6. Login dan publish

1. Deploy website.
2. Buka `/admin.html`.
3. Masukkan email dan password yang dipakai saat `setupCms()`.
4. Edit → **Simpan Draft** → **Preview**.
5. Klik **Publish sekarang**.
6. Konten disimpan ke sheet `CMS_Content`.
7. Aktivitas login/load/publish dicatat di `CMS_Audit` tanpa menyimpan password.

## 7. Cache publik

`cacheTtlMs: 300000` = 5 menit.

Alur publik:

```text
Bundled defaults → cache browser → GAS → Spreadsheet
```

Saat admin berhasil publish, cache browser admin langsung diperbarui. Browser pengunjung lain akan mengambil versi terbaru setelah TTL cache mereka habis.

## 8. Ganti password admin

Di Script Properties buat sementara:

```text
ADMIN_PASSWORD_SETUP = password-baru-minimal-10-karakter
```

Lalu jalankan:

```text
rotateAdminPassword
```

Function akan membuat salt/hash baru dan menghapus property plaintext tersebut.

## 9. Keamanan

- Jangan menyimpan password di frontend atau GitHub.
- Jangan menaruh password di Google Spreadsheet.
- Gunakan password admin yang unik dan panjang.
- Login dibatasi sementara setelah beberapa kegagalan berulang.
- Session admin disimpan server-side di Script Cache dan client-side hanya sebagai token sementara di `sessionStorage`.
- Payload publish divalidasi ukurannya dan harus JSON valid.
- Publish memakai `LockService` agar dua proses tulis tidak bertabrakan.
- Input/hasil kalkulator pengguna tidak dikirim ke GAS CMS.

## 10. Jika GAS bermasalah

Set sementara:

```js
enabled: false
```

Website otomatis memakai `cms-defaults.js`; seluruh kalkulator tetap dapat digunakan.


## Status konfigurasi project ini

Versi ZIP configured ini sudah diarahkan ke Web App GAS berikut:

```text
https://script.google.com/macros/s/AKfycbxzIiHbwdRnBNnT234Knba1dDpTRoy_eVh7WjA9vHd0b_75EvT9cZEJ9Iv5m0KFUgJ-/exec
```

`cms-config.js` sudah memakai `enabled: true`. Jika membuat deployment GAS baru di masa depan, ganti URL tersebut di `cms-config.js` dan naikkan versi cache pada `sw.js`.
