/* KalkulatorOnline Stage 8 — Admin CMS */
(function(){
  'use strict';
  const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const DRAFT_KEY='ko-cms-draft-v1', AUTH_KEY='ko-cms-auth-v1';
  const CALCS=[
    ['index.html','Kalkulator BMI','Kesehatan'],['kalkulator-kalori.html','Kalkulator Kalori','Kesehatan'],['kalkulator-bmr.html','Kalkulator BMR','Kesehatan'],['kalkulator-air.html','Kalkulator Air Minum','Kesehatan'],['kalkulator-whtr.html','Kalkulator WHtR','Kesehatan'],['kalkulator-body-fat.html','Body Fat %','Kesehatan'],['kalkulator-masa-subur.html','Masa Subur','Kesehatan'],['kalkulator-kehamilan.html','Kalkulator Kehamilan','Kesehatan'],['kalkulator-kontraksi.html','Timer Kontraksi','Kesehatan'],['kalkulator-tendangan.html','Penghitung Tendangan','Kesehatan'],['kalkulator-ukuran-janin.html','Ukuran Janin','Kesehatan'],['kalkulator-cicilan.html','Kalkulator Cicilan','Keuangan'],['kalkulator-diskon.html','Kalkulator Diskon','Keuangan'],['kalkulator-ppn.html','Kalkulator PPN','Keuangan'],['kalkulator-persen.html','Kalkulator Persentase','Keuangan'],['kalkulator-umur.html','Kalkulator Umur','Umum'],['konversi-satuan.html','Konversi Satuan','Umum']
  ].map(x=>({u:x[0],t:x[1],c:x[2]}));
  const clone=v=>JSON.parse(JSON.stringify(v||{}));
  let state=clone(window.KO_CMS_DEFAULTS||{}), faqPage='index.html', dirty=false, toastTimer;

  function toast(msg){const el=$('#cmsToast');el.textContent=msg;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),2600)}
  function markDirty(on=true){dirty=on;$('#unsaved').hidden=!on;}
  function safe(){return window.KOCMS?.sanitize?window.KOCMS.sanitize(state):clone(state)}
  function storeDraft(content){try{localStorage.setItem(DRAFT_KEY,JSON.stringify(content));return true}catch(e){toast('Browser tidak dapat menyimpan draft.');return false}}
  function readDraft(){try{return JSON.parse(localStorage.getItem(DRAFT_KEY)||'null')}catch(e){return null}}
  function currentPane(name){$$('[data-pane-content]').forEach(x=>x.classList.toggle('active',x.dataset.paneContent===name));$$('[data-pane]').forEach(x=>x.classList.toggle('active',x.dataset.pane===name));const b=$(`[data-pane="${name}"]`);$('#cmsTitle').textContent=(b?.textContent||'CMS').trim();$('#cmsSide').classList.remove('open');if(name==='backup')updateJsonPreview();}

  function setText(id,val){const el=$('#'+id);if(el)el.value=val??''}
  function setCheck(id,val){const el=$('#'+id);if(el)el.checked=!!val}
  function populateStatic(){
    const s=state.site||{}, h=state.home||{}, p=state.ppn||{}, sp=state.sponsor||{};
    setCheck('annEnabled',s.announcement?.enabled);setText('annText',s.announcement?.text);setText('annUrl',s.announcement?.url);setText('annCta',s.announcement?.cta);
    setText('homeEyebrow',h.eyebrow);setText('homeTitle',h.title);setText('homeAccent',h.titleAccent);setText('homeDescription',h.description);setText('homeSearch',h.searchPlaceholder);setText('homeDiscovery',h.discoveryTitle);setText('homeFeatured',h.featuredLabel);
    setText('ppnSubtitle',p.subtitle);setText('ppnIntro',p.intro);setText('ppnDefault',p.defaultRate);
    setCheck('sponsorEnabled',sp.enabled);setText('sponsorLabel',sp.label);setText('sponsorCta',sp.cta);setText('sponsorTitle',sp.title);setText('sponsorDescription',sp.description);setText('sponsorUrl',sp.url);
    setText('footerTagline',s.footerTagline);setText('footerStage',s.footerStage);
  }
  function collectStatic(){
    state.site=state.site||{};state.site.announcement={enabled:$('#annEnabled').checked,text:$('#annText').value,url:$('#annUrl').value,cta:$('#annCta').value};state.site.footerTagline=$('#footerTagline').value;state.site.footerStage=$('#footerStage').value;
    state.home=state.home||{};Object.assign(state.home,{eyebrow:$('#homeEyebrow').value,title:$('#homeTitle').value,titleAccent:$('#homeAccent').value,description:$('#homeDescription').value,searchPlaceholder:$('#homeSearch').value,discoveryTitle:$('#homeDiscovery').value,featuredLabel:$('#homeFeatured').value});
    state.ppn=state.ppn||{};Object.assign(state.ppn,{subtitle:$('#ppnSubtitle').value,intro:$('#ppnIntro').value,defaultRate:Number($('#ppnDefault').value)});
    state.sponsor={enabled:$('#sponsorEnabled').checked,label:$('#sponsorLabel').value,title:$('#sponsorTitle').value,description:$('#sponsorDescription').value,url:$('#sponsorUrl').value,cta:$('#sponsorCta').value};
  }
  function renderHighlights(){const box=$('#highlightList'), list=state.home?.highlights||[];box.innerHTML=list.map((x,i)=>`<div class="cms-repeat-item" data-highlight-row="${i}"><div class="cms-repeat-head"><strong>Kartu ${i+1}</strong><button type="button" class="cms-icon-btn danger" data-remove-highlight="${i}" aria-label="Hapus"><i data-lucide="trash-2"></i></button></div><label class="cms-check"><input data-h="enabled" type="checkbox" ${x.enabled?'checked':''}> Aktif</label><div class="cms-row"><div class="cms-field"><span>Label</span><input data-h="label" value="${escAttr(x.label)}"></div><div class="cms-field"><span>Icon Lucide</span><input data-h="icon" value="${escAttr(x.icon||'sparkles')}"></div></div><div class="cms-field"><span>Judul</span><input data-h="title" value="${escAttr(x.title)}"></div><div class="cms-field"><span>Deskripsi</span><textarea data-h="description">${escHtml(x.description)}</textarea></div><div class="cms-field"><span>URL</span><input data-h="url" value="${escAttr(x.url)}"></div></div>`).join('');window.lucide?.createIcons();}
  function syncHighlights(){state.home=state.home||{};state.home.highlights=$$('[data-highlight-row]').map(row=>({enabled:$('[data-h="enabled"]',row).checked,label:$('[data-h="label"]',row).value,icon:$('[data-h="icon"]',row).value,title:$('[data-h="title"]',row).value,description:$('[data-h="description"]',row).value,url:$('[data-h="url"]',row).value}));}
  function renderPopular(){const selected=new Set(state.popular?.curated||[]);$('#popularChecks').innerHTML=CALCS.map(c=>`<label class="cms-check-card"><input type="checkbox" data-popular="${c.u}" ${selected.has(c.u)?'checked':''}><span><b>${escHtml(c.t)}</b><br><small>${c.c}</small></span></label>`).join('');}
  function syncPopular(){const vals=$$('[data-popular]:checked').map(x=>x.dataset.popular).slice(0,12);state.popular={curated:vals};}
  function renderFaqSelect(){const sel=$('#faqPage');sel.innerHTML=CALCS.map(c=>`<option value="${c.u}">${escHtml(c.t)}</option>`).join('');sel.value=faqPage;}
  function renderFaq(){const list=state.faqOverrides?.[faqPage]||[];$('#faqList').innerHTML=list.length?list.map((x,i)=>`<div class="cms-repeat-item" data-faq-row="${i}"><div class="cms-repeat-head"><strong>Pertanyaan ${i+1}</strong><button type="button" class="cms-icon-btn danger" data-remove-faq="${i}"><i data-lucide="trash-2"></i></button></div><div class="cms-field"><span>Pertanyaan</span><input data-faq="q" maxlength="180" value="${escAttr(x.q||x.question||'')}"></div><div class="cms-field"><span>Jawaban</span><textarea data-faq="a" maxlength="700">${escHtml(x.a||x.answer||'')}</textarea></div></div>`).join(''):`<div class="cms-status warn"><i></i><span>Belum ada override. Halaman memakai FAQ bawaan Stage 7.</span></div>`;window.lucide?.createIcons();renderContext();}
  function syncFaq(){state.faqOverrides=state.faqOverrides||{};const rows=$$('[data-faq-row]');if(!rows.length){if(state.faqOverrides[faqPage]?.length===0)delete state.faqOverrides[faqPage];return;}const arr=rows.map(r=>({q:$('[data-faq="q"]',r).value,a:$('[data-faq="a"]',r).value})).filter(x=>x.q.trim()&&x.a.trim());if(arr.length)state.faqOverrides[faqPage]=arr;else delete state.faqOverrides[faqPage];}
  function renderContext(){const selected=new Set(state.contextLinks?.[faqPage]||[]);$('#contextChecks').innerHTML=CALCS.filter(c=>c.u!==faqPage).map(c=>`<label class="cms-check-card"><input type="checkbox" data-context="${c.u}" ${selected.has(c.u)?'checked':''}><span>${escHtml(c.t)}</span></label>`).join('');}
  function syncContext(){state.contextLinks=state.contextLinks||{};const vals=$$('[data-context]:checked').map(x=>x.dataset.context).slice(0,6);if(vals.length)state.contextLinks[faqPage]=vals;else delete state.contextLinks[faqPage];}
  function renderRates(){const list=state.ppn?.rates||[];$('#ppnRates').innerHTML=list.map((x,i)=>`<div class="cms-repeat-item" data-rate-row="${i}"><div class="cms-repeat-head"><strong>Tarif ${i+1}</strong><button type="button" class="cms-icon-btn danger" data-remove-rate="${i}"><i data-lucide="trash-2"></i></button></div><div class="cms-row"><div class="cms-field"><span>Nilai (%)</span><input data-rate="value" type="number" min="0" max="100" step="0.01" value="${Number(x.value)||0}"></div><div class="cms-field"><span>Label</span><input data-rate="label" value="${escAttr(x.label||'')}"></div></div></div>`).join('');window.lucide?.createIcons();}
  function syncRates(){state.ppn=state.ppn||{};state.ppn.rates=$$('[data-rate-row]').map(r=>({value:Number($('[data-rate="value"]',r).value),label:$('[data-rate="label"]',r).value})).filter(x=>Number.isFinite(x.value));}
  function collect(){collectStatic();syncHighlights();syncPopular();syncFaq();syncContext();syncRates();state=window.KOCMS?.sanitize?window.KOCMS.sanitize(state):state;return state;}
  function populate(all){state=window.KOCMS?.sanitize?window.KOCMS.sanitize(all):clone(all);populateStatic();renderHighlights();renderPopular();renderFaqSelect();renderFaq();renderRates();updateJsonPreview();markDirty(false);}
  function escHtml(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
  function escAttr(v){return escHtml(v).replace(/`/g,'&#96;')}
  function updateJsonPreview(){try{$('#jsonPreview').textContent=JSON.stringify(collect(),null,2)}catch(e){}}

  function configReady(){const g=window.KO_CMS_CONFIG?.gas||{};return !!(window.KO_CMS_CONFIG?.enabled&&/^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec(?:\?.*)?$/i.test(String(g.webAppUrl||'').trim()))}
  function endpoint(){return String(window.KO_CMS_CONFIG?.gas?.webAppUrl||'').trim()}
  function authRead(){try{return JSON.parse(sessionStorage.getItem(AUTH_KEY)||'null')}catch(e){return null}}
  function authWrite(v){try{v?sessionStorage.setItem(AUTH_KEY,JSON.stringify(v)):sessionStorage.removeItem(AUTH_KEY)}catch(e){}}
  function validAuth(){const a=authRead();return a?.token&&Number(a.expiresAt)>Date.now();}
  async function gasPost(data){
    const body=new URLSearchParams();Object.entries(data||{}).forEach(([k,v])=>body.set(k,String(v??'')));
    const res=await fetch(endpoint(),{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8'},body,cache:'no-store',redirect:'follow'});
    if(!res.ok)throw new Error(`HTTP_${res.status}`);const out=await res.json();if(!out?.ok)throw new Error(out?.error||'GAS_REQUEST_FAILED');return out;
  }
  function renderCloud(){
    const cfg=window.KO_CMS_CONFIG||{}, g=cfg.gas||{}, ready=configReady();
    const c=$('#cloudStatus'),d=$('#cloudConfigDetail');[c,d].forEach(el=>{el.className='cms-status '+(ready?'good':'warn');el.innerHTML=`<i></i><span>${ready?'GAS CMS siap digunakan':'GAS CMS belum dikonfigurasi'}</span>`});
    const masked=g.webAppUrl?g.webAppUrl.replace(/\/s\/([^/]{6})[^/]+\/exec/i,'/s/$1••••••/exec'):'(kosong)';
    $('#cloudConfigCode').textContent=`enabled: ${!!cfg.enabled}\nwebAppUrl: ${masked}`;
    const a=authRead(), logged=validAuth();$('#authLoggedOut').hidden=logged;$('#authLoggedIn').hidden=!logged;if(logged)$('#authEmail').textContent=a.email||'Admin';
    $('#publishTop').disabled=!ready||!logged;$('#publishBtn').disabled=!ready||!logged;$('#loadPublished').disabled=!ready||!logged;
    $('#publishHint').textContent=!ready?'Deploy GAS sebagai Web App lalu isi URL /exec di cms-config.js.':!logged?'Login admin untuk mengaktifkan Publish.':'Siap publish ke Google Spreadsheet melalui GAS.';
  }
  async function signIn(){
    if(!configReady()){toast('Konfigurasi GAS belum lengkap.');return}const email=$('#adminEmail').value.trim(),password=$('#adminPassword').value;if(!email||!password){toast('Isi email dan password admin.');return}
    const b=$('#loginBtn');b.disabled=true;b.textContent='Login…';try{const data=await gasPost({action:'login',email,password});authWrite({token:data.token,email:data.email||email,expiresAt:Number(data.expiresAt)||Date.now()+4*60*60*1000});$('#adminPassword').value='';renderCloud();toast('Login admin berhasil.')}catch(e){const msg=String(e.message||e).replace(/_/g,' ');toast('Login gagal: '+msg.slice(0,90))}finally{b.disabled=false;b.innerHTML='<i data-lucide="log-in"></i> Login';window.lucide?.createIcons();}}
  async function loadPublished(){
    if(!configReady())return;const b=$('#loadPublished');b.disabled=true;try{const a=authRead();const data=await gasPost({action:'load',token:validAuth()?a.token:''});if(!data.found||!data.payload){toast('Konten CMS belum pernah dipublish.');return}const raw=typeof data.payload==='string'?JSON.parse(data.payload):data.payload;populate(raw);storeDraft(state);$('#sourceStatus').className='cms-status good';$('#sourceStatus').innerHTML='<i></i><span>Published GAS dimuat</span>';$('#sourceHint').textContent=data.updatedAt?`Terakhir update: ${new Date(data.updatedAt).toLocaleString('id-ID')}`:'Konten server berhasil dimuat.';toast('Konten published berhasil dimuat.')}catch(e){if(String(e.message)==='UNAUTHORIZED'){authWrite(null);renderCloud()}toast('Gagal memuat: '+String(e.message||e).replace(/_/g,' ').slice(0,100))}finally{b.disabled=false}}
  async function publish(){
    if(!configReady()){toast('GAS CMS belum dikonfigurasi.');return}const auth=authRead();if(!validAuth()){authWrite(null);renderCloud();toast('Session login habis. Login kembali.');return}const content=collect();
    const buttons=[$('#publishTop'),$('#publishBtn')];buttons.forEach(b=>b.disabled=true);try{const data=await gasPost({action:'publish',token:auth.token,payload:JSON.stringify(content)});storeDraft(content);try{localStorage.setItem('ko-cms-public-cache-v1',JSON.stringify({scope:endpoint(),at:Date.now(),content}))}catch(e){}markDirty(false);$('#sourceStatus').className='cms-status good';$('#sourceStatus').innerHTML='<i></i><span>Published ke GAS / Spreadsheet</span>';$('#sourceHint').textContent=`Terakhir publish: ${data.updatedAt?new Date(data.updatedAt).toLocaleString('id-ID'):new Date().toLocaleString('id-ID')}`;toast('Publish berhasil. Konten publik akan memakai versi baru.')}catch(e){if(String(e.message)==='UNAUTHORIZED'){authWrite(null);renderCloud()}toast('Publish gagal: '+String(e.message||e).replace(/_/g,' ').slice(0,120))}finally{renderCloud();buttons.forEach(b=>b.disabled=!validAuth()||!configReady())}}
  async function signOut(){const a=authRead();authWrite(null);renderCloud();if(a?.token&&configReady()){try{await gasPost({action:'logout',token:a.token})}catch(e){}}toast('Logout berhasil.');}
  function saveDraft(){const content=collect();if(storeDraft(content)){markDirty(false);$('#sourceStatus').className='cms-status good';$('#sourceStatus').innerHTML='<i></i><span>Draft lokal tersimpan</span>';$('#sourceHint').textContent='Draft hanya tersimpan pada browser ini sampai dipublish.';toast('Draft tersimpan.')}}
  function preview(){saveDraft();try{sessionStorage.setItem('ko-cms-preview-active','1')}catch(e){}window.open('index.html?cmsPreview=1','_blank','noopener');}
  function exportJson(){const content=collect(),blob=new Blob([JSON.stringify(content,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`kalkulatoronline-cms-${new Date().toISOString().slice(0,10)}.json`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('Backup JSON dibuat.');}
  async function importJson(file){try{const raw=await file.text(),data=JSON.parse(raw);populate(data);markDirty(true);toast('JSON berhasil diimport. Periksa lalu simpan/publish.')}catch(e){toast('File JSON tidak valid.')}}

  document.addEventListener('click',e=>{
    const nav=e.target.closest('[data-pane]');if(nav){currentPane(nav.dataset.pane);return}
    const rh=e.target.closest('[data-remove-highlight]');if(rh){syncHighlights();state.home.highlights.splice(Number(rh.dataset.removeHighlight),1);renderHighlights();markDirty();return}
    const rf=e.target.closest('[data-remove-faq]');if(rf){syncFaq();state.faqOverrides[faqPage]?.splice(Number(rf.dataset.removeFaq),1);if(!state.faqOverrides[faqPage]?.length)delete state.faqOverrides[faqPage];renderFaq();markDirty();return}
    const rr=e.target.closest('[data-remove-rate]');if(rr){syncRates();state.ppn.rates.splice(Number(rr.dataset.removeRate),1);renderRates();markDirty();return}
  });
  $('#addHighlight').addEventListener('click',()=>{syncHighlights();state.home.highlights=state.home.highlights||[];if(state.home.highlights.length>=6){toast('Maksimal 6 kartu.');return}state.home.highlights.push({enabled:true,label:'INFO',title:'Judul baru',description:'Deskripsi singkat',url:'index.html',icon:'sparkles'});renderHighlights();markDirty()});
  $('#addFaq').addEventListener('click',()=>{syncFaq();state.faqOverrides=state.faqOverrides||{};state.faqOverrides[faqPage]=state.faqOverrides[faqPage]||[];if(state.faqOverrides[faqPage].length>=10){toast('Maksimal 10 FAQ per halaman.');return}state.faqOverrides[faqPage].push({q:'Pertanyaan baru?',a:'Tulis jawaban di sini.'});renderFaq();markDirty()});
  $('#clearFaq').addEventListener('click',()=>{state.faqOverrides=state.faqOverrides||{};delete state.faqOverrides[faqPage];renderFaq();markDirty();toast('FAQ halaman kembali memakai bawaan.')});
  $('#addRate').addEventListener('click',()=>{syncRates();state.ppn.rates=state.ppn.rates||[];if(state.ppn.rates.length>=12){toast('Maksimal 12 tarif.');return}state.ppn.rates.push({value:0,label:'Tarif baru'});renderRates();markDirty()});
  $('#faqPage').addEventListener('change',e=>{syncFaq();syncContext();faqPage=e.target.value;renderFaq();markDirty()});
  $('#popularChecks').addEventListener('change',e=>{if(e.target.matches('[data-popular]')&&$$('[data-popular]:checked').length>12){e.target.checked=false;toast('Maksimal 12 kalkulator.')}markDirty()});
  $('#contextChecks').addEventListener('change',e=>{if(e.target.matches('[data-context]')&&$$('[data-context]:checked').length>6){e.target.checked=false;toast('Maksimal 6 rekomendasi.')}markDirty()});
  $('.cms-content').addEventListener('input',e=>{if(e.target.matches('input,textarea,select'))markDirty()});$('.cms-content').addEventListener('change',e=>{if(e.target.matches('input,textarea,select'))markDirty()});
  $('#saveDraft').addEventListener('click',saveDraft);$('#previewBtn').addEventListener('click',preview);$('#publishTop').addEventListener('click',publish);$('#publishBtn').addEventListener('click',publish);$('#loadPublished').addEventListener('click',loadPublished);$('#loginBtn').addEventListener('click',signIn);$('#logoutBtn').addEventListener('click',signOut);
  $('#exportJson').addEventListener('click',exportJson);$('#importJson').addEventListener('change',e=>{const f=e.target.files?.[0];if(f)importJson(f);e.target.value=''});$('#resetDefaults').addEventListener('click',()=>{if(confirm('Reset editor ke konten bawaan? Published GAS tidak berubah sampai Publish.')){populate(window.KO_CMS_DEFAULTS);markDirty(true);toast('Editor dikembalikan ke default.')}});$('#cmsMenu').addEventListener('click',()=>$('#cmsSide').classList.toggle('open'));
  document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='s'){e.preventDefault();saveDraft()}if(e.key==='Escape')$('#cmsSide').classList.remove('open')});

  async function init(){
    const mode=localStorage.getItem('ko-theme')||'auto';const dark=mode==='dark'||(mode==='auto'&&matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.setAttribute('data-theme',dark?'dark':'light');
    try{if(window.KOCMS?.ready)await window.KOCMS.ready}catch(e){}
    const draft=readDraft();populate(draft||window.KOCMS?.content||window.KO_CMS_DEFAULTS);
    $('#sourceStatus').className='cms-status '+(draft?'good':'warn');$('#sourceStatus').innerHTML=`<i></i><span>${draft?'Draft lokal tersedia':`Sumber saat ini: ${window.KOCMS?.source||'bundled'}`}</span>`;$('#sourceHint').textContent=draft?'Draft lokal diprioritaskan di editor. Gunakan Muat Published untuk mengambil cloud.':'Belum ada draft lokal.';
    renderCloud();window.lucide?.createIcons();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
