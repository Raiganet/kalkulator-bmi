// =========================================================
//  add-session-summary.js
//  Menambahkan "Kartu Keterangan Otomatis" yang muncul & bisa
//  dibaca (opsional: dibacakan suara) setiap sesi tendangan selesai.
//  AMAN: TIDAK mengubah logika Count-to-10 — hanya membungkus
//  commitSession secara pasif (wrapper) + menambah UI baru.
//  Idempoten + --dry-run.
//  Pakai:  node add-session-summary.js --dry-run
//          node add-session-summary.js
// =========================================================
const fs=require('fs'),path=require('path');
const DRY=process.argv.includes('--dry-run');
const dir=__dirname;
const file=path.join(dir,'kalkulator-tendangan.html');
console.log('\n=== ADD SESSION SUMMARY '+(DRY?'(DRY-RUN)':'(APPLY)')+' ===');
if(!fs.existsSync(file)){ console.log('[!!] kalkulator-tendangan.html tidak ditemukan di '+dir); process.exit(0); }
let c=fs.readFileSync(file,'utf8'), n=c, log=[];

/* ---------- 1) CSS kartu ringkasan ---------- */
const CSS=`
/* ko-sumcard-css : kartu keterangan otomatis setelah sesi selesai */
.fm-sumcard{display:none;margin:16px 0;border:1px solid var(--border);border-radius:24px;overflow:hidden;background:var(--surface);box-shadow:var(--sh-glass);animation:fzfade .45s ease}
.fm-sumcard.show{display:block}
.fm-sumcard .hd{background:var(--grad-brand);color:#fff;padding:18px 20px;display:flex;align-items:center;gap:12px;flex-wrap:wrap}
.fm-sumcard .hd .ic{width:46px;height:46px;border-radius:14px;background:rgba(255,255,255,.2);display:grid;place-items:center;flex:none}
.fm-sumcard .hd .ic svg{width:24px;height:24px;color:#fff}
.fm-sumcard .hd .tt{font-size:18px;font-weight:800;line-height:1.2}
.fm-sumcard .hd .bd{margin-left:auto;padding:5px 14px;border-radius:999px;font-size:12px;font-weight:700;background:rgba(255,255,255,.22)}
.fm-sumcard .hd .bd.watch{background:rgba(245,158,11,.9);color:#3b2400}
.fm-sumcard .bd2{padding:18px 20px}
.fm-sumcard .nums{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:12px}
.fm-sumcard .nums .nm{flex:1;min-width:120px;background:var(--surface-solid);border:1px solid var(--border);border-radius:14px;padding:12px;text-align:center}
.fm-sumcard .nums .nm .v{font-size:24px;font-weight:800}
.fm-sumcard .nums .nm .v.grad{background:var(--grad-brand);-webkit-background-clip:text;background-clip:text;color:transparent}
.fm-sumcard .nums .nm .l{font-size:11px;color:var(--text-3);font-weight:600;margin-top:4px;text-transform:uppercase;letter-spacing:.03em}
.fm-sumcard .narr{font-size:14px;line-height:1.8;color:var(--text-2)}
.fm-sumcard .narr p{margin:0 0 10px}
.fm-sumcard .narr .tip{color:var(--text)}
.fm-sumcard .narr .disc{font-size:12px;color:var(--text-3);border-left:3px solid var(--border);padding-left:12px;margin-top:6px}
.fm-sumcard .act{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-top:14px}
.fm-sumcard .act button{display:inline-flex;align-items:center;gap:6px;padding:9px 14px;border-radius:12px;border:1px solid var(--border);background:var(--surface-solid);font-weight:600;font-size:13px;color:var(--text-2);cursor:pointer}
.fm-sumcard .act button svg{width:15px;height:15px}
.fm-sumcard .act button:hover{border-color:var(--c-primary);color:var(--c-primary)}
.fm-sumcard .act .sp{flex:1}
.fm-sumcard .act label{display:inline-flex;align-items:center;gap:7px;font-size:12px;color:var(--text-3);font-weight:600;cursor:pointer}
.fm-sumcard .act input{width:16px;height:16px;accent-color:var(--c-primary)}
@media print{.fm-sumcard .act{display:none}}
`;
if(/ko-sumcard-css/.test(n)){ log.push('CSS: sudah ada (skip)'); }
else if(/<\/style>/.test(n)){ n=n.replace(/<\/style>/, CSS+'\n</style>'); log.push('CSS: kartu ringkasan ditambahkan'); }
else { log.push('CSS: </style> tidak ketemu (cek manual)'); }

