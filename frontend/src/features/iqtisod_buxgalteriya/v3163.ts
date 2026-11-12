        // v3.16.3 — FOT tahlili: «Расходы периода» prognozi oʻzi tekshiradi va oʻzini moslaydi
        //  1) 2-prognoz faylida «Заработная плата по расходам периода» boʻlimi toʻgʻri topiladi.
        //     Xato: varaq tepasidagi umumiy «Фонд заработной платы рабочих и ИТР…» bloki birinchi sex deb olinardi —
        //     718-qatordagi boʻlim undan «keyin» qolib, tashlab yuborilardi (рабочих, АУП, рыбоводы, доп. отпуск, талоны boʻsh qolardi).
        //     Endi boʻlim — oʻzidan keyingi birinchi sex blokigacha.
        //  2) Iqtisodchining havolasi istalgan oy ustunida boʻlsa (formula yoki «=» siz matn) — ilova uni oʻrganadi va
        //     hisoblanayotgan oyga koʻchiradi: «[…]Авг!$BN$725» → «Сен» varagʻida xuddi shu nomli qator (qator raqami siljisa ham).
        //  3) Oʻzini tekshirish: 2-fayldagi boʻlimning har bir qatori biror varaqqa tushdimi; oʻtgan oyda bor boʻlgan
        //     asosiy qatorlar bu oy boʻsh qolmadimi; keskin farq yoʻqmi — natijada roʻyxat bilan koʻrsatiladi.
        if (typeof fotPerIndex === 'function') fotPerIndex = agmkExtend('fotPerIndex', 'v3.16.3: Расходы периода boʻlimi chegarasi', fotPerIndex, o => function (FB, shName) {
            const I = o.apply(this, arguments); if (!I) return I;
            try { const z = I.R.findIndex(x => /^Заработная плата по расходам периода/i.test(x.lab)); if (z >= 0) { const zr = I.R[z].r, h = I.heads.find(x => x.r > zr), h0 = h ? h.r : Infinity; I.per = I.R.slice(z + 1).filter(x => !x.c && x.r < h0); I.zr = zr; } } catch (e) {}
            return I;
        });
        var FOTP = { core: /^(Расходы на оплату труда (рабочих|АУП)|в\s*т\.?\s*ч\.?\s*рыбовод|Дополнительный отпуск|Налогооблагаемые талоны)/i, stable: /^Расходы на оплату труда (рабочих|АУП)/i };
        function fotLinkOf(c) { if (!c) return ''; const s = c.f || (typeof c.v === 'string' ? c.v : ''); return s && s.indexOf(']') >= 0 && /![$A-Z]+\$?\d+/.test(s) ? s : ''; }
        function fotNum(c) { if (!c) return null; const v = typeof c.v === 'number' ? c.v : parseFloat(String(c.v == null ? '' : c.v).replace(/\s/g, '')); return isNaN(v) ? null : v; }
        // havoladagi katak qatori → hisoblanayotgan oy varagʻidagi xuddi shu nomli qator (eng yaqini)
        function fotMoveRef(FB2, IX, fromSh, ref, toSh) {
            const m = ref.match(/^([A-Z]+)(\d+)$/); if (!m) return null; const r = +m[2];
            const A = IX(fromSh), T = IX(toSh); if (!A || !T) return null;
            const src = A.R.find(x => x.r === r); if (!src || !src.lab) return fromSh === toSh ? ref : null;
            const key = s => String(s).toLowerCase().replace(/\s+/g, ' ').trim(), k = key(src.lab);
            const C = T.R.filter(x => key(x.lab) === k && String(x.c || '') === String(src.c || '')); if (!C.length) return null;
            C.sort((a, b) => Math.abs(a.r - r) - Math.abs(b.r - r)); return m[1] + C[0].r;
        }
        if (typeof fotPerFill === 'function') fotPerFill = agmkExtend('fotPerFill', 'v3.16.3: havolani oʻrganish va oʻzini tekshirish', fotPerFill, o => function (R6, B, res, FB2) {
            const out = o.apply(this, arguments); if (!FB2 || !out) return out;
            out.chk = []; out.learn = [];
            try {
                const tSh = FOT_FSH[res.mon], FC = fotForecast(FB2), M = FC.get(tSh); if (!M) return out;
                const ixc = {}, IX = n => (n in ixc ? ixc[n] : (ixc[n] = fotPerIndex(FB2, n))), I = IX(tSh);
                const val = (c, r) => { const v = M[c + r]; return typeof v === 'number' ? v : (v != null && !isNaN(parseFloat(v)) ? parseFloat(v) : 0); };
                const cache = {}, clrOld = (FOTS._clr && FOTS._clr.old) || {}, filled = [];
                res.sheets.forEach(S => {
                    const sh = B.sheets.find(x => x.path === S.path); if (!sh) return; const P = fotSheetPlan(B, sh, cache), col = P.mons[res.mon]; if (!col) return;
                    const up = res.upd[S.path] = res.upd[S.path] || {}, old = clrOld[S.path] || P.C, nm = String(S.name).trim();
                    const months = Object.keys(P.mons).map(Number).filter(m => m !== res.mon).sort((a, b) => (a < res.mon ? res.mon - a : 100 + a) - (b < res.mon ? res.mon - b : 100 + b));
                    const prevM = months.find(m => m < res.mon), prevCol = prevM !== undefined ? P.mons[prevM] : null;
                    P.rows.filter(r => r.per).forEach(row => {
                        const ref = col + row.r;
                        // 2) oʻz oyida havola yoʻq — boshqa oydagi havoladan oʻrganish
                        if (!fotLinkOf(old[ref])) for (const m of months) {
                            const lk = fotLinkOf(old[P.mons[m] + row.r]); if (!lk) continue; const refs = fotRefs(lk); if (!refs.length) continue;
                            const mv = refs.map(x => ({ op: x.op, ref: FOT_FSH.indexOf(x.sh) >= 0 ? fotMoveRef(FB2, IX, x.sh, x.ref, tSh) : null }));
                            if (mv.some(x => !x.ref)) continue;
                            const v = Math.round(mv.reduce((a, x) => a + x.op * val(x.ref.replace(/\d+$/, ''), +x.ref.match(/\d+$/)[0]), 0));
                            const prev = up[ref] ? Number(up[ref].v) : null;
                            if (v) { up[ref] = { f: '', v: v }; const rr = S.rows.find(x => x.r === row.r); if (rr) rr.prog = v; }
                            else delete up[ref];
                            const how = 'havola ' + FOT_FSH[m] + '→' + tSh + ': ' + mv.map((x, i) => (i ? (x.op < 0 ? '−' : '+') : (x.op < 0 ? '−' : '')) + x.ref).join('');
                            const s = out.src.find(z => z.sh === nm && z.r === row.r); if (s) { s.v = v; s.how = how; } else if (v) { out.src.push({ sh: nm, r: row.r, lbl: row.lbl, v: v, how: how }); out.n++; }
                            out.learn.push({ sh: nm, r: row.r, lbl: row.lbl, how: how, v: v, was: prev });
                            break;
                        }
                        const now = up[ref] ? Number(up[ref].v) || 0 : 0; if (now) filled.push({ sh: nm, lbl: row.lbl, v: now });
                        // 3b) oʻtgan oy bilan solishtirish (asosiy qatorlar)
                        if (FOTP.core.test(row.lbl) && prevCol) {
                            const pv = fotNum(old[prevCol + row.r]); if (pv && Math.abs(pv) >= 1) {
                                if (!now) out.chk.push({ lvl: 'warn', sh: nm, msg: '«' + row.lbl.slice(0, 45) + '» — oʻtgan oy ' + fotN(pv) + ' edi, bu oy prognoz topilmadi' });
                                else if (FOTP.stable.test(row.lbl) && (now / pv > 1.5 || now / pv < 0.67)) out.chk.push({ lvl: 'warn', sh: nm, msg: '«' + row.lbl.slice(0, 45) + '» — oʻtgan oy ' + fotN(pv) + ', bu oy ' + fotN(now) + ' (keskin farq, tekshiring)' });
                            }
                        }
                    });
                });
                // 3a) 2-fayl boʻlimining har bir qatori biror varaqqa tushdimi
                if (I && I.per && I.per.length) {
                    const nets = new Set(); filled.forEach(f => nets.add(Math.round(f.v)));
                    const has = v => [...nets].some(x => Math.abs(x - v) <= 1);
                    const L = I.per.map(x => ({ r: x.r, lab: x.lab, bn: val('BN', x.r), net: val('BN', x.r) - val('BL', x.r) - val('BJ', x.r), bl: val('BL', x.r), bj: val('BJ', x.r) })).filter(x => Math.round(x.bn));
                    const ok = L.map(x => has(Math.round(x.net)) || has(Math.round(x.bn)));
                    L.forEach((x, i) => { if (ok[i]) return; const kids = L.slice(i + 1).filter((y, j) => ok[i + 1 + j]); let s = 0; for (const y of kids) { s += y.bn; if (Math.abs(s - x.bn) <= 1) { ok[i] = true; break; } } }); // ota qator (НПП = АХЧ)
                    L.forEach((x, i) => { if (!ok[i]) out.chk.push({ lvl: 'bad', sh: '2-fayl', msg: tSh + '!' + x.r + ' «' + x.lab + '» (BN ' + fotN(x.bn) + ') — hech bir sex varagʻiga tushmadi. Qaysi varaqqa tegishli ekanini iqtisodchi bir marta havola bilan koʻrsatsa, ilova oʻrganib oladi.' }); });
                    out.cover = { n: L.length, ok: ok.filter(Boolean).length, sec: I.zr };
                } else out.chk.push({ lvl: 'bad', sh: '2-fayl', msg: '«' + tSh + '» varagʻida «Заработная плата по расходам периода» boʻlimi topilmadi' });
            } catch (e) { console.error(e); out.chk.push({ lvl: 'bad', sh: '', msg: 'Tekshiruvda xato: ' + agmkErrUz(e) }); }
            return out;
        });
        if (typeof fotResHtml === 'function') fotResHtml = agmkExtend('fotResHtml', 'v3.16.3: oʻzini tekshirish natijasi', fotResHtml, o => function (res) {
            let h = o.apply(this, arguments);
            try { const p = res.per; if (!p || !p.chk) return h; const E = escapeHtml, bad = p.chk.filter(x => x.lvl === 'bad'), warn = p.chk.filter(x => x.lvl !== 'bad'), cv = p.cover;
                const box = `<div class="nd-tip fot-selfchk" style="border-left:3px solid ${bad.length ? '#dc2626' : warn.length ? '#f59e0b' : '#16a34a'}">🔎 <b>Oʻzini tekshirish — «Расходы периода»</b><br>`
                    + (cv ? `${bad.length ? '❌' : '✅'} 2-fayl boʻlimi (${E(FOT_FSH[res.mon])}!${cv.sec}): ${cv.ok} / ${cv.n} qator sex varaqlariga tushdi<br>` : '')
                    + (p.learn.filter(x => x.v).length ? `🔗 Havoladan oʻrganildi (${p.learn.filter(x => x.v).length}): ` + p.learn.filter(x => x.v).map(x => E(x.sh + ' ' + x.r + ' = ' + fotN(x.v))).join(', ') + '<br>' : '')
                    + (bad.concat(warn).length ? bad.concat(warn).map(x => (x.lvl === 'bad' ? '❌ ' : '⚠️ ') + E((x.sh ? x.sh + ': ' : '') + x.msg)).join('<br>') : '✅ Oʻtgan oy bilan solishtirildi — boʻsh qolgan yoki keskin oʻzgargan asosiy qator yoʻq')
                    + '</div>';
                const i = h.indexOf('<div class="hs-acts">'); h = i >= 0 ? h.slice(0, i) + box + h.slice(i) : h + box; } catch (e) {}
            return h;
        });
