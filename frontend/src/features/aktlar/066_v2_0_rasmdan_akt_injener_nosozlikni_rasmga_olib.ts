        // =====================================================================
        // v2.0 — RASMDAN AKT: injener nosozlikni rasmga olib izoh yozadi → rasm(lar)ni belgilab
        // «🤖 AI: rasmdan akt» (yoki ovoz/chat: «belgilangan rasm bo'yicha akt yoz») → AI tahlil qilib
        // mos dalolatnoma turini tanlaydi, matnini tuzadi, rasmlarni ilova qiladi.
        //  • Internetli AI (Gemini/Claude) yoqilgan bo'lsa — foydalanuvchi roziligi bilan faqat rasm, izoh
        //    va vagon turi/raqami yuboriladi (xodimlar ismlari, tabellar yuborilmaydi).
        //  • AI bo'lmasa — izohlar, vagon pasporti va sinishlar jadvali asosida lokal tuziladi.
        // =====================================================================
        var AIAKT = { ok: false, busy: false };
        function aiaktResize(blob, max) {
            return new Promise(res => {
                const u = URL.createObjectURL(blob), im = new Image();
                im.onload = () => { const k = Math.min(1, max / Math.max(im.naturalWidth, im.naturalHeight)); const c = document.createElement('canvas'); c.width = Math.round(im.naturalWidth * k); c.height = Math.round(im.naturalHeight * k); c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); URL.revokeObjectURL(u); c.toBlob(b => res(b || blob), 'image/jpeg', 0.8); };
                im.onerror = () => { URL.revokeObjectURL(u); res(blob); }; im.src = u;
            });
        }
        async function aiaktCloud(imgs, prompt) {
            const c = aicGet(); if (!c.key) throw new Error('API kalit kiritilmagan');
            const parts = [];
            for (const b of imgs) parts.push({ b64: await blobB64(await aiaktResize(b, 1280)) });
            let txt = '';
            if (c.prov === 'claude') {
                const r = await fetch(agmkNoNet('Tashqi AI'), { method: 'POST', headers: { 'content-type': 'application/json', 'x-api-key': c.key.trim(), 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' },
                    body: JSON.stringify({ model: aiModelOf(c), max_tokens: 900, messages: [{ role: 'user', content: parts.map(p => ({ type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: p.b64 } })).concat([{ type: 'text', text: prompt }]) }] }) });
                const j = await r.json().catch(() => ({})); if (!r.ok) throw new Error(aiErrText(r.status, (j.error && j.error.message) || ''));
                txt = (j.content || []).filter(x => x.type === 'text').map(x => x.text).join('\n');
            } else {
                const r = await fetch(agmkNoNet('Tashqi AI') + encodeURIComponent(aiModelOf(c)) + ':generateContent?key=' + encodeURIComponent(c.key.trim()), { method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ contents: [{ role: 'user', parts: parts.map(p => ({ inline_data: { mime_type: 'image/jpeg', data: p.b64 } })).concat([{ text: prompt }]) }], generationConfig: { temperature: 0.2, maxOutputTokens: 900, responseMimeType: 'application/json' } }) });
                const j = await r.json().catch(() => ({})); if (!r.ok) throw new Error(aiErrText(r.status, (j.error && j.error.message) || ''));
                const cand = (j.candidates || [])[0]; txt = ((cand && cand.content && cand.content.parts) || []).map(p => p.text || '').join('');
            }
            const m = String(txt).replace(/```json|```/g, '').match(/\{[\s\S]*\}/); if (!m) throw new Error('AI javobi tushunarsiz');
            return JSON.parse(m[0]);
        }
        function aiaktGj(no) { const n = String(no || '').replace(/\D/g, '').replace(/^0+/, ''); return n ? (typeof GJ26 !== 'undefined' ? GJ26 : []).filter(x => String(x.vagon).replace(/^0+/, '') === n).sort((a, b) => nd41Iso(b.sana).localeCompare(nd41Iso(a.sana)))[0] || null : null; }
        function aiaktCom(tur) {
            const S = ndSigners().filter(x => x.l === 'uz' && !x.ap), out = [];
            const want = tur === 'oq_sinish' ? [/^ICHTB boshlig\S*$/i, /^VX boshlig/i, /ICHTB vagonlar bo\S* muhandisi/i] : [/^ICHTB boshlig\S*$/i, /ICHTB vagonlar bo\S* muhandisi/i];
            want.forEach(re => { const s = S.find(x => re.test(x.r)); if (s) out.push({ r: s.r, n: s.n }); });
            return out;
        }
        async function albAiAkt() {
            if (AIAKT.busy) return; const item = albUnit(); if (!item) { alert('Avval vagon (texnika) pasportini oching.'); return; }
            let l = albOf(item.id); if (ALB.sel.size) l = l.filter(x => ALB.sel.has(x.id));
            if (!l.length) { alert('Albomda rasm yoʻq. Avval nosozlikni rasmga oling va izoh yozing.'); return; }
            if (!ALB.sel.size && l.length > 1) { if (!(await uiConfirm('Rasmlar belgilanmagan. Albomdagi barcha ' + l.length + ' ta element boʻyicha akt tuzilsinmi?\n\n(Belgilash uchun rasm burchagidagi ☐ ni bosing.)'))) return; }
            l = l.slice().sort((a, b) => String(a.at).localeCompare(String(b.at)));
            const photos = l.filter(x => !x.kind), no = vagonNo(item), model = String(item.naim || item.model || item.name || '').trim();
            const notes = l.map(x => (x.note || '').trim()).filter(Boolean), aiNotes = l.map(x => (x.ai || '').trim()).filter(Boolean);
            const gj = aiaktGj(no);
            let res = null, via = 'local';
            AIAKT.busy = true;
            try {
                if (photos.length && typeof aiCloudReady === 'function' && aiCloudReady()) {
                    let go = false;
                    { go = await uiConfirm('🤖 Tanlangan ' + Math.min(photos.length, 4) + ' ta rasm, ularning izohlari va vagon turi/raqami tahlil uchun internetli AI ga (' + (aicGet().prov === 'claude' ? 'Claude' : 'Google Gemini') + ') yuboriladi.\n\nXodimlarning ismi, tabel raqami va boshqa shaxsiy maʼlumotlar yuborilmaydi.\n\nRozimisiz? («Yoʻq» — AI siz, izohlar asosida tuziladi)'); }
                    if (go) {
                        showToast('🤖 AI rasmlarni tahlil qilmoqda...');
                        const blobs = []; for (const x of photos.slice(-4)) { const b = await mediaGetBlob(x.ref); if (b) blobs.push(b); }
                        const safe = s => (typeof aiMask === 'function' ? aiMask(s) : s);
                        const prompt = `Sen "Olmaliq KMK" AJ sanoat temir yoʻl transporti boshqarmasi (STTB) vagon xoʻjaligi muhandisisan. Quyidagi rasm(lar) va injener izohlari asosida rasmiy dalolatnoma uchun maʼlumot tayyorla.
Qoidalar: faqat rasmda aniq koʻringan yoki izohda yozilgan faktlarni yoz; taxmin qilma; raqam, sana, oʻlchamni oʻylab topma (izohda boʻlmasa yozma). Oʻzbek tilida (lotin), rasmiy-texnik uslubda.
Vagon: ${safe(model || 'vagon')} №${no}.
Injener izohlari: ${notes.length ? notes.map((n, i) => (i + 1) + ') ' + safe(n)).join('; ') : '(yoʻq)'}.
${gj ? 'Maʼlumot: bu vagonda ' + gj.sana + ' kuni gʻildirak juftligi oʻqi singan (sinish joyi: ' + nd41Lat(gj.joy) + ').' : ''}
Javobni FAQAT JSON koʻrinishida ber:
{"tur":"oq_sinish" (oʻq/gʻildirak juftligi sinishi boʻlsa) | "defekt" (vagon qismlarida nosozlik) | "umumiy","nosozliklar":["har biri bitta qisqa rasmiy gap"],"obyekt":"qism yoki vagon nomi","sinish_joyi":"oʻrta qismi"|"sheyka qismi"|"gupchak osti qismi"|"gupchak oldi qismi"|null,"korroziya_foiz":son yoki null,"xulosa":"1 gap yoki boʻsh","ishonch":"yuqori"|"oʻrta"|"past"}`;
                        res = await aiaktCloud(blobs, prompt); via = 'cloud';
                        if (typeof aiUnmask === 'function' && res) ['nosozliklar'].forEach(k => { if (Array.isArray(res[k])) res[k] = res[k].map(s => aiUnmask(String(s))); });
                    }
                }
            } catch (e) { showToast('⚠️ AI tahlil qilmadi (' + agmkErrUz(e) + ') — izohlar asosida tuzilmoqda'); res = null; via = 'local'; }
            finally { AIAKT.busy = false; }
            // ---- Lokal xulosa (AI siz) ----
            const allTxt = (notes.concat(aiNotes)).join(' \n ');
            let tur = res && /^(oq_sinish|defekt|umumiy)$/.test(res.tur) ? res.tur : (gj || /o.q\w*\s*(sin|sind)|o.qning.*sin|g.ildirak juftlig\w*.*sin|излом|ось.*слом/i.test(allTxt) ? 'oq_sinish' : 'defekt');
            if (gj && tur !== 'oq_sinish' && /sin|излом/i.test(allTxt)) tur = 'oq_sinish';
            let lines = res && Array.isArray(res.nosozliklar) ? res.nosozliklar.map(s => String(s).trim()).filter(Boolean) : notes.slice();
            if (!lines.length && tur !== 'oq_sinish') { alert('Rasmlarga izoh yozilmagan va AI ulanmagan.\n\nRasmni bosib «✏️ Izoh» yozing (masalan: «avtostsepka korpusida 40 mm yoriq») yoki Parametrlarda AI kalitini kiriting.'); return; }
            // ---- Forma ----
            ND.form = null; ND.html = ''; ND.oqSrc = null;
            ND.albumPhotos = l.map(x => ({ ref: x.ref, at: x.at, note: x.note || '' })); ND.albumUnit = no;
            ND.albumHtml = await albAnnexHtml(ND.albumPhotos, no);
            ndOpenAkt();
            const f = ND.form; f.tur = tur; f.lang = 'uz'; f.langSet = true; f.vag = no; f.sana = todayISO();
            const first = String(l[0].at || '').slice(0, 10); if (first && first !== f.sana) { f.hsSame = false; f.hs = first; }
            f.obj = tur === 'defekt' ? '' : (res && res.obyekt ? String(res.obyekt) : model); f.text = lines.join('\n'); // defekt: obyekt = vagonning o'zi (pasportdan)
            f.com = aiaktCom(tur); f.apObj = ndDefApObj();
            if (tur === 'oq_sinish') {
                const q = ndOq(); q.tip = nd41Tip(item) || q.tip;
                if (gj) { ndRender(); ndOqFill(); }
                if (res && res.sinish_joyi && OQ_JOY.includes(res.sinish_joyi)) ND.form.oq.joyS = res.sinish_joyi;
                if (res && res.korroziya_foiz != null && res.korroziya_foiz !== '' && isFinite(+res.korroziya_foiz)) ND.form.oq.korr = String(+res.korroziya_foiz);
                else if (/korroziya|коррози/i.test(allTxt)) { const m = allTxt.match(/(\d{1,3}(?:[.,]\d)?)\s*%/); ND.form.oq.korr = m ? m[1] : (/korroziya\w*\s+(yo.q|aniqlanmadi)|коррози\w* нет/i.test(allTxt) ? '' : 'bor'); }
                if (res && res.xulosa && String(res.xulosa).trim().length > 20) ND.form.oq.xul = String(res.xulosa).trim();
            }
            ndRender();
            if (!ND.form.com.length) { showToast('ℹ️ Komissiya aʼzolarini tanlab, «Dalolatnomani tuzish» ni bosing'); return; }
            await ndGenerate();
            try {
                ND.used = (ND.used || []).concat([{ title: via === 'cloud' ? '🤖 ' + photos.length + ' ta rasm AI tahlili (' + (aicGet().prov === 'claude' ? 'Claude' : 'Gemini') + ')' + (res && res.ishonch ? ', ishonch: ' + res.ishonch : '') : '📝 Injener izohlari (' + notes.length + ' ta) — AI siz, lokal', src: 'Nosozlik albomi · vagon №' + no }]);
                ND.trInfo = { warn: [], html: (via === 'cloud' ? '🤖 Akt rasmlar tahlili asosida AI tomonidan tayyorlandi.' : '📝 Akt injener izohlari asosida tayyorlandi.') + ' Tekshirib chiqing: faktlar, raqamlar va komissiya tarkibi. Hujjat ustiga bosib tahrirlash mumkin.' + (ND.trInfo && ND.trInfo.html ? '<br>' + ND.trInfo.html : '') };
                ndRender();
            } catch (e) {}
            showToast(via === 'cloud' ? '🤖 Akt AI tahlili asosida tayyorlandi — tekshirib chiqing' : '📄 Akt izohlar asosida tayyorlandi — tekshirib chiqing');
        }
        // Albom pastiga tugma
        (function () {
            albRender = agmkExtend('albRender', 'Albom pastiga tugma', albRender, oR => function () {
                const r = oR.apply(this, arguments);
                try { const ft = document.querySelector('#alb-box .alb-foot'); if (ft && !ft.querySelector('.aiakt-b')) { ft.insertAdjacentHTML('beforeend', `<button class="action-btn aiakt-b" onclick="albAiAkt()">🤖 AI: rasmdan akt${ALB.sel.size ? ' (' + ALB.sel.size + ')' : ''}</button>`); } } catch (e) {}
                return r;
            });
        })();
        // Ovoz / chat: «belgilangan rasm bo'yicha akt yoz»
        (function () {
            const RE = /(rasm|foto|surat|belgilang|tanlang)\w*.{0,40}(akt|dalolatnoma)|(akt|dalolatnoma)\w*.{0,30}(rasm|foto|surat)/i;
            aiStage('Rasmdan akt', function (q, next) {
                try {
                    const s = String(q || '');
                    if (RE.test(s) && /(yoz|tuz|tayyorla|qil|chiqar)/i.test(s)) {
                        const onP = $id('screen-vagon-pasport') && $id('screen-vagon-pasport').classList.contains('active') && albUnit() && albOf(albUnit().id).length;
                        if (onP) { setTimeout(() => { try { if (typeof aicClose === 'function') aicClose(); } catch (e) {} albAiAkt(); }, 500); return { t: '🤖 ' + (ALB.sel.size ? ALB.sel.size + ' ta belgilangan' : 'Albomdagi') + ' rasm boʻyicha dalolatnoma tayyorlanmoqda...', personal: true }; }
                        return { t: "📸 Rasmdan akt tuzish:\n1) Vagon (texnika) pasportini oching.\n2) «Eslatma albomi — nosozlik» boʻlimida rasmga oling va izoh yozing.\n3) Kerakli rasmlarni ☐ bilan belgilang.\n4) «🤖 AI: rasmdan akt» ni bosing — yoki shu yerda «belgilangan rasm boʻyicha akt yoz» deng.", personal: true };
                    }
                } catch (e) { console.error(e); }
                return next(q);
            });
        })();

