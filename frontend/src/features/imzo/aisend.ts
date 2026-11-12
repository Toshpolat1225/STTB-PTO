
        // =====================================================================
        // v3.1 — 📤 HUJJATNI ISTALGAN XODIMGA YUBORISH va ✍️ AVTOMATIK IMZOGA YUBORISH
        //  • Dalolatnoma/akt arxivga saqlanganda (va korxona blankasidagi hujjat saqlanganda) — hujjatdagi imzo chekuvchilar
        //    (komissiya a'zolari) va 👑 rahbar avtomatik topiladi, 5 soniya ichida «Bekor» bosilmasa — imzoga yuboriladi.
        //  • AI: «oxirgi aktni Almatovga yubor», «20.09 dagi g'ildirak sinishi dalolatnomasini Sirojiddin akaga jo'nat»,
        //    «00000563 likvidatsiya aktini @@N:389@@ga imzoga yubor», «grafikni Karimovga tashla» — hujjat va odam topiladi.
        // =====================================================================
        var SIG_AUTO_KEY = 'agmk_sig_auto', AISD = { cd: null };
        // ---------- Umumiy: 5 soniyali tasdiq (ovoz bilan ham aytiladi) ----------
        function aisCountdown(title, html, secs, onGo, onEdit) {
            if (AISD.cd && AISD.cd.t) clearInterval(AISD.cd.t);
            AISD.cd = { left: secs, go: onGo, edit: onEdit };
            mdl('aisCd', `<div class="px-h"><b>${escapeHtml(title)}</b><button class="mini-btn" onclick="aisCdDo('cancel')">✕</button></div>${html}
                <div class="aif-cd"><i id="aisCdBar"></i></div><div id="aisCdTxt" style="text-align:center;font-size:13px;color:#cbd5e1;margin:6px 0">⏳ ${secs}</div>
                <div class="pk-btns"><button onclick="aisCdDo('cancel')">Bekor</button>${onEdit ? '<button onclick="aisCdDo(\'edit\')">✏️ Tahrirlash</button>' : ''}<button class="pr" onclick="aisCdDo('go')">✅ Hozir yuborish</button></div>`, true);
            const bar = $id('aisCdBar'); if (bar) { bar.style.transition = 'none'; bar.style.width = '100%'; setTimeout(() => { bar.style.transition = 'width ' + secs + 's linear'; bar.style.width = '0%'; }, 30); }
            AISD.cd.t = setInterval(() => { const c = AISD.cd; if (!c) return; c.left--; const t = $id('aisCdTxt'); if (t) t.textContent = '⏳ ' + Math.max(0, c.left); if (c.left <= 0) aisCdDo('go'); }, 1000);
        }
        function aisCdDo(a) { const c = AISD.cd; if (!c) return; clearInterval(c.t); AISD.cd = null; mdlClose('aisCd'); if (a === 'go') c.go(); else if (a === 'edit' && c.edit) c.edit(); else showToast('✖ Bekor qilindi'); }
        // ---------- ✍️ Avtomatik imzoga yuborish ----------
        async function sigAuto(opt) { // {html, title, key, only: [tabel...] (faqat shu odamlarga)}
            if (!opt || !opt.html) return;
            if (typeof sigSrv !== 'function' || !sigSrv()) { showToast('ℹ️ Imzoga avtomatik yuborish uchun korxona serveriga ulaning'); return; }
            const sent = kvGet(SIG_AUTO_KEY, {}); if (opt.key && sent[opt.key] && !opt.force) return;
            let users; try { users = await sigUsers(true); } catch (e) { showToast('⚠️ Serverdan xodimlar roʻyxati olinmadi'); return; }
            let rows;
            if (opt.only) rows = opt.only.map(u => ({ label: u.name, tabel: u.tabel, on: true, sign: true }));
            else {
                rows = sigNamesFromHtml(opt.html).filter(n => n.sign).map(n => { const px = typeof dbPerson === 'function' ? dbPerson({ n: n.label }) : null; const u = px && px.tabel ? { tabel: px.tabel } : sigMatch(n, users); return { label: px ? px.name : n.label, tabel: u ? u.tabel : '', on: !!u, sign: true }; });
                users.filter(u => !u.demo && u.lavozim && typeof isRahbarLavozim === 'function' && isRahbarLavozim(u.lavozim)).forEach(u => { if (!rows.some(r => r.tabel === u.tabel || sigKey(r.label) === sigKey(u.name))) rows.push({ label: u.name + ' (rahbar)', tabel: u.tabel, on: true, sign: false, rahbar: true }); });
            }
            SIG.pend = { html: opt.html, title: opt.title || 'Hujjat', rows: rows, key: opt.key };
            const ok = rows.filter(r => r.on && r.tabel), miss = rows.filter(r => r.sign && !r.tabel);
            if (!ok.length) { sigSendRender(); return; }
            const E = escapeHtml, nm = t => { const u = users.find(x => x.tabel === t); if (u) return u.name; const x = typeof findXodimsByTabel === 'function' ? findXodimsByTabel(t) : []; return x.length === 1 ? x[0].item.name + ' (hisob ochgach koʻradi)' : t; };
            aisCountdown('✍️ Imzoga yuborish', `<div class="snd-doc">📄 ${E(opt.title || 'Hujjat')}</div><div class="nd-tip">Hujjat quyidagilarga <b>bir vaqtda</b> boradi, har kim oʻz qatoriga imzo qoʻyadi:</div>
                ${ok.map(r => `<div class="sg-row">✅ <span>${E(nm(r.tabel))}${r.rahbar ? ' <small style="color:#fbbf24">👑 rahbar</small>' : ''}</span></div>`).join('')}
                ${miss.length ? `<div class="hp-warn">⚠️ Ilovada topilmadi (roʻyxatdan oʻtmagan): ${miss.map(r => E(r.label)).join(', ')} — ularga bormaydi. «Tahrirlash» orqali qoʻlda tanlash mumkin.</div>` : ''}`, 5,
                async () => { await sigSendGo(); if (opt.key) { const s2 = kvGet(SIG_AUTO_KEY, {}); s2[opt.key] = new Date().toISOString(); kvSet(SIG_AUTO_KEY, s2); } },
                () => sigSendRender());
            try { if (typeof speakAiText === 'function' && opt.voice) speakAiText('Imzoga yuborilmoqda: ' + ok.length + ' kishi'); } catch (e) {}
        }
        // ---------- 📤 Hujjatni istalgan xodimga (AI buyrug'i) ----------
        async function aisDocFiles(doc) {
            if (doc.kind === 'cx' && typeof cxDxId === 'function' && cxDxId(doc.d)) return await cxDxFiles(doc.d, ['pdf']);
            const P = await aifPrintPages(doc); if (P.html) return await docMake(P.html, doc.title, ['pdf']);
            const html = P.imgs.map(u => `<img src="${u}" style="width:100%;display:block;page-break-after:always">`).join(''); return await docMake(html, doc.title, ['pdf']);
        }
        async function aisDocHtml(doc) {
            if (doc.kind === 'cx' && typeof cxDxId === 'function' && cxDxId(doc.d)) return await cxDxSigHtml(doc.d);
            const P = await aifPrintPages(doc); return P.html || P.imgs.map(u => `<img src="${u}" style="width:100%">`).join('');
        }
        async function aisSendDoc(doc, p, text) {
            try {
                const files = await aisDocFiles(doc), msg = text || ('📄 ' + doc.title);
                if (typeof syncReady === 'function' && syncReady() && p.tabel && typeof syncSendMsg === 'function') {
                    await syncSendMsg(p, msg, files); try { await chatAddMsg(p, { me: true, t: msg, files: files, via: 'app' }); } catch (e) {}
                    aifSay('✅ «' + doc.title + '» ' + p.name + 'ga yuborildi (ilova ichida, PDF).');
                } else {
                    try { await chatAddMsg(p, { me: true, t: msg, files: files, via: 'telegram' }); } catch (e) {}
                    await docShare(files, { via: 'telegram', to: p, subject: doc.title, text: msg });
                    aifSay('📤 ' + p.name + ' serverga ulanmagan — «' + doc.title + '» Telegram orqali yuborish uchun ochildi.');
                }
                try { aiLog('Hujjat yuborildi: ' + doc.title + ' → ' + p.name); } catch (e) {}
            } catch (e) { console.error(e); aifSay('⚠️ Yuborilmadi: ' + agmkErrUz(e)); }
        }
        // Odamlar: korxona serveridagi hisoblar (ilovada ro'yxatdan o'tganlar) birinchi, keyin yozishmalar va xodimlar bazasi
        function aisPeople(q) {
            const srv = (typeof SIG !== 'undefined' && SIG.users ? SIG.users : []).filter(u => !u.demo).map(u => ({ name: u.name, tabel: u.tabel, role: u.lavozim, srv: true }));
            try { if (typeof sigSrv === 'function' && sigSrv() && (!SIG.users || Date.now() - (SIG.usersAt || 0) > 120000)) sigUsers(true).catch(() => {}); } catch (e) {}
            let A = srv.length ? aifFind(q, srv) : []; if (A.length === 1) return A;
            const L = aifFind(q); if (!A.length) A = L;
            if (A.length > 1) { const k = new Set(A.map(x => sigKey(String(x.name).split(/[\s.]+/).filter(w => w.length >= 3)[0] || x.name))); if (k.size === 1) { const s1 = A.find(x => x.srv) || A.find(x => x.tabel) || A[0]; return [s1]; } }
            return A;
        }
        function aisCmd(q) {
            const s = ai3Norm(q);
            if (!/(yubor|jo.?nat|tashla|otpravit|отправ|ulash|uzat)/.test(s) || /(natija|zamechan|замечан|izoh)/.test(s) && /(qaytar|natija)/.test(s)) return null;
            if (!/(akt|dalolatnoma|hujjat|grafig|grafik|jadval|kalkul|likvid|razukomp|pri[eyo]m|qabul akt|nosoz|defekt|pdf|акт|документ|график)/.test(s)) return null;
            const imzo = /imzo|подпис/.test(s);
            const P = aisPeople(q.replace(/(akt|dalolatnoma|hujjat|grafig\w*|jadval\w*|imzo\w*|yubor\w*|jo.?nat\w*)/gi, ' '));
            if (P.length > 1) return { t: '❓ Kimga yuboray: ' + P.slice(0, 5).map(x => x.name).join('; ') + '? Familiyasi va ismi bilan ayting.', personal: true };
            if (!P.length && !imzo) return null; // odam aytilmagan — oldingi yuborish ustasi (Telegram/pochta) ishlaydi
            let f = aifFindDoc(q); if ((!f || f.none) && /(oxirgi|so.?nggi|последн|hozirgi|shu)/.test(s)) { const L = aifDocs().filter(d => d.kind !== 'ppr').sort((a, b) => String(b.at || '').localeCompare(String(a.at || ''))); f = L.length ? { doc: L[0], more: 0 } : null; }
            if (!f || f.none) return { t: '📭 Qaysi hujjat? Topilmadi. Masalan: «20.09 dagi gʻildirak sinishi dalolatnomasini …», «00000563 likvidatsiya aktini …», «oxirgi aktni …».', personal: true };
            const doc = f.doc, p = P[0] || null;
            if (imzo) {
                setTimeout(async () => { try { aicClose(); } catch (e) {} const html = await aisDocHtml(doc); sigAuto({ html: html, title: doc.title, key: null, force: true, only: p && p.tabel ? [{ name: p.name, tabel: cleanTabel(p.tabel) }] : null }); }, 300);
                return { t: '✍️ «' + doc.title + '» ' + (p ? p.name + 'ga' : 'hujjatdagi imzo chekuvchilarga va rahbarga') + ' imzoga yuborilmoqda — 5 soniyada, «Bekor» bilan toʻxtatish mumkin.', personal: true };
            }
            const cm = (typeof aifComment === 'function' ? aifComment(q) : '') || '';
            setTimeout(() => aisCountdown('📤 Yuborish', `<div class="snd-doc">📄 ${escapeHtml(doc.title)}</div><div class="nd-tip">Kimga: <b>${escapeHtml(p.name)}</b>${cm ? '<br>Izoh: «' + escapeHtml(cm) + '»' : ''}</div>`, 5, () => aisSendDoc(doc, p, cm)), 300);
            return { t: '📤 «' + doc.title + '» ' + p.name + 'ga yuboriladi (5 soniyada, «Bekor» bilan toʻxtatish mumkin).', personal: true };
        }
        // ---------- Ulanishlar ----------
        (function () {
            // v3.2: saqlashda avtomatik yuborish o'rniga — hujjat tugmalari qatorida «✍️ Imzoga» (mod/docbar.js): bir bosishda hammaga
            window.addEventListener('agmk:login', () => setTimeout(() => { try { if (sigSrv()) sigUsers(true).catch(() => {}); } catch (e) {} }, 1500));
            if (typeof aiStage === 'function') aiStage('Hujjatni istalgan xodimga yuborish / imzoga yuborish', function (q, next) { try { const r = aisCmd(q); if (r) return r; } catch (e) { console.error(e); } return next(q); });
        })();

