        // =====================================================================
        // 4.9 b111 — Imzo chekuvchilar «Kolodka qabul dalolatnomasi» uslubida (muallif soʻrovi, 24.10.2026)
        //  Kalkulyatsiya, Qabul qilish ishchi komissiyasi akti (Pril. 4), Razukomplektovanie akti (Pril. 5), Nosozlik dalolatnomasi:
        //   • TASDIQLOVCHI («Утверждаю» / «Tasdiqlayman») va KOMISSIYA AʼZOLARI — kartochkalar: ✎ / ▲ / ✕, «➕ … qoʻshish»
        //   • xodim shtatdan tanlanadi (seh → xodim; lavozim va F.I.Sh. hujjatdagidek tahrirlanadi) — agmkPickPerson (v4.7)
        //   • oxirgi tanlanganlar har hujjat turi uchun eslab qolinadi (shu qurilmada); yangi hujjat shular bilan ochiladi
        //  Korxona Word blankasi oʻzgarmaydi: tanlangan odamlar blankadagi oʻsha qatorlarga yoziladi, ortiqcha qator olib tashlanadi,
        //  yetmasa — qator nusxalanadi. Hech narsa oʻzgartirilmagan hujjat — avvalgidek (blankadagi asl imzo chekuvchilar).
        //  Imzoga yuborishda maʼlumot hujjat bilan birga ketadi — imzolovchi telefonida ham aynan shu roʻyxat chiziladi.
        // =====================================================================
        const KS9: any = window as any;
        var KS_DX: any = {
            razuk: { cnt: 320, g: {
                ap: { dir: 'start', slots: [{ ps: [4, 5, 7], r: [[4, 'Заместитель председателя'], [5, 'правления – главный инженер']], n: [7, 'Ларионов С.В.'] }] },
                km: { cl: 1, slots: [
                    { ps: [143, 144, 145], r: [[143, 'Главный механик - начальник департамента']], n: [143, 'Азизов А. А.'], pre: 'Члены комиссии:' },
                    { ps: [146, 147], r: [[146, 'Главный энергетик- начальник департамента']], n: [146, 'Досметов Д. С.'] },
                    { ps: [148, 149], r: [[148, 'Главный бухгалтер']], n: [148, 'Тухсанов Х.А.'] },
                    { ps: [150, 151], r: [[150, 'Нач. отдела железнодорожного'], [151, 'транспорта и логистики']], n: [151, 'Мавлянкулов У.И.'] }] },
                bt: { al: 1, cl: 1, slots: [
                    { ps: [313], r: [[313, 'Начальник УПЖТ']], n: [313, 'Маназаров С.Н.'] }, { ps: [314], r: [[314, 'Главный инженер УПЖТ']], n: [314, 'Абдирашидов А.А.'] },
                    { ps: [315], r: [[315, 'Главный механик УПЖТ']], n: [315, 'Куклюшкин Е.Н.'] }, { ps: [316], r: [[316, 'Главный энергетик УПЖТ']], n: [316, 'Мансуров А.А.'] },
                    { ps: [317], r: [[317, 'Главный бухгалтер УПЖТ']], n: [317, 'Ибрагимова Н.Д.'] }, { ps: [318], r: [[318, 'Матер. отв. лицо']], n: [318, 'Пулатов С.М.'] }] }
            } },
            priem: { cnt: 87, g: {
                ap: { dir: 'start', slots: [{ ps: [3, 6], r: [[3, 'Главный инженер УПЖТ']], n: [6, 'А.А. Абдирашидов'] }] },
                sd: { al: 1, cl: 2, slots: [
                    { ps: [71, 72, 73], r: [[71, 'Зам. начальника по производству и'], [72, 'внешней логистике']], n: [72, 'Б.А. Усмонқулов'] },
                    { ps: [74, 75], r: [[74, 'Зам. гл. инженера по ОТ, ТБ и БД УПЖТ']], n: [74, 'О.А. Рахматиллаев'] },
                    { ps: [76, 77], r: [[76, 'Главный механик УПЖТ']], n: [76, 'Е.Н. Куклюшкин'] },
                    { ps: [78, 79], r: [[78, 'Главный энергетик УПЖТ']], n: [78, 'А.А. Мансуров'] },
                    { ps: [80], r: [[80, 'Начальник ПТО']], n: [80, 'С.И. Тулдибаев'] }] },
                pr: { cl: 0, slots: [{ ps: [86], r: [[86, 'Начальник ЖДЦ-1']], n: [86, 'С.М. Пулатов'] }] }
            } },
            nosoz: { cnt: 33, g: {
                ap: { dir: 'start', slots: [{ ps: [1, 2], r: [[1, 'STTB bosh muhandisi']], n: [2, 'A.A. Abdirashidov'] }] },
                sg: { cl: 2, slots: [
                    { ps: [23, 24], r: [[23, '{{s1r}}']], n: [23, '{{s1n}}'] },
                    { ps: [25, 26, 27], r: [[25, '{{s2r}}'], [26, '{{s2r2}}']], n: [26, '{{s2n}}'] },
                    { ps: [28, 29], r: [[28, '{{s3r}}']], n: [28, '{{s3n}}'] },
                    { ps: [30], r: [[30, '{{s4r}}']], n: [30, '{{s4n}}'], nb: 1 }] }
            } }
        };
        var KS_UI: any = {
            calc: { lang: 'ru', g: [['ag', 'KELISHILDI («Согласовано»)', 1], ['ap', 'TASDIQLOVCHI («Утверждаю»)', 1], ['sg', 'IMZO CHEKUVCHILAR (kalkulyatsiya tagida)', 12]] },
            priem: { lang: 'ru', g: [['ap', 'TASDIQLOVCHI («Утверждаю»)', 1], ['sd', 'KOMISSIYA AʼZOLARI (сдали)', 12], ['pr', 'QABUL QILDI (moddiy javobgar shaxslar)', 4]] },
            razuk: { lang: 'ru', g: [['ap', 'TASDIQLOVCHI («Утверждаю»)', 1], ['km', 'KOMISSIYA AʼZOLARI', 12], ['bt', 'PASTKI IMZOLAR (UPJT rahbariyati)', 12]] },
            nosoz: { lang: 'uz', g: [['ap', 'TASDIQLOVCHI («Tasdiqlayman»)', 1], ['sg', 'KOMISSIYA AʼZOLARI (imzo chekuvchilar)', 8]] }
        };
        var KSO: any = null; // kalkulyatsiya chizilayotganda — hujjatning oʻz imzo chekuvchilari

        // ---------- Word blankasiga yozish ----------
        function ksXmlT(s: string): string { return String(s).replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, '&'); }
        function ksEsc(s: string): string { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
        // Paragraf matnida almashtirish: run'larga boʻlingan matn ham topiladi, har belgi oʻz formatini saqlaydi
        function ksSub(p: string, pairs: any[]): { x: string, t: string } {
            const open = (p.match(/^<w:p\b[^>]*>/) || ['<w:p>'])[0], pPr = (p.slice(open.length).match(/^<w:pPr>[\s\S]*?<\/w:pPr>/) || [''])[0];
            const ch: any[] = [];
            for (const m of p.matchAll(/<w:r\b[^>]*>([\s\S]*?)<\/w:r>/g)) {
                const body = m[1], rpr = (body.match(/<w:rPr>[\s\S]*?<\/w:rPr>/) || [''])[0];
                for (const t of body.matchAll(/<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>|<w:tab\/>|<w:br\/>/g)) {
                    if (t[1] !== undefined) ksXmlT(t[1]).split('').forEach(c => ch.push({ c: c, r: rpr })); else ch.push({ c: /tab/.test(t[0]) ? '\t' : '\n', r: rpr });
                }
            }
            let txt = ch.map(z => z.c).join(''), hit = false;
            pairs.forEach(([o, nw, nb]) => { const i = txt.indexOf(o); if (i < 0 || !o) return; hit = true; let r = (ch[i] || ch[0] || { r: '' }).r; if (nb) r = r.replace(/<w:b\/>|<w:bCs\/>/g, ''); ch.splice(i, o.length, ...String(nw).split('').map(c => ({ c: c, r: r }))); txt = ch.map(z => z.c).join(''); });
            if (!hit) return { x: p, t: txt };
            let runs = '', i = 0;
            while (i < ch.length) {
                const r = ch[i].r; let s = '', buf = '';
                const flush = () => { if (buf) { s += '<w:t xml:space="preserve">' + ksEsc(buf) + '</w:t>'; buf = ''; } };
                while (i < ch.length && ch[i].r === r) { const c = ch[i].c; if (c === '\t') { flush(); s += '<w:tab/>'; } else if (c === '\n') { flush(); s += '<w:br/>'; } else buf += c; i++; }
                flush(); runs += '<w:r>' + r + s + '</w:r>';
            }
            return { x: open + pPr + runs + '</w:p>', t: txt };
        }
        function ksWrap(role: string, m: number): string[] {
            const W = 42; let L = String(role || '').split(/\s*[|\n]\s*/).map(x => x.trim()).filter(Boolean);
            if (L.length === 1 && m > 1 && L[0].length > W) { const w = L[0].split(/\s+/), out: string[] = []; let cur = ''; w.forEach(x => { if (cur && (cur + ' ' + x).length > W) { out.push(cur); cur = x; } else cur = cur ? cur + ' ' + x : x; }); if (cur) out.push(cur); L = out; }
            if (m === 1 && L.length === 1 && L[0].length > W) { const w = L[0].split(/\s+/), out: string[] = []; let cur = ''; w.forEach(x => { if (cur && (cur + ' ' + x).length > W) { out.push(cur); cur = x; } else cur = cur ? cur + ' ' + x : x; }); if (cur) out.push(cur); L = out; }
            if (L.length > m) L = m === 1 ? [L.join('\n')] : L.slice(0, m - 1).concat([L.slice(m - 1).join(' ')]); // bitta qatorli oʻrin — uzun lavozim ichida yangi qator
            return L;
        }
        function ksIniFirst(old: string, n: string): string {
            n = String(n || '').trim(); if (!n) return '______________';
            if (!/^[A-ZА-ЯЁЎҚҒҲ]\.\s?[A-ZА-ЯЁЎҚҒҲ]\.?\s/.test(String(old))) return n;
            const m = n.match(/^(\S+)\s+([A-ZА-ЯЁЎҚҒҲ]\.\s?(?:[A-ZА-ЯЁЎҚҒҲ]\.?)?)$/); return m ? m[2].replace(/\s/g, '') + ' ' + m[1] : n;
        }
        // Bitta oʻrin (slot): paragraf matnlari → yangi matnlar (null — olib tashlanadi)
        function ksSepOf(sl: any, src: any): any {
            const r = sl.r.find((x: any) => x[0] === sl.n[0]); if (!r) return null; const t = ksSub(src[sl.n[0]], []).t, a = t.indexOf(r[1]); if (a < 0) return null;
            const b = t.indexOf(sl.n[1], a + r[1].length); if (b < 0) return null; return { len: r[1].length, sep: t.slice(a + r[1].length, b) };
        }
        function ksSep(G: any, src: any, role: string): string | null {
            const C = G.slots.map((x: any) => ksSepOf(x, src)).filter((x: any) => x && /\t/.test(x.sep)); if (!C.length) return null;
            const n = String(role || '').split('\n').pop()!.length; C.sort((a: any, b: any) => Math.abs(a.len - n) - Math.abs(b.len - n)); return C[0].sep;
        }
        function ksNorm(s: unknown): string { return String(s == null ? '' : s).replace(/[\s|\u00a0]+/g, ' ').trim(); }
        function ksSlot(sl: any, src: any, who: any, dir: string, clone: boolean, G?: any, def?: any): (string | null)[] {
            const pairs: any = {}; sl.ps.forEach((i: number) => { pairs[i] = []; });
            // Blankadagi asl odam (oʻsha oʻrinda, oʻzgartirilmagan) — paragraflarga umuman tegilmaydi: asl hujjat bilan bir xil
            if (!clone && def && ksNorm(def.l) === ksNorm(who.l) && ksNorm(def.n) === ksNorm(who.n)) return sl.ps.map((i: number) => src[i]);
            const m = sl.r.length, L = ksWrap(who.l, m), k = L.length, place: string[] = [];
            for (let j = 0; j < m; j++) place.push(dir === 'start' ? (L[j] || '') : (j >= m - k ? L[j - (m - k)] : ''));
            sl.r.forEach((r: any, j: number) => pairs[r[0]].push([r[1], place[j]]));
            const nn = ksIniFirst(sl.n[1], who.n), rj = sl.r.findIndex((r: any) => r[0] === sl.n[0]);
            // Familiyalar bir ustunda tursin: yangi lavozim uzunligiga eng yaqin asl qatordagi oraliq (tab/boʻshliq) olinadi
            const sep = rj >= 0 && G && G.al && ksNorm(place[rj]) !== ksNorm(sl.r[rj][1]) ? ksSep(G, src, place[rj]) : null, cur = rj >= 0 ? ksSepOf(sl, src) : null;
            if (sep != null && cur && place[rj]) pairs[sl.n[0]].push([place[rj] + cur.sep, place[rj] + sep]); // lavozim almashgandan keyin — oraliq (lavozim/familiya formati oʻzida qoladi)
            pairs[sl.n[0]].push([sl.n[1], nn, sl.nb]);
            if (clone && sl.pre) pairs[sl.ps[0]].push([sl.pre, '']);
            const roleOnly = new Set(sl.r.map((r: any) => r[0]).filter((i: number) => i !== sl.n[0]));
            return sl.ps.map((i: number) => { const R = ksSub(src[i], pairs[i]); return roleOnly.has(i) && !R.t.replace(/[\s ]/g, '') ? null : R.x; });
        }
        function ksApply(xml: string, data: any): string {
            const T = data && data._kst, K = data && data._ks, S = T && KS_DX[T]; if (!S || !K) return xml;
            const re = /<w:p\b[\s\S]*?<\/w:p>/g, P: string[] = [], pos: number[][] = []; let m: any;
            while ((m = re.exec(xml))) { P.push(m[0]); pos.push([m.index, m.index + m[0].length]); }
            if (P.length !== S.cnt) { console.warn('ksApply: blanka tuzilishi kutilganidek emas', T, P.length); return xml; }
            const out: (string | null)[] = P.slice(), pre: any = {};
            Object.keys(S.g).forEach(g => {
                const L = K[g]; if (!Array.isArray(L) || !L.length) return;
                const G = S.g[g], sl = G.slots, N = sl.length, dir = G.dir || 'end';
                const D0 = (data._ksd && data._ksd[g]) || [], put = (si: number, who: any) => { const r = ksSlot(sl[si], P, who, dir, false, G, D0[si]); sl[si].ps.forEach((i: number, j: number) => { out[i] = r[j]; }); };
                const del = (si: number) => sl[si].ps.forEach((i: number) => { out[i] = null; });
                if (N === 1) {
                    put(0, L[L.length - 1]);
                    if (L.length > 1) pre[sl[0].ps[0]] = L.slice(0, -1).map((w: any) => ksSlot(sl[G.cl || 0], P, w, dir, true, G).filter(Boolean).join(''));
                    return;
                }
                if (L.length === 1) { put(0, L[0]); for (let s = 1; s < N; s++) del(s); return; }
                const head = L.slice(0, -1), last = L[L.length - 1];
                for (let s = 0; s < N - 1; s++) { if (s < head.length) put(s, head[s]); else del(s); }
                if (head.length > N - 1) pre[sl[N - 1].ps[0]] = head.slice(N - 1).map((w: any) => ksSlot(sl[G.cl || 0], P, w, dir, true, G).filter(Boolean).join(''));
                put(N - 1, last);
            });
            let res = '', at = 0;
            P.forEach((p, i) => { res += xml.slice(at, pos[i][0]) + (pre[i] ? pre[i].join('') : '') + (out[i] == null ? '' : out[i]); at = pos[i][1]; });
            return res + xml.slice(at);
        }
        if (typeof KS9.dxFillXml === 'function') KS9.dxFillXml = KS9.agmkExtend('dxFillXml', '4.9 b111: imzo chekuvchilar blankaga', KS9.dxFillXml, (o: Function) => function (this: unknown, xml: string, data: any) {
            try { if (data && data._kst) xml = ksApply(xml, data); } catch (e) { console.error(e); }
            return o.call(this, xml, data);
        });
        if (typeof KS9.cxDxData === 'function') KS9.cxDxData = KS9.agmkExtend('cxDxData', '4.9 b111: imzo chekuvchilar', KS9.cxDxData, (o: Function) => function (this: unknown, doc: any) {
            const r = o.apply(this, arguments);
            try { if (doc && doc.ks && KS_DX[doc.type] && r && typeof r === 'object') { r._kst = doc.type; r._ks = doc.ks; r._ksd = ksDef(doc); } } catch (e) { console.error(e); }
            return r;
        });
        // Kalkulyatsiya (HTML): chizish vaqtida «sign» oʻrniga hujjatning oʻz roʻyxati
        if (typeof KS9.cxDB === 'function') KS9.cxDB = KS9.agmkExtend('cxDB', '4.9 b111: kalkulyatsiya imzo chekuvchilari', KS9.cxDB, (o: Function) => function (this: unknown) {
            const d = o.apply(this, arguments); if (!KSO || !d) return d;
            const S = Object.assign({}, d.sign || {}), s1 = (a: any) => a && a[0] ? (a[0].l || '') + '|' + (a[0].n || '') : null;
            if (s1(KSO.ag)) S.agree = s1(KSO.ag); if (s1(KSO.ap)) S.approve = s1(KSO.ap); if (Array.isArray(KSO.sg)) S.calc = KSO.sg.map((x: any) => (x.l || '') + '|' + (x.n || ''));
            return Object.assign({}, d, { sign: S });
        });
        if (typeof KS9.cxHtmlCalc === 'function') {
            KS9.cxHtmlCalc = KS9.agmkExtend('cxHtmlCalc', '4.9 b111: kalkulyatsiya imzo chekuvchilari', KS9.cxHtmlCalc, (o: Function) => function (this: unknown, doc: any) {
                if (!doc || !doc.ks) return o.apply(this, arguments);
                const was = KSO; KSO = doc.ks; try { return o.apply(this, arguments); } finally { KSO = was; }
            });
            try { if (KS9.CX_T && KS9.CX_T.calc) KS9.CX_T.calc[2] = KS9.cxHtmlCalc; } catch (e) { /* */ }
        }

        // ---------- Asl (blankadagi) roʻyxat ----------
        function ksDef(doc: any): any {
            const t = doc.type, o: any = {};
            if (t === 'calc') {
                const d = KS9.cxDB(), S = (d && d.sign) || {}, sg = (s: string) => { const [a, b] = String(s || '|').split('|'); return { l: a || '', n: b || '' }; };
                o.ag = [sg(S.agree)]; o.ap = [sg(S.approve)]; o.sg = (S.calc || []).map(sg); return o;
            }
            const D = KS_DX[t]; if (!D) return o;
            Object.keys(D.g).forEach(g => { o[g] = D.g[g].slots.map((s: any) => ({ l: s.r.map((r: any) => r[1].trim()).join('\n'), n: s.n[1].trim() })); });
            if (t === 'nosoz') o.sg = ((doc.sg && doc.sg.length ? doc.sg : KS9.CX_NOSOZ_SG) || []).map((x: any) => ({ l: String(x[0] || '').replace(/\s*\|\s*/g, '\n'), n: String(x[1] || '') }));
            return o;
        }
        function ksGet(doc: any): any { const d = ksDef(doc), k = doc.ks || {}; const o: any = {}; Object.keys(d).forEach(g => { o[g] = Array.isArray(k[g]) ? k[g] : d[g]; }); return o; }
        function ksLastKey(t: string): string { return 'agmk_ks_' + t; }
        function ksLast(t: string): any { try { const v = JSON.parse(localStorage.getItem(ksLastKey(t)) || 'null'); return v && typeof v === 'object' ? v : null; } catch (e) { return null; } }
        function ksTouch(): any {
            const doc = KS9.CXV && KS9.CXV.cur; if (!doc) return null;
            if (!doc.ks) doc.ks = JSON.parse(JSON.stringify(ksGet(doc)));
            return doc.ks;
        }
        function ksChanged(): void {
            const doc = KS9.CXV.cur; if (!doc || !doc.ks) return;
            try { localStorage.setItem(ksLastKey(doc.type), JSON.stringify(doc.ks)); } catch (e) { /* */ }
            if (doc.type === 'nosoz' && Array.isArray(doc.ks.sg)) { doc.members = doc.ks.sg.map((x: any) => (x.l + ' ' + x.n).trim()).join(', '); const ta = document.querySelector('#cxModal textarea[onchange*="CXV.cur.members"]') as any; if (ta) ta.value = doc.members; }
            ksDraw(); try { KS9.cxPrev(); } catch (e) { /* */ }
        }

        // ---------- Oyna (kolodka dalolatnomasidagi kartochkalar) ----------
        function ksDraw(): void {
            const doc = KS9.CXV && KS9.CXV.cur, U = doc && KS_UI[doc.type], box = KS9.$id('ksPpl'); if (!U || !box) return;
            const E = KS9.escapeHtml, K = ksGet(doc);
            box.innerHTML = U.g.map(([g, title, max]: any) => {
                const L = K[g] || [];
                if (max === 1) { const a = L[0]; return `<div class="kq-h">${E(title)}</div>` + (a && (a.n || a.l) ? `<div class="kq-p"><span><b>${E(a.n || '—')}</b><small>${E(a.l || '')}</small></span><button class="mini-btn" onclick="ksPick('${g}',0)">✎</button></div>` : `<button class="kq-add" onclick="ksPick('${g}',0)">👤 Tanlash</button>`); }
                return `<div class="kq-h">${E(title)}</div>` + (L.map((a: any, i: number) => `<div class="kq-p"><span><b>${i + 1}. ${E(a.n || '—')}</b><small>${E(a.l || '')}</small></span><button class="mini-btn" onclick="ksPick('${g}',${i})">✎</button>${i ? `<button class="mini-btn" onclick="ksUp('${g}',${i})">▲</button>` : ''}${L.length > 1 ? `<button class="mini-btn" onclick="ksDel('${g}',${i})">✕</button>` : ''}</div>`).join('') || '<div class="nd-tip">— hali hech kim qoʻshilmagan</div>')
                    + (L.length < max ? `<button class="kq-add" onclick="ksPick('${g}',-1)">➕ ${g === 'pr' ? 'Qabul qiluvchini' : g === 'bt' ? 'Imzo chekuvchini' : 'Komissiya aʼzosini'} qoʻshish</button>` : '');
            }).join('') + (doc.ks ? `<div class="nv-btns"><button onclick="ksReset()">↺ Blankadagi asl roʻyxat</button></div>` : '');
        }
        function ksPick(g: string, i: number): void {
            const doc = KS9.CXV.cur, U = KS_UI[doc.type]; if (!U) return; const row = U.g.find((x: any) => x[0] === g); const title = (i < 0 ? '➕ ' : '👤 ') + (row ? row[1] : 'Imzo chekuvchi');
            KS9.agmkPickPerson(title, (p: any) => { const K = ksTouch(); if (!K) return; K[g] = (K[g] || []).slice(); if (i < 0) K[g].push({ l: p.l, n: p.n }); else K[g][i] = { l: p.l, n: p.n }; ksChanged(); }, U.lang);
        }
        function ksUp(g: string, i: number): void { const K = ksTouch(); if (!K || i <= 0) return; const L = K[g]; const t = L[i]; L[i] = L[i - 1]; L[i - 1] = t; ksChanged(); }
        function ksDel(g: string, i: number): void { const K = ksTouch(); if (!K || K[g].length <= 1) return; K[g].splice(i, 1); ksChanged(); }
        async function ksReset(): Promise<void> {
            const doc = KS9.CXV.cur; if (!doc || !(await KS9.uiConfirm('Imzo chekuvchilar blankadagi asl roʻyxatga qaytarilsinmi?'))) return;
            delete doc.ks; try { localStorage.removeItem(ksLastKey(doc.type)); } catch (e) { /* */ }
            if (doc.type === 'nosoz') doc.members = KS9.CX_NOSOZ_MEM;
            KS9.cxForm();
        }
        Object.assign(KS9, { ksPick: ksPick, ksUp: ksUp, ksDel: ksDel, ksReset: ksReset, ksDraw: ksDraw, ksApply: ksApply, ksGet: ksGet });
        if (typeof KS9.cxForm === 'function') KS9.cxForm = KS9.agmkExtend('cxForm', '4.9 b111: imzo chekuvchilar kartochkalari', KS9.cxForm, (o: Function) => function (this: unknown) {
            const r = o.apply(this, arguments);
            try {
                const doc = KS9.CXV && KS9.CXV.cur; if (!doc || !KS_UI[doc.type] || KS9.$id('ksPpl')) return r;
                // Nosozlik: eski «Imzolar (lavozim | ism)» qatorlari oʻrniga — kartochkalar
                const oh = [...document.querySelectorAll('#cxModal .hs-h')].find(h => /^Imzolar/.test(h.textContent || ''));
                if (oh) { let n = oh.nextElementSibling; while (n && (n.classList.contains('nd-2') || n.classList.contains('nd-chips'))) { const nx = n.nextElementSibling; n.remove(); n = nx; } oh.remove(); }
                const sum = KS9.$id('cxSum'); if (sum) sum.insertAdjacentHTML('beforebegin', '<div class="hs-h">✍️ Imzo chekuvchilar</div><div id="ksPpl"></div>');
                ksDraw();
            } catch (e) { console.error(e); }
            return r;
        });
        if (typeof KS9.cxNew === 'function') KS9.cxNew = KS9.agmkExtend('cxNew', '4.9 b111: oxirgi imzo chekuvchilar', KS9.cxNew, (o: Function) => function (this: unknown, type: string) {
            const r = o.apply(this, arguments);
            try { const L = ksLast(type), doc = KS9.CXV && KS9.CXV.cur; if (L && doc && KS_UI[doc.type]) { doc.ks = JSON.parse(JSON.stringify(L)); if (doc.type === 'nosoz' && Array.isArray(L.sg)) doc.members = L.sg.map((x: any) => (x.l + ' ' + x.n).trim()).join(', '); KS9.cxForm(); } } catch (e) { console.error(e); }
            return r;
        });
