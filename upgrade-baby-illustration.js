// =========================================================
//  upgrade-baby-illustration.js
//  Mengganti ilustrasi "blob" lama pada kalkulator-ukuran-janin.html
//  dengan ilustrasi 3D yang menyesuaikan usia (dari baby-illustration.js).
//  4 tambalan kecil, idempoten, aman. TIDAK menyentuh logika kalkulator.
//  Pakai:  node upgrade-baby-illustration.js --dry-run
//          node upgrade-baby-illustration.js
// =========================================================
const fs=require('fs'),path=require('path');
const DRY=process.argv.includes('--dry-run');
const dir=__dirname;
const file=path.join(dir,'kalkulator-ukuran-janin.html');
console.log('\n=== UPGRADE BABY ILLUSTRATION '+(DRY?'(DRY-RUN)':'(APPLY)')+' ===');
if(!fs.existsSync(file)){ console.log('[!!] kalkulator-ukuran-janin.html tidak ditemukan di '+dir); process.exit(0); }
let c=fs.readFileSync(file,'utf8'), n=c, log=[];

// A) HTML: svg blob -> container div
const reA=/<svg class="sil" id="babySil"[\s\S]*?<\/svg>/;
if(reA.test(n)){ n=n.replace(reA,'<div class="sil3d" id="babySil" aria-hidden="true"></div>'); log.push('HTML: svg blob -> div.sil3d'); }
else if(/class="sil3d" id="babySil"/.test(n)){ log.push('HTML: sudah div.sil3d (skip)'); }
else { log.push('HTML: MARKER svg sil tidak ketemu (cek manual)'); }

// B) CSS: aturan .fz-baby svg.sil{...} -> aturan sil3d (3D shadow + pop)
const reB=/\.fz-baby svg\.sil\{[^}]*\}/;
if(reB.test(n)){ n=n.replace(reB,'.fz-baby .sil3d{width:80%;max-width:210px;aspect-ratio:120/150;display:grid;place-items:center;animation:fzfloat 4s ease-in-out infinite}.fz-baby .sil3d svg{width:100%;height:100%;display:block;filter:drop-shadow(0 10px 16px rgba(124,58,237,.28))}.fz-baby .sil3d.pop{animation:fzfloat 4s ease-in-out infinite,fzbabyfade .45s ease}@keyframes fzbabyfade{from{opacity:.2}to{opacity:1}}'); log.push('CSS: sil -> sil3d (+bayangan 3D +animasi pop)'); }
else if(/\.fz-baby \.sil3d\{/.test(n)){ log.push('CSS: sudah sil3d (skip)'); }
else { log.push('CSS: aturan .fz-baby svg.sil tidak ketemu (cek manual)'); }

// C) CSS: selector reduced-motion
const reC=/\.fz-baby svg\.sil,\.fz-fruit \.emo\{animation:none\}/;
if(reC.test(n)){ n=n.replace(reC,'.fz-baby .sil3d,.fz-fruit .emo{animation:none}'); log.push('CSS: selector reduced-motion diperbarui'); }

// D) JS: baris scale sil -> panggil babySVG(w) + animasi pop saat stage berubah
const reD=/const sil=\$\('babySil'\);[^;]*;[^;]*;/;
if(reD.test(n)){ n=n.replace(reD,"$('babySil').innerHTML=(typeof babySVG==='function'?babySVG(w):'');var _ns=(typeof babyStage==='function'?babyStage(w):0);if(window.__bstage&&window.__bstage!==_ns){var _be=$('babySil');_be.classList.remove('pop');void _be.offsetWidth;_be.classList.add('pop');}window.__bstage=_ns;"); log.push('JS: scale sil -> babySVG(w) + pop'); }
else if(/babySVG\(w\)/.test(n)){ log.push('JS: sudah pakai babySVG (skip)'); }
else { log.push('JS: baris scale sil tidak ketemu (cek manual)'); }

// E) HEAD: muat baby-illustration.js (sekali)
if(/baby-illustration\.js/.test(n)){ log.push('HEAD: baby-illustration.js sudah dimuat (skip)'); }
else { const reE=/<link rel="stylesheet" href="\/app\.css">/; if(reE.test(n)){ n=n.replace(reE,'<link rel="stylesheet" href="/app.css">\n<script src="/baby-illustration.js"><\/script>'); log.push('HEAD: <script baby-illustration.js> ditambahkan'); } else { log.push('HEAD: link app.css tidak ketemu -> tambahkan manual <script src="/baby-illustration.js"></script> di <head>'); } }

log.forEach(l=>console.log('  - '+l));
if(n!==c){ if(!DRY) fs.writeFileSync(file,n,'utf8'); console.log(DRY?'\n[DRY-RUN] belum disimpan. Jalankan tanpa --dry-run untuk menerapkan.':'\n[TERSIMPAN] kalkulator-ukuran-janin.html diperbarui.'); }
else { console.log('\nTidak ada perubahan.'); }
console.log('PENTING: pastikan baby-illustration.js ada di folder ini & ikut ter-upload ke GitHub.\n');