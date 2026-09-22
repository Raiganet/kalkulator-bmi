// fix-kehamilan-display.js
// Memperbaiki tampilan kalkulator kehamilan - teks putih/hilang
// Idempoten + --dry-run
// node fix-kehamilan-display.js --dry-run
// node fix-kehamilan-display.js

const fs = require('fs'), path = require('path');
const DRY = process.argv.includes('--dry-run');
const file = path.join(__dirname, 'kalkulator-kehamilan.html');

console.log('\n=== FIX KEHAMILAN DISPLAY ' + (DRY ? '(DRY-RUN)' : '(APPLY)') + ' ===');
if (!fs.existsSync(file)) {
  console.log('[!!] kalkulator-kehamilan.html tidak ditemukan');
  process.exit(0);
}

let n = fs.readFileSync(file, 'utf8');
const before = n;

// 1) Tambahkan CSS fix untuk memastikan teks terlihat
const cssFix = `
/* Fix tampilan kartu kehamilan - pastikan teks terlihat */
.kalkulator-kehamilan .info-card,
.kalkulator-kehamilan .result-card,
.kalkulator-kehamilan [class*="card"] {
  color: #1f2937 !important;
  background: #ffffff !important;
}
.kalkulator-kehamilan .info-card *,
.kalkulator-kehamilan .result-card * {
  color: #1f2937 !important;
}
.kalkulator-kehamilan .info-card h3,
.kalkulator-kehamilan .result-card h3 {
  color: #6d28d9 !important;
  font-weight: 700 !important;
}
.kalkulator-kehamilan .nilai-besar {
  color: #6d28d9 !important;
  font-size: 28px !important;
  font-weight: 800 !important;
  margin: 10px 0 !important;
}
.kalkulator-kehamilan .label-info {
  color: #6b7280 !important;
  font-size: 14px !important;
  font-weight: 500 !important;
}
`;

// 2) Perbaiki struktur HTML kartu hasil
const htmlFix = `
<section class="hasil-kehamilan" id="hasilKehamilan" style="display:none;margin-top:30px">
  <div class="info-grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:20px;margin-top:20px">
    <div class="info-card" style="background:#f9fafb;border:2px solid #e5e7eb;border-radius:16px;padding:24px;text-align:center">
      <div class="label-info">Usia Kehamilan</div>
      <div class="nilai-besar" id="usiaKehamilan" style="color:#6d28d9;font-size:32px;font-weight:800;margin:10px 0">-</div>
      <div style="color:#6b7280;font-size:13px">Minggu dan Hari</div>
    </div>
    <div class="info-card" style="background:#f9fafb;border:2px solid #e5e7eb;border-radius:16px;padding:24px;text-align:center">
      <div class="label-info">Trimester</div>
      <div class="nilai-besar" id="trimesterInfo" style="color:#6d28d9;font-size:28px;font-weight:800;margin:10px 0">-</div>
      <div style="color:#6b7280;font-size:13px">Fase Kehamilan</div>
    </div>
    <div class="info-card" style="background:#f9fafb;border:2px solid #e5e7eb;border-radius:16px;padding:24px;text-align:center">
      <div class="label-info">Hari Perkiraan Lahir (HPL)</div>
      <div class="nilai-besar" id="hplInfo" style="color:#6d28d9;font-size:24px;font-weight:800;margin:10px 0">-</div>
      <div style="color:#6b7280;font-size:13px">Estimasi Persalinan</div>
    </div>
    <div class="info-card" style="background:#f9fafb;border:2px solid #e5e7eb;border-radius:16px;padding:24px;text-align:center">
      <div class="label-info">Sisa Hari</div>
      <div class="nilai-besar" id="sisaHari" style="color:#6d28d9;font-size:28px;font-weight:800;margin:10px 0">-</div>
      <div style="color:#6b7280;font-size:13px">Menuju HPL</div>
    </div>
  </div>
  <div style="margin-top:20px;background:#f0f9ff;border-left:4px solid #0ea5e9;padding:16px;border-radius:12px">
    <div style="color:#0369a1;font-size:14px;line-height:1.6">
      <strong>Catatan:</strong> Perhitungan ini berdasarkan rumus Naegele (HPHT + 280 hari). 
      Hasil USG dan konsultasi dokter/bidan adalah acuan utama.
    </div>
  </div>
</section>
`;

