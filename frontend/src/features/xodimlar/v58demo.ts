        // =====================================================================
        // 5.8 — Taqdimot demolari (server ulangan boʻlsa ham): 🦺 Mehnat muhofazasi (TB) va 🧥 Maxsus kiyim
        //  Soxta xodimlar (Namunaviy X.), soxta sanalar. Haqiqiy maʼlumotga yozilmaydi (saqlash — demo ichida qoladi).
        //  Yoqish: bosh sahifa ⋮ → «Demo: …»; oʻchirish — sahifadagi «⏹ Toʻxtatish» yoki ⋮ → «Demolarni toʻxtatish».
        // =====================================================================
        const D58: any = window as any;
        var DM58: any = { mm: false, kiy: false, mmD: null, kiyP: {} };
        const DM58_LAV = ['Vagon taʼmirlovchi chilangar', 'Elektrovoz mashinisti', 'Teplovoz mashinisti yordamchisi', 'Usta', 'Temir yoʻl ishchisi', 'Payvandchi', 'Muhandis', 'Kran mashinisti', 'Sostavitel', 'Elektromexanik'];
        const DM58_U = ['VX', '1-TYS', '2-TYS', 'ЖДЦ-1', 'ЖДЦ-2', 'Lokomotiv sexi'];
        const DM58_FAM = ['Namunaviy', 'Soxtaev', 'Testov', 'Sinovov', 'Misolov', 'Demoyev', 'Taqdimotov', 'Ko‘rgazmaev'];
        function dm58Iso(d: Date): string { return d.toISOString().slice(0, 10); }
        function dm58Add(days: number): string { const d = new Date(); d.setDate(d.getDate() + days); return dm58Iso(d); }
        function dm58People(n: number): any[] { const L: any[] = []; for (let i = 0; i < n; i++) L.push({ tabel: String(990100 + i), name: DM58_FAM[i % DM58_FAM.length] + ' ' + String.fromCharCode(65 + (i * 7) % 26) + '.' + String.fromCharCode(65 + (i * 11) % 26) + '.', lavozim: DM58_LAV[i % DM58_LAV.length], unit: DM58_U[i % DM58_U.length] }); return L; }
        function dm58Banner(stop: string): string { return `<div class="lv-demo dm58-b">🧪 DEMO — taqdimot uchun, soxta maʼlumot <button onclick="${stop}">⏹ Toʻxtatish</button></div>`; }

        // ---------- 🦺 Mehnat muhofazasi (TB) ----------
        function dm58MM(): any {
            if (DM58.mmD) return DM58.mmD;
            const P = dm58People(36), recs: any = {}, jr: any[] = [];
            P.forEach((p, i) => {
                const k = i % 6; // 0 — muddati oʻtgan, 1 — 30 kun ichida, 2 — kiritilmagan tibbiy, qolgan — joyida
                const davr = dm58Add(k === 0 ? -200 : k === 1 ? -170 : -40 - i), bil = dm58Add(k === 0 ? -400 : k === 1 ? -350 : -100 - i * 3);
                recs[p.tabel] = { cat: /Usta/.test(p.lavozim) ? 'topshiriq' : /Muhandis/.test(p.lavozim) ? 'rahbar' : 'ishchi', d: { davriy: davr, bilim: bil }, tibbiyNext: k === 2 ? '' : dm58Add(k === 0 ? -5 : k === 1 ? 12 : 120 + i) };
            });
            [['kirish', -2, 3], ['davriy', -10, 12], ['bilim', -25, 8], ['maqsadli', -4, 5], ['tibbiy', -30, 10]].forEach(([t, dd, n]: any, j: number) => jr.push({ id: 'dm' + j, type: t, date: dm58Add(dd), tabels: P.slice(j * 5, j * 5 + n).map(p => p.tabel), note: 'DEMO yozuv', by: 'Namunaviy MM masʼuli' }));
            DM58.mmD = { recs: recs, jr: jr, instr: [], people: P }; return DM58.mmD;
        }
        if (typeof D58.mmData === 'function') D58.mmData = D58.agmkExtend('mmData', '5.8: TB demo', D58.mmData, (o: Function) => function (this: unknown) { return DM58.mm ? dm58MM() : o.apply(this, arguments); });
        if (typeof D58.mmSave === 'function') D58.mmSave = D58.agmkExtend('mmSave', '5.8: TB demo — saqlanmaydi', D58.mmSave, (o: Function) => function (this: unknown, d: any) { if (DM58.mm) { DM58.mmD = d; try { D58.showToast('🧪 Demo — haqiqiy maʼlumotga yozilmadi'); } catch (e) { /* */ } return true; } return o.apply(this, arguments); });
        if (typeof D58.mmPeople === 'function') D58.mmPeople = D58.agmkExtend('mmPeople', '5.8: TB demo xodimlari', D58.mmPeople, (o: Function) => function (this: unknown) { return DM58.mm ? dm58MM().people.map((p: any) => ({ item: p, su: p.unit })) : o.apply(this, arguments); });
        if (typeof D58.mmRender === 'function') D58.mmRender = D58.agmkExtend('mmRender', '5.8: TB demo belgisi', D58.mmRender, (o: Function) => function (this: unknown) { const r = o.apply(this, arguments); try { if (DM58.mm) { const b = D58.secBody('screen-mm'); if (b && !b.querySelector('.dm58-b')) b.insertAdjacentHTML('afterbegin', dm58Banner('dm58MMOff()')); } } catch (e) { /* */ } return r; });
        function dm58MMOn(): void { DM58.mm = true; DM58.mmD = null; try { D58.MM.tab = 'nazorat'; } catch (e) { /* */ } try { D58.openMM('nazorat'); } catch (e) { console.error(e); } }
        function dm58MMOff(): void { DM58.mm = false; DM58.mmD = null; try { D58.mmRender(); } catch (e) { /* */ } }

        // ---------- 🧥 Maxsus kiyim ----------
        const DM58_KAT = [['kostyum', 'Kostyum (kurtka va shim) paxtali', 'GOST 12.4.280', 12], ['botinka', 'Botinka charm', 'GOST 28507', 12], ['qolqop', 'Qoʻlqop kombinatsiyalangan', 'GOST 12.4.010', 1], ['kaska', 'Himoya kaskasi', 'GOST EN 397', 24], ['nimcha', 'Signal nimcha', 'GOST 12.4.281', 12], ['kurtka', 'Qishki kurtka (isitilgan)', 'GOST 29335', 36]];
        function dm58KiyRows(i: number): any[] {
            return DM58_KAT.map((k: any, j: number) => { const s = (i + j) % 5; const last = s === 0 ? dm58Add(-k[3] * 31 - 20) : s === 1 ? dm58Add(-k[3] * 30 + 15) : s === 2 ? '' : dm58Add(-Math.round(k[3] * 30 * 0.3) - j);
                const next = s === 2 ? '' : s === 0 ? dm58Add(-20) : s === 1 ? dm58Add(15) : dm58Add(Math.round(k[3] * 30 * 0.7) - j);
                return { b: k[0], nom: k[1], std: k[2], oy: k[3], soni: k[0] === 'qolqop' ? 12 : 1, mavsum: k[0] === 'kurtka' ? 'qish' : '', last: last, next: next, st: s === 0 ? 'kech' : s === 1 ? 'yaqin' : s === 2 ? 'kerak' : 'ok', manba: 'OʻzR 3617-son' }; });
        }
        function dm58KiyP(t: string): any {
            const P = dm58People(30), i = Math.max(0, P.findIndex(p => p.tabel === t)), p = P[i] || P[0];
            if (DM58.kiyP[p.tabel]) return DM58.kiyP[p.tabel];
            const rows = dm58KiyRows(i), hist = rows.filter((r: any) => r.last).map((r: any, j: number) => ({ id: 9000 + i * 10 + j, date: r.last, nom: r.nom, qty: r.soni, size: r.b === 'botinka' ? '43' : r.b === 'kaska' ? '58' : '52-54/182', byN: 'Namunaviy omborchi', ack: j % 3 ? r.last : '', cancelled: false }));
            DM58.kiyP[p.tabel] = { person: { tabel: p.tabel, name: p.name, lav: p.lavozim, unitN: p.unit, grpN: '' }, plan: { rows: rows, grpNom: p.lavozim + ' (namunaviy norma)', band: 'OʻzR 3617-son, ' + (i % 30 + 1) + '-band', auto: true, shart: i % 4 === 0 ? ['karyer'] : [], due: rows.filter((r: any) => r.st === 'kech' || r.st === 'kerak').length, soon: rows.filter((r: any) => r.st === 'yaqin').length },
                hist: hist, size: { boy: '182', kiyim: '52-54', poyabzal: '43', bosh: '58' }, can: { issue: true, size: true, grp: false, ack: false }, grps: [] };
            return DM58.kiyP[p.tabel];
        }
        function dm58KiyDue(): any { return { all: true, list: dm58People(30).map((p, i) => ({ tabel: p.tabel, name: p.name, lav: p.lavozim, unitN: p.unit, grpN: '', items: dm58KiyRows(i).filter((r: any) => r.st !== 'ok').map((r: any) => ({ nom: r.nom, st: r.st === 'yaqin' ? 'yaqin' : 'kech', next: r.next })) })).filter((x: any) => x.items.length) }; }
        function dm58KiyNorma(): any { return { manba: ['OʻzR VM 3617-son qaror (namuna)', 'DEMO'], katalog: DM58_KAT.map((k: any) => ({ kod: k[0], nom: k[1] })), guruhlar: [{ nom: 'Temir yoʻl transporti ishchilari (namuna)', band: '1-band', qator: DM58_KAT.map((k: any) => ({ b: k[0], oy: k[3], soni: 1 })) }], qoidalar: ['DEMO: kiyim norma muddati tugagach yangisi beriladi.', 'DEMO: xodim ilovada «Oldim» deb tasdiqlaydi.'] }; }
        if (typeof D58.sbFetch === 'function') D58.sbFetch = D58.agmkExtend('sbFetch', '5.8: maxsus kiyim demo', D58.sbFetch, (o: Function) => async function (this: unknown, path: string, opt?: any) {
            if (DM58.kiy && typeof path === 'string') {
                const m = (opt && opt.method) || 'GET';
                if (/^\/api\/kiy\/v1\//.test(path)) {
                    if (m !== 'GET') { try { D58.showToast('🧪 Demo — haqiqiy maʼlumotga yozilmadi'); } catch (e) { /* */ } return { ok: true, n: 1 }; }
                    if (/^\/api\/kiy\/v1\/due/.test(path)) return dm58KiyDue();
                    if (/^\/api\/kiy\/v1\/norma/.test(path)) return dm58KiyNorma();
                    if (/^\/api\/kiy\/v1\/p/.test(path)) { const t = (/[?&]t=([^&]+)/.exec(path) || [])[1]; return dm58KiyP(t ? decodeURIComponent(t) : '990100'); }
                }
                if (/^\/api\/my\/v1\/find/.test(path)) { const q = decodeURIComponent((/[?&]q=([^&]+)/.exec(path) || [])[1] || '').toLowerCase(); return dm58People(30).filter(p => !q || (p.name + ' ' + p.tabel).toLowerCase().indexOf(q) >= 0).map(p => ({ tabel: p.tabel, name: p.name, lav: p.lavozim, unitN: p.unit })); }
            }
            return o.apply(this, arguments);
        });
        function dm58KiyBanner(): void { try { const b = D58.secBody('screen-kiy'); if (b && DM58.kiy && !b.querySelector('.dm58-b')) b.insertAdjacentHTML('afterbegin', dm58Banner('dm58KiyOff()')); const m = document.querySelector('#kiyM .modal-content'); if (m && DM58.kiy && !m.querySelector('.dm58-b')) { const h = m.querySelector('.px-h'); if (h) h.insertAdjacentHTML('afterend', dm58Banner('dm58KiyOff()')); } } catch (e) { /* */ } }
        if (typeof D58.kiyDueRender === 'function') D58.kiyDueRender = D58.agmkExtend('kiyDueRender', '5.8: kiyim demo belgisi', D58.kiyDueRender, (o: Function) => function (this: unknown) { const r = o.apply(this, arguments); dm58KiyBanner(); return r; });
        if (typeof D58.kiyRender === 'function') D58.kiyRender = D58.agmkExtend('kiyRender', '5.8: kiyim demo belgisi', D58.kiyRender, (o: Function) => function (this: unknown) { const r = o.apply(this, arguments); dm58KiyBanner(); return r; });
        function dm58KiyOn(): void { DM58.kiy = true; DM58.kiyP = {}; try { D58.MY.kn = null; } catch (e) { /* */ } try { D58.kiyOmbor(); } catch (e) { console.error(e); } }
        function dm58KiyOff(): void { DM58.kiy = false; DM58.kiyP = {}; try { D58.MY.kn = null; } catch (e) { /* */ } try { D58.mdlClose('kiyM'); } catch (e) { /* */ } try { D58.openScreen('screen-main'); } catch (e) { /* */ } }

        // ---------- ⋮ menyu: demo bandlari ----------
        if (typeof D58.wbDemoItems === 'function') D58.wbDemoItems = D58.agmkExtend('wbDemoItems', '5.8: TB va maxsus kiyim demolari', D58.wbDemoItems, (o: Function) => function (this: unknown) {
            const L = (o.apply(this, arguments) || []).slice();
            if (typeof D58.openMM === 'function') L.push({ ic: 'flask', t: 'Demo: Mehnat muhofazasi (TB)', fn: dm58MMOn, x: '' });
            if (typeof D58.kiyOmbor === 'function') L.push({ ic: 'flask', t: 'Demo: Maxsus kiyim (forma)', fn: dm58KiyOn, x: '' });
            if (DM58.mm || DM58.kiy) L.push({ ic: 'stop', t: 'TB / kiyim demolarini toʻxtatish', fn: () => { if (DM58.mm) dm58MMOff(); if (DM58.kiy) dm58KiyOff(); }, x: '' });
            return L;
        });
        Object.assign(D58, { DM58: DM58, dm58MMOn: dm58MMOn, dm58MMOff: dm58MMOff, dm58KiyOn: dm58KiyOn, dm58KiyOff: dm58KiyOff });
