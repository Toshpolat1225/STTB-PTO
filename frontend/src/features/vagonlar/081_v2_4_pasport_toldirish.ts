        // =====================================================================
        // v2.4 — 📋 PASPORT TO'LDIRISH
        //  • To'liqlik ko'rsatkichi (%, bo'sh maydonlar) — pasportda va umumiy ro'yxatda
        //  • 📸 Rasmdan to'ldirish (qog'oz pasport / jadval rasmi) — AI o'qiydi (rozilik bilan), xodim tekshirib saqlaydi
        //  • 📥 Excel'dan ko'plab to'ldirish — raqam bo'yicha moslab; oldin nima o'zgarishi ko'rsatiladi
        //  • Hech narsa o'ylab topilmaydi: o'qilmagan qiymat bo'sh qoladi
        // =====================================================================
        var PS_F = {
            rail: [['inv', 'Inventar raqami'], ['type', 'Model / seriya'], ['seh', 'Seh'], ['yil', 'Ishlab chiqarilgan yil'], ['tamirTuri', 'Oxirgi taʼmir turi'], ['tamirSanasi', 'Oxirgi taʼmir sanasi'], ['keyingi', 'Keyingi taʼmir sanasi']],
            avto: [['gos', 'Davlat raqami'], ['naim', 'Nomi'], ['inv', 'Inventar raqami'], ['seh', 'Seh'], ['yil', 'Ishlab chiqarilgan yil'], ['tamirSanasi', 'Oxirgi taʼmir sanasi'], ['keyingi', 'Keyingi taʼmir sanasi']],
            yol: [['zav', 'Zavod raqami'], ['marka', 'Markasi'], ['naim', 'Nomi'], ['inv', 'Inventar raqami'], ['seh', 'Seh'], ['yil', 'Ishlab chiqarilgan yil'], ['tamirSanasi', 'Oxirgi taʼmir sanasi'], ['keyingi', 'Keyingi taʼmir sanasi']]
        };
        function psFields(v) { return v.kind === 'avto' ? PS_F.avto : v.kind === 'yol' ? PS_F.yol : PS_F.rail; }
        function psEmpty(x) { return x === undefined || x === null || String(x).trim() === '' || String(x).trim() === '—' || String(x).trim() === '0'; }
        function psFill(v) { if (!v || v.kind === 'infra') return null; const F = psFields(v), miss = F.filter(f => psEmpty(v[f[0]])); return { pct: Math.round((F.length - miss.length) / F.length * 100), miss: miss }; }
        function psBarHtml(v) {
            const r = psFill(v); if (!r) return ''; const col = r.pct >= 100 ? '#22c55e' : r.pct >= 70 ? '#eab308' : '#ef4444';
            return `<div class="ps-bar"><div class="ps-h"><b>📋 Pasport toʻliqligi: <span style="color:${col}">${r.pct}%</span></b></div><div class="ps-track"><i style="width:${r.pct}%; background:${col}"></i></div>${r.miss.length ? `<small>Boʻsh: ${escapeHtml(r.miss.map(f => f[1]).join(', '))}</small>` : '<small>✅ Barcha asosiy maydonlar toʻldirilgan</small>'}
                ${isAdmin() ? `<div class="ps-btns">${r.miss.length ? `<button onclick="openEditModal()">✏️ Toʻldirish</button>` : ''}<label>📸 Rasmdan toʻldirish<input type="file" accept="image/*" capture="environment" style="display:none" onchange="psFromPhoto(this)"></label></div>` : ''}</div>`;
        }
        // ---------- Umumiy ko'rinish va Excel'dan ko'plab to'ldirish ----------
        function psOverview() {
            const E = escapeHtml, groups = [['vag', 'Vagonlar', v => !v.kind], ['lok', 'Lokomotivlar', v => v.kind === 'lok'], ['avto', 'Avtotraktor', v => v.kind === 'avto'], ['yol', 'Yoʻl texnikasi', v => v.kind === 'yol']];
            const rows = groups.map(([k, t, fn]) => { const L = vagonlarData.filter(fn), R = L.map(v => psFill(v)).filter(Boolean), avg = R.length ? Math.round(R.reduce((a, r) => a + r.pct, 0) / R.length) : 0, inc = R.filter(r => r.pct < 100).length; return `<div class="hs-row" onclick="psList('${k}')"><b>${E(t)}: ${avg}% toʻliq</b><small>${L.length} ta · ${inc} tasi toʻliq emas</small></div>`; }).join('');
            mdl('psModal', `<div class="px-h"><b>📋 Pasportlarni toʻldirish</b><button class="mini-btn" onclick="mdlClose('psModal')">✕</button></div><div class="hs-list">${rows}</div>
                ${isAdmin() ? `<div class="hs-box" style="margin-top:10px"><div class="hs-h">📥 Excel'dan koʻplab toʻldirish</div><div class="nd-tip">Jadvalda texnika raqami ustuni boʻlsin (№, Номер, Зав. №). Ilova inventar, yil, seh, taʼmir turi va sanalarni raqam boʻyicha moslaydi. Oldin nima oʻzgarishi koʻrsatiladi; standart holatda faqat <b>boʻsh maydonlar</b> toʻldiriladi.</div><label class="alb-btn">📂 Excel faylni tanlash<input type="file" accept=".xls,.xlsx,.csv" style="display:none" onchange="psExcel(this)"></label></div>` : ''}`, true);
        }
        function psList(k) {
            const fn = { vag: v => !v.kind, lok: v => v.kind === 'lok', avto: v => v.kind === 'avto', yol: v => v.kind === 'yol' }[k], E = escapeHtml;
            const L = vagonlarData.filter(fn).map(v => ({ v: v, r: psFill(v) })).filter(x => x.r && x.r.pct < 100).sort((a, b) => a.r.pct - b.r.pct).slice(0, 300);
            mdl('psModal', `<div class="px-h"><b>📋 Toʻliq emas (${L.length})</b><button class="mini-btn" onclick="psOverview()">‹</button></div><div class="hs-list">${L.map(x => `<div class="hs-row" onclick="mdlClose('psModal'); openPassport(${JSON.stringify(x.v.id)})"><b>${E(x.v.type || '')} № ${E(vagonNo(x.v))} — ${x.r.pct}%</b><small>Boʻsh: ${E(x.r.miss.map(f => f[1]).join(', '))}</small></div>`).join('') || '<div class="hs-ok">✅ Hammasi toʻliq</div>'}</div>`, true);
        }
        var PS_COLS = { no: /^(№|номер|зав\.?\s*№|заводской|raqam|инв\.?\s*№?\s*ваг|вагон\s*№|№\s*вагона|госномер|гос\.?\s*номер|davlat raqami)/, inv: /инвент|inventar/, yil: /год\s*(выпуска|постройки)|yil|год$/, seh: /цех|seh/, tamirTuri: /вид\s*ремонт|ta.?mir turi/, tamirSanasi: /дата\s*(последн\w*\s*)?ремонт|oxirgi ta.?mir/, keyingi: /следующ|keyingi/ };
        async function psExcel(inp) {
            const f = inp.files && inp.files[0]; inp.value = ''; if (!f || !isAdmin()) return;
            let bk; try { bk = await hpReadBook(f); } catch (e) { alert('⚠️ ' + agmkErrUz(e)); return; }
            const xd = v => { if (v === '' || v === null || v === undefined) return ''; if (typeof v === 'number' && v > 20000 && v < 80000) { const d = new Date(Math.round((v - 25569) * 864e5)); return d.toISOString().slice(0, 10); } const s = String(v).trim(), m = s.match(/(\d{2})\.(\d{2})\.(\d{4})/); if (m) return m[3] + '-' + m[2] + '-' + m[1]; const m2 = s.match(/(\d{4})-(\d{2})-(\d{2})/); return m2 ? m2[0] : ''; };
            const changes = []; let rowsN = 0, notFound = 0;
            bk.forEach(sh => {
                const R = sh.rows; let h = -1, C = {};
                for (let i = 0; i < Math.min(R.length, 30); i++) { const c = {}; (R[i] || []).forEach((x, j) => { const t = hsNorm(x); Object.keys(PS_COLS).forEach(k => { if (c[k] === undefined && t && PS_COLS[k].test(t)) c[k] = j; }); }); if (c.no !== undefined && Object.keys(c).length >= 2) { h = i; C = c; break; } }
                if (h < 0) return;
                for (let i = h + 1; i < R.length; i++) {
                    const r = R[i] || [], no = String(r[C.no] === undefined ? '' : r[C.no]).trim().replace(/\.0+$/, ''); if (!no) continue; rowsN++;
                    const L = vagonlarData.filter(v => v.kind !== 'infra' && String(vagonNo(v)).replace(/^0+/, '') === no.replace(/^0+/, ''));
                    if (L.length !== 1) { notFound++; continue; } const v = L[0], ch = {};
                    ['inv', 'yil', 'seh', 'tamirTuri'].forEach(k => { if (C[k] === undefined) return; const val = String(r[C[k]] === undefined ? '' : r[C[k]]).trim().replace(/\.0+$/, ''); if (val && psEmpty(v[k])) ch[k] = k === 'yil' ? (parseInt(val) || '') : val; });
                    ['tamirSanasi', 'keyingi'].forEach(k => { if (C[k] === undefined) return; const val = xd(r[C[k]]); if (val && psEmpty(v[k])) ch[k] = val; });
                    Object.keys(ch).forEach(k => { if (ch[k] === '') delete ch[k]; });
                    if (Object.keys(ch).length) changes.push({ v: v, ch: ch, src: sh.s + ' › ' + (i + 1) + '-qator' });
                }
            });
            if (!changes.length) { alert('Oʻzgarish yoʻq: ' + rowsN + ' qator oʻqildi, ' + notFound + ' tasi bazada topilmadi (yoki bir nechta mos keldi), qolganlarida boʻsh maydon yoʻq.'); return; }
            const nF = changes.reduce((a, c) => a + Object.keys(c.ch).length, 0);
            if (!(await uiConfirm('📥 ' + f.name + ':\n• ' + rowsN + ' qator oʻqildi\n• ' + changes.length + ' ta texnikada ' + nF + ' ta boʻsh maydon toʻldiriladi\n• ' + notFound + ' ta raqam bazada topilmadi yoki aniq emas (oʻtkazib yuborildi)\n\nMisol: ' + changes.slice(0, 3).map(c => '№' + vagonNo(c.v) + ': ' + Object.keys(c.ch).map(k => k + '=' + c.ch[k]).join(', ')).join('; ') + '\n\nQoʻllansinmi?'))) return;
            changes.forEach(c => { Object.assign(c.v, c.ch); if (c.ch.tamirSanasi && !c.ch.keyingi && c.v.src) c.v.drAuto = true; try { recalcVagonStatus(c.v); } catch (e) {} c.v.history = c.v.history || []; });
            saveDB(); try { filterVagonlar(); } catch (e) {}
            try { aiLog('Excel dan pasportlar toʻldirildi: ' + changes.length + ' ta texnika, ' + nF + ' maydon (' + f.name + ')'); } catch (e) {}
            showToast('✅ ' + changes.length + ' ta pasport toʻldirildi'); psOverview();
        }
        (function () {
            if (typeof openPassport === 'function') { openPassport = agmkExtend('openPassport', 'openPassport', openPassport, o => function (id) { const r = o.apply(this, arguments); try { const v = vagonlarData.find(x => x.id === id), t = $id('p-extra-title'); if (v && t) { let b = $id('psBar'); if (!b) { b = document.createElement('div'); b.id = 'psBar'; const host = $id('pasportMainTitle'); (host && host.parentNode ? host.parentNode : t.parentNode).insertBefore(b, host ? host.nextSibling : t); } b.innerHTML = psBarHtml(v); } } catch (e) { console.error(e); } return r; }); }
            if (typeof savePassportChanges === 'function') { savePassportChanges = agmkExtend('savePassportChanges', 'savePassportChanges', savePassportChanges, o => async function () { const r = await o.apply(this, arguments); try { const v = vagonlarData.find(x => x.id === activeVagonId), b = $id('psBar'); if (v && b) b.innerHTML = psBarHtml(v); document.querySelectorAll('.ps-ai').forEach(e => e.classList.remove('ps-ai')); } catch (e) {} return r; }); }
            // Mening ishlarim: to'liq bo'lmagan pasportlar (admin)
            if (typeof opsTasks === 'function') { opsTasks = agmkExtend('opsTasks', 'Mening ishlarim: toʼliq boʼlmagan pasportlar (admin)', opsTasks, o => function (full) { const L = o.apply(this, arguments); try { if (full && isAdmin()) { const n = vagonlarData.filter(v => { const r = psFill(v); return r && r.pct < 60; }).length; if (n) L.push({ k: 'ps', ic: '📋', pr: 3, t: 'Pasportlar toʻliq emas: ' + n + ' ta (60% dan kam)', s: 'Rasmdan yoki Excel dan toʻldirish mumkin', btn: 'Koʻrish', js: 'psOverview()' }); } } catch (e) {} return L; }); }
            const add = () => { try { const card = document.querySelector('.btn-card[onclick="exportBundleFile()"]'); if (card && !$id('psCard')) card.insertAdjacentHTML('beforebegin', `<div class="btn-card" id="psCard" onclick="psOverview()"><div class="btn-card-content"><span class="btn-icon">📋</span><span class="btn-text">Pasportlarni toʻldirish<span class="set-sub">Toʻliqlik, boʻsh maydonlar, Excel dan koʻplab toʻldirish</span></span></div><span class="btn-arrow">›</span></div>`); } catch (e) {} };
            if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', add); else add(); setTimeout(add, 1600);
        })();

