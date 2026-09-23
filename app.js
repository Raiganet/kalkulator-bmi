/* =====================================================================
   app.js  â€”  KalkulatorOnline behaviour layer
   TIDAK menyentuh logika/rumus kalkulator. Hanya UX global.
   ===================================================================== */
(function(){
  "use strict";
  const $  = (s,r=document)=>r.querySelector(s);
  const $$ = (s,r=document)=>[...r.querySelectorAll(s)];
  const store = { get:k=>{try{return localStorage.getItem(k)}catch(e){return null}},
                  set:(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}} };
  const htmlEscape=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

  /* ---------- DATA KALKULATOR (untuk Search realtime) ---------- */
  const CALCS = [
    {t:"Kalkulator BMI",d:"Indeks massa tubuh & berat ideal",u:"index.html",c:"kesehatan",k:"bmi imt berat ideal kurus gemuk obesitas"},
    {t:"Kalkulator Kalori",d:"Kebutuhan kalori harian & TDEE",u:"kalkulator-kalori.html",c:"kesehatan",k:"kalori tdee diet defisit"},
    {t:"Kalkulator BMR",d:"Metabolisme basal",u:"kalkulator-bmr.html",c:"kesehatan",k:"bmr metabolisme basal"},
    {t:"Kalkulator Air Minum",d:"Kebutuhan air harian",u:"kalkulator-air.html",c:"kesehatan",k:"air minum hidrasi liter gelas"},
    {t:"Kalkulator WHtR",d:"Rasio pinggangâ€“tinggi",u:"kalkulator-whtr.html",c:"kesehatan",k:"whtr pinggang rasio"},
    {t:"Body Fat %",d:"Persentase lemak tubuh",u:"kalkulator-body-fat.html",c:"kesehatan",k:"lemak body fat persen"},
    {t:"Masa Subur",d:"Ovulasi & masa subur",u:"kalkulator-masa-subur.html",c:"kesehatan",k:"subur ovulasi hamil haid"},
    {t:"Kalkulator Kehamilan",d:"HPL & usia janin",u:"kalkulator-kehamilan.html",c:"kesehatan",k:"kehamilan hpl trimester janin"},
    {t:"Timer Kontraksi",d:"Pantau tanda persalinan",u:"kalkulator-kontraksi.html",c:"kesehatan",k:"kontraksi persalinan lahir"},
    {t:"Penghitung Tendangan",d:"Hitung gerakan bayi",u:"kalkulator-tendangan.html",c:"kesehatan",k:"tendangan gerakan bayi kick"},
    {t:"Ukuran Janin",d:"Sebesar apa bayi per minggu",u:"kalkulator-ukuran-janin.html",c:"kesehatan",k:"ukuran janin buah minggu"},
    {t:"Kalkulator Cicilan",d:"Anuitas, efektif, flat & amortisasi",u:"kalkulator-cicilan.html",c:"keuangan",k:"cicilan kpr kredit angsuran bunga"},
    {t:"Kalkulator Diskon",d:"Potongan harga",u:"kalkulator-diskon.html",c:"keuangan",k:"diskon potongan harga promo"},
    {t:"Kalkulator PPN",d:"Pajak pertambahan nilai",u:"kalkulator-ppn.html",c:"keuangan",k:"ppn pajak 11 persen"},
    {t:"Kalkulator Persentase",d:"Hitung persen",u:"kalkulator-persen.html",c:"keuangan",k:"persen persentase"},
    {t:"Kalkulator Umur",d:"Usia tepat thn/bln/hr",u:"kalkulator-umur.html",c:"umum",k:"umur usia tanggal lahir"},
    {t:"Konversi Satuan",d:"10 kategori & puluhan satuan",u:"konversi-satuan.html",c:"umum",k:"konversi satuan kg cm suhu"},
    {t:"Panduan BMI",d:"Cara menghitung manual",u:"cara-menghitung-bmi.html",c:"umum",k:"panduan cara rumus bmi"},
    {t:"FAQ",d:"Pertanyaan umum",u:"faq.html",c:"umum",k:"faq pertanyaan bantuan"}
  ];
  const RESOURCES = [
    {t:"Kalkulator Populer",d:"Pilihan cepat + ranking lokal di perangkatmu",u:"kalkulator-populer.html",c:"umum",k:"populer sering digunakan favorit rekomendasi"},
    {t:"Statistik Saya",d:"Ringkasan penggunaan lokal tanpa akun",u:"statistik.html",c:"umum",k:"statistik riwayat penggunaan lokal dashboard"}
  ];
  const SEARCH_ITEMS = [...CALCS,...RESOURCES];

  const CALC_ICONS = {
    "index.html":"scale","kalkulator-kalori.html":"flame","kalkulator-bmr.html":"heart-pulse",
    "kalkulator-air.html":"droplet","kalkulator-whtr.html":"ruler","kalkulator-body-fat.html":"person-standing",
    "kalkulator-masa-subur.html":"flower-2","kalkulator-kehamilan.html":"baby","kalkulator-kontraksi.html":"timer",
    "kalkulator-tendangan.html":"footprints","kalkulator-ukuran-janin.html":"cherry","kalkulator-cicilan.html":"landmark",
    "kalkulator-diskon.html":"tag","kalkulator-ppn.html":"receipt-text","kalkulator-persen.html":"percent",
    "kalkulator-umur.html":"cake","konversi-satuan.html":"arrow-left-right","cara-menghitung-bmi.html":"book-open","faq.html":"circle-help"
  };

  /* ---------- STAGE 3: LOCAL SMART DATA ---------- */
  const JSONStore = {
    get(key, fallback=[]){ try{ const v=JSON.parse(store.get(key)||'null'); return v ?? fallback; }catch(e){ return fallback; } },
    set(key, value){ store.set(key, JSON.stringify(value)); }
  };
  const SMART_KEYS = {favorites:'ko-favorites-v1', recent:'ko-recent-v1', history:'ko-history-v1', usage:'ko-usage-v1'};
  const GUIDE_URLS = new Set(['cara-menghitung-bmi.html','faq.html']);

  /* ---------- STAGE 6: PRIVACY-SAFE ANALYTICS + LOCAL USAGE ---------- */
  const SAFE_ANALYTIC_KEYS=new Set(['calculator','category','action','surface','theme','unit','outcome','metric','value','rating','kind','resource_type','slot','count','page']);
  function analyticsReady(){
    try{return !!window.KOConsent?.status?.()?.analytics && !!window.__koAnalyticsLoaded && typeof window.gtag==='function';}catch(e){return false;}
  }
  function track(eventName,params={}){
    if(!analyticsReady()) return false;
    const safe={};
    Object.entries(params).forEach(([k,v])=>{
      if(!SAFE_ANALYTIC_KEYS.has(k) || v===undefined || v===null) return;
      if(typeof v==='number') safe[k]=Number.isFinite(v)?Math.round(v*100)/100:0;
      else safe[k]=String(v).slice(0,80);
    });
    try{window.gtag('event',String(eventName).replace(/[^a-z0-9_]/gi,'_').slice(0,40),safe);return true;}catch(e){return false;}
  }
  function getUsage(){return JSONStore.get(SMART_KEYS.usage,{});}
  function bumpUsage(u){
    if(!calcByUrl(u)||GUIDE_URLS.has(u)) return;
    const usage=getUsage(), prev=usage[u]||{count:0,last:0};
    usage[u]={count:Math.min(9999,(Number(prev.count)||0)+1),last:Date.now()};
    JSONStore.set(SMART_KEYS.usage,usage);
    document.dispatchEvent(new CustomEvent('ko:usage'));
  }
  function usageItems(){
    const usage=getUsage();
    return Object.entries(usage).map(([u,v])=>({item:calcByUrl(u),count:Number(v?.count)||0,last:Number(v?.last)||0})).filter(x=>x.item&&x.count>0).sort((a,b)=>b.count-a.count||b.last-a.last);
  }
  const calcByUrl = u=>CALCS.find(c=>c.u===u);
  const currentFile = location.pathname.split('/').pop() || 'index.html';
  const isCalculator = !!calcByUrl(currentFile) && !GUIDE_URLS.has(currentFile);

  function getFavorites(){ return JSONStore.get(SMART_KEYS.favorites,[]).filter(u=>calcByUrl(u)); }
  function isFavorite(u){ return getFavorites().includes(u); }
  function toggleFavorite(u){
    let fav=getFavorites();
    const adding=!fav.includes(u);
    fav=adding?[u,...fav]:fav.filter(x=>x!==u);
    JSONStore.set(SMART_KEYS.favorites,fav.slice(0,30));
    document.dispatchEvent(new CustomEvent('ko:favorites'));
    toast(adding?'Ditambahkan ke favorit â­':'Dihapus dari favorit');
    const meta=calcByUrl(u); track('favorite_toggle',{calculator:u,category:meta?.c||'',action:adding?'add':'remove'});
    return adding;
  }
  function markRecent(u){
    if(!calcByUrl(u) || GUIDE_URLS.has(u)) return;
    let recent=JSONStore.get(SMART_KEYS.recent,[]).filter(x=>x?.u && calcByUrl(x.u));
    recent=[{u,at:Date.now()},...recent.filter(x=>x.u!==u)].slice(0,6);
    JSONStore.set(SMART_KEYS.recent,recent);
    document.dispatchEvent(new CustomEvent('ko:recent'));
  }
  function saveHistory(u, summary){
    const item=calcByUrl(u);
    if(!item || !summary) return;
    let history=JSONStore.get(SMART_KEYS.history,[]).filter(x=>x?.u && calcByUrl(x.u));
    history.unshift({id:Date.now(),u,at:Date.now(),summary:summary.slice(0,240)});
    JSONStore.set(SMART_KEYS.history,history.slice(0,20));
    document.dispatchEvent(new CustomEvent('ko:history'));
  }
  function clearHistory(){ JSONStore.set(SMART_KEYS.history,[]); document.dispatchEvent(new CustomEvent('ko:history')); toast('Riwayat lokal dihapus'); }

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
    track('theme_change',{theme:next});
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

  /* ---------- DESKTOP DROPDOWN CLICK NAV ---------- */
  (function(){
    const dropdownItems=$$('.menu>li').filter(li=>li.querySelector(':scope > .dropbtn')&&li.querySelector(':scope > .dropdown-content'));
    if(!dropdownItems.length) return;

    // Bersihkan hash kosong peninggalan href="#" versi lama tanpa reload halaman.
    if(location.href.endsWith('#')){
      history.replaceState(history.state,'',location.pathname+location.search);
    }

    function setOpen(target,open){
      dropdownItems.forEach(li=>{
        const active=li===target&&open;
        li.classList.toggle('menu-open',active);
        li.querySelector(':scope > .dropbtn')?.setAttribute('aria-expanded',active?'true':'false');
      });
    }

    dropdownItems.forEach(li=>{
      const btn=li.querySelector(':scope > .dropbtn');
      if(!btn) return;

      btn.setAttribute('role','button');
      btn.setAttribute('aria-haspopup','true');
      btn.setAttribute('aria-expanded','false');

      btn.addEventListener('click',e=>{
        e.preventDefault();
        e.stopPropagation();
        setOpen(li,!li.classList.contains('menu-open'));
      });

      btn.addEventListener('keydown',e=>{
        if(e.key===' '){
          e.preventDefault();
          setOpen(li,!li.classList.contains('menu-open'));
        }else if(e.key==='Escape'){
          e.preventDefault();
          setOpen(null,false);
          btn.blur();
        }
      });

      // Jika hover pindah kategori, tutup menu yang sebelumnya dibuka lewat klik.
      li.addEventListener('mouseenter',()=>{
        dropdownItems.forEach(other=>{
          if(other!==li&&other.classList.contains('menu-open')){
            other.classList.remove('menu-open');
            other.querySelector(':scope > .dropbtn')?.setAttribute('aria-expanded','false');
          }
        });
      });
    });

    document.addEventListener('click',e=>{
      if(!e.target.closest('.menu>li')) setOpen(null,false);
    });

    addEventListener('keydown',e=>{
      if(e.key==='Escape') setOpen(null,false);
    });
  })();
  /* ---------- SEARCH realtime ---------- */
  function wireSearch(inputEl, resultsEl){
    if(!inputEl||!resultsEl) return;
    let active=-1, items=[];
    const render=(q)=>{
      q=q.trim().toLowerCase();
      if(!q){resultsEl.classList.remove('open');resultsEl.innerHTML='';return;}
      items = SEARCH_ITEMS.filter(c=>(c.t+' '+c.d+' '+c.k).toLowerCase().includes(q)).slice(0,8);
      active=-1;
      resultsEl.innerHTML = items.length
        ? items.map((c,i)=>`<a href="${c.u}" data-i="${i}"><span class="dd-ico" data-lucide="calculator"></span><span><strong>${c.t}</strong><br><small style="color:var(--text-3)">${c.d}</small></span></a>`).join('')
        : `<div class="empty">Tidak ditemukan: â€œ${q}â€</div>`;
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
    resultsEl.addEventListener('click',e=>{
      const a=e.target.closest('a'); if(!a) return;
      track('search_select',{surface:inputEl.id||'search',calculator:(a.getAttribute('href')||'').split('?')[0]});
    });
    document.addEventListener('click',e=>{ if(!e.target.closest('.search')) resultsEl.classList.remove('open'); });
  }
  wireSearch($('#searchDesktop'), $('#searchDesktopRes'));
  wireSearch($('#searchDrawer'),  $('#searchDrawerRes'));
  wireSearch($('#searchHero'),    $('#searchHeroRes'));

  // SearchAction SEO: dukung URL /?s=kata-kunci dan buka hasil pencarian nyata.
  const initialSearch=new URLSearchParams(location.search).get('s');
  if(initialSearch){
    const target=$('#searchHero')||$('#searchDesktop')||$('#searchDrawer');
    if(target){
      target.value=initialSearch;
      target.dispatchEvent(new Event('input',{bubbles:true}));
      requestAnimationFrame(()=>target.scrollIntoView({behavior:'smooth',block:'center'}));
    }
  }

  /* ---------- DRAWER mobile ---------- */
  const drawer=$('.drawer');
  function openDrawer(o){
    if(!drawer) return;
    drawer.classList.toggle('open',o);
    drawer.setAttribute('aria-hidden',o?'false':'true');
    document.body.style.overflow=o?'hidden':'';
    $('.burger')?.setAttribute('aria-expanded',o?'true':'false');
  }
  window.KOOpenMobileSearch=()=>{
    openDrawer(true);
    requestAnimationFrame(()=>$('#searchDrawer')?.focus());
  };
  $('.burger')?.addEventListener('click',()=>openDrawer(!drawer?.classList.contains('open')));
  drawer?.querySelector('.scrim')?.addEventListener('click',()=>openDrawer(false));
  drawer?.querySelector('[aria-label="Tutup menu"]')?.addEventListener('click',()=>openDrawer(false));
  addEventListener('keydown',e=>{ if(e.key==='Escape' && drawer?.classList.contains('open')) openDrawer(false); });

  // Tombol Cari di bottom navigation harus membuka pencarian yang benar-benar terlihat di mobile.
  $$('.bottomnav a').forEach(a=>{
    if(a.querySelector('[data-lucide="search"]')){
      a.addEventListener('click',e=>{
        e.preventDefault();
        window.KOOpenMobileSearch();
      });
    }
  });

  /* ---------- CURRENT PAGE / NAV STATE ---------- */
  (function(){
    const f=location.pathname.split('/').pop()||'index.html';
    const item=CALCS.find(c=>c.u===f);
    const section=item?.c||null;

    $$('.nav a,.drawer a').forEach(a=>{
      const href=(a.getAttribute('href')||'').split('#')[0];
      if(href===f || ((f==='index.html'||f==='') && href==='index.html')){
        a.classList.add('is-active');
        if(!a.classList.contains('dropbtn')) a.setAttribute('aria-current','page');
      }
    });
    if(section) $(`.menu>li[data-section="${section}"]`)?.classList.add('is-active');

    $$('.bottomnav a').forEach(a=>a.classList.remove('active'));
    if(f==='index.html'||f==='') $('[data-bottom="home"]')?.classList.add('active');
    else if(section==='keuangan') $('[data-bottom="finance"]')?.classList.add('active');
    else if(section==='kesehatan') $('[data-bottom="health"]')?.classList.add('active');
  })();

  /* ---------- HOME CALCULATOR DISCOVERY + FAVORITES/RECENT/HISTORY ---------- */
  (function(){
    const grid=$('#calcGrid');
    if(!grid) return;
    const label={kesehatan:'Kesehatan',keuangan:'Keuangan',umum:'Umum'};
    const homeExplore=grid.closest('.section');

    function cardHTML(x, compact=false){
      const fav=isFavorite(x.u);
      return `<div class="calc-card-shell${compact?' compact':''}">
        <a class="calc-card" href="${x.u}">
          <span class="ico"><i data-lucide="${CALC_ICONS[x.u]||'calculator'}"></i></span>
          <span class="card-kicker">${label[x.c]||x.c}</span>
          <h3>${x.t}</h3><p>${x.d}</p>
          <span class="go">Buka <i data-lucide="arrow-right"></i></span>
        </a>
        ${GUIDE_URLS.has(x.u)?'':`<button class="fav-btn${fav?' active':''}" data-fav="${x.u}" type="button" aria-label="${fav?'Hapus dari':'Tambahkan ke'} favorit" aria-pressed="${fav?'true':'false'}"><i data-lucide="star"></i></button>`}
      </div>`;
    }

    function draw(cat='all'){
      grid.innerHTML=CALCS.filter(x=>cat==='all'||x.c===cat).map(x=>cardHTML(x)).join('');
      window.lucide?.createIcons();
    }

    // Personalized local section placed before main discovery.
    const personal=document.createElement('section');
    personal.className='section wrap ko-personal reveal in';
    personal.innerHTML=`
      <div class="smart-grid">
        <article class="smart-panel" id="favoritePanel">
          <div class="smart-head"><div><span class="smart-kicker">PERSONAL</span><h2><i data-lucide="star"></i> Favoritmu</h2></div><span class="muted" id="favoriteCount"></span></div>
          <div class="smart-cards" id="favoriteList"></div>
        </article>
        <article class="smart-panel" id="recentPanel">
          <div class="smart-head"><div><span class="smart-kicker">AKSES CEPAT</span><h2><i data-lucide="history"></i> Terakhir digunakan</h2></div></div>
          <div class="smart-cards" id="recentList"></div>
        </article>
        <article class="smart-panel stage6-usage-panel" id="usagePanel">
          <div class="smart-head"><div><span class="smart-kicker">DI PERANGKAT INI</span><h2><i data-lucide="chart-no-axes-column-increasing"></i> Paling sering dipakai</h2><p>Ranking dihitung lokal, bukan dari data pengguna lain.</p></div><span class="muted" id="usageCount"></span></div>
          <div class="smart-cards" id="usageList"></div>
        </article>
      </div>
      <article class="smart-panel history-panel" id="historyPanel">
        <div class="smart-head"><div><span class="smart-kicker">LOCAL ONLY</span><h2><i data-lucide="clock-3"></i> Riwayat perhitungan</h2><p>Ringkasan hasil tersimpan hanya di browser perangkat ini.</p></div><button class="smart-clear" id="clearHistory" type="button"><i data-lucide="trash-2"></i> Hapus</button></div>
        <div class="history-list" id="historyList"></div>
      </article>`;
    homeExplore?.parentNode.insertBefore(personal,homeExplore);

    function renderFavorites(){
      const urls=getFavorites();
      const items=urls.map(calcByUrl).filter(Boolean).slice(0,4);
      $('#favoriteCount').textContent=items.length?`${items.length} tersimpan`:'';
      $('#favoriteList').innerHTML=items.length?items.map(x=>cardHTML(x,true)).join(''):`<div class="smart-empty"><i data-lucide="star"></i><span>Tekan ikon bintang pada kalkulator yang sering dipakai.</span></div>`;
      window.lucide?.createIcons();
    }
    function renderRecent(){
      const items=JSONStore.get(SMART_KEYS.recent,[]).map(x=>calcByUrl(x.u)).filter(Boolean).slice(0,4);
      $('#recentList').innerHTML=items.length?items.map(x=>cardHTML(x,true)).join(''):`<div class="smart-empty"><i data-lucide="mouse-pointer-click"></i><span>Kalkulator yang kamu buka akan muncul di sini.</span></div>`;
      window.lucide?.createIcons();
    }
    function renderUsage(){
      const ranked=usageItems().slice(0,4);
      const total=ranked.reduce((n,x)=>n+x.count,0);
      $('#usageCount').textContent=total?`${total} hitungan`:'';
      $('#usageList').innerHTML=ranked.length?ranked.map(x=>{
        const html=cardHTML(x.item,true);
        return html.replace('</a>',`<span class="stage6-usage-badge"><i data-lucide="activity"></i>${x.count}Ã— dihitung</span></a>`);
      }).join(''):`<div class="smart-empty"><i data-lucide="chart-no-axes-column-increasing"></i><span>Setelah beberapa perhitungan, kalkulator favorit berdasarkan penggunaanmu muncul di sini.</span></div>`;
      window.lucide?.createIcons();
    }

    function renderHistory(){
      const h=JSONStore.get(SMART_KEYS.history,[]).filter(x=>calcByUrl(x.u)).slice(0,6);
      $('#historyPanel').classList.toggle('has-items',!!h.length);
      $('#historyList').innerHTML=h.length?h.map(x=>{
        const item=calcByUrl(x.u), dt=new Date(x.at);
        return `<a class="history-item" href="${x.u}"><span class="history-icon"><i data-lucide="${CALC_ICONS[x.u]||'calculator'}"></i></span><span class="history-copy"><strong>${item.t}</strong><small>${x.summary}</small></span><time>${dt.toLocaleDateString('id-ID',{day:'numeric',month:'short'})}</time></a>`;
      }).join(''):`<div class="smart-empty"><i data-lucide="clock-3"></i><span>Belum ada hasil tersimpan. Setelah menghitung, ringkasan hasil akan muncul di sini.</span></div>`;
      window.lucide?.createIcons();
    }

    draw('all'); renderFavorites(); renderRecent(); renderUsage(); renderHistory();
    $$('.chip').forEach(c=>c.addEventListener('click',()=>{
      $$('.chip').forEach(x=>{x.classList.remove('active');x.setAttribute('aria-selected','false')});
      c.classList.add('active');c.setAttribute('aria-selected','true');draw(c.dataset.cat||'all');
      track('category_filter',{category:c.dataset.cat||'all'});
    }));
    document.addEventListener('click',e=>{
      const b=e.target.closest('[data-fav]'); if(!b) return;
      e.preventDefault(); e.stopPropagation(); toggleFavorite(b.dataset.fav);
    });
    $('#clearHistory')?.addEventListener('click',clearHistory);
    document.addEventListener('ko:favorites',()=>{ draw($('.chip.active')?.dataset.cat||'all'); renderFavorites(); renderRecent(); });
    document.addEventListener('ko:recent',renderRecent);
    document.addEventListener('ko:usage',renderUsage);
    document.addEventListener('ko:history',renderHistory);
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
    if(matchMedia('(display-mode: standalone)').matches){ toast('Aplikasi sudah terpasang di perangkat ini.'); track('pwa_install',{action:'already_installed'}); return; }
    if(!deferred){
      // Safari/iOS dan browser yang tidak menyediakan prompt otomatis diarahkan ke panduan install.
      track('pwa_install',{action:'manual_guide'});
      location.href='cara-install-aplikasi.html#install';
      return;
    }
    deferred.prompt();
    const {outcome}=await deferred.userChoice;
    if(outcome==='accepted') installBtns.forEach(x=>x.classList.remove('show'));
    track('pwa_install',{outcome:outcome||'unknown'});
    deferred=null;
  }));
  addEventListener('appinstalled',()=>{installBtns.forEach(b=>b.classList.remove('show'));track('pwa_install',{outcome:'installed'});});
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


  /* ---------- STAGE 3: PAGE FAVORITE + SMART RELATED ---------- */
  (function(){
    if(!isCalculator) return;
    const item=calcByUrl(currentFile);
    if(currentFile!=='index.html') markRecent(currentFile);
    const hh=$('.page-main .hero-header') || $('.featured-label + section .hero-header') || $('.hero-header');
    if(hh){
      const btn=document.createElement('button');
      btn.type='button'; btn.className='ko-page-favorite';
      const sync=()=>{ const active=isFavorite(currentFile); btn.classList.toggle('active',active); btn.setAttribute('aria-pressed',active?'true':'false'); btn.innerHTML=`<i data-lucide="star"></i><span>${active?'Tersimpan':'Favorit'}</span>`; window.lucide?.createIcons(); };
      sync(); hh.appendChild(btn);
      btn.addEventListener('click',()=>{toggleFavorite(currentFile);sync();});
      document.addEventListener('ko:favorites',sync);
    }

    const RELATED={
      'index.html':['kalkulator-kalori.html','kalkulator-bmr.html','kalkulator-body-fat.html','kalkulator-whtr.html'],
      'kalkulator-kalori.html':['kalkulator-bmr.html','index.html','kalkulator-air.html','kalkulator-body-fat.html'],
      'kalkulator-bmr.html':['kalkulator-kalori.html','index.html','kalkulator-air.html','kalkulator-body-fat.html'],
      'kalkulator-air.html':['kalkulator-kalori.html','index.html','kalkulator-bmr.html','kalkulator-whtr.html'],
      'kalkulator-whtr.html':['index.html','kalkulator-body-fat.html','kalkulator-kalori.html','kalkulator-bmr.html'],
      'kalkulator-body-fat.html':['kalkulator-whtr.html','index.html','kalkulator-kalori.html','kalkulator-bmr.html'],
      'kalkulator-masa-subur.html':['kalkulator-kehamilan.html','kalkulator-ukuran-janin.html','kalkulator-tendangan.html','kalkulator-kontraksi.html'],
      'kalkulator-kehamilan.html':['kalkulator-ukuran-janin.html','kalkulator-tendangan.html','kalkulator-kontraksi.html','kalkulator-masa-subur.html'],
      'kalkulator-ukuran-janin.html':['kalkulator-kehamilan.html','kalkulator-tendangan.html','kalkulator-kontraksi.html','kalkulator-masa-subur.html'],
      'kalkulator-tendangan.html':['kalkulator-kehamilan.html','kalkulator-ukuran-janin.html','kalkulator-kontraksi.html','kalkulator-masa-subur.html'],
      'kalkulator-kontraksi.html':['kalkulator-kehamilan.html','kalkulator-tendangan.html','kalkulator-ukuran-janin.html','kalkulator-masa-subur.html'],
      'kalkulator-cicilan.html':['kalkulator-persen.html','kalkulator-ppn.html','kalkulator-diskon.html'],
      'kalkulator-diskon.html':['kalkulator-persen.html','kalkulator-ppn.html','kalkulator-cicilan.html'],
      'kalkulator-ppn.html':['kalkulator-persen.html','kalkulator-diskon.html','kalkulator-cicilan.html'],
      'kalkulator-persen.html':['kalkulator-diskon.html','kalkulator-ppn.html','kalkulator-cicilan.html'],
      'kalkulator-umur.html':['konversi-satuan.html','kalkulator-persen.html','index.html'],
      'konversi-satuan.html':['kalkulator-persen.html','kalkulator-umur.html','index.html']
    };
    const related=(RELATED[currentFile]||CALCS.filter(x=>x.c===item.c&&x.u!==currentFile).map(x=>x.u)).map(calcByUrl).filter(Boolean).slice(0,4);
    const toolsGrid=$('.page-main .tools-grid');
    if(toolsGrid && related.length){
      toolsGrid.innerHTML=related.map(x=>`<a class="tool-card" href="${x.u}"><div class="tool-icon"><i data-lucide="${CALC_ICONS[x.u]||'calculator'}"></i></div><div class="tool-name">${x.t}</div><div class="tool-desc">${x.d}</div></a>`).join('');
      window.lucide?.createIcons();
    }
  })();

  /* ---------- STAGE 3: RESULT ACTIONS + LOCAL HISTORY ---------- */
  (function(){
    const result=$('.page-main .result') || ($('#result')?.closest('.card') ? $('#result') : null);
    const calcBtn=$('.calculate-btn');
    if(!result || !calcBtn || !isCalculator) return;

    const actions=document.createElement('div');
    actions.className='ko-result-actions';
    actions.innerHTML=`<button type="button" data-action="share" aria-label="Bagikan hasil"><i data-lucide="share-2"></i><span>Bagikan</span></button><button type="button" data-action="copy" aria-label="Salin hasil"><i data-lucide="copy"></i><span>Salin</span></button><button type="button" data-action="card" aria-label="Buat kartu hasil"><i data-lucide="image-down"></i><span>Kartu</span></button><button type="button" data-action="again" aria-label="Hitung ulang"><i data-lucide="rotate-ccw"></i><span>Ulangi</span></button>`;
    result.appendChild(actions);
    window.lucide?.createIcons();

    function resultText(){
      const clone=result.cloneNode(true); clone.querySelector('.ko-result-actions')?.remove();
      return clone.innerText.replace(/\s+/g,' ').trim();
    }
    function historySummary(){
      if(currentFile==='index.html'){
        const bmi=$('#r-bmi')?.textContent?.trim(), kat=$('#r-kategori-badge')?.textContent?.trim();
        if(bmi) return `BMI ${bmi}${kat?` â€¢ ${kat}`:''}`;
      }
      const cards=$$('.result-card',result).slice(0,3).map(card=>{
        const label=card.querySelector('.label')?.textContent?.trim();
        const value=card.querySelector('.value')?.textContent?.trim();
        return label&&value?`${label}: ${value}`:value||label||'';
      }).filter(Boolean);
      if(cards.length) return cards.join(' â€¢ ');
      const main=result.querySelector('.big-value,[id^="r-"]');
      if(main?.textContent?.trim()) return main.textContent.trim();
      return resultText().slice(0,140);
    }
    async function copyText(text){
      try{ await navigator.clipboard.writeText(text); return true; }
      catch(e){
        try{ const ta=document.createElement('textarea'); ta.value=text; ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.select();const ok=document.execCommand('copy');ta.remove();return ok; }catch(_){return false;}
      }
    }
    function canvasRoundRect(ctx,x,y,w,h,r){
      const rr=Math.min(r,w/2,h/2);ctx.beginPath();ctx.moveTo(x+rr,y);ctx.arcTo(x+w,y,x+w,y+h,rr);ctx.arcTo(x+w,y+h,x,y+h,rr);ctx.arcTo(x,y+h,x,y,rr);ctx.arcTo(x,y,x+w,y,rr);ctx.closePath();
    }
    function wrapCanvasText(ctx,text,x,y,maxWidth,lineHeight,maxLines=8){
      const words=String(text||'').replace(/\s+/g,' ').trim().split(' ');let line='',lines=[];
      for(const word of words){const test=line?line+' '+word:word;if(ctx.measureText(test).width>maxWidth&&line){lines.push(line);line=word;if(lines.length>=maxLines-1)break;}else line=test;}
      if(line&&lines.length<maxLines)lines.push(line);
      lines.forEach((ln,i)=>ctx.fillText(ln,x,y+i*lineHeight)); return y+Math.max(1,lines.length)*lineHeight;
    }
    async function makeResultCard(){
      const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1080;const ctx=canvas.getContext('2d');
      if(!ctx) throw new Error('canvas_unavailable');
      const grad=ctx.createLinearGradient(0,0,1080,1080);grad.addColorStop(0,'#4f46e5');grad.addColorStop(.52,'#7c3aed');grad.addColorStop(1,'#0ea5e9');ctx.fillStyle=grad;ctx.fillRect(0,0,1080,1080);
      ctx.fillStyle='rgba(255,255,255,.10)';ctx.beginPath();ctx.arc(930,160,230,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(80,940,260,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='rgba(255,255,255,.96)';canvasRoundRect(ctx,72,90,936,820,42);ctx.fill();
      ctx.fillStyle='#6d5dfc';ctx.font='800 38px Poppins, Arial, sans-serif';ctx.fillText('KalkulatorOnline.my.id',124,165);
      ctx.fillStyle='#1f2333';ctx.font='800 58px Poppins, Arial, sans-serif';let y=wrapCanvasText(ctx,calcByUrl(currentFile)?.t||'Hasil Kalkulator',124,260,820,70,3);
      ctx.fillStyle='#6b7280';ctx.font='500 28px Poppins, Arial, sans-serif';y=wrapCanvasText(ctx,'Ringkasan hasil',124,y+22,820,42,1);
      ctx.fillStyle='#27283a';ctx.font='700 39px Poppins, Arial, sans-serif';y=wrapCanvasText(ctx,historySummary(),124,y+30,820,54,7);
      ctx.fillStyle='#6b7280';ctx.font='500 24px Poppins, Arial, sans-serif';wrapCanvasText(ctx,'Hasil ini merupakan estimasi dari kalkulator dan bukan pengganti penilaian profesional bila konteksnya memerlukan.',124,770,820,36,3);
      ctx.fillStyle='rgba(255,255,255,.95)';ctx.font='700 25px Poppins, Arial, sans-serif';ctx.fillText('Dibuat lokal â€¢ Data hasil tidak diunggah',78,990);
      return await new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('blob_failed')),'image/png',.95));
    }
    async function shareResultCard(){
      const blob=await makeResultCard(); const file=new File([blob],`hasil-${currentFile.replace(/\.html$/,'')||'bmi'}.png`,{type:'image/png'});
      if(navigator.share&&navigator.canShare?.({files:[file]})){
        await navigator.share({title:calcByUrl(currentFile)?.t||document.title,text:'Kartu hasil dari KalkulatorOnline.my.id',files:[file]});
        track('result_action',{calculator:currentFile,action:'card_share'});return;
      }
      const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=file.name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);
      toast('Kartu hasil PNG dibuat');track('result_action',{calculator:currentFile,action:'card_download'});
    }
    actions.addEventListener('click',async e=>{
      const b=e.target.closest('button'); if(!b) return;
      const text=`${calcByUrl(currentFile)?.t||document.title}\n${resultText()}\n${location.href}`;
      if(b.dataset.action==='copy'){ const ok=await copyText(text);toast(ok?'Hasil berhasil disalin':'Tidak dapat menyalin hasil');track('result_action',{calculator:currentFile,action:ok?'copy':'copy_failed'}); }
      if(b.dataset.action==='share'){
        if(navigator.share){ try{await navigator.share({title:document.title,text:resultText(),url:location.href});}catch(err){} }
        else toast(await copyText(text)?'Browser tidak mendukung share â€” hasil disalin':'Share tidak didukung browser');
        track('result_action',{calculator:currentFile,action:'share'});
      }
      if(b.dataset.action==='card'){
        try{await shareResultCard();}catch(err){if(err?.name!=='AbortError')toast('Kartu hasil belum dapat dibuat di browser ini.');}
      }
      if(b.dataset.action==='again'){
        result.style.display='none';
        const first=$('input:not([type="hidden"]),select',result.closest('.card')||document); first?.focus();
        first?.scrollIntoView({behavior:'smooth',block:'center'});
        track('result_action',{calculator:currentFile,action:'recalculate'});
      }
    });

    calcBtn.addEventListener('click',()=>{
      setTimeout(()=>{
        const shown=getComputedStyle(result).display!=='none';
        if(!shown) return;
        const txt=resultText(); if(!txt) return;
        markRecent(currentFile); saveHistory(currentFile,historySummary()); bumpUsage(currentFile);
        const meta=calcByUrl(currentFile);track('calculator_complete',{calculator:currentFile,category:meta?.c||'',unit:store.get('ko-units')||'metric'});
      },80);
    });
  })();

  /* ---------- STAGE 3: METRIC / IMPERIAL (health calculators) ---------- */
  (function(){
    const configs={
      'index.html':{fields:{berat:{metric:'kg',imperial:'lb',factor:0.45359237,mp:'Contoh: 65',ip:'Contoh: 143'},tinggi:{metric:'cm',imperial:'in',factor:2.54,mp:'Contoh: 170',ip:'Contoh: 67'}}},
      'kalkulator-kalori.html':{fields:{berat:{metric:'kg',imperial:'lb',factor:0.45359237,mp:'Contoh: 65',ip:'Contoh: 143'},tinggi:{metric:'cm',imperial:'in',factor:2.54,mp:'Contoh: 170',ip:'Contoh: 67'}}},
      'kalkulator-bmr.html':{fields:{berat:{metric:'kg',imperial:'lb',factor:0.45359237,mp:'Contoh: 65',ip:'Contoh: 143'},tinggi:{metric:'cm',imperial:'in',factor:2.54,mp:'Contoh: 170',ip:'Contoh: 67'}}},
      'kalkulator-air.html':{fields:{berat:{metric:'kg',imperial:'lb',factor:0.45359237,mp:'Contoh: 65',ip:'Contoh: 143'}}},
      'kalkulator-whtr.html':{fields:{pinggang:{metric:'cm',imperial:'in',factor:2.54,mp:'Contoh: 80',ip:'Contoh: 31.5'},tinggi:{metric:'cm',imperial:'in',factor:2.54,mp:'Contoh: 170',ip:'Contoh: 67'}}},
      'kalkulator-body-fat.html':{fields:{tinggi:{metric:'cm',imperial:'in',factor:2.54,mp:'Contoh: 170',ip:'Contoh: 67'},leher:{metric:'cm',imperial:'in',factor:2.54,mp:'Contoh: 38',ip:'Contoh: 15'},pinggang:{metric:'cm',imperial:'in',factor:2.54,mp:'Contoh: 85',ip:'Contoh: 33.5'},pinggul:{metric:'cm',imperial:'in',factor:2.54,mp:'Contoh: 95',ip:'Contoh: 37.4'}}}
    };
    const cfg=configs[currentFile], calcBtn=$('.calculate-btn'); if(!cfg||!calcBtn) return;
    let unit=store.get('ko-units')==='imperial'?'imperial':'metric';
    const grid=calcBtn.previousElementSibling?.classList.contains('form-grid')?calcBtn.previousElementSibling:$('.form-grid');
    if(!grid) return;
    const switcher=document.createElement('div'); switcher.className='unit-switch'; switcher.setAttribute('aria-label','Sistem satuan');
    switcher.innerHTML=`<span>Satuan</span><div><button type="button" data-unit="metric">Metric</button><button type="button" data-unit="imperial">Imperial</button></div>`;
    grid.parentNode.insertBefore(switcher,grid);

    function decimals(v){ return Math.abs(v)>=100?1:2; }
    function setLabels(){
      Object.entries(cfg.fields).forEach(([id,f])=>{
        const input=$('#'+id), label=$(`label[for="${id}"]`); if(!input) return;
        if(label){ const base=label.textContent.replace(/\s*\((kg|lb|cm|in)\)\s*$/i,''); label.textContent=`${base} (${f[unit]})`; }
        input.placeholder=unit==='metric'?f.mp:f.ip;
      });
      $$('[data-unit]',switcher).forEach(b=>{b.classList.toggle('active',b.dataset.unit===unit);b.setAttribute('aria-pressed',b.dataset.unit===unit?'true':'false')});
    }
    function changeUnit(next){
      if(next===unit) return;
      Object.entries(cfg.fields).forEach(([id,f])=>{
        const input=$('#'+id), val=parseFloat(input?.value); if(!input||!Number.isFinite(val)) return;
        const converted=next==='imperial'?val/f.factor:val*f.factor;
        input.value=Number(converted.toFixed(decimals(converted)));
      });
      unit=next; store.set('ko-units',unit); setLabels(); toast(unit==='metric'?'Satuan Metric aktif':'Satuan Imperial aktif'); track('unit_change',{calculator:currentFile,unit});
    }
    setLabels();
    switcher.addEventListener('click',e=>{const b=e.target.closest('[data-unit]');if(b)changeUnit(b.dataset.unit);});

    // Before inline calculator onclick runs, temporarily translate imperial inputs to metric.
    // Formula lokal tetap bekerja dengan unit aslinya (kg/cm), lalu input dikembalikan.
    calcBtn.addEventListener('click',()=>{
      const originals={};
      if(unit==='imperial'){
        Object.entries(cfg.fields).forEach(([id,f])=>{ const input=$('#'+id),v=parseFloat(input?.value); if(input&&Number.isFinite(v)){originals[id]=input.value;input.value=v*f.factor;} });
      }
      setTimeout(()=>{
        Object.entries(originals).forEach(([id,v])=>{const input=$('#'+id);if(input)input.value=v;});
        if(currentFile==='index.html'){
          const detailLabels=$$('.detail-label');
          if(unit==='imperial'){
            const kg=parseFloat($('#r-berat')?.textContent), cm=parseFloat($('#r-tinggi')?.textContent);
            if(Number.isFinite(kg)) $('#r-berat').textContent=(kg/0.45359237).toFixed(1);
            if(Number.isFinite(cm)) $('#r-tinggi').textContent=(cm/2.54).toFixed(1);
            detailLabels.forEach(el=>{if(el.textContent.includes('Berat'))el.textContent='Berat (lb)';if(el.textContent.includes('Tinggi'))el.textContent='Tinggi (in)';});
            ['r-range-ideal','r-broca'].forEach(id=>{const el=$('#'+id);if(!el)return; const nums=el.textContent.match(/[\d.]+/g);if(nums){el.textContent=nums.map(n=>(parseFloat(n)/0.45359237).toFixed(1)).join(el.textContent.includes('-')?' - ':'');}});
            $$('.iw-unit').forEach(el=>el.textContent='pound');
            const diff=$('#r-diff'), diffMsg=$('#r-diff-message');
            if(diff){ const m=diff.textContent.match(/([+-]?)([\d.]+)\s*kg/i); if(m) diff.textContent=`${m[1]}${(parseFloat(m[2])/0.45359237).toFixed(1)} lb`; }
            if(diffMsg) diffMsg.innerHTML=diffMsg.innerHTML.replace(/([\d.]+)\s*kg/gi,(_,n)=>`${(parseFloat(n)/0.45359237).toFixed(1)} lb`);
          }else{
            detailLabels.forEach(el=>{if(el.textContent.includes('Berat'))el.textContent='Berat (kg)';if(el.textContent.includes('Tinggi'))el.textContent='Tinggi (cm)';});
            $$('.iw-unit').forEach(el=>el.textContent='kilogram');
          }
        }
      },0);
    },true);
  })();

  /* ---------- STAGE 6: PRODUCTION HARDENING ---------- */
  (function(){
    // Track calculator/page opens only after explicit analytics consent.
    let openTracked=false;
    function trackOpen(){
      if(openTracked||!analyticsReady()) return;
      const meta=calcByUrl(currentFile);track(meta&&!GUIDE_URLS.has(currentFile)?'calculator_open':'page_open',{calculator:meta?.u||'',category:meta?.c||'',page:currentFile});openTracked=true;
    }
    trackOpen();document.addEventListener('ko:analytics-ready',trackOpen);

    // Core Web Vitals are buffered locally and only sent when analytics is allowed.
    const vitals={},sent=new Set();
    function rate(name,v){if(name==='CLS')return v<=.1?'good':v<=.25?'needs_improvement':'poor';if(name==='LCP')return v<=2500?'good':v<=4000?'needs_improvement':'poor';if(name==='INP')return v<=200?'good':v<=500?'needs_improvement':'poor';if(name==='FCP')return v<=1800?'good':v<=3000?'needs_improvement':'poor';return 'unknown';}
    function flushVitals(){if(!analyticsReady())return;Object.entries(vitals).forEach(([metric,value])=>{if(sent.has(metric))return;track('web_vital',{metric,value:metric==='CLS'?Math.round(value*1000)/1000:Math.round(value),rating:rate(metric,value),page:currentFile});sent.add(metric);});}
    try{
      new PerformanceObserver(list=>{const e=list.getEntries().at(-1);if(e)vitals.LCP=e.startTime;}).observe({type:'largest-contentful-paint',buffered:true});
      let cls=0;new PerformanceObserver(list=>{for(const e of list.getEntries())if(!e.hadRecentInput)cls+=e.value;vitals.CLS=cls;}).observe({type:'layout-shift',buffered:true});
      let inp=0;new PerformanceObserver(list=>{for(const e of list.getEntries())inp=Math.max(inp,e.duration||0);vitals.INP=inp;}).observe({type:'event',buffered:true,durationThreshold:40});
      const fcp=performance.getEntriesByName('first-contentful-paint')[0];if(fcp)vitals.FCP=fcp.startTime;
    }catch(e){}
    document.addEventListener('ko:analytics-ready',()=>setTimeout(flushVitals,1200));
    addEventListener('pagehide',flushVitals);

    // Non-critical images decode/lazy-load without changing layout.
    $$('img').forEach(img=>{if(!img.hasAttribute('decoding'))img.decoding='async';if(!img.hasAttribute('loading')&&!img.closest('.hero,.hero-header'))img.loading='lazy';});

    // Runtime failures: no sensitive error text is sent to analytics.
    let lastToast=0;
    function safeFailure(kind,resourceType=''){
      track('app_error',{kind,resource_type:resourceType,page:currentFile});
      if(kind==='runtime'&&Date.now()-lastToast>6000){lastToast=Date.now();toast('Terjadi kendala kecil. Coba ulangi aksi atau muat ulang halaman.');}
    }
    addEventListener('error',e=>{if(e.target&&e.target!==window){safeFailure('resource',String(e.target.tagName||'').toLowerCase());return;}safeFailure('runtime');},true);
    addEventListener('unhandledrejection',()=>safeFailure('runtime'));

    // Monetization foundation. House sponsor can be managed from Stage 8 CMS.
    function renderHouseSponsor(){
      $$('.ko-sponsor[data-cms-sponsor="1"]').forEach(x=>x.remove());
      const base=window.KO_MONETIZATION||{};
      const cms=window.KOCMS?.get?.('sponsor',null);
      const cfg=(cms?.enabled&&cms?.title&&cms?.url)?{enabled:true,label:cms.label||'Sponsor',houseAd:cms}:base;
      if(!cfg?.enabled||!cfg?.houseAd?.title||!cfg?.houseAd?.url)return;
      function slot(id){
        const a=document.createElement('a');a.className='ko-sponsor';a.dataset.cmsSponsor='1';a.href=cfg.houseAd.url;a.target='_blank';a.rel='sponsored noopener noreferrer';a.dataset.slot=id;
        a.innerHTML=`<span class="ko-sponsor-label"></span><span class="ko-sponsor-copy"><strong></strong><small></small></span><span class="ko-sponsor-cta"></span>`;
        a.querySelector('.ko-sponsor-label').textContent=cfg.label||'Sponsor';a.querySelector('strong').textContent=cfg.houseAd.title;a.querySelector('small').textContent=cfg.houseAd.description||'';a.querySelector('.ko-sponsor-cta').textContent=cfg.houseAd.cta||'Lihat';
        a.addEventListener('click',()=>track('sponsor_click',{slot:id}));return a;
      }
      if(currentFile==='index.html') $('#calcGrid')?.closest('.section')?.insertAdjacentElement('afterend',slot('home_after_discovery'));
      else if(isCalculator) $('.page-main .card')?.insertAdjacentElement('afterend',slot('calculator_after_primary'));
    }
    renderHouseSponsor();document.addEventListener('ko:cms-updated',renderHouseSponsor);
  })();

  /* ---------- STAGE 7: GROWTH + CONTENT SYSTEM ---------- */
  (function(){
    const ACTIVITY_KEY='ko-activity-v1';
    const lastActivityIdKey='ko-activity-last-history-id';

    // Lightweight activity timeline: only calculator URL + timestamp. No input/result values.
    function syncActivityFromHistory(){
      const h=JSONStore.get(SMART_KEYS.history,[]);
      const latest=h[0]; if(!latest?.id||!latest?.u||GUIDE_URLS.has(latest.u)) return;
      const last=Number(store.get(lastActivityIdKey)||0); if(Number(latest.id)<=last) return;
      let activity=JSONStore.get(ACTIVITY_KEY,[]).filter(x=>x?.u&&calcByUrl(x.u));
      activity.unshift({u:latest.u,at:Number(latest.at)||Date.now()});
      JSONStore.set(ACTIVITY_KEY,activity.slice(0,240)); store.set(lastActivityIdKey,String(latest.id));
      document.dispatchEvent(new CustomEvent('ko:activity'));
    }
    document.addEventListener('ko:history',syncActivityFromHistory);

    function calcCard(x, extra=''){
      return `<a class="stage7-directory-card" href="${x.u}"><span class="stage7-directory-icon"><i data-lucide="${CALC_ICONS[x.u]||'calculator'}"></i></span><span class="stage7-directory-copy"><small>${x.c==='kesehatan'?'Kesehatan':x.c==='keuangan'?'Keuangan':'Umum'}</small><strong>${x.t}</strong><span>${x.d}</span>${extra}</span><i class="stage7-directory-arrow" data-lucide="arrow-right"></i></a>`;
    }

    // Public popular page: curated shortcuts + device-local ranking (never presented as global usage data).
    const curatedGrid=$('#popularCuratedGrid'), localGrid=$('#popularLocalGrid');
    function renderCurated(){
      if(!curatedGrid)return;
      const fallback=['index.html','kalkulator-kalori.html','kalkulator-cicilan.html','kalkulator-kehamilan.html','kalkulator-persen.html','kalkulator-umur.html'];
      const curated=window.KOCMS?.get?.('popular.curated',fallback)||fallback;
      curatedGrid.innerHTML=curated.map(calcByUrl).filter(Boolean).map(x=>calcCard(x)).join('');
      window.lucide?.createIcons();
    }
    renderCurated();document.addEventListener('ko:cms-updated',renderCurated);
    function renderPopularLocal(){
      if(!localGrid) return;
      const ranked=usageItems().slice(0,8);
      localGrid.innerHTML=ranked.length?ranked.map(x=>calcCard(x.item,`<em>${x.count}Ã— dihitung di perangkat ini</em>`)).join(''):
        `<div class="stage7-empty-wide"><i data-lucide="sparkles"></i><strong>Belum ada ranking lokal</strong><span>Gunakan beberapa kalkulator. Ranking pribadi akan muncul otomatis tanpa akun.</span><a href="index.html#calcGrid">Mulai menghitung</a></div>`;
      window.lucide?.createIcons();
    }
    renderPopularLocal(); document.addEventListener('ko:usage',renderPopularLocal);

    // Local-only dashboard.
    const dash=$('#statsDashboard');
    function activityItems(){
      let a=JSONStore.get(ACTIVITY_KEY,[]).filter(x=>x?.u&&calcByUrl(x.u));
      if(!a.length){
        // One-time privacy-safe migration from Stage 6 history: URL + timestamp only.
        const h=JSONStore.get(SMART_KEYS.history,[]).filter(x=>x?.u&&calcByUrl(x.u));
        if(h.length){a=h.map(x=>({u:x.u,at:Number(x.at)||Date.now()})).slice(0,240);JSONStore.set(ACTIVITY_KEY,a);store.set(lastActivityIdKey,String(Number(h[0]?.id)||0));}
      }
      return a;
    }
    function statsData(){
      const ranked=usageItems(), activity=activityItems(), fav=getFavorites(), recent=JSONStore.get(SMART_KEYS.recent,[]).filter(x=>x?.u&&calcByUrl(x.u));
      const total=ranked.reduce((n,x)=>n+x.count,0), unique=ranked.length;
      const category={kesehatan:0,keuangan:0,umum:0}; ranked.forEach(x=>category[x.item.c]=(category[x.item.c]||0)+x.count);
      const days=[]; const now=new Date();
      for(let i=6;i>=0;i--){const d=new Date(now);d.setHours(0,0,0,0);d.setDate(d.getDate()-i);const next=new Date(d);next.setDate(next.getDate()+1);days.push({date:d,label:d.toLocaleDateString('id-ID',{weekday:'short'}),count:activity.filter(x=>x.at>=d.getTime()&&x.at<next.getTime()).length});}
      return {ranked,activity,fav,recent,total,unique,category,days};
    }
    function renderDashboard(){
      if(!dash) return; const d=statsData(); const top=d.ranked[0]; const maxDay=Math.max(1,...d.days.map(x=>x.count)); const maxTop=Math.max(1,...d.ranked.slice(0,6).map(x=>x.count));
      $('#statTotal').textContent=d.total.toLocaleString('id-ID'); $('#statUnique').textContent=d.unique; $('#statFavorites').textContent=d.fav.length; $('#statTop').textContent=top?.item?.t.replace('Kalkulator ','')||'â€”';
      $('#statsTopList').innerHTML=d.ranked.length?d.ranked.slice(0,6).map((x,i)=>`<div class="stage7-rank-row"><span class="stage7-rank-no">${i+1}</span><span class="stage7-rank-main"><strong>${x.item.t}</strong><span><i style="width:${Math.max(7,(x.count/maxTop)*100)}%"></i></span></span><b>${x.count}Ã—</b></div>`).join(''):`<div class="stage7-empty-inline">Belum ada data penggunaan.</div>`;
      $('#statsWeek').innerHTML=d.days.map(x=>`<div class="stage7-day"><span class="stage7-day-bar"><i style="height:${Math.max(x.count?10:2,(x.count/maxDay)*100)}%"></i></span><strong>${x.count}</strong><small>${x.label}</small></div>`).join('');
      const catTotal=Math.max(1,Object.values(d.category).reduce((a,b)=>a+b,0));
      $('#statsCategories').innerHTML=Object.entries(d.category).map(([k,v])=>`<div class="stage7-cat-row"><span>${k==='kesehatan'?'Kesehatan':k==='keuangan'?'Keuangan':'Umum'}</span><div><i style="width:${(v/catTotal)*100}%"></i></div><b>${v}</b></div>`).join('');
      $('#statsRecent').innerHTML=d.recent.length?d.recent.slice(0,5).map(x=>{const item=calcByUrl(x.u);return `<a href="${x.u}"><i data-lucide="${CALC_ICONS[x.u]||'calculator'}"></i><span><strong>${item.t}</strong><small>${new Date(x.at).toLocaleString('id-ID',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</small></span></a>`}).join(''):`<div class="stage7-empty-inline">Belum ada kalkulator terbaru.</div>`;
      window.lucide?.createIcons();
    }
    if(dash){
      renderDashboard(); ['ko:usage','ko:activity','ko:favorites','ko:recent'].forEach(ev=>document.addEventListener(ev,renderDashboard));
      $('#exportStats')?.addEventListener('click',()=>{
        const d=statsData(); const payload={exportedAt:new Date().toISOString(),privacy:'Hanya metadata penggunaan lokal; tidak memuat input atau hasil kalkulator.',totalCalculations:d.total,favorites:d.fav,recent:d.recent,usage:d.ranked.map(x=>({calculator:x.item.u,count:x.count,last:x.last})),activity:d.activity};
        const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}), url=URL.createObjectURL(blob), a=document.createElement('a');a.href=url;a.download='kalkulatoronline-statistik-lokal.json';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('Statistik lokal diekspor');track('result_action',{action:'stats_export',page:currentFile});
      });
      $('#resetStats')?.addEventListener('click',()=>{
        if(!confirm('Reset statistik penggunaan lokal? Favorit dan riwayat hasil tidak akan dihapus.')) return;
        JSONStore.set(SMART_KEYS.usage,{});JSONStore.set(ACTIVITY_KEY,[]);store.set(lastActivityIdKey,'0');renderDashboard();toast('Statistik penggunaan direset');track('result_action',{action:'stats_reset',page:currentFile});
      });
    }

    // Contextual FAQ for each calculator. This is rendered only on calculator pages.
    const FAQS={
      'index.html':[
        ['Apa arti angka BMI?','BMI membandingkan berat dan tinggi badan untuk skrining umum pada orang dewasa. Angka ini tidak langsung mengukur lemak tubuh atau menentukan diagnosis.'],
        ['Apakah BMI cocok untuk semua orang?','Tidak selalu. Atlet, lansia, anak, dan kondisi khusus seperti kehamilan dapat memerlukan penilaian yang berbeda.'],
        ['Mengapa hasil BMI hanya estimasi?','Karena BMI tidak mempertimbangkan komposisi tubuh, distribusi lemak, massa otot, maupun kondisi individual lainnya.']],
      'kalkulator-kalori.html':[
        ['Apa bedanya BMR dan TDEE?','BMR memperkirakan energi dasar saat tubuh beristirahat, sedangkan TDEE memasukkan perkiraan aktivitas harian.'],
        ['Apakah target kalori harus persis sama setiap hari?','Tidak. Hasil kalkulator adalah titik awal estimasi dan kebutuhan nyata dapat berubah mengikuti aktivitas serta kondisi individual.'],
        ['Mengapa tersedia penyesuaian persentase?','Persentase memberi fleksibilitas dibanding memakai angka defisit atau surplus yang sama untuk semua orang.']],
      'kalkulator-bmr.html':[
        ['Apa fungsi kalkulator BMR?','BMR memperkirakan energi minimum yang digunakan tubuh untuk fungsi dasar saat beristirahat.'],
        ['Mengapa aktivitas memengaruhi hasil harian?','Aktivitas digunakan untuk memperkirakan TDEE dari BMR, sehingga pilihan tingkat aktivitas mengubah estimasi kebutuhan energi harian.'],
        ['Apakah BMR sama dengan kebutuhan kalori diet?','Tidak. BMR adalah kebutuhan dasar; kebutuhan harian biasanya lebih tinggi karena aktivitas dan faktor lainnya.']],
      'kalkulator-air.html':[
        ['Apakah kebutuhan air sama untuk semua orang?','Tidak. Berat badan, cuaca, aktivitas, makanan, kondisi kesehatan, kehamilan, dan menyusui dapat memengaruhi kebutuhan cairan.'],
        ['Apakah semua cairan harus berasal dari air putih?','Tidak seluruhnya. Makanan dan minuman lain juga menyumbang cairan, meski air putih tetap pilihan praktis untuk hidrasi.'],
        ['Mengapa kalkulator menanyakan kondisi cuaca atau aktivitas?','Panas dan banyak berkeringat dapat meningkatkan kehilangan cairan sehingga estimasi kebutuhan dapat berubah.']],
      'kalkulator-whtr.html':[
        ['Apa itu WHtR?','Waist-to-Height Ratio membandingkan lingkar pinggang dengan tinggi badan sebagai alat skrining sederhana.'],
        ['Apakah WHtR merupakan diagnosis?','Tidak. WHtR hanya indikator skrining dan perlu dilihat bersama faktor kesehatan lain.'],
        ['Bagaimana mengukur pinggang agar konsisten?','Gunakan pita ukur mendatar dan ulangi pengukuran pada posisi tubuh yang sama agar hasil lebih konsisten.']],
      'kalkulator-body-fat.html':[
        ['Metode apa yang digunakan?','Kalkulator menggunakan estimasi berbasis pengukuran tubuh metode US Navy.'],
        ['Mengapa hasil bisa berbeda dengan timbangan pintar?','Metode dan asumsi setiap alat berbeda, sehingga hasil persentase lemak dapat tidak sama.'],
        ['Apakah hasil ini pengganti pemeriksaan komposisi tubuh?','Tidak. Ini estimasi praktis dan bukan pengganti pengukuran profesional bila dibutuhkan.']],
      'kalkulator-masa-subur.html':[
        ['Apakah prediksi masa subur selalu tepat?','Tidak. Siklus dapat berubah dan ovulasi tidak selalu terjadi pada tanggal yang sama setiap bulan.'],
        ['Apa yang digunakan untuk menghitung?','Kalkulator memakai tanggal haid terakhir dan panjang siklus sebagai dasar perkiraan.'],
        ['Bisakah kalkulator ini digunakan sebagai kontrasepsi?','Prediksi kalender saja tidak cukup andal sebagai satu-satunya metode kontrasepsi.']],
      'kalkulator-kehamilan.html':[
        ['Bagaimana HPL diperkirakan?','HPL diperkirakan dari HPHT dan dapat disesuaikan dengan panjang siklus yang dimasukkan.'],
        ['Apakah HPL adalah tanggal pasti persalinan?','Tidak. HPL adalah perkiraan; persalinan dapat terjadi sebelum atau sesudah tanggal tersebut.'],
        ['Mengapa usia kehamilan dihitung dari HPHT?','Pendekatan klinis umum menghitung usia kehamilan dari hari pertama haid terakhir karena waktu konsepsi sering tidak diketahui pasti.']],
      'kalkulator-kontraksi.html':[
        ['Apa yang dicatat timer kontraksi?','Timer mencatat durasi kontraksi dan interval antar kontraksi agar pola lebih mudah dilihat.'],
        ['Apakah timer dapat menentukan waktu persalinan?','Tidak. Timer hanya alat pencatat dan tidak dapat menentukan kondisi medis atau kapan persalinan pasti terjadi.'],
        ['Kapan perlu mencari bantuan medis?','Ikuti arahan tenaga kesehatan yang menangani kehamilan, terutama bila ada gejala yang mengkhawatirkan atau kondisi darurat.']],
      'kalkulator-tendangan.html':[
        ['Apa fungsi penghitung tendangan?','Fitur ini membantu mencatat gerakan bayi secara teratur di perangkat sendiri.'],
        ['Apakah jumlah gerakan sama pada setiap kehamilan?','Pola dapat berbeda antar kehamilan dan dapat berubah sepanjang hari.'],
        ['Apa yang dilakukan jika pola gerakan terasa berbeda?','Jika ada perubahan yang membuat khawatir, hubungi tenaga kesehatan yang menangani kehamilan untuk arahan.']],
      'kalkulator-ukuran-janin.html':[
        ['Apakah ukuran janin di kalkulator sama dengan hasil USG?','Tidak selalu. Data di kalkulator adalah referensi umum per minggu, sedangkan USG menilai kondisi individual.'],
        ['Mengapa ukuran janin ditampilkan sebagai perbandingan benda atau buah?','Perbandingan tersebut hanya membantu visualisasi ukuran secara sederhana.'],
        ['Apakah usia kehamilan memengaruhi referensi ukuran?','Ya. Referensi panjang dan berat berubah sesuai usia kehamilan.']],
      'kalkulator-cicilan.html':[
        ['Apa perbedaan bunga flat, efektif, dan anuitas?','Flat menghitung bunga dari pokok awal, efektif menghitung bunga dari sisa pokok, sedangkan anuitas menjaga total angsuran lebih stabil dengan komposisi pokok-bunga yang berubah.'],
        ['Apakah hasil sama dengan tagihan bank atau leasing?','Belum tentu. Penyedia pembiayaan dapat memakai biaya, pembulatan, provisi, asuransi, dan metode perhitungan berbeda.'],
        ['Mengapa ada tabel amortisasi?','Tabel membantu melihat pembagian pokok, bunga, dan sisa pinjaman pada setiap periode.']],
      'kalkulator-diskon.html':[
        ['Bagaimana diskon dihitung?','Diskon dihitung dari persentase potongan terhadap harga awal, kemudian potongan tersebut dikurangi dari harga awal.'],
        ['Bagaimana dengan diskon bertingkat?','Dua diskon berurutan tidak sama dengan menjumlahkan persentasenya karena diskon kedua dihitung dari harga setelah diskon pertama.'],
        ['Apakah kalkulator menyimpan harga yang dimasukkan?','Tidak ke server. Fitur inti kalkulator diproses di browser.']],
      'kalkulator-ppn.html':[
        ['Apa fungsi kalkulator PPN?','Kalkulator membantu menghitung nilai pajak dari dasar pengenaan atau memisahkan komponen pajak dari total sesuai input yang tersedia.'],
        ['Apakah tarif pajak dapat berubah?','Ya. Aturan dan tarif dapat berubah, jadi gunakan tarif yang sesuai ketentuan yang berlaku untuk transaksi Anda.'],
        ['Apakah hasil kalkulator merupakan dokumen pajak?','Tidak. Hasil hanya alat bantu hitung dan bukan faktur atau dokumen perpajakan resmi.']],
      'kalkulator-persen.html':[
        ['Apa yang bisa dihitung dengan kalkulator persentase?','Anda dapat menghitung persentase dari suatu nilai, perubahan persentase, atau hubungan dua angka tergantung mode yang tersedia.'],
        ['Mengapa perubahan turun 20% lalu naik 20% tidak kembali ke angka awal?','Karena persentase kedua dihitung dari basis nilai yang sudah berubah.'],
        ['Apakah kalkulator mendukung angka desimal?','Ya, selama browser menerima format angka yang dimasukkan pada kolom terkait.']],
      'kalkulator-umur.html':[
        ['Bagaimana umur dihitung?','Umur dihitung dari selisih tanggal lahir dengan tanggal acuan, kemudian diuraikan menjadi tahun, bulan, dan hari.'],
        ['Apakah tahun kabisat diperhitungkan?','Perhitungan tanggal browser memperhitungkan kalender termasuk tahun kabisat.'],
        ['Bisakah menghitung umur pada tanggal tertentu?','Gunakan tanggal acuan jika halaman menyediakan pilihan tersebut; hasil akan mengikuti tanggal yang dipilih.']],
      'konversi-satuan.html':[
        ['Berapa kategori satuan yang tersedia?','Versi ini menyediakan kategori panjang, massa, suhu, luas, volume, waktu, kecepatan, data digital, energi, dan tekanan.'],
        ['Mengapa hasil konversi kadang memiliki banyak desimal?','Sebagian satuan memiliki faktor konversi yang tidak menghasilkan angka bulat. Tampilan dibulatkan agar tetap mudah dibaca.'],
        ['Apakah konversi dilakukan online?','Tidak. Rumus konversi berjalan langsung di browser setelah aplikasi dimuat.']]
    };
    function injectFaqAndLinks(){
      if(!isCalculator||!FAQS[currentFile]) return;
      const main=$('#main'); if(!main) return;
      $$('.stage7-faq,.stage7-context-links').forEach(x=>x.remove());document.querySelector('script[data-stage7="faq"]')?.remove();
      const cmsFaq=window.KOCMS?.get?.(`faqOverrides.${currentFile}`,null);
      const activeFaq=Array.isArray(cmsFaq)&&cmsFaq.length?cmsFaq.map(x=>[x.q||x.question||x[0],x.a||x.answer||x[1]]).filter(x=>x[0]&&x[1]):FAQS[currentFile];
      const faq=document.createElement('section');faq.className='wrap stage7-faq reveal in';faq.innerHTML=`<div class="stage7-section-head"><div><span>PERTANYAAN TERKAIT</span><h2>FAQ ${calcByUrl(currentFile)?.t||''}</h2></div><a href="faq.html">Lihat FAQ umum <i data-lucide="arrow-right"></i></a></div><div class="stage7-faq-list">${activeFaq.map((q,i)=>`<details ${i===0?'open':''}><summary>${htmlEscape(q[0])}<i data-lucide="chevron-down"></i></summary><p>${htmlEscape(q[1])}</p></details>`).join('')}</div>`;
      const article=$('.page-main .card.article')||$('.page-main .article'); if(article) article.insertAdjacentElement('afterend',faq); else main.appendChild(faq);
      const pregnancyPages=new Set(['kalkulator-masa-subur.html','kalkulator-kehamilan.html','kalkulator-kontraksi.html','kalkulator-tendangan.html','kalkulator-ukuran-janin.html']);
      let resources=(pregnancyPages.has(currentFile)?
        [['kalkulator-kehamilan.html','baby','Pregnancy Toolkit','Hitung HPL dan usia kehamilan.'],['kalkulator-ukuran-janin.html','cherry','Ukuran Janin','Lihat referensi perkembangan per minggu.'],['faq.html','circle-help','FAQ','Baca penjelasan umum penggunaan kalkulator.']]:
        calcByUrl(currentFile)?.c==='kesehatan'?
        [['cara-menghitung-bmi.html','book-open','Panduan BMI','Pahami rumus dan cara membaca hasil BMI.'],['bahaya-obesitas.html','heart-pulse','Artikel kesehatan','Pelajari faktor risiko terkait berat badan.'],['kalkulator-populer.html','sparkles','Kalkulator populer','Buka pilihan kalkulator praktis lainnya.']]:
        calcByUrl(currentFile)?.c==='keuangan'?
        [['kalkulator-persen.html','percent','Persentase','Hitung persen dan perubahan nilai.'],['faq.html','circle-help','FAQ','Jawaban pertanyaan umum tentang layanan.'],['kalkulator-populer.html','sparkles','Kalkulator populer','Temukan alat hitung lain dengan cepat.']]:
        [['faq.html','circle-help','FAQ','Jawaban pertanyaan umum tentang layanan.'],['kalkulator-populer.html','sparkles','Kalkulator populer','Temukan alat hitung lain dengan cepat.'],['statistik.html','chart-no-axes-column-increasing','Statistik Saya','Lihat penggunaan lokal di perangkat ini.']]);
      const cmsLinks=window.KOCMS?.get?.(`contextLinks.${currentFile}`,null);
      if(Array.isArray(cmsLinks)&&cmsLinks.length){resources=cmsLinks.map(u=>{const c=calcByUrl(u);return c?[c.u,CALC_ICONS[c.u]||'calculator',c.t,c.d]:null;}).filter(Boolean);}
      const links=document.createElement('section');links.className='wrap stage7-context-links reveal in';links.innerHTML=`<div class="stage7-section-head"><div><span>LANJUTKAN</span><h2>Pelajari & hitung berikutnya</h2></div></div><div class="stage7-context-grid">${resources.filter(x=>x[0]!==currentFile).map(x=>`<a href="${x[0]}"><i data-lucide="${x[1]}"></i><span><strong>${x[2]}</strong><small>${x[3]}</small></span><i data-lucide="arrow-up-right"></i></a>`).join('')}</div>`;
      faq.insertAdjacentElement('afterend',links);
      const schema=document.createElement('script');schema.type='application/ld+json';schema.dataset.stage7='faq';schema.textContent=JSON.stringify({'@context':'https://schema.org','@type':'FAQPage','mainEntity':activeFaq.map(x=>({'@type':'Question','name':x[0],'acceptedAnswer':{'@type':'Answer','text':x[1]}}))});document.head.appendChild(schema);
      window.lucide?.createIcons();
    }
    injectFaqAndLinks();document.addEventListener('ko:cms-updated',injectFaqAndLinks);

    // Customizable result card studio. Capture prevents the Stage 6 default card action from firing.
    function stage7Summary(result){
      const clone=result.cloneNode(true);clone.querySelector('.ko-result-actions')?.remove();return clone.innerText.replace(/\s+/g,' ').trim().slice(0,520);
    }
    function rounded(ctx,x,y,w,h,r){ctx.beginPath();if(ctx.roundRect)ctx.roundRect(x,y,w,h,r);else ctx.rect(x,y,w,h);ctx.fill();}
    function wrap(ctx,text,x,y,w,lh,max=8){const words=String(text||'').trim().split(/\s+/);let line='',lines=[];for(const word of words){const t=line?line+' '+word:word;if(ctx.measureText(t).width>w&&line){lines.push(line);line=word;if(lines.length>=max-1)break}else line=t}if(line&&lines.length<max)lines.push(line);lines.forEach((v,i)=>ctx.fillText(v,x,y+i*lh));return y+Math.max(1,lines.length)*lh;}
    async function renderStudioCanvas(canvas,opt){
      const result=$('.page-main .result')||$('#result');if(!result)throw new Error('no_result');const ctx=canvas.getContext('2d');canvas.width=1080;canvas.height=1080;
      const theme=opt.theme||'brand';
      if(theme==='brand'){const g=ctx.createLinearGradient(0,0,1080,1080);g.addColorStop(0,'#4f46e5');g.addColorStop(.55,'#7c3aed');g.addColorStop(1,'#0891b2');ctx.fillStyle=g;ctx.fillRect(0,0,1080,1080);ctx.fillStyle='rgba(255,255,255,.96)';rounded(ctx,70,86,940,830,44);}
      if(theme==='clean'){ctx.fillStyle='#f7f8fc';ctx.fillRect(0,0,1080,1080);ctx.fillStyle='#ffffff';rounded(ctx,70,86,940,830,44);ctx.strokeStyle='#e5e7eb';ctx.lineWidth=3;ctx.strokeRect(70,86,940,830);}
      if(theme==='dark'){const g=ctx.createLinearGradient(0,0,1080,1080);g.addColorStop(0,'#090d18');g.addColorStop(1,'#15172c');ctx.fillStyle=g;ctx.fillRect(0,0,1080,1080);ctx.fillStyle='#181b31';rounded(ctx,70,86,940,830,44);}
      const dark=theme==='dark';ctx.fillStyle=dark?'#a78bfa':'#6d5dfc';ctx.font='800 38px Poppins, Arial, sans-serif';ctx.fillText('KalkulatorOnline.my.id',124,164);
      ctx.fillStyle=dark?'#f8fafc':'#1f2333';ctx.font='800 56px Poppins, Arial, sans-serif';let y=wrap(ctx,calcByUrl(currentFile)?.t||'Hasil Kalkulator',124,260,820,68,3);
      ctx.fillStyle=dark?'#aab2c5':'#6b7280';ctx.font='600 26px Poppins, Arial, sans-serif';ctx.fillText('Ringkasan hasil',124,y+20);
      ctx.fillStyle=dark?'#eef2ff':'#27283a';ctx.font='700 37px Poppins, Arial, sans-serif';y=wrap(ctx,stage7Summary(result),124,y+76,820,52,7);
      if(opt.note){ctx.fillStyle=dark?'#c4b5fd':'#5b4ee7';ctx.font='650 25px Poppins, Arial, sans-serif';y=wrap(ctx,opt.note,124,Math.min(y+30,735),820,36,2);}
      ctx.fillStyle=dark?'#aab2c5':'#6b7280';ctx.font='500 23px Poppins, Arial, sans-serif';wrap(ctx,'Hasil kalkulator adalah estimasi. Gunakan konteks atau penilaian profesional bila diperlukan.',124,790,820,34,3);
      if(opt.date){ctx.fillStyle=dark?'#94a3b8':'#7b8190';ctx.font='600 22px Poppins, Arial, sans-serif';ctx.fillText(new Date().toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'}),124,875);}
      ctx.fillStyle=theme==='brand'?'rgba(255,255,255,.95)':dark?'#cbd5e1':'#586071';ctx.font='700 24px Poppins, Arial, sans-serif';ctx.fillText('Dibuat lokal â€¢ Data hasil tidak diunggah',78,990);
      return canvas;
    }
    function canvasBlob(canvas){return new Promise((res,rej)=>canvas.toBlob(b=>b?res(b):rej(new Error('blob_failed')),'image/png',.95));}
    function closeStudio(){document.querySelector('.stage7-card-modal')?.remove();}
    function openStudio(){
      const result=$('.page-main .result')||$('#result');if(!result||getComputedStyle(result).display==='none'){toast('Hitung dulu untuk membuat kartu hasil.');return;}
      closeStudio();const modal=document.createElement('div');modal.className='stage7-card-modal';modal.innerHTML=`<div class="stage7-card-dialog" role="dialog" aria-modal="true" aria-labelledby="cardStudioTitle"><div class="stage7-card-head"><div><span>KARTU HASIL</span><h3 id="cardStudioTitle">Atur desain sebelum dibagikan</h3></div><button type="button" data-card-close aria-label="Tutup"><i data-lucide="x"></i></button></div><div class="stage7-card-layout"><div class="stage7-card-preview"><canvas></canvas></div><div class="stage7-card-controls"><label>Tema<div class="stage7-theme-options"><button type="button" class="active" data-theme="brand">Gradient</button><button type="button" data-theme="clean">Clean</button><button type="button" data-theme="dark">Dark</button></div></label><label>Catatan opsional<input id="stage7CardNote" type="text" maxlength="90" placeholder="Contoh: Target bulan ini"></label><label class="stage7-check"><input id="stage7CardDate" type="checkbox" checked><span>Tampilkan tanggal</span></label><p>Semua proses pembuatan gambar dilakukan di browser perangkat ini.</p><div class="stage7-card-buttons"><button type="button" data-card-download><i data-lucide="download"></i> Unduh PNG</button><button type="button" class="primary" data-card-share><i data-lucide="share-2"></i> Bagikan</button></div></div></div></div>`;document.body.appendChild(modal);window.lucide?.createIcons();
      const canvas=$('canvas',modal),note=$('#stage7CardNote',modal),date=$('#stage7CardDate',modal);let theme='brand';
      const draw=()=>renderStudioCanvas(canvas,{theme,note:note.value.trim(),date:date.checked}).catch(()=>{});draw();note.addEventListener('input',draw);date.addEventListener('change',draw);$$('[data-theme]',modal).forEach(b=>b.addEventListener('click',()=>{$$('[data-theme]',modal).forEach(x=>x.classList.remove('active'));b.classList.add('active');theme=b.dataset.theme;draw();}));
      async function file(){await draw();const blob=await canvasBlob(canvas);return new File([blob],`hasil-${currentFile.replace(/\.html$/,'')||'bmi'}.png`,{type:'image/png'});}
      $('[data-card-download]',modal).addEventListener('click',async()=>{const f=await file(),url=URL.createObjectURL(f),a=document.createElement('a');a.href=url;a.download=f.name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1200);toast('Kartu hasil PNG dibuat');track('result_action',{calculator:currentFile,action:'card_custom_download'});});
      $('[data-card-share]',modal).addEventListener('click',async()=>{const f=await file();if(navigator.share&&navigator.canShare?.({files:[f]})){try{await navigator.share({title:calcByUrl(currentFile)?.t||document.title,text:'Kartu hasil dari KalkulatorOnline.my.id',files:[f]});track('result_action',{calculator:currentFile,action:'card_custom_share'});}catch(e){}}else{toast('File sharing tidak didukung â€” gunakan Unduh PNG.');}});
      modal.addEventListener('click',e=>{if(e.target===modal||e.target.closest('[data-card-close]'))closeStudio();});
      document.addEventListener('keydown',function esc(e){if(e.key==='Escape'){closeStudio();document.removeEventListener('keydown',esc);}});
    }
    document.addEventListener('click',e=>{const b=e.target.closest('.ko-result-actions [data-action="card"]');if(!b)return;e.preventDefault();e.stopImmediatePropagation();openStudio();},true);

    // Third-party advertising foundation. It stays dormant unless explicitly enabled AND consented.
    function advertisingReady(){try{return !!window.KOConsent?.status?.()?.advertising;}catch(e){return false;}}
    let adsInit=false;
    function initAds(){
      const cfg=window.KO_MONETIZATION;if(adsInit||!cfg?.enabled||cfg?.mode!=='adsense'||!advertisingReady())return;
      const client=String(cfg.adsense?.client||'').trim();if(!/^ca-pub-\d+$/.test(client))return;adsInit=true;
      const sc=document.createElement('script');sc.async=true;sc.crossOrigin='anonymous';sc.src=`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(client)}`;document.head.appendChild(sc);
      const slotKey=currentFile==='index.html'?'home':isCalculator?'calculator':'';const slot=cfg.adsense?.slots?.[slotKey];if(!slot)return;
      const box=document.createElement('div');box.className='ko-ad-slot';box.innerHTML=`<span class="ko-ad-label">Iklan</span><ins class="adsbygoogle" style="display:block" data-ad-client="${client}" data-ad-slot="${String(slot).replace(/[^0-9]/g,'')}" data-ad-format="auto" data-full-width-responsive="true"></ins>`;
      const anchor=currentFile==='index.html'?$('#calcGrid')?.closest('.section'):$('.page-main .card');anchor?.insertAdjacentElement('afterend',box);try{(window.adsbygoogle=window.adsbygoogle||[]).push({});}catch(e){}
    }
    initAds();document.addEventListener('ko:advertising-ready',initAds);
  })();

  /* ---------- hide skeleton saat siap ---------- */
  addEventListener('load',()=>$$('.skeleton').forEach(s=>s.remove()));

  /* ---------- Lucide icons ---------- */
  function initIcons(){ if(window.lucide?.createIcons) window.lucide.createIcons(); }
  if(document.readyState!=='loading') initIcons();
  else document.addEventListener('DOMContentLoaded',initIcons);

  /* ---------- SERVICE WORKER (PWA full offline + update notification) ---------- */
  if('serviceWorker' in navigator){
    let refreshing=false;
    function showUpdate(reg){
      if(document.querySelector('.ko-update-bar')) return;
      const bar=document.createElement('div');
      bar.className='ko-update-bar';
      bar.innerHTML=`<span class="ko-update-icon"><i data-lucide="refresh-cw"></i></span><span class="ko-update-copy"><strong>Versi baru tersedia</strong><small>Perbarui aplikasi untuk memakai perbaikan terbaru.</small></span><span class="ko-update-actions"><button type="button" data-update="later">Nanti</button><button type="button" class="primary" data-update="now">Perbarui</button></span>`;
      document.body.appendChild(bar); window.lucide?.createIcons(); requestAnimationFrame(()=>bar.classList.add('show'));
      bar.addEventListener('click',e=>{
        const b=e.target.closest('[data-update]'); if(!b) return;
        if(b.dataset.update==='later'){ track('pwa_update',{action:'later'});bar.classList.remove('show'); setTimeout(()=>bar.remove(),220); return; }
        track('pwa_update',{action:'update_now'});
        if(reg.waiting){ b.disabled=true; b.textContent='Memperbaruiâ€¦'; reg.waiting.postMessage('SKIP_WAITING'); }
        else location.reload();
      });
    }
    navigator.serviceWorker.addEventListener('controllerchange',()=>{
      if(refreshing) return; refreshing=true; location.reload();
    });
    addEventListener('load',async()=>{
      try{
        const reg=await navigator.serviceWorker.register('/sw.js',{scope:'/'});
        if(reg.waiting && navigator.serviceWorker.controller) showUpdate(reg);
        reg.addEventListener('updatefound',()=>{
          const worker=reg.installing; if(!worker) return;
          worker.addEventListener('statechange',()=>{
            if(worker.state==='installed' && navigator.serviceWorker.controller) showUpdate(reg);
          });
        });
        // Periksa pembaruan berkala selama tab aktif, tanpa polling agresif.
        setInterval(()=>reg.update().catch(()=>{}),60*60*1000);
      }catch(e){}
    });
    addEventListener('offline',()=>toast('ðŸ“´ Offline â€” semua kalkulator inti tetap tersedia.'));
    addEventListener('online',()=>toast('Koneksi kembali online.'));
  }

  // expose sedikit util (tidak mengganggu rumus)
  window.KO = { version:'8.0.0', toast, track, calculators:CALCS, resources:RESOURCES, toggleFavorite, markRecent, clearHistory, usage:usageItems };
})();
