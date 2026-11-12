// 4.4: GPS xaritada tarkib vagonlari lokomotiv izidan; pasportda «qayerda»: node frontend/tests/v44_gps_vagon.e2e.cjs <ilova.html>
const { chromium } = require('playwright');
let F=0;const ok=(c,m)=>{console.log((c?'OK   ':'FAIL ')+m);if(!c)F++;};
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:412,height:880},deviceScaleFactor:2})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.argv[2]);await p.waitForTimeout(4000);
await p.evaluate(async()=>{window.uiConfirm=async()=>true;window.alert=()=>{};currentUser={tabel:ADMIN_TABEL,name:'Test Mashinist',role:'admin'};document.body.classList.remove('locked');
 const l=onlyLoks().find(v=>!hrInRepair(v)&&hdKind(v)==='el');await mashTake(l.id);const V=onlyVagons().filter(v=>v.type==='Dumpkar 2VS-105'&&!hrInRepair(v)).slice(0,14);HR.sel=[];XKT.ty='';xkTarkibEdit();HR.sel=V.map(v=>v.id);xkTarkibSave();});
await p.evaluate(()=>gdOpen());await p.waitForTimeout(2500);
// lokomotiv harakati: shimoli-sharqqa, har qadam ~40 m (Olmaliq atrofi)
const sm=await p.evaluate(()=>mySmena().tabel);
for(let i=0;i<12;i++){await p.evaluate(([i,tb])=>{MS.pos=[{tabel:tb,name:'Test Mashinist',lat:40.85+i*0.00025,lon:69.60+i*0.0003,ago:0,unit:'ПЭ2М',uid:String(mySmena().unitId)}];msMapDraw();},[i,sm]);}
await p.evaluate(()=>{GD.map.setView([40.85+11*0.00025,69.60+11*0.0003],18,{animate:false});msMapDraw();});await p.waitForTimeout(500);
let r=await p.evaluate(()=>({vg:document.querySelectorAll('.xk-vg').length,est:document.querySelectorAll('.xk-vg.est').length,badge:document.querySelectorAll('.xk-vbadge').length}));
ok(r.vg===14&&r.est===0,'zoom 18: 14 vagon lokomotiv izida '+JSON.stringify(r));await p.screenshot({path:(process.env.AGMK_SHOT_DIR||'/tmp')+'/v44_gps1.png'});
await p.evaluate(()=>{GD.map.setZoom(14,{animate:false});msMapDraw();});await p.waitForTimeout(300);
r=await p.evaluate(()=>({vg:document.querySelectorAll('.xk-vg').length,badge:(document.querySelector('.xk-vbadge')||{}).textContent}));ok(r.vg===0&&/14 vagon/.test(r.badge),'uzoqda — belgi: '+JSON.stringify(r));
// pasport: qayerda
r=await p.evaluate(()=>{const t=msTarkib(hrDB(),mySmena());openPassport(t.vagonIds[3]);return ($id('xkPassCard')||{}).textContent||'';});await p.waitForTimeout(300);
ok(/Tarkib №.*4-vagon/.test(r)&&/GPS/.test(r),'pasportda joyi: '+r.slice(0,120));
console.log('err',errs);await b.close();process.exit(F?1:0);})();
