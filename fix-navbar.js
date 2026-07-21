// =========================================================
//  FIX NAVBAR DROPDOWN  -  KalkulatorOnline.my.id
//  Menambal 2 masalah: (1) menu ketutup kolom input,
//  (2) menu hilang saat mouse turun ke daftar.
//  Cara pakai:  node fix-navbar.js          -> terapkan
//               node fix-navbar.js --dry-run -> hanya preview
// =========================================================
const fs   = require('fs');
const path = require('path');

const DRY_RUN = process.argv.includes('--dry-run');
const folder  = __dirname; // folder tempat script ini berada

console.log('');
console.log('================================================');
console.log('   FIX NAVBAR DROPDOWN  -  KalkulatorOnline');
console.log('================================================');
console.log('Folder : ' + folder);
console.log('Mode   : ' + (DRY_RUN
  ? 'DRY-RUN  (hanya PREVIEW, file TIDAK diubah)'
  : 'APPLY    (file AKAN diubah & disimpan)'));
console.log('------------------------------------------------');

// Ambil semua file .html di folder ini
const files = fs.readdirSync(folder).filter(f => f.toLowerCase().endsWith('.html'));

if (files.length === 0) {
  console.log('[!!] Tidak ada file .html di folder ini.');
  console.log('     Pastikan file fix-navbar.js berada SATU FOLDER dengan file HTML.');
  process.exit(0);
}

// --- Pola pencarian ---
const navbarRe      = /\.navbar\s*\{([^}]*?)margin-bottom:\s*30px;\s*\}/;     // navbar BELUM di-fix
const navbarFixedRe = /\.navbar\s*\{[^}]*z-index:\s*100[^}]*\}/;              // navbar SUDAH di-fix
const hoverRe       = /\.dropdown:hover\s+\.dropdown-content\s*\{\s*display:\s*block;\s*\}/;
const JEMBATAN      = "\n        .dropdown:hover::after { content: ''; position: absolute; left: 0; right: 0; top: 100%; height: 12px; }";

let fixed = 0, skipped = 0, warnCount = 0;

files.forEach(file => {
  const fp   = path.join(folder, file);
  let   c    = fs.readFileSync(fp, 'utf8');

  const punyaNavbar = /\.navbar\s*\{/.test(c);
  const navbarSudah = navbarFixedRe.test(c);
  const hoverSudah  = c.includes('.dropdown:hover::after');

  let berubah  = false;
  let fileWarn = false;
  const alasan = [];

  // --- Tambalan 1: angkat navbar ke lapisan teratas ---
  if (punyaNavbar && !navbarSudah) {
    const c2 = c.replace(navbarRe, (m, inner) =>
      '.navbar {' + inner + 'margin-bottom: 30px; position: relative; z-index: 100; }');
    if (c2 !== c) { c = c2; berubah = true; }
    else { fileWarn = true; alasan.push('format .navbar tidak dikenali'); }
  }

  // --- Tambalan 2: jembatan anti-putus saat hover ---
  if (punyaNavbar && !hoverSudah) {
    const c2 = c.replace(hoverRe, m => m + JEMBATAN);
    if (c2 !== c) { c = c2; berubah = true; }
    else { fileWarn = true; alasan.push('rule hover dropdown tidak dikenali'); }
  }

  // --- Laporan per file ---
  if (!punyaNavbar) {
    console.log('[SKIP]  ' + file + '   (tanpa navbar dropdown)');
    skipped++; return;
  }
  if (navbarSudah && hoverSudah) {
    console.log('[SKIP]  ' + file + '   (sudah di-fix sebelumnya)');
    skipped++; return;
  }
  if (berubah) {
    if (!DRY_RUN) fs.writeFileSync(fp, c, 'utf8');
    console.log('[FIXED] ' + file + (DRY_RUN ? '   (preview)' : '   (tersimpan)'));
    fixed++;
    if (fileWarn) { console.log('        ! sebagian cocok, cek manual: ' + alasan.join(', ')); warnCount++; }
    return;
  }
  // punya navbar tapi tidak ada yang cocok
  console.log('[WARN]  ' + file + '   -> ' + alasan.join(', '));
  warnCount++;
});

// --- Ringkasan ---
console.log('------------------------------------------------');
console.log('RINGKASAN:');
console.log('  Total file   : ' + files.length);
console.log('  Diperbaiki   : ' + fixed + (DRY_RUN ? '   (BELUM disimpan -> jalankan tanpa --dry-run)' : ''));
console.log('  Dilewati     : ' + skipped);
console.log('  Cek manual   : ' + warnCount);
console.log('================================================');
if (DRY_RUN && fixed > 0) {
  console.log('>> Preview oke? Jalankan:  node fix-navbar.js');
}
console.log('');