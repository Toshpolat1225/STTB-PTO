        // =====================================================================
        // v4.6 — tuzatishlar va «Kolodka qabul dalolatnomasi»
        //  • Takroriy vagon raqamlari (platforma, sisterna, xopper: «1», «2», «12», «03» …): raqam bir nechta vagonda boʻlsa,
        //    ilova birinchisini olmaydi — «raqam/inventar» (masalan 12/37557) bilan aniqlashtirishni soʻraydi.
        //    agmkFindNo — tarkib «Tez qoʻshish», VRP/PTOV «➕ Kiritish» shu bilan ishlaydi.
        //  • 📄 Dalolatnomalar → «🛞 Kolodka qabul dalolatnomasi»: yetkazib beruvchi nomi, soni, marka, GOST, shartnoma/hisob-faktura,
        //    imzo chekuvchilar — oʻzimiz kiritamiz; Word va PDF. Oxirgi kiritilganlar eslab qolinadi (faqat shu qurilmada).
        // =====================================================================
        const K6: any = window as any;

        // ---------- Raqam boʻyicha vagon topish (takroriy raqamlarni hisobga olib) ----------
        function agmkFindNo(list: any[], tok: string): any {
            const z = (x: unknown) => String(x == null ? '' : x).trim().replace(/^0+/, '').toLowerCase();
            const m = String(tok || '').trim().match(/^([^\/#]+)(?:[\/#](.+))?$/); if (!m) return { v: null };
            const no = z(m[1]), inv = m[2] ? z(m[2]) : '';
            const L = (list || []).filter((v: any) => z(K6.vagonNo(v)) === no);
            if (inv) { const x = L.find((v: any) => z(v.inv) === inv); return { v: x || null }; }
            if (L.length > 1) return { v: null, dup: L };
            return { v: L[0] || null };
        }
        K6.agmkFindNo = agmkFindNo;

        // Tarkib «Tez qoʻshish»: takroriy raqam — qoʻshilmaydi, inventar bilan soʻraladi
        K6.hdEdRange = function (): void {
            const inp = K6.$id('hdRange'); const s = String((inp || {}).value || '').trim(); if (!s) return;
            const d = K6.hrDB(), H: any = HR as any, busy: any = {}; d.tarkiblar.forEach((t: any) => { if (t.id !== H.edit) t.vagonIds.forEach((id: any) => { busy[id] = t.no; }); });
            const want: string[] = []; s.split(/[,;\s]+/).filter(Boolean).forEach(p => { const m = p.match(/^(\d+)\s*[-–]\s*(\d+)$/); if (m) { const a = +m[1], b = +m[2]; if (b >= a && b - a <= 200) for (let x = a; x <= b; x++) want.push(String(x)); } else if (/^\d+([\/#]\w+)?$/.test(p)) want.push(p); });
            let add = 0; const skip: string[] = [], dups: string[] = [];
            want.forEach(n => {
                const f = agmkFindNo(K6.onlyVagons(), n), v = f.v;
                if (!v) { if (f.dup) dups.push(n + ': ' + f.dup.slice(0, 4).map((x: any) => n + '/' + (x.inv || '?') + (x.type ? ' (' + x.type + ')' : '')).join(', ')); else skip.push(n + ' (topilmadi)'); return; }
                if (H.sel.includes(v.id)) return; if (K6.hrInRepair(v)) { skip.push(n + ' (taʼmirda)'); return; } if (busy[v.id]) { skip.push(n + ' (tarkib №' + busy[v.id] + ')'); return; } H.sel.push(v.id); add++;
            });
            if (inp) inp.value = ''; K6.hrRenderPick();
            if (dups.length) K6.alert('⚠️ Bu raqamlar bir nechta vagonda bor — qaysi biri ekanini inventar raqami bilan yozing (raqam/inventar):\n\n' + dups.join('\n'));
            K6.showToast('➕ ' + add + ' ta vagon qoʻshildi' + (skip.length ? ' · qoʻshilmadi: ' + skip.slice(0, 5).join(', ') + (skip.length > 5 ? '…' : '') : ''));
        };

        // ---------- 🛞 Kolodka qabul dalolatnomasi (Word shablon — muallif namunasi, oʻzbek lotin) ----------
        var KQ_KEY = 'agmk_kolodka_akt2';
        var KQ: any = null;
        var KQ_DEF: any = { org: '«TOP PROJECT» MCHJ', soni: '', marka: 'M659.000', tur: 'kompozit tormoz kolodkalari', gost: 'GOST 33421-2015', sana: '', tsana: '',
            holat: 'Kolodkalar holati yangi va hech qanday nosozliklar aniqlanmadi.', tas: null, azo: [] };
        var KQ_OY = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'];
        function kqLoad(): any { let o: any = {}; try { o = JSON.parse(localStorage.getItem(KQ_KEY) || '{}') || {}; } catch (e) { o = {}; } const r = Object.assign({}, KQ_DEF, o); r.soni = ''; r.sana = ''; r.tsana = ''; if (!Array.isArray(r.azo)) r.azo = [];
            // 4.9 b115: eski yozuv «Boshqaruv apparati bosh muhandis» → «STTB bosh muhandisi»
            const fx = (x: any) => { if (x && /^boshqaruv apparati\s+/i.test(String(x.l || ''))) x.l = kqSttb(String(x.l).replace(/^boshqaruv apparati\s+/i, '')); return x; }; fx(r.tas); r.azo.forEach(fx); delete r._ed; return r; } // tahrir — faqat shu hujjat uchun
        function kqSave(): void { try { localStorage.setItem(KQ_KEY, JSON.stringify(KQ)); } catch (e) { /* */ } }
        function kqToday(): string { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
        function kqSana(iso: string, yil?: string): string { const m = String(iso || '').match(/^(\d{4})-(\d{2})-(\d{2})$/); return m ? '«' + m[3] + '» ' + KQ_OY[+m[2] - 1] + ' ' + m[1] + '-yil.' : '«____» __________ ' + (yil || new Date().getFullYear()) + '-yil.'; }
        // Kirill → oʻzbek lotin (soʻzma-soʻz); qisqartmalar (ИЧТБ) — katta harf
        function kqLat(s: string, cap?: boolean): string {
            const tr = (w: string) => { try { return typeof K6.trC2L === 'function' ? K6.trC2L(w) : w; } catch (e) { return w; } };
            return String(s || '').trim().split(/(\s+)/).map((w, i) => { if (!/[А-Яа-яЁёЎўҚқҒғҲҳ]/.test(w)) return w; const core = w.replace(/^[^А-Яа-яЁёЎўҚқҒғҲҳ]+|[^А-Яа-яЁёЎўҚқҒғҲҳ]+$/g, ''); if (!core) return w; let t = tr(core); if (core.length > 1 && core === core.toUpperCase()) t = t.toUpperCase(); else if (!cap && i > 0) t = t.toLowerCase(); return w.replace(core, t); }).join('');
        }
        // «Familiya Ism Otasining ismi» → «Familiya I.O.» (lotin)
        function kqShort(full: string): string { const p = kqLat(full, true).split(/\s+/).filter(Boolean); if (p.length < 2) return p[0] || ''; if (/^[A-ZʻʼʼA-Za-z]\.?$/.test(p[1]) || /\./.test(p[1])) return p.join(' '); return p[0] + ' ' + p.slice(1, 3).map(x => x.charAt(0).toUpperCase() + '.').join(''); }
        // Boʻlim qisqartmasi: «Ishlab chiqarish-texnik boʻlimi» → ICHTB, «Moddiy-texnik taʼminoti boʻlimi» → MTTB
        function kqAbbr(name: string): string {
            return String(name || '').replace(/[ʻʼ'’‘`]/g, '').split(/[\s-]+/).filter(w => w && !/^(va|bilan|uchun)$/i.test(w))
                .map(w => { const m = w.match(/^(ch|sh|ng)/i); return (m ? m[0] : w.charAt(0)).toUpperCase(); }).join('');
        }
        // Lavozim + boʻlimi: «Boʻlim boshligʻi» → «ICHTB boshligʻi»; «Xizmat boshligʻi oʻrinbosari» (VH) → «VH boshligʻi oʻrinbosari»;
        // boshqalar — oldiga boʻlim: «ICHTB temir yoʻl … muhandisi»
        // 4.9 b115: Boshqaruv apparati rahbariyati (boʻlimsiz) — «STTB …»: «Bosh muhandis» → «STTB bosh muhandisi», «Boshqarma boshligʻi» → «STTB boshligʻi»
        function kqIzofa(w: string): string {
            if (!w || /i$/i.test(w)) return w; const ap = /ʻ/.test(w) ? 'ʻ' : "'";
            if (/q$/i.test(w)) return w.slice(0, -1) + 'g' + ap + 'i'; if (/k$/i.test(w)) return w.slice(0, -1) + 'gi';
            return /[aoueʻ']$/i.test(w) ? w + 'si' : w + 'i';
        }
        function kqSttb(lav: string): string {
            let L = kqLat(lav).trim().replace(/^boshqarma\s+/i, ''); if (!L) return 'STTB';
            if (L.length > 1 && /[a-zʻ']/.test(L.charAt(1))) L = L.charAt(0).toLowerCase() + L.slice(1);
            const w = L.split(/\s+/); w[w.length - 1] = kqIzofa(w[w.length - 1]); return 'STTB ' + w.join(' ');
        }
        function kqLav(lav: string, lbl: string): string {
            if (lbl === 'STTB') return kqSttb(lav);
            const L = kqLat(lav).trim(); if (!lbl) return L.charAt(0).toUpperCase() + L.slice(1);
            if (L.toUpperCase().startsWith(lbl.toUpperCase() + ' ')) return L;
            const m = L.match(/^(boʻlim|bo'lim|bo‘lim|xizmat|sex|sexi|uchastka|depo)\s+(.*)$/i); if (m) return lbl + ' ' + m[2];
            return lbl + ' ' + L.charAt(0).toLowerCase() + L.slice(1);
        }
        function kqPeople(): any[] {
            let A: any[] = []; try { A = K6.allXodims(); } catch (e) { A = []; }
            const T = K6.getShtatTree ? K6.getShtatTree() : null, U = (T && T.units) || [], G = (T && T.groups) || [];
            return A.map((r: any) => { const it = r.item || {}; let u: any = null, g: any = null; try { const p = it.posNo ? T.pos.find((x: any) => x.no === Number(it.posNo)) : null; u = p ? U.find((x: any) => x.id === p.u) : null; g = p && p.g ? G.find((x: any) => x.id === p.g) : null; } catch (e) { u = null; }
                const us = u ? String(u.short || u.name).replace(/^VH$/, 'VX') : '', /* «xizmat» — X bilan: Vagon xizmati = VX */ apparat = /boshqaruv/i.test(us), lbl = g && apparat ? kqAbbr(g.name) : apparat ? 'STTB' : us;
                return { id: String(it.tabel || it.id || it.name), posNo: it.posNo ? Number(it.posNo) : 0, name: String(it.name || ''), lav: String(it.lavozim || ''), lbl: lbl, uid: u ? (apparat && g ? g.id : u.id) : '_', un: u ? (apparat && g ? kqAbbr(g.name) + ' — ' + g.name : us) : 'Boʻlinmaga biriktirilmagan' }; }).filter((x: any) => x.name);
        }
        function kqUnits(P: any[]): any[] { const m: any = {}; P.forEach(x => { m[x.uid] = m[x.uid] || { id: x.uid, n: x.un, c: 0 }; m[x.uid].c++; }); return Object.keys(m).map(k => m[k]).sort((a: any, b: any) => String(a.n).localeCompare(String(b.n))); }
        // Tanlash oynasi: 1) seh / boʻlinma → 2) xodim; lavozim va F.I.Sh. tahrirlanadi
        var KQP: any = { mode: 'azo', P: [] };
        // v4.7: umumiy tanlash oynasi — boshqa hujjatlar ham ishlatadi: agmkPickPerson(sarlavha, cb({l, n}), til)
        function agmkPickPerson(title: string, cb: (p: any) => void, lang?: string): void { KQP.cb = cb; KQP.lang = lang || 'uz'; KQP.title = title; kqPick('cb'); }
        function kqPick(mode: string): void {
            KQP.mode = mode; KQP.pos = null; if (mode !== 'cb') { KQP.cb = null; KQP.lang = 'uz'; } KQP.P = kqPeople(); const E = K6.escapeHtml, U = kqUnits(KQP.P);
            K6.mdl('kqPick', `<div class="px-h"><b>${mode === 'cb' ? E(KQP.title || '👤 Xodimni tanlash') : mode === 'tas' ? '👤 Tasdiqlovchi rahbar' : '➕ Komissiya aʼzosi'}</b><button class="mini-btn" onclick="mdlClose('kqPick')">✕</button></div>
                <label class="kq-l">1. Seh yoki boʻlinma<select id="kqPU" onchange="kqPickU()"><option value="">— tanlang —</option>${U.map((u: any) => `<option value="${E(u.id)}">${E(u.n)} (${u.c})</option>`).join('')}</select></label>
                <label class="kq-l">2. Lavozim (hujjatda shu lavozim yoziladi)<select id="kqPP" onchange="kqPickP()"><option value="">— avval boʻlinmani tanlang —</option></select></label>
                <label class="kq-l">3. Xodim<select id="kqPX" onchange="kqPickX()"><option value="">— avval boʻlinmani tanlang —</option></select></label>
                <div class="nd-tip" id="kqPVb" style="display:none"></div>
                <input id="kqPQ" class="kq-q" placeholder="🔍 yoki familiyani yozing" oninput="kqPickU()">
                <label class="kq-l">Lavozimi (hujjatda shunday yoziladi)<input id="kqPL"></label>
                <label class="kq-l">F.I.Sh. (hujjatda)<input id="kqPN"></label>
                <div class="nv-btns"><button onclick="kqPickOk()">✓ Tanlash</button></div>
                ${KQP.P.length ? '' : '<div class="nd-tip">Xodimlar roʻyxati boʻsh — lavozim va F.I.Sh. ni qoʻlda yozing.</div>'}`, true);
        }
        function kqPickU(): void {
            const E = K6.escapeHtml, u = String((K6.$id('kqPU') || {}).value || ''), q = String((K6.$id('kqPQ') || {}).value || '').trim().toLowerCase();
            const ps = K6.$id('kqPP'); if (ps && ps.dataset.u !== u) { ps.dataset.u = u; KQP.pos = null; const PL = u ? kqPosOf(u) : []; ps.innerHTML = `<option value="">${u ? '— ' + PL.length + ' ta lavozim (ixtiyoriy) —' : '— avval boʻlinmani tanlang —'}</option>` + PL.map((p: any) => `<option value="${p.no}">${E(kqLat(p.name))}</option>`).join(''); }
            const hold = (x: any) => kqPosHolds(x, KQP.pos);
            const L = KQP.P.filter((x: any) => (!u || x.uid === u || (q && !u)) && (!q || (x.name + ' ' + kqLat(x.name, true)).toLowerCase().includes(q))).sort((a: any, b: any) => (+hold(b) - +hold(a)) || a.name.localeCompare(b.name)).slice(0, 400);
            const s = K6.$id('kqPX'); if (s) s.innerHTML = `<option value="">— ${L.length} ta xodim —</option>` + L.map((x: any) => `<option value="${E(x.id)}">${hold(x) ? '✓ ' : ''}${E(kqLat(x.name, true))}${x.lav ? ' — ' + E(kqLat(x.lav)) : ''}</option>`).join('');
        }
        function kqShortRaw(full: string): string { const p = String(full || '').trim().split(/\s+/).filter(Boolean); if (p.length < 2) return p[0] || ''; if (/\./.test(p[1])) return p.join(' '); return p[0] + ' ' + p.slice(1, 3).map(x => x.charAt(0).toUpperCase() + '.').join(''); }
        function kqPickX(): void { const id = String((K6.$id('kqPX') || {}).value || ''), x = KQP.P.find((y: any) => y.id === id); if (!x) return;
            const P = KQP.pos, vb = !!P && !kqPosHolds(x, P), tip = K6.$id('kqPVb');
            if (tip) { tip.style.display = vb ? '' : 'none'; tip.textContent = vb ? '«v.b.» qoʻshildi: tanlangan xodim bu lavozimda emas — vaqtincha bajaruvchi sifatida yoziladi (kerak boʻlmasa, lavozim maydonida oʻchiring).' : ''; }
            if (KQP.lang === 'ru') { // 4.9 b115: ruscha — «Главный инженер УПЖТ»; boshqa xodim — «И.о. главного инженера УПЖТ»
                const own = !P && x.posNo ? kqPosByNo(x.posNo) : null, R = P ? kqRuPos(P) : own ? kqRuPos(own) : '';
                K6.$id('kqPL').value = R ? (vb ? 'И.о. ' + kqRuGen(R) : R) : (P ? (vb ? 'И.о. ' : '') + P.name : x.lav); K6.$id('kqPN').value = kqShortRaw(x.name); return; }
            K6.$id('kqPL').value = P ? kqLav(P.name, kqPosLbl(P)) + (vb ? ' v.b.' : '') : kqLav(x.lav, x.lbl); K6.$id('kqPN').value = kqShort(x.name); }
        // 4.9 b115: lavozim → xodim. Tanlangan lavozimda boshqa lavozimdagi xodim boʻlsa — «v.b.» (vaqtincha bajaruvchi)
        function kqPosUid(p: any): string { const T = K6.getShtatTree ? K6.getShtatTree() : null, u = T && (T.units || []).find((x: any) => x.id === p.u); const ap = !!u && /boshqaruv/i.test(String(u.short || u.name)); return ap && p.g ? p.g : p.u; }
        function kqPosOf(uid: string): any[] { const T = K6.getShtatTree ? K6.getShtatTree() : null; return ((T && T.pos) || []).filter((p: any) => kqPosUid(p) === uid).sort((a: any, b: any) => a.no - b.no); }
        function kqPosLbl(p: any): string {
            const T = K6.getShtatTree ? K6.getShtatTree() : null, u = T && (T.units || []).find((x: any) => x.id === p.u), g = p.g && T ? (T.groups || []).find((x: any) => x.id === p.g) : null;
            const us = u ? String(u.short || u.name).replace(/^VH$/, 'VX') : '', ap = /boshqaruv/i.test(us); return g && ap ? kqAbbr(g.name) : ap ? 'STTB' : us;
        }
        function kqPosHolds(x: any, p: any): boolean { if (!p || !x) return false; if (x.posNo) return x.posNo === p.no; const n = (s: string) => kqLat(s).toLowerCase().replace(/[^a-zа-я0-9]+/g, ''); return !!x.lav && n(x.lav) === n(p.name) && x.uid === kqPosUid(p); }
        // ---- 4.9 b115: ruscha lavozim (bosh kelishik) va «И.о.» uchun qaratqich kelishigi ----
        function kqPosByNo(no: number): any { const T = K6.getShtatTree ? K6.getShtatTree() : null; return ((T && T.pos) || []).find((p: any) => p.no === Number(no)) || null; }
        var KQ_RU_G: any = [[/ishlab chiqarish-texnik/i, 'ПТО'], [/bosh mexanik/i, 'ОГМ'], [/moddiy-texnik/i, 'ОМТС'], [/kadrlar/i, 'отдела кадров'], [/kapital qurilish/i, 'ОКС'], [/iqtisodiy rejalashtirish/i, 'ПЭО'], [/mehnatni tashkil/i, 'ООТиЗ'], [/buxgalteriya/i, 'бухгалтерии']];
        function kqRuUnit(p: any, grp?: boolean): string {
            const T = K6.getShtatTree ? K6.getShtatTree() : null, u = T && (T.units || []).find((x: any) => x.id === p.u), g = p.g && T ? (T.groups || []).find((x: any) => x.id === p.g) : null;
            if (!u || /boshqaruv/i.test(String(u.short || u.name))) { if (grp && g) { const m = KQ_RU_G.find((r: any) => r[0].test(g.name)); if (m) return m[1]; } return 'УПЖТ'; }
            const k = String(u.key || ''); const ru = k.includes('/') ? k.split('/').pop()!.trim() : String(u.short || ''); return ru;
        }
        function kqRuPos(p: any): string {
            if (!p) return ''; const n = kqLat(p.name).toLowerCase().replace(/[ʻʼ’‘`]/g, "'"), U = kqRuUnit(p), G = kqRuUnit(p, true);
            const R: any[] = [
                [/^boshqarma boshlig'i$/, 'Начальник УПЖТ'], [/bosh muhandis o'rinbosari/, 'Заместитель главного инженера ' + U], [/^bosh muhandis$/, 'Главный инженер ' + U],
                [/^bosh mexanik o'rinbosari/, 'Заместитель главного механика ' + U], [/^bosh mexanik$/, 'Главный механик ' + U], [/^bosh energetik/, 'Главный энергетик ' + U], [/^bosh buxgalter$/, 'Главный бухгалтер ' + U],
                [/^bo'lim boshlig'i$/, 'Начальник ' + G], [/sex boshlig'i o'rinbosari|xizmat boshlig'i o'rinbosari|boshliq o'rinbosari/, 'Заместитель начальника ' + U],
                [/^(sex|xizmat) boshlig'i$/, 'Начальник ' + U], [/^karyer boshlig'i$/, 'Начальник ' + U], [/deposi boshlig'i/, 'Начальник депо ' + U], [/^stansiya boshlig'i/, 'Начальник станции ' + U],
                [/^smena boshlig'i$/, 'Начальник смены ' + U], [/uchastka boshlig'i/, 'Начальник участка ' + U], [/^uchastka ustasi$/, 'Мастер участка ' + U], [/^katta yo'l ustasi$/, 'Старший дорожный мастер ' + U],
                [/^yo'l ustasi/, 'Дорожный мастер ' + U], [/^smena ustasi$/, 'Сменный мастер ' + U], [/katta usta$/, 'Старший мастер ' + U], [/^usta$/, 'Мастер ' + U],
                [/^temir yo'l harakat tarkibi i-toifali muhandisi$/, 'Инженер I категории по подвижному составу ' + G], [/^vagon parkini saqlash bo'yicha yetakchi muhandis$/, 'Ведущий инженер по вагонному парку ' + G],
                [/^lokomotivlar i-toifali muhandisi/, 'Инженер I категории по локомотивам ' + G], [/muhandis-mexanik/, 'Инженер-механик I категории ' + G], [/yetakchi muhandis/, 'Ведущий инженер ' + G],
                [/i-toifali muhandis/, 'Инженер I категории ' + G], [/yetakchi iqtisodchi/, 'Ведущий экономист ' + G], [/iqtisodchi/, 'Экономист I категории ' + G], [/yetakchi buxgalter/, 'Ведущий бухгалтер ' + G],
                [/yuriskonsult/, 'Юрисконсульт I категории ' + U]
            ];
            const m = R.find(r => r[0].test(n)); return m ? m[1] : '';
        }
        function kqRuGen(nom: string): string { // «Главный инженер УПЖТ» → «главного инженера УПЖТ» (sifatlar va birinchi ot)
            const A: any = { 'главный': 'главного', 'старший': 'старшего', 'ведущий': 'ведущего', 'дорожный': 'дорожного', 'сменный': 'сменного' };
            const N: any = { 'начальник': 'начальника', 'заместитель': 'заместителя', 'инженер': 'инженера', 'инженер-механик': 'инженера-механика', 'мастер': 'мастера', 'механик': 'механика', 'энергетик': 'энергетика', 'бухгалтер': 'бухгалтера', 'экономист': 'экономиста', 'юрисконсульт': 'юрисконсульта', 'техник': 'техника', 'диспетчер': 'диспетчера', 'слесарь': 'слесаря', 'инспектор': 'инспектора', 'ревизор': 'ревизора' };
            const w = String(nom || '').trim().split(/\s+/); let i = 0;
            while (i < w.length && A[w[i].toLowerCase()]) { w[i] = A[w[i].toLowerCase()]; i++; }
            if (i < w.length && N[w[i].toLowerCase()]) w[i] = N[w[i].toLowerCase()]; else if (i === 0 && w[0]) w[0] = w[0].charAt(0).toLowerCase() + w[0].slice(1);
            return w.join(' ');
        }
        function kqPickP(): void {
            const no = Number((K6.$id('kqPP') || {}).value || 0), T = K6.getShtatTree ? K6.getShtatTree() : null; KQP.pos = no && T ? (T.pos || []).find((p: any) => p.no === no) || null : null;
            kqPickU(); const L = KQP.P.filter((x: any) => kqPosHolds(x, KQP.pos)); const s = K6.$id('kqPX');
            if (L.length === 1 && s) { s.value = L[0].id; kqPickX(); } else if (KQP.pos) { K6.$id('kqPL').value = KQP.lang === 'ru' ? (kqRuPos(KQP.pos) || KQP.pos.name) : kqLav(KQP.pos.name, kqPosLbl(KQP.pos)); const tip = K6.$id('kqPVb'); if (tip) tip.style.display = 'none'; }
        }
        function kqPickOk(): void {
            const l = String((K6.$id('kqPL') || {}).value || '').trim(), n = String((K6.$id('kqPN') || {}).value || '').trim(); if (!l && !n) { K6.alert('Xodimni tanlang yoki lavozim va F.I.Sh. ni yozing.'); return; }
            if (KQP.mode === 'cb') { K6.mdlClose('kqPick'); const cb = KQP.cb; KQP.cb = null; try { if (cb) cb({ l: l, n: n }); } catch (e) { console.error(e); } return; }
            if (KQP.mode === 'tas') KQ.tas = { l: l, n: n }; else { if (KQ.azo.length >= 8) { K6.alert('Eng koʻpi 8 ta aʼzo.'); return; } KQ.azo.push({ l: l, n: n }); }
            K6.mdlClose('kqPick'); kqSave(); kqDraw();
        }
        function kqDel(i: number): void { KQ.azo.splice(i, 1); kqSave(); kqDraw(); }
        function kqUp(i: number): void { if (i <= 0) return; const t = KQ.azo[i]; KQ.azo[i] = KQ.azo[i - 1]; KQ.azo[i - 1] = t; kqSave(); kqDraw(); }
        function kqF(k: string, v: string): void { KQ[k] = v; kqSave(); kqPrevSoon(); }
        var KQ_T: any = 0;
        function kqPrevSoon(): void { clearTimeout(KQ_T); KQ_T = setTimeout(kqPrev, 350); }
        // Uzun lavozim — ikki qatorga (namunadagidek)
        function kqWrap(s: string): string { s = String(s || ''); if (s.length <= 40) return s; const i = s.lastIndexOf(' ', 40); return i > 10 ? s.slice(0, i) + '\n' + s.slice(i + 1) : s; }
        function kqData(): any {
            const o = KQ, y = String(o.sana || '').slice(0, 4) || String(new Date().getFullYear()), d: any = {
                t_lav: o.tas ? o.tas.l : '', t_ism: o.tas ? o.tas.n : '', t_sana: kqSana(o.tsana, y), sana: kqSana(o.sana, y),
                org: o.org, tur: o.tur, marka: o.marka, gost: o.gost, holat: o.holat, soni: String(o.soni || '').replace(/\D/g, '') || '____',
                azolar: o.azo.map((a: any) => (a.l + ' ' + a.n).trim()).join(', ')
            };
            o.azo.forEach((a: any, i: number) => { d['a' + (i + 1) + '_l'] = kqWrap(a.l); d['a' + (i + 1) + '_n'] = a.n; });
            return d;
        }
        // Ishlatilmagan imzo qatorlari shablondan olib tashlanadi
        async function kqTpl(nn?: number): Promise<string> {
            const src = await K6.dxOpenTpl('kolodka'), n = nn == null ? KQ.azo.length : nn; let xml = new TextDecoder().decode(src['word/document.xml']);
            for (let k = n + 1; k <= 8; k++) xml = xml.replace(new RegExp('<w:p\\b[^>]*>(?:(?!<\\/w:p>)[\\s\\S])*?\\{\\{a' + k + '_l\\}\\}[\\s\\S]*?<\\/w:p>'), '');
            K6.DXT.tpl['kolodka_x'] = { name: 'Kolodka qabul dalolatnomasi', b64: '' }; K6.DXT.cache['kolodka_x'] = Object.assign({}, src, { 'word/document.xml': new TextEncoder().encode(xml) });
            return 'kolodka_x';
        }
        async function kqPrev(): Promise<void> { const el = K6.$id('kqPrev'); if (!el || !KQ) return; try { const id = await kqTpl(); await K6.dxPreview(el, id, kqData()); } catch (e) { console.error(e); el.textContent = '⚠️ Koʻrinishni chizib boʻlmadi: ' + String(e); } }
        async function kqOut(kind: string): Promise<void> {
            const o = KQ; if (!String(o.org || '').trim()) { K6.alert('Korxona (yetkazib beruvchi) nomini kiriting.'); return; } if (!/\d/.test(String(o.soni || ''))) { K6.alert('Kolodkalar sonini kiriting.'); return; }
            if (!o.tas) { K6.alert('Tasdiqlovchi rahbarni tanlang.'); return; } if (!o.azo.length) { K6.alert('Kamida bitta komissiya aʼzosini qoʻshing.'); return; }
            kqSave();
            try {
                const id = await kqTpl(), nm = 'Kolodka qabul dalolatnomasi ' + String(o.org).replace(/[«»"']/g, '').trim() + ' ' + String(o.soni).replace(/\D/g, '') + ' dona';
                const R = await K6.dxRender(id, kqData()), b = nm.replace(/[^\p{L}\d]+/gu, '_').replace(/^_+|_+$/g, '').slice(0, 80), files: any[] = [];
                // EXS ga sahifa koʻrinishi (lay) yoziladi — «yuklab olish» oynasida PDF/JPG/Word ga oʻtkazish ishlaydi
                const reg = (blob: any) => { try { if (K6.EXS) K6.EXS.set(blob, { lay: R.lay, title: 'Kolodka qabul dalolatnomasi' }); } catch (e) { /* */ } return blob; };
                if (kind !== 'pdf') files.push({ name: b + '.docx', mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', blob: reg(K6.dxDocxBlob(R.files)) });
                if (kind !== 'docx') { K6.PDFK.f = null; files.push({ name: b + '.pdf', mime: 'application/pdf', blob: reg(K6.pdfBuild(R.lay)) }); }
                if (typeof K6.exOpen === 'function') K6.exOpen(files, { title: 'Kolodka qabul dalolatnomasi', act: 'dl' }); else K6.docDownload(files);
                try { K6.aiLog('Kolodka qabul dalolatnomasi: ' + o.org + ', ' + o.soni + ' dona'); } catch (e) { /* */ }
            } catch (e) { console.error(e); K6.alert('⚠️ ' + (K6.agmkErrUz ? K6.agmkErrUz(e) : String(e))); }
        }
        function kqDraw(): void {
            const E = K6.escapeHtml, o = KQ, b = K6.$id('kqPpl'); if (!b) return;
            b.innerHTML = `<div class="kq-h">TASDIQLOVCHI («Tasdiqlayman» qismi)</div>
                ${o.tas ? `<div class="kq-p"><span><b>${E(o.tas.n)}</b><small>${E(o.tas.l)}</small></span><button class="mini-btn" onclick="kqPick('tas')">✎</button><button class="mini-btn" onclick="kqTasDel()">✕</button></div>` : `<button class="kq-add" onclick="kqPick('tas')">👤 Tasdiqlovchi rahbarni tanlash</button>`}
                <div class="kq-h">KOMISSIYA AʼZOLARI (imzo chekuvchilar)</div>
                ${o.azo.map((a: any, i: number) => `<div class="kq-p"><span><b>${i + 1}. ${E(a.n)}</b><small>${E(a.l)}</small></span>${i ? `<button class="mini-btn" onclick="kqUp(${i})">▲</button>` : ''}<button class="mini-btn" onclick="kqDel(${i})">✕</button></div>`).join('') || '<div class="nd-tip">— hali hech kim qoʻshilmagan</div>'}
                ${o.azo.length < 8 ? `<button class="kq-add" onclick="kqPick('azo')">➕ Komissiya aʼzosini qoʻshish</button>` : ''}`;
            kqPrevSoon();
        }
        // Sana maydoni: yozuvi oʻzbekcha («kk.oo.yyyy»), bosilganda telefon kalendari ochiladi (asl date maydoni koʻrinmas, ustida)
        function kqDmy(iso: string): string { const m = String(iso || '').match(/^(\d{4})-(\d{2})-(\d{2})$/); return m ? m[3] + '.' + m[2] + '.' + m[1] : ''; }
        function kqDateF(k: string, l: string, v: string): string {
            const E = K6.escapeHtml;
            return `<label class="kq-l">${l}<span class="kq-d"><input class="kq-dt" readonly tabindex="-1" value="${E(kqDmy(v))}" placeholder="kk.oo.yyyy"><span class="kq-di">📅</span>${v ? `<button type="button" class="kq-dx" onclick="event.preventDefault();kqDateSet('${k}', '', this)">✕</button>` : ''}<input type="date" class="kq-dn" value="${E(v || '')}" onchange="kqDateSet('${k}', this.value, this)" onclick="try{this.showPicker()}catch(e){}"></span></label>`;
        }
        function kqDateSet(k: string, v: string, el: any): void {
            kqF(k, v); const w = el && el.closest ? el.closest('.kq-d') : null; if (!w) return;
            const t = w.querySelector('.kq-dt'), n = w.querySelector('.kq-dn'); if (t) t.value = kqDmy(v); if (n && n.value !== v) n.value = v;
            const x = w.querySelector('.kq-dx'); if (!v && x) x.remove(); else if (v && !x) w.querySelector('.kq-di').insertAdjacentHTML('afterend', `<button type="button" class="kq-dx" onclick="event.preventDefault();kqDateSet('${k}', '', this)">✕</button>`);
        }
        function kqOpen(): void {
            KQ = kqLoad(); KQ.sana = kqToday(); const E = K6.escapeHtml, o = KQ;
            const f = (k: string, l: string, ph?: string, t?: string) => t === 'date' ? kqDateF(k, l, o[k]) : `<label class="kq-l">${l}<input type="${t || 'text'}" value="${E(o[k] || '')}" placeholder="${E(ph || '')}" oninput="kqF('${k}', this.value)" onchange="kqF('${k}', this.value)"></label>`;
            K6.mdl('kqModal', `<div class="px-h"><b>🛞 Kolodka qabul dalolatnomasi</b><button class="mini-btn" onclick="mdlClose('kqModal')">✕</button></div>
                <div class="kq-f">${f('org', 'Korxona (yetkazib beruvchi)', '«TOP PROJECT» MCHJ')}${f('soni', 'Soni (dona)', '____', 'number')}
                ${f('sana', 'Dalolatnoma sanasi', '', 'date')}${f('tsana', 'Tasdiqlash sanasi (boʻsh — qoʻlda yoziladi)', '', 'date')}
                ${f('marka', 'Marka')}${f('gost', 'Standart')}${f('tur', 'Mahsulot')}${f('holat', 'Koʻrik natijasi')}</div>
                <div id="kqPpl"></div>
                <div class="nv-btns"><button onclick="kqOut('docx')">📝 Word</button><button onclick="kqOut('pdf')">📄 PDF</button><button onclick="kqOut('all')">📦 Word + PDF</button></div>
                <button class="action-btn sg-send kq-sign" onclick="kqSign()">✍️ Imzoga yuborish</button>
                <div id="kqPrev"></div>`, true);
            kqDraw();
        }
        // 4.9 b111: «✍️ Imzoga yuborish» — dalolatnoma imzo chekuvchilarga (komissiya + tasdiqlovchi) shu oynaning oʻzidan yuboriladi.
        //  Hujjat shablon + maʼlumot koʻrinishida ketadi: imzolovchi telefonida ham aynan shu dalolatnoma chiziladi, imzo familiya oldiga tushadi.
        async function kqSign(): Promise<void> {
            const o = KQ; if (!o) return;
            if (!String(o.org || '').trim()) { K6.alert('Korxona (yetkazib beruvchi) nomini kiriting.'); return; } if (!/\d/.test(String(o.soni || ''))) { K6.alert('Kolodkalar sonini kiriting.'); return; }
            if (!o.tas) { K6.alert('Tasdiqlovchi rahbarni tanlang.'); return; } if (!o.azo.length) { K6.alert('Kamida bitta komissiya aʼzosini qoʻshing.'); return; }
            if (typeof K6.sigSendOpen !== 'function' || typeof K6.dxPlainHtml !== 'function') { K6.alert('Imzolash moduli topilmadi.'); return; }
            kqSave();
            try {
                const id = await kqTpl(), data = kqData(), R = await K6.dxRender(id, data);
                const title = 'Kolodka qabul dalolatnomasi — ' + String(o.org).replace(/[«»"']/g, '').trim() + ', ' + String(o.soni).replace(/\D/g, '') + ' dona';
                const html = `<div class="dxt-doc" data-dxt="${K6.escapeHtml(id)}" data-dxd="${K6.escapeHtml(btoa(unescape(encodeURIComponent(JSON.stringify(data)))))}">${K6.dxPlainHtml(R.M)}</div>`;
                await K6.sigSendOpen({ html: html, title: title });
            } catch (e) { console.error(e); K6.alert('⚠️ ' + (K6.agmkErrUz ? K6.agmkErrUz(e) : String(e))); }
        }
        K6.kqSign = kqSign;
        // Imzolovchi telefonida «kolodka_x» shabloni yoʻq — aʼzolar soniga qarab qayta tuziladi
        if (typeof K6.dxFromSigHtml === 'function') K6.dxFromSigHtml = K6.agmkExtend('dxFromSigHtml', '4.9 b111: kolodka dalolatnomasi imzoda', K6.dxFromSigHtml, (o0: Function) => async function (this: unknown, html: string) {
            try {
                const m = /data-dxt="kolodka_x"[^>]*data-dxd="([^"]+)"/.exec(String(html || ''));
                if (m) { const d = JSON.parse(decodeURIComponent(escape(atob(m[1].replace(/&#39;/g, "'").replace(/&amp;/g, '&'))))); let n = 0; for (let k = 1; k <= 8; k++) if (('a' + k + '_l') in d || ('a' + k + '_n') in d) n = k; await kqTpl(n || 1); }
            } catch (e) { console.error(e); }
            return o0.apply(this, arguments);
        });
        function kqTasDel(): void { KQ.tas = null; kqSave(); kqDraw(); }
        Object.assign(K6, { kqRuPos: kqRuPos, kqRuGen: kqRuGen, kqPickP: kqPickP, kqSttb: kqSttb, kqPosHolds: kqPosHolds, agmkPickPerson: agmkPickPerson, kqDateSet: kqDateSet, kqTasDel: kqTasDel, kqPick: kqPick, kqPickU: kqPickU, kqPickX: kqPickX, kqPickOk: kqPickOk, kqDel: kqDel, kqUp: kqUp, kqF: kqF, kqSave: kqSave, kqDraw: kqDraw });
        K6.kqOpen = kqOpen; K6.kqOut = kqOut; K6.kqPrev = kqPrev;
        (function () {
            const st = document.createElement('style');
            st.textContent = '.kq-h{margin:12px 0 6px;font-size:12px;font-weight:700;letter-spacing:.5px;opacity:.8}.kq-p{display:flex;align-items:center;gap:6px;padding:8px 10px;margin:4px 0;border-radius:10px;background:rgba(128,128,128,.15)}.kq-p span{flex:1;display:flex;flex-direction:column}.kq-p small{opacity:.8}.kq-add{width:100%;margin:6px 0;padding:12px;border-radius:12px;border:1px dashed rgba(128,128,128,.6);background:transparent;color:inherit;font:inherit;cursor:pointer}.kq-q{width:100%;margin:6px 0;padding:8px;border-radius:8px;border:1px solid rgba(128,128,128,.4);background:transparent;color:inherit;font:inherit;box-sizing:border-box}.kq-l select{font:inherit;padding:8px;border-radius:8px;background:transparent;color:inherit;border:1px solid rgba(128,128,128,.4)}.kq-l select option{color:#111}.kq-d{position:relative;display:flex;align-items:center}.kq-d .kq-dt{flex:1;width:100%;box-sizing:border-box;padding-right:64px!important}.kq-di{position:absolute;right:12px;pointer-events:none}.kq-dn{position:absolute;inset:0;width:100%;height:100%;opacity:0;cursor:pointer;z-index:1}.kq-dx{position:absolute;right:40px;z-index:2;background:none;border:0;color:inherit;font-size:16px;cursor:pointer;padding:4px}.kq-f{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:8px 12px;margin:8px 0}.kq-l{display:flex;flex-direction:column;gap:4px;font-size:13px;opacity:.95}.kq-l input,.kq-l textarea{font:inherit;padding:8px;border-radius:8px;border:1px solid rgba(128,128,128,.4);background:transparent;color:inherit}.kq-l:has(textarea){grid-column:1/-1}.kq-prev{margin-top:10px;padding:16px;background:#fff;color:#111;border-radius:8px;font-family:"Times New Roman",serif;font-size:14px;line-height:1.45}.kq-prev table td{padding:4px 6px}.kq-cat{display:flex;flex-direction:column;gap:6px;margin:10px 0;padding:16px 18px;border-radius:16px;background:linear-gradient(135deg,#b45309,#d97706);color:#fff;cursor:pointer;box-shadow:0 4px 14px rgba(0,0,0,.3)}.kq-cat b{font-size:18px}.kq-cat span{font-size:13px;opacity:.95}';
            document.head.appendChild(st);
            if (typeof K6.hsRender !== 'function') return;
            K6.hsRender = K6.agmkExtend('hsRender', 'v4.6: Kolodka qabul dalolatnomasi kartasi', K6.hsRender, (o: any) => function (this: any) {
                const r = o.apply(this, arguments);
                try { if (K6.HS.tab === 'akt' && K6.HS.akt === 'kolodka') { const b = K6.secBody('screen-hisob'); if (b && !b.querySelector('#kqCat')) { const h = b.querySelector('.hs-h, h3, .hs-list, .hs-empty'); const html = `<div id="kqCat" class="kq-cat" onclick="kqOpen()"><b>🛞 Qabul qilish toʻgʻrisida dalolatnoma</b><span>Yetkazib beruvchidan (masalan «TOP PROJECT») qabul qilingan kolodkalar — korxona nomi va sonini yozing → Word / PDF</span></div>`; const first = b.querySelector('.hs-new'); if (first) first.insertAdjacentHTML('beforebegin', html); else if (h) h.insertAdjacentHTML('afterend', html); else b.insertAdjacentHTML('afterbegin', html); } } } catch (e) { console.error(e); }
                // (v4.6 b101) bosh sahifadagi karta olib tashlandi — tugma faqat «Tormoz kolodkalari» ichida
                return r;
            });
        })();
