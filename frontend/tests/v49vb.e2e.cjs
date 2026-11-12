// 4.9 b115: lavozim → xodim; «STTB bosh muhandisi», «STTB boshligʻi»; boshqa xodim — «v.b.» (soxta ismlar): node frontend/tests/v49vb.e2e.cjs <ilova.html>
const { chromium } = require('playwright');
let F=0;const ok=(c,m)=>{console.log((c?'OK   ':'FAIL ')+m);if(!c)F++;};
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:412,height:880}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>d.dismiss());
await p.goto('file://'+process.argv[2]);await p.waitForTimeout(4500);
const r=await p.evaluate(async()=>{currentUser={tabel:ADMIN_TABEL,name:'Test',role:'admin'};document.body.classList.remove('locked');const W=ms=>new Promise(r=>setTimeout(r,ms));
 const T=getShtatTree(), P=T.pos, g3=T.groups.find(g=>/Ishlab chiqarish-texnik/.test(g.name)), eng=P.find(x=>x.g===g3.id&&/harakat tarkibi/i.test(x.name)), oth=P.find(x=>x.g===g3.id&&x!==eng&&!/boshlig/i.test(x.name));
 sectionItemsDB.xodim=sectionItemsDB.xodim||{}; sectionItemsDB.xodim.__t=[{name:'Birinchiyev Bosh Muhandisovich',tabel:'900001',lavozim:'Bosh muhandis',posNo:2},{name:'Ikkinchiyev Akmal Akmalovich',tabel:'900002',lavozim:P.find(x=>x.no===3).name,posNo:3},
   {name:'Uchinchiyev Injener Injenerovich',tabel:'900003',lavozim:eng.name,posNo:eng.no},{name:'Tortinchiyev Elyor Elyorovich',tabel:'900004',lavozim:oth.name,posNo:oth.no}];
 const o={}; const pick=async(uid,posNo,tab,lang)=>{agmkPickPerson('t',()=>{},lang); await W(80); const u=$id('kqPU'); u.value=uid; kqPickU(); const ps=$id('kqPP'); ps.value=posNo?String(posNo):''; kqPickP(); const x=KQP.P.find(z=>z.id===tab); $id('kqPX').value=x.id; kqPickX(); const v=$id('kqPL').value; mdlClose('kqPick'); return v;};
 o.bm=await pick('u1',2,'900001'); o.bmVb=await pick('u1',2,'900002'); o.bsVb=await pick('u1',1,'900002'); o.eng=await pick(g3.id,eng.no,'900003'); o.engVb=await pick(g3.id,eng.no,'900004'); o.direct=await pick('u1',0,'900001');
 o.ru=await pick('u1',2,'900001','ru'); o.ruVb=await pick('u1',2,'900002','ru'); o.ruBs=await pick('u1',1,'900002','ru'); o.ruEng=await pick(g3.id,eng.no,'900004','ru'); o.ruDirect=await pick('u1',0,'900001','ru'); return o;});
console.log(JSON.stringify(r));
ok(r.bm==='STTB bosh muhandisi','bosh muhandis: '+r.bm); ok(r.bmVb==='STTB bosh muhandisi v.b.','boshqa xodim — v.b.: '+r.bmVb); ok(/^STTB boshlig.i v\.b\.$/.test(r.bsVb),'boshliq oʻrniga: '+r.bsVb);
ok(/^ICHTB .*muhandisi$/i.test(r.eng)&&!/v\.b/.test(r.eng),'muhandis (oʻzi): '+r.eng); ok(/^ICHTB .*muhandisi v\.b\.$/i.test(r.engVb),'muhandis oʻrniga boshqa: '+r.engVb); ok(r.direct==='STTB bosh muhandisi','lavozimsiz — oʻz lavozimi: '+r.direct);
ok(r.ru==='Главный инженер УПЖТ','ru: '+r.ru); ok(r.ruVb==='И.о. главного инженера УПЖТ','ru v.b.: '+r.ruVb); ok(r.ruBs==='И.о. начальника УПЖТ','ru boshliq oʻrniga: '+r.ruBs);
ok(r.ruEng==='И.о. инженера I категории по подвижному составу ПТО','ru muhandis: '+r.ruEng); ok(r.ruDirect==='Главный инженер УПЖТ','ru lavozimsiz: '+r.ruDirect);
ok(!errs.length,'sahifa xatolari yoʻq '+errs.slice(0,2).join(' | '));
console.log(F?`❌ ${F} ta xato`:'✅ hammasi oʻtdi');await b.close();process.exit(F?1:0);})();
