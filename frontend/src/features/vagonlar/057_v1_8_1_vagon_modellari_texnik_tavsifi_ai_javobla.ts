        /* ===== v1.8.1: Vagon modellari texnik tavsifi — AI javoblari, pasportdan havola ===== */
        (function () {
            const d = ND_BUILTIN.find(x => x.id === 'vag_spec_web'); if (!d) return;
            d.topic = /(31-?634|33-?9909|33-?9035|31-?656|31-?673|31-?638|31-?661|15-?9724|15-?9726|15-?1407|15-?1402|15-?1548|13-?401|55-?76|19-?4101)(?!\d)/;
        })();
        // Model aliaslari
        function vsFind(n) {
            n = String(n || '');
            for (const m of VS_MODELS) { const a = m.replace('-', '[-\\s]?').replace('Н', '(?:н|n|h)'); if (new RegExp('(^|[^\\d])' + a + '(?![\\d])', 'i').test(n)) { if (m === '33-9909' && /33[-\s]?9909\s*(н|n|h)(?![a-zа-яё0-9])/i.test(n)) return '33-9909Н'; return m; } }
            return null;
        }
        var VS_P = [
            [/yuk ko.?tar|yuk sig|грузоподъ|necha tonna yuk|qancha yuk/, /грузоподъ/, "Yuk koʻtarish qobiliyati"],
            [/\btara\w*|bo.?sh (vagon|og.?irlig)|o.?z og.?irlig|massa|тара|масса тар/, /тар/, "Tara (boʻsh vagon) massasi"],
            [/hajm|kub|объ[её]м/, /объ[её]м|удельн/, "Kuzov / qozon hajmi"],
            [/uzunlig|uzunligi|длин/, /длина/, "Uzunlik"],
            [/\bbaza\w*|база/, /^база/, "Vagon bazasi"],
            [/kenglig|ширин/, /ширин/, "Kenglik"],
            [/balandlig|высот/, /высот/, "Balandlik"],
            [/tezlig|tezlik|скорост/, /скорост/, "Konstruksion tezlik"],
            [/aravacha|telejka|тележ/, /тележ/, "Aravacha modeli"],
            [/burchag|ag.?dar|угол/, /угол|разгруз/, "Agʻdarish burchagi va usuli"],
            [/silindr|цилиндр/, /цилиндр/, "Agʻdarish silindrlari"],
            [/bosim|давлен/, /давлен/, "Ishchi / sinov bosimi"],
            [/xizmat muddat|srok sluj|срок служб|necha yil xizmat/, /срок службы/, "Xizmat muddati"],
            [/ta.?mirlararo|\bdr\b|\bkr\b|deposk|kapital|межремонт|ремонт/, /межремонт/, "Taʼmirlararo meʼyorlar"],
            [/ishlab chiqar|zavod|kim ishlab|изготов|производ|завод/, /изготов|производ|manufacturer|продав/, "Ishlab chiqaruvchi"],
            [/gabarit|габарит/, /габарит/, "Gabarit"],
            [/o.?q yuklama|yuklama|нагрузк/, /нагрузк/, "Oʻq / pogon yuklama"],
            [/\btu\b|texnik shart|\bту\b/, /^ту$|^ту\b|ту$/, "Texnik shartlar (TU)"],
            [/qachondan|yil\w* ishlab|qaysi yil|годы|год выпуск/, /year|год|выпуск/, "Ishlab chiqarilgan yillar"],
            [/diametr|диаметр/, /диаметр/, "Qozon diametri"],
            [/material|po.?lat|материал|сталь/, /материал/, "Material"]
        ];
        function vsDom(u) { try { return new URL(String(u).split(/\s*;\s*/)[0]).hostname.replace(/^www\./, ''); } catch (e) { return String(u || '').slice(0, 40); } }
        function vsVal(v) { return v.v + (v.u && !/topilmadi/.test(v.v) ? ' ' + v.u : ''); }
        function vsAnswer(q) {
            const n = aiNorm(q).replace(/\s+/g, ' ');
            if (/diametr|balandlig|qalinlig|kengligi|uzunligi|o.?lcham|og.?irlig|bosim|prokat|\bmm\b|диаметр|высот|толщин|ширин|длин|размер|давлен/.test(n) && !/\b\d{3,}\b/.test(n)) return null; // o'lcham/me'yor savoli — statistika emas
            let model = vsFind(n), viaUnit = null;
            // "8121 vagonning tarasi" — bazadagi vagon modelidan
            if (!model) {
                const wantP = VS_P.some(x => x[0].test(n)) || /texnik (tavsif|parametr|ma.?lumot|xarakteristika)|tavsifi|характеристик|sxema|chizma|чертеж|схем/.test(n);
                const num = (n.match(/\b\d{3,8}\b/) || [])[0];
                if (wantP && num && /vagon|вагон|dumpkar|sisterna|platforma|xopper/.test(n)) { try { const v = vagonlarData.find(x => vagonNo(x) === num || String(x.inv || '') === num); if (v && VS_MODELS.includes(v.model)) { model = v.model; viaUnit = v; } } catch (e) {} }
                if (!model && /(bu|shu|ushbu) vagon/.test(n) && wantP) { try { const v = vagonlarData.find(x => x.id === activeVagonId); if (v && VS_MODELS.includes(v.model)) { model = v.model; viaUnit = v; } } catch (e) {} }
            }
            if (!model) return null;
            const M = VS_DATA.find(x => x.model === model); if (!M) return null;
            const head = (viaUnit ? '🚃 Vagon №' + vagonNo(viaUnit) + ' — model ' + model : '🚃 Model ' + model) + ' (' + M.app + ')';
            let hits = VS_P.filter(x => x[0].test(n));
            // Aniq vagon (raqami bilan) so'ralsa — yil, zavod va ta'mir sanalari pasportdan (model ma'lumoti emas)
            if (viaUnit) { hits = hits.filter(x => !/Ishlab chiqar|Taʼmirlararo/.test(x[2])); if (!hits.length) return null; }
            const foot = '\n🌐 Manba: internetdagi ochiq manbalar (' + [...new Set(M.values.filter(v => v.s).map(v => vsDom(v.s)))].slice(0, 3).join(', ') + '). Rasmiy hujjat emas — vagon formulyari bilan solishtiring.\n📖 Batafsil va sxema: Normativ hujjatlar → «Vagonlar texnik tavsifi».';
            if (hits.length) {
                const lines = [];
                hits.forEach(([re, pre, lbl]) => {
                    let vs = M.values.filter(v => pre.test(String(v.p).toLowerCase()));
                    if (lbl === 'Uzunlik') vs = vs.filter(v => /по осям|^длина$|рамы|раме|котла/.test(v.p.toLowerCase()));
                    const ok = vs.filter(v => !/topilmadi/.test(v.v));
                    if (!ok.length) { lines.push('• ' + lbl + ': ochiq manbalarda topilmadi'); return; }
                    const uniq = [...new Set(ok.map(vsVal))];
                    lines.push('• ' + lbl + (uniq.length > 1 ? ' (manbalar farq qiladi)' : '') + ':\n' + ok.slice(0, 4).map(v => '   – ' + (vs.length > 1 && !/^(грузоподъ|масса тары|база)/i.test(v.p) ? v.p + ': ' : '') + vsVal(v) + ' [' + vsDom(v.s) + ']').join('\n'));
                });
                return head + ':\n' + lines.join('\n') + foot;
            }
            // Umumiy qisqa tavsif
            const pick = (re) => { const v = M.values.find(x => re.test(String(x.p).toLowerCase()) && !/topilmadi/.test(x.v) && !/как указано|agonta/.test(String(x.p).toLowerCase())); return v ? vsVal(v) : null; };
            const L = [['Yuk koʻtarish', /грузоподъ/], ['Tara', /тар/], ['Hajm', /^объ[её]м|объ[её]м кузова|объ[её]м котла/], ['Uzunlik (avtoulagich oʻqlari boʻyicha)', /длина по осям/], ['Baza', /^база/], ['Aravacha', /тележ/], ['Tezlik', /скорост/], ['Xizmat muddati', /срок службы/]].map(([t, re]) => { const v = pick(re); return v ? '• ' + t + ': ' + v : null; }).filter(Boolean);
            if (!L.length && !/texnik|tavsif|parametr|xarakter|характер|sxema|chizma/.test(n)) return null;
            if (/sxema|chizma|чертеж|схем/.test(n)) setTimeout(() => { try { aicClose(); } catch (e) {} vsOpen(model); }, 600);
            return head + ' — asosiy koʻrsatkichlar:\n' + (L.join('\n') || '• Ochiq manbalarda texnik parametrlar topilmadi') + foot;
        }
        (function () {
            aiStage('Vagon statistikasi', function (q, next) { try { const a = vsAnswer(q); if (a) { try { V38.lastPersonal = false; } catch (e) {} return { t: a, personal: false }; } } catch (e) { console.error(e); } return next(q); });
        })();
        // Hujjatni ochib, kerakli modelga o'tish
        function vsOpen(model) {
            const d = ND_BUILTIN.find(x => x.id === 'vag_spec_web'); if (!d) return;
            const i = d.items.findIndex(it => it.t === 'h' && it.n === model);
            GOST.lang = 'uz'; gostOpen('vag_spec_web', 'text'); if (i >= 0) setTimeout(() => gostJump(i), 150);
        }
        // Hujjat sarlavhasidagi izoh (bu standart emas — internet manbasi)
        (function () {
            gostRender = agmkExtend('gostRender', 'v1.8.1: Vagon modellari texnik tavsifi — AI javoblari, pasportdan havola · Hujjat sarlavhasidagi izoh (bu standart emas — internet manbasi)', gostRender, o => function () {
                const r = o.apply(this, arguments);
                try { if (ND.gid === 'vag_spec_web') { const sm = document.querySelector('#ndBody .gt-head small'); if (sm) sm.textContent = GOST.lang === 'ru' ? '🌐 Собрано из открытых интернет-источников (28.09.2026), у каждого значения — источник. Не официальный документ.' : "🌐 Internetdagi ochiq manbalardan toʻplangan (28.09.2026), har bir qiymat yonida manba. Rasmiy hujjat emas."; const hd = document.querySelector('#ndBody .gt-head'); if (hd && !hd.querySelector('.vs-jump')) { const s = document.createElement('div'); s.className = 'vs-jump'; s.innerHTML = VS_MODELS.map(m => `<i onclick="vsOpen('${m}')">${m}</i>`).join(''); hd.appendChild(s); } } } catch (e) {}
                return r;
            });
        })();
        // Vagon pasportida: "📘 Model tavsifi va sxemasi"
        (function () {
            if (typeof openPassport !== 'function') return;
            openPassport = agmkExtend('openPassport', 'v1.8.1: Vagon modellari texnik tavsifi — AI javoblari, pasportdan havola', openPassport, o => function (id) {
                const r = o.apply(this, arguments);
                try {
                    const v = vagonlarData.find(x => x.id === id), scr = $id('screen-vagon-pasport');
                    let b = $id('vs-link');
                    if (!v || !VS_MODELS.includes(v.model)) { if (b) b.remove(); return r; }
                    if (!b) { b = document.createElement('div'); b.id = 'vs-link'; b.className = 'passport-container vs-link'; const ab = $id('alb-box'); const g = $id('pasportGalTitle') && $id('pasportGalTitle').closest('.passport-container'); const ref = ab || g; if (ref) ref.parentNode.insertBefore(b, ref); else scr.appendChild(b); }
                    const M = VS_DATA.find(x => x.model === v.model), pk = re => { const x = M.values.find(y => re.test(y.p.toLowerCase()) && !/topilmadi/.test(y.v) && !/как указано|agonta/.test(y.p.toLowerCase())); return x ? vsVal(x) : '—'; };
                    b.innerHTML = `<div class="passport-title"><span>📘 Model ${escapeHtml(v.model)} — texnik tavsif</span></div><div class="vs-kpi"><div><small>Yuk koʻtarish</small><b>${escapeHtml(pk(/грузоподъ/))}</b></div><div><small>Tara</small><b>${escapeHtml(pk(/тар/))}</b></div><div><small>Hajm</small><b>${escapeHtml(pk(/объ[её]м (кузова|котла)|^объ[её]м/))}</b></div><div><small>Baza</small><b>${escapeHtml(pk(/^база/))}</b></div></div><button class="vs-btn" onclick="vsOpen('${escapeHtml(v.model)}')">📐 Toʻliq tavsif, manbalar va sxema</button><small class="vs-note">🌐 Internetdagi ochiq manbalardan · rasmiy hujjat emas</small>`;
                } catch (e) { console.error(e); }
                return r;
            });
        })();
        // Hujjatlar ro'yxatida: "RU asl / UZ tarjima" o'rniga "🌐 Internet manbasi"
        (function () {
            ndRender = agmkExtend('ndRender', 'v1.8.1: Vagon modellari texnik tavsifi — AI javoblari, pasportdan havola · Hujjatlar roʼyxatida: "RU asl / UZ tarjima" oʼrniga "🌐 Internet manbasi"', ndRender, o => function () {
                const r = o.apply(this, arguments);
                try { document.querySelectorAll('#ndBody .nd-std[onclick*="vag_spec_web"]').forEach(el => { el.querySelectorAll('.nd-badge.ok, .nd-badge.uzt').forEach(b => b.remove()); if (!el.querySelector('.nd-badge.web')) { const s = document.createElement('span'); s.className = 'nd-badge web'; s.textContent = '🌐 Internet manbasi · 16 model'; const c = el.querySelector('.nd-badge.cat'); if (c) c.before(s); else el.querySelector('b').after(s); } }); } catch (e) {}
                return r;
            });
        })();
