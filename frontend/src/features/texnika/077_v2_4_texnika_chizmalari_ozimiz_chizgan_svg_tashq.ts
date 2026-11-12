        // =====================================================================
        // v2.4 — TEXNIKA CHIZMALARI (o'zimiz chizgan SVG; tashqi rasm ishlatilmaydi)
        //  Vagon turiga qarab shakl va rang: dumpkar, xopper, sisterna, yarim vagon, platforma
        //  Lokomotiv: elektrovoz (pantograf, yashil-sariq), teplovoz (kabina+kapot, qizil-sariq)
        //  Holat: qizil hoshiya + nuqta — ta'mir talab; sariq nuqta — DR yaqin; kulrang — ta'mirda
        // =====================================================================
        // v3.5.1: texnika turlari ranglari — YAGONA manba: tur tugmalari, roʻyxat, pasport, tarkib, GPS xarita, izohlar — hammasi shu yerdan oladi
        var TYPE_C = { d105: '#B45309', d115: '#1D4ED8', d60: '#4D7C0F', cis: '#EAB308', hop: '#6D28D9', hop1941: '#0F766E', plat: '#A8A29E', gon: '#BE185D', box: '#475569', ref: '#E2E8F0', pas: '#1E40AF' };
        var DUMP_C = { '105': TYPE_C.d105, '115': TYPE_C.d115, '60': TYPE_C.d60 };
        var HD_KINDS = {
            el: { t: 'Elektrovoz', c: '#3B6D11' }, tep: { t: 'Teplovoz', c: '#A32D2D' }, lok: { t: 'Lokomotiv', c: '#185FA5' },
            dump: { t: 'Dumpkar', c: TYPE_C.d105 }, hop: { t: 'Xopper', c: TYPE_C.hop }, cis: { t: 'Sisterna', c: TYPE_C.cis },
            yarim: { t: 'Yarim vagon', c: TYPE_C.gon }, plat: { t: 'Platforma', c: TYPE_C.plat }, box: { t: 'Vagon', c: TYPE_C.box }
        };
        function hdKind(v) {
            if (!v) return 'box'; const s = String((v.type || '') + ' ' + (v.model || '') + ' ' + (v.naim || '') + ' ' + (v.name || '')).toLowerCase();
            const lok = (typeof isLok === 'function' && isLok(v)) || /локомот|lokomot|электровоз|elektrovoz|тепловоз|teplovoz|пэ2|pe2|тэм|тгм|тяговый агрегат|tortuvchi/.test(s);
            if (lok) { if (/пэ2|pe2|электровоз|elektrovoz|тяговый агрегат|эл-?\d|op2|оп2|ел-?\d/.test(s)) return 'el'; if (/тепловоз|teplovoz|тэм|тгм|tem|tgm|дизел|dizel/.test(s)) return 'tep'; return 'lok'; }
            if (/хоп|hop|xop|дозат|dozat/.test(s)) return 'hop';
            if (/думпкар|dumpkar|\dвс-?\d|\dvs-?\d/.test(s)) return 'dump';
            if (/цистерн|sistern|цс-/.test(s)) return 'cis';
            if (/полувагон|yarim/.test(s)) return 'yarim';
            if (/платформ|platform/.test(s)) return 'plat';
            return 'box';
        }
        function hdStat(v) { if (!v) return ''; if (v.status === 'Tamirda' || (typeof hrInRepair === 'function' && hrInRepair(v))) return 'rep'; if (v.status === "Ta'mir talab") return 'red'; if (v.status === 'Yaqin') return 'amb'; return ''; }
        // Aravacha (ikki g'ildirak) — x markazi
        function hdBogie(x) { return `<rect x="${x - 12}" y="44" width="24" height="3" rx="1" fill="#1f2937"/><circle cx="${x - 6}" cy="50" r="4.6" fill="#1f2937"/><circle cx="${x + 6}" cy="50" r="4.6" fill="#1f2937"/><circle cx="${x - 6}" cy="50" r="1.5" fill="#94a3b8"/><circle cx="${x + 6}" cy="50" r="1.5" fill="#94a3b8"/>`; }
        // v2.5: modelga qarab farqlash (xopper 55-76 / 19-4101; dumpkar 105 / 115 / 60)
        function hdModel(kind, v) {
            if (!v) return null; const t = typeof vTypeFull === 'function' ? vTypeFull(v) : String(v.type || ''), m = String(v.model || '');
            if (kind === 'hop') { if (/19-?4101/.test(m)) return { lbl: '19-4101', vw: 124, fun: 3, c: TYPE_C.hop1941 }; if (/55-?76/.test(m)) return { lbl: '55-76', vw: 100, fun: 2, c: TYPE_C.hop }; return null; }
            if (kind === 'dump') { if (/115/.test(t)) return { lbl: '115', vw: 112, c: DUMP_C['115'], ribs: 4 }; if (/\b60\b/.test(t)) return { lbl: '60', vw: 86, c: DUMP_C['60'], ribs: 2 }; if (/105/.test(t)) return { lbl: '105', vw: 100, c: DUMP_C['105'], ribs: 3 }; return null; }
            return null;
        }
        function hdSvg(kind, st, w, v, exact) {
            const K = HD_KINDS[kind] || HD_KINDS.box, md = hdModel(kind, v), c = st === 'rep' ? '#64748b' : (md ? md.c : K.c); let b = '';
            const dark = '#1e293b', win = '#B5D4F4', strip = '#EF9F27';
            if (kind === 'el') {
                b = `<line x1="4" y1="2" x2="116" y2="2" stroke="#64748b" stroke-width="0.8"/><polyline points="26,14 34,4 42,4" fill="none" stroke="#94a3b8" stroke-width="1.6"/><polyline points="78,14 86,4 94,4" fill="none" stroke="#94a3b8" stroke-width="1.6"/>
                    <path d="M4 42 L4 22 Q6 14 16 14 L104 14 Q114 14 116 22 L116 42 Z" fill="${c}"/><rect x="4" y="27" width="112" height="4" fill="${strip}"/>
                    <rect x="8" y="18" width="9" height="7" rx="1" fill="${win}"/><rect x="103" y="18" width="9" height="7" rx="1" fill="${win}"/><rect x="36" y="18" width="7" height="5" fill="#27500A"/><rect x="48" y="18" width="7" height="5" fill="#27500A"/><rect x="66" y="18" width="7" height="5" fill="#27500A"/><rect x="78" y="18" width="7" height="5" fill="#27500A"/>
                    <rect x="2" y="41" width="116" height="4" fill="#111827"/>` + hdBogie(30) + hdBogie(90);
                return hdWrap(b, 120, st, w);
            }
            if (kind === 'tep' || kind === 'lok') {
                const cc = kind === 'lok' ? c : c;
                b = `<rect x="94" y="8" width="6" height="8" rx="1" fill="#475569"/>
                    <rect x="4" y="10" width="26" height="32" rx="3" fill="${cc}"/><rect x="28" y="18" width="88" height="24" rx="3" fill="${cc}"/><rect x="4" y="31" width="112" height="4" fill="${strip}"/>
                    <rect x="8" y="14" width="8" height="8" rx="1" fill="${win}"/><rect x="18" y="14" width="8" height="8" rx="1" fill="${win}"/>
                    <g stroke="rgba(0,0,0,0.35)" stroke-width="1"><line x1="44" y1="21" x2="44" y2="30"/><line x1="54" y1="21" x2="54" y2="30"/><line x1="64" y1="21" x2="64" y2="30"/><line x1="74" y1="21" x2="74" y2="30"/><line x1="84" y1="21" x2="84" y2="30"/><line x1="94" y1="21" x2="94" y2="30"/><line x1="104" y1="21" x2="104" y2="30"/></g>
                    <rect x="2" y="41" width="116" height="4" fill="#111827"/>` + hdBogie(30) + hdBogie(90);
                return hdWrap(b, 120, st, w);
            }
            if (md && (kind === 'dump' || kind === 'hop')) {
                const W = md.vw, R = W - 4, tag = `<text x="4" y="9" font-size="8.5" font-weight="700" fill="#e2e8f0" font-family="sans-serif">${md.lbl}</text>`;
                if (kind === 'dump') { const n = md.ribs, ribs = Array.from({ length: n }, (_, i) => { const x = 2 + (W - 4) * (i + 1) / (n + 1); return `<line x1="${x.toFixed(1)}" y1="16" x2="${x.toFixed(1)}" y2="39"/>`; }).join('');
                    b = `<polygon points="2,14 ${W - 2},14 ${W - 10},40 10,40" fill="${c}"/><rect x="2" y="12" width="${W - 4}" height="3" fill="rgba(0,0,0,0.25)"/><g stroke="rgba(0,0,0,0.3)" stroke-width="1.2">${ribs}</g>`; }
                else { const n = md.fun, seg = (W - 8) / n; let poly = `4,15 ${R},15 ${R},28`; for (let i = n - 1; i >= 0; i--) { const x0 = 4 + seg * i, xm = x0 + seg / 2; poly += ` ${(x0 + seg * 0.82).toFixed(1)},40 ${(xm).toFixed(1)},31 ${(x0 + seg * 0.18).toFixed(1)},40`; } poly += ` 4,28`;
                    b = `<rect x="4" y="12" width="${W - 8}" height="3" fill="rgba(0,0,0,0.3)"/><polygon points="${poly}" fill="${c}"/>`; }
                b += tag + `<rect x="3" y="40" width="${W - 6}" height="4" fill="#111827"/>` + hdBogie(22) + hdBogie(W - 22);
                return hdWrap(b, W, st, w ? (exact ? w : w * W / 100) : 0);
            }
            if (kind === 'dump') b = `<polygon points="2,14 98,14 90,40 10,40" fill="${c}"/><rect x="2" y="12" width="96" height="3" fill="rgba(0,0,0,0.25)"/><g stroke="rgba(0,0,0,0.3)" stroke-width="1.2"><line x1="26" y1="16" x2="26" y2="39"/><line x1="50" y1="16" x2="50" y2="39"/><line x1="74" y1="16" x2="74" y2="39"/></g>`;
            else if (kind === 'hop') b = `<rect x="4" y="12" width="92" height="3" fill="rgba(0,0,0,0.3)"/><polygon points="4,15 96,15 96,28 82,40 64,30 36,30 18,40 4,28" fill="${c}"/><g stroke="rgba(0,0,0,0.3)" stroke-width="1"><line x1="30" y1="16" x2="30" y2="29"/><line x1="50" y1="16" x2="50" y2="29"/><line x1="70" y1="16" x2="70" y2="29"/></g>`;
            else if (kind === 'cis') b = `<rect x="46" y="8" width="8" height="8" rx="1" fill="${c}"/><rect x="5" y="15" width="90" height="25" rx="12.5" fill="${c}"/><rect x="5" y="25" width="90" height="2" fill="rgba(255,255,255,0.18)"/><g stroke="#cbd5e1" stroke-width="0.9"><line x1="60" y1="12" x2="60" y2="40"/><line x1="64" y1="12" x2="64" y2="40"/><line x1="60" y1="20" x2="64" y2="20"/><line x1="60" y1="28" x2="64" y2="28"/><line x1="60" y1="36" x2="64" y2="36"/></g>`;
            else if (kind === 'yarim') b = `<rect x="3" y="14" width="94" height="26" rx="1" fill="${c}"/><g stroke="rgba(0,0,0,0.3)" stroke-width="1.1"><line x1="20" y1="15" x2="20" y2="39"/><line x1="36" y1="15" x2="36" y2="39"/><line x1="52" y1="15" x2="52" y2="39"/><line x1="68" y1="15" x2="68" y2="39"/><line x1="84" y1="15" x2="84" y2="39"/></g>`;
            else if (kind === 'plat') b = `<rect x="2" y="34" width="96" height="6" rx="1" fill="${c}"/><g stroke="${c}" stroke-width="1.6"><line x1="8" y1="26" x2="8" y2="34"/><line x1="92" y1="26" x2="92" y2="34"/></g>`;
            else b = `<rect x="4" y="10" width="92" height="30" rx="2" fill="${c}"/><rect x="42" y="16" width="16" height="22" fill="rgba(0,0,0,0.25)"/>`;
            b += `<rect x="3" y="40" width="94" height="4" fill="#111827"/>` + hdBogie(22) + hdBogie(78);
            return hdWrap(b, 100, st, w);
        }
        function hdWrap(body, vw, st, w) {
            let ov = '';
            if (st === 'red') ov = `<rect x="1" y="1" width="${vw - 2}" height="46" rx="4" fill="none" stroke="#ef4444" stroke-width="2.4"/><circle cx="${vw - 6}" cy="7" r="5" fill="#ef4444" stroke="#0f172a" stroke-width="1"/>`;
            else if (st === 'amb') ov = `<circle cx="${vw - 6}" cy="7" r="5" fill="#f59e0b" stroke="#0f172a" stroke-width="1"/>`;
            else if (st === 'rep') ov = `<text x="${vw - 12}" y="11" font-size="10">🔧</text>`;
            return `<svg class="hd-svg" viewBox="0 0 ${vw} 56" width="${w || vw * 0.62}" height="${(w || vw * 0.62) * 56 / vw}" aria-hidden="true">${body}${ov}</svg>`;
        }
        function hdUnit(v, o) {
            o = o || {}; const k = hdKind(v), st = hdStat(v), lok = /^(el|tep|lok)$/.test(k);
            const w = (o.w || 62) * (lok ? 1.2 : 1), no = v ? (lok && typeof hrName === 'function' ? hrName(v) : vagonNo(v)) : '?';
            const clk = o.edit ? `hdEdPick(${JSON.stringify(v ? v.id : null)})` : (v ? `openPassport(${JSON.stringify(v.id)})` : '');
            return `<div class="hd-u${o.sel ? ' sel' : ''}" onclick="event.stopPropagation(); ${clk}" title="${escapeHtml(HD_KINDS[k].t + ' ' + no)}">${hdSvg(k, st, w, v)}<span>${escapeHtml(String(no).slice(0, 18))}</span></div>`;
        }
        function hdTrain(lok, vs, o) {
            o = o || {}; const parts = [];
            if (lok) parts.push(hdUnit(lok, { w: o.w, edit: o.edit, sel: o.sel === lok.id }));
            (vs || []).forEach(v => parts.push(hdUnit(v, { w: o.w, edit: o.edit, sel: o.sel === (v && v.id) })));
            if (!parts.length) return '';
            const cnt = {}; (vs || []).forEach(v => { const k = hdKind(v); cnt[k] = (cnt[k] || 0) + 1; });
            const leg = Object.keys(cnt).map(k => `<span><i style="background:${HD_KINDS[k].c}"></i>${HD_KINDS[k].t} ${cnt[k]}</span>`).join('');
            return `<div class="hd-train"><div class="hd-row">${parts.join('<b class="hd-cpl"></b>')}</div></div>${leg ? `<div class="hd-leg">${leg}</div>` : ''}`;
        }
        function hdLegendHtml() { return '<div class="hd-leg">' + ['el', 'tep', 'dump', 'hop', 'cis', 'yarim', 'plat'].map(k => `<span><i style="background:${HD_KINDS[k].c}"></i>${HD_KINDS[k].t}</span>`).join('') + '<span>🟥 hoshiya — taʼmir talab</span><span>🟡 — DR yaqin</span></div>'; }

        // ---- Tarkib tahrirlash: poyezd ko'rinishida, tartibni o'zgartirish, oraliq bilan qo'shish ----
        var HDE = { sel: null };
        function hdEdPick(id) { HDE.sel = HDE.sel === id ? null : id; hdEdRender(); }
        function hdEdMove(dir) { const i = HR.sel.indexOf(HDE.sel); if (i < 0) return; const j = i + dir; if (j < 0 || j >= HR.sel.length) return; const t = HR.sel[i]; HR.sel[i] = HR.sel[j]; HR.sel[j] = t; hrRenderPick(); }
        function hdEdDel() { const i = HR.sel.indexOf(HDE.sel); if (i >= 0) { HR.sel.splice(i, 1); HDE.sel = null; hrRenderPick(); } }
        function hdEdRange() {
            const s = String(($id('hdRange') || {}).value || '').trim(); if (!s) return;
            const d = hrDB(), busy = {}; d.tarkiblar.forEach(t => { if (t.id !== HR.edit) t.vagonIds.forEach(id => { busy[id] = t.no; }); });
            const want = []; s.split(/[,;\s]+/).filter(Boolean).forEach(p => { const m = p.match(/^(\d+)\s*[-–]\s*(\d+)$/); if (m) { const a = +m[1], b = +m[2]; if (b >= a && b - a <= 200) for (let x = a; x <= b; x++) want.push(String(x)); } else if (/^\d+$/.test(p)) want.push(p); });
            let add = 0, skip = [];
            want.forEach(n => { const v = onlyVagons().find(x => String(vagonNo(x)).replace(/^0+/, '') === n.replace(/^0+/, '')); if (!v) { skip.push(n + ' (topilmadi)'); return; } if (HR.sel.includes(v.id)) return; if (hrInRepair(v)) { skip.push(n + " (taʼmirda)"); return; } if (busy[v.id]) { skip.push(n + ' (tarkib №' + busy[v.id] + ')'); return; } HR.sel.push(v.id); add++; });
            $id('hdRange').value = ''; hrRenderPick(); showToast('➕ ' + add + ' ta vagon qoʻshildi' + (skip.length ? ' · qoʻshilmadi: ' + skip.slice(0, 5).join(', ') + (skip.length > 5 ? '…' : '') : ''));
        }
        function hdEdRender() {
            const box = $id('hdEdTrain'); if (!box) return;
            const lok = vagonlarData.find(x => x.id === (+($id('hrTLok') || {}).value || null));
            const vs = HR.sel.map(id => vagonlarData.find(x => x.id === id)).filter(Boolean);
            box.innerHTML = (lok || vs.length ? hdTrain(lok, vs, { edit: true, sel: HDE.sel }) : '<div class="nd-tip">Lokomotiv va vagonlarni tanlang — poyezd shu yerda yigʻiladi.</div>') +
                (HDE.sel && HR.sel.includes(HDE.sel) ? `<div class="hd-ed"><button onclick="hdEdMove(-1)">◀ Oldinga</button><button onclick="hdEdMove(1)">Orqaga ▶</button><button class="del" onclick="hdEdDel()">✕ Chiqarish</button></div>` : '');
        }
        (function () {
            if (typeof hrRenderPick === 'function') { hrRenderPick = agmkExtend('hrRenderPick', 'v2.5: modelga qarab farqlash (xopper 55-76 / 19-4101; dumpkar 105 / 115 / 60)', hrRenderPick, o => function () { const r = o.apply(this, arguments); try { hdEdRender(); } catch (e) { console.error(e); } return r; }); }
            if (typeof hrEditTarkib === 'function') { hrEditTarkib = agmkExtend('hrEditTarkib', 'v2.5: modelga qarab farqlash (xopper 55-76 / 19-4101; dumpkar 105 / 115 / 60)', hrEditTarkib, o => function () { HDE.sel = null; const r = o.apply(this, arguments); try {
                const sel = $id('hrSel'); if (sel && !$id('hdEdTrain')) sel.insertAdjacentHTML('beforebegin', `<div id="hdEdTrain" class="hd-edbox"></div><div class="hd-rng"><input id="hdRange" placeholder="Tez qoʻshish: 1201-1214, 1220" onkeydown="if(event.key==='Enter')hdEdRange()"><button onclick="hdEdRange()">➕</button></div>`);
                const lk = $id('hrTLok'); if (lk) lk.addEventListener('change', hdEdRender); hdEdRender(); } catch (e) { console.error(e); } return r; }); }
            if (typeof hrTarkibCard === 'function') { hrTarkibCard = agmkExtend('hrTarkibCard', 'v2.5: modelga qarab farqlash (xopper 55-76 / 19-4101; dumpkar 105 / 115 / 60)', hrTarkibCard, o => function (t) { let h = o.apply(this, arguments); try { const lok = vagonlarData.find(x => x.id === t.lokId), vs = t.vagonIds.map(id => vagonlarData.find(x => x.id === id)).filter(Boolean); const tr = hdTrain(lok, vs); if (/<div class="hr-chips">[\s\S]*?<\/div>/.test(h)) h = h.replace(/<div class="hr-chips">[\s\S]*?<\/div>/, tr); else if (lok) h = h.replace(/(<div class="hr-i">)/, tr + '$1'); } catch (e) {} return h; }); }
            if (typeof vagonCardHtml === 'function') { vagonCardHtml = agmkExtend('vagonCardHtml', 'v2.5: modelga qarab farqlash (xopper 55-76 / 19-4101; dumpkar 105 / 115 / 60)', vagonCardHtml, o => function (v) { let h = o.apply(this, arguments); try { h = h.replace('<div class="vagon-num-container">', '<div class="vagon-num-container"><div class="hd-vic">' + hdSvg(hdKind(v), hdStat(v), 46, v) + '</div>'); } catch (e) {} return h; }); }
        })();
        // ---- Avtotraktor texnikasi chizmalari (navigator uchun, ustdan-yon ko'rinish) ----
        var HD_AVTO = { sam: ['Samosval', '#d97706'], ekv: ['Ekskavator', '#eab308'], bul: ['Buldozer', '#ca8a04'], kran: ['Kran', '#f59e0b'], yuk: ['Yuklagich', '#65a30d'], bus: ['Avtobus', '#2563eb'], trak: ['Traktor', '#16a34a'], car: ['Avtomobil', '#64748b'] };
        function hdAvtoKind(v) { const s = String((v && (v.type + ' ' + (v.naim || '') + ' ' + (v.model || ''))) || '').toLowerCase(); if (/самосвал|samosval|белаз|belaz|камаз|kamaz|howo|shacman|самосв/.test(s)) return 'sam'; if (/экскават|ekskavat/.test(s)) return 'ekv'; if (/бульдоз|buldoz/.test(s)) return 'bul'; if (/кран|kran/.test(s)) return 'kran'; if (/погрузч|yuklagich|frontal/.test(s)) return 'yuk'; if (/автобус|avtobus|пазик|bus/.test(s)) return 'bus'; if (/трактор|traktor|мтз/.test(s)) return 'trak'; return 'car'; }
        function hdAvtoSvg(k, w) {
            const c = (HD_AVTO[k] || HD_AVTO.car)[1], wh = x => `<circle cx="${x}" cy="46" r="7" fill="#111827"/><circle cx="${x}" cy="46" r="2.5" fill="#94a3b8"/>`; let b = '';
            if (k === 'sam') b = `<polygon points="30,14 96,14 92,38 34,38" fill="${c}"/><rect x="6" y="20" width="24" height="18" rx="3" fill="${c}"/><rect x="10" y="23" width="12" height="7" rx="1" fill="#B5D4F4"/><rect x="4" y="37" width="92" height="4" fill="#1f2937"/>` + wh(18) + wh(66) + wh(84);
            else if (k === 'ekv') b = `<rect x="10" y="30" width="56" height="10" rx="4" fill="#1f2937"/><rect x="14" y="16" width="40" height="15" rx="2" fill="${c}"/><rect x="18" y="19" width="10" height="7" fill="#B5D4F4"/><polyline points="52,20 76,6 92,26" fill="none" stroke="${c}" stroke-width="4"/><polygon points="88,24 98,26 94,36 86,32" fill="#475569"/>` + wh(18) + wh(58);
            else if (k === 'bul') b = `<rect x="14" y="18" width="50" height="18" rx="2" fill="${c}"/><rect x="20" y="10" width="20" height="10" fill="${c}"/><rect x="23" y="12" width="12" height="6" fill="#B5D4F4"/><rect x="66" y="16" width="6" height="26" fill="#475569"/><rect x="8" y="36" width="60" height="12" rx="6" fill="#1f2937"/>`;
            else if (k === 'kran') b = `<rect x="6" y="24" width="84" height="14" rx="2" fill="${c}"/><rect x="8" y="16" width="18" height="10" rx="2" fill="${c}"/><rect x="11" y="18" width="10" height="6" fill="#B5D4F4"/><line x1="40" y1="24" x2="96" y2="4" stroke="#fbbf24" stroke-width="4"/>` + wh(18) + wh(60) + wh(78);
            else if (k === 'yuk') b = `<rect x="24" y="18" width="44" height="20" rx="3" fill="${c}"/><rect x="30" y="8" width="18" height="12" fill="${c}"/><rect x="33" y="10" width="12" height="7" fill="#B5D4F4"/><polygon points="70,22 90,22 96,40 76,40" fill="#475569"/>` + wh(32) + wh(62);
            else if (k === 'bus') b = `<rect x="4" y="10" width="92" height="30" rx="5" fill="${c}"/><rect x="10" y="15" width="78" height="10" fill="#B5D4F4"/>` + wh(22) + wh(78);
            else if (k === 'trak') b = `<rect x="30" y="20" width="40" height="16" rx="2" fill="${c}"/><rect x="36" y="8" width="20" height="14" fill="${c}"/><rect x="39" y="11" width="14" height="8" fill="#B5D4F4"/><circle cx="36" cy="42" r="11" fill="#111827"/><circle cx="72" cy="46" r="7" fill="#111827"/>`;
            else b = `<path d="M8 38 L12 24 Q16 16 28 16 L66 16 Q76 16 82 24 L92 28 L92 38 Z" fill="${c}"/><rect x="30" y="19" width="16" height="8" fill="#B5D4F4"/><rect x="50" y="19" width="16" height="8" fill="#B5D4F4"/>` + wh(24) + wh(76);
            return `<svg class="hd-svg" viewBox="0 0 100 56" width="${w || 56}" height="${(w || 56) * 0.56}" aria-hidden="true">${b}</svg>`;
        }

