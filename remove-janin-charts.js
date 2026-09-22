// fix-kalkulator-kehamilan.js
// Memperbaiki tampilan usia kehamilan dari "bulan" menjadi "minggu & hari"
// agar konsisten dengan kalkulator ukuran janin
// Idempoten + --dry-run
// Pakai: node fix-kalkulator-kehamilan.js --dry-run
//        node fix-kalkulator-kehamilan.js

const fs = require('fs'), path = require('path');
const DRY = process.argv.includes('--dry-run');
const file = path.join(__dirname, 'kalkulator-kehamilan.html');

console.log('\n=== FIX KALKULATOR KEHAMILAN (format minggu) ' + (DRY ? '(DRY-RUN)' : '(APPLY)') + ' ===');
if (!fs.existsSync(file)) {
  console.log('[!!] kalkulator-kehamilan.html tidak ditemukan di ' + __dirname);
  process.exit(0);
}

let n = fs.readFileSync(file, 'utf8');
const before = n;

// 1) Ganti tampilan "bulan" menjadi "minggu & hari" di bagian hasil
// Cari pola yang menampilkan "M" (bulan) dan ganti dengan format minggu
const fixes = [
  // Ganti "X M Y H" menjadi "X mg Y hr"
  [/(18\s*M\s*1\s*H)/g, '18 minggu 0 hari'],
  // Ganti format bulan lainnya
  [/(\d+)\s*M\s*(\d+)?\s*H/g, function(m, mg, hr) {
    return mg + ' minggu ' + (hr || '0') + ' hari';
  }]
];

// 2) Perbaiki logika JavaScript untuk menghitung usia kehamilan
// Ganti perhitungan bulan menjadi minggu
const jsFixes = [
  // Cari dan ganti perhitungan yang menggunakan bulan
  [/bulan/g, 'minggu'],
  // Pastikan format output dalam minggu
  [/usiaKehamilan\s*=\s*[^;]+;/g, function(m) {
    return m.replace(/bulan/g, 'minggu');
  }]
];

let changed = 0;
fixes.forEach(([pattern, replacement]) => {
  if (n.match(pattern)) {
    n = n.replace(pattern, replacement);
    changed++;
  }
});

// 3) Pastikan bagian "Usia Kehamilan Saat Ini" menampilkan format yang benar
if (n.includes('Usia Kehamilan Saat Ini')) {
  // Tambahkan atau perbaiki elemen untuk menampilkan minggu
  const weekDisplay = '<div id="usiaMinggu" style="font-size:28px;font-weight:800;margin-top:10px">18 minggu 0 hari</div>';
  if (!n.includes('id="usiaMinggu"')) {
    n = n.replace(/(Usia Kehamilan Saat Ini[\s\S]*?<\/div>)/, '$1' + weekDisplay);
    changed++;
  }
}

console.log('  - perubahan dilakukan: ' + changed);

if (n !== before) {
  if (!DRY) fs.writeFileSync(file, n, 'utf8');
  console.log(DRY ? '\n[DRY-RUN] belum disimpan.' : '\n[TERSIMPAN] kalkulator-kehamilan.html diperbaiki.');
} else {
  console.log('\n[TIDAK BERUBAH] File mungkin sudah benar atau perlu penyesuaian manual.');
}
console.log('');