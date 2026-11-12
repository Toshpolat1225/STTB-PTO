// 4.4: Vagon taʼmiri — KR/DR/VRP/PTOV, pasport sanasi tarixga: node frontend/tests/v44_tamir.e2e.cjs <ilova.html>
const { chromium } = require('playwright');
let F=0;const ok=(c,m)=>{console.log((c?'OK   ':'FAIL ')+m);if(!c)F++;};
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:412,height:880},deviceScaleFactor:2})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.argv[2]+'');await p.waitForTimeout(4500);
await p.evaluate(()=>{window.uiConfirm=async()=>true;window.alert=m=>{window.__al=m};currentUser={tabel:ADMIN_TABEL,name:'Test',role:'admin'};document.body.classList.remove('locked');slOpen();slGo('tamir');});await p.waitForTimeout(600);
let r=await p.evaluate(()=>({btn:[...document.querySelectorAll('#screen-sl-tamir .sl-rtb')].map(b=>b.innerText.replace(/\n/g,' ')),kpi:document.querySelector('#screen-sl-tamir .sl-kpi b').innerText}));
ok(r.btn.length===4&&+r.kpi>0,'4 tugma va jami: '+JSON.stringify(r));await p.screenshot({path:(process.env.AGMK_SHOT_DIR||'/tmp')+'/v44_tm1.png'});
await p.evaluate(()=>slSet('rt','DR'));await p.waitForTimeout(400);
r=await p.evaluate(()=>({det:document.querySelectorAll('#screen-sl-tamir .sl-md').length,first:(document.querySelector('#screen-sl-tamir .sl-md summary')||{}).innerText}));ok(r.det>0,'DR oylar: '+JSON.stringify(r));
await p.evaluate(()=>{document.querySelector('#screen-sl-tamir .sl-md').open=true;});await p.screenshot({path:(process.env.AGMK_SHOT_DIR||'/tmp')+'/v44_tm2.png'});
await p.evaluate(()=>slSet('rt','VRP'));await p.waitForTimeout(300);
r=await p.evaluate(()=>{slRepAdd('VRP');$id('slRAv').value='8121, 8130-8132';slRepSave('VRP');return {exp:['8121','8130','8131','8132'].filter(w=>onlyVagons().some(v=>String(vagonNo(v))===w)).length,n:slTS().all().filter(x=>x.rt==='VRP').length,det:document.querySelectorAll('#screen-sl-tamir .sl-md').length};});
ok(r.n===r.exp&&r.n>=2&&r.det===1,'VRP kiritildi: '+JSON.stringify(r));await p.screenshot({path:(process.env.AGMK_SHOT_DIR||'/tmp')+'/v44_tm3.png'});
// pasportda DR sanasi oʻzgarsa — tarixga yoziladi (eski ham)
r=await p.evaluate(()=>{const v=onlyVagons().find(x=>vagonNo(x)==='8121');const old=v.tamirSanasi;slSnap();v.tamirSanasi=todayISO();saveDB();const L=slTS().all().filter(x=>x.vid===v.id&&x.rt==='DR').map(x=>x.d).sort();return {old,L};});
ok(r.L.length===2&&r.L.includes(r.old),'pasport DR oʻzgardi → tarix: '+JSON.stringify(r));
console.log('err',errs);await b.close();process.exit(F?1:0);})();
