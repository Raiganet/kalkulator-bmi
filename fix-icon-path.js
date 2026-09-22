// fix-icon-path.js — ganti /icons/icon-192.png -> /icons/icon.svg di semua HTML
// node fix-icon-path.js --dry-run   |   node fix-icon-path.js
const fs=require('fs'),path=require('path');
const DRY=process.argv.includes('--dry-run');
const dir=__dirname;
console.log('\n=== FIX ICON PATH '+(DRY?'(DRY-RUN)':'(APPLY)')+' ===');
const files=fs.readdirSync(dir).filter(f=>f.toLowerCase().endsWith('.html'));
let total=0;
files.forEach(f=>{
  let c=fs.readFileSync(path.join(dir,f),'utf8');
  const n=c.replace(/\/icons\/icon-192\.png/g,'/icons/icon.svg');
  if(n!==c){ if(!DRY)fs.writeFileSync(path.join(dir,f),n,'utf8'); total++; console.log('  [FIXED] '+f); }
});
console.log('File diubah: '+total+(DRY?' (preview)':''));
console.log('PENTING: upload icons/icon.svg, manifest.webmanifest, sw.js, offline.html, DAN semua HTML yang [FIXED].\n');