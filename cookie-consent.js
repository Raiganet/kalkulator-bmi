/* KalkulatorOnline — consent manager (analytics + advertising opt-in) */
(function(){
  'use strict';
  const KEY='ko-consent-v1';
  const GA_ID='G-24G7H4QNBD';
  const $=(s,r=document)=>r.querySelector(s);

  function read(){
    try{
      const raw=localStorage.getItem(KEY);
      if(raw) return JSON.parse(raw);
      const legacy=localStorage.getItem('cookieConsent');
      if(legacy==='accepted') return {analytics:true,advertising:false,updatedAt:Date.now()};
      if(legacy==='rejected') return {analytics:false,advertising:false,updatedAt:Date.now()};
    }catch(e){}
    return null;
  }
  function write(value){
    try{ localStorage.setItem(KEY,JSON.stringify({analytics:!!value.analytics,advertising:!!value.advertising,updatedAt:Date.now()})); }catch(e){}
  }
  function clearGACookies(){
    window['ga-disable-'+GA_ID]=true;
    const names=['_ga','_gid','_gat'];
    document.cookie.split(';').forEach(part=>{
      const name=part.split('=')[0].trim();
      if(names.includes(name)||name.startsWith('_ga_')){
        document.cookie=`${name}=; Max-Age=0; path=/; SameSite=Lax`;
        document.cookie=`${name}=; Max-Age=0; path=/; domain=.${location.hostname}; SameSite=Lax`;
      }
    });
  }
  function loadAnalytics(){
    if(window.__koAnalyticsLoaded) return;
    window.__koAnalyticsLoaded=true;
    window['ga-disable-'+GA_ID]=false;
    window.dataLayer=window.dataLayer||[];
    window.gtag=window.gtag||function(){window.dataLayer.push(arguments)};
    window.gtag('js',new Date());
    window.gtag('consent','default',{analytics_storage:'granted',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
    window.gtag('config',GA_ID,{anonymize_ip:true,allow_google_signals:false});
    const s=document.createElement('script');
    s.async=true;
    s.src=`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_ID)}`;
    document.head.appendChild(s);
    document.dispatchEvent(new CustomEvent('ko:analytics-ready'));
  }
  function apply(pref){
    if(pref?.analytics) loadAnalytics();
    else{ if(typeof window.gtag==='function') window.gtag('consent','update',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'}); clearGACookies(); }
    if(pref?.advertising) document.dispatchEvent(new CustomEvent('ko:advertising-ready'));
  }

  function injectStyles(){
    if($('#ko-consent-style')) return;
    const style=document.createElement('style');
    style.id='ko-consent-style';
    style.textContent=`
      .ko-consent{position:fixed;left:16px;right:16px;bottom:max(16px,env(safe-area-inset-bottom));z-index:10050;max-width:920px;margin:auto;padding:18px;border:1px solid var(--border,#e7e7ef);border-radius:20px;background:var(--surface-solid,#fff);color:var(--text,#1d1d2a);box-shadow:0 24px 70px rgba(24,18,70,.22)}
      .ko-consent h3{margin:0 0 6px;font-size:16px}.ko-consent p{margin:0;color:var(--text-3,#646477);font-size:12px;line-height:1.6}.ko-consent a{color:var(--c-primary,#6c63ff);font-weight:700}.ko-consent-row{display:flex;gap:16px;align-items:center}.ko-consent-copy{flex:1}.ko-consent-actions{display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end}.ko-consent button{border:1px solid var(--border,#e7e7ef);border-radius:11px;padding:10px 13px;background:var(--surface,#fff);color:inherit;font:inherit;font-size:11px;font-weight:750;cursor:pointer}.ko-consent .primary{border-color:transparent;background:linear-gradient(135deg,#6c63ff,#8b5cf6);color:#fff}.ko-consent .ghost{background:transparent}
      .ko-consent-modal{position:fixed;inset:0;z-index:10060;display:grid;place-items:center;padding:18px;background:rgba(10,10,24,.55);backdrop-filter:blur(8px)}.ko-consent-card{width:min(520px,100%);padding:22px;border-radius:22px;background:var(--surface-solid,#fff);color:var(--text,#1d1d2a);box-shadow:0 30px 90px rgba(0,0,0,.28)}.ko-consent-card h3{margin:0 0 6px}.ko-consent-card>p{margin:0 0 18px;color:var(--text-3,#646477);font-size:12px;line-height:1.6}.ko-consent-option{display:flex;justify-content:space-between;gap:18px;padding:14px 0;border-top:1px solid var(--border,#e7e7ef)}.ko-consent-option strong{display:block;font-size:12px}.ko-consent-option small{display:block;margin-top:4px;color:var(--text-3,#646477);line-height:1.5}.ko-consent-switch{width:42px;height:24px;accent-color:#6c63ff}.ko-consent-modal-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:18px}.ko-cookie-link{border:0;background:none;padding:0;color:inherit;font:inherit;cursor:pointer;text-align:left}
      @media(max-width:680px){.ko-consent{left:8px;right:8px;bottom:calc(76px + env(safe-area-inset-bottom));padding:15px}.ko-consent-row{align-items:flex-start;flex-direction:column}.ko-consent-actions{width:100%;display:grid;grid-template-columns:1fr 1fr}.ko-consent-actions .primary{grid-column:1/-1}.ko-consent button{width:100%}}
    `;
    document.head.appendChild(style);
  }
  function removeBanner(){ $('#ko-consent-banner')?.remove(); }
  function saveAndApply(analytics, advertising=false){
    const pref={analytics:!!analytics,advertising:!!advertising}; write(pref); apply(pref); removeBanner(); closeSettings();
  }
  function banner(){
    if($('#ko-consent-banner')) return;
    injectStyles();
    const el=document.createElement('section');
    el.id='ko-consent-banner'; el.className='ko-consent'; el.setAttribute('aria-label','Preferensi privasi');
    el.innerHTML=`<div class="ko-consent-row"><div class="ko-consent-copy"><h3>Privasi & analytics</h3><p>Kami memakai penyimpanan lokal untuk fitur aplikasi. Analytics bersifat opsional dan baru dimuat setelah kamu menyetujuinya. Iklan pihak ketiga juga memiliki izin terpisah di menu Atur. Baca <a href="privacy.html">Kebijakan Privasi</a>.</p></div><div class="ko-consent-actions"><button type="button" data-consent="reject">Hanya esensial</button><button type="button" class="ghost" data-consent="settings">Atur</button><button type="button" class="primary" data-consent="accept">Izinkan analytics</button></div></div>`;
    document.body.appendChild(el);
    el.addEventListener('click',e=>{
      const b=e.target.closest('[data-consent]'); if(!b) return;
      if(b.dataset.consent==='accept') saveAndApply(true,false);
      if(b.dataset.consent==='reject') saveAndApply(false,false);
      if(b.dataset.consent==='settings') openSettings();
    });
  }
  function closeSettings(){ $('#ko-consent-modal')?.remove(); }
  function openSettings(){
    injectStyles(); closeSettings();
    const pref=read();
    const modal=document.createElement('div'); modal.id='ko-consent-modal'; modal.className='ko-consent-modal';
    modal.innerHTML=`<div class="ko-consent-card" role="dialog" aria-modal="true" aria-labelledby="koConsentTitle"><h3 id="koConsentTitle">Pengaturan privasi</h3><p>Kamu dapat mengubah pilihan kapan saja. Fitur inti aplikasi tidak memerlukan analytics.</p><div class="ko-consent-option"><div><strong>Penyimpanan esensial</strong><small>Tema, favorit, riwayat lokal, dan preferensi unit. Selalu aktif karena dibutuhkan oleh fitur yang kamu gunakan.</small></div><input class="ko-consent-switch" type="checkbox" checked disabled aria-label="Penyimpanan esensial selalu aktif"></div><div class="ko-consent-option"><div><strong>Analytics</strong><small>Membantu memahami penggunaan situs secara agregat melalui Google Analytics.</small></div><input id="koAnalyticsConsent" class="ko-consent-switch" type="checkbox" ${pref?.analytics?'checked':''} aria-label="Izinkan analytics"></div><div class="ko-consent-option"><div><strong>Iklan pihak ketiga</strong><small>Hanya digunakan jika monetisasi pihak ketiga diaktifkan. Saat ini pilihan ini tidak diperlukan untuk fitur inti.</small></div><input id="koAdvertisingConsent" class="ko-consent-switch" type="checkbox" ${pref?.advertising?'checked':''} aria-label="Izinkan iklan pihak ketiga"></div><div class="ko-consent-modal-actions"><button type="button" data-close>Tutup</button><button type="button" class="primary" data-save>Simpan pilihan</button></div></div>`;
    document.body.appendChild(modal);
    modal.addEventListener('click',e=>{
      if(e.target===modal||e.target.closest('[data-close]')) closeSettings();
      if(e.target.closest('[data-save]')) saveAndApply(!!$('#koAnalyticsConsent')?.checked,!!$('#koAdvertisingConsent')?.checked);
    });
    document.addEventListener('keydown',function esc(e){ if(e.key==='Escape'){closeSettings();document.removeEventListener('keydown',esc);} });
  }
  function addFooterControl(){
    const info=[...document.querySelectorAll('.foot-grid>div')].find(d=>d.querySelector('h4')?.textContent.trim()==='Informasi');
    if(!info||info.querySelector('.ko-cookie-link')) return;
    const b=document.createElement('button'); b.type='button'; b.className='ko-cookie-link'; b.textContent='Pengaturan cookie'; b.addEventListener('click',openSettings); info.appendChild(b);
  }
  function init(){
    injectStyles(); addFooterControl();
    const pref=read();
    if(pref) apply(pref); else banner();
  }
  window.KOConsent={openSettings,status:read};
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
})();
