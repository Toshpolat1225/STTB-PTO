        /* ===== 34-bosqich (v1.8): butun ilova bo'yicha huquqlar — bitta nusxa hammaga, har kim o'z roli doirasida ===== */
        // Admin (tabel 2582) — hamma narsa. Boshqa hisoblar — faqat quyidagi jadvalda ruxsat berilgan amallar.
        // Tekshiruv tugmani yashirish bilan cheklanmaydi: funksiyaning o'zi ham tekshiradi (AI, ovoz, konsol orqali chaqirilsa ham).
        try { if (typeof ROLE_DEF !== 'undefined' && !ROLE_DEF.some(x => x[0] === 'tex')) ROLE_DEF.push(['tex', '🛠', 'Texnika maʼlumotlari (master)', "Vagon, lokomotiv va boshqa texnika pasporti, taʼmir sanalari, holati, taʼmir tarixi va PPR rejasini tahrirlaydi"]); } catch (e) {}
        function p38Who(w) {
            if (!currentUser || !currentUser.tabel) return false;
            if (w === 'all') return true;
            if (w === 'admin') return isAdmin();
            if (w === 'hr') return typeof canHR === 'function' ? canHR() : isAdmin();
            if (w === 'own') { try { if (typeof currentSectionType !== 'undefined' && currentSectionType !== 'xodim') return false; const it = getActiveItem(); return !!(it && isOwnItem(it)); } catch (e) { return false; } }
            return hasRole(w);
        }
        var PERM38 = [
            { id: 'xodim_add', t: "Xodim, seh yoki uchastka qoʻshish / oʻchirish", who: ['admin'], fns: ['openAddItemModal', 'saveNewItem', 'deleteCurrentItem'] },
            { id: 'shtat', t: 'Shtat jadvali, lavozimlar, 👑 rahbar lavozimi', who: ['admin'], fns: ['openShtatAdd', 'openShtPos', 'spSave', 'shtDelPos', 'shtRenameGroup', 'shtDelGroup', 'shtCrown', 'saveShtatAdd', 'editShtat', 'deleteShtat', 'toggleRahbar', 'changeShtatPw'] },
            { id: 'shtat_view', t: 'Shtatlar roʻyxatini koʻrish', who: ['admin', 'rahbar', 'kadr'], fns: ['openShtat'] },
            { id: 'xodim_edit', t: "Xodim maʼlumotini tahrirlash (pasport, rasm, ish tarixi, taʼtil, spravka, oila)", who: ['admin', 'own'], fns: ['updateXodimField', 'addTatil', 'deleteTatil', 'spravkaSelected', 'deleteSpravka', 'pickAtt', 'attFilesChosen', 'removeEntryAtt', 'removePendingAtt'], xodimOnly: true },
            { id: 'private', t: "Boshqalarning yopiq maʼlumotini koʻrish (pasport, tugʻilgan sana)", who: ['admin', 'rahbar', 'kadr'], fns: [] },
            { id: 'tech_add', t: 'Texnika qoʻshish (vagon, lokomotiv)', who: ['admin', 'rahbar'], fns: ['openAddVagonModal', 'addNewVagon', 'openAddLok', 'addNewLok'] },
            { id: 'tech_del', t: "Texnikani bazadan oʻchirish", who: ['admin'], fns: ['deleteVagon'] },
            { id: 'tech_edit', t: "Texnika pasporti, taʼmir sanalari, holati, taʼmir tarixi", who: ['admin', 'rahbar', 'tex'], fns: ['openEditModal', 'savePassportChanges', 'markVagonAsTamirda', 'restoreVagonFromTamirda', 'polRelease', 'addNewTamir', 'editTamirEntry', 'deleteTamirEntry', 'addNewItemTamir', 'editItemTamirEntry', 'deleteItemTamirEntry'] }, // v3.4: galereyaga rasm — hamma xodim (quyida «basic»)
            { id: 'rahbar_note', t: 'Rahbariyat nazorati: izoh va rasmlar', who: ['admin', 'rahbar'], fns: ['rahbarFileSelected', 'updateVagonRahbarIzoh', 'itemRahbarFileSelected', 'updateItemRahbarIzoh'] },
            { id: 'ppr', t: 'PPR (rejali taʼmir) rejasini tahrirlash', who: ['admin', 'rahbar', 'tex'], fns: ['pprEdit', 'pprEvEdit', 'pprEvDone', 'pprEvDel', 'pprEdSave'] },
            { id: 'hr', t: 'Harakat tarkibi (holat, joy) va ehtiyot qismlar katalogi', who: ['admin', 'rahbar', 'hr'], fns: ['hrSaveUnit', 'hrSaveTarkib', 'hrQuickSave', 'spAddUser', 'spDelUser', 'spAddForm'] },
            { id: 'nd_add', t: "Normativ hujjat qoʻshish", who: ['admin', 'rahbar', 'mm'], fns: ['ndAddDoc'] },
            { id: 'nd_del', t: "Hujjat yoki aktni oʻchirish, hujjat toifasini oʻzgartirish", who: ['admin'], fns: ['ndDelDoc', 'ndDocCat', 'ndDelAkt'] },
            { id: 'ai_teach', t: "AI'ni oʻrgatish (javob qoʻshish / oʻchirish)", who: ['admin'], fns: ['kbTeach', 'kbTeachDel'] },
            { id: 'settings', t: "AI ulanishi, server, onlayn ovoz, aloqa maʼlumotlari", who: ['admin'], fns: ['aiCfgSave', 'aiCfgTest', 'syncSave', 'syncOff', 'saveContactsForm', 'tts38Save'] },
            { id: 'backup', t: "Zaxira nusxa olish / tiklash (barcha xodimlar maʼlumoti)", who: ['admin'], fns: ['exportBackup', 'importBackupTrigger', 'importBackup'] },
            { id: 'undo', t: "Butun bazani ortga / oldinga qaytarish", who: ['admin'], fns: ['undoAction', 'redoAction'] },
            { id: 'seclog', t: "Xavfsizlik va parollar jurnali, shikoyatlar", who: ['admin'], fns: ['openSecLog', 'openPwLog', 'openFbInbox', 'deleteFb', 'toggleFbDone'] },
            { id: 'roles', t: 'Rollar va huquqlarni berish', who: ['admin'], fns: ['rolesOpen', 'roleSet'] },
            { id: 'mm', t: "Mehnat muhofazasi: muddatlar, jurnal, yoʻriqnomalar", who: ['admin', 'mm'], fns: ['mmPersonSave', 'mmJrSave', 'mmJrDel', 'mmInstrAdd', 'mmInstrDel'] },
            { id: 'mttb', t: "Ombor: kirim va berish", who: ['admin', 'mttb'], fns: ['mtKSave', 'mtBSave'] },
            { id: 'bux', t: "Buxgalteriya: xarajat va reja", who: ['admin', 'bux'], fns: ['bxSaveForm', 'bxDel', 'bxPlanSave', 'bxFromMt'] },
            { id: 'basic', t: "Zayavka berish, xabar yozish, akt tuzish va yuborish, albom va galereyaga rasm, AI bilan suhbat", who: ['all'], fns: [] }
        ];
        function p38Can(id) { const a = PERM38.find(x => x.id === id); return !!a && a.who.some(p38Who); }
        function p38Deny(a) { const w = a.who.filter(x => x !== 'own' && x !== 'all').map(x => ({ admin: 'administrator', rahbar: 'rahbariyat', kadr: 'kadrlar boʻlimi', mm: 'MM masʼuli', mttb: 'MTTB', bux: 'buxgalteriya', tex: 'texnika masteri', hr: 'dispetcher' })[x] || x); alert('🔒 Ruxsat yoʻq: «' + a.t + '».\nBu amalni ' + w.join(', ') + (a.who.includes('own') ? ' (yoki maʼlumot egasi)' : '') + ' bajaradi.'); }
        (function () {
            PERM38.forEach(a => a.fns.forEach(fn => {
                const o = window[fn]; if (typeof o !== 'function' || o._p38) return;
                const w = function () {
                    if (a.xodimOnly && typeof currentSectionType !== 'undefined' && currentSectionType !== 'xodim') return o.apply(this, arguments);
                    if (!a.who.some(p38Who)) { p38Deny(a); try { const ev = arguments[0]; if (ev && ev.target && ev.target.value !== undefined && ev.target.type === 'file') ev.target.value = ''; else if (ev && ev.type === 'file') ev.value = ''; } catch (e) {} return; }
                    return o.apply(this, arguments);
                };
                w._p38 = 1; window[fn] = w;
            }));
        })();
        // Tugmalarni yashirish (ruxsat yo'q bo'lsa ko'rinmaydi)
        var P38_UI = [
            ['xodim_add', '[onclick^="deleteCurrentItem"], #screen-section-items .fab-btn[onclick^="openAddItemModal"]'],
            ['shtat', '#screen-shtat .fab-btn, .shtat-act, .shtat-crown, #screen-settings .btn-card[onclick="changeShtatPw()"]'],
            ['shtat_view', '#screen-settings .btn-card[onclick="openShtat()"], #main-card-list [data-search^="shtatlar"]'],
            ['tech_add', '#screen-vagonlar .fab-btn[onclick^="openAddVagonModal"], #screen-lok .fab-btn[onclick^="openAddLok"]'],
            ['tech_del', '[onclick^="deleteVagon"]'],
            ['tech_edit', '[onclick^="openEditModal"], #btn-mark-tamirda, #btn-restore-auto, [onclick^="addNewTamir"], [onclick^="addNewItemTamir"], .hist-actions'],
            ['rahbar_note', '[onclick*="rahbar-file-input"], #rahbar-izoh, #item-rahbar-izoh'],
            ['ppr', '.ppr-ed'],
            ['nd_del', '[onclick^="ndDelDoc"], .nd-catsel, [onclick^="ndDelAkt"]'],
            ['ai_teach', '.kb-teach, [onclick^="kbTeachDel"]'],
            ['backup', '#screen-settings .btn-card[onclick="exportBackup()"], #screen-settings .btn-card[onclick="importBackupTrigger()"]'],
            ['undo', '#btn-undo, #btn-redo'],
            ['seclog', '#screen-settings .btn-card[onclick="openSecLog()"], #screen-settings .btn-card[onclick="openPwLog()"], #screen-settings .btn-card[onclick="openFbInbox()"]'],
            ['settings', '#set-tts-card, #screen-settings .btn-card[onclick="openContacts()"]']
        ];
        function p38Ui() {
            let css = '';
            P38_UI.forEach(([id, sel]) => { if (!p38Can(id)) css += sel + ' { display: none !important; }\n'; });
            let st = $id('p38css'); if (!st) { st = document.createElement('style'); st.id = 'p38css'; document.head.appendChild(st); }
            if (st.textContent !== css) st.textContent = css;
            document.body.classList.toggle('p38-admin', isAdmin());
        }
        (function () {
            ['hideLock', 'openScreen', 'renderSettings', 'kvSet', 'roleSet'].forEach(fn => { const o = window[fn]; if (typeof o !== 'function') return; const w = function () { const r = o.apply(this, arguments); try { p38Ui(); } catch (e) {} return r; }; if (o._p38) w._p38 = 1; window[fn] = w; });
            setInterval(() => { try { p38Ui(); } catch (e) {} }, 3000);
            try { p38Ui(); } catch (e) {}
        })();
        // Server: o'rgatilgan javoblarni faqat admin yozadi, rollar — faqat admin
        (function () {
            if (typeof syncApply !== 'function') return;
            syncApply = agmkExtend('syncApply', '34-bosqich (v1.8): butun ilova boʼyicha huquqlar — bitta nusxa hammaga, har kim oʼz roli d', syncApply, o => function (rec) { if (rec && rec.kind === 'teach' && rec.updated_by && String(rec.updated_by) !== ADMIN_TABEL) return null; return o.apply(this, arguments); });
            syncLocal = agmkExtend('syncLocal', '34-bosqich (v1.8): butun ilova boʼyicha huquqlar — bitta nusxa hammaga, har kim oʼz roli d', syncLocal, oL => function () { const l = oL.apply(this, arguments); return isAdmin() ? l : l.filter(x => x.kind !== 'teach'); });
            try {
                SYNC_SQL += `

-- 34-bosqich (v1.8): AI'ni o'rgatish va rollar faqat admin tomonidan yoziladi
drop policy if exists agmk_i on public.agmk_records; drop policy if exists agmk_u on public.agmk_records;
create policy agmk_i on public.agmk_records for insert to authenticated with check ((id <> 'kv:agmk_roles' and kind <> 'teach') or public.agmk_me() = '${ADMIN_TABEL}');
create policy agmk_u on public.agmk_records for update to authenticated using ((id <> 'kv:agmk_roles' and kind <> 'teach') or public.agmk_me() = '${ADMIN_TABEL}');
drop policy if exists agmk_d on public.agmk_records;
create policy agmk_d on public.agmk_records for delete to authenticated using (public.agmk_me() = '${ADMIN_TABEL}');`;
            } catch (e) {}
        })();
        // Zaxira nusxa kartasi faqat adminga (unda barcha xodimlarning maʼlumoti bor)
        (function () { const c = document.querySelector('#screen-settings .btn-card[onclick="exportBackup()"]'); if (c) c.classList.add('set-admin'); })();
        // Huquqlar jadvali (Rollar oynasida)
        function p38Matrix() {
            const cols = [['admin', '👑 Admin'], ['rahbar', 'Rahbariyat'], ['kadr', 'Kadrlar'], ['mm', 'MM'], ['mttb', 'MTTB'], ['bux', 'Bux.'], ['tex', 'Master'], ['xodim', 'Xodim']];
            const has = (a, c) => c === 'admin' ? true : a.who.includes('all') ? true : c === 'xodim' ? (a.who.includes('own') ? 'own' : false) : (a.who.includes(c) || (c === 'rahbar' && a.who.includes('hr'))) ? true : a.who.includes('own') ? 'own' : false;
            return `<div class="p38-wrap"><table class="p38-t"><tr><th>Amal</th>${cols.map(c => `<th>${c[1]}</th>`).join('')}</tr>${PERM38.map(a => `<tr><td>${escapeHtml(a.t)}</td>${cols.map(c => { const v = has(a, c[0]); return `<td class="${v === true ? 'y' : v === 'own' ? 'o' : 'n'}">${v === true ? '✅' : v === 'own' ? '👤' : '—'}</td>`; }).join('')}</tr>`).join('')}</table><div class="p38-lg">✅ ruxsat · 👤 faqat oʻz maʼlumoti · — ruxsat yoʻq. Dispetcherlar (lavozim boʻyicha) harakat tarkibini ham tahrirlaydi.</div></div>`;
        }
        function p38Show() { mdl('p38M', `<div class="px-h"><b>📋 Huquqlar jadvali</b><button class="mini-btn" onclick="mdlClose('p38M')">✕</button></div>` + p38Matrix(), true); }
        (function () {
            if (typeof rolesRender !== 'function') return;
            rolesRender = agmkExtend('rolesRender', '34-bosqich (v1.8): butun ilova boʼyicha huquqlar — bitta nusxa hammaga, har kim oʼz roli d', rolesRender, o => function () { const r = o.apply(this, arguments); const b = $id('rolesBody'); if (b && !$id('p38Btn')) { const d = document.createElement('button'); d.className = 'mini-btn p38-btn'; d.id = 'p38Btn'; d.innerText = '📋 Kim nima qila oladi — huquqlar jadvali'; d.onclick = p38Show; b.prepend(d); } return r; });
        })();
