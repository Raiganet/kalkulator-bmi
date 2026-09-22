// reset-janin-summary.js — hapus semua patch inline ko-jsum (penyebab hang),
// lalu pastikan janin-summary.js (versi ringan) termuat. Idempoten + --dry-run.
// TIDAK menyentuh logika kalkulator.
// Pakai:  node reset-janin-summary.js --dry-run
//         node reset-janin-summary.js
const fs=require('fs'),path=require('path');
const DRY=process.argv.includes('--dry-run');
const file=path.join(__dirname,'kalkulator-ukuran-janin.html');
console.log('\n=== RESET JANIN SUMMARY (hapus patch hang + pasang ringan) '+(DRY?'(DRY-RUN)':'(APPLY)')+' ===');
if(!fs.existsSync(file)){console.log('[!!] kalkulator-ukuran-janin.html tidak ditemukan di '+__dirname);process.exit(0);}
let n=fs.readFileSync(file,'utf8'); const before=n;

const reCss =/\/\*\s*ko-jsum-css[\s\S]*?@media\s*print\s*\{\s*\.jsum-act\s*\{\s*display:\s*none\s*\}\s*\}/g;
const reHtml=/<!--\s*ko-jsum-html[\s\S]*?<\/section>/g;
const reJs  =/<script>\s*\/\*\s*ko-jsum-js[\s\S]*?<\/script>/g;

function countRx(rx,s){return (s.match(rx)||[]).length;}
const cCss=countRx(reCss,n), cHtml=countRx(reHtml,n), cJs=countRx(reJs,n);
n=n.replace(reCss,'').replace(reHtml,'').replace(reJs,'');
console.log('  - patch inline dihapus -> CSS:'+cCss+'  HTML:'+cHtml+'  JS:'+cJs);

// rapikan baris kosong beruntun bekas hapusan
n=n.replace(/\n{3,}/g,'\n\n');

// pastikan pemuat versi ringan ada (1x)
if(/janin-summary\.js/.test(n)){
  console.log('  - pemuat janin-summary.js: sudah ada');
} else if(/<\/body>/i.test(n)){
  n=n.replace(/<\/body>/i,'<script src="/janin-summary.js"><\/script>\n</body>');
  console.log('  - pemuat janin-summary.js: DITAMBAHKAN');
} else {
  n+='\n<script src="/janin-summary.js"><\/script>\n';
  console.log('  - pemuat janin-summary.js: DITAMBAHKAN (akhir file)');
}

if(n!==before){ if(!DRY) fs.writeFileSync(file,n,'utf8'); console.log(DRY?'\n[DRY-RUN] belum disimpan. Jalankan tanpa --dry-run untuk menerapkan.':'\n[TERSIMPAN] patch hang dihapus & pemuat ringan dipastikan.'); }
else { console.log('\nTidak ada perubahan (sudah bersih).'); }
console.log('PENTING: upload DUA file ke GitHub -> janin-summary.js (versi ringan baru) + kalkulator-ukuran-janin.html\n');