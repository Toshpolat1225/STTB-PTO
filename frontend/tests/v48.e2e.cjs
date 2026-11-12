// 4.8: keyingi DR (DR/KR kechrogʻi), tarix tahriri, Excel ustunlari, pasport PDF: node frontend/tests/v48.e2e.cjs <ilova.html>
const { chromium } = require('playwright');
let F=0;const ok=(c,m)=>{console.log((c?'OK   ':'FAIL ')+m);if(!c)F++;};
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:412,height:880},deviceScaleFactor:2,acceptDownloads:true});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.argv[2]);await p.waitForTimeout(4500);
await p.evaluate(()=>{window.uiConfirm=async()=>true;window.alert=m=>{window.__al=m};currentUser={tabel:ADMIN_TABEL,name:'Test',role:'admin'};document.body.classList.remove('locked');});
// 1) qoida: soxta vagon maʼlumoti bilan
let r=await p.evaluate(()=>{const v=onlyVagons().find(x=>!x.kind&&/2VS-105/.test(x.type));const s=JSON.stringify(v);v.tamirSanasi='2024-05-29';v.kr='2025-06-26';v.drAuto=true;delete v.vgMove;recalcVagonStatus(v);const a={k:v.keyingi,lr:agmkLastRep(v)};
 v.kr='2010-01-01';recalcVagonStatus(v);a.k2=v.keyingi;Object.assign(v,JSON.parse(s));recalcVagonStatus(v);return a;});
ok(r.k==='2026-06-26'&&r.lr.t==='KR'&&r.k2==='2025-05-29','keyingi DR = kechrogʻi+12 oy: '+JSON.stringify(r));
r=await p.evaluate(()=>{const v=onlyVagons().find(x=>!x.kind&&x.tamirSanasi&&x.kr&&x.kr>x.tamirSanasi&&x.drAuto!==false);if(!v)return {skip:1};recalcVagonStatus(v);return {no:vagonNo(v),dr:v.tamirSanasi,kr:v.kr,k:v.keyingi};});
ok(r.skip||r.k>=r.kr,'bazadagi KR>DR vagon: '+JSON.stringify(r));
// 2) tarix tahriri
r=await p.evaluate(async()=>{const v=onlyVagons().find(x=>!x.kind&&/2VS-105/.test(x.type));v.history=[{date:'2023-01-10',type:"Depo ta'miri (DR)",author:'Soxta Ism (tex)'},{date:'2022-02-02',type:'Kapital taʼmir (KR)',author:'Soxta',src:'pasp'}];v.tamirSanasi='2023-01-10';v.kr='2022-02-02';v.drAuto=true;delete v.vgMove;openPassport(v.id);
 const btn=[...document.querySelectorAll('#tamir-history-list .h8-b')].map(x=>x.textContent);const tag=[...document.querySelectorAll('#tamir-history-list .hs-tag')].map(x=>x.textContent);
 editTamirEntry(0);const m=document.getElementById('h8Ed');const has=!!(m&&m.querySelector('.kq-dn'));h8DateSet('d','2024-03-15',m.querySelector('.kq-dn'));document.getElementById('h8Ty1').value='22';h8DateSet('g','2027-06-30',m.querySelectorAll('.kq-dn')[1]);document.getElementById('h8Iz').value='sinov izohi';h8Save();
 const a={btn,tag,has,dr:v.tamirSanasi,k:v.keyingi,h0:v.history[0],x:[...document.querySelectorAll('#tamir-history-list .h8-x1')].map(x=>x.textContent)};
 await deleteTamirEntry(0);a.dr2=v.tamirSanasi;a.n=v.history.length;return a;});
ok(r.btn.some(t=>/Tahrirlash/.test(t))&&r.tag.some(t=>/vagon pasporti/.test(t)),'tugmalar va pasp belgisi: '+JSON.stringify([r.btn.slice(0,2),r.tag]));
ok(r.has&&r.dr==='2024-03-15'&&r.k==='2025-03-15'&&r.h0.ty==='22'&&r.h0.edited&&r.x.length>=2,'tahrir saqlandi, DR va keyingi qayta hisoblandi: '+JSON.stringify({dr:r.dr,k:r.k,x:r.x}));
ok(r.n===1,'oʻchirish: '+JSON.stringify({dr2:r.dr2,n:r.n}));
await p.screenshot({path:(process.env.AGMK_SHOT_DIR||'/tmp')+'/v48_hist.png'});
// 3) Excel ustunlari
r=await p.evaluate(()=>{const C=YK_CFG['screen-vagonlar']();const g=k=>C.cols.find(c=>c.k===k);const v=onlyVagons().find(x=>!x.kind&&x.prodlen==='+');return {t:C.cols.map(c=>c.t).filter(t=>/Keyingi|Oxirgi taʼmir|Muddat/.test(t)),prod:g('prod').g(v),tt:g('tt').g(v),pg:g('nextpg').g(v),pre:C.pre['Taʼmir']};});
ok(r.t.includes('Keyingi DR (grafik PPR)')&&r.t.includes('Keyingi DR (probeg)')&&r.prod==='Ha'&&/DR|KR/.test(r.tt)&&r.pre.includes('nextpg'),'Excel ustunlari: '+JSON.stringify(r));
// 4) pasport PDF
r=await p.evaluate(async()=>{const v=onlyVagons().find(x=>vagonNo(x)==='24604')||onlyVagons()[0];openPassport(v.id);const b=document.getElementById('p8PassB');
 let got=null;window.exOpen=(f,o)=>{got={n:f[0].name,s:f[0].blob.size,t:o.title}};await p8Make('c');const c=got;got=null;await p8Make('bw');
 const D=p8Collect();if(!D.S.find(s=>s.tb))D.S.push({t:'Taʼmir tarixi',tb:{h:['Sana','Taʼmir','Manba','Kiritdi'],r:[]}});D.S.find(s=>s.tb).tb.r=Array.from({length:45},(_,i)=>['01.01.2020','DR','Soxta','Soxta']);const pages=p8Paginate(D,'b').length;
 const p1=p8Paginate(p8Collect(),'c').length;return {btn:!!b,c,bw:got,pages,p1,main:D.main.length};});
ok(r.btn&&r.c&&r.c.s>50000&&r.bw&&/rangsiz/.test(r.bw.n),'PDF tayyor: '+JSON.stringify(r));
ok(r.pages===2&&r.p1===1,'uzun tarix → 2 varaq: '+r.pages);
// xodim: shaxsiy maʼlumot chiqmaydi
r=await p.evaluate(()=>{const g=document.getElementById('item-passport-grid');g.innerHTML='<div>F.I.O: <span>Soxta Ism</span></div><div>OKLAD: <span>999</span></div><div>TUG\'ILGAN SANASI: <span>01.01.1990</span></div><div>TELEFON: <span>+998</span></div><div>LAVOZIM: <span>Usta</span></div>';openScreen('screen-item-pasport');return p8Pairs('#item-passport-grid > div').map(x=>x[0]);});
ok(r.length===2&&!r.some(l=>/oklad|tug|telefon/i.test(l)),'xodim PDF: shaxsiy maʼlumotsiz: '+JSON.stringify(r));
// ekskavator
r=await p.evaluate(()=>{menuEksk();return document.getElementById('menuEksk').innerText;});ok(!/Avtotraktor parkidagi/.test(r),'ekskavator tugmasi yoʻq');
console.log('err',errs);await b.close();process.exit(F||errs.length?1:0);})();
