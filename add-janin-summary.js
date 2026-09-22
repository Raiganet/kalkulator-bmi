// =========================================================
//  add-janin-summary.js
//  Menambahkan "Kartu Ringkasan Minggu" yang otomatis muncul &
//  tersinkron setiap minggu berubah, bisa dibaca & didengarkan.
//  AMAN: TIDAK mengubah logika kalkulator — hanya membungkus
//  renderRich secara pasif + membaca hasil render dari layar.
//  Idempoten + --dry-run.
//  Pakai:  node add-janin-summary.js --dry-run
//          node add-janin-summary.js
// =========================================================
const fs=require('fs'),path=require('path');
const DRY=process.argv.includes('--dry-run');
const dir=__dirname;
const file=path.join(dir,'kalkulator-ukuran-janin.html');
console.log('\n=== ADD JANIN SUMMARY '+(DRY?'(DRY-RUN)':'(APPLY)')+' ===');
if(!fs.existsSync(file)){ console.log('[!!] kalkulator-ukuran-janin.html tidak ditemukan di '+dir); process.exit(0); }
let c=fs.readFileSync(file,'utf8'), n=c, log=[];

/* ---------- 1) CSS ---------- */
const CSS=`
/* ko-jsum-css : kartu ringkasan minggu (auto-sync) */
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
if(/ko-jsum-css/.test(n)){ log.push('CSS: sudah ada (skip)'); }
else if(/<\/style>/.test(n)){ n=n.replace(/<\/style>/, function(m){ return CSS+'\n'+m; }); log.push('CSS: kartu ringkasan ditambahkan'); }
else { log.push('CSS: </style> tidak ketemu (cek manual)'); }

/* ---------- 2) HTML container (setelah kartu kontrol / tombol Reset) ---------- */
const HTML=`
<!-- ko-jsum-html : kartu ringkasan minggu (auto-sync) -->
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
if(/id="jsumCard"/.test(n)){ log.push('HTML: sudah ada (skip)'); }
else {
  const reReset=/(id="fzReset"[\s\S]*?<\/section>)/;
  if(reReset.test(n)){ n=n.replace(reReset, function(m){ return m+'\n'+HTML; }); log.push('HTML: container jsumCard ditambahkan (setelah kartu kontrol)'); }
  else { log.push('HTML: anchor tombol Reset (fzReset) tidak ketemu (cek manual)'); }
}

