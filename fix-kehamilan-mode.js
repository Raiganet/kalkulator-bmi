// fix-light-mode.js
// Memperbaiki warna teks di mode light agar terlihat
// node fix-light-mode.js --dry-run
// node fix-light-mode.js

const fs = require('fs'), path = require('path');
const DRY = process.argv.includes('--dry-run');
const file = path.join(__dirname, 'kalkulator-kehamilan.html');

console.log('\n=== FIX LIGHT MODE ' + (DRY ? '(DRY-RUN)' : '(APPLY)') + ' ===');
if (!fs.existsSync(file)) {
  console.log('[!!] File tidak ditemukan');
  process.exit(0);
}

let n = fs.readFileSync(file, 'utf8');
const before = n;

// CSS untuk memperbaiki mode light
const cssFix = `
/* ===== PERBAIKI MODE LIGHT ===== */
/* Default (tanpa dark mode) - teks harus gelap */
.result-card .value {
  color: #1f2937 !important; /* Abu gelap */
  font-size: 24px !important;
  font-weight: 800 !important;
}

.result-card .label {
  color: #4b5563 !important; /* Abu sedang */
  font-size: 13px !important;
}

.result h2 {
  color: #6d28d9 !important; /* Ungu */
}

/* Dark mode - teks putih */
[data-theme="dark"] .result-card .value,
body.dark-mode .result-card .value {
  color: #f9fafb !important; /* Putih */
}

[data-theme="dark"] .result-card .label,
body.dark-mode .result-card .label {
  color: #d1d5db !important; /* Abu terang */
}

[data-theme="dark"] .result h2,
body.dark-mode .result h2 {
  color: white !important;
}
`;

let changes = 0;

// Tambahkan CSS fix
if (!n.includes('PERBAIKI MODE LIGHT')) {
  if (n.includes('</style>')) {
    n = n.replace('</style>', cssFix + '\n</style>');
    changes++;
    console.log('  ✅ CSS mode light ditambahkan');
  } else {
    console.log('  ❌ </style> tidak ditemukan');
  }
} else {
  console.log('  ℹ️  CSS sudah ada (skip)');
}

if (n !== before) {
  if (!DRY) fs.writeFileSync(file, n, 'utf8');
  console.log(DRY ? '\n [DRY-RUN] belum disimpan.' : '\n✅ [TERSIMPAN] kalkulator-kehamilan.html diperbaiki.');
} else {
  console.log('\n️  Tidak ada perubahan.');
}

console.log('Total perubahan: ' + changes);
console.log('\n📝 Setelah upload, test di mode light & dark!');
console.log('');