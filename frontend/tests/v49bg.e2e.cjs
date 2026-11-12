// 4.9 b116: 📣 Bildirgi + dalolatnoma (soxta ismlar): node frontend/tests/v49bg.e2e.cjs <ilova.html>
const { chromium } = require('playwright');
let F=0;const ok=(c,m)=>{console.log((c?'OK   ':'FAIL ')+m);if(!c)F++;};
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:412,height:880}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>d.accept());
await p.goto('file://'+process.argv[2]);await p.waitForTimeout(4500);
const r=await p.evaluate(async()=>{currentUser={tabel:ADMIN_TABEL,name:'Test',role:'admin'};document.body.classList.remove('locked');const W=ms=>new Promise(r=>setTimeout(r,ms));const o={};
 const T=async()=>{const R=await dxRender('bildirgi',bgData());return R.lay.pages.map(x=>x.filter(z=>z.k==='t').map(z=>z.s).join(' ')).join(' || ').replace(/\s+/g,' ');};
 localStorage.removeItem('agmk_bg_list'); openHisob('akt'); await W(300); o.grid=[...document.querySelectorAll('#screen-hisob .hs-card')].some(c=>/bildirgi/.test(c.getAttribute('onclick')||''));
 HS.akt='bildirgi'; hsRender(); await W(300); o.cat=!!document.getElementById('bgCat');
 bgOpen({nos:'2201', vtype:'6ВС-60', kim:{l:"VX boshligʻi",n:'Testov Z.I.'}, mu:{l:"ICHTB boʻyicha muhandis",n:'Sinovov E.E.'}, azo:[{l:"VX boshligʻi",n:'Testov Z.I.'},{l:'VX ustasi',n:'Uchinchiyev U.T.'}], D:[{joy:'Тормоз цилиндри',t:'таъмирланмаган'}]}); await W(900);
 let t=await T(); o.one=/З\.И\. Тестовга/.test(t)&&/№2201 рақамли 6ВС-60 типдаги вагоннинг/.test(t)&&/Тормоз цилиндри – таъмирланмаган/.test(t)&&/Учинчиевлар/.test(t)&&/Синовов Э\.Э\./.test(t)&&t.split('||').length===2;
 o.prevBar=!!($id('bgPrev')._bar);
 BG.cur.nos='24610, 00000468'; BG.cur.D=[{no:'24610',joy:'',t:'тормозной цилиндри таъмирланмаган'},{no:'00000468',joy:'Триангел',t:'2 дона М30 гайкаси мавжуд эмас'}]; t=await T();
 o.many=/№24610 ва 00000468 рақамли/.test(t)&&/вагонларнинг/.test(t)&&/№24610 рақамли вагонда тормозной/.test(t)&&/№00000468 рақамли вагонда триангел – 2 дона/.test(t);
 BG.cur.tur='gildirak'; BG.cur.nos='0029686420'; BG.cur.D=[{joy:'',t:'гребень қалинлиги 36 мм дан юқори'}]; t=await T(); o.gild=/№0029686420 рақамли ғилдирак жуфтлигини қабул қилиш жараёнида/.test(t);
 BG.cur.yoz='lat'; t=await T(); o.lat=/Bildirgi/.test(t)&&/Dalolatnoma/.test(t)&&/Z\.I\. Testov/.test(t)&&!/[А-Яа-я]/.test(t); BG.cur.yoz='cyr';
 BG.cur.xul='b'; t=await T(); o.xulB=/такрорланмаслигини назорат/.test(t);
 const n0=BG.cur.D.length; bgDAdd(); o.add=BG.cur.D.length===n0+1; bgDDel(BG.cur.D.length-1);
 const sw=window.sigSendOpen; let got=null; window.sigSendOpen=async v=>{got=v;}; await bgSign(); window.sigSendOpen=sw; const RR=await dxFromSigHtml(got.html); o.sign=!!RR&&RR.lay.pages.flat().some(z=>z.k==='t'&&/гребень/.test(z.s));
 o.hist=(JSON.parse(localStorage.getItem('agmk_bg_list')||'[]')).length===1;
 o.names=sigNamesFromHtml(got.html).length>=1;
 BG.cur.D=[{no:'',joy:'',t:'birinchi muammo ikkinchi muammo'}]; bgDraw(); await W(100); const ta=$id('bgDT0'); ta.focus(); ta.setSelectionRange(16,16); ta.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true})); await W(200);
 o.enter=BG.cur.D.length===2&&BG.cur.D[0].t==='birinchi muammo'&&BG.cur.D[1].t==='ikkinchi muammo';
 bgDIns(1); o.dash=BG.cur.D.length===3; let t2=await T(); o.paras=(t2.match(/- birinchi muammo/)||[]).length>0;
 const v=onlyVagons()[0]; openPassport(v.id); await W(500); const pb=$id('bgPassB'); o.pass=!!pb; if(pb){ pb.click(); await W(400); o.passNo=BG.cur&&BG.cur.nos===String(vagonNo(v)); }
 return o;});
for(const k in r) ok(r[k],k); ok(!errs.length,'sahifa xatolari yoʻq '+errs.slice(0,2).join(' | '));
console.log(F?`❌ ${F} ta xato`:'✅ hammasi oʻtdi');await b.close();process.exit(F?1:0);})();
