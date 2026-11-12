        //  • Yillik va oylik grafik — har vagon pasportidagi «Keyingi taʼmir sanasi» dan; Excel shart emas, hamma telefonda bir xil (pasportlar sinxron)
        //  • Boʻlimlar namunadagidek: joy (VX / 2-TYS) × vagon turi × DR/KR — oylik jadval (31-17-18) xuddi shu shaklda chiqadi
        //  • Taʼmirga yuborilgan vagon — yuborilgan oyda, izoh bilan («Dekabrdan koʻchirildi: nosozlik …»), eski oyida «→ oktyabrga» belgisi
        //  • Taʼmirdan chiqqan — chiqqan oyida «✓ bajarildi»; grafikda boshqa oyga surilsa — pasportdagi keyingi taʼmir sanasi ham oʻzgaradi
        var VG = { on: false, mode: 'auto', d: null, y: 0 };
        var VG_LOG = 'agmk_vg_log';
        try { if (typeof KV_SYNC !== 'undefined' && !KV_SYNC.keys.includes(VG_LOG)) KV_SYNC.keys.push(VG_LOG); } catch (e) {}
        function vgType(v) { const t = String(v.type || '').toLowerCase(); if (/105|115/.test(t)) return '105'; if (/\b60\b|-60/.test(t)) return '60'; if (/platf/.test(t)) return 'plat'; if (/xopper|hopper|хоппер/.test(t)) return 'hop'; if (/cist|sist|цист/.test(t)) return 'cis'; return 'boshqa'; }
        function vgPlace(v, ty) { return (ty === 'plat' || ty === 'cis') && /ЖДЦ-?2|TYS-?2/i.test(String(v.seh || '')) ? '2-TYS' : 'VX'; }
        var VG_TT = { '105': '2VS-105 tipidagi vagonlarning', '115': 'dumpkar 115 tipidagi vagonlarning', '60': '6VS-60 tipidagi vagonlarning', plat: 'platformalarning', hop: 'xopper-dozatorlarning', cis: 'sisternalarning', boshqa: 'boshqa vagonlarning' };
        function vgTitle(place, ty, rt) { const k = place + '|' + ty + '|' + rt; if (typeof PPR47_T !== 'undefined' && PPR47_T[k]) return PPR47_T[k]; return (place === 'VX' ? 'Vagon Xizmatida ' : place + ' da ') + VG_TT[ty] + (rt === 'KR' ? " kapital ta'miri" : " depo ta'miri"); }
        function vgOutEv(v) { return (v.history || []).filter(h => h.ev === 'out' || (h.src === 'dv' && /yakunlandi/.test(String(h.type || '')))).map(h => ({ d: polD(h.date), rt: h.rt || (/KR|Kapital/.test(String(h.type)) ? 'KR' : 'DR') })).filter(x => x.d).filter((x, i, A) => A.findIndex(y => y.d === x.d) === i); }
        function vgBuild(year) {
            const d = { year: year, auto: 1, secs: [], mon: {}, log: (kvGet(VG_LOG, []) || []) }, idx = {}, cur = pprCurM();
            const sec = (place, ty, rt) => { const k = place + '|' + ty + '|' + rt; if (idx[k] === undefined) { idx[k] = d.secs.length; d.secs.push({ place: place, key: k, kind: 'list', title: vgTitle(place, ty, rt), cells: Array.from({ length: 12 }, () => []) }); } return idx[k]; };
            const put = (m, si, x) => { if (+m.slice(0, 4) !== year) return; d.mon[m] = d.mon[m] || {}; (d.mon[m][si] = d.mon[m][si] || []).push(x); };
            // tartib: VX avval, keyin 2-TYS; turlar namunadagidek
            // 5.2: namunadagidek — avval kapital taʼmirlar (KR), keyin depo taʼmirlari (DR)
            ['VX', '2-TYS'].forEach(pl => ['KR', 'DR'].forEach(rt => ['105', '60', 'hop', 'cis', 'plat', 'boshqa'].forEach(ty => { if (pl === '2-TYS' && !(ty === 'plat' || ty === 'cis')) return; if (pl === '2-TYS' && rt === 'KR') return; sec(pl, ty, rt); })));
            onlyVagons().forEach(v => {
                const no = vagonNo(v), ty = vgType(v), pl = vgPlace(v, ty), st = vtStage(v), P = v.pol || {}, km = typeof pgKmOf === 'function' ? pgKmOf(v) : 0;
                // v4.3: «ikki soat — bitta reja» — probeg (km) meʼyori pasportdagi sanadan oldin tugasa, taʼmir oldinga suriladi
                let plan = String(v.keyingi || '').slice(0, 7), prt = 'DR', pnote = '';
                const pd = typeof pgDue === 'function' && !st ? pgDue(v) : null;
                // rejani odam oʻzi qoʻygan boʻlsa (surish / «Rejani taqsimlash») — oʻsha qaror saqlanadi, faqat belgi qoʻyiladi
                const vx: any = v, own = !!plan && ((vx.vgMove && vx.vgMove.to === plan) || (vx.vrPlan && vx.vrPlan.m === plan));
                if (pd && (!plan || pd.m <= plan)) { if (own) pnote = pd.note + ' — reja qoʻlda qoʻyilgan'; else { plan = pd.m < cur ? cur : pd.m; prt = pd.rt; pnote = pd.note; } }
                const outs = vgOutEv(v).filter(o => o.d.slice(0, 4) === String(year));
                outs.forEach(o => { const m = o.d.slice(0, 7); put(m, sec(pl, ty, o.rt === 'KR' ? 'KR' : 'DR'), { v: no, vid: v.id, done: { d: o.d, by: 'pasport' }, st: 'done' }); });
                if (st) { // taʼmirda (yuborilgan / navbatda / taʼmirda)
                    const m = String(P.since || todayISO()).slice(0, 7), rt = P.rt === 'KR' ? 'KR' : 'DR', from = P.from || (plan > m ? plan : '');
                    const note = from ? vtMonName(from) + 'dan koʻchirildi: nosozlik' + (P.why ? ' (' + P.why + ')' : '') + ', ' + fmtISO(String(P.since || '').slice(0, 10) || todayISO()) : (P.why ? 'nosozlik: ' + P.why : '');
                    put(m, sec(pl, ty, rt), { v: no, vid: v.id, note: note, st: st });
                    if (from && from !== m) put(from, sec(pl, ty, 'DR'), { v: no, vid: v.id, ghost: { to: m, at: (P.sent && P.sent.at) || P.at, by: (P.sent && P.sent.by) || P.by }, st: st, note: 'nosozlik' + (P.why ? ': ' + P.why : '') });
                    return;
                }
                // 5.2: KR va DR — tanlangan qoida boʻyicha (mod/v52kr.ts: vgPlans); boʻlmasa — avvalgidek bitta DR reja
                const plans: any[] = typeof (window as any).vgPlans === 'function' ? (window as any).vgPlans(v, { plan: plan, prt: prt, note: pnote, own: own, cur: cur, km: km }) : (plan ? [{ m: plan, rt: prt, note: pnote }] : []);
                plans.forEach((p: any) => {
                    if (!p || !p.m) return;
                    if (outs.some(o => o.d.slice(0, 7) === p.m && (o.rt === 'KR' ? 'KR' : 'DR') === p.rt)) return; // shu oyda bajarilgan — yuqorida «✓»
                    const mv = p.rt === 'DR' && v.vgMove && v.vgMove.to === p.m ? v.vgMove : null;
                    put(p.m, sec(pl, ty, p.rt === 'KR' ? 'KR' : 'DR'), { v: no, vid: v.id, km: p.km != null ? p.km : km, rule: p.rule || '', st: p.m < cur ? 'late' : '', note: p.note || (mv ? vtMonName(mv.from) + 'dan surildi' + (mv.why ? ': ' + mv.why : '') : (p.m < cur ? 'bajarilmagan' : '')) });
                    if (mv && mv.from && mv.from !== p.m) put(mv.from, sec(pl, ty, 'DR'), { v: no, vid: v.id, ghost: { to: p.m, at: mv.at, by: mv.by }, note: mv.why || 'surildi' });
                });
            });
            // v4.3: har oyda — eng koʻp yurgan (km) vagonlar birinchi
            Object.values(d.mon).forEach(M => Object.values(M).forEach(L => L.sort((a, b) => (a.ghost ? 1 : 0) - (b.ghost ? 1 : 0) || (b.km || 0) - (a.km || 0) || String(a.v).localeCompare(String(b.v), undefined, { numeric: true }))));
            // boʻsh boʻlimlarni olib tashlash (yil boʻyi bitta ham vagon yoʻq)
            const used = new Set(); Object.values(d.mon).forEach(M => Object.keys(M).forEach(si => { if (M[si].length) used.add(+si); }));
            const keep = d.secs.map((s, i) => i).filter(i => used.has(i)), map = {}; keep.forEach((i, n) => map[i] = n);
            const mon2 = {}; Object.keys(d.mon).forEach(m => { mon2[m] = {}; Object.keys(d.mon[m]).forEach(si => { if (map[si] !== undefined) mon2[m][map[si]] = d.mon[m][si]; }); });
            d.secs = keep.map(i => d.secs[i]); d.mon = mon2;
            // har oy uchun hamma boʻlim (boʻsh boʻlsa ham []) — pprList oy kesimini olishi uchun
            for (let k = 0; k < 12; k++) { const m = year + '-' + String(k + 1).padStart(2, '0'); d.mon[m] = d.mon[m] || {}; d.secs.forEach((s, i) => { d.mon[m][i] = d.mon[m][i] || []; }); }
            return d;
        }
        function vgD() { const y = +String(PPRV.m || pprCurM()).slice(0, 4); if (!VG.d || VG.y !== y || VG.stale) { VG.d = vgBuild(y); VG.y = y; VG.stale = false; } return VG.d; }
        // pprDB: avtomatik rejim ochiq boʻlsa — pasportlardan tuzilgan grafik (saqlanmaydi)
        if (typeof pprDB === 'function') pprDB = agmkExtend('pprDB', 'v3.16: pasportlardan', pprDB, o => function () { if (VG.on) return vgD(); return o.apply(this, arguments); });
        if (typeof pprSave === 'function') pprSave = agmkExtend('pprSave', 'v3.16: avtomatik grafik saqlanmaydi', pprSave, o => function (d) { if (d && d.auto) return; return o.apply(this, arguments); });
        // Surish: avtomatik rejimda — pasportdagi «keyingi taʼmir sanasi» oʻzgaradi
        function vgMoveV(no, toM, why) {
            no = String(no).replace(/^0+/, ''); const v = onlyVagons().find(x => String(vagonNo(x)).replace(/^0+/, '') === no); if (!v) return 'Pasportda №' + no + ' topilmadi';
            const from = String(v.keyingi || '').slice(0, 7); if (from === toM) return '№' + no + ' allaqachon ' + pprMName(toM) + ' oyida';
            const day = String(v.keyingi || '').slice(8, 10) || '15', last = new Date(+toM.slice(0, 4), +toM.slice(5, 7), 0).getDate(), dd = String(Math.min(+day, last)).padStart(2, '0');
            v.keyingi = toM + '-' + dd; v.drAuto = false; v.vgMove = { from: from, to: toM, why: why || '', at: new Date().toISOString(), by: vtWho() };
            try { recalcVagonStatus(v); } catch (e) {} saveDB(); try { filterVagonlar(); } catch (e) {}
            const L = kvGet(VG_LOG, []) || []; L.push({ at: new Date().toISOString(), by: vtWho(), a: '№' + no + ': ' + (from ? pprMName(from) : '—') + ' → ' + pprMName(toM) + (why ? ' (' + why + ')' : '') }); kvSet(VG_LOG, L.slice(-300));
            VG.stale = true; return '';
        }
        if (typeof pprMove === 'function') pprMove = agmkExtend('pprMove', 'v3.16: pasport sanasi', pprMove, o => function (d, no, toM, why) { if (d && d.auto) return vgMoveV(no, toM, why); return o.apply(this, arguments); });
        if (typeof pprSwap === 'function') pprSwap = agmkExtend('pprSwap', 'v3.16: pasport sanasi', pprSwap, o => function (d, a, b) {
            if (!(d && d.auto)) return o.apply(this, arguments);
            const fa = onlyVagons().find(x => pprNo(vagonNo(x)) === pprNo(a)), fb = onlyVagons().find(x => pprNo(vagonNo(x)) === pprNo(b)); if (!fa || !fb) return 'Pasportda ' + (!fa ? '№' + a : '№' + b) + ' topilmadi';
            const ma = String(fa.keyingi || '').slice(0, 7), mb = String(fb.keyingi || '').slice(0, 7); if (!ma || !mb) return 'Keyingi taʼmir sanasi yoʻq';
            return vgMoveV(a, mb, '№' + b + ' bilan almashtirildi') || vgMoveV(b, ma, '№' + a + ' bilan almashtirildi');
        });
        // Vagon bosilganda (avtomatik rejim)
        function vgItem(si, j) {
            const d = vgD(), x = pprList(d, PPRV.m, si)[j], E = escapeHtml; if (!x) return; const v = vagonlarData.find(z => z.id === x.vid);
            const opts = []; for (let k = -1; k <= 12; k++) { const m = pprAddM(pprCurM(), k); opts.push(`<option value="${m}" ${m === PPRV.m ? 'selected' : ''}>${E(pprMName(m))}</option>`); }
            const st = x.st && VT_ST[x.st] ? vtBadge(x.st) : x.done ? vtBadge('done') : '';
            mdl('pprAct', `<div class="px-h"><b>№ ${E(x.v)}</b><button class="mini-btn" onclick="mdlClose('pprAct')">✕</button></div>
                <div class="nd-tip">${E(d.secs[si].title)}<br>${E(pprMName(PPRV.m))} ${st}${x.note ? '<br><i>' + E(x.note) + '</i>' : ''}${v ? '<br>Keyingi taʼmir (pasportda): <b>' + E(fmtISO(v.keyingi || '') || '—') + '</b>' : ''}</div>
                ${v && !x.done && !x.ghost && !vtStage(v) ? `<div class="pp-lbl">BOSHQA OYGA SURISH (pasportdagi sana ham oʻzgaradi)</div><select id="vgTo" style="width:100%;padding:8px;border-radius:8px">${opts.join('')}</select><input id="vgWhy" placeholder="sabab (ixtiyoriy)" style="width:100%;margin-top:6px;padding:8px;border-radius:8px"><div class="nv-btns"><button onclick="vgMoveDo('${E(String(x.v))}')">📅 Surish</button></div>` : ''}
                <div class="nv-btns">${v ? `<button onclick="mdlClose('pprAct'); mdlClose('pprModal'); VG.on=false; openPassport(${JSON.stringify(v.id)})">📇 Pasportni ochish</button>` : ''}${x.ghost ? `<button onclick="mdlClose('pprAct'); pprOpen('${x.ghost.to}')">➡️ ${E(pprMName(x.ghost.to))}</button>` : ''}</div>`, true);
        }
        if (typeof pprAdd === 'function') pprAdd = agmkExtend('pprAdd', 'v3.16: avtomatik', pprAdd, o => function (si) { if (!VG.on) return o.apply(this, arguments); uiPrompt('Qaysi vagon shu oyga (' + pprMName(PPRV.m) + ') qoʻshilsin (raqam)? Pasportdagi keyingi taʼmir sanasi ham shu oyga oʻzgaradi.', '').then(n => { if (!n) return; const e = vgMoveV(String(n).trim(), PPRV.m, 'grafikka qoʻshildi'); if (e) { alert(e); return; } showToast('➕ №' + n + ' → ' + pprMName(PPRV.m)); pprOpen(); }); });
        function vgMoveDo(no) { const to = ($id('vgTo') || {}).value, why = (($id('vgWhy') || {}).value || '').trim(); if (!to) return; const e = vgMoveV(no, to, why); mdlClose('pprAct'); if (e) { alert(e); return; } showToast('📅 №' + no + ' → ' + pprMName(to) + ' (pasport ham yangilandi)'); pprOpen(); }
        if (typeof pprItem === 'function') pprItem = agmkExtend('pprItem', 'v3.16: avtomatik', pprItem, o => function (si, j) { if (VG.on) return vgItem(si, j); return o.apply(this, arguments); });
        if (typeof pprGhost === 'function') pprGhost = agmkExtend('pprGhost', 'v3.16: avtomatik', pprGhost, o => function (si, j) { if (VG.on) return vgItem(si, j); return o.apply(this, arguments); });
        // Ochish: avtomatik (pasportlardan) yoki Excel grafigi
        if (typeof pprOpen === 'function') pprOpen = agmkExtend('pprOpen', 'v3.16: pasportlardan avtomatik', pprOpen, o => function (m) {
            const hasX = !!kvGet(PPR_KEY, null); VG.on = VG.mode !== 'excel' || !hasX; VG.stale = true;
            const r = o.apply(this, arguments);
            try {
                const box = $id('pprModal'), c = box && box.querySelector('.modal-content'); if (!c) return r; const E = escapeHtml;
                const nav = c.querySelector('.pp-nav');
                const late = VG.on ? onlyVagons().filter(v => !vtStage(v) && v.keyingi && String(v.keyingi).slice(0, 7) < pprCurM()).length : 0;
                const bar = `<div class="vg-mode"><button class="${VG.on ? 'on' : ''}" onclick="VG.mode='auto'; pprOpen()">📇 Pasportlardan (avtomatik)</button>${hasX ? `<button class="${!VG.on ? 'on' : ''}" onclick="VG.mode='excel'; pprOpen()">📊 Excel grafigi</button>` : ''}${VG.on ? '<button onclick="vgYear()">📅 Yillik koʻrinish</button>' : ''}</div>`
                    + (VG.on ? `<div class="nd-tip vg-leg">${['sent', 'queue', 'work', 'done'].map(k => `<span style="color:${VT_ST[k].c}">${VT_ST[k].i} ${VT_ST[k].t}</span>`).join(' · ')} · <span style="color:#fbbf24">⚠️ muddati oʻtgan</span><br>Grafik vagon pasportlaridagi «Keyingi taʼmir sanasi» va <b>probeg (km)</b> dan oʻzi tuziladi — qaysi biri birinchi tugasa. Har oyda eng koʻp yurganlar birinchi. Surish — pasportdagi sanani ham oʻzgartiradi.${late ? `<br>⚠️ Muddati oʻtgan (rejadagi oyi oʻtib ketgan, taʼmirga yuborilmagan): <b>${late}</b> ta — oʻsha oylarida «bajarilmagan» deb turibdi.` : ''}</div>` : '');
                if (nav) nav.insertAdjacentHTML('beforebegin', bar);
                if (VG.on) {
                    const d = vgD(); c.querySelectorAll('.pp-c').forEach(ch => { const m = String(ch.getAttribute('onclick') || '').match(/\((\d+),\s*(\d+)\)/); if (!m) return; const x = pprList(d, PPRV.m, +m[1])[+m[2]]; if (!x) return; if (x.km > 0 && !x.done && !ch.querySelector('.pg-km')) ch.insertAdjacentHTML('beforeend', '<small class="pg-km"> · ' + Math.round(x.km / 100) / 10 + 'k km</small>'); const S = VT_ST[x.st] || (x.done ? VT_ST.done : null); if (S) { ch.style.borderColor = S.c; ch.style.background = S.bg; ch.style.color = S.c; } else if (x.st === 'late') { ch.style.borderColor = '#fbbf24'; ch.style.color = '#fbbf24'; } });
                    const tip = [...c.querySelectorAll('.nd-tip')].find(t => /Vagonni bosing/.test(t.textContent)); if (tip) tip.innerHTML = 'Vagonni bosing — boshqa oyga surish yoki pasportini ochish. Taʼmirga yuborilgan vagon izoh bilan joriy oyga oʻzi koʻchadi.';
                    c.querySelectorAll('.cx-lbl').forEach(l => l.remove());
                }
            } catch (e) { console.error(e); }
            return r;
        });
        if (typeof mdlClose === 'function') mdlClose = agmkExtend('mdlClose', 'v3.16: grafik rejimi', mdlClose, o => function (id) { if (id === 'pprModal') VG.on = false; return o.apply(this, arguments); });
        function vgYear() {
            const d = vgD(), E = escapeHtml, y = d.year, M = Array.from({ length: 12 }, (_, k) => y + '-' + String(k + 1).padStart(2, '0'));
            const rows = d.secs.map((s, si) => `<tr><td style="text-align:left">${E(s.place)} · ${E(s.title.replace(/^Vagon Xizmatida |^2-TYS da /, ''))}</td>${M.map(m => { const L = pprLive(pprList(d, m, si)), n = L.length, dn = L.filter(x => x.done).length; return `<td onclick="mdlClose('vgYear'); PPRV.place='${s.place}'; pprOpen('${m}')" style="cursor:pointer">${n ? n + (dn ? '<br><small style="color:#22c55e">✓' + dn + '</small>' : '') : ''}</td>`; }).join('')}<td><b>${M.reduce((a, m) => a + pprLive(pprList(d, m, si)).length, 0)}</b></td></tr>`).join('');
            const tot = M.map(m => d.secs.reduce((a, s, si) => a + pprLive(pprList(d, m, si)).length, 0));
            mdl('vgYear', `<div class="px-h"><b>📅 Yillik taʼmir grafigi · ${y}</b><button class="mini-btn" onclick="mdlClose('vgYear')">✕</button></div>
                <div class="nd-tip">Pasportlardagi keyingi taʼmir sanalari boʻyicha. Raqamni bosing — oʻsha oy jadvali ochiladi. ✓ — bajarilgan.</div>
                <div class="gt-scroll" style="overflow-x:auto"><table class="nar-t vg-yt"><tr><th>Boʻlim</th>${M.map((m, k) => `<th>${E(VT_MON[k].slice(0, 3))}</th>`).join('')}<th>Jami</th></tr>${rows}<tr><td><b>Jami</b></td>${tot.map(n => `<td><b>${n || ''}</b></td>`).join('')}<td><b>${tot.reduce((a, b) => a + b, 0)}</b></td></tr></table></div>
                <div class="nv-btns"><button onclick="VG.y=0; VG.d=null; PPRV.m='${y - 1}-01'; vgYear()">◀ ${y - 1}</button><button onclick="VG.y=0; VG.d=null; PPRV.m='${y + 1}-01'; vgYear()">${y + 1} ▶</button><button onclick="vgYearXlsx()">📊 Excel</button></div>`, true);
        }
        function vgYearXlsx() {
            const d = vgD(), y = d.year, M = Array.from({ length: 12 }, (_, k) => y + '-' + String(k + 1).padStart(2, '0'));
            const rows = [['Yillik taʼmir grafigi ' + y + ' (vagon pasportlaridan)'], ['Har oy: shu oyda rejalashtirilgan vagon raqamlari'], ['Joy', 'Boʻlim'].concat(VT_MON.map(m => m.charAt(0).toUpperCase() + m.slice(1)))];
            d.secs.forEach((s, si) => { rows.push([s.place, s.title].concat(M.map(m => pprLive(pprList(d, m, si)).map(x => x.v + (x.done ? '✓' : '')).join(', ')))); });
            docDownload([{ name: 'Tamir_grafigi_' + y + '.xlsx', mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', blob: fotXlsxBook([{ name: String(y), rows: rows, head: 2, w: [8, 40].concat(M.map(() => 26)) }]) }]); showToast('📊 Yillik grafik tayyor');
        }
        // pasport oʻzgarsa — grafik keshini yangilash
        if (typeof saveDB === 'function') saveDB = agmkExtend('saveDB', 'v3.16: grafik keshi', saveDB, o => function () { VG.stale = true; return o.apply(this, arguments); });
        (function () { const st = document.createElement('style'); st.textContent = `.vg-mode{display:flex;gap:6px;flex-wrap:wrap;margin:6px 0}.vg-mode button{flex:1;min-width:120px;padding:7px;border-radius:10px;border:1px solid #334155;background:rgba(15,23,42,.6);color:#cbd5e1;font-weight:700}.vg-mode button.on{border-color:#38bdf8;color:#38bdf8;background:rgba(56,189,248,.12)}
            .vg-yt td,.vg-yt th{text-align:center;padding:4px 6px;font-size:12px}.vg-yt td:first-child{text-align:left;min-width:180px}.pol-v{flex-wrap:wrap}`; document.head.appendChild(st); })();

        // ============ v3.16.1: yagona ranglar + «Taʼmirga yuborilgan» kichik filtrlari ============
        // 🟢 Soz · 🟡 Yaqin · 🟠 Muddati kelgan/oʻtgan · 🟤 Yuborilgan · 🔴 Navbatda · 🔵 Taʼmirda · 🟢 Chiqarildi
        var VC = { G: '#22c55e', Y: '#eab308', O: '#f97316' };
        var VT_SUB = 'all';
        try {
            Object.assign(VT_ST.sent, { c: '#b45309', bg: 'rgba(180,83,9,.22)', i: '🟤' });
            Object.assign(VT_ST.queue, { c: '#ef4444', bg: 'rgba(239,68,68,.16)', i: '🔴' });
        } catch (e) {}
        function vcMudTxt(v) { return v.kun === null || v.kun === undefined ? "Muddati kelgan (DR sanasi yoʻq)" : (v.kun < 0 ? 'Muddati oʻtgan (' + Math.abs(v.kun) + ' kun)' : 'Muddati kelgan (' + v.kun + ' kun qoldi)'); }
        function vcCol(v) {
            if (v.status === 'Tamirda') return VT_ST[vtStage(v) || 'work'].c;
            return v.status === 'Soz' ? VC.G : v.status === 'Yaqin' ? VC.Y : v.status === "Ta'mir talab" ? VC.O : '#94a3b8';
        }
        function vcFmt(t) { try { const d = new Date(t); if (isNaN(d)) return ''; const p = n => String(n).padStart(2, '0'); return p(d.getDate()) + '.' + p(d.getMonth() + 1) + ' ' + p(d.getHours()) + ':' + p(d.getMinutes()); } catch (e) { return ''; } }
        function vcStageWho(v) { const P = v.pol || {}, st = vtStage(v); const ev = st === 'queue' ? 'q' : st === 'work' ? 'w' : null; const h = ev ? (v.history || []).find(x => x.ev === ev) : null; if (h) return { at: h.date + (h.hm ? 'T' + h.hm : ''), by: h.author || '' }; return P.sent ? { at: P.sent.at, by: P.sent.by } : { at: P.at, by: P.by || '' }; }
        // Kartochka: belgi, rang, izoh
        if (typeof vagonCardHtml === 'function') vagonCardHtml = agmkExtend('vagonCardHtml', 'v3.16.1: holat ranglari', vagonCardHtml, o => function (v) {
            let h = o.apply(this, arguments);
            try {
                if (v.kind) return h;
                const E = escapeHtml, col = vcCol(v); let txt;
                if (v.status === 'Tamirda') { const S = VT_ST[vtStage(v) || 'work']; txt = S.i + ' ' + S.t; }
                else if (v.status === 'Soz') txt = '🟢 Soz (' + v.kun + ' kun)';
                else if (v.status === 'Yaqin') txt = '🟡 Yaqin (' + v.kun + ' kun)';
                else if (v.status === "Ta'mir talab") txt = '🟠 ' + vcMudTxt(v);
                if (txt) h = h.replace(/<div class="vagon-badge [^"]*">[\s\S]*?<\/div>/, `<div class="vagon-badge vc-badge" style="color:${col};border-color:${col};background:${col}2e">${E(txt)}</div>`);
                h = h.replace('<div class="vagon-card"', `<div class="vagon-card vc-card" style="border-left:4px solid ${col}"`);
                if (v.status === 'Tamirda') {
                    const P = v.pol || {}, w = vcStageWho(v);
                    const inf = [P.rt || '', P.uch || '', P.why ? '⚠️ ' + P.why : ''].filter(Boolean).join(' · ') + (w.at ? ' — ' + vcFmt(w.at) : '') + (w.by ? ', ' + w.by : '');
                    if (inf) h = h.replace('<button class="details-btn"', `<div class="vc-inf" style="color:${col}">${E(inf)}</div><button class="details-btn"`);
                }
            } catch (e) { console.error(e); }
            return h;
        });
        // Roʻyxat: «Taʼmirga yuborilgan» ichidagi bosqich filtri
        function vcSubSet(k) { VT_SUB = k; filterVagonlar(); }
        function vcSubRow() {
            const g = document.querySelector('#screen-vagonlar .stats-grid'); if (!g) return;
            let row = $id('vcSub'); if (!row) { row = document.createElement('div'); row.id = 'vcSub'; row.className = 'vc-sub'; g.after(row); }
            if (activeStatusFilter !== 'Tamirda') { row.classList.add('hidden'); return; }
            const all = onlyVagons().filter(v => v.status === 'Tamirda'), c = { sent: 0, queue: 0, work: 0 }; all.forEach(v => c[vtStage(v) || 'work']++);
            const chip = (k, t, n, col) => `<button class="vc-chip${VT_SUB === k ? ' on' : ''}" style="--c:${col}" onclick="vcSubSet('${k}')">${t} <b>${n}</b></button>`;
            row.innerHTML = chip('all', 'Barchasi', all.length, '#94a3b8') + chip('sent', '🟤 Yuborilgan', c.sent, VT_ST.sent.c) + chip('queue', '🔴 Navbatda', c.queue, VT_ST.queue.c) + chip('work', '🔵 Taʼmirda', c.work, VT_ST.work.c);
            row.classList.remove('hidden');
        }
        if (typeof renderVagonlar === 'function') renderVagonlar = agmkExtend('renderVagonlar', 'v3.16.1: bosqich filtri', renderVagonlar, o => function (data) {
            try { if (activeStatusFilter !== 'Tamirda') VT_SUB = 'all'; else if (VT_SUB !== 'all' && Array.isArray(data)) data = data.filter(v => (vtStage(v) || 'work') === VT_SUB); } catch (e) {}
            const r = o.call(this, data); try { vcSubRow(); } catch (e) {} return r;
        });
        // Yuqoridagi kategoriyalar: nomlar va tanlangan filtr
        function vcStats() {
            try {
                const lab = (id, t) => { const n = $id(id); const l = n && n.parentNode.querySelector('.stat-label'); if (l && l.dataset.vc !== t) { l.innerHTML = t; l.dataset.vc = t; l.classList.add('vc-2l'); } };
                lab('stat-tamir', 'Muddati<br>kelgan'); lab('stat-tamirda', 'Taʼmirga<br>yuborilgan');
                const map = { Barchasi: 'stat-jami', Soz: 'stat-soz', Yaqin: 'stat-yaqin', "Ta'mir talab": 'stat-tamir', Tamirda: 'stat-tamirda' };
                document.querySelectorAll('#screen-vagonlar .stats-grid .stat-box').forEach(b => b.classList.remove('on', 'vc-on'));
                const a = $id(map[activeStatusFilter] || 'stat-jami'); if (a) a.parentNode.classList.add('vc-on');
            } catch (e) {}
        }
        if (typeof updateStats === 'function') updateStats = agmkExtend('updateStats', 'v3.16.1: kategoriya nomlari', updateStats, o => function () { const r = o.apply(this, arguments); vcStats(); return r; });
        // Pasport: «Muddati kelgan» holati
        if (typeof openPassport === 'function') openPassport = agmkExtend('openPassport', 'v3.16.1: holat nomi', openPassport, o => function () {
            const r = o.apply(this, arguments);
            try { const v = vagonlarData.find(x => x.id === activeVagonId), ps = $id('p-holat'); if (v && ps && !v.kind && v.status !== 'Tamirda') { const col = vcCol(v); ps.innerHTML = `<span style="color:${col};font-weight:700">${v.status === 'Soz' ? '🟢 Soz' : v.status === 'Yaqin' ? '🟡 Yaqin' : v.status === "Ta'mir talab" ? '🟠 ' + escapeHtml(vcMudTxt(v)) : escapeHtml(v.status)}</span>`; } } catch (e) {}
            return r;
        });
        (function () { const st = document.createElement('style'); st.textContent = `
            #screen-vagonlar .stat-num.soz{color:${VC.G}!important}#screen-vagonlar .stat-num.yaqin{color:${VC.Y}!important}#screen-vagonlar .stat-num.tamir{color:${VC.O}!important}#screen-vagonlar .stat-num.tamirda{color:#60a5fa!important}
            #screen-vagonlar .stat-label.vc-2l{font-size:8.5px;line-height:1.15}
            #screen-vagonlar .stats-grid .stat-box.vc-on{border:2px solid #e2e8f0!important;box-shadow:0 0 12px rgba(255,255,255,.5)!important;background:rgba(30,58,138,.9)!important}
            .vc-sub{display:grid;grid-template-columns:repeat(4,1fr);gap:5px;margin:8px 0 2px}.vc-sub.hidden{display:none}
            .vc-chip{text-align:center;padding:6px 2px;border-radius:14px;font-size:11px;font-weight:700;white-space:nowrap;border:1.5px solid var(--c);color:var(--c);background:rgba(15,23,42,.88);cursor:pointer}
            .vc-chip.on{color:#fff;background:var(--c);box-shadow:0 0 10px var(--c)}
            .vagon-badge.vc-badge{border:1px solid;font-weight:700}.vc-inf{margin:6px 0 2px;font-size:11.5px;font-weight:600}
            .pol-v.vt-sent{border-left-color:#b45309!important}.pol-v.vt-queue{border-left-color:#ef4444!important}`; document.head.appendChild(st); })();

