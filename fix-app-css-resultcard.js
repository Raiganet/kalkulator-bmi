// fix-app-css-resultcard.js — menambah blok ko-resultcard-fix ke akhir app.css
// node fix-app-css-resultcard.js --dry-run   |   node fix-app-css-resultcard.js
const fs=require('fs'),path=require('path');
const DRY=process.argv.includes('--dry-run');
const file=path.join(__dirname,'app.css');
console.log('\n=== FIX app.css RESULT-CARD '+(DRY?'(DRY-RUN)':'(APPLY)')+' ===');
if(!fs.existsSync(file)){console.log('[!!] app.css tidak ditemukan di '+__dirname);process.exit(0);}
let n=fs.readFileSync(file,'utf8');
if(/ko-resultcard-fix/.test(n)){console.log('[SKIP] blok ko-resultcard-fix sudah ada.');process.exit(0);}
const BLOCK=`
/* =====================================================================
   ko-resultcard-fix  —  kembalikan kartu hasil transparan + teks putih
   di dalam kotak .result yang ber-gradient, agar TERBACA di mode LIGHT
   maupun DARK. (Mengembalikan desain asli; TIDAK menyentuh logika.)
   Scope ketat ke .result .result-card -> BMI (.detail-card) TIDAK terpengaruh.
   ===================================================================== */
.result .result-card{
  background:rgba(255,255,255,.12) !important;
  border:1px solid rgba(255,255,255,.20) !important;
}
.result .result-card .value,
.result .result-card .label{
  color:#ffffff !important;
}
.result h2{ color:#ffffff !important; }
/* /ko-resultcard-fix */
`;
n=n.replace(/\s*$/,'\n')+BLOCK;
if(!DRY) fs.writeFileSync(file,n,'utf8');
console.log(DRY?'[DRY-RUN] belum disimpan. Jalankan tanpa --dry-run untuk menerapkan.':'[TERSIMPAN] app.css diperbaiki (1 blok ditambahkan di akhir).');
console.log('PENTING: upload app.css ke GitHub setelah ini.\n');