// link-install-everywhere.js — tambah link "Install" ke footer semua halaman (opsional, aman)
// node link-install-everywhere.js --dry-run   |   node link-install-everywhere.js
const fs=require('fs'),path=require('path');
const DRY=process.argv.includes('--dry-run');
const dir=__dirname;
console.log('\n=== LINK INSTALL KE FOOTER '+(DRY?'(DRY-RUN)':'(APPLY)')+' ===');
const files=fs.readdirSync(dir).filter(f=>f.toLowerCase().endsWith('.html'));
const LINK='<a href="cara-install-aplikasi.html">📲 Install</a>';
let n=0;
files.forEach(f=>{
  let c=fs.readFileSync(path.join(dir,f),'utf8');
  if(c.includes('cara-install-aplikasi.html')) return;                 // sudah ada -> skip
  if(!/<div class="footer-links">/.test(c)) return;                    // tidak punya footer-links -> skip
  const out=c.replace(/<div class="footer-links">/, '<div class="footer-links">'+LINK);
  if(out!==c){ if(!DRY) fs.writeFileSync(path.join(dir,f),out,'utf8'); n++; console.log('  [LINK] '+f); }
});
console.log('Footer ditambah link: '+n+(DRY?' (preview)':''));
console.log('CATATAN: kalau ada, upload juga file-file yang [LINK] + cara-install-aplikasi.html.\n');