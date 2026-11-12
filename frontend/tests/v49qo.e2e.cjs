// 4.9 b113: akt avval qoʻlda; AI — ⋮ ichida; kolodka ⋮ → AI yordamida toʻldirish: node frontend/tests/v49qo.e2e.cjs <ilova.html>
const { chromium } = require('playwright');
let F=0;const ok=(c,m)=>{console.log((c?'OK   ':'FAIL ')+m);if(!c)F++;};
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:412,height:880}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>d.dismiss());
await p.goto('file://'+process.argv[2]);await p.waitForTimeout(4500);
const r=await p.evaluate(async()=>{currentUser={tabel:ADMIN_TABEL,name:'Test',role:'admin'};document.body.classList.remove('locked');const o={};const W=ms=>new Promise(r=>setTimeout(r,ms));
 try{localStorage.setItem('agmk_akt_mode','ai');}catch(e){}
 openHisob('akt'); HS.akt='kolodka'; hsRender(); await W(600);
 const card=document.querySelector('#screen-hisob .hs-new .db-two'); o.cardMan=!!card&&/man/.test(card.getAttribute('onclick')||'')&&!card.querySelector('.h9-tb');
 card.click(); await W(700);
 o.manual=ND.form&&ND.form.mode==='man'&&!!$id('dbMT'); const dm=document.querySelector('#screen-nd .db-mode'); o.toggleHidden=!dm||getComputedStyle(dm).display==='none';
 const s=document.getElementById('screen-nd'); let L=h9MoreItems(s); o.menuAi=L.some(x=>/AI yordamida tuzish/.test(x.t));
 L.find(x=>/AI yordamida tuzish/.test(x.t)).fn(); await W(500); o.ai=ND.form.mode==='ai'; L=h9MoreItems(s); o.menuMan=L.some(x=>/Qoʻlda kiritish/.test(x.t));
 L.find(x=>/Qoʻlda kiritish/.test(x.t)).fn(); await W(300); o.back=ND.form.mode==='man';
 hsNewAkt('umumiy'); await W(500); o.newMan=ND.form.mode==='man';
 openHisob('akt'); HS.akt='kolodka'; hsRender(); await W(400); document.querySelector('#screen-hisob .hs-new .db-two').click(); await W(600);
 ndGoBack(); await W(400); o.backHisob=$id('screen-hisob').classList.contains('active')&&HS.akt==='kolodka';
 openND('home'); await W(300); ndOpenAkt(); await W(300); ndGoBack(); await W(300); o.backNd=$id('screen-nd').classList.contains('active')&&ND.view==='home';
 kqOpen(); await W(300); o.kqMo=!!document.querySelector('#kqModal .kq-mo'); qoKqAi(); await W(100); o.panel=!!$id('qoAi');
 $id('qoAiT').value='«SINOV TEXNIKA» MCHJ dan 1500 dona M659.000 kolodka 12.11.2026 qabul qilindi, GOST 33421-2015'; qoKqGo(); await W(400);
 o.fill=KQ.org==='«SINOV TEXNIKA» MCHJ'&&KQ.soni==='1500'&&KQ.marka==='M659.000'&&KQ.gost==='GOST 33421-2015'&&KQ.sana==='2026-11-12';
 o.inputs=[...document.querySelectorAll('#kqModal input')].some(i=>i.value==='1500');
 const q=qoParse('TOP PROJECT MCHJ dan 2035 dona keldi 24-oktabr'); o.parse2=q.org==='«TOP PROJECT» MCHJ'&&q.soni==='2035'&&/-10-24$/.test(q.sana||'');
 return o;});
for(const k in r) ok(r[k],k); ok(!errs.length,'sahifa xatolari yoʻq '+errs.slice(0,2).join(' | '));
console.log(F?`❌ ${F} ta xato`:'✅ hammasi oʻtdi');await b.close();process.exit(F?1:0);})();