/* ---------- 2) MARKUP container (sebelum warnBanner) ---------- */
const HTML=`
<!-- ko-sumcard-html : kartu keterangan otomatis -->
<section class="fm-sumcard" id="sumCard" aria-live="polite" aria-label="Ringkasan sesi terakhir">
  <div class="hd"><span class="ic"><i data-lucide="sparkles"></i></span><span class="tt" id="sumTitle">Sesi selesai</span><span class="bd" id="sumBadge">Normal</span></div>
  <div class="bd2">
    <div class="nums">
      <div class="nm"><div class="v grad" id="sumCount">0</div><div class="l">Gerakan</div></div>
      <div class="nm"><div class="v" id="sumDur">—</div><div class="l">Waktu tempuh</div></div>
      <div class="nm"><div class="v" id="sumGap">—</div><div class="l">Rata‑rata jeda</div></div>
    </div>
    <div class="narr" id="sumNarr"></div>
    <div class="act">
      <button type="button" id="sumSpeak"><i data-lucide="volume-2"></i> Dengarkan</button>
      <button type="button" id="sumStop"><i data-lucide="square"></i> Berhenti</button>
      <span class="sp"></span>
      <label><input type="checkbox" id="sumAutoVoice"> Bacakan otomatis lain kali</label>
      <button type="button" id="sumClose"><i data-lucide="x"></i> Tutup</button>
    </div>
  </div>
</section>
`;
if(/ko-sumcard-html/.test(n)){ log.push('HTML: sudah ada (skip)'); }
else if(/<div id="warnBanner"><\/div>/.test(n)){ n=n.replace(/<div id="warnBanner"><\/div>/, HTML+'\n<div id="warnBanner"></div>'); log.push('HTML: container sumCard ditambahkan'); }
else { log.push('HTML: anchor warnBanner tidak ketemu (cek manual)'); }

