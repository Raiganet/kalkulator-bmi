// install-janin-summary2.js — menambah 1 baris pemuat janin-summary.js (idempoten)
const fs=require('fs'),path=require('path');
const DRY=process.argv.includes('--dry-run');
const file=path.join(__dirname,'kalkulator-ukuran-janin.html');
console.log('\n=== INSTALL JANIN SUMMARY (external) '+(DRY?'(DRY-RUN)':'(APPLY)')+' ===');
if(!fs.existsSync(file)){console.log('[!!] file tidak ditemukan');process.exit(0);}
let n=fs.readFileSync(file,'utf8');
if(/janin-summary\.js/.test(n)){console.log('[SKIP] sudah memuat janin-summary.js');process.exit(0);}
const tag='<script src="/janin-summary.js"><\/script>\n';
let out=n;
if(/<\/body>/i.test(out)){ out=out.replace(/<\/body>/i, function(m){return tag+m;}); }
else { out=out+tag; }
if(out!==n){ if(!DRY) fs.writeFileSync(file,out,'utf8'); console.log(DRY?'[DRY-RUN] belum disimpan':'[TERSIMPAN] 1 baris pemuat ditambahkan sebelum </body>.'); }
else console.log('Tidak berubah.');
console.log('PENTING: pastikan janin-summary.js ikut ter-upload ke GitHub.\n');