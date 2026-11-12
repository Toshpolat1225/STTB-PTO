// 4.8: xizmat muddati (texnik yechim) — Excel ustuni va eslatma: node frontend/tests/v48srok.e2e.cjs <ilova.html>
const { chromium } = require('playwright');
let F=0;const ok=(c,m)=>{console.log((c?'OK   ':'FAIL ')+m);if(!c)F++;};
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:412,height:880}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.argv[2]);await p.waitForTimeout(4500);
let r=await p.evaluate(()=>({a:h8Srok({srok:'30.04.2027'}),b:h8Srok({srok:'сентябрь 2026г.'}),c:h8Srok({srok:'Срок служба более удвоенного'}),d:h8Srok({srokYil:'2027-06-30'}),e:h8Srok({srok:'март 2027'}),f:h8Srok({srok:'май 2026'})}));
ok(r.a==='2027-04-30'&&r.b==='2026-09-30'&&r.c===''&&r.d==='2027-06-30'&&r.e==='2027-03-31'&&r.f==='2026-05-31','sana tanish: '+JSON.stringify(r));
r=await p.evaluate(()=>{const C=YK_CFG['screen-vagonlar']();const v=onlyVagons().find(x=>vagonNo(x)==='24603');return {u:C.cols.find(c=>c.k==='uzay').g(v),pre:C.pre['Pasport'],n:C.cols.filter(c=>/Texnik yechim/.test(c.t)).length};});
ok(r.u==='№ 1025 · 30.04.2027'&&r.n===1&&r.pre.includes('uzay'),'Excel: bitta ustun: '+JSON.stringify(r));
r=await p.evaluate(()=>{currentUser={tabel:ADMIN_TABEL,name:'Test',role:'admin'};try{localStorage.removeItem('agmk_h8_srok_'+meTabel())}catch(e){}const n0=getNotifs().length;h8SrokNotify();const L=getNotifs();const n1=L.length;h8SrokNotify();return {add:n1-n0,again:getNotifs().length-n1,t:(L[L.length-1]||{}).text,cnt:h8SrokList().length};});
ok(r.cnt>0&&r.add===1&&r.again===0&&/xizmat muddati/.test(r.t),'eslatma bir marta (bosqich oʻzgarmaguncha): '+JSON.stringify({add:r.add,again:r.again,cnt:r.cnt,t:String(r.t).slice(0,240)}));
console.log('err',errs);await b.close();process.exit(F||errs.length?1:0);})();
