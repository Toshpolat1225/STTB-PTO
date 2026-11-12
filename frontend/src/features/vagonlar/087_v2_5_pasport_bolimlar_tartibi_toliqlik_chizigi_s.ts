        // =====================================================================
        // v2.5 — PASPORT: bo'limlar tartibi, to'liqlik chizig'i sarlavha ostida (to'liq kenglikda),
        //  📸 rasmdan to'ldirish — asosiy maydonlar + kartoteka (model, ishlab chiqaruvchi, oxirgi KR, xizmat muddati, texnik yechim №)
        //  Har bir qiymat oldin ko'rsatiladi — xodim belgilab tasdiqlaydi; manba belgisi "📸 rasmdan (sana)" saqlanadi.
        // =====================================================================
        var PS_K = [['model', 'Model'], ['maker', 'Ishlab chiqaruvchi zavod'], ['kr', 'Oxirgi kapital taʼmir (KR) sanasi', 'date'], ['srok', 'Xizmat muddati uzaytirilgan sana', 'date'], ['srokYil', 'Xizmat muddati tugash yili', 'year'], ['tr', 'Texnik yechim №']];
        var PS_LBL = { 'MODEL': 'model', 'ISHLAB CHIQARUVCHI': 'maker', "OXIRGI KAPITAL TA'MIR (KR)": 'kr', 'XIZMAT MUDDATI UZAYTIRILGAN SANA': 'srok', 'TEXNIK YECHIM №': 'tr', 'XIZMAT MUDDATI TUGASH YILI': 'srokYil', 'INVENTAR №': 'inv', 'ISHLAB CHIQARILGAN YILI': 'yil', 'SEH': 'seh', "OXIRGI TA'MIR TURI": 'tamirTuri', "OXIRGI TA'MIR SANASI": 'tamirSanasi', "KEYINGI TA'MIR SANASI": 'keyingi' };
        function psDate(val) { const s = String(val || ''); const m = s.match(/(\d{4})-(\d{2})-(\d{2})/) || s.match(/(\d{2})[./](\d{2})[./](\d{4})/); if (!m) return ''; return m[1].length === 4 ? m[1] + '-' + m[2] + '-' + m[3] : m[3] + '-' + m[2] + '-' + m[1]; }
        function psSrcTag(v, k) { const p = v && v.psPhoto && v.psPhoto[k]; return p ? `<em class="ps-src" title="${escapeHtml((p.by || '') + ' · ' + (p.file || ''))}">📸 rasmdan${p.at ? ' (' + escapeHtml(fmtISO(String(p.at).slice(0, 10))) + ')' : ''}</em>` : ''; }
        // Pasport bo'limlari tartibi va manba belgilari
        function psOrder() {
            const scr = $id('screen-vagon-pasport'); if (!scr) return; const body = scr.firstElementChild; if (!body) return;
            const main = body.querySelector('.passport-container'); if (!main) return;
            const gal = $id('vagon-gallery-preview') ? $id('vagon-gallery-preview').closest('.passport-container') : null;
            const seq = [$id('vs-link'), gal, $id('alb-box'), $id('vf-box')].filter(Boolean);
            let ref = main; seq.forEach(el => { if (ref.nextElementSibling !== el) body.insertBefore(el, ref.nextElementSibling); ref = el; });
            // to'liqlik chizig'i — sarlavha ostida, to'liq kenglikda
            const bar = $id('psBar'), tt = main.querySelector('.passport-title'); if (bar && tt && bar.parentNode !== main) main.insertBefore(bar, tt.nextSibling); else if (bar && tt && tt.nextElementSibling !== bar) main.insertBefore(bar, tt.nextSibling);
        }
        function psMarkSrc(v) {
            if (!v || !v.psPhoto) return;
            const tagIn = root => root && root.querySelectorAll(':scope > div').forEach(d => { if (d.querySelector('.ps-src')) return; const lab = (d.childNodes[0] && d.childNodes[0].textContent || d.innerText || '').split(':')[0].trim().toUpperCase(); const k = PS_LBL[lab] || (d.querySelector('#p-model') ? 'model' : null); if (k && v.psPhoto[k]) d.insertAdjacentHTML('beforeend', ' ' + psSrcTag(v, k)); });
            tagIn($id('p-extra')); tagIn(document.querySelector('#screen-vagon-pasport .passport-grid'));
            // kartoteka bo'lmasa ham — rasmdan olingan qiymatlar ko'rinsin
            const box = $id('p-extra-box'), ex = $id('p-extra'); if (!box || !ex) return;
            const shown = new Set([...ex.querySelectorAll(':scope > div')].map(d => PS_LBL[(d.childNodes[0] && d.childNodes[0].textContent || '').split(':')[0].trim().toUpperCase()]).filter(Boolean));
            const add = PS_K.filter(([k]) => v.psPhoto[k] && !shown.has(k) && v[k] !== undefined && String(v[k]).trim() !== '');
            if (add.length) { box.classList.remove('hidden'); ex.insertAdjacentHTML('beforeend', add.map(([k, t, ty]) => `<div>${escapeHtml(t.toUpperCase())}: <span>${escapeHtml(ty === 'date' ? fmtISO(v[k]) : v[k])}</span> ${psSrcTag(v, k)}</div>`).join('')); }
        }
        (function () {
            if (typeof openPassport === 'function') { openPassport = agmkExtend('openPassport', 'openPassport', openPassport, o => function (id) { const r = o.apply(this, arguments); try { psOrder(); psMarkSrc(vagonlarData.find(x => x.id === id)); } catch (e) { console.error(e); } return r; }); }
            if (typeof savePassportChanges === 'function') { savePassportChanges = agmkExtend('savePassportChanges', 'savePassportChanges', savePassportChanges, o => async function () {
                // tahrirlash oynasida rasmdan kelgan (sariq) maydonlar saqlanganda — manba belgisi
                const v = vagonlarData.find(x => x.id === activeVagonId), map = { 'edit-inv': 'inv', 'edit-seh': 'seh', 'edit-yil': 'yil', 'edit-tamir-turi': 'tamirTuri', 'edit-tamir-sanasi': 'tamirSanasi', 'edit-keyingi': 'keyingi' };
                const marked = [...document.querySelectorAll('.ps-ai')].map(e => map[e.id]).filter(Boolean);
                const r = await o.apply(this, arguments);
                try { if (v && marked.length) { v.psPhoto = v.psPhoto || {}; marked.forEach(k => { v.psPhoto[k] = { at: new Date().toISOString(), by: authorStr() }; }); saveDB(false); psMarkSrc(v); } } catch (e) {}
                return r; }); }
        })();
        // 📸 Rasmdan to'ldirish — asosiy + kartoteka maydonlari, ko'rib chiqib tasdiqlash
        async function psFromPhoto(inp) {
            const f = inp.files && inp.files[0]; inp.value = ''; if (!f) return; const v = vagonlarData.find(x => x.id === activeVagonId); if (!v) return;
            if (!isAdmin()) { showToast('🔒 Faqat admin'); return; }
            if (!(typeof aiCloudReady === 'function' && aiCloudReady())) { alert('Rasmni oʻqish uchun internetli AI kerak (Parametrlar → AI ulanishi).'); return; }
            if (!(await uiConfirm('📸 Rasm AI ga (' + (aicGet().prov === 'claude' ? 'Claude' : 'Google Gemini') + ') yuboriladi — undagi raqam va sanalarni oʻqish uchun. Rasmda xodimlarning shaxsiy maʼlumotlari boʻlmasin.\n\nRozimisiz?'))) return;
            showToast('⏳ Rasm oʻqilmoqda (2 marta, tekshirish uchun)...');
            const F = psFields(v).concat(v.kind === 'avto' || v.kind === 'yol' ? [] : PS_K.map(x => [x[0], x[1]]));
            const prompt = 'Bu temir yoʻl texnikasi pasporti, kartochkasi yoki jadvali rasmi. FAQAT rasmda aniq koʻringan qiymatlarni oʻqi, taxmin qilma; koʻrinmagan yoki noaniq maydon — null. Sanalar YYYY-MM-DD. FAQAT JSON qaytar: {' + F.map(x => '"' + x[0] + '": "' + x[1] + '"').join(', ') + ', "raqam": "texnika raqami"}';
            let a, b; try { a = await aiaktCloud([f], prompt); b = await aiaktCloud([f], prompt); } catch (e) { alert('⚠️ ' + agmkErrUz(e)); return; }
            if (!a) { alert('⚠️ Rasmdan maʼlumot oʻqilmadi.'); return; }
            if (a.raqam && String(a.raqam).replace(/^0+/, '') !== String(vagonNo(v)).replace(/^0+/, '') && !(await uiConfirm('⚠️ Rasmdagi raqam (' + a.raqam + ') ochiq pasport raqamiga (' + vagonNo(v) + ') mos emas. Baribir davom etilsinmi?'))) return;
            const ty = k => { const x = PS_K.find(p => p[0] === k); return x && x[2] ? x[2] : /sanasi|keyingi/i.test(k) ? 'date' : k === 'yil' ? 'year' : ''; };
            const norm = (k, x) => { if (x === null || x === undefined) return ''; let s = String(x).trim(); if (!s || /^null$/i.test(s)) return ''; const t = ty(k); if (t === 'date') return psDate(s); if (t === 'year') { const m = s.match(/(19|20)\d\d/); return m ? m[0] : ''; } return s.slice(0, 80); };
            const rows = [], unsure = [];
            F.forEach(([k, t]) => { const x = norm(k, a[k]), y = b ? norm(k, b[k]) : x; if (!x) return; if (x !== y) { unsure.push(t); return; } const cur = v[k] === undefined || v[k] === null ? '' : String(v[k]).trim(); if (cur === x) return; rows.push({ k: k, t: t, val: x, cur: cur }); });
            if (!rows.length) { alert('Rasmdan yangi yoki ishonchli oʻqilgan qiymat yoʻq.' + (unsure.length ? '\nIkki marta oʻqilganda farq qilgan (toʻldirilmadi): ' + unsure.join(', ') : '')); return; }
            PS_PEND = { v: v, rows: rows, file: f.name };
            const E = escapeHtml, show = (r, s) => ty(r.k) === 'date' ? fmtISO(s) : s;
            mdl('psModal', `<div class="px-h"><b>📸 Rasmdan oʻqilgan qiymatlar</b><button class="mini-btn" onclick="mdlClose('psModal')">✕</button></div>
                <div class="nd-tip">Har birini rasm bilan solishtiring va keraklisini belgilang. Boʻsh maydonlar oldindan belgilangan; mavjud qiymatdan farq qilsa — <b>⚠️</b> bilan, belgilanmagan.</div>
                <div class="ps-rev">${rows.map((r, i) => `<label class="${r.cur ? 'diff' : ''}"><input type="checkbox" id="psR${i}" ${r.cur ? '' : 'checked'}><span><b>${E(r.t)}</b><br>${r.cur ? `⚠️ hozir: ${E(show(r, r.cur))} → ` : ''}<i>${E(show(r, r.val))}</i></span></label>`).join('')}</div>
                ${unsure.length ? `<div class="nd-tip">⚠️ Ikki marta oʻqilganda farq qilgan, shuning uchun olinmadi: ${E(unsure.join(', '))}</div>` : ''}
                <div class="nv-btns"><button class="on" onclick="psApply()">✅ Belgilanganlarni saqlash</button><button onclick="mdlClose('psModal')">Bekor</button></div>`, true);
        };
        var PS_PEND = null;
        function psApply() {
            const P = PS_PEND; if (!P) return; const v = P.v, now = new Date().toISOString(), done = [];
            P.rows.forEach((r, i) => { const c = $id('psR' + i); if (!c || !c.checked) return; v[r.k] = r.k === 'yil' ? (parseInt(r.val) || r.val) : r.val; v.psPhoto = v.psPhoto || {}; v.psPhoto[r.k] = { at: now, by: authorStr(), file: P.file, old: r.cur || '' }; done.push(r.t + ': ' + r.val); });
            mdlClose('psModal'); PS_PEND = null; if (!done.length) return;
            try { if (done.some(d => /taʼmir|ta'mir/i.test(d))) recalcVagonStatus(v); } catch (e) {}
            saveDB(); try { aiLog('Pasport rasmdan toʻldirildi (' + vagonNo(v) + '): ' + done.join('; '), v.id); } catch (e) {}
            showToast('✅ ' + done.length + ' ta maydon saqlandi (📸 rasmdan)'); try { openPassport(v.id); } catch (e) {}
        }

