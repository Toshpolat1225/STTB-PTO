        //  Har bir telefonda bir marta oʻzi joylanadi: sex › kasb › ishchi (ITR larga tegilmaydi). Keyin kadrlar yangi roʻyxatni import qilishi mumkin.
        var WRK_SEED = __PRIVATE__("WRK_SEED"), WRK_SEED_KEY = 'agmk_wrk_seed';
        // 3.16.2: «Familiya I.O.» koʻrinishi — ITR roʻyxatidagi tabelsiz yozuv bilan solishtirish uchun
        function wrkShort(n) { const w = normTxt(String(n || '')).replace(/\./g, ' ').split(/\s+/).filter(Boolean); return (w[0] || '') + ' ' + (w[1] || '').charAt(0) + (w[2] || '').charAt(0); }
        function wrkRosterTwin(name, su) { const k = wrkShort(name); return (sectionItemsDB.xodim[su] || []).some(it => it.roster && !cleanTabel(it.tabel) && wrkShort(it.name) === k); }
        // 3.16.1 da yaratilgan takror (tabelsiz ITR yozuvi bor xodim ishchi sifatida ham qoʻshilgan) — bir marta tozalanadi
        function wrkTwinFix() {
            try { if (localStorage.getItem('agmk_wrk_fix1')) return; let n = 0;
                Object.keys(sectionItemsDB.xodim || {}).forEach(su => { const L = sectionItemsDB.xodim[su] || []; const R = L.filter(it => it.roster && !cleanTabel(it.tabel)); if (!R.length) return;
                    sectionItemsDB.xodim[su] = L.filter(it => { if (it.roster || it.toifa !== 'ishchi' || !cleanTabel(it.tabel)) return true; const k = wrkShort(it.name); if (!R.some(r => wrkShort(r.name) === k)) return true;
                        if (it.photo || (it.gallery || []).length || (it.workHistory || []).length) return true; n++; return false; }); });
                if (n) { saveDB(false); try { audLog && audLog('xodim', 'Takror ishchi yozuvi olib tashlandi: ' + n); } catch (e) {} }
                localStorage.setItem('agmk_wrk_fix1', '1');
            } catch (e) { console.error(e); }
        }
        function wrkSeedApply(force) {
            try {
                if (!shtatTree || !sectionItemsDB || typeof stImpDo !== 'function') return false;
                let done = ''; try { done = localStorage.getItem(WRK_SEED_KEY) || ''; } catch (e) {}
                if (!force && done === WRK_SEED.v) return false;
                if (allXodims().filter(r => r.item.roster).length < 100) return false; // avval ITR roʻyxati joylansin
                const out = []; WRK_SEED.rows.forEach(r => { const u = stImpUnit(r[2]); if (!u) return; const ks = stImpKasb(r[3]); out.push({ t: cleanTabel(r[0]), n: stImpName(r[1]), l: ks.k, z: ks.z, u: u, g: null, gs: '', r: null, c: 0 }); });
                out.forEach(x => { const f = findXodimsByTabel(x.t)[0]; const p = f && f.item.posNo ? posByNo(f.item.posNo) : null; x.skip = !!(f && (f.item.roster || (p && !stIsW(p)))) || (!f && wrkRosterTwin(x.n, x.u.key)); x.ex = !!f; }); // 3.16.2: tabelsiz ITR roʻyxatida bor boʻlsa — takror yaratilmaydi
                ST_IMP = out; ST.seedRun = true; try { stImpDo(); } finally { ST.seedRun = false; }
                try { localStorage.setItem(WRK_SEED_KEY, WRK_SEED.v); } catch (e) {}
                return out.length;
            } catch (e) { console.error(e); return false; }
        }
        (function () {
            setTimeout(() => { wrkTwinFix(); wrkSeedApply(false); }, 3000);
            window.addEventListener('agmk:login', () => setTimeout(() => wrkSeedApply(false), 2000));
            try { SEC_EV.fns.push(() => wrkSeedApply(false)); } catch (e) {}
        })();

    

