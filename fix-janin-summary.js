// =========================================================
//  fix-janin-summary.js
//  Memperbaiki bug "ringkasan tidak sesuai minggu" pada
//  kalkulator-ukuran-janin.html dengan cara:
//   1) mencopot blok ringkasan lama (ko-jsum-*), lalu
//   2) memasang versi baru yang mengambil SEMUA data dari
//      sumber yang sama dengan tampilan (parameter renderRich),
//      sehingga kartu MUSTAHIL berbeda minggu dengan layar.
//  TIDAK menyentuh logika kalkulator. Idempoten + --dry-run.
//  Pakai:  node fix-janin-summary.js --dry-run
//          node fix-janin-summary.js
// =========================================================
const fs=require('fs'),path=require('path');
const DRY=process.argv.includes('--dry-run');
const dir=__dirname;
const file=path.join(dir,'kalkulator-ukuran-janin.html');
console.log('\n=== FIX JANIN SUMMARY (clean-reinstall) '+(DRY?'(DRY-RUN)':'(APPLY)')+' ===');
if(!fs.existsSync(file)){ console.log('[!!] kalkulator-ukuran-janin.html tidak ditemukan di '+dir); process.exit(0); }
let n=fs.readFileSync(file,'utf8');
const before=n;

/* ---------- A) COPOT blok lama (kalau ada) ---------- */
const reCss=/\n*\/\* ko-jsum-css[\s\S]*?@media print\{\.jsum-act\{display:none\}\}\n*/;
const reHtml=/\n*<!-- ko-jsum-html[\s\S]*?<\/section>\n*/;
const reJs=/<script>\n\/\* ko-jsum-js[\s\S]*?<\/script>\n*/;
let removed=0;
if(reCss.test(n)){ n=n.replace(reCss,'\n'); removed++; }
if(reHtml.test(n)){ n=n.replace(reHtml,'\n'); removed++; }
if(reJs.test(n)){ n=n.replace(reJs,'\n'); removed++; }
console.log('  - blok lama dicopot: '+removed);

/* guard: kalau marker lama masih tersisa, JANGAN tambah (cegah duplikat) */
if(/ko-jsum-css/.test(n)||/ko-jsum-html/.test(n)||/ko-jsum-js/.test(n)){
  console.log('\n[STOP] Marker ko-jsum lama masih tersisa setelah penghapusan (format file mungkin sudah berubah).');
  console.log('       Hapus manual 3 blok ber-marker "ko-jsum-css / ko-jsum-html / ko-jsum-js" lalu jalankan ulang.');
  process.exit(0);
}
/* kalau sudah versi baru (v2), skip */
if(/ko-jsum-v2/.test(n)){ console.log('\n[SKIP] Sudah versi terbaru (v2). Tidak ada perubahan.'); process.exit(0); }

