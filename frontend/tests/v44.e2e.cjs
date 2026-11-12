// 4.4 sinovi: node frontend/tests/v44.e2e.cjs <yigʻilgan ilova.html> [vagonlar.jsonl] (Playwright kerak). Rasmlar: $AGMK_SHOT_DIR (yoki /tmp)
// Faqat soxta ism («Test Mashinist»); haqiqiy baza fayli repoga qoʻshilmaydi — faqat argument sifatida.
const SH=(process.env.AGMK_SHOT_DIR||'/tmp')+'/v44_';
const { chromium } = require('playwright');
let fails=0;const ok=(c,m)=>{console.log((c?'OK   ':'FAIL ')+m);if(!c)fails++;};
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:412,height:880},deviceScaleFactor:2});const p=await ctx.newPage();const errs=[];
p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text().slice(0,200));});
await p.goto('file://'+process.argv[2]);await p.waitForTimeout(4000);
await p.evaluate(()=>{window.uiConfirm=async()=>true;window.alert=m=>{window.__al=m};currentUser={tabel:ADMIN_TABEL,name:'Test Mashinist',role:'admin'};document.body.classList.remove('locked');try{modRefresh()}catch(e){};openScreen('screen-main');});
const recs=!process.argv[3]?[]:require('fs').readFileSync(process.argv[3],'utf8').trim().split('\n').map(l=>JSON.parse(l)).filter(r=>r.kind==='unit');
await p.evaluate(R=>{R.forEach(r=>{const i=vagonlarData.findIndex(v=>String(v.id)===String(r.data.id));if(i>=0)vagonlarData[i]=r.data;});},recs);
let r=await p.evaluate(()=>({v:AGMK_VERSION,b:AGMK_BUILD,rate:pgRate(onlyVagons().find(v=>v.type==='Dumpkar 2VS-105')),c:pgCfg()}));
ok(/^\d\.\d+$/.test(r.v)&&r.b>=94,'versiya '+r.v+' b'+r.b);
ok(Math.abs(r.rate-3*30.27*315/365)<0.01,'meʼyor km/kun '+r.rate.toFixed(2));
ok(r.c.drKm===110000&&r.c.kkdKm===15.134&&r.c.nakKm===13.29,'sozlama '+JSON.stringify(r.c).slice(0,120));
// eski 4.3 sozlamasi qoʻllanmaydi
r=await p.evaluate(()=>{kvSet('agmk_pg_cfg',{drKm:18000,ishKun:23});const a=pgCfg().drKm;kvSet('agmk_pg_cfg',null);return a;});ok(r===110000,'4.3 eski sozlama eʼtiborsiz: '+r);
// taʼmir grafigi
await p.evaluate(()=>vgmOpen('screen-main'));await p.waitForTimeout(400);await p.evaluate(()=>pgOpen());await p.waitForTimeout(800);
r=await p.evaluate(()=>{const t=secBody('screen-probeg').innerText;return{rows:document.querySelectorAll('.pgr').length,bars:document.querySelectorAll('.pgr .pgb').length,krOld:/KR oʻtgan|7 yildan|120 ming/.test(t),chk:!!document.querySelector('[onclick="xkCheckOpen()"]')};});
ok(r.rows>0&&r.bars===r.rows&&!r.krOld&&r.chk,'DR: '+JSON.stringify(r));
await p.screenshot({path:SH+'1_dr.png'});
await p.evaluate(()=>{pgSet('m','kr')});await p.waitForTimeout(300);
r=await p.evaluate(()=>({k:document.querySelectorAll('.pgr .pgb.k').length,d:document.querySelectorAll('.pgr .pgb.d').length,sec:(document.querySelector('.pgr .sec2')||{}).innerText||''}));
ok(r.k>0&&r.d===0&&/DR:/.test(r.sec),'KR rejim: '+JSON.stringify(r));
await p.screenshot({path:SH+'2_kr.png'});await p.evaluate(()=>pgSet('m','dr'));
// MASHINIST: smena → vagonlar → xodka
r=await p.evaluate(async()=>{
  const lok=onlyLoks().find(v=>!hrInRepair(v));await mashTake(lok.id);
  const V=onlyVagons().filter(v=>v.type==='Dumpkar 2VS-105'&&!hrInRepair(v)).slice(0,13);for(const v of V)await mashVagAdd(v.id);
  const sm=mySmena();const t=msTarkib(hrDB(),sm);return{lok:lok.id,sm:!!sm,n:t?t.vagonIds.length:-1,ids:V.map(v=>v.id)};});