let changes = 0;

// Tambahkan CSS fix
if (!n.includes('Fix tampilan kartu kehamilan')) {
  if (n.includes('</style>')) {
    n = n.replace('</style>', cssFix + '\n</style>');
    changes++;
    console.log('  - CSS fix ditambahkan');
  } else if (n.includes('</head>')) {
    n = n.replace('</head>', '<style>' + cssFix + '</style>\n</head>');
    changes++;
    console.log('  - CSS fix ditambahkan (via style tag)');
  } else {
    console.log('  [!] </style> atau </head> tidak ditemukan');
  }
} else {
  console.log('  - CSS fix sudah ada (skip)');
}

// Ganti atau tambahkan section hasil
if (n.includes('id="hasilKehamilan"')) {
  // Ganti yang sudah ada
  const re = /<section[^>]*id="hasilKehamilan"[\s\S]*?<\/section>/;
  if (re.test(n)) {
    n = n.replace(re, htmlFix);
    changes++;
    console.log('  - Section hasil diperbaiki');
  }
} else {
  // Tambahkan setelah form
  const formEnd = n.indexOf('</form>');
  if (formEnd !== -1) {
    n = n.substring(0, formEnd + 7) + '\n' + htmlFix;
    changes++;
    console.log('  - Section hasil ditambahkan');
  } else {
    console.log('  [!] Form tidak ditemukan');
  }
}

// Perbaiki JavaScript perhitungan
const jsFix = `
function hitungKehamilan() {
  const hphtInput = document.getElementById('hpht').value;
  if (!hphtInput) {
    alert('Silakan masukkan tanggal HPHT terlebih dahulu!');
    return;
  }
  
  const hpht = new Date(hphtInput);
  const today = new Date();
  
  // Hitung HPL (HPHT + 280 hari)
  const hpl = new Date(hpht);
  hpl.setDate(hpl.getDate() + 280);
  
  // Hitung usia kehamilan dalam hari
  const diffTime = Math.abs(today - hpht);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const minggu = Math.floor(diffDays / 7);
  const hari = diffDays % 7;
  
  // Hitung sisa hari
  const sisaTime = hpl - today;
  const sisaHari = Math.ceil(sisaTime / (1000 * 60 * 60 * 24));
  
  // Tentukan trimester
  let trimester = '';
  if (minggu < 14) trimester = 'Trimester 1';
  else if (minggu < 28) trimester = 'Trimester 2';
  else trimester = 'Trimester 3';
  
  // Tampilkan hasil
  document.getElementById('usiaKehamilan').textContent = minggu + ' minggu ' + hari + ' hari';
  document.getElementById('trimesterInfo').textContent = trimester;
  document.getElementById('hplInfo').textContent = hpl.toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'});
  document.getElementById('sisaHari').textContent = sisaHari + ' hari';
  
  document.getElementById('hasilKehamilan').style.display = 'block';
  
  // Scroll ke hasil
  document.getElementById('hasilKehamilan').scrollIntoView({behavior: 'smooth', block: 'center'});
}

// Tambahkan event listener
document.addEventListener('DOMContentLoaded', function() {
  const btn = document.querySelector('button[type="submit"], button[onclick*="hitung"]');
  if (btn) {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      hitungKehamilan();
    });
  }
});
`;

// Ganti atau tambahkan JavaScript
if (n.includes('function hitungKehamilan()')) {
  const re = /function hitungKehamilan\(\)[\s\S]*?(?=<\/script>|function|\n\n)/;
  if (re.test(n)) {
    n = n.replace(re, jsFix.trim());
    changes++;
    console.log('  - JavaScript perhitungan diperbaiki');
  }
} else {
  // Tambahkan sebelum </body>
  if (n.includes('</body>')) {
    n = n.replace('</body>', '<script>\n' + jsFix + '\n</script>\n</body>');
    changes++;
    console.log('  - JavaScript ditambahkan');
  }
}

if (n !== before) {
  if (!DRY) fs.writeFileSync(file, n, 'utf8');
  console.log(DRY ? '\n[DRY-RUN] belum disimpan.' : '\n[TERSIMPAN] kalkulator-kehamilan.html diperbaiki.');
} else {
  console.log('\n[TIDAK BERUBAH] Tidak ada perubahan yang diperlukan.');
}

console.log('Total perubahan: ' + changes);
console.log('');