/* ---------- B) PASANG versi baru ---------- */
const CSS=`
/* ko-jsum-css ko-jsum-v2 : kartu ringkasan minggu (auto-sync, sumber tunggal) */
.fm-sumcard{display:none}
.fm-sumcard.show{display:block;animation:fzfade .4s ease}
.jsum-nums{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:6px 0 14px}
.jsum-nm{background:var(--surface-solid);border:1px solid var(--border);border-radius:14px;padding:14px;text-align:center;min-width:0}
.jsum-nm .v{font-size:clamp(16px,3.5vw,22px);font-weight:800;line-height:1.1;word-break:break-word}
.jsum-nm .v.grad{background:var(--grad-brand);-webkit-background-clip:text;background-clip:text;color:transparent}
.jsum-nm .l{font-size:11px;color:var(--text-3);font-weight:600;margin-top:5px;text-transform:uppercase;letter-spacing:.03em}
.jsum-narr{font-size:14px;line-height:1.85;color:var(--text-2)}
.jsum-narr p{margin:0 0 10px}
.jsum-narr .tip{color:var(--text);font-weight:600}
.jsum-narr .disc{display:block;font-size:12px;color:var(--text-3);border-left:3px solid var(--border);padding-left:12px;margin-top:4px}
.jsum-act{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-top:14px}
.jsum-act button{display:inline-flex;align-items:center;gap:6px;padding:9px 14px;border-radius:12px;border:1px solid var(--border);background:var(--surface-solid);font-weight:600;font-size:13px;color:var(--text-2);cursor:pointer}
.jsum-act button svg{width:15px;height:15px}
.jsum-act button:hover{border-color:var(--c-primary);color:var(--c-primary)}
.jsum-act .jsum-sp{flex:1}
.jsum-act label{display:inline-flex;align-items:center;gap:7px;font-size:12px;color:var(--text-3);font-weight:600;cursor:pointer}
.jsum-act input{width:16px;height:16px;accent-color:var(--c-primary)}
@media(max-width:420px){.jsum-nums{grid-template-columns:1fr}}
@media print{.jsum-act{display:none}}
`;
const HTML=`
<!-- ko-jsum-html ko-jsum-v2 : kartu ringkasan minggu (auto-sync) -->
<section class="fz-card fm-sumcard" id="jsumCard" aria-live="polite" aria-label="Ringkasan minggu kehamilan">
  <h2><i data-lucide="sparkles"></i> Ringkasan Minggu Ini <span class="fz-h2sub" id="jsumWeek">Minggu 20</span></h2>
  <div class="jsum-nums">
    <div class="jsum-nm"><div class="v grad" id="jsumBerat">-</div><div class="l">Berat</div></div>
    <div class="jsum-nm"><div class="v" id="jsumPanjang">-</div><div class="l">Panjang</div></div>
    <div class="jsum-nm"><div class="v" id="jsumTri">-</div><div class="l">Trimester</div></div>
  </div>
  <div class="jsum-narr" id="jsumNarr"></div>
  <div class="jsum-act">
    <button type="button" id="jsumSpeak"><i data-lucide="volume-2"></i> Dengarkan</button>
    <button type="button" id="jsumStop"><i data-lucide="square"></i> Berhenti</button>
    <span class="jsum-sp"></span>
    <label><input type="checkbox" id="jsumAutoVoice"> Bacakan otomatis lain kali</label>
    <button type="button" id="jsumClose"><i data-lucide="x"></i> Sembunyikan</button>
  </div>
</section>
`;
const JS=`<script>
/* ko-jsum-js ko-jsum-v2 : wrapper pasif — sumber tunggal (TIDAK ubah logika) */
(function(){
  function el(id){return document.getElementById(id);}
  function clean(s){return (s||'').replace(/<[^>]+>/g,'').replace(/\\s+/g,' ').trim();}
  function triOf(w){return w<=13?1:w<=27?2:3;}
  var VKEY='ko-janin-autovoice';
  function getV(){try{return localStorage.getItem(VKEY)==='1';}catch(e){return false;}}
  function setV(v){try{localStorage.setItem(VKEY,v?'1':'0');}catch(e){}}

  // w & d datang LANGSUNG dari renderRich(w,d,percent) -> pasti sama dengan yang ditampilkan
  function renderSummary(w, d){
    var card=el('jsumCard'); if(!card||!w) return;
    var buah, berat, panjang;
    if(d){
      buah=d.fr||'';
      berat=(d.b<1? d.b : (d.b||0).toLocaleString('id-ID'))+' gram';
      panjang=(d.l||0)+' cm';
    } else { // fallback (hanya saat init): baca DOM yang sudah sinkron
      buah=clean(el('fruitName')&&el('fruitName').textContent);
      var dv=el('detailGrid')?el('detailGrid').querySelectorAll('.fz-d .dv'):[];
      berat=dv[0]?clean(dv[0].textContent):'-';
      panjang=dv[1]?clean(dv[1].textContent):'-';
    }
    var tri='Trimester '+triOf(w);
    var liNow=el('devBaby')?el('devBaby').querySelector('li.now span'):null;
    var milestone=liNow?clean(liNow.textContent).replace('Minggu ini','').trim():'';
    var tipEl=el('tipsList')?el('tipsList').querySelector('li span'):null;
    var tip=tipEl?clean(tipEl.textContent):'';

    el('jsumWeek').textContent='Minggu '+w;
    el('jsumBerat').textContent=berat;
    el('jsumPanjang').textContent=panjang;
    el('jsumTri').textContent=tri;

    var p=[];
    p.push('Pada minggu ke-'+w+' ('+tri+'), bayi Anda seukuran <strong>'+buah+'</strong>, dengan perkiraan berat <strong>'+berat+'</strong> dan panjang <strong>'+panjang+'</strong>.');
    if(milestone) p.push('Perkembangan utama minggu ini: <em>'+milestone+'.</em>');
    if(tip) p.push('<span class="tip">Tips minggu ini: '+tip+'</span>');
    p.push('<span class="disc">Angka ini estimasi atau median referensi berdasarkan usia kehamilan; pertumbuhan tiap ibu bisa berbeda. Gunakan hasil USG dan konsultasi dokter atau bidan sebagai acuan utama.</span>');
    el('jsumNarr').innerHTML=p.map(function(x){return '<p>'+x+'</p>';}).join('');

    lastText='Pada minggu ke '+w+', '+tri+', bayi Anda seukuran '+buah+', perkiraan berat '+berat+', panjang '+panjang+'.'+(milestone?' Perkembangan utama: '+milestone+'.':'')+(tip?' Tips: '+tip+'.':'')+' Ingat, ini estimasi; gunakan USG dan dokter sebagai acuan.';

    card.classList.add('show');
    var nb=el('jsumNarr'); if(nb){ nb.classList.remove('fm-flash'); void nb.offsetWidth; nb.classList.add('fm-flash'); }
    if(window.lucide) lucide.createIcons();
    if(getV()){ clearTimeout(spT); spT=setTimeout(speak,700); }
  }

  var lastText='', spT=null;
  function canSpeak(){return ('speechSynthesis' in window);}
  function speak(){if(!canSpeak()||!lastText)return;try{window.speechSynthesis.cancel();var u=new SpeechSynthesisUtterance(lastText);u.lang='id-ID';u.rate=1;window.speechSynthesis.speak(u);}catch(e){}}
  function stopSpeak(){if(canSpeak()){try{window.speechSynthesis.cancel();}catch(e){}}}

  function wire(){
    var sp=el('jsumSpeak'),st=el('jsumStop'),cl=el('jsumClose'),av=el('jsumAutoVoice');
    if(sp)sp.onclick=speak;
    if(st)st.onclick=stopSpeak;
    if(cl)cl.onclick=function(){var c=el('jsumCard');if(c)c.classList.remove('show');stopSpeak();};
    if(av){av.checked=getV();av.onchange=function(){setV(av.checked);if(av.checked&&canSpeak())speak();};}
    if(!canSpeak()){[sp,st].forEach(function(b){if(b)b.style.display='none';});if(av&&av.parentNode)av.parentNode.style.display='none';}
  }

  // WRAPPER: ambil w & d langsung dari pemanggilan renderRich -> sumber tunggal
  if(typeof renderRich==='function' && !window.__jsumWrapped){
    var _orig=renderRich;
    renderRich=function(){var a=arguments;var r=_orig.apply(this,a);try{renderSummary(a[0],a[1]);}catch(e){}return r;};
    window.__jsumWrapped=true;
  }
  function initRender(){
    var w=(typeof currentWeek==='number')?currentWeek:parseInt((el('weekSlider')||{}).value||'20',10);
    var d=(typeof D!=='undefined'&&D[w-4])?D[w-4]:null;
    renderSummary(w,d);
  }
  function init(){wire();try{initRender();}catch(e){}}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
  addEventListener('load',function(){wire();if(window.lucide)lucide.createIcons();});
})();
</script>`;

let added=0;
if(/<\/style>/.test(n)){ n=n.replace(/<\/style>/, function(m){ return CSS+'\n'+m; }); added++; } else { console.log('  [!] </style> tidak ketemu'); }
var reReset=/(id="fzReset"[\s\S]*?<\/section>)/;
if(reReset.test(n)){ n=n.replace(reReset, function(m){ return m+'\n'+HTML; }); added++; } else { console.log('  [!] anchor fzReset tidak ketemu'); }
if(/<script src="\/app\.js" defer><\/script>/.test(n)){ n=n.replace(/<script src="\/app\.js" defer><\/script>/, function(m){ return JS+'\n'+m; }); added++; } else { console.log('  [!] anchor app.js tidak ketemu'); }
console.log('  - blok baru dipasang: '+added);

if(n!==before){ if(!DRY) fs.writeFileSync(file,n,'utf8'); console.log(DRY?'\n[DRY-RUN] belum disimpan. Jalankan tanpa --dry-run untuk menerapkan.':'\n[TERSIMPAN] kalkulator-ukuran-janin.html diperbarui (v2).'); }
else { console.log('\nTidak ada perubahan.'); }
console.log('');