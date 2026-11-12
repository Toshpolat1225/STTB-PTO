        // =========================================================
        // 1-3) OVOZLI SUHBAT: AI oynasida mikrofon = uzluksiz suhbat, to'liq ekranli oyna ochilmaydi
        // =========================================================
        var CONV_END = /^(rahmat|raxmat|katta rahmat|bo.?ldi|boldi|xayr|xayr[, ]*salomat bo.?ling|to.?xta|toxta|yetarli|tamom|stop|спасибо|хватит|стоп|всё|все|пока)[\s!.,]*$/i;
        (function () {
            startAiVoiceInput = agmkExtend('startAiVoiceInput', 'startAiVoiceInput', startAiVoiceInput, oS => function () {
                const m = $id('aiChatModal');
                if (m && !m.classList.contains('hidden')) { if (AILIVE.on) { aiLiveStop(); return; } kwsHoldCheck(); setTimeout(aiLiveStart, (window.AgmkNative && KWSH.held) ? 350 : 0); return; }
                return oS.apply(this, arguments);
            });
            aiSendText = agmkExtend('aiSendText', 'aiSendText', aiSendText, oT => function (q) {
                const n = String(q || '').trim();
                if (AILIVE.on && CONV_END.test(n)) {
                    aiLiveStop();
                    aicAdd('user', escapeHtml(n));
                    const t = /спасибо|хватит|стоп|пока|все|всё/i.test(n) ? 'Пожалуйста! Если понадоблюсь — позовите.' : "Arzimaydi! Kerak boʻlsam, chaqiring.";
                    aicAdd('bot', escapeHtml(t) + '<small class="ai-src">🎙 Suhbat yakunlandi</small>');
                    setTimeout(() => { try { aisMode('speak'); speakAiText(t, () => aisMode('idle')); } catch (e) {} }, 120);
                    return Promise.resolve('');
                }
                return oT.apply(this, arguments);
            });
            aicLiveBtn = agmkExtend('aicLiveBtn', 'aicLiveBtn', aicLiveBtn, oL => function () { const r = oL.apply(this, arguments); const t = $id('aicLiveTxt'); if (t && AILIVE.on) t.innerText = "🎙 Tinglayapman — savol bering. Javobdan keyin yana tinglayman. Tugatish: «rahmat» yoki «boʻldi»."; return r; });
            aiLiveStop = agmkExtend('aiLiveStop', 'aiLiveStop', aiLiveStop, oLS => function () { const was = AILIVE.on; const r = oLS.apply(this, arguments); if (was && !$id('aiChatModal').classList.contains('hidden')) { const t = $id('aicLiveTxt'); if (t) t.innerText = ''; } return r; });
        })();
        // Suhbat oynasi ochiq paytda to'liq ekranli mikrofon oynasi chiqmaydi
        (function () { micOvShow = agmkExtend('micOvShow', 'Suhbat oynasi ochiq paytda toʼliq ekranli mikrofon oynasi chiqmaydi', micOvShow, o => function (rec) { const m = $id('aiChatModal'); if (m && !m.classList.contains('hidden')) return; return o.apply(this, arguments); }); })();
        // Ilovada (APK) qaysi ovozni tanish xizmati ishlatilayotgani
        function srDiag() {
            let info = null; try { if (window.AgmkNative && AgmkNative.srInfo) info = JSON.parse(AgmkNative.srInfo()); } catch (e) {}
            const L = [];
            if (info) {
                L.push('🎙 Ishlatilayotgan xizmat: ' + (info.using || 'standart'));
                L.push('📋 Telefondagi xizmatlar: ' + ((info.services || []).join(', ') || 'topilmadi'));
                L.push(info.google ? '✅ Google ovozni tanish xizmati bor — ilova aynan shuni ishlatadi (oʻzbek tilini yaxshi taniydi).' : "⚠️ Google ilovasi topilmadi. Play Market'dan «Google» ilovasini oʻrnating yoki yangilang — oʻzbekcha ovozni tanish sifati ancha oshadi.");
                L.push('⏳ Gapdan keyin kutish: ' + (VPAUSE.ms / 1000) + ' soniya');
                L.push("🌐 Oʻzbek tilida tanish uchun internet kerak (Google xizmati).");
            } else L.push("Bu tekshiruv APK ilovada ishlaydi.");
            alert('🎤 Mikrofon tekshiruvi\n\n' + L.join('\n'));
        }
        (function () {
            const vp = $id('set-vp-sub') && $id('set-vp-sub').closest('.btn-card'); if (!vp || $id('set-srdiag')) return;
            const d = document.createElement('div'); d.className = 'btn-card'; d.id = 'set-srdiag'; d.onclick = srDiag;
            d.innerHTML = '<div class="btn-card-content"><span class="btn-icon">🩺</span><span class="btn-text">Mikrofon tekshiruvi<span class="set-sub">Qaysi ovozni tanish xizmati ishlayotganini koʻrsatadi</span></span></div><span class="btn-arrow">›</span>';
            vp.after(d);
        })();

