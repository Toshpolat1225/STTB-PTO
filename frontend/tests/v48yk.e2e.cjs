// 4.8: Yuklash — ustunlar tartibi (standart oʻrin, ≡ sudrash, eslab qolish): node frontend/tests/v48yk.e2e.cjs <ilova.html>
const { chromium } = require('playwright');
let F=0;const ok=(c,m)=>{console.log((c?'OK   ':'FAIL ')+m);if(!c)F++;};
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:412,height:880},deviceScaleFactor:2})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.argv[2]);await p.waitForTimeout(4500);
await p.evaluate(()=>{currentUser={tabel:ADMIN_TABEL,name:'Test',role:'admin'};document.body.classList.remove('locked');try{localStorage.removeItem('agmk_yk_cols_screen-vagonlar')}catch(e){}ykOpen('screen-vagonlar');});await p.waitForTimeout(300);
let r=await p.evaluate(()=>{ykPre('Kartoteka');const a=YKS.cols.slice();ykCol('kr');const b=YKS.cols.slice();ykCol('st');ykCol('kr');return {a,b,c:YKS.cols.slice()};});
ok(r.a.join()==='n,no,inv,ty,model,seh,dr,kr,next,nextkr','Kartoteka: DR, KR, keyingi DR, keyingi KR ketma-ket: '+r.a.join());
ok(r.c.indexOf('kr')===r.c.indexOf('dr')+1,'qayta belgilangan KR oʻz joyiga: '+r.c.join());
await p.evaluate(()=>{ykMv(0,1);});
const h=await p.$$('#ykOrd .yk-dh');const s=await h[5].boundingBox();const t=await (await p.$$('#ykOrd .yk-o'))[1].boundingBox();
await h[5].scrollIntoViewIfNeeded();const s2=await h[5].boundingBox();const t2=await (await p.$$('#ykOrd .yk-o'))[1].boundingBox();
await p.mouse.move(s2.x+s2.width/2,s2.y+s2.height/2);await p.mouse.down();await p.mouse.move(s2.x+5,t2.y+3,{steps:8});await p.mouse.up();await p.waitForTimeout(200);
r=await p.evaluate(()=>({c:YKS.cols.slice(),saved:JSON.parse(localStorage.getItem('agmk_yk_cols_screen-vagonlar'))}));
ok(r.c[1]!=='n'&&r.c.length>6&&JSON.stringify(r.c)===JSON.stringify(r.saved),'sudrab koʻchirildi va eslab qolindi: '+r.c.join());
await p.evaluate(()=>{ykStd();});r=await p.evaluate(()=>YKS.cols.slice());ok(r[0]==='n'&&r[1]==='no','↺ Standart tartib: '+r.join());
await p.evaluate(()=>{mdlClose('ykM');ykOpen('screen-vagonlar');});r=await p.evaluate(()=>YKS.cols.slice());ok(r.includes('st'),'qayta ochilganda saqlangan tanlov: '+r.join());
await p.evaluate(()=>{const e=document.getElementById('ykOrd');e.scrollIntoView();});await p.screenshot({path:(process.env.AGMK_SHOT_DIR||'/tmp')+'/v48_yk.png'});
console.log('err',errs);await b.close();process.exit(F||errs.length?1:0);})();