ok(r.sm&&r.n===13,'smena va tarkib: '+r.n+' vagon');const VIDS=r.ids,LOK=r.lok;
await p.evaluate(()=>{mashOpen('smena')});await p.waitForTimeout(500);
r=await p.evaluate(()=>!!document.querySelector('.xk-card'));ok(r,'smenada «Xodkalar» kartasi');
await p.evaluate(()=>{xkAsk()});await p.waitForTimeout(300);await p.screenshot({path:SH+'3_xodka_modal.png'});
r=await p.evaluate(()=>{XKF.mz='kkd';XKF.soni=1.5;xkDraw();$id('xkTn').value='2300';xkSave();XKF.mz='nak';xkAsk();XKF.mz='nak';XKF.soni=1;xkDraw();xkSave();return xkS().all().map(x=>({mz:x.mz,s:x.soni,tn:x.tn,v:x.vag.length}));});
ok(r.length===2&&r[0].v===13&&r.some(x=>x.mz==='kkd'&&x.tn===2300&&x.s===1.5),'xodkalar yozildi: '+JSON.stringify(r));
await p.evaluate(()=>mashRender());await p.waitForTimeout(300);await p.screenshot({path:SH+'4_smena.png'});
// smena oʻrtasida (GPS 20 km) 2 ta 6VS-60 ulanadi — ularga naryaddan 40 km, xodka hisobiga kirmaydi
const V60=await p.evaluate(async()=>{const sm=mySmena();smS().put(Object.assign({},sm,{m:20000}));const V=onlyVagons().filter(v=>v.type==='Dumpkar 6VS-60'&&!hrInRepair(v)).slice(0,2);for(const v of V)await mashVagAdd(v.id);return V.map(v=>v.id);});
r=await p.evaluate(()=>{const s=mySmena().seg||[];return s.map(g=>({m:g.m,n:g.vag.length}));});
ok(r.length===2&&r[0].m===0&&r[0].n===13&&r[1].m===20000&&r[1].n===15,'naryad boʻlaklari: '+JSON.stringify(r));
// GPS 60 km, smenani topshirish (xodka bor — eslatmasiz)
r=await p.evaluate(async()=>{const sm=mySmena();smS().put(Object.assign({},sm,{m:60000}));let asked=0;const o=window.uiConfirm;window.uiConfirm=async(m)=>{if(/xodka kiritilmagan/.test(m))asked++;return true;};await mashEnd();window.uiConfirm=o;return{asked,open:!!mySmena()};});
ok(r.asked===0&&!r.open,'smena topshirildi (eslatmasiz): '+JSON.stringify(r));
r=await p.evaluate(ids=>{xkReset();const v=vagonlarData.find(x=>x.id===ids[0]);const k=vgKmSince(v,todayISO());const R=xkS().all().map(x=>({mz:x.mz,km:xkKm(x)}));return{k,R};},VIDS);
ok(Math.abs(r.k.fakt-60)<0.01&&r.R.every(x=>x.km.src==='gps'),'GPS taqsimlandi: vagon '+r.k.fakt.toFixed(2)+' km; '+JSON.stringify(r.R));
const kkdKm=r.R.find(x=>x.mz==='kkd').km.km;ok(Math.abs(kkdKm-60*45.402/(45.402+26.58))<0.01,'KKD ulushi '+kkdKm.toFixed(2));
r=await p.evaluate(ids=>{xkReset();return ids.map(id=>{const v=vagonlarData.find(x=>x.id===id);const k=vgKmSince(v,todayISO());return {f:Math.round(k.fakt*100)/100,nar:k.nar,n:k.n};});},V60);
ok(r.every(x=>x.f===40&&x.nar&&x.n===1),'6VS-60 — naryaddan 40 km (xodkasiz): '+JSON.stringify(r));
r=await p.evaluate(()=>{const x=xkS().all().find(r=>r.mz==='kkd');return {norm:xkTnNorm(x),t:pgCfg().t['Dumpkar 6VS-60']};});
ok(r.norm===13*105+100&&r.t.tn===0,'ruda yuki faqat 2VS-105 (+motor): '+JSON.stringify(r));
// motovoz (temir yoʻl texnikasi) smenasi: tarkib ochiladi, sisterna ulanadi, GPS 15 km → sisternaga 15 km
r=await p.evaluate(async()=>{const mv=onlyYol().find(v=>/Motovoz/.test(v.type)&&!hrInRepair(v));await mashTake(mv.id);const sm0=mySmena();const t=msTarkib(hrDB(),sm0);const S=onlyVagons().find(v=>v.type==='Sisterna'&&!hrInRepair(v));await mashVagAdd(S.id);const sm=mySmena();smS().put(Object.assign({},sm,{m:15000}));await mashEnd();xkReset();const k=vgKmSince(S,todayISO());return {tarkib:!!t,html:true,km:Math.round(k.fakt*100)/100,nar:k.nar,lok:vpgRows(mv).length};});
ok(r.tarkib&&r.km===15&&r.nar&&r.lok>=1,'motovoz naryadi → sisterna 15 km: '+JSON.stringify(r));
// DR hisoblagichi: fakt + hisob
r=await p.evaluate(ids=>{const v=vagonlarData.find(x=>x.id===ids[0]);return vgKmSince(v,v.tamirSanasi);},VIDS);
ok(r&&r.fakt>59&&r.hisob>0,'DR dan keyin: jami '+Math.round(r.jami)+' (fakt '+Math.round(r.fakt)+' + hisob '+Math.round(r.hisob)+')');
// ikkinchi smena — xodkasiz → eslatma
r=await p.evaluate(async lok=>{await mashTake(lok);let asked=0;const o=window.uiConfirm;window.uiConfirm=async(m)=>{if(/xodka kiritilmagan/.test(m)){asked++;return true;}return true;};await mashEnd();const open=!!mySmena();const modal=!$id('xkM').classList.contains('hidden');XKF.mz='bosh';XKF.soni=1;xkDraw();xkSave();await new Promise(r=>setTimeout(r,800));window.uiConfirm=o;return{asked,openAfterAsk:open,modal,closed:!mySmena(),bosh:xkS().all().filter(x=>x.mz==='bosh').length};},LOK);
ok(r.asked===1&&r.openAfterAsk&&r.modal&&r.closed&&r.bosh===1,'xodkasiz smena eslatmasi → kiritildi → topshirildi: '+JSON.stringify(r));
// pasport kartochkasi
await p.evaluate(ids=>openPassport(ids[0]),VIDS);await p.waitForTimeout(900);
r=await p.evaluate(()=>{const c=$id('xkPassCard');const btn=$id('btn-mark-tamirda')||$id('btn-restore-auto');return{c:c?c.innerText.replace(/\n/g,' '):'',after:!!(c&&btn&&btn.parentElement.nextElementSibling===c)};});
ok(r.c&&/DR dan keyin/.test(r.c)&&r.after,'pasport kartochkasi: '+r.c.slice(0,160));
await p.screenshot({path:SH+'5_pasport.png'});
await p.evaluate(ids=>vpgOpen(ids[0]),VIDS);await p.waitForTimeout(500);
r=await p.evaluate(()=>({s:document.querySelector('.screen.active').id,rows:document.querySelectorAll('#screen-vprobeg .sl-t tr').length,b:document.querySelectorAll('.vpg-b').length}));
ok(r.s==='screen-vprobeg'&&r.rows>=3&&r.b===12,'probeg sahifasi '+JSON.stringify(r));await p.screenshot({path:SH+'6_vprobeg.png'});
await p.evaluate(lok=>vpgOpen(lok),LOK);await p.waitForTimeout(400);
r=await p.evaluate(()=>secBody('screen-vprobeg').innerText.slice(0,200));ok(/GPS/.test(r)&&/60/.test(r),'lokomotiv probegi: '+r.replace(/\n/g,' ').slice(0,120));await p.screenshot({path:SH+'7_lok.png'});
// salohiyat
await p.evaluate(()=>slOpen());await p.waitForTimeout(600);
r=await p.evaluate(()=>({t:document.querySelector('#screen-salohiyat .sec-title').textContent,n:document.querySelectorAll('#screen-salohiyat .vgm-c').length,mod:AGMK_MODS.find(m=>m.id==='salohiyat').title}));
ok(r.t==='Ishlab chiqarish koʻrsatkichlari'&&r.n===3&&r.mod===r.t,'nom va 3 karta: '+JSON.stringify(r));await p.screenshot({path:SH+'8_ichk.png'});
await p.evaluate(()=>slGo('ruda'));await p.waitForTimeout(600);
r=await p.evaluate(()=>{const t=secBody('screen-sl-ruda').innerText;const m=todayISO().slice(0,7);return{mz:/Manzillar boʻyicha \(mashinist/.test(t),f:slFakt(m),src:slFSrc(m),icon:[...document.querySelectorAll('#screen-sl-ruda .sl-t')].some(t=>/title="mashinist xodkalari"/.test(t.innerHTML))};});
ok(r.mz&&r.src==='x'&&r.f>2300&&r.icon,'ruda fakt xodkadan: '+JSON.stringify(r));
await p.evaluate(()=>{const c=[...document.querySelectorAll('#screen-sl-ruda .sl-card')].find(x=>/Manzillar/.test(x.innerText));c&&c.scrollIntoView();});await p.screenshot({path:SH+'9_manzil.png'});
await p.evaluate(()=>slSet('ch','line'));await p.waitForTimeout(400);await p.screenshot({path:SH+'10_line.png'});
// nazorat
await p.evaluate(()=>xkCheckOpen());await p.waitForTimeout(300);r=await p.evaluate(()=>$id('xkChk').innerText);
ok(/GPS siz|Muammo topilmadi|nazorati/.test(r),'nazorat: '+r.replace(/\n/g,' ').slice(0,200));await p.screenshot({path:SH+'11_chk.png'});
// sinx: yozuvlar m:xodka: koʻrinishida
r=await p.evaluate(()=>syncLocal().filter(x=>/^m:xodka:/.test(x.id)).length);ok(r===3,'sinx yozuvlari m:xodka: '+r);
await p.evaluate(()=>openScreen('screen-main'));await p.waitForTimeout(300);
r=await p.evaluate(()=>(document.querySelector('[data-sec="mod-salohiyat"]')||{}).innerText||'');ok(/Ishlab chiqarish/.test(r),'bosh sahifa kartasi: '+r);
console.log(errs.slice(0,15).join('\n'));console.log('XATO:',fails,'pageerrors:',errs.length);await b.close();process.exit(fails?1:0);})();
