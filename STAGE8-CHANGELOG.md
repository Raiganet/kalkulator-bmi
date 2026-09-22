# Stage 8 — Admin CMS & Content Management

## Fitur baru
- `admin.html`: panel CMS responsif dengan tab Beranda, Kalkulator Populer, FAQ & Rekomendasi, PPN, Sponsor, Footer, Firebase/Publish, serta Backup & Restore.
- Workflow Draft lokal → Preview → Publish.
- `cms-defaults.js`: fallback konten yang selalu tersedia jika CMS cloud offline/belum dikonfigurasi.
- `cms-config.js`: konfigurasi Firebase satu kali.
- `cms-runtime.js`: loader konten publik dengan sanitasi, cache, preview, fallback, dan Firestore remote content.
- Firebase Authentication Email/Password untuk login admin (password tidak disimpan oleh CMS).
- Firestore Security Rules example untuk membatasi write ke UID admin tertentu.
- Public Firestore content cache default 5 menit untuk mengurangi jumlah read.
- Export/import konfigurasi CMS sebagai JSON.
- FAQ per kalkulator dapat dioverride dari CMS; structured data FAQ mengikuti konten aktif.
- Rekomendasi internal link per kalkulator dapat dikustom dari CMS.
- Kurasi halaman Kalkulator Populer dapat diubah dari CMS.
- Hero, announcement bar, highlight cards, label section dan footer dapat diubah dari CMS.
- Pilihan tarif PPN dapat diubah tanpa mengedit fungsi kalkulator.
- House sponsor first-party dapat diubah dari CMS. AdSense tetap terpisah dan mengikuti advertising consent.
- `admin.html` menggunakan `noindex,nofollow,noarchive` dan tidak masuk sitemap.
- Service worker cache dinaikkan `ko-v8` → `ko-v9`.

## Prinsip keamanan
- Firebase Web API key bukan password/secret; authorization write tetap wajib melalui Firestore Security Rules.
- Password admin dikirim langsung ke Firebase Authentication dan tidak disimpan di source/localStorage.
- ID token hanya disimpan di `sessionStorage` dan kadaluarsa.
- Konten CMS disanitasi sebelum diterapkan ke DOM. Tidak ada editor raw HTML.
- CMS tidak menerima atau menyimpan input/hasil kalkulator pengguna.

## Backward compatibility
- Rumus kalkulator Stage 5–7 tidak diubah.
- Tanpa konfigurasi Firebase, situs tetap berfungsi dengan konten bawaan dan admin tetap dapat memakai draft/preview lokal.
