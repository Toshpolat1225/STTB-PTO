        /* ===== v1.9: ovozli ishni to'xtatish, akt ustasida mikrofon faqat bosilganda, stansiya sxemalari ===== */
        // ---------- 1) Akt ustasi: savoldan keyin mikrofon o'zi ochilmaydi (faqat 🎤 bosilganda) ----------
        (function () {
            if (typeof wSay === 'function') { wSay = agmkExtend('wSay', 'v1.9: ovozli ishni toʼxtatish, akt ustasida mikrofon faqat bosilganda, stansiya sxemalari · ---------- 1) Akt ustasi: savoldan keyin mikrofon oʼzi ochilmaydi (faqat 🎤 bosil', wSay, o => function (txt) { return o.call(this, txt, true); }); }
            if (typeof wListen === 'function') { wListen = agmkExtend('wListen', 'v1.9: ovozli ishni toʼxtatish, akt ustasida mikrofon faqat bosilganda, stansiya sxemalari', wListen, o => function () { const r = o.apply(this, arguments); try { W.miss = 99; } catch (e) {} return r; }); }
            // Ovozli buyruq bilan to'xtatish
            if (typeof wUser === 'function') {
                wUser = agmkExtend('wUser', 'v1.9: ovozli ishni toʼxtatish, akt ustasida mikrofon faqat bosilganda, stansiya sxemalari · Ovozli buyruq bilan toʼxtatish', wUser, o => function (t) {
                    const n = aiNorm(String(t || '')).replace(/[.,!?]/g, ' ').trim();
                    if (/^(toxta\w*|toxtat\w*|bekor qil\w*|tugat\w*|stop|стоп|хватит|отмена|kerak emas|boldi|bo ldi|chiq)( \w+)?$/.test(n)) {
                        try { W.log.push({ ai: false, t: String(t) }); } catch (e) {}
                        try { const o2 = W.voice; W.voice = false; W.log.push({ ai: true, t: "Xoʻp, toʻxtatdim. Kiritilgan maʼlumotlar formada saqlandi — davom etish uchun 🎤 yoki «AI bilan akt tuzish»ni bosing." }); W.voice = o2; } catch (e) {}
                        try { stopAiSpeaking(); } catch (e) {}
                        wStop(); return;
                    }
                    return o.apply(this, arguments);
                });
            }
        })();
        // ---------- 2) "⏹ To'xtatish" va "Orqaga" — ish darhol to'xtaydi (natija qabul qilinmaydi, mikrofon qayta ochilmaydi) ----------
        function stop40All() {
            try { if (typeof MOV !== 'undefined' && MOV.rec) { MOV.rec._killed = true; MOV.rec.abort(); } } catch (e) {}
            try { if (typeof W !== 'undefined' && W.rec) { W.rec.abort(); W.rec = null; } } catch (e) {}
            try { if (typeof W !== 'undefined' && W.on) { W.voice = false; if (typeof wRenderLog === 'function') wRenderLog(); } } catch (e) {}
            try { if (typeof AILIVE !== 'undefined' && AILIVE.on) aiLiveStop(); } catch (e) {}
            try { stopAiSpeaking(); } catch (e) {}
            try { if (typeof V38 !== 'undefined' && V38.bubRec) wk38Stop(); } catch (e) {}
            try { if (typeof V38 !== 'undefined' && V38.ynRec) V38.ynRec.abort(); } catch (e) {}
        }
        (function () {
            if (typeof micOvStop === 'function') { micOvStop = function () { stop40All(); setTimeout(() => { try { micOvHide(); } catch (e) {} }, 120); }; }
            // Ekrandan chiqilganda akt ustasining ovozli rejimi to'xtaydi
            if (typeof openScreen === 'function') { openScreen = agmkExtend('openScreen', 'v1.9: ovozli ishni toʼxtatish, akt ustasida mikrofon faqat bosilganda, stansiya sxemalari · Ekrandan chiqilganda akt ustasining ovozli rejimi toʼxtaydi', openScreen, o => function (id) { try { if (typeof W !== 'undefined' && W.on && id !== 'screen-nd') { stop40All(); wStop(); } } catch (e) {} return o.apply(this, arguments); }); }
            // Telefon «Orqaga» tugmasi — boshdagi agmkBack ichida (mikrofon oynasi, ovozli yozuv, sxema)
        })();
        // Natija to'xtatilgan tinglashdan kelsa — e'tiborsiz
        (function () {
            const SR = window.SpeechRecognition || window.webkitSpeechRecognition; if (!SR || !SR.prototype) return;
            const st = SR.prototype.start;
            try { SR.prototype.start = function () { const me = this; ['onresult'].forEach(k => { const f = me[k]; if (typeof f === 'function' && !f._w40) { const g = function () { if (me._killed) return; return f.apply(this, arguments); }; g._w40 = 1; me[k] = g; } }); return st.apply(this, arguments); }; } catch (e) {}
        })();

        // ---------- 3) Stansiya sxemalari: stansiya pasportida, AI javoblarida ----------
        var ST40_MAP = { izv: 'st1a', olm: 'st1b', svi: 'st2', fab: 'st3', med: 'st4', pre: 'st5', sau: 'st5', kol: 'st6a', kal: 'st7', por: 'st8', r668: 'st9a', raz: 'st9b', otv: 'st10', yos: 'st11' };
        function st40(id) { return (typeof ST_SX !== 'undefined' ? ST_SX : []).find(s => s.id === id) || null; }
        function st40Fact(s, re) { const x = (s.facts.boshqa || []).find(b => re.test(b)); return x ? x.replace(/^[^:]*:\s*/, '') : null; }
        function st40Open(id) {
            const d = ND_BUILTIN.find(x => x.id === 'st_sxema'); if (!d) return;
            const i = d.items.findIndex(it => it.t === 'fig' && it.page === id);
            GOST.lang = 'uz'; gostOpen('st_sxema', 'text'); if (i >= 0) setTimeout(() => gostJump(i), 150);
        }
        (function () {
            if (typeof openInfra !== 'function') return;
            openInfra = agmkExtend('openInfra', 'v1.9: ovozli ishni toʼxtatish, akt ustasida mikrofon faqat bosilganda, stansiya sxemalari', openInfra, o => function (id) {
                const r = o.apply(this, arguments);
                try {
                    let b = $id('st40-box'); const s = st40(ST40_MAP[id]);
                    if (!s) { if (b) b.remove(); return r; }
                    const scr = $id('screen-vagon-pasport');
                    if (!b) { b = document.createElement('div'); b.id = 'st40-box'; b.className = 'passport-container st40'; const ab = $id('alb-box'); const g = $id('pasportGalTitle') && $id('pasportGalTitle').closest('.passport-container'); const ref = ab || g; if (ref) ref.parentNode.insertBefore(b, ref); else scr.appendChild(b); }
                    const img = (ND_FIGS.st_sxema || {})[s.id] || '';
                    b.innerHTML = `<div class="passport-title"><span>📐 ${escapeHtml(s.ok)}-okolotka — “${escapeHtml(s.name)}” sxemasi (piket belgilari)</span></div>
                        <div class="st40-kpi"><div><small>Umumiy uzunlik</small><b>${escapeHtml(st40Fact(s, /Протяженн/) || '—')}</b></div><div><small>Strelkalar soni</small><b>${escapeHtml(st40Fact(s, /Стрелоч/) || '—')}</b></div><div><small>Piket belgilari</small><b>${(s.facts.piket || []).length} ta</b></div></div>
                        ${img ? `<img class="st40-img" src="${img}" alt="" onclick="gostZoom(this.src)">` : ''}
                        <button class="vs-btn" onclick="st40Open('${s.id}')">📐 Sxemani toʻliq ochish</button><small class="vs-note">🔒 Maxfiy: marksheyderlik boʻlimi sxemasi, 2024 y. · Kattalashtirish uchun rasmni bosing</small>`;
                } catch (e) { console.error(e); }
                return r;
            });
        })();
        function st40Find(n) {
            const S = (typeof ST_SX !== 'undefined' ? ST_SX : []);
            const al = [['st1a', /izvestkov|известков/], ['st1b', /olmaliq st|olmaliq stansiya|алмалык ст|станц\w* алмалык/], ['st2', /svinsov|svinets|свинцов/], ['st3', /fabrichn|фабричн/], ['st4', /mednaya|медная|mednay/], ['st5', /predgorn|предгорн|sauk|sovuq.?buloq|саук/], ['st6b', /lokomotiv depo|депо/], ['st6c', /qolmoqqir.?kolsev|kolsevaya.?peregon|peregonlari/], ['st6a', /kolsev|kolcev|кольцев/], ['st7', /qolmaqir|qalmoqqir|qolmoqqir|kalmakir|кальмак/], ['st8', /porodn|породн/], ['st9a', /668/], ['st9b', /razvyazk|razvyaz|развязк/], ['st10', /otvaln|отвальн/], ['st11', /yoshlik|ёшлик|yoshlik/], ['st12', /3.?mbf|chiqindi saqlash/]];
            for (const [id, re] of al) if (re.test(n)) return S.find(s => s.id === id) || null;
            return null;
        }
        function st40Answer(q) {
            const n = aiNorm(q).replace(/\s+/g, ' ');
            if (!/(stansiya|станц|st\b|razyezd|razezd|post|depo|депо|okolotka|околот|peregon|sxema|схем|piket|пикет|strelk|стрелк|uzunlig|протяж|mbf)/.test(n)) return null;
            // Okolotkalar ro'yxati
            if (/okolotka\w* (ro.?yxat|nechta|qaysi)|barcha okolotka|околотк\w* (список|сколько)/.test(n)) {
                const S = ST_SX; return { t: '📐 Stansiyalar sxemalari (okolotkalar boʻyicha, 2024):\n' + S.map(s => '• ' + s.ok + '-okolotka — ' + s.name + (st40Fact(s, /Протяженн/) ? ' (' + st40Fact(s, /Протяженн/) + ')' : '')).join('\n') + '\n📚 Manba: Marksheyderlik boʻlimi sxemalari', personal: true };
            }
            let s = st40Find(n);
            const ok = n.match(/(\d{1,2})\s*-?\s*okolotka|okolotka\s*(\d{1,2})|(\d{1,2})\s*-?\s*околот/);
            if (!s && ok) { const k = +(ok[1] || ok[2] || ok[3]); const L = ST_SX.filter(x => x.ok === k); if (L.length === 1) s = L[0]; else if (L.length > 1) return { t: '📐 ' + k + '-okolotkada ' + L.length + ' ta sxema: ' + L.map(x => x.name).join(', ') + '. Qaysi biri kerak?', personal: true }; }
            if (!s) return null;
            const L = [];
            if (/uzunlig|uzunligi|протяж|km|metr/.test(n)) L.push('📏 Umumiy uzunlik: ' + (st40Fact(s, /Протяженн/) || 'sxemada koʻrsatilmagan'));
            if (/strelk|стрелк|mso/.test(n)) L.push('🔀 Strelkalar soni: ' + (st40Fact(s, /Стрелоч/) || 'sxemada koʻrsatilmagan') + ((s.facts.strelka || []).length ? '\n   Belgilar: ' + s.facts.strelka.slice(0, 20).join(', ') + (s.facts.strelka.length > 20 ? ' …' : '') : ''));
            if (/piket|пикет|pk/.test(n)) L.push('📍 Piket belgilari (' + (s.facts.piket || []).length + ' ta): ' + (s.facts.piket || []).slice(0, 15).join('; ') + ((s.facts.piket || []).length > 15 ? ' …' : ''));
            if (/yo.?l|berk|путь|пути|masofa/.test(n) && !L.length) L.push('🛤 Yoʻl / masofa yozuvlari:\n' + (s.facts.yollar || []).slice(0, 10).map(x => '   • ' + x).join('\n'));
            if (/kim|imzo|tasdiq|kelish|marksheyder/.test(n)) L.push('✍️ ' + (s.facts.imzo || []).join('\n   '));
            if (!L.length) {
                L.push('📏 Umumiy uzunlik: ' + (st40Fact(s, /Протяженн/) || '—'), '🔀 Strelkalar soni: ' + (st40Fact(s, /Стрелоч/) || '—'), '📍 Piket belgilari: ' + (s.facts.piket || []).length + ' ta', '🏭 Obyektlar: ' + (s.facts.boshqa || []).filter(b => !/Протяжен|Стрелоч/.test(b)).slice(0, 8).join(', '));
                if (/sxema|схем|och|ko.?rsat/.test(n)) setTimeout(() => { try { aicClose(); } catch (e) {} st40Open(s.id); }, 600);
            }
            return { t: '📐 ' + s.ok + '-okolotka — “' + s.name + '”:\n' + L.join('\n') + '\n📚 Manba: stansiya sxemasi (marksheyderlik boʻlimi, 2024)', personal: true };
        }
        (function () {
            aiStage('Stansiyalar va yoʻllar', function (q, next) { try { const a = st40Answer(q); if (a) { try { V38.lastPersonal = true; } catch (e) {} return a; } } catch (e) { console.error(e); } return next(q); });
        })();
        (function () {
            const d = (typeof ND_BUILTIN !== 'undefined') && ND_BUILTIN.find(x => x.id === 'st_sxema');
            if (d) d.topic = /(stansiya|станц|okolotka|околот|piket|пикет|strelk|стрелк|sxema|схем|razyezd|razvyaz|depo)/;
            ndRender = agmkExtend('ndRender', 'v1.9: ovozli ishni toʼxtatish, akt ustasida mikrofon faqat bosilganda, stansiya sxemalari', ndRender, o => function () {
                const r = o.apply(this, arguments);
                try { document.querySelectorAll('#ndBody .nd-std[onclick*="st_sxema"]').forEach(el => { el.querySelectorAll('.nd-badge.ok, .nd-badge.uzt').forEach(b => b.remove()); if (!el.querySelector('.nd-badge.web')) { const s = document.createElement('span'); s.className = 'nd-badge web'; s.textContent = '🔒 Marksheyderlik · 16 sxema'; const c = el.querySelector('.nd-badge.cat'); if (c) c.before(s); } }); } catch (e) {}
                try { if (ND.view === 'gost' && ND.gid === 'st_sxema') { const sm = document.querySelector('#ndBody .gt-head small'); if (sm) sm.textContent = '🔒 Maxfiy: «Olmaliq KMK» AJ STTB marksheyderlik boʻlimi sxemalari (2024). Rasmni bosib kattalashtiring.'; const hd = document.querySelector('#ndBody .gt-head'); if (hd && !hd.querySelector('.vs-jump')) { const x = document.createElement('div'); x.className = 'vs-jump'; x.innerHTML = ST_SX.map(s => `<i onclick="st40Open('${s.id}')">${s.ok}. ${escapeHtml(s.name)}</i>`).join(''); hd.appendChild(x); } } } catch (e) {}
                return r;
            });
        })();

