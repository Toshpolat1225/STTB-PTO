        // =====================================================================
        // v2.9 — AI tugmasi bosilganda: jim ochiladi («Labbay» demaydi, mikrofon o'zi yoqilmaydi).
        //  Ovozli salomlashish va tinglash — faqat «Salom, Ey AI» chaqiruvi bilan kelganda (eski tizim).
        //  Qo'lda yozilgan savolga AI o'zi gapirmaydi — faqat 🔊 tugmasi bosilsa o'qiydi.
        // =====================================================================
        var AI47 = { wake: 0 };
        (function () {
            const mark = n => { if (typeof window[n] !== 'function') return; const o = window[n]; window[n] = function () { AI47.wake = Date.now(); return o.apply(this, arguments); }; };
            ['kwsWake', 'wakeFire', 'wk38Open', 'wk38Listen'].forEach(mark);
            if (typeof aiGlobalOpen === 'function') { const o = aiGlobalOpen; const w = function () { const byWake = Date.now() - AI47.wake < 15000; if (!byWake) aiGlobalOpen._silent = true; AI47.quiet = !byWake; const r = o.apply(this, arguments); aiGlobalOpen._silent = false; try { if (typeof aicLabbay === 'function') aicLabbay(); } catch (e) {} return r; }; aiGlobalOpen = w; }
            // Bo'sh oyna matni: jim ochilganda — «Labbay» emas, salom va ko'rsatma
            if (typeof aicLabbay === 'function') { aicLabbay = agmkExtend('aicLabbay', 'Boʼsh oyna matni: jim ochilganda — «Labbay» emas, salom va koʼrsatma', aicLabbay, o => function () { if (!AI47.quiet) return o.apply(this, arguments); const e = $id('aicEmpty'); if (!e) return; let n = ''; try { n = userAddress(); } catch (x) {} e.innerHTML = `<b>${escapeHtml(n ? 'Assalomu alaykum, ' + n + '!' : 'Assalomu alaykum!')}</b><span>Savolingizni yozing yoki 🎤 tugmasini bosib gapiring.</span>`; }); }
            // Mikrofon bosilganda — ovozli rejim (keyingi javoblar ovoz bilan)
            if (typeof startAiVoiceInput === 'function') { startAiVoiceInput = agmkExtend('startAiVoiceInput', 'Mikrofon bosilganda — ovozli rejim (keyingi javoblar ovoz bilan)', startAiVoiceInput, o => function () { AI47.quiet = false; return o.apply(this, arguments); }); }
            // Qo'lda yozilganda «O'qib beraymi?» ovoz chiqarib so'ralmaydi (faqat tugma)
            if (typeof read38Offer === 'function') { read38Offer = agmkExtend('read38Offer', 'Qoʼlda yozilganda «Oʼqib beraymi?» ovoz chiqarib soʼralmaydi (faqat tugma)', read38Offer, o => function () { const v = typeof V38 !== 'undefined' && Date.now() < V38.voiceUntil; if (v) return o.apply(this, arguments); const was = aiVoiceOutputEnabled; try { aiVoiceOutputEnabled = false; return o.apply(this, arguments); } finally { aiVoiceOutputEnabled = was; } }); }
        })();

