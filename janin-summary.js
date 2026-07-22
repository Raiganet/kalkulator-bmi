/* janin-summary.js  (v-RINGAN — anti hang)
   Kartu "Ringkasan Minggu" yang membaca LANGSUNG dari tampilan (sumber tunggal)
   dan hanya memperbarui lewat listener + debounce.
   - TIDAK pakai MutationObserver
   - TIDAK memanggil lucide.createIcons() saat memperbarui (hanya 1x saat buat kartu)
   - TIDAK membungkus logika kalkulator apa pun
   => mustahil menyebabkan hang; angka selalu = slider. */
(function(){
  function $(id){return document.getElementById(id);}
  function clean(s){return (s||'').replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim();}

  /* ---- CSS disuntik 1x via JS (idempoten) ---- */
  var CSS='.fm-sumcard{display:none}.fm-sumcard.show{display:block;animation:fzfade .4s ease}'
   +'.jsum-nums{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:6px 0 14px}'
   +'.jsum-nm{background:var(--surface-solid);border:1px solid var(--border);border-radius:14px;padding:14px;text-align:center;min-width:0}'
   +'.jsum-nm .v{font-size:clamp(16px,3.5vw,22px);font-weight:800;line-height:1.1;word-break:break-word}'
   +'.jsum-nm .v.grad{background:var(--grad-brand);-webkit-background-clip:text;background-clip:text;color:transparent}'
   +'.jsum-nm .l{font-size:11px;color:var(--text-3);font-weight:600;margin-top:5px;text-transform:uppercase;letter-spacing:.03em}'
   +'.jsum-narr{font-size:14px;line-height:1.85;color:var(--text-2)}'
   +'.jsum-narr p{margin:0 0 10px}.jsum-narr .tip{color:var(--text);font-weight:600}'
   +'.jsum-narr .disc{display:block;font-size:12px;color:var(--text-3);border-left:3px solid var(--border);padding-left:12px;margin-top:4px}'
   +'.jsum-act{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-top:14px}'
   +'.jsum-act button{display:inline-flex;align-items:center;gap:6px;padding:9px 14px;border-radius:12px;border:1px solid var(--border);background:var(--surface-solid);font-weight:600;font-size:13px;color:var(--text-2);cursor:pointer}'
   +'.jsum-act button svg{width:15px;height:15px}.jsum-act button:hover{border-color:var(--c-primary);color:var(--c-primary)}'
   +'.jsum-act .jsum-sp{flex:1}.jsum-act label{display:inline-flex;align-items:center;gap:7px;font-size:12px;color:var(--text-3);font-weight:600;cursor:pointer}'
   +'.jsum-act input{width:16px;height:16px;accent-color:var(--c-primary)}'
   +'@media(max-width:420px){.jsum-nums{grid-template-columns:1fr}}@media print{.jsum-act{display:none}}';
  if(!document.getElementById('jsumExtCss')){var st=document.createElement('style');st.id='jsumExtCss';st.textContent=CSS;document.head.appendChild(st);}

  var CARD='<section class="fz-card fm-sumcard" id="jsumCard" aria-live="polite" aria-label="Ringkasan minggu kehamilan">'
   +'<h2><i data-lucide="sparkles"></i> Ringkasan Minggu Ini <span class="fz-h2sub" id="jsumWeek">Minggu 20</span></h2>'
   +'<div class="jsum-nums"><div class="jsum-nm"><div class="v grad" id="jsumBerat">-</div><div class="l">Berat</div></div>'
   +'<div class="jsum-nm"><div class="v" id="jsumPanjang">-</div><div class="l">Panjang</div></div>'
   +'<div class="jsum-nm"><div class="v" id="jsumTri">-</div><div class="l">Trimester</div></div></div>'
   +'<div class="jsum-narr" id="jsumNarr"></div>'
   +'<div class="jsum-act"><button type="button" id="jsumSpeak"><i data-lucide="volume-2"></i> Dengarkan</button>'
   +'<button type="button" id="jsumStop"><i data-lucide="square"></i> Berhenti</button><span class="jsum-sp"></span>'
   +'<label><input type="checkbox" id="jsumAutoVoice"> Bacakan otomatis lain kali</label>'
   +'<button type="button" id="jsumClose"><i data-lucide="x"></i> Sembunyikan</button></div></section>';

  function ensureCard(){
    if($('jsumCard')) return false;
    var sec=$('fzReset'); while(sec && sec.tagName!=='SECTION') sec=sec.parentElement;
    if(sec) sec.insertAdjacentHTML('afterend', CARD);
    else (document.querySelector('main')||document.body).insertAdjacentHTML('beforeend', CARD);
    return true; // baru dibuat -> perlu lucide 1x
  }

  var VKEY='ko-janin-autovoice';
  function getV(){try{return localStorage.getItem(VKEY)==='1';}catch(e){return false;}}
  function setV(v){try{localStorage.setItem(VKEY,v?'1':'0');}catch(e){}}

  /* baca SEMUA dari layar (sumber tunggal) */
  function readAll(){
    var wEl=$('weekValue'); var w=wEl?parseInt((wEl.textContent||'').replace(/\D+/g,''),10):NaN;
    var dv=document.querySelectorAll('#detailGrid .fz-d .dv');
    var liNow=document.querySelector('#devBaby li.now span');
    var tipEl=document.querySelector('#tipsList li span');
    return { w:w, buah:($('fruitName')||{}).textContent?$('fruitName').textContent.trim():'',
      tri:($('triBadge')||{}).textContent?$('triBadge').textContent.trim():'',
      berat:dv[0]?dv[0].textContent.trim():'-', panjang:dv[1]?dv[1].textContent.trim():'-',
      milestone:liNow?clean(liNow.textContent).replace('Minggu ini','').trim():'',
      tip:tipEl?clean(tipEl.textContent):'' };
  }

  var lastSig='', lastText='', spT=null, rafPending=false;
  function paint(){
    rafPending=false;
    var card=$('jsumCard'); if(!card) return;
    var d=readAll(); if(!d.w) return;
    var sig=d.w+'|'+d.berat+'|'+d.panjang+'|'+d.tri+'|'+d.milestone+'|'+d.tip;
    if(sig!==lastSig){
      lastSig=sig;
      $('jsumWeek').textContent='Minggu '+d.w;
      $('jsumBerat').textContent=d.berat;
      $('jsumPanjang').textContent=d.panjang;
      $('jsumTri').textContent=d.tri||'-';
      var p=[];
      p.push('Pada minggu ke-'+d.w+' ('+(d.tri||'-')+'), bayi Anda seukuran <strong>'+d.buah+'</strong>, dengan perkiraan berat <strong>'+d.berat+'</strong> dan panjang <strong>'+d.panjang+'</strong>.');
      if(d.milestone) p.push('Perkembangan utama minggu ini: <em>'+d.milestone+'.</em>');
      if(d.tip) p.push('<span class="tip">Tips minggu ini: '+d.tip+'</span>');
      p.push('<span class="disc">Angka ini estimasi atau median referensi berdasarkan usia kehamilan; pertumbuhan tiap ibu bisa berbeda. Gunakan hasil USG dan konsultasi dokter atau bidan sebagai acuan utama.</span>');
      $('jsumNarr').innerHTML=p.map(function(x){return '<p>'+x+'</p>';}).join('');
      lastText='Pada minggu ke '+d.w+', '+(d.tri||'')+', bayi Anda seukuran '+d.buah+', perkiraan berat '+d.berat+', panjang '+d.panjang+'.'+(d.milestone?' Perkembangan utama: '+d.milestone+'.':'')+(d.tip?' Tips: '+d.tip+'.':'')+' Ingat, ini estimasi; gunakan USG dan dokter sebagai acuan.';
    }
    if(!card.classList.contains('show')) card.classList.add('show');
    if(getV()){ clearTimeout(spT); spT=setTimeout(speak,700); }
  }
  function schedule(){ if(rafPending) return; rafPending=true; requestAnimationFrame(paint); }

  function canSpeak(){return ('speechSynthesis' in window);}
  function speak(){if(!canSpeak()||!lastText)return;try{window.speechSynthesis.cancel();var u=new SpeechSynthesisUtterance(lastText);u.lang='id-ID';u.rate=1;window.speechSynthesis.speak(u);}catch(e){}}
  function stopSpeak(){if(canSpeak()){try{window.speechSynthesis.cancel();}catch(e){}}}

  function wire(){
    var sp=$('jsumSpeak'),s2=$('jsumStop'),cl=$('jsumClose'),av=$('jsumAutoVoice');
    if(sp)sp.onclick=speak; if(s2)s2.onclick=stopSpeak;
    if(cl)cl.onclick=function(){var c=$('jsumCard');if(c)c.classList.remove('show');stopSpeak();};
    if(av){av.checked=getV();av.onchange=function(){setV(av.checked);if(av.checked&&canSpeak())speak();};}
    if(!canSpeak()){[sp,s2].forEach(function(b){if(b)b.style.display='none';});if(av&&av.parentNode)av.parentNode.style.display='none';}
    /* listener pada KONTROL (bukan observer) -> render inline jalan dulu, baru kita baca layar */
    var sl=$('weekSlider'); if(sl){ sl.addEventListener('input',schedule); sl.addEventListener('change',schedule); }
    var se=$('fzSearch'); if(se) se.addEventListener('input',schedule);
    var hp=$('hpht'); if(hp) hp.addEventListener('change',schedule);
    document.addEventListener('click',function(e){
      if(e.target.closest('#btnPrev,#btnNext,#fzReset,.fz-quick button,#timeline button,.fz-hpht button')) schedule();
    });
  }

  function init(){
    var made=ensureCard();
    wire();
    if(made && window.lucide) lucide.createIcons(); // 1x saja untuk ikon kartu
    paint();
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
  addEventListener('load',function(){ if(!($('jsumCard'))) init(); else { wire(); paint(); } });
})();