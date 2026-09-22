# Setup Firebase untuk Stage 8 CMS

CMS cloud bersifat opsional. Website tetap berjalan tanpa Firebase memakai `cms-defaults.js`.

## 1. Buat / pilih Firebase project
Di Firebase Console, pilih project yang akan dipakai untuk KalkulatorOnline. Disarankan menggunakan project khusus website ini agar rules dan billing mudah dipantau.

## 2. Tambahkan Web App
Project Settings → General → Your apps → Web app. Salin nilai `apiKey` dan `projectId`.

Edit `cms-config.js`:

```js
window.KO_CMS_CONFIG = {
  enabled: true,
  firebase: {
    apiKey: 'ISI_API_KEY',
    projectId: 'ISI_PROJECT_ID',
    documentPath: 'cms/site'
  },
  cacheTtlMs: 300000
};
```

`apiKey` Firebase Web App adalah identifier public, bukan password admin. Jangan menaruh service-account private key di project frontend.

## 3. Aktifkan Authentication Email/Password
Firebase Console → Authentication → Sign-in method → Email/Password → Enable.

Buat satu akun admin dengan email dan password yang kuat. Catat **UID** akun tersebut dari daftar Users di Firebase Authentication.

## 4. Aktifkan Cloud Firestore
Buat database Firestore jika belum ada. Lokasi database sebaiknya dipilih sesuai kebutuhan project. Dokumen `cms/site` akan dibuat otomatis saat publish pertama.

## 5. Pasang Security Rules
File `firestore-cms.rules.example` berisi rule minimum CMS. Ganti:

```text
GANTI_DENGAN_UID_ADMIN
```

dengan UID akun admin dari Firebase Authentication.

**Jika project Firebase sudah punya koleksi/rules lain, jangan mengganti seluruh rules secara membabi buta. Merge hanya block `match /cms/site` ke rules yang sudah ada.**

Konsep rules CMS:
- `read`: public, karena isinya memang konten website publik.
- `write`: hanya akun Firebase Authentication dengan UID admin yang ditentukan.

## 6. Deploy lalu buka Admin CMS
Buka:

```text
https://kalkulatoronline.my.id/admin.html
```

Login dengan akun Firebase Authentication.

Alur yang disarankan:
1. Edit konten.
2. Klik **Simpan Draft**.
3. Klik **Preview**.
4. Jika sesuai, klik **Publish**.

## 7. Cache CMS
`cacheTtlMs: 300000` berarti browser publik membaca Firestore maksimal sekitar satu kali per 5 menit per browser/installation ketika cache sudah ada. Ini mengurangi read Firestore.

Setelah admin publish, cache browser admin diperbarui langsung. Browser pengguna lain dapat menerima konten baru setelah TTL berakhir atau saat cache belum tersedia.

## 8. Backup
Sebelum perubahan besar, gunakan **Backup & Restore → Export JSON**. File JSON dapat diimport kembali tanpa menyentuh source code.

## Catatan keamanan
- Jangan pernah memasukkan Firebase Admin SDK private key/service-account JSON ke folder website.
- Gunakan password admin yang unik.
- Firestore Security Rules adalah pengaman utama. URL `admin.html` dan Firebase Web API key tidak dianggap rahasia.
- `admin.html` adalah `noindex`, tetapi URL admin tetap dianggap dapat diketahui publik. Keamanan tidak boleh bergantung pada kerahasiaan URL.
