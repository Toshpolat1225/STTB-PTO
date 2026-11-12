// 4.9 b112: aktlar — yakuniy tekshiruv (soxta ismlar): node frontend/tests/v49akt.e2e.cjs <ilova.html>
const { chromium } = require('playwright');
let F=0;const ok=(c,m)=>{console.log((c?'OK   ':'FAIL ')+m);if(!c)F++;};
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:412,height:880}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.argv[2]);await p.waitForTimeout(4500);
const r=await p.evaluate(()=>{const o={};
 const h=`<div class="a-approve">“TASDIQLAYMAN”<br>Bosh muhandis<br>____ A.A.Valiyev<br>«__» ____ 2026-y.</div><p class="a-ctr">o‘tkazilgan sinov to‘g‘risida</p><div class="a-title">Дефектный акт<br>Вагон №</div>
 <p>Biz quyida imzo chekuvchilar, ICHTB boshlig‘i S.Karimov, muhandis B.B. Soliyev, ushbu dalolatnomani tuzdik.</p><p>Biz quyida imzo chekuvchilar, 2026-yilning 1 noyabr kuni 32 dona kolodka vagonlarga o‘rnatildi haqida ushbu dalolatnomani tuzdik.</p>
 <p>1. Geometrik o‘lchamlari GOST 33421-2015 ga mos (GOST 33421-2015 talablariga muvofiq).</p><p>- Yorildi (33421-2015-sonli «Talablar»ning 8-jadvali).</p>
 <p>Aniqlangan nuqsonlar … Komissiya belgilangan tartibda yetkazib beruvchi (ishlab chiqaruvchi)ga da'vo (reklamatsiya) bildirishni lozim deb topdi.</p>
 <p>Мы, нижеподписавшиеся, комиссия в составе: Начальник УПЖТ Тестов А.А., И.о. главного механика Пробов Б.Б. составили настоящий акт о том, что в результате осмотра вагон зав. № было выявлено следующее:</p>
 <p>- Срок службы [протокол от «20» ноября (год уточнить) № 59; №310 (уточнить наименование документа)];</p>
 <table class="a-sign"><tr><td class="l">ICHTB boshlig‘i</td><td class="m"></td><td class="r">S.Karimov</td></tr></table>`;
 const x=aktFix(h,'yorildi'), t=(()=>{const d=document.createElement('div');d.innerHTML=x;return d.innerText;})();
 o.name=/Valiyev A\.A\./.test(t)&&/Karimov S\./.test(t)&&/Soliyev B\.B\./.test(t)&&!/S\.Karimov/.test(t);
 o.colon=/imzo chekuvchilar: ICHTB/.test(t); o.orn=/o‘rnatilganligi haqida/.test(t);
 o.gost=/GOST 33421-2015 «Talablar»/.test(t)&&!/talablariga muvofiq/.test(t);
 o.rek=!/reklamatsiya/.test(t); o.rekOwn=/reklamatsiya/.test(aktFix(h,'reklamatsiya bildirilsin'));
 o.ru=/в составе: начальник УПЖТ Тестов А\.А\., и\.о\. главного/.test(t)&&/осмотра вагона зав\. № ______ было/.test(t)&&/Вагон № ______/.test(t);
 o.ph=!/уточнить|aniqlang/.test(t); o.title=/O‘tkazilgan sinov/.test(t);
 o.idem=aktFix(x,'yorildi')===x; return o;});
for (const k in r) ok(r[k], k); ok(!errs.length,'sahifa xatolari yoʻq');
console.log(F?`❌ ${F} ta xato`:'✅ hammasi oʻtdi');await b.close();process.exit(F?1:0);})();
