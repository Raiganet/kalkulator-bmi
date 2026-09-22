// fix-bmi-result.js — menambah blok ko-bmi-result-fix ke akhir app.css
// node fix-bmi-result.js --dry-run   |   node fix-bmi-result.js
const fs=require('fs'),path=require('path');
const DRY=process.argv.includes('--dry-run');
const file=path.join(__dirname,'app.css');
console.log('\n=== FIX BMI RESULT '+(DRY?'(DRY-RUN)':'(APPLY)')+' ===');
if(!fs.existsSync(file)){console.log('[!!] app.css tidak ditemukan');process.exit(0);}
let n=fs.readFileSync(file,'utf8');
if(/ko-bmi-result-fix/.test(n)){console.log('[SKIP] blok ko-bmi-result-fix sudah ada.');process.exit(0);}
const BLOCK=`
/* =====================================================================
   ko-bmi-result-fix  —  perbaiki tampilan HASIL BMI (light & dark).
   Terkunci ke hasil BMI via :has(.bmi-circle) -> halaman LAIN tidak kena.
   ===================================================================== */
.result:has(.bmi-circle){background:var(--grad-brand);color:#fff;padding:28px;border-radius:20px;margin-top:24px}
.result:has(.bmi-circle) h2,.result:has(.bmi-circle) .result-header h2{color:#fff;text-align:center;margin-bottom:18px;font-size:22px}
.bmi-circle{width:150px;height:150px;border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;margin:0 auto 20px;background:rgba(255,255,255,.15)!important;border:2px solid rgba(255,255,255,.3);box-shadow:0 10px 30px rgba(0,0,0,.18)}
.bmi-label{font-size:13px;color:rgba(255,255,255,.9);font-weight:600;letter-spacing:.05em;text-transform:uppercase}
.bmi-number{font-size:46px;font-weight:800;color:#fff;line-height:1}
.result-details{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:18px 0}
.result:has(.bmi-circle) .detail-card{background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.18);border-radius:14px;padding:16px;text-align:center}
.detail-icon{font-size:22px;margin-bottom:6px}
.detail-value{font-size:22px;font-weight:800;color:#fff}
.detail-label{font-size:12px;color:rgba(255,255,255,.85);margin-top:4px}
.ideal-weight-section{background:rgba(255,255,255,.12)!important;border:1px solid rgba(255,255,255,.18);border-radius:18px;padding:18px;margin-top:18px}
.ideal-weight-title{display:flex;align-items:center;gap:8px;color:#fff;font-weight:700;font-size:15px;margin-bottom:14px}
.ideal-weight-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.result:has(.bmi-circle) .ideal-weight-card{background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.18);border-radius:14px;padding:16px;text-align:center}
.result:has(.bmi-circle) .ideal-weight-card.highlight{background:rgba(255,255,255,.22)}
.iw-label{font-size:12px;color:rgba(255,255,255,.85)}
.iw-value{font-size:20px;font-weight:800;color:#fff;margin:6px 0}
.iw-unit{font-size:11px;color:rgba(255,255,255,.75)}
.progress-container{margin-top:16px}
.progress-label{display:flex;justify-content:space-between;flex-wrap:wrap;gap:2px 8px;font-size:11px;color:rgba(255,255,255,.92);margin-bottom:8px}
.progress-label span{white-space:nowrap}
.progress-bar{height:12px;background:rgba(255,255,255,.22);border-radius:10px;position:relative;overflow:hidden}
.progress-fill{height:100%;border-radius:10px;background:linear-gradient(90deg,#ffd700,#28a745,#ffc107,#dc3545);transition:width .5s ease}
.progress-marker{position:absolute;top:-8px;width:4px;height:28px;background:#fff;border-radius:2px;box-shadow:0 0 6px rgba(0,0,0,.35)}
.weight-diff{background:rgba(255,255,255,.95)!important;color:#333!important;border-radius:16px;padding:18px;margin-top:16px;text-align:center}
.weight-diff .diff-value{font-size:30px;font-weight:800;margin:8px 0;color:#333}
.weight-diff .diff-value.positive{color:#15803d}
.weight-diff .diff-value.negative{color:#b91c1c}
.weight-diff .diff-value.neutral{color:#6C63FF}
.weight-diff .diff-message{font-size:13px;color:#555;line-height:1.6}
.result:has(.bmi-circle) [class*="kategori-"]{background:rgba(255,255,255,.95)!important}
.result:has(.bmi-circle) .kategori-badge{color:#475467}
.calculate-btn,.btn-primary{display:inline-flex;align-items:center;justify-content:center;gap:8px}
@media(max-width:560px){.result-details{grid-template-columns:1fr!important}.ideal-weight-grid{grid-template-columns:1fr!important}}
/* /ko-bmi-result-fix */
`;
n=n.replace(/\s*$/,'\n')+BLOCK;
if(!DRY)fs.writeFileSync(file,n,'utf8');
console.log(DRY?'[DRY-RUN] belum disimpan.':'[TERSIMPAN] app.css diperbaiki.');
console.log('PENTING: upload app.css ke GitHub setelah ini.\n');