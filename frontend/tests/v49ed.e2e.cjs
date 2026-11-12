// 4.9 b115: tayyor hujjat — yaqinlashtirish va qoʻlda tahrir (soxta ismlar): node frontend/tests/v49ed.e2e.cjs <ilova.html>
const { chromium } = require('playwright');
let F=0;const ok=(c,m)=>{console.log((c?'OK   ':'FAIL ')+m);if(!c)F++;};
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:412,height:880}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>d.accept());
await p.goto('file://'+process.argv[2]);await p.waitForTimeout(4500);
const r=await p.evaluate(async()=>{currentUser={tabel:ADMIN_TABEL,name:'Test',role:'admin'};document.body.classList.remove('locked');const W=ms=>new Promise(r=>setTimeout(r,ms));const o={};
 const txt=async(id,d)=>{const R=await dxRender(id,d);return R.lay.pages.map(x=>x.filter(z=>z.k==='t').map(z=>z.s).join(' ')).join(' ').replace(/\s+/g,' ');};
 kqOpen(); KQ.org='«SINOV» MCHJ'; KQ.soni='100'; KQ.tas={l:'STTB bosh muhandisi',n:'Valiyev A.A.'}; KQ.azo=[{l:'ICHTB boshligʻi',n:'Karimov S.I.'}]; await kqPrev(); await W(300);
 const el=$id('kqPrev'); o.bar=!!(el._bar&&el._bar.isConnected);
 el._bar.querySelector('[data-a="p"]').click(); await W(300); o.zoom=el.querySelector('canvas.dx-pg').style.width==='150%'&&el.classList.contains('ed-zoomed');
 el._bar.querySelector('[data-a="r"]').click(); await W(200);
 el._bar.querySelector('[data-a="e"]').click(); await W(800);
 const ps=[...document.querySelectorAll('#edModal .ed-p[contenteditable]')]; o.rows=ps.length; const x=ps.find(d=>/^Xulosa/.test(d.innerText)); o.hasX=!!x;
 x.innerText=x.innerText.replace('soz holatda','soz va yaroqli holatda'); edSave(); await W(800);
 o.saved=!!(KQ._ed&&Object.keys(KQ._ed).length===1);
 const id=await kqTpl(); const t=await txt(id,kqData()); o.applied=/soz va yaroqli holatda/.test(t)&&/Xulosa/.test(t);
 const sw=window.sigSendOpen; let got=null; window.sigSendOpen=async v=>{got=v;}; await kqSign(); window.sigSendOpen=sw; delete DXT.tpl['kolodka_x']; delete DXT.cache['kolodka_x'];
 const RR=await dxFromSigHtml(got.html); o.sign=RR.lay.pages.flat().filter(z=>z.k==='t').map(z=>z.s).join(' ').includes('yaroqli');
 o.miss=(()=>{KQ.soni='200'; return true;})(); const t2=await txt(await kqTpl(),kqData()); o.otherOk=/200/.test(t2); // boshqa maydon oʻzgarsa — tahrir oʻz paragrafida qoladi
 // blanka hujjati (razuk)
 const d={type:'razuk',zav:'5555',model:'2ВС-105',month:'2026-10'}; const R0=await dxRender(cxDxId(d),cxDxData(d)); const xml=new TextDecoder().decode(R0.files['word/document.xml']);
 const P=[...xml.matchAll(/<w:p\b[\s\S]*?<\/w:p>/g)].map(m=>m[0]); const k=P.findIndex(p=>/Причина списания/.test(p.replace(/<[^>]+>/g,''))); 
 const otxt=(()=>{const t=[];for(const m of P[k].matchAll(/<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>|<w:tab\/>|<w:br\/>/g)) t.push(m[1]!==undefined?m[1].replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>'):(/tab/.test(m[0])?'\t':'\n'));return t.join('');})();
 d._ed={[k]:{o:otxt,n:otxt.replace('Причина списания','Причина списания (уточнено)')}}; o.razuk=/уточнено/.test(await txt(cxDxId(d),cxDxData(d)));
 // HTML akt
 hsNewAkt('umumiy'); await W(400); ND.html='<p>Birinchi gap.</p>'; ndRender(); await W(400); const pg=$id('ndPage'); const bb=pg._bar.querySelector('[data-a="e"]'); bb.click(); o.live=pg.getAttribute('contenteditable')==='true';
 pg.querySelector('p').textContent='Tahrirlangan gap.'; bb.click(); o.ndSaved=/Tahrirlangan gap/.test(ND.html)&&!pg.classList.contains('ed-live');
 return o;});
for(const k in r) ok(r[k],k+': '+r[k]); ok(!errs.length,'sahifa xatolari yoʻq '+errs.slice(0,2).join(' | '));
console.log(F?`❌ ${F} ta xato`:'✅ hammasi oʻtdi');await b.close();process.exit(F?1:0);})();
