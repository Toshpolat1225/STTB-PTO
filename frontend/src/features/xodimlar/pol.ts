
        // =====================================================================
        // v3.0 — 📋 KUNLIK POLOJENIYA (Vagon xizmati) — «Seh va uchastkalar» bo'limida
        //  • Ta'mirdagi vagonlar ilovadagi holatdan olinadi: «🔧 Ta'mirga yuborish» 2 ta savol beradi —
        //    ta'mir turi (KR / DR / TR / nosozlik) va qaysi uchastka. Vagon polojeniyada o'sha uchastkada turadi
        //    va har kuni o'zi keyingi kunga o'tadi — «✅ Tayyor» bosilmaguncha.
        //  • Polojeniya ILOVADAGI MAʼLUMOTDAN O'ZI tuziladi (pasport tarixidagi voqealar: kim, qachon, qayerga) —
        //    uchastka ustasi alohida kiritmaydi. Kun ichida chiqarilgan vagon o'sha kun ro'yxatida qoladi, tagida
        //    «✅ Taʼmirdan chiqarildi HH:MM → sex · Lavozim Familiya». O'tgan kunlar tarixdan tiklanadi.
        //  • «✅ Tayyor → seh»: vagon ta'mirdan chiqadi, qaysi sehga berilgani yoziladi (pasport tarixiga ham).
        //    DR/KR sanasi pasportga defekt vedomostdagi «Время окончания ремонта» dan yoziladi (hisobot tekshiruvida).
        //  • Telegram'dagi polojeniya matnini qo'yish: ilova uni o'qib, ilovadagi holat bilan solishtiradi
        //    (qaysi vagon ilovada ta'mirda emas, qaysi biri xabarda yo'q) — tasdiq bilan moslaydi.
        //  • Qo'shimcha qatorlar (КЖ-20, g'ildirak uchastkasi 1-ТЙЦ/2-ТЙЦ, avtoscepka va h.k.) yozilganidek saqlanadi.
        //  • Saqlanganda — hammaga qisqa bildirishnoma (ko'rilgach ro'yxatdan yo'qoladi). Telegram formatida nusxa.
        // =====================================================================
        var POL_KEY = 'agmk_pol_v1', POL_CFG_KEY = 'agmk_pol_cfg';
        var POL_RT = { KR: 'Kapital taʼmir (KR)', DR: 'Depo taʼmiri (DR)', TR: 'Joriy taʼmir (TR)', NS: 'Nosozlik (toʻsatdan)' };
        var POL_RT_TG = { KR: 'Кр', DR: 'Др', TR: 'Тр', NS: 'Нс' };
        var POL = { date: null };
        function polCfg() { const c = kvGet(POL_CFG_KEY, null); return c && c.uch ? c : { uch: ['Kapital uchastka', 'Depo uchastka', '1-TYS VTP', '2-TYS'], uchTg: { 'Kapital uchastka': 'Капитал участка', 'Depo uchastka': 'Деповской участка' } }; }
        function polDB() { const d = kvGet(POL_KEY, null); return d && d.days ? d : { days: [] }; }
        function polSave(d) { kvSet(POL_KEY, d); try { if (typeof KV_SYNC !== 'undefined') KV_SYNC.dirty = true; } catch (e) {} }
        function polDay(date) { return polDB().days.find(x => x.id === date) || null; }
        function polToday() { return todayISO(); }
        // Ta'mirdagi vagonlar (ilovadagi holat) — uchastka bo'yicha
        function polInRepair() { return onlyVagons().filter(v => v.status === 'Tamirda'); }
        // Kim kiritgani: «Lavozim Familiya I.O.» (authorStr = «F.I.O. (lavozim)»)
        function polPerson(by) {
            by = String(by || '').trim(); if (!by) return '—'; if (/^(Polojeniya|Defekt)/.test(by)) return by;
            const m = by.match(/^(.*?)\s*\(([^()]*)\)\s*$/), nm = (m ? m[1] : by.split('·')[0]).trim(), role = m ? m[2].trim() : '';
            const t = nm.split(/\s+/).filter(Boolean), short = t.length > 1 ? t[0] + ' ' + t.slice(1, 3).map(s => s[0].toUpperCase() + '.').join('') : nm;
            return (role && role !== '—' ? role.charAt(0).toUpperCase() + role.slice(1) + ' ' : '') + short;
        }
        function polWhen(iso) { return iso ? fmtDT(iso).replace(/^(\d{2}\.\d{2})\.\d{4}/, '$1') : ''; }
        function polUchOf(v) { return (v.pol && v.pol.uch) || 'Uchastka koʻrsatilmagan'; }
        // ---------- Voqealar: vagon tarixidan (kim, qachon, qayerga) — polojeniya shundan o'zi tuziladi ----------
        function polD(s) { s = String(s || ''); let m = s.match(/^(\d{4}-\d{2}-\d{2})/); if (m) return m[1]; m = s.match(/^(\d{2})\.(\d{2})\.(\d{4})/); return m ? m[3] + '-' + m[2] + '-' + m[1] : ''; }
        function polLD(iso) { const t = new Date(iso); return isNaN(t) ? '' : t.getFullYear() + '-' + String(t.getMonth() + 1).padStart(2, '0') + '-' + String(t.getDate()).padStart(2, '0'); }
        function polRtOf(s) { s = String(s || '').trim(); return Object.keys(POL_RT).find(k => POL_RT[k] === s || k === s) || ''; }
        function polEv(v) {
            const H = v.history || [], out = [];
            for (let i = H.length - 1, n = 0; i >= 0; i--, n++) { // tarix — yangisi boshida; teskari = kiritilish tartibi
                const h = H[i] || {}, t = String(h.type || ''), d = polD(h.date); if (!d) continue;
                const hm = h.hm != null ? h.hm : ((t.match(/\((\d{1,2}:\d{2})\)/) || [])[1] || '');
                if (h.ev === 'in' || (!h.ev && /Ta['ʼ’`]?mirga yuborildi/i.test(t))) {
                    let rt = h.rt || '', uch = h.uch || ''; if (!rt) { const m = t.match(/\(([^,()]+),\s*([^()]+)\)/); if (m) { rt = polRtOf(m[1]); uch = m[2].trim(); } }
                    out.push({ k: 'in', d: d, hm: hm, rt: rt, uch: uch, by: h.by || h.author || '', n: n });
                } else if (h.ev === 'out' || (!h.ev && h.src !== 'dv' && /Ta['ʼ’`]?mirdan (chiq|qayt)/i.test(t))) {
                    out.push({ k: 'out', d: d, hm: hm, rt: h.rt || '', uch: h.uch || '', st: !!h.ev, to: h.to || ((t.match(/→\s*([^(—]+?)\s*(?:\(|—|$)/) || [])[1] || ''), by: h.by || h.author || '', dv: h.src === 'dv', n: n });
                } else out.push({ k: 'x', d: d, n: n });
            }
            return out.sort((a, b) => a.d < b.d ? -1 : a.d > b.d ? 1 : a.n - b.n);
        }
        // D kuni polojeniyasi: kun boshida taʼmirda bo'lganlar + shu kuni yuborilganlar; kun ichida chiqarilganlar tagida yoziladi
        function polItems(D) {
            const today = D === polToday(), R = [];
            onlyVagons().forEach(v => {
                const E = polEv(v); let inE = null, outE = null;
                E.forEach(e => { if (e.d > D) return;
                    if (e.k === 'in') { inE = e; outE = null; }
                    else if (e.k === 'out' && inE) { if (e.d < D) { inE = null; outE = null; } else outE = e; }
                    else if (e.k === 'out' && e.st && e.d === D) { inE = { d: '', rt: e.rt, uch: e.uch, by: '', n: -1 }; outE = e; } // yuborilgani yozilmagan (eski) — lekin shu kuni chiqarilgan
                });
                const P = v.pol || {}, L = P.last || {};
                if (today) {
                    if (v.status === 'Tamirda') { if (!inE || outE) { inE = { d: P.since || '', rt: P.rt, uch: P.uch, by: P.by, at: P.at }; outE = null; } }
                    else if (inE && !outE) outE = { d: D, hm: '', to: v.seh || '', by: '', unk: true };
                }
                if (!inE) return;
                const cur = v.status === 'Tamirda' && !outE;
                R.push({ v: v, no: vagonNo(v), rt: inE.rt || (cur ? P.rt : L.rt) || '', uch: inE.uch || (cur ? P.uch : L.uch) || 'Uchastka koʻrsatilmagan', since: inE.d,
                    inAt: (cur && P.at && polLD(P.at) === inE.d) ? polWhen(P.at) : (inE.d ? fmtISO(inE.d).slice(0, 5) + (inE.hm ? ' ' + inE.hm : '') : ''), inBy: inE.by || (cur ? P.by : L.by) || '',
                    out: outE ? { at: outE.unk ? '' : fmtISO(outE.d).slice(0, 5) + (outE.hm ? ' ' + outE.hm : ''), to: outE.to || L.to || '', by: outE.by, dv: outE.dv, unk: outE.unk } : null, newToday: inE.d === D });
            });
            const C = polCfg(), G = {}; R.forEach(x => { (G[x.uch] = G[x.uch] || []).push(x); });
            Object.values(G).forEach(L => L.sort((a, b) => (a.out ? 1 : 0) - (b.out ? 1 : 0) || String(a.no).localeCompare(String(b.no))));
            return C.uch.filter(u => G[u]).concat(Object.keys(G).filter(u => !C.uch.includes(u))).map(u => ({ uch: u, list: G[u] }));
        }
        // ---------- 🔧 Ta'mirga yuborish: 2 savol ----------
        function polAskRepair(v) {
            if (POL.preset) { const a = POL.preset; POL.preset = null; return Promise.resolve(a); } // AI buyrug'i: «8121 ni ta'mirga yubor, depo, DR» (tasdiq AI oynasida olingan)
            return new Promise(res => {
                const E = escapeHtml, C = polCfg(); POL.ask = { res: res, rt: (v.pol && v.pol.rt) || '', uch: (v.pol && v.pol.uch) || '' };
                const draw = () => {
                    const A = POL.ask;
                    mdl('polAsk', `<div class="px-h"><b>🔧 № ${E(vagonNo(v))} — taʼmirga yuborish</b><button class="mini-btn" onclick="polAskDone(null)">✕</button></div>
                        <div class="pp-lbl">1. QANDAY TAʼMIR TURIGA?</div><div class="snd-chips">${Object.keys(POL_RT).map(k => `<i class="${A.rt === k ? 'on' : ''}" onclick="POL.ask.rt='${k}'; POL.ask.draw()">${E(POL_RT[k])}</i>`).join('')}</div>
                        <div class="pp-lbl">2. QAYSI UCHASTKAGA?</div><div class="snd-chips">${C.uch.map(u => `<i class="${A.uch === u ? 'on' : ''}" onclick="POL.ask.uch=${E(JSON.stringify(u))}; POL.ask.draw()">${E(u)}</i>`).join('')}</div>
                        <div class="pp-lbl">3. NOSOZLIK SABABI (ixtiyoriy)</div><input id="polAskWhy" style="width:100%;padding:8px;border-radius:8px;border:1px solid #334155;background:#0f172a;color:#e2e8f0" placeholder="masalan: gʻildirak yeyilgan" value="${E(A.why || '')}" oninput="POL.ask.why=this.value"><div class="pk-btns"><button onclick="polAskDone(null)">Bekor</button><button class="pr" onclick="polAskDone(true)" ${A.rt && A.uch ? '' : 'disabled style="opacity:.5"'}>🔧 Taʼmirga yuborish</button></div>`);
                };
                POL.ask.draw = draw; draw();
            });
        }
        function polAskDone(ok) { const A = POL.ask; if (!A) return; POL.ask = null; mdlClose('polAsk'); A.res(ok && A.rt && A.uch ? { rt: A.rt, uch: A.uch, why: String(A.why || '').trim() } : null); }
        // ---------- ✅ Tayyor → seh ----------
        function polOutRec(v, d, to, by, src) { // pasport tarixiga (voqea) va vagon.pol ga — polojeniya shundan o'qiydi
            const was = Object.assign({}, v.pol || {}); delete was.last; const hm = nowHM();
            v.history = v.history || []; v.history.unshift({ date: d, type: '✅ Taʼmirdan chiqdi (' + (POL_RT[was.rt] || 'taʼmir') + ', ' + (was.uch || 'uchastka koʻrsatilmagan') + ') → ' + (to || '—') + (src ? ' — ' + src : '') + ' (' + hm + ')', author: authorStr(), ev: 'out', to: to || '', rt: was.rt || '', uch: was.uch || '', hm: hm, by: by || authorStr(), src: 'pol' });
            v.pol = { last: Object.assign(was, { out: d, to: to || '', outAt: new Date().toISOString(), outBy: by || authorStr() }) };
        }
        async function polRelease(vid) {
            const v = vagonlarData.find(x => String(x.id) === String(vid)); if (!v) return false;
            const E = escapeHtml, cur = (v.pol && v.pol.to) || (v.seh && subUnits11.includes(v.seh) ? v.seh : 'TYS-1/ЖДЦ-1');
            const to = POL.relPreset ? (r => { POL.relPreset = null; return r; })(POL.relPreset) : await new Promise(res => { POL.rel = res; mdl('polRel', `<div class="px-h"><b>✅ № ${E(vagonNo(v))} taʼmirdan chiqdi</b><button class="mini-btn" onclick="mdlClose('polRel'); POL.rel(null)">✕</button></div>
                <div class="nd-tip">${E(POL_RT[(v.pol || {}).rt] || '')} · ${E(polUchOf(v))}${v.pol && v.pol.since ? ' · ' + E(fmtISO(v.pol.since)) + ' dan beri' : ''}</div>
                <div class="pp-lbl">QAYSI SEHGA BERILDI?</div><div class="snd-chips">${subUnits11.filter(s => s !== 'Boshqarma').map(s => `<i class="${s === cur ? 'on' : ''}" onclick="mdlClose('polRel'); POL.rel(${E(JSON.stringify(s))})">${E(s)}</i>`).join('')}</div>
                <div class="nd-tip">Kunlik polojeniyada vagon tagiga «✅ Taʼmirdan chiqarildi — vaqt, sex, kim (lavozim, familiya)» avtomatik yoziladi. DR/KR sanasi pasportga defekt vedomostdagi «Время окончания ремонта» dan yoziladi.</div>`); });
            if (!to) return false;
            polOutRec(v, polToday(), to); v.seh = to; v.status = 'Auto'; try { recalcVagonStatus(v); } catch (e) {}
            saveDB(); try { filterVagonlar(); } catch (e) {} showToast('✅ № ' + vagonNo(v) + ' → ' + to); polRender(); return true;
        }
        // Holat pasportni tahrirlashda qo'lda o'zgartirilsa ham — voqea yoziladi (polojeniya aniq bo'lishi uchun)
        function polStatusEv(v, wasT) {
            const isT = v.status === 'Tamirda'; if (wasT === isT) return;
            if (wasT) polOutRec(v, polToday(), v.seh || '', authorStr(), 'holat tahrirda oʻzgartirildi');
            else { const hm = nowHM(); v.history = v.history || []; v.history.unshift({ date: polToday(), type: "🔧 Ta'mirga yuborildi (holat tahrirda oʻzgartirildi) (" + hm + ')', author: authorStr(), ev: 'in', hm: hm, src: 'pol' }); v.pol = { since: polToday(), at: new Date().toISOString(), by: authorStr() }; }
        }
        // ---------- Ko'rinish (ilovadagi maʼlumotdan o'zi tuziladi — hech kim alohida kiritmaydi) ----------
        function polOpen(date) { POL.date = date || POL.date || polToday(); polRender(true); }
        function polRender(open) {
            if (!open && (!$id('polModal') || $id('polModal').classList.contains('hidden'))) return;
            const E = escapeHtml, d = POL.date, today = d === polToday(), day = polDay(d) || {};
            const can = typeof p38Can === 'function' ? (p38Can('tech_edit') || isAdmin()) : true;
            const G = polItems(d), all = [].concat(...G.map(g => g.list)), nIn = all.filter(x => !x.out).length, nOut = all.filter(x => x.out).length, nNew = all.filter(x => x.newToday).length;
            const row = x => `<div class="pol-v${x.out ? ' pol-done' : ''} vt-${x.out ? 'done' : (x.stage || 'work')}"><b>${E(POL_RT_TG[x.rt] || '—')}-${E(x.no)}</b>${typeof vtBadge === 'function' ? vtBadge(x.out ? 'done' : (x.stage || 'work')) : ''}<small>${E(x.v.naim || x.v.type || '')}${x.since ? ' · ' + E(fmtISO(x.since)) + ' dan' : ''}</small>${!x.out && today && can ? (typeof vtPolBtns === 'function' ? vtPolBtns(x) : `<button class="mini-btn" onclick="polRelease('${E(String(x.v.id))}')">✅ Tayyor</button>`) : ''}</div>`
                + `<div class="pol-i">🔧 ${x.newToday ? '<i>bugun</i> ' : ''}${x.inAt ? E(x.inAt) + ' → ' : ''}${E(x.uch)} (${E(POL_RT[x.rt] || 'turi koʻrsatilmagan')})${x.inBy ? ' · ' + E(polPerson(x.inBy)) : ''}</div>`
                + (typeof vtPolInfo === 'function' ? vtPolInfo(x) : '') + (x.out ? `<div class="pol-i pol-o">✅ Taʼmirdan chiqarildi${x.out.at ? ' ' + E(x.out.at) : ' (vaqti yozilmagan)'}${x.out.to ? ' → ' + E(x.out.to) : ''}${x.out.by ? ' · ' + E(polPerson(x.out.by)) : ''}</div>` : '');
            mdl('polModal', `<div class="px-h"><b>📋 Kunlik polojeniya · Vagon xizmati</b><button class="mini-btn" onclick="mdlClose('polModal')">✕</button></div>
                <div class="pp-nav"><button onclick="polOpen(polShift(POL.date,-1))">◀</button><b>${E(fmtISO(d))}${today ? ' (bugun)' : ''}</b><button onclick="polOpen(polShift(POL.date,1))" ${today ? 'disabled' : ''}>▶</button></div>
                <div class="nd-tip">${typeof vtPolSum === 'function' ? vtPolSum(all, today) : '🔧 Taʼmirda: <b>' + nIn + '</b>'}${nOut ? ' · ✅ ' + (today ? 'bugun ' : '') + 'chiqarildi: <b>' + nOut + '</b>' : ''}${nNew ? ' · 🆕 ' + (today ? 'bugun ' : '') + 'yuborildi: <b>' + nNew + '</b>' : ''}${day.smena ? ' · 👷 Smena: ' + E(day.smena) : ''}</div>
                ${G.length ? G.map(g => `<div class="hs-box"><div class="hs-h">${E(g.uch)} <small>${g.list.filter(x => !x.out).length} ta${g.list.some(x => x.out) ? ' (+' + g.list.filter(x => x.out).length + ' chiqdi)' : ''}</small></div>${g.list.map(row).join('')}</div>`).join('')
                    : `<div class="xt-empty">${today ? 'Hozir taʼmirda vagon yoʻq.' : 'Bu kuni taʼmirda vagon boʻlmagan (pasport tarixiga koʻra).'}</div>`}
                ${(day.extra || []).length ? `<div class="hs-box"><div class="hs-h">📝 Boshqa uchastkalar (Telegram xabaridan)</div>${day.extra.map(s => `<div class="pol-x"><b>${E(s.sec)}</b>${s.lines.map(l => `<div>${E(l)}</div>`).join('')}</div>`).join('')}</div>` : ''}
                ${day.warn && day.warn.length ? `<div class="hp-warn">⚠️ ${day.warn.map(E).join('<br>⚠️ ')}</div>` : ''}
                <div class="cx-bar">${can && today ? '<button onclick="polSaveDay()">📣 Hammaga xabar berish</button>' : ''}${can ? '<button onclick="polPaste()">📥 Telegram matnidan</button>' : ''}<button onclick="polShare()">📤 Telegram formatida</button><button onclick="polPdf()">📥 PDF — telefonga</button><button onclick="polPdf(true)">✈️ PDF — Telegram</button>${isAdmin() ? '<button onclick="polCfgOpen()">⚙️ Uchastkalar</button>' : ''}</div>
                <div class="nd-tip">Polojeniya ilovadagi maʼlumotdan <b>oʻzi</b> tuziladi — uchastka ustasi alohida kiritishi shart emas. Vagon pasportida «🔧 Taʼmirga yuborish» (taʼmir turi + uchastka) yoki «✅ Tayyor» bosilishi bilan shu yerda vaqti (soat:daqiqa), kim kiritgani (lavozimi, familiyasi) bilan koʻrinadi. Kun ichida chiqarilgan vagon oʻsha kun roʻyxatida qoladi, tagida «✅ Taʼmirdan chiqarildi» yoziladi; ertasiga roʻyxatdan tushadi. Oʻtgan kunlar ◀ bilan — pasport tarixidan tiklanadi.</div>`, true);
        }
        function polShift(d, n) { const t = new Date(d + 'T00:00:00'); t.setDate(t.getDate() + n); const s = t.getFullYear() + '-' + String(t.getMonth() + 1).padStart(2, '0') + '-' + String(t.getDate()).padStart(2, '0'); return s > polToday() ? polToday() : s; }
        function polSnap(d) { return polItems(d || polToday()).map(g => ({ uch: g.uch, list: g.list.filter(x => !x.out).map(x => ({ v: x.no, rt: x.rt })) })).filter(g => g.list.length); }
        function polSaveDay() { // ixtiyoriy: hammaga qisqa bildirishnoma
            const d = polToday(), db = polDB(); let day = db.days.find(x => x.id === d); if (!day) { day = { id: d, date: d, at: new Date().toISOString(), extra: [] }; db.days.push(day); }
            const G = polItems(d), out = [].concat(...G.map(g => g.list)).filter(x => x.out).length;
            day.snap = polSnap(d); day.tayor = []; day.nOut = out; day.by = authorStr(); day.upd = new Date().toISOString(); db.days = db.days.slice(-400); polSave(db);
            const n = day.snap.reduce((a, g) => a + g.list.length, 0);
            try { notify({ icon: '📋', text: 'Vagon xizmati polojeniyasi ' + fmtISO(d) + ': taʼmirda ' + n + ' ta (' + day.snap.map(g => g.uch + ' ' + g.list.length).join(', ') + ')' + (out ? ', bugun chiqarildi ' + out + ' ta' : '') + ' — ' + polPerson(authorStr()), toAll: true, eph: true, pol: d }); } catch (e) {}
            try { aiLog('Kunlik polojeniya xabari yuborildi: ' + fmtISO(d)); } catch (e) {}
            showToast('📣 Hammaga yuborildi'); polRender();
        }
        // ---------- Telegram formatida ----------
        function polText(d) {
            const day = polDay(d) || {}, C = polCfg(), G = polItems(d);
            const p = d.split('-'); let t = p[2] + '.' + p[1] + '.' + p[0] + '\n' + (day.smena ? 'Смена ' + day.smena + '\n' : '');
            G.forEach(g => { const L = g.list.filter(x => !x.out); if (L.length) t += '\n' + ((C.uchTg || {})[g.uch] || g.uch) + '\n\n' + L.map(x => (POL_RT_TG[x.rt] ? POL_RT_TG[x.rt] + '-' : '') + x.no).join('\n') + '\n'; });
            const T = [].concat(...G.map(g => g.list)).filter(x => x.out);
            if (T.length) { t += '\nремонтда\n\nТаёр вагонлар\n\n'; const by = {}; T.forEach(x => { const k = x.out.to || '—'; (by[k] = by[k] || []).push(x.no); }); Object.keys(by).forEach(k => { t += k.replace(/^TYS-\d\//, '') + '. ' + by[k].join(', ') + '\n'; }); }
            (day.extra || []).forEach(s => { t += '\n' + s.sec + '\n' + s.lines.join('\n') + '\n'; });
            return t.trim();
        }
        async function polShare() { const t = polText(POL.date); try { await navigator.clipboard.writeText(t); showToast('📋 Nusxa olindi — Telegram guruhiga joylang'); } catch (e) {} try { if (typeof chatOpenLink === 'function') chatOpenLink('https://t.me/share/url?url=' + encodeURIComponent(' ') + '&text=' + encodeURIComponent(t)); } catch (e) {} }
        // ---------- Telegram matnini o'qish ----------
        function polParse(txt) {
            const L = String(txt || '').replace(/\r/g, '').split('\n').map(s => s.trim()), out = { date: '', smena: '', items: [], tayor: [], extra: [] };
            let uch = '', mode = '', ex = null;
            const up = s => s.toLowerCase().replace(/ё/g, 'е');
            L.forEach(s => {
                if (!s) return; const u = up(s);
                let m = s.match(/^(\d{2})\.?(\d{2})\.(\d{4})$/) || s.match(/^(\d{1,2})[.\/](\d{1,2})[.\/](\d{4})/); if (m && !out.date) { out.date = m[3] + '-' + String(+m[2]).padStart(2, '0') + '-' + String(+m[1]).padStart(2, '0'); return; }
                if (/^смена\s+/i.test(s)) { out.smena = s.replace(/^смена\s+/i, '').trim(); return; }
                if (/(капитал[а-яё]*|kapital[a-z]*)\s*(уч|uch)/.test(u)) { uch = 'Kapital uchastka'; mode = 'uch'; ex = null; return; }
                if (/(деповск[а-яё]*|depo[a-z]*)\s*(уч|uch)/.test(u)) { uch = 'Depo uchastka'; mode = 'uch'; ex = null; return; }
                if (/^ремонтда$|^ta.?mirda$/.test(u)) return;
                if (/(таёр|таер|tayyor|tayor)\s*(вагон|vagon)/.test(u)) { mode = 'tayor'; ex = null; return; }
                m = s.match(/^(кр|др|тр|kr|dr|tr)\s*[-–]\s*([0-9]{2,})\s*(.*)$/i);
                if (m && mode === 'uch') { const rt = /^(кр|kr)/i.test(m[1]) ? 'KR' : /^(др|dr)/i.test(m[1]) ? 'DR' : 'TR'; out.items.push({ v: m[2], rt: rt, uch: uch, note: m[3].trim() }); return; }
                if (mode === 'tayor') { m = s.match(/^([^\d]*\d?[^\d.]*?)[.:\s]+([\d,\s]+)$/); if (m && /\d{3,}/.test(m[2])) { const to = m[1].replace(/[.\s]+$/, '').trim(); m[2].split(/[,\s]+/).filter(x => /^\d{2,}$/.test(x)).forEach(v => out.tayor.push({ v: v, to: to })); return; } }
                // boshqa bo'limlar (КЖ-20, колёс уч-к, ...): yozilganidek
                const top = /^(кж|колес|колёс|вагон\s*хизмат|ав-?й|автосц|электр|тепловоз|локомот)/.test(u);
                if (top || (!ex && /[:：]/.test(s))) { mode = 'extra'; ex = { sec: s.split(/[:：]/)[0].trim(), lines: [] }; out.extra.push(ex); const rest = s.split(/[:：]/).slice(1).join(':').trim(); if (rest) ex.lines.push(rest); return; }
                if (!ex) { ex = { sec: 'Izoh', lines: [] }; out.extra.push(ex); mode = 'extra'; }
                ex.lines.push(s);
            });
            return out;
        }
        function polPaste() {
            mdl('polPaste', `<div class="px-h"><b>📥 Telegram matnidan</b><button class="mini-btn" onclick="mdlClose('polPaste')">✕</button></div><div class="nd-tip">Guruhdagi polojeniya xabarini nusxalab shu yerga qoʻying. Ilova uni oʻqiydi va ilovadagi holat bilan solishtiradi — oʻzgarish faqat tasdiqlaganingizdan keyin.</div>
                <textarea id="polTxt" rows="12" style="width:100%" placeholder="2909.2026&#10;Смена ...&#10;&#10;Капитал участка&#10;Кр-4463&#10;..."></textarea><button class="action-btn" onclick="polPasteGo()">🔎 Oʻqish va solishtirish</button>`, true);
        }
        function polPasteGo() {
            const P = polParse(($id('polTxt') || {}).value || ''), E = escapeHtml, find = no => { const n = String(no).replace(/^0+/, ''); const L = onlyVagons().filter(v => String(vagonNo(v)).replace(/^0+/, '') === n); return L.length === 1 ? L[0] : null; };
            if (!P.items.length && !P.tayor.length && !P.extra.length) { alert('Matndan polojeniya oʻqilmadi.'); return; }
            const act = [], warn = [];
            P.items.forEach(x => { const v = find(x.v); if (!v) { warn.push('№ ' + x.v + ' pasportda topilmadi (yoki bir nechta)'); return; } if (v.status !== 'Tamirda') act.push({ k: 'in', v: v, x: x, t: '🔧 № ' + x.v + ' → taʼmirga (' + (POL_RT[x.rt] || x.rt) + ', ' + x.uch + ')' }); else if (!v.pol || v.pol.uch !== x.uch || v.pol.rt !== x.rt) act.push({ k: 'fix', v: v, x: x, t: '✏️ № ' + x.v + ': ' + (v.pol ? (POL_RT_TG[v.pol.rt] || '') + ' ' + (v.pol.uch || '') : 'uchastka yoʻq') + ' → ' + POL_RT_TG[x.rt] + ' ' + x.uch }); });
            P.tayor.forEach(x => { const v = find(x.v); if (!v) { warn.push('Tayyor № ' + x.v + ' pasportda topilmadi'); return; } if (v.status === 'Tamirda') act.push({ k: 'out', v: v, x: x, t: '✅ № ' + x.v + ' tayyor → ' + x.to }); });
            const listed = new Set(P.items.map(x => String(x.v).replace(/^0+/, '')).concat(P.tayor.map(x => String(x.v).replace(/^0+/, ''))));
            polInRepair().filter(v => v.pol && /Kapital|Depo/.test(v.pol.uch || '')).forEach(v => { if (!listed.has(String(vagonNo(v)).replace(/^0+/, ''))) warn.push('№ ' + vagonNo(v) + ' ilovada «' + v.pol.uch + '»da taʼmirda, lekin xabarda yoʻq'); });
            POL.pend = { P: P, act: act, warn: warn };
            mdl('polPaste', `<div class="px-h"><b>📥 Solishtirish natijasi</b><button class="mini-btn" onclick="mdlClose('polPaste')">✕</button></div>
                <div class="nd-tip">📅 ${E(P.date ? fmtISO(P.date) : '—')}${P.smena ? ' · 👷 ' + E(P.smena) : ''} · ${P.items.length} ta taʼmirda, ${P.tayor.length} ta tayyor${P.extra.length ? ', ' + P.extra.length + ' ta boshqa boʻlim' : ''}</div>
                ${act.length ? `<div class="hs-box"><div class="hs-h">Ilovada oʻzgaradi (belgilanganlari)</div>${act.map((a, i) => `<label class="dvp-row"><input type="checkbox" data-i="${i}" checked><div>${E(a.t)}</div></label>`).join('')}</div>` : '<div class="nd-tip">✅ Ilovadagi holat xabar bilan mos.</div>'}
                ${warn.length ? `<div class="hp-warn">⚠️ ${warn.map(E).join('<br>⚠️ ')}</div>` : ''}
                <button class="action-btn" onclick="polPasteApply()">✅ Qabul qilish</button>`, true);
        }
        function polPasteApply() {
            const Q = POL.pend; if (!Q) return; const sel = [...document.querySelectorAll('#polPaste input[data-i]:checked')].map(c => Q.act[+c.dataset.i]);
            const d = Q.P.date || polToday(), now = nowHM();
            sel.forEach(a => { const v = a.v, x = a.x;
                if (a.k === 'in' || a.k === 'fix') { if (a.k === 'in') { v.history = v.history || []; v.history.unshift({ date: d, type: "🔧 Ta'mirga yuborildi (" + POL_RT[x.rt] + ', ' + x.uch + ') — polojeniyadan (' + now + ')', author: authorStr(), ev: 'in', rt: x.rt, uch: x.uch, hm: '', by: 'Polojeniya xabari' + (Q.P.smena ? ', smena ' + Q.P.smena : '') + ', kiritdi ' + polPerson(authorStr()), src: 'pol' }); v.status = 'Tamirda'; v.kun = null; } v.pol = { rt: x.rt, uch: x.uch, since: (v.pol && v.pol.since) || d, note: x.note || '', at: (v.pol && v.pol.at) || '', by: (v.pol && v.pol.by) || ('Polojeniya xabari' + (Q.P.smena ? ', smena ' + Q.P.smena : '') + ', kiritdi ' + polPerson(authorStr())) }; }
                if (a.k === 'out') { polOutRec(v, d, x.to, 'Polojeniya xabari' + (Q.P.smena ? ', smena ' + Q.P.smena : '') + ', kiritdi ' + polPerson(authorStr()), 'polojeniyadan'); v.status = 'Auto'; try { recalcVagonStatus(v); } catch (e) {} } });
            const db = polDB(); let day = db.days.find(x => x.id === d); if (!day) { day = { id: d, date: d, at: new Date().toISOString(), extra: [], tayor: [] }; db.days.push(day); }
            if (Q.P.smena) day.smena = Q.P.smena; if (Q.P.extra.length) day.extra = Q.P.extra; 
            day.warn = Q.warn; day.src = 'telegram'; day.upd = new Date().toISOString();
            day.snap = polSnap(d); polSave(db);
            saveDB(); try { filterVagonlar(); } catch (e) {} mdlClose('polPaste'); POL.pend = null; POL.date = d; showToast('✅ Polojeniya qabul qilindi: ' + sel.length + ' ta oʻzgarish'); polRender(true);
        }
        function polCfgOpen() {
            const C = polCfg();
            mdl('polPaste', `<div class="px-h"><b>⚙️ Uchastkalar</b><button class="mini-btn" onclick="mdlClose('polPaste')">✕</button></div><div class="nd-tip">Har qatorda bitta uchastka. «=» dan keyin Telegram'dagi nomi (ixtiyoriy).</div>
                <textarea id="polUch" rows="8" style="width:100%">${escapeHtml(C.uch.map(u => u + ((C.uchTg || {})[u] ? ' = ' + C.uchTg[u] : '')).join('\n'))}</textarea><button class="action-btn" onclick="polCfgSave()">💾 Saqlash</button>`, true);
        }
        function polCfgSave() { const L = ($id('polUch').value || '').split('\n').map(s => s.trim()).filter(Boolean), C = { uch: [], uchTg: {} }; L.forEach(s => { const [a, b] = s.split('=').map(x => x.trim()); if (!a) return; C.uch.push(a); if (b) C.uchTg[a] = b; }); if (!C.uch.length) return; kvSet(POL_CFG_KEY, C); mdlClose('polPaste'); polRender(); }
        // Boshqa qurilmadan kelgan polojeniya — qisqa bildirishnoma (ko'rilgach yo'qoladi)
        function polCheckNew() {
            try { const db = polDB(), last = db.days.slice().sort((a, b) => String(b.upd || '').localeCompare(String(a.upd || '')))[0]; if (!last || !last.upd) return; const seen = localStorage.getItem('agmk_pol_seen') || ''; if (last.upd <= seen) return; localStorage.setItem('agmk_pol_seen', last.upd); if (!seen) return;
                if (String(last.by || '').indexOf(String(currentUser && currentUser.name || '~')) === 0) return;
                const n = (last.snap || []).reduce((a, g) => a + g.list.length, 0); notify({ icon: '📋', text: 'Yangi polojeniya ' + fmtISO(last.date) + ' (Vagon xizmati): taʼmirda ' + n + ' ta' + (last.nOut ? ', chiqarildi ' + last.nOut + ' ta' : ''), toAll: true, eph: true, pol: last.date, byTabel: '~' }); } catch (e) {}
        }
        (function () {
            try { if (typeof KV_SYNC !== 'undefined') [POL_KEY, POL_CFG_KEY].forEach(k => { if (!KV_SYNC.keys.includes(k)) KV_SYNC.keys.push(k); }); } catch (e) {}
            try { if (typeof SEC_EV !== 'undefined') SEC_EV.fns.push(polCheckNew); } catch (e) {}
            const c = document.createElement('style'); c.textContent = '.pol-v{display:flex;align-items:center;gap:8px;padding:7px 4px;border-bottom:1px solid rgba(255,255,255,.07)}.pol-v b{min-width:92px;color:#f8fafc}.pol-v small{flex:1;color:#94a3b8}.pol-i{font-size:11.5px;color:#7dd3fc;padding:0 4px 7px 6px;border-bottom:1px solid rgba(255,255,255,.07);margin-top:-6px}.pol-done b{color:#86efac!important}.pol-done small{text-decoration:line-through;opacity:.7}.pol-i.pol-o{color:#86efac;margin-top:0}.pol-i i{color:#fbbf24;font-style:normal}.pol-x{margin:6px 0;font-size:13px;color:#e2e8f0}.pol-x b{display:block;color:#7dd3fc}';
            document.head.appendChild(c);
        })();

