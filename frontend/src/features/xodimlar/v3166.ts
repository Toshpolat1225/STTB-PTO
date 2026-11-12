        // =====================================================================
        // v3.16.6 — xodimlarning yangi roʻyxati (1C, 13.10.2026) va 🦺 mehnat muhofazasi qoʻshimchalari
        //  XODIMLAR
        //  • Ilova ichidagi roʻyxatlar yangilandi: ITR 308 (shtat lavozimi bilan), ishchilar 2 249 (sex › uchastka)
        //  • Shaxsiy maʼlumotlar (tugʻilgan sana, millati, maʼlumoti, holati, afgʻon faxriysi) APK ichida EMAS:
        //    kadrlar yoki administrator 1C faylini ilovaga yuklaydi → serverga yoziladi → server ularni faqat
        //    kadrlar, rahbarlar, administrator va xodimning oʻziga beradi (passport — serverdagi maxfiy maydon)
        //  • Pasportda: millati, maʼlumoti, holati, yubiley, afgʻon faxriysi (faqat ruxsati borlarga)
        //  MEHNAT MUHOFAZASI
        //  1) «📚 NHH va yoʻriqnomalar»: normativ-huquqiy hujjatlar, yoʻriqnomalar, instruksiyalar — fayli bilan
        //  2) Koʻrish — barcha rahbarlar; tahrirlash — strukturadagi TB xodimlari va administrator
        //  3) Muddat eslatmalari: xodimning oʻziga, sex rahbariyati va uchastka ustasiga, TB xodimlariga
        //  4) «📅 Yillik jadval»: bilimlar sinovi jadvali (avvalgi · reja · haqiqatda · imzo · izoh), PDF va Excel
        //  5) Hujjat amal qilish muddati tugashiga 30 kun qolganda — TB xodimlariga bildirishnoma
        //  Bilimlar sinovi: barcha MTX — yiliga bir marta (STTB bosh muhandisi tasdiqlagan jadval boʻyicha)
        // =====================================================================

        /** 1C roʻyxatidagi bitta qator (import paytida) */
        interface V6Row { t: string; n: string; bo: string; sex: string; l: string; itr: boolean; raz: number | null; tug: string; mil: string; mal: string; qabul: string; holat: string; afg: boolean; u: any }
        /** NHH / yoʻriqnoma fayli */
        interface V6File { id: string; name: string; mime: string; size: number; srv?: string; up: string }
        /** NHH / yoʻriqnoma yozuvi (kv: agmk_mm_nhh_v1) */
        interface V6Doc { id: string; kind: string; code: string; t: string; from: string; to: string; note: string; files: V6File[]; by: string; byT: string; at: string; del?: boolean; src?: string }
        /** Yillik jadval qatori */
        interface V6JRow { name: string; lav: string; prev: string; plan: string; fact: string; imzo: string; izoh: string }

        const V6: any = window as any; // eski global funksiyalar (turlanmagan) — shu chegarada
        var V6_VER = '2026-10-13';
        var V6_NHH_KEY = 'agmk_mm_nhh_v1', V6_JCFG_KEY = 'agmk_mm_jad_cfg';
        try { if (V6.KV_SYNC) ['agmk_mm_nhh_v1', 'agmk_mm_jad_cfg'].forEach(k => { if (!V6.KV_SYNC.keys.includes(k)) V6.KV_SYNC.keys.push(k); }); } catch (e) { }

        function v6E(s: unknown): string { return V6.escapeHtml(s === null || s === undefined ? '' : String(s)); }
        function v6Cyr(s: string): boolean { return /[а-яё]/i.test(s || ''); }
        function v6P2(n: number): string { return String(n).padStart(2, '0'); }
        /** «dd.mm.yyyy», Excel sana raqami yoki Date → «yyyy-mm-dd» */
        function v6Iso(v: unknown): string {
            if (v === null || v === undefined || v === '') return '';
            if (v instanceof Date && !isNaN(v.getTime())) return v.getFullYear() + '-' + v6P2(v.getMonth() + 1) + '-' + v6P2(v.getDate());
            if (typeof v === 'number' && v > 1000 && v < 80000) { const d = new Date(Math.round((v - 25569) * 86400000)); return d.getUTCFullYear() + '-' + v6P2(d.getUTCMonth() + 1) + '-' + v6P2(d.getUTCDate()); }
            const s = String(v).trim(); let m = s.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})/); if (m) return m[3] + '-' + v6P2(+m[2]) + '-' + v6P2(+m[1]);
            m = s.match(/^(\d{4})-(\d{2})-(\d{2})/); return m ? m[0] : '';
        }
        function v6AddDays(iso: string, n: number): string { const d = new Date(iso + 'T00:00:00'); if (isNaN(d.getTime())) return ''; d.setDate(d.getDate() + n); return d.getFullYear() + '-' + v6P2(d.getMonth() + 1) + '-' + v6P2(d.getDate()); }

        var V6_HOLAT: Record<string, string> = { 'работает': 'Ishlaydi', 'отпуск основной': 'Asosiy taʼtil', 'дополнительный отпуск': 'Qoʻshimcha taʼtil', 'отпуск по уходу за ребенком': 'Bola parvarishi taʼtili', 'отпуск учебный оплачиваемый': 'Oʻquv taʼtili', 'отпуск по беременности и родам': 'Homiladorlik va tugʻish taʼtili', 'отпуск неоплачиваемый по разрешению работодателя': 'Haq toʻlanmaydigan taʼtil' };
        function v6Holat(s: string): string { const k = String(s || '').trim().toLowerCase(); return V6_HOLAT[k] || String(s || '').trim(); }
        function v6Malumot(s: string): string {
            const k = String(s || '').toLowerCase();
            if (/магистр|специалитет/.test(k)) return 'Oliy (magistratura)'; if (/бакалавр/.test(k)) return 'Oliy (bakalavriat)'; if (/высш/.test(k)) return 'Oliy';
            if (/колледж|техникум|профессион|специальн/.test(k)) return 'Oʻrta maxsus'; if (/средн/.test(k)) return 'Oʻrta'; return String(s || '').trim();
        }
        var V6_MILLAT: Array<[RegExp, string]> = [[/o.?zbek|узбек/, 'Oʻzbek'], [/кр[ыи]м/, 'Qrim tatari'], [/tatar|татар/, 'Tatar'], [/^rus|русск/, 'Rus'], [/казах|qozoq|qozox/, 'Qozoq'], [/tojik|таджик/, 'Tojik'], [/корей|koreys/, 'Koreys'], [/турк|turk/, 'Turk'], [/башкир/, 'Boshqird'], [/украин/, 'Ukrain'], [/киргиз|кыргыз/, 'Qirgʻiz'], [/азербайдж/, 'Ozarbayjon'], [/курд/, 'Kurd'], [/немц|немец/, 'Nemis'], [/каракалпак/, 'Qoraqalpoq'], [/уйгур/, 'Uygʻur']];
        function v6Millat(s: string): string { const k = String(s || '').trim().toLowerCase(); if (!k) return ''; const f = V6_MILLAT.find(x => x[0].test(k)); return f ? f[1] : k.charAt(0).toUpperCase() + k.slice(1); }

        /** 1C ierarxiyasi (yuqori boʻlinma + sex/uchastka) → ilovadagi boʻlinma */
        function v6UnitShort(bo: string, sex: string): string {
            let b = String(bo || '').toLowerCase(); const s = String(sex || '').toLowerCase();
            if (/^управление промышленного/.test(b)) b = s;
            if (/ждц-1/.test(b)) return '1-TYS';
            if (/ждц-2/.test(b) || (/ремонту подвижного состава/.test(b) && !/ждц/.test(b))) return '2-TYS';
            if (/ждц-3/.test(b) || /депо по ремонту локомотивов/.test(b)) return '3-TYS';
            if (/ждц-4/.test(b)) return '4-TYS';
            if (/карьер/.test(b)) return 'NQMK';
            if (/сигнализации|кальмакырский/.test(b)) return 'SMBvaAX';
            if (/энергоснабжения|контактной сети|инженерных коммуникаций/.test(b)) return 'ET';
            if (/подъ[её]мно/.test(b)) return 'KTUX';
            if (/вагонная/.test(b)) return 'VX'; // v4.7: Vagonlar xizmati — VX
            if (/хозяйственная/.test(b)) return 'MXQ';
            if (/внутренней охраны/.test(b)) return 'IQX';
            if (/автоматизации/.test(b)) return 'TJABTX';
            if (/упжт/.test(b)) return 'Boshqaruv apparati';
            return '';
        }
        function v6Unit(bo: string, sex: string): any {
            const sh = v6UnitShort(bo, sex), T: any = shtatTree as any;
            if (sh && T && T.units) { const u = T.units.find((x: any) => x.short === sh); if (u) return u; }
            try { return V6.stImpUnit(bo); } catch (e) { return null; }
        }

        // ---------- kim kim ----------
        function v6MeItem(): any { try { return V6.xodimByTabel(V6.meTabel()); } catch (e) { return null; } }
        /** Strukturadagi TB (mehnat muhofazasi, texnika va harakat xavfsizligi) xodimi */
        function v6IsTb(it: any): boolean {
            if (!it) return false;
            return /охраны труда|техники безопасности/i.test(String(it.uchastka1c || '')) || /mehnat muhofazasi|texnika xavfsizligi|harakat xavfsizligi|sanoat xavfsizligi/i.test(String(it.lavozim || ''));
        }
        function v6IsHead(it: any): boolean { return !!it && it.toifa === 'V'; }
        function v6IsUsta(it: any): boolean { return !!it && /\busta(si)?\b/i.test(String(it.lavozim || '')); }
        function v6SuOf(it: any): string { try { const r = V6.findXodimsByTabel(it.tabel)[0]; return r ? r.su : (it.seh || ''); } catch (e) { return it.seh || ''; } }

        // ---------- 2) huquqlar ----------
        if (typeof V6.canMMEdit === 'function') V6.canMMEdit = V6.agmkExtend('canMMEdit', 'v3.16.6: TB xodimlari tahrirlaydi', V6.canMMEdit, (o: Function) => function (this: unknown, ...a: unknown[]) { if (o.apply(this, a)) return true; try { return v6IsTb(v6MeItem()); } catch (e) { return false; } });
        if (typeof V6.canMMView === 'function') V6.canMMView = V6.agmkExtend('canMMView', 'v3.16.6: barcha rahbarlar koʻradi', V6.canMMView, (o: Function) => function (this: unknown, ...a: unknown[]) {
            if (o.apply(this, a)) return true;
            try { if (V6.canMMEdit()) return true; const it = v6MeItem(); return v6IsHead(it) || v6IsUsta(it) || (typeof V6.isRahbar === 'function' && V6.isRahbar()); } catch (e) { return false; }
        });
        // Bilimlar sinovi: barcha MTX — yiliga bir marta
        try { V6.MM_RULES.bilim.m = () => 12; V6.MM_RULES.bilim.src = () => 'Bilimlar sinovi jadvali (STTB bosh muhandisi tasdiqlagan): barcha MTX — yiliga bir marta'; } catch (e) { }
        // Ishdan ketganlar nazorat roʻyxatiga kirmaydi
        if (typeof V6.mmPeople === 'function') V6.mmPeople = V6.agmkExtend('mmPeople', 'v3.16.6: 1C roʻyxatida yoʻqlar chiqmaydi', V6.mmPeople, (o: Function) => function (this: unknown, ...a: unknown[]) { const L = o.apply(this, a); try { return (L || []).filter((r: any) => !r.item.ketgan1c); } catch (e) { return L; } });

        // ---------- yangi roʻyxat: ITR va ishchilar (APK dagi shaxsiy boʻlmagan qism) ----------
        function v6RosterPost(): void {
            const R: any[] = V6.ROSTER || []; if (R.length < 100) return;
            const set = new Set(R.map(x => V6.cleanTabel(x[0])).filter(Boolean)); let ch = 0;
            R.forEach(x => { const it = V6.xodimByTabel(x[0]); if (it && x[8] && it.uchastka1c !== x[8]) { it.uchastka1c = x[8]; ch++; } });
            // Endi ITR roʻyxatida yoʻq (ishchiga oʻtgan yoki ishdan ketgan) — eski shtat belgisi olib tashlanadi
            V6.allXodims().forEach((r: any) => { const it = r.item, t = V6.cleanTabel(it.tabel); if (it.roster && it.roster !== V6.ROSTER_V && t && !set.has(t)) { delete it.roster; delete it.rosterIzoh; delete it.posNo; ch++; } });
            if (ch) V6.saveDB(false);
        }
        function v6WrkPost(): void {
            const W = V6.WRK_SEED, R: any[] = V6.ROSTER || []; if (!W || !Array.isArray(W.rows) || W.rows.length < 1000 || R.length < 100) return;
            if (localStorage.getItem('agmk_wrk_seed') !== W.v || localStorage.getItem('agmk_v6_post') === W.v) return; // avval ishchilar roʻyxati joylansin
            const all = new Set<string>(); let ch = 0;
            R.forEach(x => { const t = V6.cleanTabel(x[0]); if (t) all.add(t); });
            W.rows.forEach((x: any[]) => { const t = V6.cleanTabel(x[0]); all.add(t); const it = V6.xodimByTabel(t); if (it && x[4] && it.uchastka1c !== x[4]) { it.uchastka1c = x[4]; ch++; } });
            V6.allXodims().forEach((r: any) => { const it = r.item, t = V6.cleanTabel(it.tabel); if (!t || !/^\d+$/.test(t)) return; if (!all.has(t)) { if (!it.ketgan1c) { it.ketgan1c = V6_VER; ch++; } } else if (it.ketgan1c) { delete it.ketgan1c; ch++; } });
            if (ch) V6.saveDB(false);
            try { localStorage.setItem('agmk_v6_post', W.v); } catch (e) { }
        }
        if (typeof V6.rosterApply === 'function') V6.rosterApply = V6.agmkExtend('rosterApply', 'v3.16.6: yangi ITR roʻyxati', V6.rosterApply, (o: Function) => function (this: unknown, ...a: unknown[]) { const r = o.apply(this, a); try { if (r) v6RosterPost(); } catch (e) { console.error('v3.16.6 roster', e); } return r; });
        if (typeof V6.wrkSeedApply === 'function') V6.wrkSeedApply = V6.agmkExtend('wrkSeedApply', 'v3.16.6: uchastka va roʻyxatda yoʻqlar', V6.wrkSeedApply, (o: Function) => function (this: unknown, ...a: unknown[]) { const r = o.apply(this, a); try { v6WrkPost(); } catch (e) { console.error('v3.16.6 wrk', e); } return r; });

        // ---------- 1C faylini import qilish (shaxsiy maʼlumot bilan) ----------
        var V6IMP: { rows: V6Row[]; file: string; gone: number } | null = null;
        function v6Hdr(r: unknown[]): Record<string, number> | null {
            const s = r.map(x => String(x === null || x === undefined ? '' : x).toLowerCase().replace(/[ʻʼ'`’‘]/g, ''));
            const f = (re: RegExp) => s.findIndex(x => re.test(x));
            const h: Record<string, number> = { t: f(/tabel/), n: f(/f\.?\s*i\.?\s*sh|familiya|ф\.?\s*и\.?\s*о/), bo: f(/bolinma|подраздел/), sex: f(/uchast|sex|цех/), l: f(/lavozim|должн/), toifa: f(/toifa|категор/), raz: f(/razryad|разряд/), tug: f(/tugil|рожд/), mil: f(/millat|национ/), mal: f(/malumot|образов/), qab: f(/qabul|приня/), hol: f(/holat|состоян/), afg: f(/афган|авган|afgon|afg/) };
            if (h.sex === h.bo) h.sex = -1;
            return h.t >= 0 && h.n >= 0 && h.l >= 0 && (h.tug >= 0 || h.mil >= 0 || h.hol >= 0) ? h : null;
        }
        async function v6ImpTry(inp: any): Promise<boolean> {
            const f = inp && inp.files && inp.files[0]; if (!f) return false;
            const book = V6.narReadBookBs(V6.narBinStr(await f.arrayBuffer())); const rows: V6Row[] = [], bad: string[] = [];
            let found = false;
            (book || []).forEach((sh: any) => {
                let H: Record<string, number> | null = null;
                (sh.rows || []).forEach((r: unknown[]) => {
                    if (!H) { H = v6Hdr(r); if (H) found = true; return; }
                    const g = (k: string): any => { const i = (H as Record<string, number>)[k]; return i >= 0 ? r[i] : ''; };
                    const t = V6.cleanTabel(g('t')); if (!t || !/\d/.test(t)) return;
                    const bo = String(g('bo') || '').replace(/\s+/g, ' ').trim(), sex = String(g('sex') || '').replace(/\s+/g, ' ').trim();
                    const toifa = String(g('toifa') || '').trim(), l0 = String(g('l') || '').replace(/\s+/g, ' ').trim();
                    const itr = /руковод|специал|служащ|rahbar|mutaxassis|xizmatchi/i.test(toifa) || (!toifa && /экономист|iqtisodchi/i.test(l0));
                    const u = v6Unit(bo, sex), n = V6.stImpName(String(g('n') || ''));
                    if (!u) { bad.push(n + ' (' + t + '): boʻlinma topilmadi «' + bo + '»'); return; }
                    const ex = V6.xodimByTabel(t); let l = l0.replace(/^Т(?=[a-zʻ])/, 'T');
                    if (v6Cyr(l) && ex && ex.lavozim && !v6Cyr(ex.lavozim)) l = ex.lavozim;
                    const rz = parseInt(String(g('raz') || ''), 10);
                    rows.push({ t: t, n: n, bo: bo, sex: sex, l: l, itr: itr, raz: isNaN(rz) ? null : rz, tug: v6Iso(g('tug')), mil: v6Millat(String(g('mil') || '')), mal: v6Malumot(String(g('mal') || '')), qabul: v6Iso(g('qab')), holat: v6Holat(String(g('hol') || '')), afg: /^(да|ha|yes|bor)/i.test(String(g('afg') || '').trim()), u: u });
                });
            });
            if (!found) return false; // 1C shakli emas — oddiy import
            const box = V6.$id('stImpR'); if (!box) return true;
            if (!rows.length) { box.innerHTML = '<div class="nd-tip">⚠️ Xodimlar topilmadi.</div>'; return true; }
            const inFile = new Set(rows.map(x => x.t)); let gone = 0;
            V6.allXodims().forEach((r: any) => { const t = V6.cleanTabel(r.item.tabel); if (t && /^\d+$/.test(t) && !inFile.has(t) && !r.item.ketgan1c) gone++; });
            const nI = rows.filter(x => x.itr).length, nNew = rows.filter(x => !V6.xodimByTabel(x.t)).length, nPd = rows.filter(x => x.tug || x.mil || x.mal).length;
            V6IMP = { rows: rows, file: f.name, gone: rows.length > 1000 ? gone : 0 };
            box.innerHTML = `<div class="st-inf"><div><small>Jami</small><b>${rows.length}</b></div><div><small>ITR</small><b>${nI}</b></div><div><small>Ishchi</small><b>${rows.length - nI}</b></div><div><small>Yangi</small><b>${nNew}</b></div><div><small>Shaxsiy maʼlumot</small><b>${nPd}</b></div></div>
                <div class="nd-tip">📋 <b>1C roʻyxati</b> aniqlandi. Ishchilar sex › kasbga joylanadi, ITR lavozimiga tegilmaydi. Tugʻilgan sana, millati, maʼlumoti, ishga qabul sanasi va holati pasportga yoziladi — ularni faqat kadrlar, rahbarlar, administrator va xodimning oʻzi koʻradi.${V6IMP.gone ? `<br>ℹ️ Ilovada bor, faylda yoʻq: <b>${V6IMP.gone}</b> ta — «1C roʻyxatida yoʻq» deb belgilanadi (oʻchirilmaydi).` : ''}</div>
                ${!V6.isPriv() ? '<div class="nd-tip">⚠️ Shaxsiy maʼlumotlarni serverga faqat kadrlar, rahbar yoki administrator yoza oladi.</div>' : ''}
                ${bad.length ? `<div class="nd-tip">⚠️ Olinmaydi (${bad.length}):<br>${bad.slice(0, 15).map(v6E).join('<br>')}</div>` : ''}
                <button class="action-btn" onclick="v6ImpDo()">✅ Joylash va pasportlarga yozish</button>`;
            return true;
        }
        function v6ImpDo(): void {
            const P = V6IMP; if (!P || !V6.stEdit()) return;
            // 1) ishchilar — mavjud import orqali (sex › kasb)
            const out = P.rows.filter(x => !x.itr).map(x => ({ t: x.t, n: x.n, l: x.l, z: '', u: x.u, g: null, gs: '', r: x.raz, c: 0, skip: false, ex: false }));
            out.forEach(x => { const f = V6.findXodimsByTabel(x.t)[0]; const p = f && f.item.posNo ? (posByNo as any)(f.item.posNo) : null; x.skip = !!(f && (f.item.roster || (p && !(stIsW as any)(p)))); x.ex = !!f; });
            V6.ST_IMP = out; try { V6.stImpDo(); } catch (e) { console.error(e); }
            // 2) hamma uchun: shaxsiy maʼlumot (serverda faqat vakolatlilarga), uchastka
            const today = V6.todayISO(); let pd = 0, gone = 0;
            P.rows.forEach(x => {
                const it = V6.xodimByTabel(x.t); if (!it) return;
                if (x.tug) { it.birthDate = x.tug; it.yil = parseInt(x.tug.slice(0, 4), 10); }
                if (x.qabul) it.kirganSana = x.qabul;
                if (x.raz && !it.razryad) it.razryad = x.raz;
                it.passport = Object.assign({}, it.passport || {}, { millat: x.mil, malumot: x.mal, holat: x.holat, afgon: x.afg, src: '1C', at: today });
                if (x.sex) it.uchastka1c = x.sex; delete it.ketgan1c; pd++;
            });
            if (P.gone) { const inFile = new Set(P.rows.map(x => x.t)); V6.allXodims().forEach((r: any) => { const t = V6.cleanTabel(r.item.tabel); if (t && /^\d+$/.test(t) && !inFile.has(t) && !r.item.ketgan1c) { r.item.ketgan1c = today; gone++; } }); }
            V6.saveDB(false); V6IMP = null;
            try { V6.mdlClose('stMdl'); } catch (e) { }
            V6.showToast('✅ 1C roʻyxati: ' + pd + ' ta pasport yangilandi' + (gone ? ', ' + gone + ' ta «roʻyxatda yoʻq»' : ''));
            try { V6.audLog && V6.audLog('xodim', '1C roʻyxati import qilindi: ' + P.file + ' — ' + pd + ' ta'); } catch (e) { }
        }
        if (typeof V6.stImpFile === 'function') V6.stImpFile = V6.agmkExtend('stImpFile', 'v3.16.6: 1C roʻyxati (shaxsiy maʼlumot bilan)', V6.stImpFile, (o: Function) => async function (this: unknown, inp: any) {
            try { if (await v6ImpTry(inp)) return; } catch (e) { const b = V6.$id('stImpR'); if (b) b.innerHTML = '<div class="nd-tip">⚠️ ' + v6E((e as Error).message) + '</div>'; return; }
            return o.call(this, inp);
        });

        // ---------- pasport: 1C maʼlumotlari ----------
        function v6NextJub(birth: string): { age: number; date: string } | null {
            const m = String(birth || '').match(/^(\d{4})-(\d{2})-(\d{2})$/); if (!m) return null;
            const y = new Date().getFullYear(), age = y - +m[1]; const d = y + '-' + m[2] + '-' + m[3];
            if (d < V6.todayISO()) return null; // bu yilgi tugʻilgan kun oʻtib ketgan
            return age > 0 && age % 5 === 0 ? { age: age, date: d } : null;
        }
        function v6Pasport(): void {
            if (currentSectionType !== 'xodim') return;
            const item = V6.getActiveItem(), grid = V6.$id('item-passport-grid'); if (!item || !grid) return;
            grid.querySelectorAll('.v6-pd').forEach((x: Element) => x.remove());
            const row = (lb: string, v: string, full?: boolean) => `<div class="v6-pd"${full ? ' style="grid-column: 1 / -1;"' : ''}>${lb}: <span>${v}</span></div>`;
            let h = '';
            if (item.ketgan1c && V6.isPriv()) h += row('⚠️ 1C ROʻYXATI', 'Roʻyxatda yoʻq (' + v6E(V6.fmtD(item.ketgan1c)) + ') — ishdan ketgan yoki oʻtkazilgan boʻlishi mumkin', true);
            if (V6.canSeePrivate(item)) {
                const p = item.passport || {};
                if (p.millat) h += row('MILLATI', v6E(p.millat));
                if (p.malumot) h += row('MAʼLUMOTI', v6E(p.malumot));
                if (p.holat) h += row('HOLATI', (p.holat === 'Ishlaydi' ? '🟢 ' : '🟡 ') + v6E(p.holat));
                const j = v6NextJub(item.birthDate); if (j) h += row('🎉 YUBILEY', j.age + ' yosh — ' + v6E(V6.fmtD(j.date)));
                if (p.afgon) h += row('AFGʻON URUSHI FAXRIYSI', 'Ha');
                if (item.uchastka1c) h += row('UCHASTKA (1C)', v6E(item.uchastka1c), true);
            }
            if (h) grid.insertAdjacentHTML('beforeend', h);
        }
        if (typeof V6.openItemPasport === 'function') V6.openItemPasport = V6.agmkExtend('openItemPasport', 'v3.16.6: pasportda 1C maʼlumotlari', V6.openItemPasport, (o: Function) => function (this: unknown, ...a: unknown[]) { const r = o.apply(this, a); try { v6Pasport(); } catch (e) { console.error('v3.16.6 pasport', e); } return r; });

        // ---------- 1) 📚 NHH va yoʻriqnomalar ----------
        var V6_KINDS: Array<[string, string]> = [['nhh', '⚖️ Normativ-huquqiy hujjat'], ['yor', '📑 Yoʻriqnoma'], ['ins', '📘 Instruksiya'], ['boshqa', '📄 Boshqa hujjat']];
        var V6N = { q: '', k: '', st: '' };
        function v6KindName(k: string): string { const f = V6_KINDS.find(x => x[0] === k); return f ? f[1] : k; }
        function v6Docs(): V6Doc[] { const d = V6.kvGet(V6_NHH_KEY, null); return d && Array.isArray(d.l) ? d.l : []; }
        function v6DocsSave(l: V6Doc[]): void { V6.kvSet(V6_NHH_KEY, { v: 1, l: l }); }
        /** Hammasi: qoʻshilgan hujjatlar + skanerdan olingan yoʻriqnomalar roʻyxati + qoʻlda kiritilganlar + ichki standartlar */
        function v6DocsAll(): V6Doc[] {
            const out: V6Doc[] = v6Docs().filter(x => !x.del);
            const seen = new Set(out.map(x => V6.normTxt(x.code || '')).filter(Boolean));
            const add = (x: any, src: string) => { const c = V6.normTxt(x.code || ''); if (c && seen.has(c)) return; seen.add(c); out.push({ id: src + ':' + (x.id || x.code), kind: 'yor', code: x.code || '', t: 'Yoʻriqnoma: ' + (x.t || ''), from: x.from || '', to: x.to || '', note: '', files: [], by: '', byT: '', at: '', src: src }); };
            try { (V6.MM_INSTR || []).forEach((x: any) => add(x, 'scan')); } catch (e) { }
            try { (V6.mmData().instr || []).forEach((x: any) => add(x, 'mm')); } catch (e) { }
            try { (V6.ND_BUILTIN || []).filter((d: any) => d.cat === 'mm').forEach((d: any) => out.push({ id: 'nd:' + d.id, kind: 'nhh', code: d.code || '', t: (d.title && d.title.uz) || d.short || d.code, from: '', to: '', note: 'ichki hujjat (ilovada matni bor)', files: [], by: '', byT: '', at: '', src: 'nd' })); } catch (e) { }
            return out;
        }
        function v6DocSt(x: V6Doc): string { const l = x.to ? V6.daysTo(x.to) : null; return l === null ? 'no' : l < 0 ? 'bad' : l <= 30 ? 'warn' : 'ok'; }
        function v6NhhHtml(): string {
            const ed = V6.canMMEdit(), q = V6.normTxt(V6N.q || '');
            const all = v6DocsAll(), cnt = { bad: 0, warn: 0 };
            all.forEach(x => { const s = v6DocSt(x); if (s === 'bad') cnt.bad++; else if (s === 'warn') cnt.warn++; });
            let l = all.filter(x => (!V6N.k || x.kind === V6N.k) && (!q || V6.normTxt([x.code, x.t, x.note].join(' ')).includes(q)) && (!V6N.st || v6DocSt(x) === V6N.st));
            const pr = (x: V6Doc) => ({ bad: 0, warn: 1, ok: 2, no: 3 } as Record<string, number>)[v6DocSt(x)];
            l.sort((a, b) => pr(a) - pr(b) || String(a.to || '9999').localeCompare(String(b.to || '9999')) || String(a.t).localeCompare(String(b.t)));
            const chip = (k: string, n: number, t: string, c: string) => `<i class="${c} ${V6N.st === k ? 'on' : ''}" onclick="V6N.st=V6N.st==='${k}'?'':'${k}'; mmRender()"><b>${n}</b>${t}</i>`;
            return `<div class="mm-sum">${chip('bad', cnt.bad, 'muddati tugagan', 'bad')}${chip('warn', cnt.warn, '30 kun ichida tugaydi', 'warn')}<i class="ok"><b>${all.length}</b>hujjat</i></div>
                <div class="mm-flt"><input class="search-box" placeholder="🔎 Nomi, raqami..." value="${v6E(V6N.q)}" oninput="V6N.q=this.value; clearTimeout(V6N.tm); V6N.tm=setTimeout(mmRender,250)"><select onchange="V6N.k=this.value; mmRender()"><option value="">Barcha turlar</option>${V6_KINDS.map(k => `<option value="${k[0]}" ${V6N.k === k[0] ? 'selected' : ''}>${k[1]}</option>`).join('')}</select></div>
                ${ed ? '<div class="mm-tools"><button class="action-btn" onclick="v6DocForm()">➕ Hujjat qoʻshish</button></div>' : ''}
                <div class="nd-tip">TB ga oid normativ-huquqiy hujjatlar, yoʻriqnomalar va instruksiyalar. Koʻrish — barcha rahbarlar, qoʻshish va tahrirlash — TB xodimlari va administrator. Amal qilish muddati tugashiga <b>30 kun</b> qolganda TB xodimlariga bildirishnoma keladi.</div>
                ${l.map(x => { const s = v6DocSt(x), left = x.to ? V6.daysTo(x.to) : null; return `<div class="mm-card ${s === 'bad' ? 'bad' : s === 'warn' ? 'warn' : ''}"><b>${v6E(x.code ? x.code + ' — ' : '')}${v6E(x.t)}</b><small>${v6E(v6KindName(x.kind))}${x.from || x.to ? ' · 📅 ' + v6E(V6.fmtD(x.from)) + ' — ' + v6E(V6.fmtD(x.to)) : ''}${left === null ? '' : left < 0 ? ' · ⛔ ' + Math.abs(left) + ' kun oldin tugagan' : ' · ' + left + ' kun qoldi'}</small>${x.note ? `<small>📝 ${v6E(x.note)}</small>` : ''}
                    <div class="hs-fb">${x.src === 'nd' ? `<button onclick="gostOpen('${v6E(x.id.slice(3))}')">📖 Ochish</button>` : ''}${(x.files || []).map((f, i) => `<button onclick="v6FileOpen('${v6E(x.id)}',${i})">${/pdf/.test(f.mime) ? '📄' : /image/.test(f.mime) ? '🖼' : '📎'} ${v6E(f.name)}</button>`).join('')}${ed && !x.src ? `<button onclick="v6DocForm('${v6E(x.id)}')">✏️ Tahrirlash</button><button onclick="v6DocDel('${v6E(x.id)}')">🗑</button>` : ''}</div></div>`; }).join('') || '<div class="xt-empty">Hujjat topilmadi</div>'}`;
        }
        var V6F: { files: V6File[]; blobs: Record<string, Blob> } = { files: [], blobs: {} };
        function v6DocForm(id?: string): void {
            if (!V6.canMMEdit()) { alert('Hujjatni TB xodimi yoki administrator qoʻshadi.'); return; }
            const x: V6Doc | undefined = id ? v6Docs().find(d => d.id === id) : undefined;
            V6F = { files: x ? (x.files || []).slice() : [], blobs: {} };
            V6.mdl('v6DocMdl', `<div class="px-h"><b>${x ? '✏️ Hujjatni tahrirlash' : '➕ Hujjat qoʻshish'}</b><button class="mini-btn" onclick="mdlClose('v6DocMdl')">✕</button></div>
                <div class="mm-f"><label>Turi</label><select id="v6d_k">${V6_KINDS.map(k => `<option value="${k[0]}" ${(x ? x.kind : 'yor') === k[0] ? 'selected' : ''}>${k[1]}</option>`).join('')}</select></div>
                <div class="mm-f"><label>Raqami / kodi</label><input id="v6d_c" value="${v6E(x ? x.code : '')}" placeholder="masalan: MM 31-20-475-2026"></div>
                <div class="mm-f"><label>Nomi</label><input id="v6d_t" value="${v6E(x ? x.t : '')}" placeholder="Hujjat nomi"></div>
                <div class="mm-grid2"><div class="mm-f"><label>Amal qilish boshlanishi</label><input type="date" id="v6d_f" value="${v6E(x ? x.from : V6.todayISO())}"></div><div class="mm-f"><label>Amal qilish tugashi</label><input type="date" id="v6d_to" value="${v6E(x ? x.to : '')}"></div></div>
                <div class="mm-f"><label>Izoh</label><input id="v6d_n" value="${v6E(x ? x.note : '')}" placeholder="tasdiqlagan, buyruq №..."></div>
                <div class="mm-f"><label>Fayllar (PDF, Word, Excel, rasm)</label><div id="v6d_files"></div><label class="mini-btn">📎 Fayl tanlash<input type="file" multiple hidden accept=".pdf,.doc,.docx,.xls,.xlsx,image/*" onchange="v6DocAddFiles(this)"></label></div>
                <button class="action-btn" onclick="v6DocSave('${v6E(id || '')}')">💾 Saqlash</button>`);
            v6DocFilesDraw();
        }
        function v6DocFilesDraw(): void { const b = V6.$id('v6d_files'); if (!b) return; b.innerHTML = V6F.files.map((f, i) => `<div class="sg-row">📎 ${v6E(f.name)} · ${Math.max(1, Math.round(f.size / 1024))} KB <b onclick="V6F.files.splice(${i},1); v6DocFilesDraw()" style="cursor:pointer">✕</b></div>`).join('') || '<small>Fayl biriktirilmagan</small>'; }
        function v6DocAddFiles(inp: any): void {
            Array.from((inp.files || []) as FileList).forEach(f => { if (f.size > 25e6) { alert('«' + f.name + '» juda katta (25 MB gacha).'); return; } const id = V6.uid('mmf'); V6F.blobs[id] = f; V6F.files.push({ id: id, name: f.name, mime: f.type || 'application/octet-stream', size: f.size, up: V6.meTabel() }); });
            inp.value = ''; v6DocFilesDraw();
        }
        async function v6DocSave(id: string): Promise<void> {
            if (!V6.canMMEdit()) return;
            const val = (k: string): string => String(((V6.$id(k) || {}) as HTMLInputElement).value || '').trim();
            const t = val('v6d_t'); if (!t) { alert('Hujjat nomini kiriting.'); return; }
            for (const f of V6F.files) { const b = V6F.blobs[f.id]; if (b) { try { await V6.mediaSave(f.id, b, { id: f.id, at: new Date().toISOString(), size: f.size, name: f.name, mime: f.mime, mm: true }); } catch (e) { console.error(e); } } }
            const L = v6Docs(), now = new Date().toISOString(); let x = id ? L.find(d => d.id === id) : undefined;
            if (!x) { x = { id: V6.uid('nhh'), kind: 'yor', code: '', t: '', from: '', to: '', note: '', files: [], by: V6.authorStr(), byT: V6.meTabel(), at: now }; L.push(x); }
            Object.assign(x, { kind: val('v6d_k') || 'yor', code: val('v6d_c'), t: t, from: val('v6d_f'), to: val('v6d_to'), note: val('v6d_n'), files: V6F.files, upd: now, updBy: V6.meTabel() });
            v6DocsSave(L); V6.mdlClose('v6DocMdl'); V6.mmRender(); V6.showToast('✅ Saqlandi');
            v6FilesUp().catch(() => undefined);
        }
        async function v6DocDel(id: string): Promise<void> {
            if (!V6.canMMEdit() || !(await V6.uiConfirm('Hujjat roʻyxatdan olib tashlansinmi?'))) return;
            const L = v6Docs(), x = L.find(d => d.id === id); if (!x) return; x.del = true; x.at = new Date().toISOString(); v6DocsSave(L); V6.mmRender();
        }
        /** Shu telefonda qoʻshilgan, hali serverga yuklanmagan fayllar — boʻlim fayli sifatida (tizimga kirgan xodimlar oʻqiydi) */
        async function v6FilesUp(): Promise<void> {
            if (typeof V6.srvRaw !== 'function' || typeof V6.syncReady !== 'function' || !V6.syncReady()) return;
            const L = v6Docs(), me = V6.meTabel(); let ch = false;
            for (const x of L) for (const f of (x.files || [])) {
                if (f.srv || f.up !== me) continue;
                try { const b = await V6.mediaGetBlob(f.id); if (!b) continue; const r = await V6.srvRaw('/api/files/v1?to=' + encodeURIComponent('*mttb') + '&name=' + encodeURIComponent(f.name) + '&mime=' + encodeURIComponent(f.mime), { method: 'POST', body: b }); f.srv = (await r.json()).id; ch = true; } catch (e) { console.warn('v3.16.6 fayl', e); }
            }
            if (ch) v6DocsSave(L);
        }
        async function v6FileOpen(id: string, i: number): Promise<void> {
            const x = v6Docs().find(d => d.id === id), f = x && x.files ? x.files[i] : null; if (!f) return;
            let b: Blob | null = null; try { b = await V6.mediaGetBlob(f.id); } catch (e) { }
            if (!b && f.srv && typeof V6.srvFileGet === 'function') { try { b = await V6.srvFileGet(f.srv, f.mime); if (b) await V6.mediaSave(f.id, b, { id: f.id, at: new Date().toISOString(), size: b.size, name: f.name, mime: f.mime, mm: true }); } catch (e) { alert('Faylni serverdan olib boʻlmadi: ' + V6.agmkErrUz(e)); return; } }
            if (!b) { alert('Fayl bu qurilmada yoʻq — korxona serveriga ulaning.'); return; }
            if (/^image\//.test(f.mime)) { V6.openImageViewerModal([URL.createObjectURL(b)], [f.name], 0); return; }
            V6.docDownload([{ name: f.name, mime: f.mime, blob: b }]);
        }

        // ---------- 4) 📅 Bilimlar sinovining yillik jadvali ----------
        var V6J = { y: new Date().getFullYear(), ty: 'asosiy' };
        function v6JCfg(): { lav: string; fio: string; sana: string } { const c = V6.kvGet(V6_JCFG_KEY, null) || {}; return { lav: c.lav || 'STTB bosh muhandisi', fio: c.fio || '', sana: c.sana || '' }; }
        function v6JRows(): V6JRow[] {
            const d = V6.mbData(), y = String(V6J.y), ty = V6J.ty, out: Array<V6JRow & { k: string }> = [];
            V6.mbAllPids(d).forEach((pid: string) => {
                if (!V6.mbTypesOf(pid, d).includes(ty)) return;
                const recs = d.recs.filter((r: any) => r.pid === pid && r.type === ty && !r.del).sort((a: any, b: any) => String(a.date).localeCompare(String(b.date)));
                const before = recs.filter((r: any) => String(r.date) < y + '-01-01' && r.grade === 'q'), inY = recs.filter((r: any) => String(r.date).startsWith(y));
                const prev = before.length ? before[before.length - 1].date : '';
                const pl = d.plan[pid + '|' + ty] || null, pld = pl && (pl.date || (typeof pl === 'string' ? pl : '')) || '';
                const plan = pld && pld.startsWith(y) ? pld : prev ? v6AddDays(V6.mmAddMonths(prev, V6.mbT(ty).m), -1) : '';
                if (!plan.startsWith(y) && !inY.length) return;
                const fact = inY[0] || null, p = V6.mbPerson(pid, d), it = p.tabel ? V6.xodimByTabel(p.tabel) : null;
                const imzo = !fact ? '' : fact.src === 'import' ? 'qogʻozda' : fact.sig && fact.sig.ex ? '✅ ' + V6.fmtD(fact.sig.ex.at) : '⏳ kutilmoqda';
                const hol = it && it.passport && it.passport.holat && it.passport.holat !== 'Ishlaydi' ? it.passport.holat : '';
                const izoh = (pl && pl.flag) || (fact && fact.grade === 'n' ? 'Qoniqarsiz — qayta topshirish ' + V6.fmtD(fact.retake) : '') || (it && it.ketgan1c ? 'Roʻyxatda yoʻq' : '') || hol;
                out.push({ k: plan || (fact ? fact.date : ''), name: p.name, lav: p.lav || '', prev: prev, plan: plan, fact: fact ? fact.date : '', imzo: imzo, izoh: izoh });
            });
            out.sort((a, b) => a.k.localeCompare(b.k) || a.name.localeCompare(b.name));
            return out;
        }
        function v6JTable(rows: V6JRow[], forPdf: boolean): string {
            const c = v6JCfg(), st = forPdf ? ' style="border:1px solid #000;padding:4px;font-size:11px;vertical-align:middle"' : '';
            const head = `<div style="text-align:right;${forPdf ? 'font-size:12px' : ''}">"Tasdiqlayman"<br>${v6E(c.lav)}<br>________ ${v6E(c.fio || '____________')}<br>"${v6E(c.sana ? V6.fmtD(c.sana).slice(0, 2) : '___')}" ${v6E(c.sana ? V6.fmtD(c.sana).slice(3) : '_________ ' + (V6J.y - 1))} y.</div>
                <div style="text-align:center;font-weight:bold;margin:10px 0">${V6J.y} yilda STTB MTXlarining bilimlar sinovi<br>JADVALI</div>${V6J.ty !== 'asosiy' ? `<div style="text-align:center;margin-bottom:6px">(${v6E(V6.mbT(V6J.ty).t)})</div>` : ''}`;
            return head + `<table class="v6-jt" style="border-collapse:collapse;width:100%"><thead><tr><th${st} rowspan="2">№</th><th${st} rowspan="2">Familiya, ism, otasining ismi</th><th${st} rowspan="2">Kasbi (lavozimi)</th><th${st} colspan="3">Imtihon sanasi</th><th${st} rowspan="2">Tanishgani toʻgʻrisida imzosi</th><th${st} rowspan="2">Izoh</th></tr><tr><th${st}>Avvalgi</th><th${st}>Reja boʻyicha</th><th${st}>Haqiqatdan</th></tr></thead><tbody>
                ${rows.map((r, i) => `<tr><td${st}>${i + 1}</td><td${st}>${v6E(r.name)}</td><td${st}>${v6E(r.lav)}</td><td${st}>${v6E(r.prev ? V6.fmtD(r.prev) : '')}</td><td${st}>${v6E(r.plan ? V6.fmtD(r.plan) : '')}</td><td${st}>${v6E(r.fact ? V6.fmtD(r.fact) : '')}</td><td${st}>${v6E(r.imzo)}</td><td${st}>${v6E(r.izoh)}</td></tr>`).join('')}</tbody></table>`;
        }
        function v6JadHtml(): string {
            const ed = V6.canMMEdit(), c = v6JCfg(), y0 = new Date().getFullYear(), rows = v6JRows();
            const done = rows.filter(r => r.fact).length, late = rows.filter(r => !r.fact && r.plan && r.plan < V6.todayISO()).length;
            return `<div class="mm-flt"><select onchange="V6J.y=+this.value; mmRender()">${[y0 - 1, y0, y0 + 1].map(y => `<option value="${y}" ${V6J.y === y ? 'selected' : ''}>${y} yil</option>`).join('')}</select><select onchange="V6J.ty=this.value; mmRender()">${(V6.MB_T || []).map((t: any) => `<option value="${t.k}" ${V6J.ty === t.k ? 'selected' : ''}>${v6E(t.s)}</option>`).join('')}</select></div>
                <div class="mm-sum"><i class="ok"><b>${rows.length}</b>rejada</i><i class="ok"><b>${done}</b>topshirdi</i><i class="bad"><b>${late}</b>kechikkan</i></div>
                <div class="mm-tools"><button class="mini-btn" onclick="v6JPdf()">📄 PDF</button><button class="mini-btn" onclick="v6JXls()">📊 Excel</button>${ed ? '<button class="mini-btn" onclick="v6JCfgEdit()">✏️ Tasdiqlovchi</button>' : ''}</div>
                <div class="nd-tip">Avvalgi — oʻtgan yilgi oxirgi qoniqarli sinov; reja — jadvaldagi sana yoki avvalgidan bir yil keyin; haqiqatdan — shu yil topshirgan kuni. Sinov natijasi «🎓 Bilim sinovi» boʻlimida kiritiladi.${c.fio ? '' : ' Tasdiqlovchining F.I.Sh.ini «✏️ Tasdiqlovchi» orqali kiriting.'}</div>
                <div class="v6-jbox">${v6JTable(rows, false)}</div>`;
        }
        async function v6JCfgEdit(): Promise<void> {
            if (!V6.canMMEdit()) return; const c = v6JCfg();
            const lav = await V6.uiPrompt('Tasdiqlovchining lavozimi:', c.lav); if (lav === null) return;
            const fio = await V6.uiPrompt('Tasdiqlovchining F.I.Sh. (masalan: @@N:286@@):', c.fio); if (fio === null) return;
            const sana = await V6.uiPrompt('Tasdiqlangan sana (YYYY-MM-DD):', c.sana || V6.todayISO()); if (sana === null) return;
            V6.kvSet(V6_JCFG_KEY, { lav: lav.trim(), fio: fio.trim(), sana: v6Iso(sana) || sana.trim() }); V6.mmRender();
        }
        function v6JPdf(): void {
            const html = `<div style="font-family:'Times New Roman',serif;color:#000">${v6JTable(v6JRows(), true)}</div>`;
            try { V6.docDownload([{ name: 'Bilimlar_sinovi_jadvali_' + V6J.y + '.pdf', mime: 'application/pdf', blob: V6.pdfBlobFromHtml(html) }]); V6.showToast('📄 PDF tayyorlandi'); } catch (e) { alert('PDF tayyorlab boʻlmadi: ' + V6.agmkErrUz(e)); }
        }
        function v6JXls(): void {
            const c = v6JCfg(), rows: unknown[][] = [['', '', '', '', '', '', '"Tasdiqlayman"'], ['', '', '', '', '', '', c.lav], ['', '', '', '', '', '', '________ ' + (c.fio || '')], ['', '', '', '', '', '', c.sana ? V6.fmtD(c.sana) : ''], [V6J.y + ' yilda STTB MTXlarining bilimlar sinovi JADVALI'], ['№', 'Familiya, ism, otasining ismi', 'Kasbi (lavozimi)', 'Avvalgi', 'Reja boʻyicha', 'Haqiqatdan', 'Tanishgani toʻgʻrisida imzosi', 'Izoh']];
            v6JRows().forEach((r, i) => rows.push([i + 1, r.name, r.lav, r.prev ? V6.fmtD(r.prev) : '', r.plan ? V6.fmtD(r.plan) : '', r.fact ? V6.fmtD(r.fact) : '', r.imzo, r.izoh]));
            V6.xlsxDl(rows, 'Bilimlar sinovi jadvali ' + V6J.y);
        }

        // ---------- yorliqlar: «📚 NHH va yoʻriqnomalar», «📅 Yillik jadval» (koʻrish huquqi borlarga) ----------
        function v6Tabs(): void {
            if (!V6.canMMView()) return; const t = document.querySelector('#screen-mm .sec-tabs'); if (!t) return;
            Array.from(t.children).forEach(ch => { const oc = ch.getAttribute('onclick') || ''; if (/'(instr|docs)'/.test(oc)) ch.remove(); });
            const add = (k: string, txt: string) => { if (t.querySelector('[data-v6="' + k + '"]')) return; const i = document.createElement('i'); i.dataset.v6 = k; i.textContent = txt; i.setAttribute('onclick', "mmTab('" + k + "')"); t.appendChild(i); };
            add('jadval', '📅 Yillik jadval'); add('nhh', '📚 NHH va yoʻriqnomalar');
            Array.from(t.children).forEach(ch => { const k = (ch as HTMLElement).dataset.v6; if (k) ch.classList.toggle('on', V6.MM.tab === k); else if (V6.MM.tab === 'nhh' || V6.MM.tab === 'jadval') ch.classList.remove('on'); });
        }
        if (typeof V6.mmRender === 'function') V6.mmRender = V6.agmkExtend('mmRender', 'v3.16.6: NHH va yillik jadval', V6.mmRender, (o: Function) => function (this: unknown, ...a: unknown[]) {
            const tab = V6.MM.tab;
            if ((tab === 'nhh' || tab === 'jadval') && V6.canMMView()) {
                V6.MM.tab = 'instr'; try { o.apply(this, a); } finally { V6.MM.tab = tab; }
                v6Tabs(); const b = V6.secBody('screen-mm'); if (b) b.innerHTML = tab === 'nhh' ? v6NhhHtml() : v6JadHtml(); return;
            }
            const r = o.apply(this, a); try { v6Tabs(); } catch (e) { } return r;
        });

        // ---------- 3) va 5) bildirishnomalar (har kuni bir marta, har kimning oʻz telefonida hisoblanadi) ----------
        function v6Due(it: any): { bad: string[]; warn: string[] } {
            const out = { bad: [] as string[], warn: [] as string[] }; if (!it) return out;
            const s = V6.mmStat(it);
            ['davriy', 'bilim', 'tibbiy'].forEach(k => { const x = s[k]; if (!x || x.na) return; const T = V6.MM_RULES[k].t; if (x.st === 'bad') out.bad.push(T + ' — ' + Math.abs(x.left) + ' kun oʻtgan'); else if (x.st === 'warn') out.warn.push(T + ' — ' + x.left + ' kun qoldi (' + V6.fmtD(x.next) + ')'); });
            return out;
        }
        /** Bevosita rahbar uchun xodimlar: sex rahbariyati (boshligʻi, oʻrinbosarlari, bosh muhandisi) — butun boʻlinma (boshqaruv apparatida — oʻz boʻlimi); usta — faqat oʻz uchastkasi */
        function v6Subs(me: any): any[] {
            if (!me) return []; const head = v6IsHead(me), usta = v6IsUsta(me); if (!head && !usta) return [];
            const su = v6SuOf(me), uch = String(me.uchastka1c || ''), boshq = /boshqarma|boshqaruv/i.test(su), mt = V6.cleanTabel(me.tabel);
            return V6.allXodims().filter((r: any) => { const it = r.item; if (it.ketgan1c || V6.cleanTabel(it.tabel) === mt || r.su !== su) return false; if (head && !usta && !boshq) return true; return !!uch && it.uchastka1c === uch; }).map((r: any) => r.item);
        }
        function v6DocsDue(): V6Doc[] { return v6DocsAll().filter(x => { const l = x.to ? V6.daysTo(x.to) : null; return l !== null && l <= 30; }); }
        function v6Notify(): void {
            const me = V6.meTabel(); if (!me) return; const day = V6.todayISO(), key = 'agmk_v6_ntf_' + me;
            if (localStorage.getItem(key) === day) return;
            const N = (icon: string, text: string) => V6.notify({ icon: icon, text: text, toTabel: me, byTabel: 'sys' });
            const it = v6MeItem();
            // xodimning oʻziga
            const d = v6Due(it); if (d.bad.length || d.warn.length) N('🦺', 'Mehnat muhofazasi — sizning muddatlaringiz: ' + d.bad.concat(d.warn).join('; '));
            // sex rahbariyati va uchastka ustasiga — oʻz xodimlari
            const S = v6Subs(it); if (S.length) { let b = 0, w = 0; const nm: string[] = []; S.forEach(x => { const z = v6Due(x); if (z.bad.length) { b++; if (nm.length < 5) nm.push(V6.shortName(x.name)); } else if (z.warn.length) w++; }); if (b || w) N('🦺', 'Xodimlaringizning MM muddatlari: oʻtgan — ' + b + ' kishi' + (nm.length ? ' (' + nm.join(', ') + (b > nm.length ? '…' : '') + ')' : '') + ', 30 kun ichida — ' + w + ' kishi. Mehnat muhofazasi → 📊 Nazorat'); }
            // TB xodimlariga — hammasi va hujjatlar muddati
            if (v6IsTb(it) || (V6.hasRole('mm') && !V6.isAdmin())) {
                let b = 0, w = 0; V6.mmPeople().forEach((r: any) => { const z = v6Due(r.item); if (z.bad.length) b++; else if (z.warn.length) w++; });
                if (b || w) N('🦺', 'TB nazorati: muddati oʻtgan — ' + b + ' xodim, 30 kun ichida — ' + w + ' xodim');
                const D = v6DocsDue(); if (D.length) N('📚', 'Hujjat amal qilish muddati: ' + D.slice(0, 4).map(x => '«' + (x.code || x.t) + '» — ' + (V6.daysTo(x.to) < 0 ? 'tugagan' : V6.daysTo(x.to) + ' kun qoldi')).join('; ') + (D.length > 4 ? ' va yana ' + (D.length - 4) + ' ta' : '') + '. Mehnat muhofazasi → 📚 NHH va yoʻriqnomalar');
            }
            try { localStorage.setItem(key, day); } catch (e) { }
        }
        try { V6.SEC_EV.fns.push(function v6Tick() { try { v6Notify(); } catch (e) { console.error('v3.16.6 eslatma', e); } v6FilesUp().catch(() => undefined); }); } catch (e) { }
        (function () { const st = document.createElement('style'); st.textContent = `.v6-jbox{overflow-x:auto;background:#fff;color:#000;border-radius:10px;padding:12px;margin-top:8px}.v6-jbox th,.v6-jbox td{border:1px solid #333;padding:4px 6px;font-size:12px;color:#000}.v6-jbox th{background:#f1f5f9}`; document.head.appendChild(st); })();
