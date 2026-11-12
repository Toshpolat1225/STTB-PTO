        // =====================================================================
        // v2.0 — AKTNI RASMIY VA XATOSIZ QILISH: har bir tuzilgan dalolatnomaga avtomatik imlo va uslub tekshiruvi
        // (tutuq belgilari, bosh harf xatolari, ortiqcha bo'shliq, takror so'z, tinish belgisi, sana shakli).
        // Nima tuzatilgani ro'yxat bilan ko'rsatiladi — xodim ko'rib chiqadi.
        // =====================================================================
        function imloFix(text, lang, log) {
            let s = text; const was = s, rule = (re, to, what) => { const b = s; s = s.replace(re, to); if (b !== s && log) log.add(what); };
            if (lang !== 'ru') {
                rule(/([oOgG])['`ʼ’ʻ‘]/g, (m, a) => a + '‘', "oʻ/gʻ harflari yagona shaklga keltirildi");
                rule(/([a-zA-Z])['`ʼʻ](?=[a-z])/g, '$1’', 'tutuq belgisi (’) yagona shaklga keltirildi');
                rule(/([a-z][‘’])([A-Z])(?=[a-z]*\b)(?![A-Z])/g, (m, a, b) => a + b.toLowerCase(), 'soʻz ichidagi bosh harf xatosi (masalan «boshligʻI»)');
                rule(/(\d{2}\.\d{2}\.\d{4})\s*y\.(?!\w)/g, '$1-y.', 'sana shakli «dd.mm.yyyy-y.»');
                rule(/(\d{4})\s+yil(?=\s)/g, '$1-yil', 'yil shakli «yyyy-yil»');
            }
            rule(/[  ]{2,}/g, ' ', 'ortiqcha boʻshliqlar olib tashlandi');
            rule(/\s+([,.;:!?)])/g, '$1', 'tinish belgisidan oldingi boʻshliq olib tashlandi');
            rule(/([,;:])(?=[A-Za-zА-Яа-яЁёʻ‘’"«])/g, '$1 ', 'vergul/nuqtali verguldan keyin boʻshliq qoʻshildi');
            rule(/\b(va|и|hamda|bilan|uchun|dan|the)\s+\1\b/gi, '$1', 'takrorlangan soʻz olib tashlandi');
            rule(/(?<!\.)\.\.(?!\.)/g, '.', 'ikkita nuqta tuzatildi');
            return s === was ? text : s;
        }
        function imloHtml(html, lang) {
            const box = document.createElement('div'); box.innerHTML = html; const log = new Set();
            const walk = el => { el.childNodes.forEach(n => { if (n.nodeType === 3) { const t = imloFix(n.textContent, lang, log); if (t !== n.textContent) n.textContent = t; } else if (n.nodeType === 1 && !/^(IMG|SCRIPT|STYLE)$/.test(n.tagName) && !n.classList.contains('alb-fig')) walk(n); }); };
            walk(box);
            // ro'yxat bandlari va xatboshilar bosh harf bilan boshlanadi
            box.querySelectorAll('p.a-li, p.ni').forEach(p => { const f = p.firstChild; if (f && f.nodeType === 3) { const m = f.textContent.match(/^(\s*[-–•]?\s*)([a-zа-яё])/); if (m) { f.textContent = m[1] + m[2].toUpperCase() + f.textContent.slice(m[0].length); log.add('band bosh harf bilan boshlandi'); } } });
            return { html: box.innerHTML, log: [...log] };
        }
        (function () {
            ndGenerate = agmkExtend('ndGenerate', 'ndGenerate', ndGenerate, o => async function () {
                const r = await o.apply(this, arguments);
                try {
                    if (ND.html) { const l = typeof ndLang === 'function' ? ndLang() : 'uz'; const x = imloHtml(ND.html, l);
                        if (x.log.length) { ND.html = x.html; const add = '✔️ Imlo va uslub avtomatik tuzatildi: ' + x.log.join('; ') + '.'; ND.trInfo = { warn: (ND.trInfo && ND.trInfo.warn) || [], html: ((ND.trInfo && ND.trInfo.html) ? ND.trInfo.html + '<br>' : '') + escapeHtml(add) }; ndRender(); } }
                } catch (e) { console.error(e); }
                return r;
            });
        })();
        // ===== v2.0: AI sozlamasida — rasm tahlili va bepul tarif haqida ogohlantirish =====
        (function () {
            if (typeof openAiCfg !== 'function') return;
            openAiCfg = agmkExtend('openAiCfg', 'v2.0: AI sozlamasida — rasm tahlili va bepul tarif haqida ogohlantirish', openAiCfg, o => function () {
                const r = o.apply(this, arguments);
                try { const p = document.querySelector('#aiCfgBody .aic-priv'); if (p && !p.querySelector('.aic41')) p.insertAdjacentHTML('beforeend', '<div class="aic41"><br>• 📸 «Rasmdan akt»: faqat har safar rozilik soʻralgach — tanlangan rasmlar (1280 px gacha), ularning izohi (ismlar belgiga almashtirilgan) va vagon turi/raqami yuboriladi.<br>• ⚠️ Google Gemini bepul tarifida yuborilgan maʼlumotlar Google tomonidan AI ni oʻqitishda ishlatilishi mumkin — shu sababli xodimlarning shaxsiy maʼlumotlari, MM hujjatlari va maxfiy sxemalar hech qachon yuborilmaydi.</div>'); } catch (e) {}
                return r;
            });
        })();
        // ===== v2.0: oldingi versiyalarda qurilmaga yozilgan boshliq (1111) standart paroli o'chiriladi =====
        (function () {
            try {
                if (localStorage.getItem('agmk_rb_pw_rm') === '1') return;
                const a = getAccounts(); const r = a['1111'];
                // faqat o'zgartirilmagan standart parol (o'sha "tuz" bilan) o'chiriladi; boshliq o'zi qo'ygan parolga tegilmaydi
                if (r && r.salt === 'rb8648bd62346') { delete a['1111']; saveAccounts(a); try { logPw("Standart boshliq paroli xotiradan o'chirildi (v2.0)", '1111', ''); } catch (e) {} }
                localStorage.setItem('agmk_rb_pw_rm', '1');
            } catch (e) { console.error(e); }
        })();


