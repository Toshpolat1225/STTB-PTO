        // =====================================================================
        // v2.0 — «🤖 MENING ISHLARIM»: AI ishni o'zi topadi va tayyorlab qo'yadi, xodim faqat tekshirib tasdiqlaydi
        //  • nosozlik rasmlari (izohi bor, akti yo'q) → akt qoralamasi bir tugmada
        //  • yakunlanmagan hisobot tekshiruvlari, yuklanmagan Forma-30
        //  • ochiq zamechaniyalar, o'qilmagan bildirishnomalar
        //  • har bir AI amali jurnalga yoziladi (agmk_ai_log)
        // Imzolash, yuborish va o'chirish — faqat xodimning o'zi.
        // =====================================================================
        var AI_LOG_KEY = 'agmk_ai_log';
        function aiLog(what, ref) { try { const l = JSON.parse(localStorage.getItem(AI_LOG_KEY) || '[]') || []; l.push({ at: new Date().toISOString(), by: meTabel(), a: String(what).slice(0, 300), ref: ref || '' }); localStorage.setItem(AI_LOG_KEY, JSON.stringify(l.slice(-1000))); } catch (e) {} }
        function opsTasks(full) {
            const out = [], me = meTabel(), now = Date.now(), E = escapeHtml;
            // 1) Rasmga olingan nosozliklar — akt tuzilmagan (oxirgi 14 kun)
            try {
                const A = albAll(), akts = ndAkts();
                Object.keys(A).forEach(vid => {
                    const v = vagonlarData.find(x => String(x.id) === String(vid)); if (!v) return;
                    const l = (A[vid] || []).filter(x => !x.kind && x.note && now - new Date(x.saved || x.at).getTime() < 14 * 864e5);
                    if (!l.length) return; const no = vagonNo(v);
                    const last = Math.max(...l.map(x => new Date(x.saved || x.at).getTime()));
                    const done = akts.some(a => new Date(a.at).getTime() >= last && (a.text || '').includes(String(no).replace(/^0+/, '')));
                    if (!done) out.push({ k: 'akt', ic: '📸', pr: 1, t: 'Vagon №' + no + ': ' + l.length + ' ta nosozlik rasmi — akt tuzilmagan', s: l.map(x => x.note).slice(0, 2).join('; '), btn: '📄 Akt qoralamasi', js: `opsAkt('${vid}')` });
                });
            } catch (e) {}
            // 2) Hisobot tekshiruvlari (qoralama)
            try { if (typeof hsChecks === 'function' && hsCan()) hsChecks().filter(x => x.status !== 'done').slice(0, 10).forEach(x => out.push({ k: 'hisob', ic: '📊', pr: x.red ? 1 : 2, t: 'Hisobot tekshiruvi yakunlanmagan: ' + x.file, s: '❌ ' + x.red + ' xato · 🔷 ' + x.blue + ' tekshirish kerak', btn: 'Ochish', js: `HS.tab='hisob'; HS.cat='${x.cat}'; HS.chk='${x.id}'; openHisob('hisob')` })); } catch (e) {}
            // 3) Forma-30 bu oy uchun yuklanmagan (5-sanadan keyin eslatiladi)
            try { if (typeof hsF30Of === 'function' && hsCan()) { const d = new Date(), pm = new Date(d.getFullYear(), d.getMonth() - 1, 1), want = pm.getFullYear() + '-' + String(pm.getMonth() + 1).padStart(2, '0');
                if (d.getDate() >= 5) HS_CATS.forEach(c => { const L = hsF30Of(c.k); if (L.length && !L.some(x => x.month >= want)) out.push({ k: 'f30', ic: '📋', pr: 2, t: c.t + ': ' + hsMon(want) + ' uchun Forma-30 yuklanmagan', s: 'Oxirgisi: ' + hsMon(L[0].month), btn: 'Yuklash', js: `HS.tab='hisob'; HS.cat='${c.k}'; HS.chk=null; openHisob('hisob')` }); }); } } catch (e) {}
            // 4) Ochiq zamechaniyalar (menga tegishli yoki admin/rahbar bo'lsa hammasi)
            try { const all = allZams().filter(r => r.z.status !== 'yopildi'); const mine = isAdmin() || (typeof isRahbar === 'function' && isRahbar()) ? all : all.filter(r => r.z.by && String(r.z.by.tabel) === me);
                if (mine.length) out.push({ k: 'zam', ic: '🚨', pr: 2, t: 'Ochiq zamechaniyalar: ' + mine.length + ' ta', s: mine.slice(0, 3).map(r => '№' + vagonNo(r.v) + ': ' + String(r.z.izoh || '').slice(0, 40)).join('; '), btn: 'Koʻrish', js: `(typeof openRN === 'function' ? openRN() : openNotifs())` }); } catch (e) {}
            // 5) O'qilmagan bildirishnomalar
            try { const n = myUnreadNotifs(); if (n.length) out.push({ k: 'nt', ic: '🔔', pr: 3, t: 'Oʻqilmagan bildirishnomalar: ' + n.length + ' ta', s: n.slice(-2).map(x => x.text).join('; ').slice(0, 120), btn: 'Ochish', js: 'openNotifs()' }); } catch (e) {}
            // 6) Ta'mir talab texnika (umumiy ko'rinish)
            if (full) try { const r = aiLocalAnswer("ta'mir talab vagonlar"); const t = r && (r.t || r); if (t && /\(\d+ ta\)|\d+ ta/.test(String(t).split('\n')[0]) && !/^0 /.test(t)) out.push({ k: 'tamir', ic: '🛠', pr: 3, t: String(t).split('\n')[0].replace(/^[^\wА-Яа-яʻ‘']+/, '').slice(0, 90), s: '', btn: 'Koʻrish', js: `openScreen('screen-vagonlar')` }); } catch (e) {}
            return out.sort((a, b) => a.pr - b.pr);
        }
        function opsOpen() {
            const L = opsTasks(true), E = escapeHtml;
            mdl('opsModal', `<div class="px-h"><b>🤖 Mening ishlarim${L.length ? ' (' + L.length + ')' : ''}</b><button class="mini-btn" onclick="mdlClose('opsModal')">✕</button></div>
                <div class="nd-tip">AI ishni topib, tayyorlab qoʻyadi — siz tekshirib tasdiqlaysiz. Imzolash, yuborish va oʻchirish faqat sizning tugmangiz bilan.</div>
                ${L.length ? '<div class="ops-list">' + L.map(x => `<div class="ops-it p${x.pr}" role="button" tabindex="0" title="${E(x.btn || 'Ochish')}" onclick="mdlClose('opsModal'); ${x.js.replace(/"/g, '&quot;')}"><span class="ops-ic">${x.ic}</span><div class="ops-t"><b>${E(x.t)}</b>${x.s ? `<small>${E(x.s)}</small>` : ''}</div><span class="ops-go">›</span></div>`).join('') + '</div>' : '<div class="hs-ok">✅ Hozircha kutilayotgan ish yoʻq.</div>'}
                <details class="hs-hist" style="margin-top:10px"><summary>🧾 AI amallari jurnali</summary>${(() => { let l = []; try { l = JSON.parse(localStorage.getItem(AI_LOG_KEY) || '[]') || []; } catch (e) {} return l.slice(-30).reverse().map(a => `<div><small>🕒 ${E(fmtDT(a.at))}</small><br>${E(a.a)}</div>`).join('') || '<div>—</div>'; })()}</details>`);
        }
        async function opsAkt(vid) {
            try { openPassport(isNaN(+vid) ? vid : +vid); } catch (e) { try { openPassport(vid); } catch (e2) {} }
            setTimeout(() => { try { ALB.sel = new Set((albAll()[vid] || []).filter(x => x.note && !x.kind).slice(-6).map(x => x.id)); albRender(); aiLog('Akt qoralamasi tayyorlandi (vagon ' + vid + ')', vid); albAiAkt(); } catch (e) { console.error(e); } }, 450);
        }
        function opsBadge() {
            try { let b = $id('opsBtn'); const brand = document.querySelector('#screen-main .main-brand'); if (!brand) return;
                if (!b) { b = document.createElement('button'); b.id = 'opsBtn'; b.className = 'ops-btn'; b.type = 'button'; b.onclick = e => { e.stopPropagation(); opsOpen(); }; b.title = 'Mening ishlarim'; brand.parentNode.appendChild(b); }
                const n = currentUser ? opsTasks().filter(x => x.pr <= 2).length : 0; const h = '🤖<i>' + (n || '') + '</i>'; if (b.__h !== h) { b.innerHTML = h; b.__h = h; } b.classList.toggle('has', n > 0);
            } catch (e) {}
        }
        // Kunning birinchi ochilishida qisqa brifing (bezovta qilmasdan — faqat xabarcha)
        function opsMorning() {
            try { if (!currentUser) return; const k = 'agmk_ops_day_' + meTabel(), d = todayISO(); if (localStorage.getItem(k) === d) return; localStorage.setItem(k, d);
                const L = opsTasks(); if (L.length) showToast('🤖 Bugun ' + L.length + ' ta ish kutilmoqda — «🤖 Mening ishlarim» ni oching'); } catch (e) {}
        }
        (function () {
            setInterval(opsBadge, 5000); setTimeout(() => { opsBadge(); opsMorning(); }, 1500);
            if (typeof setSessionUser === 'function') { setSessionUser = agmkExtend('setSessionUser', 'setSessionUser', setSessionUser, o => function () { const r = o.apply(this, arguments); setTimeout(() => { opsBadge(); opsMorning(); }, 600); return r; }); }
            // Rasmga izoh yozilganda — "akt qoralamasi" ishi paydo bo'ladi
            if (typeof albNote === 'function') { albNote = agmkExtend('albNote', 'Rasmga izoh yozilganda — "akt qoralamasi" ishi paydo boʼladi', albNote, o => async function () { const r = await o.apply(this, arguments); setTimeout(opsBadge, 200); return r; }); }
            // AI buyruqlari: "mening ishlarim", "bugungi ishlar", "nima qilishim kerak"
            aiStage('Mening ishlarim', function (q, next) {
                try { const s = String(q || '').toLowerCase();
                    if (/(mening ishlarim|bugungi ishlar|bugun nima qil|nima qilishim kerak|ishlarim bormi|vazifalarim)/.test(s)) { const L = opsTasks(); setTimeout(() => { try { if (typeof aicClose === 'function') aicClose(); } catch (e) {} opsOpen(); }, 900); return { t: L.length ? '🤖 Kutilayotgan ishlar (' + L.length + '):\n' + L.slice(0, 8).map((x, i) => (i + 1) + ') ' + x.ic + ' ' + x.t).join('\n') : '✅ Hozircha kutilayotgan ish yoʻq.', personal: true }; }
                } catch (e) {}
                return next(q);
            });
            if (typeof albAiAkt === 'function') { albAiAkt = agmkExtend('albAiAkt', 'albAiAkt', albAiAkt, oa => async function () { aiLog('Rasmdan akt: AI tahlili boshlandi'); return oa.apply(this, arguments); }); }
        })();

