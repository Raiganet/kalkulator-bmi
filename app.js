/* =====================================================================
   app.js  —  KalkulatorOnline behaviour layer
   TIDAK menyentuh logika/rumus kalkulator. Hanya UX global.
   ===================================================================== */
(function(){
  "use strict";
  const $  = (s,r=document)=>r.querySelector(s);
  const $$ = (s,r=document)=>[...r.querySelectorAll(s)];
  const store = { get:k=>{try{return localStorage.getItem(k)}catch(e){return null}},
                  set:(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}} };

  /* ---------- DATA KALKULATOR (untuk Search realtime) ---------- */
  const CALCS = [
    {t:"Kalkulator BMI",d:"Indeks massa tubuh & berat ideal",u:"index.html",c:"kesehatan",k:"bmi imt berat ideal kurus gemuk obesitas"},
    {t:"Kalkulator Kalori",d:"Kebutuhan kalori harian & TDEE",u:"kalkulator-kalori.html",c:"kesehatan",k:"kalori tdee diet defisit"},
    {t:"Kalkulator BMR",d:"Metabolisme basal",u:"kalkulator-bmr.html",c:"kesehatan",k:"bmr metabolisme basal"},
    {t:"Kalkulator Air Minum",d:"Kebutuhan air harian",u:"kalkulator-air.html",c:"kesehatan",k:"air minum hidrasi liter gelas"},
    {t:"Kalkulator WHtR",d:"Rasio pinggang–tinggi",u:"kalkulator-whtr.html",c:"kesehatan",k:"whtr pinggang rasio"},
    {t:"Body Fat %",d:"Persentase lemak tubuh",u:"kalkulator-body-fat.html",c:"kesehatan",k:"lemak body fat persen"},
    {t:"Masa Subur",d:"Ovulasi & masa subur",u:"kalkulator-masa-subur.html",c:"kesehatan",k:"subur ovulasi hamil haid"},
    {t:"Kalkulator Kehamilan",d:"HPL & usia janin",u:"kalkulator-kehamilan.html",c:"kesehatan",k:"kehamilan hpl trimester janin"},
    {t:"Timer Kontraksi",d:"Pantau tanda persalinan",u:"kalkulator-kontraksi.html",c:"kesehatan",k:"kontraksi persalinan lahir"},
    {t:"Penghitung Tendangan",d:"Hitung gerakan bayi",u:"kalkulator-tendangan.html",c:"kesehatan",k:"tendangan gerakan bayi kick"},
    {t:"Ukuran Janin",d:"Sebesar apa bayi per minggu",u:"kalkulator-ukuran-janin.html",c:"kesehatan",k:"ukuran janin buah minggu"},
    {t:"Kalkulator Cicilan",d:"Simulasi KPR & kredit",u:"kalkulator-cicilan.html",c:"keuangan",k:"cicilan kpr kredit angsuran bunga"},
    {t:"Kalkulator Diskon",d:"Potongan harga",u:"kalkulator-diskon.html",c:"keuangan",k:"diskon potongan harga promo"},
    {t:"Kalkulator PPN",d:"Pajak pertambahan nilai",u:"kalkulator-ppn.html",c:"keuangan",k:"ppn pajak 11 persen"},
    {t:"Kalkulator Persentase",d:"Hitung persen",u:"kalkulator-persen.html",c:"keuangan",k:"persen persentase"},
    {t:"Kalkulator Umur",d:"Usia tepat thn/bln/hr",u:"kalkulator-umur.html",c:"umum",k:"umur usia tanggal lahir"},
    {t:"Konversi Satuan",d:"Panjang, berat, suhu",u:"konversi-satuan.html",c:"umum",k:"konversi satuan kg cm suhu"},
    {t:"Panduan BMI",d:"Cara menghitung manual",u:"cara-menghitung-bmi.html",c:"umum",k:"panduan cara rumus bmi"},
    {t:"FAQ",d:"Pertanyaan umum",u:"faq.html",c:"umum",k:"faq pertanyaan bantuan"}
  ];

  /* ---------- THEME (light / dark / auto) ---------- */
  const root = document.documentElement;
  function applyTheme(mode){
    const dark = mode==='dark' || (mode==='auto' && matchMedia('(prefers-color-scheme: dark)').matches);
    root.setAttribute('data-theme', dark?'dark':'light');
    const m = $('meta[name="theme-color"]');
    if(m) m.setAttribute('content', dark?'#0B1020':'#6C63FF');
    $$('.theme-ico-use').forEach(u=>u.setAttribute('href', dark?'#i-moon':'#i-sun'));
  }
  function cycleTheme(){
    const order=['light','dark','auto'];
    const cur = store.get('ko-theme')||'auto';
    const next = order[(order.indexOf(cur)+1)%order.length];
    store.set('ko-theme',next); applyTheme(next);
    toast(next==='auto'?'Tema: otomatis sistem':next==='dark'?'Tema: gelap':'Tema: terang');
  }
  applyTheme(store.get('ko-theme')||'auto');
  matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change',()=>{
    if((store.get('ko-theme')||'auto')==='auto') applyTheme('auto');
  });

  /* ---------- NAVBAR shrink on scroll ---------- */
  const nav = $('.nav');
  let ticking=false;
  addEventListener('scroll',()=>{ if(!ticking){requestAnimationFrame(()=>{
    nav?.classList.toggle('is-shrink', scrollY>20); ticking=false;}); ticking=true;} },{passive:true});

  /* ---------- SEARCH realtime ---------- */
  function wireSearch(inputEl, resultsEl){
    if(!inputEl||!resultsEl) return;
    let active=-1, items=[];
    const render=(q)=>{
      q=q.trim().toLowerCase();
      if(!q){resultsEl.classList.remove('open');resultsEl.innerHTML='';return;}
      items = CALCS.filter(c=>(c.t+' '+c.d+' '+c.k).toLowerCase().includes(q)).slice(0,8);
      active=-1;
      resultsEl.innerHTML = items.length
        ? items.map((c,i)=>`<a href="${c.u}" data-i="${i}"><span class="dd-ico" data-lucide="calculator"></span><span><strong>${c.t}</strong><br><small style="color:var(--text-3)">${c.d}</small></span></a>`).join('')
        : `<div class="empty">Tidak ditemukan: “${q}”</div>`;
      resultsEl.classList.add('open');
      window.lucide?.createIcons();
    };
    inputEl.addEventListener('input',e=>render(e.target.value));
    inputEl.addEventListener('keydown',e=>{
      const a=$$('a',resultsEl);
      if(e.key==='ArrowDown'){e.preventDefault();active=Math.min(active+1,a.length-1);}
      else if(e.key==='ArrowUp'){e.preventDefault();active=Math.max(active-1,0);}
      else if(e.key==='Enter'){ if(a[active]) location.href=a[active].getAttribute('href'); return; }
      else if(e.key==='Escape'){resultsEl.classList.remove('open');return;} else return;
      a.forEach((el,i)=>el.classList.toggle('active',i===active));
    });
    document.addEventListener('click',e=>{ if(!e.target.closest('.search')) resultsEl.classList.remove('open'); });
  }
  wireSearch($('#searchDesktop'), $('#searchDesktopRes'));
  wireSearch($('#searchDrawer'),  $('#searchDrawerRes'));

  /* ---------- DRAWER mobile ---------- */
  const drawer=$('.drawer');
  function openDrawer(o){ drawer?.classList.toggle('open',o); document.body.style.overflow=o?'hidden':'';
    $('.burger')?.setAttribute('aria-expanded',o); }
  $('.burger')?.addEventListener('click',()=>openDrawer(!drawer.classList.contains('open')));
  drawer?.querySelector('.scrim')?.addEventListener('click',()=>openDrawer(false));
  addEventListener('keydown',e=>{ if(e.key==='Escape') openDrawer(false); });

  /* ---------- BOTTOM NAV active ---------- */
  (function(){
    const f=location.pathname.split('/').pop()||'index.html';
    $$('.bottomnav a').forEach(a=>{
      const href=a.getAttribute('href');
      const home=(f==='index.html'||f==='')&&href==='index.html';
      if(href===f||home) a.classList.add('active');
    });
  })();

  /* ---------- theme / install button wiring ---------- */
  $$('.js-theme').forEach(b=>b.addEventListener('click',cycleTheme));

  /* ---------- PWA INSTALL ---------- */
  let deferred=null;
  const installBtns=$$('.js-install');
  addEventListener('beforeinstallprompt',e=>{
    e.preventDefault(); deferred=e;
    installBtns.forEach(b=>b.classList.add('show'));
  });
  installBtns.forEach(b=>b.addEventListener('click',async()=>{
    if(!deferred){ toast('Aplikasi sudah terpasang, atau browser tidak mendukung.'); return; }
    deferred.prompt();
    const {outcome}=await deferred.userChoice;
    if(outcome==='accepted') installBtns.forEach(x=>x.classList.remove('show'));
    deferred=null;
  }));
  addEventListener('appinstalled',()=>installBtns.forEach(b=>b.classList.remove('show')));
  if(matchMedia('(display-mode: standalone)').matches) installBtns.forEach(b=>b.classList.remove('show'));

  /* ---------- RIPPLE pada tombol utama ---------- */
  document.addEventListener('pointerdown',e=>{
    const btn=e.target.closest('.calculate-btn,.btn-primary,.install-btn');
    if(!btn) return;
    const r=btn.getBoundingClientRect(), d=Math.max(r.width,r.height);
    const s=document.createElement('span'); s.className='ripple';
    s.style.width=s.style.height=d+'px';
    s.style.left=(e.clientX-r.left-d/2)+'px';
    s.style.top=(e.clientY-r.top-d/2)+'px';
    btn.appendChild(s); setTimeout(()=>s.remove(),600);
  });

  /* ---------- REVEAL on scroll (IntersectionObserver) ---------- */
  if('IntersectionObserver' in window){
    const io=new IntersectionObserver((es)=>es.forEach(en=>{ if(en.isIntersecting){en.target.classList.add('in');io.unobserve(en.target);} }),{threshold:.12});
    $$('.reveal').forEach(el=>io.observe(el));
  } else $$('.reveal').forEach(el=>el.classList.add('in'));

  /* ---------- COUNT-UP untuk angka hasil (enhancement, tidak ubah rumus) ---------- */
  // (opsional & aman: hanya animasi elemen ber-[data-countup] yang ADA; tidak mengubah nilai kalkulator)

  /* ---------- TOAST ---------- */
  let toastEl,toastT;
  function toast(msg){
    if(!toastEl){toastEl=document.createElement('div');toastEl.className='toast';
      toastEl.innerHTML='<svg class="t-ico" data-lucide="check-circle-2"></svg><span></span>';
      document.body.appendChild(toastEl);}
    toastEl.querySelector('span').textContent=msg;
    toastEl.classList.add('show'); window.lucide?.createIcons();
    clearTimeout(toastT); toastT=setTimeout(()=>toastEl.classList.remove('show'),2600);
  }

  /* ---------- hide skeleton saat siap ---------- */
  addEventListener('load',()=>$$('.skeleton').forEach(s=>s.remove()));

  /* ---------- Lucide icons ---------- */
  function initIcons(){ if(window.lucide?.createIcons) window.lucide.createIcons(); }
  if(document.readyState!=='loading') initIcons();
  else document.addEventListener('DOMContentLoaded',initIcons);

  /* ---------- SERVICE WORKER (PWA offline) ---------- */
  if('serviceWorker' in navigator){
    addEventListener('load',()=>{
      navigator.serviceWorker.register('sw.js').catch(()=>{});
    });
    // offline banner
    function net(){ if(!navigator.onLine) toast('📴 Offline — mode cache aktif.'); }
    addEventListener('offline',net);
  }

  // expose sedikit util (tidak mengganggu rumus)
  window.KO = { toast };
})();