/* ---------- 3) SCRIPT: wrapper pasif + generator narasi + TTS ---------- */
const JS=`
<script>
/* ko-sumcard-js : wrapper pasif (TIDAK mengubah logika asli) */
(function(){
  function el(id){return document.getElementById(id);}
  function fmtMin(ms){var m=Math.round(ms/60000); if(m<1)return '<1 mnt'; if(m<60)return m+' mnt'; return Math.floor(m/60)+'j '+m%60+'m';}
  function fmtGap(ms){var s=Math.round(ms/1000); if(s<60)return s+' dtk'; return Math.floor(s/60)+'m '+s%60+'d';}
  function avg(a){return a.length? a.reduce(function(x,y){return x+y;},0)/a.length : null;}
  function baseline7(){var a=[]; for(var i=0;i<7;i++){var d=new Date(); d.setDate(d.getDate()-i); var k=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); var dd=state.days[k]; if(dd) dd.sessions.forEach(function(s){ if(s.durationMs>0) a.push(s.durationMs); });} return avg(a);}

  // susun ringkasan dari sesi AKTIF (dipanggil SEBELUM commit mengosongkan state)
  function snapshotActive(status){
    if(!kicks.length && !sessionStart) return null;
    var start=sessionStart||kicks[0]||Date.now();
    var dur=Date.now()-start;
    var gaps=[]; for(var i=1;i<kicks.length;i++) gaps.push(kicks[i]-kicks[i-1]); // rumus jeda ASLI
    return { count:kicks.length, dur:dur, avgGap: gaps.length? avg(gaps):null, status: status||(dur>WARN_MS?'watch':'done') };
  }

  function buildNarr(s){
    var p=[];
    // kalimat 1: fakta
    p.push('Anda mencatat <strong>'+s.count+' gerakan dalam '+fmtMin(s.dur)+'</strong>.');
    // kalimat 2: vs batas 2 jam
    if(s.status==='watch' || s.dur>WARN_MS){
      p.push('Waktu ini <strong>melebihi 2 jam</strong>, sehingga sesi ditandai <em>perlu dipantau</em>. Coba minum air/manis, berbaring miring ke kiri, lalu hitung ulang sekitar 1 jam.');
    } else {
      p.push('Waktu ini masih dalam batas acuan (umumnya ≤ 2 jam), jadi pola sesi ini terlihat <strong>wajar</strong>.');
    }
    // kalimat 3: bandingkan dengan baseline sendiri
    var b=baseline7();
    if(b && s.dur>0){
      var r=s.dur/b;
      if(r>=0.8 && r<=1.2) p.push('Dibanding rata‑rata 7 hari Anda ('+fmtMin(b)+'), sesi ini <strong>mirip dengan kebiasaan bayi Anda</strong> — pola konsisten.');
      else if(r>1.2) p.push('Dibanding rata‑rata 7 hari Anda ('+fmtMin(b)+'), sesi ini <strong>sedikit lebih lambat</strong>. Ini bisa normal — perhatikan apakah polanya berlanjut beberapa hari.');
      else p.push('Dibanding rata‑rata 7 hari Anda ('+fmtMin(b)+'), sesi ini <strong>lebih cepat</strong> — bayi sedang aktif.');
    } else {
      p.push('Ini belum punya pembanding (baseline), jadi terus catat beberapa hari agar aplikasi mengenali kebiasaan bayi Anda.');
    }
    // kalimat 4: tips
    p.push('<span class="tip">💡 Coba hitung lagi besok di jam yang sama, dan perhatikan apakah bayi biasanya lebih aktif setelah makan atau minum.</span>');
    // disclaimer
    p.push('<span class="disc">⚕️ Ini pencatatan pola, bukan diagnosis. Jika gerakan terasa jauh berkurang dari biasanya atau Anda khawatir, segera hubungi dokter atau bidan.</span>');
    return p.map(function(x){return '<p>'+x+'</p>';}).join('');
  }

  var lastText='';
  function renderSummary(s, scroll){
    var card=el('sumCard'); if(!card||!s) return;
    el('sumCount').textContent=s.count;
    el('sumDur').textContent=fmtMin(s.dur);
    el('sumGap').textContent=s.avgGap? fmtGap(s.avgGap):'—';
    var watch=(s.status==='watch');
    el('sumTitle').textContent= watch? 'Sesi selesai — perlu dipantau' : (s.count>=TARGET? '🎉 Sesi selesai' : 'Sesi disimpan');
    var bd=el('sumBadge'); bd.textContent= watch? 'Perlu Dipantau':'Normal'; bd.className='bd'+(watch?' watch':'');
    var narr=buildNarr(s); el('sumNarr').innerHTML=narr;
    lastText=('Sesi selesai. '+s.count+' gerakan dalam '+fmtMin(s.dur)+'. '+(watch?'Waktu melebihi 2 jam, perlu dipantau.':'Pola sesi ini wajar.')+' '+(function(){var b=baseline7(); if(b&&s.dur>0){var r=s.dur/b; if(r>=0.8&&r<=1.2)return 'Mirip rata-rata 7 hari Anda.'; if(r>1.2)return 'Sedikit lebih lambat dari rata-rata Anda.'; return 'Lebih cepat dari rata-rata Anda.';} return 'Terus catat untuk membentuk baseline.';})()+' Ingat, ini pencatatan pola, bukan diagnosis. Jika khawatir, hubungi dokter atau bidan.');
    // simpan supaya tahan reload
    try{ state.lastSummary={count:s.count,dur:s.dur,avgGap:s.avgGap,status:s.status}; persist(); }catch(e){}
    card.classList.add('show');
    if(window.lucide) lucide.createIcons();
    if(scroll){ try{ card.scrollIntoView({behavior:'smooth',block:'center'}); }catch(e){} }
    // auto-voice (hanya kalau user mengaktifkan & browser mengizinkan)
    if(state.prefs && state.prefs.autoVoice) speak();
  }

  // ---- TTS (opsional, tidak auto-play tanpa izin) ----
  function canSpeak(){ return ('speechSynthesis' in window); }
  function speak(){
    if(!canSpeak()||!lastText) return;
    try{ window.speechSynthesis.cancel(); var u=new SpeechSynthesisUtterance(lastText.replace(/<[^>]+>/g,'')); u.lang='id-ID'; u.rate=1; window.speechSynthesis.speak(u); }catch(e){}
  }
  function stopSpeak(){ if(canSpeak()){ try{ window.speechSynthesis.cancel(); }catch(e){} } }

  // ---- wire tombol (sekali) ----
  function wire(){
    var sp=el('sumSpeak'), st=el('sumStop'), cl=el('sumClose'), av=el('sumAutoVoice');
    if(sp) sp.onclick=speak;
    if(st) st.onclick=stopSpeak;
    if(cl) cl.onclick=function(){ var c=el('sumCard'); if(c) c.classList.remove('show'); stopSpeak(); };
    if(av){ av.checked=!!(state.prefs&&state.prefs.autoVoice); av.onchange=function(){ state.prefs.autoVoice=av.checked; persist(); if(av.checked && canSpeak()){ speak(); } }; }
    if(!canSpeak()){ if(sp) sp.style.display='none'; if(st) st.style.display='none'; if(av&&av.parentNode) av.parentNode.style.display='none'; }
  }

  // ---- WRAPPER pasif: bungkus commitSession TANPA ubah definisi asli ----
  if(typeof commitSession==='function' && !window.__sumWrapped){
    var _orig=commitSession;
    commitSession=function(status){
      var snap=snapshotActive(status);   // tangkap SEBELUM state dikosongkan
      var ret=_orig(status);             // logika asli berjalan utuh
      if(snap) renderSummary(snap, true);
      return ret;
    };
    window.__sumWrapped=true;
    log_hook();
  }
  function log_hook(){ /* penanda */ }

  // ---- tampilkan ringkasan tersimpan saat load (tanpa scroll) ----
  function restore(){ if(state.lastSummary) renderSummary(state.lastSummary, false); }

  // jalankan setelah DOM & init asli siap
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', function(){ wire(); restore(); });
  else { wire(); restore(); }
  addEventListener('load', function(){ wire(); restore(); if(window.lucide) lucide.createIcons(); });
})();
<\/script>
`;
if(/ko-sumcard-js/.test(n)){ log.push('JS: sudah ada (skip)'); }
else if(/<script src="\/app\.js" defer><\/script>/.test(n)){ n=n.replace(/<script src="\/app\.js" defer><\/script>/, JS+'\n<script src="/app.js" defer></script>'); log.push('JS: wrapper + narasi + TTS ditambahkan (sebelum app.js)'); }
else { log.push('JS: anchor app.js tidak ketemu (cek manual)'); }

log.forEach(function(l){ console.log('  - '+l); });
if(n!==c){ if(!DRY) fs.writeFileSync(file,n,'utf8'); console.log(DRY?'\n[DRY-RUN] belum disimpan. Jalankan tanpa --dry-run untuk menerapkan.':'\n[TERSIMPAN] kalkulator-tendangan.html diperbarui.'); }
else { console.log('\nTidak ada perubahan.'); }
console.log('');