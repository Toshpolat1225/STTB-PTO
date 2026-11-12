// 4.4: boshqa tarkibdagi vagonni olish (mashinist va dispetcher), izoh: node frontend/tests/v44_olish.e2e.cjs <ilova.html>
const { chromium } = require('playwright');
let F=0;const ok=(c,m)=>{console.log((c?'OK   ':'FAIL ')+m);if(!c)F++;};
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:412,height:880},deviceScaleFactor:2})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.argv[2]);await p.waitForTimeout(4000);
// 1) dispetcher tarkib №A ga 3 ta 2VS-105
let r=await p.evaluate(()=>{window.uiConfirm=async()=>true;window.alert=m=>{window.__al=m};currentUser={tabel:ADMIN_TABEL,name:'Test Dispetcher',role:'admin'};
 const V=onlyVagons().filter(v=>v.type==='Dumpkar 2VS-105'&&!hrInRepair(v)).slice(0,3);const lok=onlyLoks().filter(v=>!hrInRepair(v))[1];
 hrEditTarkib(null);$id('hrTNo').value='77';$id('hrTJoy').value=$id('hrTJoy').options[1].value;$id('hrTLok').value=String(lok.id);HR.sel=V.map(v=>v.id);hrSaveTarkib();
 const t=hrDB().tarkiblar.find(x=>x.no==='77');return {n:t?t.vagonIds.length:-1,ids:V.map(v=>v.id),lok:hrName(lok)};});
ok(r.n===3,'dispetcher tarkib №77: '+r.n+' vagon, '+r.lok);const IDS=r.ids;
// 2) mashinist oʻz smenasida — roʻyxatda izoh va olish
r=await p.evaluate(async ids=>{const l=onlyLoks().find(v=>!hrInRepair(v));await mashTake(l.id);XKT.ty='Dumpkar 2VS-105';xkTarkibEdit(ids[0]);
 const row=[...$id('hrPick').querySelectorAll('div')].find(d=>d.textContent.includes('Tarkib №77'));return {cnt:$id('hrPick').querySelector('p').textContent,row:row&&row.textContent.replace(/\s+/g,' ').trim(),dis:row&&row.classList.contains('dis')};},IDS);
ok(r.row&&!r.dis&&/→ sizga oʻtadi|Tarkib №77/.test(r.row),'izoh: '+JSON.stringify(r));
await p.screenshot({path:(process.env.AGMK_SHOT_DIR||'/tmp')+'/v44_tk1.png'});
r=await p.evaluate(ids=>{xkTarkibSave();const d=hrDB();const t77=d.tarkiblar.find(x=>x.no==='77');const my=msTarkib(d,mySmena());return {t77:t77.vagonIds.length,my:my.vagonIds.length,log:d.log.slice(0,3).map(x=>x.text).join(' | '),toast:(document.querySelector('.toast,#toast')||{}).textContent||''};},IDS);
ok(r.t77===2&&r.my===1&&/olindi/.test(r.log),'mashinist oldi: '+JSON.stringify(r));
// 3) dispetcher boshqa tarkibdan oladi
r=await p.evaluate(ids=>{const d=hrDB();const t77=d.tarkiblar.find(x=>x.no==='77');hrEditTarkib(t77.id);const my=msTarkib(d,mySmena());HR.sel=HR.sel.concat(my.vagonIds);const row=[...$id('hrPick').querySelectorAll('div')].find(x=>x.textContent.includes('Tarkib №'));hrSaveTarkib();const d2=hrDB();return {t77:d2.tarkiblar.find(x=>x.no==='77').vagonIds.length,my:msTarkib(d2,mySmena()).vagonIds.length,rowDis:row?row.classList.contains('dis'):null};},IDS);
ok(r.t77===3&&r.my===0,'dispetcher qaytarib oldi: '+JSON.stringify(r));
// 4) notoʻgʻri forma — hech narsa koʻchmaydi
r=await p.evaluate(()=>{const d=hrDB();const t77=d.tarkiblar.find(x=>x.no==='77');const l=onlyLoks().find(v=>!hrInRepair(v));hrEditTarkib(null);$id('hrTNo').value='78';$id('hrTJoy').value='';HR.sel=[t77.vagonIds[0]];hrSaveTarkib();return hrDB().tarkiblar.find(x=>x.no==='77').vagonIds.length;});
ok(r===3,'joy tanlanmasa — vagon eski tarkibda qoldi: '+r);
console.log('err',errs);await b.close();process.exit(F?1:0);})();
