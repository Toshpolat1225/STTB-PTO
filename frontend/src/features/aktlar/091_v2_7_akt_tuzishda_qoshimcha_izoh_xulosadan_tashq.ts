        // =====================================================================
        // v2.7 — Akt tuzishda qo'shimcha izoh (xulosadan tashqari) va tayyor aktni tahrirlab saqlash
        // =====================================================================
        (function () {
            try { if (typeof ND41_IDS !== 'undefined' && !ND41_IDS.includes('izoh')) ND41_IDS.push('izoh'); } catch (e) {}
            // Forma: xulosa oldidan «Qo'shimcha izoh» maydoni
            if (typeof ndRenderAkt === 'function') { ndRenderAkt = agmkExtend('ndRenderAkt', 'Forma: xulosa oldidan «Qoʼshimcha izoh» maydoni', ndRenderAkt, o => function () { const r = o.apply(this, arguments); try {
                const x = $id('ndOq_xul'); if (x && !$id('ndOq_izoh')) { const q = ndOq(); x.closest('.nd-f').insertAdjacentHTML('beforebegin', `<div class="nd-f"><label>QOʻSHIMCHA IZOH (ixtiyoriy — har qatori alohida band boʻlib, xulosadan oldin chiqadi)</label><textarea id="ndOq_izoh" rows="3" placeholder="masalan: Vagon depo taʼmiridan keyin 45 kun ishlagan.">${escapeHtml(q.izoh || '')}</textarea></div>`); }
                const p = $id('ndPage'); if (p && !p.previousElementSibling?.classList?.contains('nd-edit-tip')) p.insertAdjacentHTML('beforebegin', '<div class="nd-edit-tip">✏️ Tayyor akt matnini shu yerning oʻzida bosib tahrirlang (qoʻshing, oʻchiring). «💾 Arxivga saqlash» — tahrirlangan holi saqlanadi. Formani oʻzgartirib qayta tuzsangiz, qoʻlda kiritilgan tahrir yangilanadi.</div>');
            } catch (e) {} return r; }); }
            // Shablon: izoh bandlari xulosadan oldin
            if (typeof nd41BuildOq === 'function') { nd41BuildOq = agmkExtend('nd41BuildOq', 'Shablon: izoh bandlari xulosadan oldin', nd41BuildOq, o => function (f) { const r = o.apply(this, arguments); try {
                const q = ndOq(), iz = String(q.izoh || '').split('\n').map(s => s.trim()).filter(Boolean); if (!iz.length || !r || !r.html) return r;
                const add = iz.map(s => `<p class="a-li">${nd41Bold(s.replace(/^[-•]\s*/, ''))}</p>`).join(''), xul = `<p>${nd41Bold(q.xul || OQ_XUL)}</p>`, i = r.html.indexOf(xul);
                if (i >= 0) r.html = r.html.slice(0, i) + add + r.html.slice(i);
            } catch (e) {} return r; }); }
            // Arxivdagi aktni tahrirlab saqlash
            if (typeof ndOpenArch === 'function') { ndOpenArch = agmkExtend('ndOpenArch', 'Arxivdagi aktni tahrirlab saqlash', ndOpenArch, o => function (id) { const r = o.apply(this, arguments); try {
                const acts = document.querySelector('#ndBody .nd-acts'), p = $id('ndPage'); if (acts && p && !$id('ndArchSave')) { acts.insertAdjacentHTML('afterbegin', `<button class="action-btn" id="ndArchSave" style="background:#15803d" onclick="ndArchSave('${id}')">💾 Tahrirni saqlash</button>`); p.insertAdjacentHTML('beforebegin', '<div class="nd-edit-tip">✏️ Matnni bosib tahrirlang, soʻng «💾 Tahrirni saqlash».</div>'); }
            } catch (e) {} return r; }); }
        })();
        function ndArchSave(id) {
            const p = $id('ndPage'); if (!p) return; const a = ndAkts(), x = a.find(z => z.id === id); if (!x) return;
            x.hist = (x.hist || []).concat([{ at: new Date().toISOString(), by: authorStr(), html: x.html }]).slice(-5); x.html = p.innerHTML; x.upd = new Date().toISOString(); x.updBy = authorStr();
            if (ndSet(ND_AKT_KEY, a)) showToast('💾 Tahrir saqlandi (oldingi holati tarixda)'); try { aiLog('Akt tahrirlandi: ' + (x.title || id)); } catch (e) {}
        }

