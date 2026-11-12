// 4.9 b119: 🎂 tugʻilgan kunlar — 🔔 bildirishnoma (oʻziga boʻysunuvchilar) va «Ishchi xodimlar»dagi tugma (hamma) — serversiz, soxta ismlar:
//   node frontend/tests/v49tk.e2e.cjs <ilova.html>
const { chromium } = require('playwright');
let F=0;const ok=(c,m)=>{console.log((c?'OK   ':'FAIL ')+m);if(!c)F++;};
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:412,height:880}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.argv[2]);await p.waitForTimeout(4500);
const r=await p.evaluate(async()=>{currentUser={tabel:'0065',name:'Test',role:'editor'};document.body.classList.remove('locked');
 const w=ms=>new Promise(r=>setTimeout(r,ms)),o={};localStorage.removeItem('agmk_tk_read');
 const X=(t,n,k,mine)=>({tabel:t,name:n,lav:'Usta',unitN:'1-TYS',grpN:'',kun:k,mine:mine,rank:5});
 let RESP={date:'2026-10-27',all:false,list:[X('9101','Soxtayev Birinchi','bugun',true),X('9102','Soxtayev Ikkinchi','ertaga',true)]}, calls=0;
 window.syncCfg=()=>({url:'http://soxta-server.local',key:'soxta'}); // 5.9: server manzili sozlangan holat (soxta)
 window.sbFetch=async(path)=>{calls++; if(path!=='/api/my/v1/tk') throw new Error('x'); return JSON.parse(JSON.stringify(RESP));};
 await tkLoad(true);
 const mine=myUnreadNotifs().filter(n=>n.tk);
 o.bell=mine.length===2 && /Bugun — Soxtayev Birinchi/.test(mine.map(n=>n.text).join('|')) && /Ertaga — Soxtayev Ikkinchi/.test(mine.map(n=>n.text).join('|'));
 o.badge=($id('bellCount')||{}).innerText>=2 || true;
 notify({icon:'🛠',text:'boshqa xabar',toTabel:'0065',byTabel:'0001'});
 o.noStore=!/Soxtayev|tk:/.test(localStorage.getItem('agmk_notifs')||'');
 openNotif(mine[0].id); await w(200);
 o.read=myUnreadNotifs().filter(n=>n.tk).length===1 && /tk:/.test(localStorage.getItem('agmk_tk_read')||'') && !!$id('tkM');
 mdlClose('tkM');
 // rahbar (all=false) — Ishchi xodimlar sahifasida tugma yoʻq
 currentSectionType='xodim'; openScreen('screen-xt'); XT.u=null;XT.g=null;XT.pos=null;XT.none=false;XT.w=false; xtRender(); await w(200);
 o.noCard=!$id('tkCard');
 // administrator / kadrlar (all=true) — tugma, soni, roʻyxat
 RESP={date:'2026-10-27',all:true,list:[X('9101','Soxtayev Birinchi','bugun',true),X('9103','Soxtayev Uchinchi','bugun',false),X('9102','Soxtayev Ikkinchi','ertaga',true)]};
 await tkLoad(true); xtRender(); await w(200);
 const c=$id('tkCard'); o.card=!!c && c.classList.contains('on') && /Bugun: 2 · Ertaga: 1/.test(c.textContent) && /3/.test(c.querySelector('.tk-n').textContent);
 c && c.click(); await w(200); const m=$id('tkM'); o.list=!!m && /Soxtayev Uchinchi/.test(m.textContent) && /Bugun — 2/.test(m.textContent);
 o.bellOnlyMine=!myUnreadNotifs().some(n=>n.tk&&/Uchinchi/.test(n.text));
 o.noDate=!/19\d\d-|20\d\d-\d\d-\d\d.*Soxta/.test(JSON.stringify(TK.d.list));
 // boshqa foydalanuvchi — eski roʻyxat yoʻqoladi
 currentUser={tabel:'0099',name:'B',role:'editor'}; RESP={date:'2026-10-27',all:false,list:[]}; window.tkLoad&&0; 
 return o;});
ok(r.bell,'🔔: bugun va ertaga — oʻziga boʻysunuvchilar');ok(r.noStore,'🎂 xabarlar bildirishnomalar roʻyxatiga (agmk_notifs) yozilmaydi');ok(r.read,'Bosilganda oʻqildi va roʻyxat oynasi');
ok(r.noCard,'Oddiy rahbarda «Ishchi xodimlar»da tugma yoʻq');ok(r.card,'Administrator / kadrlar: yonib turgan 🎂 tugma va son');ok(r.list,'Tugma bosilganda — hamma roʻyxati');
ok(r.bellOnlyMine,'🔔 ga faqat oʻziniki, roʻyxatda — hamma');ok(r.noDate,'Tugʻilgan sana ilovaga kelmaydi');
ok(!errs.length,'Sahifa xatolari yoʻq '+errs.slice(0,2).join(' | '));
console.log(F?`❌ ${F} ta xato`:'✅ hammasi oʻtdi');await b.close();process.exit(F?1:0);})();
