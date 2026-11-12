const { chromium } = require('playwright');
let F=0;const ok=(c,m)=>{console.log((c?'OK   ':'FAIL ')+m);if(!c)F++;};
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:412,height:880},deviceScaleFactor:2})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.argv[2]);await p.waitForTimeout(4000);
await p.evaluate(async()=>{window.uiConfirm=async()=>true;window.alert=m=>{window.__al=m};currentUser={tabel:ADMIN_TABEL,name:'Test Mashinist',role:'admin'};document.body.classList.remove('locked');const l=onlyLoks().find(v=>!hrInRepair(v));await mashTake(l.id);});await p.waitForTimeout(400);
// raqam qidiruvi
let r=await p.evaluate(()=>{const s=$id('xkTy');s.value='Dumpkar 2VS-105';s.dispatchEvent(new Event('change'));const i=$id('xkNoQ');i.value='812';xkNoFind('812');return [...$id('xkNoL').querySelectorAll('button')].map(b=>b.textContent).slice(0,4);});
ok(r.length>0,'raqam qidiruvi: '+r.join(' | '));
// boʻsh saqlash
r=await p.evaluate(()=>{xkTarkibEdit();window.__al='';xkTarkibSave();return window.__al;});ok(/Hech bir vagon/.test(r),'boʻsh saqlash ogohlantiradi');
// roʻyxat chuqurida bosish — sakramaydi
await p.evaluate(()=>{const s=$id('xkTy2');s.value='Dumpkar 2VS-105';s.dispatchEvent(new Event('change'));});
await p.evaluate(()=>{$id('hrPick').scrollTop=600;});await p.waitForTimeout(100);
r=await p.evaluate(()=>{const before=$id('hrPick').scrollTop;const rows=[...$id('hrPick').querySelectorAll('div')].filter(d=>!d.classList.contains('dis'));const row=rows.find(d=>d.offsetTop>before+20);row.click();return {before,after:$id('hrPick').scrollTop,sel:HR.sel.length,n:$id('hrSelN').textContent};});
ok(r.before>0&&Math.abs(r.after-r.before)<2&&r.sel===1&&r.n==='1','bosilganda joyida qoladi: '+JSON.stringify(r));
await p.screenshot({path:(process.env.AGMK_SHOT_DIR||'/tmp')+'/v44_ed1.png'});
r=await p.evaluate(()=>{xkTarkibSave();const t=msTarkib(hrDB(),mySmena());return t.vagonIds.length;});ok(r===1,'saqlandi: '+r);
await p.evaluate(()=>{mashRender();const i=$id('xkNoQ');});await p.screenshot({path:(process.env.AGMK_SHOT_DIR||'/tmp')+'/v44_ed2.png'});
console.log('err',errs);await b.close();process.exit(F?1:0);})();
