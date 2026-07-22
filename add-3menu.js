// =========================================================
//  ADD 3 MENU KEHAMILAN KE DROPDOWN KESEHATAN
//  Menambah: Timer Kontraksi, Penghitung Tendangan, Ukuran Janin
//  tepat di bawah link "Kalkulator Kehamilan" di dropdown.
//  Cara pakai:  node add-3menu.js --dry-run   -> preview dulu
//               node add-3menu.js             -> terapkan & simpan
//  Aman: idempotent (dijalankan ulang = otomatis SKIP, tidak dobel).
// =========================================================
const fs   = require('fs');
const path = require('path');

const DRY_RUN = process.argv.includes('--dry-run');
const folder  = __dirname;

console.log('');
console.log('================================================');
console.log('   ADD 3 MENU KEHAMILAN KE DROPDOWN');
console.log('   (Kontraksi, Tendangan, Ukuran Janin)');
console.log('================================================');
console.log('Folder : ' + folder);
console.log('Mode   : ' + (DRY_RUN
  ? 'DRY-RUN  (hanya PREVIEW, file TIDAK diubah)'
  : 'APPLY    (file AKAN diubah & disimpan)'));
console.log('------------------------------------------------');

const files = fs.readdirSync(folder).filter(f => f.toLowerCase().endsWith('.html'));
if (files.length === 0) {
  console.log('[!!] Tidak ada file .html di folder ini.');
  console.log('     Pastikan add-3menu.js berada SATU FOLDER dengan file HTML.');
  process.exit(0);
}

// Hanya match link kehamilan yang ADA DI DROPDOWN:
//  - TIDAK punya class="..."  (link tools-grid punya class="tool-card" -> ditolak)
//  - Teks mengandung "Kalkulator Kehamilan" (footer cuma "Kehamilan" -> ditolak)
const KEHAMILAN_RE = /<a href="kalkulator-kehamilan\.html">[^<]*Kalkulator Kehamilan[^<]*<\/a>/;

const MENU = [
  ['kalkulator-kontraksi.html',   '⏱️ Timer Kontraksi'],
  ['kalkulator-tendangan.html',   '👶 Penghitung Tendangan'],
  ['kalkulator-ukuran-janin.html','🍉 Ukuran Janin'],
];

let fixed = 0, already = 0, noDrop = 0, warn = 0;

files.forEach(file => {
  const fp = path.join(folder, file);
  const c  = fs.readFileSync(fp, 'utf8');
  const punyaDrop = /class=["'][^"']*dropbtn/i.test(c) || /dropdown-content/i.test(c);

  let status = '', reason = '', out = c;

  if (!KEHAMILAN_RE.test(c)) {
    // tidak ketemu link kehamilan di dropdown
    if (punyaDrop) { status = 'WARN'; warn++;   reason = ' (punya dropdown tapi link kehamilan tidak dikenali -> cek manual)'; }
    else           { status = 'SKIP'; noDrop++; reason = ' (tanpa navbar dropdown)'; }
  } else {
    let changed = false;
    out = c.replace(KEHAMILAN_RE, (m, offset, str) => {
      // cek idempoten: kalau 3 menu sudah ada di dropdown ini, jangan tambah lagi
      const after  = str.slice(offset + m.length, offset + m.length + 500);
      const idxDiv = after.indexOf('</div>');
      const idxKon = after.indexOf('kalkulator-kontraksi.html');
      if (idxKon !== -1 && (idxDiv === -1 || idxKon < idxDiv)) return m; // sudah lengkap

      // deteksi indentasi baris link kehamilan supaya rapi
      const before    = str.slice(0, offset);
      const lineStart = before.lastIndexOf('\n');
      const indent    = before.slice(lineStart + 1);
      const ins = MENU.map(([href, txt]) => '\n' + indent + '<a href="' + href + '">' + txt + '</a>').join('');
      changed = true;
      return m + ins;
    });
    if (changed) { status = 'FIXED'; fixed++;  reason = DRY_RUN ? ' (preview)' : ' (tersimpan)'; }
    else         { status = 'SKIP';  already++; reason = ' (sudah lengkap)'; }
  }

  const tag = status === 'FIXED' ? '[FIXED] ' : status === 'SKIP' ? '[SKIP]  ' : '[WARN]  ';
  console.log(tag + file + reason);

  if (status === 'FIXED' && !DRY_RUN) fs.writeFileSync(fp, out, 'utf8');
});

console.log('------------------------------------------------');
console.log('RINGKASAN:');
console.log('  Total file            : ' + files.length);
console.log('  Ditambah 3 menu       : ' + fixed + (DRY_RUN ? '   (BELUM disimpan -> jalankan tanpa --dry-run)' : ''));
console.log('  Sudah lengkap (skip)  : ' + already);
console.log('  Tanpa dropdown (skip) : ' + noDrop);
console.log('  Cek manual            : ' + warn);
console.log('================================================');
if (DRY_RUN && fixed > 0) console.log('>> Preview oke? Jalankan:  node add-3menu.js');
console.log('');