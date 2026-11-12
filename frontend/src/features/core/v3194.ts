        // =====================================================================
        // v3.19.4 — roʻyxat koʻrinishi, bosh sahifa qidiruvi, nomlar va rasmlar (docs/KAMCHILIKLAR.md K-47–K-51)
        //  • K-47: «Sex va boʻlinma ishchilari» roʻyxati va tuzilmasi — chapda tabel (bir xil kenglikdagi ustun), oʻngda F.I.Sh.
        //  • K-48: bosh sahifa qidiruvi — 🧭 boʻlimlar (karta, modul, maxsus sahifalar), 📊 holat boʻyicha
        //          («muddati oʻtgan vagonlar», «taʼmirdagi teplovozlar»), kasb sinonimlari (oʻzbekcha ↔ ruscha),
        //          xodimning shtatdagi lavozimi/joyi ham qidiriladi; 1–2 harfli soʻz — faqat butun soʻz, 3 harfli — soʻz boshidan (tasodifiy moslik kamayadi).
        //  • K-49: «Mening ishchilarim» → «Sex va boʻlinma ishchilari», kartada izohsiz (boshqalari kabi faqat nom).
        //  • K-50/K-51: rasmlar — Ishchi xodimlar (bosh sahifa), Sex va boʻlinma ishchilari (v3194img.ts).
        // =====================================================================
        const Q4: any = window as any;
        var Q4_MY = 'Sex va boʻlinma ishchilari';

        // ---------- K-47: tabel — chapda, bir tekis ustun ----------
        if (typeof Q4.myRow === 'function') Q4.myRow = function (x: any): string {
            const E = Q4.myE || Q4.escapeHtml;
            return `<div class="my-row" onclick="myPass('${E(x.tabel)}')"><span class="q4-tb">${E(x.tabel)}</span><div class="my-n"><b>${E(x.name)}</b><small>${E(x.lav)}${x.grpN ? ' · ' + E(x.grpN) : x.unitN ? ' · ' + E(x.unitN) : ''}</small></div><div class="my-bs">${Q4.myBadges ? Q4.myBadges(x) : ''}</div></div>`;
        };

        // ---------- K-49: nom ----------
        function q4MyCard(): void {
            try {
                const c = Q4.$id('myCard'); if (!c) return; const t = c.querySelector('.btn-text') as HTMLElement; if (!t || t.dataset.q4) return;
                t.dataset.q4 = '1'; t.textContent = Q4_MY;
                c.setAttribute('data-search', 'sex va boʻlinma ishchilari bolinma ishchilar mening ishchilarim hodimlarim qol ostidagilar struktura');
            } catch (e) { /* */ }
        }
        if (typeof Q4.secScreen === 'function') Q4.secScreen = Q4.agmkExtend('secScreen', 'v3.19.4: Sex va boʻlinma ishchilari', Q4.secScreen, (o: Function) => function (this: unknown, id: string, title: string) {
            const a: any[] = Array.prototype.slice.call(arguments); if (id === 'screen-my') a[1] = '👷 ' + Q4_MY; return o.apply(this, a);
        });
        if (typeof Q4.xlsxDl === 'function') Q4.xlsxDl = Q4.agmkExtend('xlsxDl', 'v3.19.4: Sex va boʻlinma ishchilari', Q4.xlsxDl, (o: Function) => function (this: unknown, rows: any[], name: string) {
            try { if (name === 'Mening hodimlarim') { name = Q4_MY; if (rows && rows[0] && typeof rows[0][0] === 'string') rows[0][0] = rows[0][0].replace('Mening hodimlarim', Q4_MY); } } catch (e) { /* */ }
            return o.call(this, rows, name);
        });

        // ---------- K-48: qidiruv ----------
        // Kasb va soʻz sinonimlari (gsFold dan keyingi koʻrinishda: x→h, q→k, kirill → lotin)
        var Q4_SYN: any = {
            payvandchi: ['svarsh', 'payvand'], payvand: ['svarsh'], elektromontyor: ['elektromont', 'elektromonter', 'elektrik'], elektrik: ['elektromont', 'elektromeh'],
            chilangar: ['slesar'], slesar: ['chilangar'], haydovchi: ['voditel', 'shofer', 'haydovchi'], voditel: ['haydovchi'],
            duradgor: ['plotnik', 'stolyar'], kurovchi: ['storozh', 'kurikchi'], korikchi: ['kurikchi', 'storozh', 'ohrann'], farrosh: ['uborsh'], omborchi: ['kladovsh', 'ombor'],
            muhandis: ['inzhener', 'muhandis'], injener: ['muhandis', 'inzhener'], inzhener: ['muhandis'], hisobchi: ['buhgalter'], buhgalter: ['buhgalter'],
            usta: ['master', 'usta'], master: ['usta'], boshlik: ['nachalnik', 'boshlig'], nachalnik: ['boshlig'], urinbosar: ['zamestitel', 'urinbosar'],
            kranchi: ['kranovsh', 'mashinist krana', 'kran'], yukchi: ['gruzchik'], tokar: ['tokar'], bulfayzer: ['bulfayzer'], dispetcher: ['dispetcher', 'dispecher'],
            navbatchi: ['dezhurn', 'navbatchi'], taʼmirlovchi: ['remont'], tamirlovchi: ['remont', 'tamir'], montyor: ['monter', 'montyor'], operator: ['operator'],
            mashinist: ['mashinist'], pomoshnik: ['yordamchi'], yordamchi: ['pomoshnik', 'yordamchi'], kuzatuvchi: ['nablyud'], revizor: ['revizor'], iktisodchi: ['ekonomist'], ekonomist: ['iktisodchi']
        };
        function q4Alts(t: string): string[] { const a = Q4_SYN[t]; return a ? [t].concat(a) : [t]; }
        // 1–3 harfli harf soʻzi — faqat soʻz boshidan; sinonim — istalgan biri
        if (typeof Q4.gsScore === 'function') Q4.gsScore = function (hay: string, toks: string[], first?: string): number {
            const H = ' ' + hay; let s = 1;
            for (const t of toks) {
                const A = q4Alts(t), short = t.length <= 3 && !/\d/.test(t);
                const tiny = t.length <= 2 && !/\d/.test(t), HH = H + ' ';
                const hit = A.some(a => tiny ? HH.includes(' ' + a + ' ') : short ? H.includes(' ' + a) : hay.includes(a)); if (!hit) return 0;
                if (A.some(a => H.includes(' ' + a))) s += 2; if (first && A.some(a => first.startsWith(a))) s += 3;
            }
            return s;
        };
        // Boʻlimlar indeksi
        function q4Secs(): any[] {
            const out: any[] = [], seen: any = {}, F = Q4.gsFold;
            const add = (n: string, kw: string, go: () => void, sub?: string) => { const k = F(n); if (!n || seen[k]) return; seen[k] = 1; out.push({ n: n, kw: F(n + ' ' + (kw || '')), go: go, sub: sub || '' }); };
            try {
                document.querySelectorAll('#main-card-list .btn-card').forEach((c: any) => {
                    const t = c.querySelector('.btn-text'); if (!t) return; let n = ''; t.childNodes.forEach((x: any) => { if (x.nodeType === 3) n += x.textContent; }); n = n.replace(/\s+\d+\s*boʻlim$/, '').trim() || String(t.textContent || '').trim();
                    n = n.replace(/\d+$/, '').trim(); add(n, c.getAttribute('data-search') || '', () => c.click(), c.classList.contains('mn-col') ? '' : 'boʻlim');
                });
            } catch (e) { /* */ }
            try { (Q4.AGMK_MODS || []).forEach((m: any) => { if (typeof Q4.modAllowed === 'function' && !Q4.modAllowed(m)) return; if (typeof m.open === 'function') add(String(m.title || ''), (m.search || '') + ' ' + (m.desc || ''), () => m.open(), m.desc || ''); }); } catch (e) { /* */ }
            const X: [string, string, string][] = [
                ['🧥 Maxsus kiyim', 'maxsus kiyim forma odejda spetskiyim kaska jilet botinka norma ombor', 'kxOpen'],
                ['📅 Kunlik polojeniya', 'polojeniya kunlik holat tamir navbat vagonlar', 'polOpen'],
                ['🗓 Taʼmir grafigi (PPR)', 'grafik ppr yillik oylik tamir reja jadval', 'pprOpen'],
                ['🦺 Mehnat muhofazasi', 'mehnat muhofazasi instruktaj bilim sinovi tb mm', 'openMM'],
                ['📷 QR skaner', 'qr skaner yorlik kod', 'qrScanOpen'],
                ['📄 Hujjat skaneri', 'skaner hujjat rasm pdf word excel scan', 'v9ScanOpen'],
                ['👷 ' + Q4_MY, 'mening ishchilarim hodimlarim kol ostidagilar sex bolinma ishchilari', 'myOpen'],
                ['✍️ Imzolash', 'imzo imzolash elektron imzo hujjat tasdiq', 'sigOpenList'],
                ['⚙️ Parametrlar', 'parametrlar sozlamalar parol mavzu', 'openSettings']
            ];
            X.forEach(([n, kw, f]) => { if (typeof Q4[f] === 'function') add(n, kw, () => Q4[f]()); });
            try { const sg = Q4.$id('sgCard'); if (sg) add('✍️ Imzolash', 'imzo imzolash elektron imzo', () => sg.click()); } catch (e) { /* */ }
            return out;
        }
        // Holat boʻyicha
        var Q4_KIND: [RegExp, string, string][] = [[/\bvagon/, 'v', 'Vagonlar'], [/\bteplovoz|\blokomotiv|\belektrovoz/, 'l', 'Lokomotivlar'], [/\bavto|\btraktor|\bmashina/, 'a', 'Avtotraktor'], [/\byol tehnika|\byol mashina|\bkran/, 'y', 'Yoʻl texnikasi']];
        var Q4_ST: [RegExp, string, string][] = [[/muddati (otgan|kelgan)|tamir talab|kechikkan/, "Ta'mir talab", '🟠 Muddati kelgan / oʻtgan'], [/tamirda|tamirga yuborilgan|tamirdagi/, 'Tamirda', '🔵 Taʼmirda / yuborilgan'], [/yakin|muddati yakin/, 'Yaqin', '🟡 Muddati yaqin'], [/\bsoz\b|sozlar|ishlayotgan/, 'Soz', '🟢 Soz']];
        function q4Status(q: string): any[] {
            const f = Q4.gsFold(q), out: any[] = []; const st = Q4_ST.find(s => s[0].test(f)); if (!st) return out;
            const kd = Q4_KIND.find(k => k[0].test(f)), kinds = kd ? [kd] : [Q4_KIND[0]];
            kinds.forEach(k => {
                let L: any[] = []; try { L = (Q4.vagonlarData || vagonlarData || []).filter((v: any) => v.kind !== 'infra' && (k[1] === 'v' ? !v.kind : k[1] === 'l' ? v.kind === 'lok' : k[1] === 'a' ? v.kind === 'avto' : v.kind === 'yol') && v.status === st[1]); } catch (e) { L = []; }
                out.push({ s: 50, n: k[2] + ' — ' + st[2] + ': ' + L.length + ' ta', sub: L.slice(0, 6).map((v: any) => '№' + Q4.vagonNo(v)).join(', ') + (L.length > 6 ? '…' : ''), k: k[1], st: st[1] });
            });
            return out;
        }
        if (typeof Q4.gsRun === 'function') Q4.gsRun = Q4.agmkExtend('gsRun', 'v3.19.4: boʻlimlar, holat, lavozim joyi, sinonimlar', Q4.gsRun, (o: Function) => function (this: unknown, q: string) {
            const R = o.apply(this, arguments); R.s = []; R.h = [];
            try {
                const toks = Q4.gsFold(q).split(' ').filter(Boolean); if (!toks.length) return R;
                q4Secs().forEach(x => { const s = Q4.gsScore(x.kw, toks, Q4.gsFold(x.n).replace(/^\W+/, '')); if (s) R.s.push(Object.assign({ s: s + 5 }, x)); });
                R.s.sort((a: any, b: any) => b.s - a.s); R.h = q4Status(q);
                // xodim: shtatdagi lavozim nomi va joyi ham (ishchilar kasbi koʻpincha shu yerda)
                const have = new Set(R.x.map((r: any) => r.id));
                (Q4.allXodims() || []).forEach((r: any) => {
                    const it = r.item; if (have.has(it.id)) return; const p = it.posNo && Q4.posByNo ? Q4.posByNo(it.posNo) : null; if (!p) return;
                    const hay = Q4.gsFold([it.name, p.name, Q4.posPath ? Q4.posPath(p) : '', it.lavozim || ''].join(' ')), s = Q4.gsScore(hay, toks, Q4.gsFold(it.name));
                    if (s) R.x.push({ s: s, id: it.id, n: it.name, sub: [it.lavozim || p.name, r.su].filter(Boolean).join(' · '), tb: Q4.cleanTabel(it.tabel), off: false });
                });
                R.x.sort((a: any, b: any) => b.s - a.s || String(a.n).localeCompare(String(b.n)));
            } catch (e) { console.error(e); }
            return R;
        });
        try { if (Array.isArray(Q4.GS_GRP) && !Q4.GS_GRP.some((g: any) => g[0] === 's')) Q4.GS_GRP.unshift(['h', '📊 Holat boʻyicha'], ['s', '🧭 Boʻlimlar']); } catch (e) { /* */ }
        if (typeof Q4.gsGo === 'function') Q4.gsGo = Q4.agmkExtend('gsGo', 'v3.19.4: boʻlim va holat natijalari', Q4.gsGo, (o: Function) => function (this: unknown, k: string, i: number) {
            const r = Q4.GS && Q4.GS.R && Q4.GS.R[k] && Q4.GS.R[k][i];
            if (k === 's' && r) { try { const inp = Q4.$id('globalSearchInput'); if (inp) { inp.value = ''; Q4.filterMainMenu && Q4.filterMainMenu(); } } catch (e) { /* */ } try { r.go(); } catch (e) { console.error(e); } return; }
            if (k === 'h' && r) {
                try {
                    if (r.k === 'v') { Q4.openScreen('screen-vagonlar'); Q4.setStatusFilter(r.st); }
                    else if (r.k === 'l') { Q4.openLokScreen(); try { Q4.lokFilter = r.st; Q4.renderLok && Q4.renderLok(); } catch (e) { /* */ } }
                    else if (r.k === 'a') Q4.openAvtoScreen(); else Q4.openYolScreen();
                } catch (e) { console.error(e); }
                return;
            }
            return o.apply(this, arguments);
        });

        // ---------- ikonkalar va nom: kartalar paydo boʻlganda ----------
        var Q4T: any = 0;
        new MutationObserver(() => { if (!Q4T) Q4T = setTimeout(() => { Q4T = 0; q4MyCard(); }, 300); }).observe(document.body, { childList: true, subtree: true });
        setTimeout(q4MyCard, 1500);

        (function (): void {
            const st = document.createElement('style');
            st.textContent = `.my-row{justify-content:flex-start}.my-row .my-n{flex:1}.q4-tb,.my-tp small{font-variant-numeric:tabular-nums;font-weight:700;color:#7dd3fc;opacity:1!important}
.q4-tb{flex:0 0 3.4em;font-size:13px}
.my-tp{display:grid!important;grid-template-columns:3.4em 1fr;column-gap:8px;align-items:center}
.my-tp small{grid-column:1;grid-row:1;font-size:12.5px!important}.my-tp b{grid-column:2;grid-row:1;word-break:break-word}.my-tp .my-b{grid-column:2;justify-self:start}`;
            document.head.appendChild(st);
        })();
