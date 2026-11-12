// 4.9 b117: hujjat tili — lotin / kirill / rus (soxta ismlar): node frontend/tests/v49til.e2e.cjs <ilova.html>
const { chromium } = require('playwright');
let F=0;const ok=(c,m)=>{console.log((c?'OK   ':'FAIL ')+m);if(!c)F++;};
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:412,height:880}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>d.accept());
await p.goto('file://'+process.argv[2]);await p.waitForTimeout(4500);
const r=await p.evaluate(async()=>{currentUser={tabel:ADMIN_TABEL,name:'Test',role:'admin'};document.body.classList.remove('locked');const W=ms=>new Promise(r=>setTimeout(r,ms));const o={};
 const T=async(id,d)=>{const R=await dxRender(id,d);return R.lay.pages.map(x=>x.filter(z=>z.k==='t').map(z=>z.s).join(' ')).join(' ').replace(/\s+/g,' ');};
 kqOpen(); o.kqBar=!!$id('tlKq'); Object.assign(KQ,{org:'«SINOV» MCHJ',soni:'100',sana:'2026-10-20',tas:{l:'STTB bosh muhandisi',n:'Valiyev A.A.'},azo:[{l:"ICHTB boshligʻi",n:'Karimov S.I.'},{l:"ICHTB temir yoʻl harakat tarkibi I-toifali muhandisi v.b.",n:'Soliyev B.B.'}]});
 KQ.til='uz'; let t=await T(await kqTpl(),kqData()); o.uz=/TASDIQLAYMAN/.test(t)&&/Biz quyida/.test(t);
 KQ.til='uzc'; t=await T(await kqTpl(),kqData()); o.uzc=/ТАСДИҚЛАЙМАН/.test(t)&&/Биз қуйида имзо чекувчилар/.test(t)&&/Каримов С\.И\./.test(t)&&/«SINOV» МЧЖ/.test(t)&&/ГОСТ 33421-2015/.test(t)&&!/[a-z]{4}/.test(t.replace(/«[^»]*»/g,''));
 KQ.til='ru'; t=await T(await kqTpl(),kqData()); o.ru=/УТВЕРЖДАЮ/.test(t)&&/Главный инженер УПЖТ/.test(t)&&/Мы, нижеподписавшиеся/.test(t)&&/начальник ПТО Каримов С\.И\./.test(t)&&/и\.о\. инженера I категории по подвижному составу ПТО/.test(t)&&/ООО «SINOV»/.test(t)&&/октября 2026 г\./.test(t)&&/Заключение/.test(t);
 // tahrir kirillda ham ishlaydi
 KQ.til='uzc'; await kqPrev(); await W(300); $id('kqPrev')._bar.querySelector('[data-a="e"]').click(); await W(800); const ps=[...document.querySelectorAll('#edModal .ed-p[contenteditable]')]; const x=ps.find(d=>/^Хулоса/.test(d.innerText)); if(x){x.innerText=x.innerText.replace('соз ҳолатда','соз ва яроқли ҳолатда'); edSave(); await W(600);} t=await T(await kqTpl(),kqData()); o.edCyr=/соз ва яроқли ҳолатда/.test(t); delete KQ._ed;
 const ns={type:'nosoz',zav:'5555',model:'2VS-105',date:'2026-10-24',sg:CX_NOSOZ_SG.map(x=>x.slice()),defects:'Rama yorilgan'};
 ns.til='ru'; t=await T(cxDxId(ns),cxDxData(ns)); o.nsRu=/УТВЕРЖДАЮ/.test(t)&&/АКТ/.test(t)&&/Мы, нижеподписавшиеся/.test(t)&&/Заключение/.test(t)&&/2ВС-105/.test(t);
 ns.til='uzc'; t=await T(cxDxId(ns),cxDxData(ns)); o.nsUzc=/ДАЛОЛАТНОМА/.test(t)&&/Хулоса/.test(t);
 ns.til='ru'; ns.ks={ap:[{l:'Главный инженер УПЖТ',n:'Тестов Т.Т.'}]}; t=await T(cxDxId(ns),cxDxData(ns)); o.nsKs=/Т\.Т\. Тестов/.test(t)&&!/Абдирашидов/.test(t);
 bgOpen({nos:'2201',vtype:'6ВС-60',kim:{l:"VX boshligʻi",n:'Testov Z.I.'},mu:{l:"ICHTB boʻyicha muhandis",n:'Sinovov E.E.'},azo:[{l:"VX boshligʻi",n:'Testov Z.I.'}],D:[{joy:'Тормоз цилиндри',t:'не отремонтирован'}]}); await W(300);
 BG.cur.yoz='ru'; t=await T('bildirgi',bgData()); o.bgRu=/Начальнику ВС/.test(t)&&/З\.И\. Тестову/.test(t)&&/Докладная записка/.test(t)&&/Тормозной цилиндр – не отремонтирован/.test(t)&&/Мы, нижеподписавшиеся/.test(t);
 hsNewAkt('umumiy'); await W(300); ND.html='<p>Biz quyida imzo chekuvchilar: ICHTB boshligʻi Karimov S., kolodka yorildi.</p>'; ndRender(); await W(300); tlNdCyr(true); await W(300); o.ndCyr=/Биз қуйида имзо чекувчилар/.test($id('ndPage').textContent)&&!!document.querySelector('#screen-nd .tl-cyr');
 o.l2c=tlL2C('eksplutatsiya, avtostsepka, tsilindr, 1-TYSda, yoʻl, oʻtkazildi, ketsa')==='эксплутация, автосцепка, цилиндр, 1-ТЙЦда, йўл, ўтказилди, кетса';
 openScreen('screen-vagonlar'); ykOpen('screen-vagonlar'); await W(300); o.ykBar=!!$id('tlYk'); const A=ykAll().slice(0,2); YKS.til='ru'; let R=ykRows(A); o.ykRu=R[0][0]==='№ п/п'&&R[0].includes('Номер'); YKS.til='uzc'; R=ykRows(A); o.ykUzc=/[А-Яа-я]/.test(R[0].join(' ')); YKS.til='uz'; mdlClose('ykM');
 return o;});
for(const k in r) ok(r[k],k); ok(!errs.length,'sahifa xatolari yoʻq '+errs.slice(0,2).join(' | '));
console.log(F?`❌ ${F} ta xato`:'✅ hammasi oʻtdi');await b.close();process.exit(F?1:0);})();