/* ---------- 3) JS: wrapper pasif + narasi + TTS ---------- */
const JS=`<script>
/* ko-jsum-js : wrapper pasif (TIDAK mengubah logika asli) */
(function(){
  function el(id){return document.getElementById(id);}
  function clean(s){return (s||'').replace(/<[^>]+>/g,'').replace(/\\s+/g,' ').trim();}
  var STORE_VOICE='ko-janin-autovoice';
  function getVoice(){ try{return localStorage.getItem(STORE_VOICE)==='1';}catch(e){return false;} }
  function setVoice(v){ try{localStorage.setItem(STORE_VOICE, v?'1':'0');}catch(e){} }
  function curWeek(){ var s=el('weekSlider'); return s? parseInt(s.value,10):20; }
  function readDOM(){
    var w=curWeek();
    var buah=clean(el('fruitName')? el('fruitName').textContent:'');
    var tri=clean(el('triBadge')? el('triBadge').textContent:'');
    var dvs=el('detailGrid')? el('detailGrid').querySelectorAll('.fz-d .dv'):[];
    var berat=dvs[0]? clean(dvs[0].textContent):'';
    var panjang=dvs[1]? clean(dvs[1].textContent):'';
    var liNow=el('devBaby')? el('devBaby').querySelector('li.now span'):null;
    var milestone= liNow? clean(liNow.textContent).replace('Minggu ini','').trim():'';
    var tipEl=el('tipsList')? el('tipsList').querySelector('li span'):null;
    var tip= tipEl? clean(tipEl.textContent):'';
    return {w:w,buah:buah,tri:tri,berat:berat,panjang:panjang,milestone:milestone,tip:tip};
  }
  function buildNarr(d){
    var p=[];
    p.push('Pada minggu ke-'+d.w+' ('+d.tri+'), bayi Anda seukuran <strong>'+d.buah+'</strong>, dengan perkiraan berat <strong>'+d.berat+'</strong> dan panjang <strong>'+d.panjang+'</strong>.');
    if(d.milestone) p.push('Perkembangan utama minggu ini: <em>'+d.milestone+'.</em>');
    if(d.tip) p.push('<span class="tip">Tips minggu ini: '+d.tip+'</span>');
    p.push('<span class="disc">Angka ini estimasi atau median referensi berdasarkan usia kehamilan; pertumbuhan tiap ibu bisa berbeda. Gunakan hasil USG dan konsultasi dokter atau bidan sebagai acuan utama.</span>');
    return p.map(function(x){return '<p>'+x+'</p>';}).join('');
  }
  function ttsText(d){
    var t='Pada minggu ke '+d.w+', '+d.tri+', bayi Anda seukuran '+d.buah+', perkiraan berat '+d.berat+', panjang '+d.panjang+'.';
    if(d.milestone) t+=' Perkembangan utama: '+d.milestone+'.';
    if(d.tip) t+=' Tips: '+d.tip;
    t+=' Ingat, ini estimasi; gunakan USG dan dokter sebagai acuan.';
    return t;
  }
  var lastText='', speakTimer=null;
  function renderSummary(){
    var card=el('jsumCard'); if(!card) return;
    var d=readDOM();
    el('jsumWeek').textContent='Minggu '+d.w;
    el('jsumBerat').textContent=d.berat||'-';
    el('jsumPanjang').textContent=d.panjang||'-';
    el('jsumTri').textContent=d.tri||'-';
    el('jsumNarr').innerHTML=buildNarr(d);
    lastText=ttsText(d);
    card.classList.add('show');
    var nb=el('jsumNarr'); if(nb){ nb.classList.remove('fm-flash'); void nb.offsetWidth; nb.classList.add('fm-flash'); }
    if(window.lucide) lucide.createIcons();
    if(getVoice()){ clearTimeout(speakTimer); speakTimer=setTimeout(speak,700); }
  }
  function canSpeak(){ return ('speechSynthesis' in window); }
  function speak(){ if(!canSpeak()||!lastText) return; try{ window.speechSynthesis.cancel(); var u=new SpeechSynthesisUtterance(lastText); u.lang='id-ID'; u.rate=1; window.speechSynthesis.speak(u);}catch(e){} }
  function stopSpeak(){ if(canSpeak()){ try{window.speechSynthesis.cancel();}catch(e){} } }
  function wire(){
    var sp=el('jsumSpeak'), st=el('jsumStop'), cl=el('jsumClose'), av=el('jsumAutoVoice');
    if(sp) sp.onclick=speak;
    if(st) st.onclick=stopSpeak;
    if(cl) cl.onclick=function(){ var c=el('jsumCard'); if(c) c.classList.remove('show'); stopSpeak(); };
    if(av){ av.checked=getVoice(); av.onchange=function(){ setVoice(av.checked); if(av.checked && canSpeak()) speak(); }; }
    if(!canSpeak()){ [sp,st].forEach(function(b){if(b)b.style.display='none';}); if(av&&av.parentNode) av.parentNode.style.display='none'; }
  }
  if(typeof renderRich==='function' && !window.__jsumWrapped){
    var _orig=renderRich;
    renderRich=function(){ var r=_orig.apply(this,arguments); try{ renderSummary(); }catch(e){} return r; };
    window.__jsumWrapped=true;
  }
  function init(){ wire(); try{ renderSummary(); }catch(e){} }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', init); else init();
  addEventListener('load', function(){ wire(); if(window.lucide) lucide.createIcons(); });
})();
</script>`;
if(/ko-jsum-js/.test(n)){ log.push('JS: sudah ada (skip)'); }
else if(/<script src="\/app\.js" defer><\/script>/.test(n)){ n=n.replace(/<script src="\/app\.js" defer><\/script>/, function(m){ return JS+'\n'+m; }); log.push('JS: wrapper + narasi + TTS ditambahkan (sebelum app.js)'); }
else { log.push('JS: anchor app.js tidak ketemu (cek manual)'); }

log.forEach(function(l){ console.log('  - '+l); });
if(n!==c){ if(!DRY) fs.writeFileSync(file,n,'utf8'); console.log(DRY?'\n[DRY-RUN] belum disimpan. Jalankan tanpa --dry-run untuk menerapkan.':'\n[TERSIMPAN] kalkulator-ukuran-janin.html diperbarui.'); }
else { console.log('\nTidak ada perubahan.'); }
console.log('');