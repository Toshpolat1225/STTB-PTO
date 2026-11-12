        // =====================================================================
        // YANGI (19-bosqich): TEMIR YO'L — bo'limlar (uchastka → obyekt → mavzu) va
        // Navigator uslubidagi xarita: Sxema / GPS (ko'cha xaritasi) / Gibrid (sun'iy yo'ldosh),
        // ustma-ust yoki alohida (ekran bo'linadi). Haqiqiy xarita internet bo'lganda yuklanadi.
        // =====================================================================
        const INF_TOPICS = [
            ['umumiy', '📋', "Umumiy ma'lumot"], ['yer', '🪨', 'Yer polotnosi'], ['ustki', '🧱', 'Ustki qurilma: ballast va shpallar'], ['rels', '🛤️', 'Relslar'],
            ['strelka', '🔀', "Strelkali o'tkazgichlar"], ['egri', '↪️', 'Egri chiziqlar'], ['skrep', '🔩', 'Mahkamlagichlar'], ['isso', '🌉', "Sun'iy inshootlar"],
            ['pere', '🚧', 'Pereyezdlar'], ['bino', '🏢', 'Binolar, omborlar, postlar'], ['aloqa', '📡', 'Aloqa'], ['znak', '🪧', "Yo'l belgilari"],
            ['tarozi', '⚖️', 'Vagon tarozilari'], ['depo', '🏭', "Depo va ta'mir joylari"], ['park', '🚂', 'Lokomotiv, vagon va texnika'], ['yuk', '📦', 'Yuk aylanmasi']
        ];
        const INF_GROUPS = { M: ['🔵', 'Markaziy uchastka'], K: ['🟠', 'Qalmoqqir uchastkasi'], ob: ['🔀', "Kirish yo'llari va depolar"] };
        const INFNAV = { grp: 'M', tab: 'st', obj: null, from: 'map' };
        const INF_GEO_KEY = 'agmk_infra_geo';
        const ALMALIQ = [40.85, 69.60]; // Olmaliq (Wikipedia: 40°51′N 69°36′E)
        function infO(id) { return INFRA_BY[id]; }
        function infD(o) { return o && o.doc ? INFRA_BY[o.doc] : o; }
        function infZ(id) { const v = infraRec(id); return v ? (v.zams || []).filter(z => z.status !== 'yopildi').length : 0; }
        function infNum(x) { return x === undefined || x === null || x === '' ? '' : Number(x).toLocaleString('ru-RU', { maximumFractionDigits: 2 }); }
        function infF(s) { const m = String(s || '').replace(/\s/g, '').replace(',', '.').match(/\d+(\.\d+)?/); return m ? parseFloat(m[0]) : null; }

        // ---- Ustun nomlarini o'zbekchaga o'girish ----
        const INF_HEAD = [
            [/^п\/п$|^№$/, '№'], [/^r$/, 'Radius R, m'], [/^пикетаж/, 'Piketaj'], [/^l$/, 'Uzunlik L, m'], [/^rдо100/, 'R ≤ 100'], [/^rболее100/, 'R > 100'],
            [/^общаяпротяжен/, 'Relslar uzunligi, p.m'], [/^износ/, 'Yeyilish, mm'], [/^повертикали/, 'Vertikal'], [/^боков/, 'Yon'], [/^преимущ/, 'Asosiy uzunlik, m'],
            [/^количестводефект/, 'Nosozlar soni'], [/^маркакрестов/, 'Krestovina markasi'], [/^всего/, 'Jami'], [/^типсп|^тип$/, 'Turi'], [/^состоя/, 'Holati'],
            [/^наименованиеиссо/, 'Inshoot nomi'], [/^мате/, 'Materiali'], [/^км,пк|^пк$/, 'Km, PK'], [/^число/, "Oraliqlar soni va o'lchami"], [/^полнаядлина/, "To'liq uzunlik, m"],
            [/^наименован/, 'Nomi'], [/^площадь/, 'Maydoni, m²'], [/^закрыт/, 'Yopiq'], [/^открыт/, 'Ochiq'], [/^годпост|^годпостр/, 'Qurilgan yili'], [/^фронт/, 'Ish fronti'],
            [/^примечан/, 'Izoh'], [/^общеекол|^кол-во$|^общее$/, 'Soni'], [/^вт\.?чсер|^серия|^сери/, 'Seriyasi'], [/^вт\.ч\.?грузопод|^грузопод/, "Yuk ko'tarish, t"],
            [/^местоустан/, "O'rnatilgan joyi"], [/^длинаплощадки/, 'Maydoncha uzunligi'], [/^годустанов/, "O'rnatilgan yili"], [/^кол-востойл/, 'Stoylalar soni'],
            [/^длинастойл|^длинавм/, "Stoyla uzunligi, m"], [/^ремонт|^примечание\(ремонт/, "Ta'mirlar"], [/^грузовыеоперации/, 'Yuk operatsiyalari'], [/^год$/, 'Yil']
        ];
        function infTrHead(c) {
            const k = String(c || '').toLowerCase().replace(/[\s ]+/g, '').replace(/-\s*/g, '-');
            for (const [re, t] of INF_HEAD) if (re.test(k)) return t;
            return c;
        }
        const INF_WORDS = [[/Круглая труба/gi, 'Dumaloq quvur'], [/Труба/g, 'Quvur'], [/труба/g, 'quvur'], [/2-х очковая/g, "2 ko'zli"], [/Мост/g, "Ko'prik"], [/ч\/з р[.,]\s*/g, 'daryo orqali: '],
            [/Тоннельный\s+путепровод/g, "Tonnelli yo'l o'tkazgich"], [/Путепровод/g, "Yo'l o'tkazgich"], [/Акведук/g, 'Akveduk'], [/ж\/б/g, 'temir-beton'], [/Метал\w*/g, 'Metall'],
            [/[Уу]довл\.?/g, 'qoniqarli'], [/Тепловоз/g, 'Teplovoz'], [/Электровоз/g, 'Elektrovoz'], [/Думпкары/g, 'Dumpkarlar'], [/Дрезина/g, 'Drezina'], [/Ж\.д\. кран/g, "T.y. krani"],
            [/Пост централизации, релейная/g, 'Markazlashtirish posti, rele xonasi'], [/Централизация стрелок и сигналов/g, 'Strelka va signallarni markazlashtirish'],
            [/Устройство контактной сети/g, "Kontakt tarmog'i qurilmasi"], [/Нет/g, "Yo'q"], [/левых/g, 'chap'], [/правых/g, "o'ng"], [/ручн\.?/g, "qo'lda"], [/ЭЦ/g, 'EC'], [/Р(\d{2})/g, 'R$1']];
        function infTrCell(s) { let r = String(s || ''); INF_WORDS.forEach(([re, t]) => { r = r.replace(re, t); }); return r; }
        function infTable(t) {
            if (!t || !t.length) return '';
            const hdrRows = t.length > 2 && t[1].some(c => /^(по вертикали|боков|закрыт|открыт)/i.test(String(c).trim())) ? 2 : 1;
            // sarlavha qatori qisqa bo'lsa (Word'da birlashtirilgan ustun) — "Тип" ustuniga colspan
            const maxL = Math.max(...t.map(r => r.length)), h0 = t[0], extra = maxL - h0.length;
            let spanAt = -1;
            if (extra > 0) { for (let k = h0.length - 1; k > 0; k--) if (/^тип/i.test(String(h0[k]).trim())) { spanAt = k; break; } }
            const cell = (c, i, k) => '<td' + (i === 0 && k === spanAt ? ' colspan="' + (extra + 1) + '"' : '') + '>' + escapeHtml(i < hdrRows ? (i === 0 && k === spanAt ? "Yo'nalishi va boshqaruvi" : infTrHead(c)) : infTrCell(c)) + '</td>';
            return `<div class="inf-tbl"><table>${t.map((r, i) => '<tr>' + r.map((c, k) => cell(c, i, k)).join('') + '</tr>').join('')}</table></div>`;
        }

        // ---- Mavzular bo'yicha o'zbekcha qisqa xulosa ----
        function infSummary(o, key) {
            const d = infD(o), tp = (d.topics || {})[key] || { p: [], t: [] }, P = tp.p.join(' '), T = tp.t.map(i => d.tables[i] || []), out = [];
            const rows = T.reduce((a, t) => a.concat(t.slice(1)), []).filter(r => r.some(c => String(c).trim()));
            const li = (b, v) => { if (v !== '' && v !== null && v !== undefined) out.push(`<b>${b}:</b> ${escapeHtml(String(v))}`); };
            if (o.id === 'ohan' && key === 'umumiy') {
                const km = P.match(/Общая протяженность[^–-]*[–-]\s*([\d,.\s]+)\s*км/), ppl = P.match(/численностью\s*(\d+)/), ceh = P.match(/(\d+)\s*железнодорожн\w*\s*цех\w*\s*и\s*(\d+)\s*служб/);
                li("Yo'llarning umumiy uzunligi", km ? km[1].trim() + ' km (01.01.2023)' : ''); li('Tarkibi', ceh ? ceh[1] + ' ta temir yo\'l sexi va ' + ceh[2] + ' ta xizmat' : '');
                li('Xodimlar soni', ppl ? ppl[1] + ' kishi' : ''); li('Tutashish stansiyasi', /Ахангаран/.test(P) ? "Ohangaron («O'zbekiston temir yo'llari» AJ)" : '');
                li('Chegara', /светофор НА/.test(P) ? 'NA kirish svetofori (1-strelka chegara ustunchasidan 15 m)' : ''); li("Yo'lovchi tashish", /Пассажирских перевозок\s*[–-]\s*нет/.test(P) ? "yo'q" : '');
            } else if (key === 'umumiy') {
                li('Uzunligi', d.len ? infNum(d.len) + ' m' + (d.len2 ? ' / ' + infNum(d.len2) + ' m (2-yo\'l)' : '') : '');
                li('Toifasi', d.cat ? d.cat + ' toifa' : ''); li('Blokirovka / aloqa', d.blok); li("Kontakt tarmog'i", d.kontakt ? 'bor' : '');
                li('Egri chiziqlar', d.egri ? infNum(d.egri[0]) + ' m, radius ' + infNum(d.egri[1]) + '–' + infNum(d.egri[2]) + ' m' : '');
                li('Eng katta qiyalik', d.uklon ? infNum(d.uklon) + ' ‰' : ''); li("Yo'l kengligi", /1520/.test(P) ? '1520 mm' : '');
                if (o.a && o.b) li("Yo'nalish", infraShort(infO(o.a) || { uz: o.a }) + ' → ' + (infO(o.b) ? infraShort(infO(o.b)) : 'VM zavodi'));
            } else if (key === 'yer') {
                const w = P.match(/по верху\s*([\d.,\s\-–]+)\s*м/), g = P.match(/Грунт\s*[–-]\s*(\w+)/), ot = P.match(/крутизна\W*\s*([\d\s:,]+)/);
                li('Kengligi (tepada)', w ? w[1].trim() + ' m' : ''); li('Grunt', g ? ({ 'скальный': 'qoyali', 'глинистый': 'loyli', 'песчаный': 'qumli' }[g[1].toLowerCase()] || g[1]) : '');
                li('Qiyaliklar tikligi', ot ? ot[1].trim() : ''); li('Holati', /удовлетвор/.test(P) ? 'qoniqarli' : '');
            } else if (key === 'ustki') {
                const fr = P.match(/фракции\s*([\d\-–]+)\s*мм/), th = P.match(/толщина балластного слоя[^\d]*(\d+)\s*см/), ep = P.match(/Эпюра\s*(\d+)/);
                li('Ballast', fr ? "shag'al (sheben) " + fr[1] + ' mm' + (th ? ', qatlam ' + th[1] + ' sm' : '') : '');
                li('Shpal epyurasi', ep ? ep[1] + ' dona / 1 km' : '');
                const n = re => { const m = P.match(re); return m ? m[1] : ''; };
                const sh = [['yog\'och', n(/деревянн\w*\s*[–-]?\s*(\d[\d\s]*)\s*шт/)], ['temir-beton', n(/железобетонн\w*\s*[–-]?\s*(\d[\d\s]*)\s*шт/)], ['metall', n(/металлическ\w*\s*[–-]?\s*(\d[\d\s]*)\s*шт/)]].filter(x => x[1]);
                li('Shpallar', sh.map(x => x[0] + ': ' + x[1].trim()).join(' · '));
                li('Holati', /удовлетвор/.test(P) ? 'qoniqarli' : '');
            } else if (key === 'rels') {
                rows.filter(r => /^Р/.test(r[0])).forEach(r => li(r[0].replace('Р', 'R'), infNum(infF(r[1])) + ' p.m · yeyilish: vertikal ' + (r[2] || '—') + ' mm, yon ' + (r[3] || '—') + ' mm · asosiy uzunlik ' + (r[4] || '—') + ' m' + (r[5] ? ' · nosoz: ' + r[5] : '')));
            } else if (key === 'strelka') {
                let tot = 0;
                rows.filter(r => /^Р/.test(r[0])).forEach(r => {
                    const n = parseInt(String(r[2]).replace(/\D/g, ''), 10) || 0; tot += n;
                    const lr = String(r[3] || ''), l = lr.match(/(\d+)\s*лев/), rr = lr.match(/(\d+)\s*пра/), ec = String(r[4] || '').match(/(\d+)\s*ЭЦ/), hand = String(r[4] || '').match(/(\d+)\s*ручн/);
                    li(r[0].replace('Р', 'R') + ', krestovina ' + r[1], n + ' ta' + (l || rr ? ' (' + [l ? l[1] + ' chap' : '', rr ? rr[1] + " o'ng" : ''].filter(Boolean).join(', ') + ')' : '') +
                        (ec ? ' · ' + ec[1] + ' ta EC (markazlashgan)' : '') + (hand ? ' · ' + hand[1] + " ta qo'lda" : '') + ' · holati: ' + infTrCell(r[r.length - 1] || ''));
                });
                if (tot) out.unshift(`<b>Jami strelkalar:</b> ${tot} ta`);
                const br = P.match(/брус\w*\s*(?:в количестве\s*)?(\d+)\s*шт/); li("O'tkazgich brusları", br ? br[1] + ' dona' : '');
            } else if (key === 'egri') {
                const cs = rows.filter(r => /^\d/.test(String(r[0]).trim()) && infF(r[1]));
                if (cs.length) { const rs = cs.map(r => infF(r[1])), ls = cs.map(r => infF(r[3]) || 0);
                    li('Egri chiziqlar soni', cs.length + ' ta'); li('Umumiy uzunligi', infNum(ls.reduce((a, b) => a + b, 0)) + ' m'); li('Radius', infNum(Math.min(...rs)) + ' – ' + infNum(Math.max(...rs)) + ' m');
                    li('Kichik radiusli (R ≤ 100 m)', rs.filter(x => x <= 100).length + ' ta'); }
            } else if (key === 'skrep') {
                const b = P.match(/болтов на один стык\s*[–-]\s*([\d\-–,\s]+)\s*шт/), k = P.match(/костылей на одну деревянную шпалу\s*([\d\-–\s]+)\s*шт/);
                li('Bir tutashuvdagi boltlar', b ? b[1].trim() + ' dona' : ''); li('Yog\'och shpaldagi kostillar', k ? k[1].trim() + ' dona' : '');
                const pd = P.match(/подкладок на 1 звено[^.]*/); li('Podkladkalar (1 zvenoga)', pd ? pd[0].replace(/подкладок на 1 звено:?\s*/, '').replace(/для\s*/g, '').replace(/Р/g, 'R') : '');
            } else if (key === 'isso') {
                const is = rows.filter(r => r.length >= 4 && !/Наименование|ИССО/.test(r.join(' ')));
                if (is.length) { const ni = /^\d/.test(String(is[0][0]).trim()) ? 1 : 0;
                    li('Inshootlar soni', is.length + ' ta'); li("Ko'prik / yo'l o'tkazgich / akveduk", is.filter(r => /[Мм]ост|путепровод|[Аа]кведук/.test(r[ni])).map(r => infTrCell(r[ni]) + ' (' + (r[r.length - 1] || '') + ' m)').join('; ') || "yo'q");
                    li('Quvurlar', is.filter(r => /[Тт]руб/.test(r[ni])).length + ' ta'); }
            } else if (key === 'pere') {
                li('Pereyezd yozuvlari', tp.p.length + ' ta');
                const g = tp.p.filter(s => /(?<!не)охраняем/.test(s)).length, u = tp.p.filter(s => /неохраняем/.test(s)).length;
                li("Qo'riqlanadigan", g ? g + ' ta' : ''); li("Qo'riqlanmaydigan", u ? u + ' ta' : '');
                li('Shlagbaum', /шлагбаум/.test(P) ? 'bor (ayrimlarida)' : ''); li('Yorug\'lik va ovoz signalizatsiyasi', /сигнализац/.test(P) ? 'bor' : '');
            } else if (key === 'aloqa') {
                li('Aloqa turlari', [/диспетчерск/.test(P) ? 'poyezd dispetcherlik' : '', /межстанционн/.test(P) ? 'stansiyalararo' : '', /радиосвяз/.test(P) ? 'poyezd radioaloqasi' : '', /местная/.test(P) ? 'mahalliy stansiya' : '', /АТС/.test(P) ? 'shahar ATS orqali' : ''].filter(Boolean).join(', '));
            } else if (key === 'znak') {
                li("Yo'l belgilari", /нет/i.test(P) && !/столбик/.test(P) ? "yo'q" : [/километров/.test(P) ? 'kilometr ustunchalari' : '', /пикетн/.test(P) ? 'piket ustunchalari' : '', /опасного места/.test(P) ? "«xavfli joy» belgilari" : ''].filter(Boolean).join(', '));
            } else {
                const hd = T.length ? T[0][0] : [];
                if (rows.length) li('Yozuvlar', rows.length + ' ta');
                T.forEach(t => t.slice(1).filter(r => r.some(c => String(c).trim())).slice(0, 12).forEach(r => {
                    const parts = r.map((c, k) => String(c).trim() ? (t[0][k] ? infTrHead(t[0][k]) + ': ' : '') + infTrCell(c) : '').filter(Boolean);
                    if (parts.length) out.push('• ' + escapeHtml(parts.join(' · ').slice(0, 220)));
                }));
            }
            if (!out.length && tp.p.length) out.push("Batafsil ma'lumot quyida (hujjat matni).");
            return out;
        }
        function infTopicCount(o, key) { const d = infD(o), tp = (d.topics || {})[key]; return tp ? tp.p.length + tp.t.length : 0; }
        function infTopicBadge(o, key) {
            const d = infD(o);
            if (key === 'strelka') return d.strel ? d.strel + ' ta' : '';
            if (key === 'isso') return d.isso ? d.isso + ' ta' : '';
            if (key === 'egri') { const tp = d.topics.egri; const n = tp ? tp.t.reduce((s, i) => s + (d.tables[i] || []).filter(r => /^\d/.test(String(r[0]).trim())).length, 0) : 0; return n ? n + ' ta' : ''; }
            if (key === 'pere') return d.topics.pere ? d.topics.pere.p.length + ' ta' : '';
            if (key === 'rels') return Object.keys(d.rails || {}).map(k => k.replace('Р', 'R')).join(', ');
            if (key === 'umumiy') return d.len ? infraKm(d.len) : '';
            return '';
        }

        // ---- 1-daraja: sxema ostidagi bo'limlar ----
        function infGroupItems(g) { return Object.values(INFRA_BY).filter(o => g === 'ob' ? o.kind === 'ob' : (o.uch === g && o.kind !== 'ob')); }
        function infGroupCards() {
            const card = (ic, t, sub, on, badge) => `<div class="btn-card inf-card" onclick="${on}"><div class="btn-card-content"><span class="btn-icon">${ic}</span><span class="btn-text">${escapeHtml(t)}<small>${escapeHtml(sub)}</small></span></div>${badge || ''}<span class="btn-arrow">›</span></div>`;
            const zb = l => { const n = l.reduce((s, o) => s + infZ(o.id), 0); return n ? `<span class="inf-badge">🚨 ${n}</span>` : ''; };
            return ['M', 'K'].map(g => { const l = infGroupItems(g), st = l.filter(o => o.kind === 'st'), pr = l.filter(o => o.kind === 'pr');
                    const km = l.reduce((s, o) => s + (o.doc ? 0 : (o.len || 0) + (o.len2 || 0)), 0);
                    return card(INF_GROUPS[g][0], INF_GROUPS[g][1], st.length + ' stansiya · ' + pr.length + ' peregon · ' + infraKm(km), `openInfraGroup('${g}')`, zb(l)); }).join('') +
                card(INF_GROUPS.ob[0], INF_GROUPS.ob[1], infGroupItems('ob').length + " ta: veer yo'llari, MOF, MPZ, OXX–TETs, depolar", "openInfraGroup('ob')", zb(infGroupItems('ob'))) +
                card('📋', "Umumiy ma'lumot", "Kombinat yo'llari, Ohangaron tutashuvi, tarozilar, yuk aylanmasi", "openInfraObj('ohan','map')", zb([infO('ohan')]));
        }

        // ---- 2-daraja: uchastka ro'yxati ----
        function openInfraGroup(g) { INFNAV.grp = g; INFNAV.tab = g === 'ob' ? 'ob' : 'st'; $id('infListSearch').value = ''; openScreen('screen-infra-list'); renderInfraList(); }
        function setInfraTab(t) { INFNAV.tab = t; renderInfraList(); }
        function infItemCard(o, from) {
            const d = infD(o), z = infZ(o.id), ic = o.kind === 'st' ? '🚉' : o.kind === 'pr' ? '🛤️' : (o.id.indexOf('depo') > 0 ? '🏭' : '🔀');
            const sub = [o.ru, d.cat ? d.cat + ' toifa' : '', o.doc ? '' : infraKm(o.len)].filter(Boolean).join(' · ');
            return `<div class="btn-card inf-card" onclick="openInfraObj('${o.id}','${from}')"><div class="btn-card-content"><span class="btn-icon">${ic}</span><span class="btn-text">${escapeHtml(o.uz)}<small>${escapeHtml(sub)}</small></span></div>${z ? `<span class="inf-badge">🚨 ${z}</span>` : ''}<span class="btn-arrow">›</span></div>`;
        }
        function renderInfraList() {
            const g = INFNAV.grp, all = infGroupItems(g), q = aiNorm($id('infListSearch').value || '').trim();
            $id('infListTitle').innerText = INF_GROUPS[g][1];
            const st = all.filter(o => o.kind === 'st'), pr = all.filter(o => o.kind === 'pr');
            $id('infListTabs').innerHTML = g === 'ob' ? '' : `<div class="tab${INFNAV.tab === 'st' ? ' active' : ''}" onclick="setInfraTab('st')">🚉 Stansiyalar<span class="tab-cnt">${st.length}</span></div><div class="tab${INFNAV.tab === 'pr' ? ' active' : ''}" onclick="setInfraTab('pr')">🛤️ Peregonlar<span class="tab-cnt">${pr.length}</span></div>`;
            const list = (g === 'ob' ? all : INFNAV.tab === 'st' ? st : pr).filter(o => !q || q.split(/\s+/).every(t => aiNorm(o.uz + ' ' + o.ru + ' ' + infraShort(o)).includes(t)));
            $id('infList').innerHTML = list.map(o => infItemCard(o, 'list')).join('') || '<div class="xt-empty">Hech narsa topilmadi</div>';
        }

        // ---- 3-daraja: obyekt (stansiya / peregon) ----
        function getInfGeo() {
            let u = {}; try { u = JSON.parse(localStorage.getItem(INF_GEO_KEY) || '{}') || {}; } catch (e) {}
            const d = {}; if (typeof INF_GEO_SRC !== 'undefined') Object.keys(INF_GEO_SRC).forEach(k => { d[k] = INF_GEO_SRC[k].ll; });
            return Object.assign(d, u);
        }
        function setInfGeo(id, ll) { const g = getInfGeo(); if (ll) g[id] = ll; else delete g[id]; try { localStorage.setItem(INF_GEO_KEY, JSON.stringify(g)); } catch (e) {} MAPG.dirty = true; }
        function openInfraObj(id, from) {
            if (!infO(id)) return;
            if (from) INFNAV.from = from;
            INFNAV.obj = id; const o = infO(id);
            if (o.kind !== 'ob' && o.uch !== 'X') INFNAV.grp = o.uch; else if (o.kind === 'ob') INFNAV.grp = 'ob';
            openScreen('screen-infra-obj'); renderInfraObj();
        }
        function infraObjBack() { if (INFNAV.from === 'list') { openScreen('screen-infra-list'); renderInfraList(); } else openMapScreen(); }
        function renderInfraObj() {
            const o = infO(INFNAV.obj), d = infD(o), z = infZ(o.id), geo = getInfGeo()[o.id];
            $id('infObjTitle').innerText = infraShort(o);
            $id('infObjBack').innerText = INFNAV.from === 'list' ? '‹ ' + INF_GROUPS[INFNAV.grp][1].split(' ')[0] : '‹ Xarita';
            const f = (l, v, full) => v !== undefined && v !== null && String(v).trim() !== '' ? `<div${full ? ' class="full"' : ''}>${l}: <span>${escapeHtml(v)}</span></div>` : '';
            let h = `<div class="passport-container"><div class="passport-title"><span>${o.kind === 'pr' ? '🛤️' : o.kind === 'ob' ? '🔀' : '🚉'} ${escapeHtml(o.uz)}</span></div>
                <div class="pex-grid">${f('HUJJATDA', o.ru, true)}${f('TURI', INFRA_KIND[o.kind])}${f('UCHASTKA', o.uch === 'M' ? 'Markaziy' : o.uch === 'K' ? 'Qalmoqqir' : 'Umumiy')}
                ${f('UZUNLIGI', d.len ? infNum(d.len) + ' m' : '')}${f('TOIFASI', d.cat ? d.cat + ' toifa' : '')}${f('BLOKIROVKA', d.blok)}${f('STRELKALAR', d.strel || '')}
                ${f('OCHIQ ZAMECHANIYALAR', z ? z + ' ta' : "yo'q")}${f('XARITADAGI JOYI', geo ? geo[0].toFixed(5) + ', ' + geo[1].toFixed(5) + (typeof infGeoLabel === 'function' ? ' — ' + infGeoLabel(o.id) : '') : 'hali belgilanmagan', true)}${f('IZOH', o.note || '', true)}</div>
                <div class="inf-actions"><button class="action-btn" onclick="openInfra('${o.id}')">📄 Pasport, rasmlar va 🚨 zamechaniyalar</button>
                ${isAdmin() ? `<button class="action-btn" style="background:#0f766e;" onclick="infSetGeo('${o.id}')">📍 Xaritadagi joyini belgilash</button>` : ''}</div></div>`;
            if (typeof infRiskHtml === 'function') h += infRiskHtml(o);
            h += `<div class="inf-sec">📂 Bo'limlar</div><div class="card-list">` + INF_TOPICS.filter(t => infTopicCount(o, t[0])).map(t => {
                const b = infTopicBadge(o, t[0]);
                return `<div class="btn-card inf-card" onclick="openInfraTopic('${t[0]}')"><div class="btn-card-content"><span class="btn-icon">${t[1]}</span><span class="btn-text">${t[2]}</span></div>${b ? `<span class="inf-cnt">${escapeHtml(b)}</span>` : ''}<span class="btn-arrow">›</span></div>`;
            }).join('') + `</div>`;
            const rel = [];
            if (o.kind === 'pr') { if (infO(o.a)) rel.push(infO(o.a)); if (infO(o.b)) rel.push(infO(o.b)); }
            else { Object.values(INFRA_BY).forEach(x => { if ((x.kind === 'pr' && (x.a === o.id || x.b === o.id)) || (x.kind === 'ob' && x.parent === o.id)) rel.push(x); }); if (o.parent && infO(o.parent)) rel.push(infO(o.parent)); }
            if (rel.length) h += `<div class="inf-sec">🔗 Tutash obyektlar</div><div class="card-list">` + rel.map(x => infItemCard(x, INFNAV.from)).join('') + `</div>`;
            if (o.id === 'kol' || o.id === 'kal' || o.id === 'svi' || o.id.indexOf('depo') > 0) h += `<div class="inf-sec">🔧 Texnika bo'limlari</div><div class="card-list">
                <div class="btn-card inf-card" onclick="openLokScreen()"><div class="btn-card-content"><span class="btn-icon">🚂</span><span class="btn-text">Lokomotivlar</span></div><span class="btn-arrow">›</span></div>
                <div class="btn-card inf-card" onclick="openYolScreen()"><div class="btn-card-content"><span class="btn-icon">🛤️</span><span class="btn-text">Yo'l texnikalari</span></div><span class="btn-arrow">›</span></div></div>`;
            $id('infObjBody').innerHTML = h;
        }
        async function infSetGeo(id) {
            if (!isAdmin()) return;
            const cur = getInfGeo()[id];
            const s = await uiPrompt(infraShort(infO(id)) + " — xaritadagi joyi (kenglik, uzunlik).\nMasalan: 40.84470, 69.59830\n«gps» deb yozsangiz — telefoningiz turgan joy olinadi.\nBo'sh qoldirsangiz — o'chiriladi.", cur ? cur.join(', ') : '');
            if (s === null) return;
            const t = s.trim().toLowerCase();
            if (!t) { setInfGeo(id, null); renderInfraObj(); showToast("📍 Joylashuv o'chirildi"); return; }
            if (t === 'gps') { mapLocate(ll => { setInfGeo(id, ll); renderInfraObj(); showToast('📍 Joylashuv saqlandi'); }); return; }
            const m = t.replace(/[;]/g, ',').match(/(-?\d+(?:\.\d+)?)\s*[, ]\s*(-?\d+(?:\.\d+)?)/);
            if (!m || Math.abs(+m[1]) > 90 || Math.abs(+m[2]) > 180) { alert("Koordinata noto'g'ri. Masalan: 40.84470, 69.59830"); return; }
            setInfGeo(id, [+m[1], +m[2]]); renderInfraObj(); showToast('📍 Joylashuv saqlandi');
        }

        // ---- 4-daraja: mavzu ----
        function openInfraTopic(key) { INFNAV.topic = key; openScreen('screen-infra-topic'); renderInfraTopic(); }
        function renderInfraTopic() {
            const o = infO(INFNAV.obj), d = infD(o), key = INFNAV.topic, meta = INF_TOPICS.find(t => t[0] === key) || [key, '📄', key];
            const tp = (d.topics || {})[key] || { p: [], t: [] };
            $id('infTopTitle').innerText = meta[2];
            const sum = infSummary(o, key);
            let h = `<div class="passport-container"><div class="passport-title"><span>${meta[1]} ${escapeHtml(meta[2])}</span></div><div style="font-size:11px; color:#94a3b8; margin:-4px 0 8px;">${escapeHtml(o.uz)}</div>
                ${sum.length ? `<ul class="inf-sum">${sum.map(s => '<li>' + s + '</li>').join('')}</ul>` : ''}</div>`;
            if (tp.t.length) h += `<div class="passport-container"><div class="passport-title"><span>📊 Jadval (hujjatdan)</span></div>${tp.t.map(i => infTable(d.tables[i])).join('')}</div>`;
            if (tp.p.length) h += `<div class="passport-container"><details class="inf-doc"${sum.length ? '' : ' open'}><summary>📄 Hujjatdagi asl matn (rus tilida)</summary>${tp.p.map(s => '<p>' + escapeHtml(s) + '</p>').join('')}</details></div>`;
            h += `<div class="pex-src" style="text-align:center; margin-top:6px; color:#e2e8f0; text-shadow:0 1px 3px #000;">Manba: «Технический паспорт подъездного пути», АО «Алмалыкский ГМК», 2023</div>`;
            $id('infTopBody').innerHTML = h;
        }

        // ---- Xarita qatlamlari (Navigator uslubi) ----
        const MAPL_KEY = 'agmk_map_layers';
        let MAPL = { sx: true, gps: false, hyb: false, mode: 'stack', op: 0.55 };
        try { Object.assign(MAPL, JSON.parse(localStorage.getItem(MAPL_KEY) || '{}') || {}); } catch (e) {}
        const MAPG = { lf: {}, grp: {}, me: {}, dirty: true, pill: false };
        function saveMapL() { try { localStorage.setItem(MAPL_KEY, JSON.stringify(MAPL)); } catch (e) {} }
        function toggleLayerPanel() { const p = $id('lyrPanel'); p.classList.toggle('hidden'); $id('lyrBtn').classList.toggle('on', !p.classList.contains('hidden')); renderLayerPanel(); }
        function setMapLayer(k) {
            MAPL[k] = !MAPL[k];
            if (!MAPL.sx && !MAPL.gps && !MAPL.hyb) MAPL[k] = true; // kamida bitta qatlam
            saveMapL(); renderLayerPanel(); applyMapLayers();
        }
        function setMapMode(m) { MAPL.mode = m; saveMapL(); renderLayerPanel(); applyMapLayers(); }
        function setMapOp(v) { MAPL.op = +v; saveMapL(); applyMapLayers(); }
        function renderLayerPanel() {
            const p = $id('lyrPanel'); if (!p || p.classList.contains('hidden')) return;
            const opt = (k, ic, t) => `<div class="lyr-opt${MAPL[k] ? ' on' : ''}" onclick="setMapLayer('${k}')"><b>${ic}</b>${t}</div>`;
            const nMap = (MAPL.gps ? 1 : 0) + (MAPL.hyb ? 1 : 0);
            p.innerHTML = `<h4>${LYR_SVG_S}Qatlamlar (bir nechtasini tanlash mumkin)</h4><div class="lyr-opts">${opt('sx', '🗺️', 'Sxema')}${opt('gps', '🛰️', 'GPS xarita')}${opt('hyb', '🌍', 'Gibrid')}</div>
                <h4 style="margin-top:12px;">Ko'rinish</h4><div class="lyr-mode"><div class="${MAPL.mode === 'stack' ? 'on' : ''}" onclick="setMapMode('stack')">🥞 Ustma-ust</div><div class="${MAPL.mode === 'split' ? 'on' : ''}" onclick="setMapMode('split')">🪟 Alohida</div></div>
                ${MAPL.mode === 'stack' && MAPL.sx && nMap ? `<div class="lyr-row">Sxema shaffofligi<input type="range" min="0.15" max="1" step="0.05" value="${MAPL.op}" oninput="setMapOp(this.value)"></div>` : ''}
                ${typeof lyrExtraHtml === 'function' ? lyrExtraHtml() : ''}
                <div class="lyr-note">GPS — ko'cha xaritasi, Gibrid — sun'iy yo'ldosh surati + nomlar. Ikkalasi internet bo'lganda yuklanadi. Stansiyalar haqiqiy joyiga koordinatalari kiritilgach chiqadi (hozir: ${Object.keys(getInfGeo()).length} ta).</div>`;
        }
        function applyMapLayers() {
            const panes = $id('mapPanes'); if (!panes) return;
            panes.className = 'map-panes ' + MAPL.mode;
            const sx = $id('paneSx'), gp = $id('paneGps'), hy = $id('paneHyb');
            sx.classList.toggle('off', !MAPL.sx); gp.classList.toggle('off', !MAPL.gps); hy.classList.toggle('off', !MAPL.hyb);
            const nMap = (MAPL.gps ? 1 : 0) + (MAPL.hyb ? 1 : 0);
            if (MAPL.mode === 'stack') {
                hy.style.zIndex = 1; gp.style.zIndex = 2; sx.style.zIndex = 3;
                gp.style.opacity = MAPL.hyb && MAPL.gps ? 0.55 : 1; hy.style.opacity = 1;
                sx.style.opacity = nMap ? MAPL.op : 1; sx.style.pointerEvents = nMap ? 'none' : '';
                sx.style.background = nMap ? 'transparent' : '';
            } else {
                [sx, gp, hy].forEach(e => { e.style.zIndex = ''; e.style.opacity = 1; e.style.pointerEvents = ''; e.style.background = ''; });
            }
            $id('mapLegend').style.display = MAPL.sx && !(MAPL.mode === 'stack' && nMap) ? '' : 'none';
            if (MAPL.gps) ensureLeaflet('gps'); if (MAPL.hyb) ensureLeaflet('hyb');
            setTimeout(() => Object.values(MAPG.lf).forEach(m => { try { m.invalidateSize(); } catch (e) {} }), 60);
            renderMapPill();
        }
        let LF_P = null;
        function loadLeaflet() {
            if (window.L && window.L.map) return Promise.resolve();
            if (LF_P) return LF_P;
            LF_P = new Promise((res, rej) => {
                // Xarita kutubxonasi — faqat butunligi tekshirilgan (SRI) nusxa: fayl oʻzgartirilgan boʻlsa brauzer uni ishga tushirmaydi
                const base: any[] = []; // 🔒 yopiq kontur (6.1): internetdan (CDN) yuklanmaydi — Leaflet ilovaning ichida (061-qism)
                const css = i => { const c = document.createElement('link'); c.rel = 'stylesheet'; c.href = base[i] + 'leaflet.css'; c.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY='; c.crossOrigin = 'anonymous'; document.head.appendChild(c); };
                const js = i => { const s = document.createElement('script'); s.src = base[i] + 'leaflet.js'; s.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo='; s.crossOrigin = 'anonymous';
                    s.onload = () => { css(i); res(); }; s.onerror = () => { s.remove(); if (i + 1 < base.length) js(i + 1); else { LF_P = null; rej(); } }; document.head.appendChild(s); };
                if (base.length) js(0); else { LF_P = null; rej(); return; }
                setTimeout(() => { if (!(window.L && window.L.map)) { LF_P = null; rej(); } }, 15000);
            });
            return LF_P;
        }
        function ensureLeaflet(k) {
            const msg = $id(k === 'gps' ? 'lfGpsMsg' : 'lfHybMsg');
            if (MAPG.lf[k]) { drawGeo(k); return; }
            msg.innerText = '⏳ Xarita yuklanmoqda...';
            loadLeaflet().then(() => {
                if (MAPG.lf[k]) return;
                const m = L.map(k === 'gps' ? 'lfGps' : 'lfHyb', { zoomControl: false, attributionControl: true }).setView(ALMALIQ, 12);
                if (k === 'gps') L.tileLayer('agmk-tile://osm/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© OpenStreetMap' }).addTo(m);
                else {
                    L.tileLayer('agmk-tile://esri/World_Imagery/MapServer/tile/{z}/{y}/{x}', { maxZoom: 19, attribution: '© Esri' }).addTo(m);
                    L.tileLayer('agmk-tile://esri/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', { maxZoom: 19 }).addTo(m);
                    L.tileLayer('agmk-tile://esri/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}', { maxZoom: 19, opacity: 0.8 }).addTo(m);
                }
                MAPG.lf[k] = m; if (typeof addRailOverlay === 'function') addRailOverlay(k, m); MAPG.grp[k] = L.layerGroup().addTo(m);
                const other = MAPG.lf[k === 'gps' ? 'hyb' : 'gps'];
                m.on('moveend', () => { const o2 = MAPG.lf[k === 'gps' ? 'hyb' : 'gps']; if (o2 && !MAPG.syncing) { MAPG.syncing = true; o2.setView(m.getCenter(), m.getZoom(), { animate: false }); MAPG.syncing = false; } });
                if (other) m.setView(other.getCenter(), other.getZoom(), { animate: false });
                msg.innerText = ''; drawGeo(k);
                setTimeout(() => m.invalidateSize(), 80);
            }).catch(() => { msg.innerText = "📡 Internet yo'q — haqiqiy xarita yuklanmadi.\nSxema internetsiz ishlayveradi."; });
        }
        function drawGeo(k) {
            const m = MAPG.lf[k], g = MAPG.grp[k]; if (!m || !g) return;
            g.clearLayers(); const G = getInfGeo();
            Object.values(INFRA_BY).forEach(o => { if (o.kind !== 'pr' || !G[o.a] || !G[o.b]) return;
                L.polyline([G[o.a], G[o.b]], { color: INFRA_COL[o.uch] || '#94a3b8', weight: 5, opacity: 0.9 }).on('click', () => openInfraObj(o.id, 'map')).addTo(g); });
            Object.keys(G).forEach(id => { const o = infO(id); if (!o) return;
                L.circleMarker(G[id], { radius: o.kind === 'st' ? 8 : 6, color: '#0f172a', weight: 2, fillColor: INFRA_COL[o.uch] || '#94a3b8', fillOpacity: 1 })
                    .bindTooltip(infraShort(o), { permanent: true, direction: 'right', className: 'rw-lbl' }).on('click', () => openInfraObj(id, 'map')).addTo(g); });
            if (typeof drawGeoExtra === 'function') drawGeoExtra(k, g);
            if (MAPG.me[k]) MAPG.me[k].addTo(g);
        }
        function mapLocate(cb) {
            if (!navigator.geolocation) { showToast("📍 Bu qurilmada GPS mavjud emas"); return; }
            showToast('📍 Joylashuv aniqlanmoqda...');
            navigator.geolocation.getCurrentPosition(p => {
                const ll = [p.coords.latitude, p.coords.longitude];
                GPSFIX = { lat: ll[0], lon: ll[1], acc: p.coords.accuracy, t: Date.now() };
                if (!cb && typeof gpsNearestCard === 'function') gpsNearestCard(ll);
                if (cb) { cb(ll); return; }
                if (!MAPL.gps && !MAPL.hyb) { MAPL.gps = true; saveMapL(); applyMapLayers(); }
                setTimeout(() => ['gps', 'hyb'].forEach(k => { const m = MAPG.lf[k]; if (!m) return;
                    MAPG.me[k] = L.circleMarker(ll, { radius: 9, color: '#fff', weight: 3, fillColor: '#2563eb', fillOpacity: 1 }).bindTooltip('Siz shu yerdasiz', { direction: 'top' });
                    drawGeo(k); m.setView(ll, 16); }), 900);
            }, e => showToast(e && e.code === 1 ? "📍 Joylashuvga ruxsat berilmadi (ilova https orqali ochilganda ishlaydi)" : "📍 Joylashuvni aniqlab bo'lmadi"), { enableHighAccuracy: true, timeout: 15000 });
        }
        function mapZoomAll(f) {
            if (MAPL.sx) mapZoom(f);
            Object.values(MAPG.lf).forEach(m => { try { f > 1 ? m.zoomIn() : m.zoomOut(); } catch (e) {} });
        }
        function mapResetAll() { mapReset(); Object.values(MAPG.lf).forEach(m => { try { m.setView(ALMALIQ, 12); } catch (e) {} }); }
        function renderMapPill() {
            const el = $id('mapPill'); if (!el) return;
            const it = Object.values(INFRA_BY), st = it.filter(o => o.kind === 'st' && o.uch !== 'X').length, pr = it.filter(o => o.kind === 'pr').length;
            const zs = onlyInfra().reduce((s, v) => s + (v.zams || []).filter(z => z.status !== 'yopildi').length, 0);
            const lay = [MAPL.sx ? 'Sxema' : '', MAPL.gps ? 'GPS' : '', MAPL.hyb ? 'Gibrid' : ''].filter(Boolean).join(' + ');
            el.innerHTML = `🛤️ 255,6 km · ${st} stansiya · ${pr} peregon ${MAPG.pill ? '▴' : '▾'}` + (MAPG.pill ? `<small>🔀 Strelkalar: ${it.reduce((s, o) => s + (o.strel || 0), 0)} · 🌉 Inshootlar: ${it.reduce((s, o) => s + (o.isso || 0), 0)}<br>🚨 Ochiq zamechaniyalar: ${zs} · 📍 Koordinatali: ${Object.keys(getInfGeo()).length}/${it.length}<br>${LYR_SVG_S}Qatlam: ${lay} (${MAPL.mode === 'stack' ? 'ustma-ust' : 'alohida'})</small>` : '');
        }
        function toggleMapPill() { MAPG.pill = !MAPG.pill; renderMapPill(); }


