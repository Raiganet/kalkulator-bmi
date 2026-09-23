/* KalkulatorOnline Stage 8 — CMS runtime
   Public content flow: bundled defaults -> cached GAS content -> Google Apps Script content.
   Admin preview is explicit and stays local to the current browser session. */
(function(){
  'use strict';
  const DEFAULTS=window.KO_CMS_DEFAULTS||{};
  const CONFIG=window.KO_CMS_CONFIG||{};
  const CACHE_KEY='ko-cms-public-cache-v1';
  const DRAFT_KEY='ko-cms-draft-v1';
  const PREVIEW_KEY='ko-cms-preview-active';
  const $=(s,r=document)=>r.querySelector(s);

  const clone=v=>JSON.parse(JSON.stringify(v??{}));
  function merge(base,over){
    if(Array.isArray(over)) return clone(over);
    if(!over||typeof over!=='object') return over===undefined?clone(base):over;
    const out=(base&&typeof base==='object'&&!Array.isArray(base))?clone(base):{};
    Object.keys(over).forEach(k=>{out[k]=merge(out[k],over[k]);});
    return out;
  }
  function str(v,max=500){return String(v??'').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g,'').trim().slice(0,max);}
  function bool(v){return !!v;}
  function num(v,min,max,fallback){const n=Number(v);return Number.isFinite(n)&&n>=min&&n<=max?n:fallback;}
  function url(v){const s=str(v,500);if(!s)return'';if(/^(https?:\/\/)/i.test(s))return s;if(/^\/\//.test(s))return'';if(/^(?![a-z]+:)[\w./?=#%-]+$/i.test(s))return s;return'';}
  function sanitize(input){
    const d=merge(DEFAULTS,input||{});
    const out=clone(DEFAULTS);
    out.schemaVersion=1;
    out.site={
      announcement:{enabled:bool(d.site?.announcement?.enabled),text:str(d.site?.announcement?.text,140),url:url(d.site?.announcement?.url),cta:str(d.site?.announcement?.cta,32)||'Lihat info'},
      footerTagline:str(d.site?.footerTagline,260)||DEFAULTS.site?.footerTagline||'',
      footerStage:str(d.site?.footerStage,70)||'www.kastriva.web.id'
    };
    out.home={
      eyebrow:str(d.home?.eyebrow,80)||DEFAULTS.home?.eyebrow||'',
      title:str(d.home?.title,120)||DEFAULTS.home?.title||'',
      titleAccent:str(d.home?.titleAccent,90)||DEFAULTS.home?.titleAccent||'',
      description:str(d.home?.description,280)||DEFAULTS.home?.description||'',
      searchPlaceholder:str(d.home?.searchPlaceholder,110)||DEFAULTS.home?.searchPlaceholder||'',
      discoveryTitle:str(d.home?.discoveryTitle,70)||'Jelajahi Kalkulator',
      featuredLabel:str(d.home?.featuredLabel,70)||'Kalkulator unggulan',
      highlights:(Array.isArray(d.home?.highlights)?d.home.highlights:[]).slice(0,6).map(x=>({enabled:bool(x?.enabled),label:str(x?.label,30),title:str(x?.title,80),description:str(x?.description,180),url:url(x?.url),icon:str(x?.icon,40).replace(/[^a-z0-9-]/gi,'')||'sparkles'})).filter(x=>x.title&&x.url)
    };
    out.popular={curated:(Array.isArray(d.popular?.curated)?d.popular.curated:[]).slice(0,12).map(x=>url(x)).filter(Boolean)};
    const rates=(Array.isArray(d.ppn?.rates)?d.ppn.rates:[]).slice(0,12).map(x=>({value:num(x?.value,0,100,NaN),label:str(x?.label,70)})).filter(x=>Number.isFinite(x.value));
    out.ppn={defaultRate:num(d.ppn?.defaultRate,0,100,11),subtitle:str(d.ppn?.subtitle,160),intro:str(d.ppn?.intro,400),rates:rates.length?rates:clone(DEFAULTS.ppn?.rates||[])};
    out.sponsor={enabled:bool(d.sponsor?.enabled),label:str(d.sponsor?.label,30)||'Sponsor',title:str(d.sponsor?.title,90),description:str(d.sponsor?.description,180),url:url(d.sponsor?.url),cta:str(d.sponsor?.cta,32)||'Lihat'};
    out.faqOverrides={};
    if(d.faqOverrides&&typeof d.faqOverrides==='object') Object.entries(d.faqOverrides).slice(0,40).forEach(([page,list])=>{
      const p=url(page);if(!p||!Array.isArray(list))return;
      const clean=list.slice(0,10).map(x=>({q:str(x?.q??x?.question??x?.[0],180),a:str(x?.a??x?.answer??x?.[1],700)})).filter(x=>x.q&&x.a);
      if(clean.length)out.faqOverrides[p]=clean;
    });
    out.contextLinks={};
    if(d.contextLinks&&typeof d.contextLinks==='object') Object.entries(d.contextLinks).slice(0,40).forEach(([page,list])=>{
      const p=url(page);if(!p||!Array.isArray(list))return;out.contextLinks[p]=list.slice(0,6).map(x=>url(x)).filter(Boolean);
    });
    return out;
  }
  function pathGet(obj,path,fallback){const parts=String(path||'').split('.').filter(Boolean);let cur=obj;for(const p of parts){if(cur==null||!Object.prototype.hasOwnProperty.call(cur,p))return fallback;cur=cur[p];}return cur===undefined?fallback:cur;}
  function storageGet(key){try{return localStorage.getItem(key)}catch(e){return null}}
  function storageSet(key,val){try{localStorage.setItem(key,val)}catch(e){}}
  function gasUrl(){
    const g=CONFIG.gas||{};const u=String(g.webAppUrl||'').trim();
    if(!CONFIG.enabled||!/^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec(?:\?.*)?$/i.test(u))return'';
    return u;
  }
  function cacheScope(){return gasUrl()||'';}
  async function fetchRemote(){
    const endpoint=gasUrl();if(!endpoint)return null;
    const ctrl=new AbortController(), timer=setTimeout(()=>ctrl.abort(),7000);
    try{
      const sep=endpoint.includes('?')?'&':'?';
      const res=await fetch(`${endpoint}${sep}action=content&_=${Date.now()}`,{headers:{Accept:'application/json'},signal:ctrl.signal,cache:'no-store',redirect:'follow'});
      if(!res.ok)throw new Error('cms_http_'+res.status);
      const doc=await res.json();if(!doc?.ok||!doc?.found||!doc?.payload)return null;
      const raw=typeof doc.payload==='string'?JSON.parse(doc.payload):doc.payload;
      const content=sanitize(raw);
      storageSet(CACHE_KEY,JSON.stringify({scope:cacheScope(),at:Date.now(),content}));return content;
    }finally{clearTimeout(timer)}
  }
  function cached(){try{if(!gasUrl())return null;const c=JSON.parse(storageGet(CACHE_KEY)||'null');return c?.content&&c.scope===cacheScope()?{at:Number(c.at)||0,content:sanitize(c.content)}:null}catch(e){return null}}
  function draft(){try{const c=JSON.parse(storageGet(DRAFT_KEY)||'null');return c?sanitize(c):null}catch(e){return null}}
  function previewActive(){try{return sessionStorage.getItem(PREVIEW_KEY)==='1'}catch(e){return false}}
  function setPreviewActive(on){try{on?sessionStorage.setItem(PREVIEW_KEY,'1'):sessionStorage.removeItem(PREVIEW_KEY)}catch(e){}}

  const api={content:sanitize(DEFAULTS),source:'bundled',ready:null,get(path,fallback){return pathGet(api.content,path,fallback)},sanitize,refresh,gasEnabled:()=>!!gasUrl(),setPreviewActive,draftKey:DRAFT_KEY};
  window.KOCMS=api;

  function announce(){
    $('.ko-cms-announcement')?.remove();const a=api.content.site?.announcement;if(!a?.enabled||!a.text)return;
    const el=document.createElement(a.url?'a':'div');el.className='ko-cms-announcement';if(a.url){el.href=a.url;if(/^https?:\/\//i.test(a.url)){el.target='_blank';el.rel='noopener noreferrer'}}
    const text=document.createElement('span');text.textContent=a.text;el.appendChild(text);if(a.url){const c=document.createElement('strong');c.textContent=a.cta||'Lihat info';el.appendChild(c);}
    const header=$('.nav');if(header)header.insertAdjacentElement('afterend',el);else document.body.prepend(el);
  }
  function home(){
    if((location.pathname.split('/').pop()||'index.html')!=='index.html')return;const h=api.content.home||{}, hero=$('.hero');if(!hero)return;
    const eyebrow=$('.eyebrow',hero);if(eyebrow){eyebrow.textContent='';const i=document.createElement('i');i.setAttribute('data-lucide','sparkles');eyebrow.append(i,document.createTextNode(' '+(h.eyebrow||'')));}
    const title=$('h1',hero);if(title){title.textContent=h.title||'';if(h.titleAccent){title.append(document.createTextNode(' '));const s=document.createElement('span');s.className='grad-text';s.textContent=h.titleAccent;title.appendChild(s);}}
    const p=$(':scope > p',hero);if(p)p.textContent=h.description||'';const si=$('#searchHero');if(si)si.placeholder=h.searchPlaceholder||'';
    const disc=$('#calcGrid')?.closest('.section')?.querySelector('.section-head h2');if(disc)disc.textContent=h.discoveryTitle||'Jelajahi Kalkulator';
    const fl=$('.featured-label span');if(fl){fl.textContent='';const i=document.createElement('i');i.setAttribute('data-lucide','sparkles');fl.append(i,document.createTextNode(' '+(h.featuredLabel||'Kalkulator unggulan')));}
    $('.ko-cms-highlights')?.remove();const items=(h.highlights||[]).filter(x=>x.enabled&&x.title&&x.url);if(items.length){
      const sec=document.createElement('section');sec.className='wrap ko-cms-highlights reveal in';sec.innerHTML='<div class="stage7-section-head"><div><span>DARI CMS</span><h2>Pilihan & informasi</h2></div></div><div class="ko-cms-highlight-grid"></div>';
      const g=$('.ko-cms-highlight-grid',sec);items.forEach(x=>{const a=document.createElement('a');a.className='ko-cms-highlight-card';a.href=x.url;const ico=document.createElement('span');ico.className='ko-cms-highlight-icon';const ii=document.createElement('i');ii.setAttribute('data-lucide',x.icon||'sparkles');ico.append(ii);const cp=document.createElement('span');cp.className='ko-cms-highlight-copy';const sm=document.createElement('small');sm.textContent=x.label||'INFO';const st=document.createElement('strong');st.textContent=x.title;const ds=document.createElement('span');ds.textContent=x.description||'';cp.append(sm,st,ds);const ar=document.createElement('i');ar.setAttribute('data-lucide','arrow-up-right');a.append(ico,cp,ar);g.appendChild(a);});
      const anchor=$('#calcGrid')?.closest('.section');anchor?.insertAdjacentElement('afterend',sec);
    }
  }
  function footer(){const p=$('.foot-brand p');if(p)p.textContent=api.content.site?.footerTagline||'';const c=$('.foot-bottom span:first-child');if(c)c.textContent='© 2026 Kastriva. All rights reserved.';const b=$('.foot-bottom .kastriva-main-link');if(b)b.textContent='www.kastriva.web.id';}
  function ppn(){
    if((location.pathname.split('/').pop()||'')!=='kalkulator-ppn.html')return;const c=api.content.ppn||{}, sel=$('#tarif');
    if(sel&&Array.isArray(c.rates)){const current=String(c.defaultRate??'');sel.textContent='';c.rates.forEach(r=>{const o=document.createElement('option');o.value=String(r.value);o.textContent=r.label||`${r.value}%`;if(String(r.value)===current)o.selected=true;sel.appendChild(o);});}
    const sub=$('.page-main .hero-header .subtitle');if(sub&&c.subtitle)sub.textContent=c.subtitle;const intro=$('.page-main .card.article > p');if(intro&&c.intro)intro.textContent=c.intro;
  }
  function apply(){announce();home();footer();ppn();window.lucide?.createIcons?.();document.dispatchEvent(new CustomEvent('ko:cms-updated',{detail:{source:api.source,content:api.content}}));}
  function setContent(content,source){api.content=sanitize(content);api.source=source;apply();return api.content;}

  async function refresh(){
    if(previewActive()){const d=draft();if(d)return setContent(d,'preview');}
    if(!gasUrl())return setContent(DEFAULTS,'bundled');
    try{const remote=await fetchRemote();if(remote)return setContent(remote,'gas');}catch(e){}
    const c=cached();if(c)return setContent(c.content,'cache');return setContent(DEFAULTS,'bundled');
  }
  async function init(){
    const params=new URLSearchParams(location.search);if(params.get('cmsPreview')==='1')setPreviewActive(true);if(params.get('cmsPreview')==='0')setPreviewActive(false);
    if(previewActive()){const d=draft();if(d){setContent(d,'preview');return api.content;}}
    if(!gasUrl()){setContent(DEFAULTS,'bundled');return api.content;}
    const c=cached();if(c)setContent(c.content,'cache');else apply();
    const ttl=Math.max(30000,Number(CONFIG.cacheTtlMs)||300000);
    if(!c||Date.now()-c.at>ttl){try{const remote=await fetchRemote();if(remote)setContent(remote,'gas');}catch(e){}}
    return api.content;
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',()=>{api.ready=init();},{once:true}); else api.ready=init();
})();
