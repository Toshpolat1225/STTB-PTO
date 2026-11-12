// 4.9 b118: imzo chekuvchilar kolodka uslubida — AI/qoʻlda akt va xizmat xati (soxta ismlar): node frontend/tests/v49sg.e2e.cjs <ilova.html>
const { chromium } = require('playwright');
let F=0;const ok=(c,m)=>{console.log((c?'OK   ':'FAIL ')+m);if(!c)F++;};
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:412,height:880}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.argv[2]);await p.waitForTimeout(4500);
const r=await p.evaluate(async()=>{currentUser={tabel:ADMIN_TABEL,name:'Test',role:'admin'};document.body.classList.remove('locked');
 const w=ms=>new Promise(r=>setTimeout(r,ms)),o={};
 hsNewAkt('umumiy'); await w(300); ND.form.com=[]; ND.form.apObj=null; ndRender(); await w(200);
 const q=s=>document.querySelector(s);
 o.ui=!!q('#ndBody .sgk .kq-add') && !q('#ndBody .sg-b1') && !q('#ndBody .nd-chips i[onclick^="ndComAdd"]');
 sgkPick('com',-1); await w(150); $id('kqPL').value='ICHTB boshligʻi'; $id('kqPN').value='Birov B.B.'; kqPickOk(); await w(200);
 sgkPick('com',-1); await w(150); $id('kqPL').value='Usta v.b.'; $id('kqPN').value='Ikkov I.I.'; kqPickOk(); await w(200);
 o.add=ND.form.com.length===2&&ND.form.com[1].m==='vb'&&/Ikkov/.test(document.querySelectorAll('#ndBody .sgk')[1].textContent)&&!!q('#ndBody .sgk .kq-p b');
 sgkUp('com',1); await w(150); o.up=ND.form.com[0].n==='Ikkov I.I.';
 sgkPick('com',0); await w(150); $id('kqPL').value='Usta'; $id('kqPN').value='Uchov U.U.'; kqPickOk(); await w(200); o.edit=ND.form.com[0].n==='Uchov U.U.'&&ND.form.com.length===2;
 sgkDel('com',0); await w(150); o.del=ND.form.com.length===1;
 sgkPick('ap',-1); await w(150); $id('kqPL').value='STTB bosh muhandisi'; $id('kqPN').value='Testov A.A.'; kqPickOk(); await w(200); o.ap=ND.form.apObj&&ND.form.apObj.n==='Testov A.A.'&&/Testov/.test(q('#ndBody .sgk').textContent);
 sgkTplList('com'); await w(100); const it=document.querySelector('#sgkTplM .sg-opt'); const n0=ND.form.com.length; if(it) it.click(); await w(200); o.tpl=!it||ND.form.com.length===n0+1;
 o.old=['sgTpl','sgMan','sgShtat','ndComAdd','ndApSet','sgRowsHtml'].every(f=>typeof window[f]==='function');
 // xizmat xati
 try{ narVtNew(); await w(200); const h=narVtFormHtml(); o.vt=/class="sgk"/.test(h)&&/Imzo chekuvchini qoʻshish/.test(h)&&!/sg-b1/.test(h); }catch(e){o.vt='ERR '+e.message;}
 return o;});
ok(r.ui,'Akt: kolodka kartochkalari, eski «Shablon/Qoʻlda» tugmalari va chiplar yoʻq');ok(r.add,'➕ Komissiya aʼzosini qoʻshish (v.b. belgilanadi)');ok(r.up,'▲ yuqoriga');ok(r.edit,'✎ qayta tanlash');ok(r.del,'✕ olib tashlash');
ok(r.ap,'Tasdiqlovchi rahbar tanlash');ok(r.tpl,'📋 Shablondan qoʻshish');ok(r.old,'Eski funksiyalar saqlangan');ok(r.vt===true,'Xizmat xati: kartochkalar '+(r.vt===true?'':r.vt));
ok(!errs.length,'Sahifa xatolari yoʻq '+errs.slice(0,2).join(' | '));
console.log(F?`❌ ${F} ta xato`:'✅ hammasi oʻtdi');await b.close();process.exit(F?1:0);})();
