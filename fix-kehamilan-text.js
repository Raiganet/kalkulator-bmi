// fix-kehamilan-text.js
// Memperbaiki teks yang tidak terlihat di mode light
// node fix-kehamilan-text.js --dry-run
// node fix-kehamilan-text.js

const fs = require('fs'), path = require('path');
const DRY = process.argv.includes('--dry-run');
const file = path.join(__dirname, 'kalkulator-kehamilan.html');

console.log('\n=== FIX TEKS KEHAMILAN ' + (DRY ? '(DRY-RUN)' : '(APPLY)') + ' ===');
if (!fs.existsSync(file)) {
  console.log('[!!] File tidak ditemukan');
  process.exit(0);
}

let n = fs.readFileSync(file, 'utf8');
const before = n;

// CSS Fix untuk memastikan teks terlihat di semua mode
const cssFix = `
/* ===== FIX TEKS KARTU KEHAMILAN ===== */
/* Pastikan kartu memiliki background yang tepat */
.kalkulator-kehamilan .info-card,
.kalkulator-kehamilan .result-card,
.kalkulator-kehamilan [class*="card"] {
  background: #ffffff !important;
  border: 2px solid #e5e7eb !important;
}

/* Teks harus gelap di light mode */
.kalkulator-kehamilan .info-card *,
.kalkulator-kehamilan .result-card *,
.kalkulator-kehamilan .info-card div,
.kalkulator-kehamilan .result-card div {
  color: #1f2937 !important;
}

/* Judul kartu - ungu gelap */
.kalkulator-kehamilan .info-card h3,
.kalkulator-kehamilan .result-card h3,
.kalkulator-kehamilan h2,
.kalkulator-kehamilan .judul-info {
  color: #6d28d9 !important;
  font-weight: 700 !important;
}

/* Nilai besar - ungu tua agar kontras */
.kalkulator-kehamilan .nilai-besar,
.kalkulator-kehamilan .hasil-nilai {
  color: #5b21b6 !important;
  font-size: 28px !important;
  font-weight: 800 !important;
  margin: 10px 0 !important;
}

/* Label - abu-abu gelap */
.kalkulator-kehamilan .label-info,
.kalkulator-kehamilan .label {
  color: #4b5563 !important;
  font-size: 14px !important;
  font-weight: 600 !important;
}

/* Dark mode - tetap pertahankan kontras baik */
@media (prefers-color-scheme: dark) {
  .kalkulator-kehamilan .info-card,
  .kalkulator-kehamilan .result-card {
    background: #1f2937 !important;
    border-color: #374151 !important;
  }
  
  .kalkulator-kehamilan .info-card *,
  .kalkulator-kehamilan .result-card * {
    color: #f9fafb !important;
  }
  
  .kalkulator-kehamilan .nilai-besar {
    color: #a78bfa !important;
  }
  
  .kalkulator-kehamilan .label-info {
    color: #d1d5db !important;
  }
}

/* Fallback untuk semua elemen teks */
.kalkulator-kehamilan div:not([style*="color"]) {
  color: #1f2937;
}
`;

let changes = 0;

// Tambahkan CSS fix
if (!n.includes('FIX TEKS KARTU KEHAMILAN')) {
  if (n.includes('</style>')) {
    n = n.replace('</style>', cssFix + '\n</style>');
    changes++;
    console.log('  ✅ CSS fix ditambahkan');
  } else if (n.includes('</head>')) {
    n = n.replace('</head>', '<style>\n' + cssFix + '\n</style>\n</head>');
    changes++;
    console.log('  ✅ CSS fix ditambahkan (style tag)');
  } else {
    console.log('  ❌ </style> atau </head> tidak ditemukan');
  }
} else {
  console.log('  ℹ️  CSS fix sudah ada (skip)');
}

// Perbaiki inline style pada kartu jika ada
if (n.includes('style="') && n.includes('Informasi Kehamilan')) {
  // Ganti style inline yang mungkin menyebabkan masalah
  n = n.replace(/style="color:\s*#fff[^;]*;/gi, 'style="color: #1f2937;');
  n = n.replace(/style="color:\s*white[^;]*;/gi, 'style="color: #1f2937;');
  changes++;
  console.log('  ✅ Inline style diperbaiki');
}

if (n !== before) {
  if (!DRY) fs.writeFileSync(file, n, 'utf8');
  console.log(DRY ? '\n⏳ [DRY-RUN] belum disimpan.' : '\n✅ [TERSIMPAN] kalkulator-kehamilan.html diperbaiki.');
} else {
  console.log('\nℹ️  Tidak ada perubahan.');
}

console.log('Total perubahan: ' + changes);
console.log('\n Setelah upload, test di mode light & dark!');
console.log('');