        // =====================================================================
        // YANGI (11-bosqich): oq tizim oynalari (alert / confirm / prompt) o'rniga dastur oynasi
        // =====================================================================
        const UID = { queue: [], cur: null };
        function uidKind(msg, type) {
            const m = String(msg || '');
            if (type === 'confirm' && /o'chiril|o‘chiril|chiqasiz|almashtiriladi|butunlay/i.test(m)) return { cls: 'danger', icon: /chiqasiz/.test(m) ? '🚪' : '🗑', title: /chiqasiz/.test(m) ? 'Chiqish' : 'Tasdiqlang', danger: true };
            if (type === 'confirm' || type === 'prompt') return { cls: '', icon: '❓', title: type === 'prompt' ? "Ma'lumot kiriting" : 'Tasdiqlang' };
            if (/^\s*(✅|🧹|🚨|🛠)|muvaffaqiyat|saqlandi|qo'shildi|yuklandi|yuklab olindi|o'chirildi|tiklandi|o'rnatildi|o'zgartirildi|o'tdingiz/i.test(m)) return { cls: 'ok', icon: '✅', title: 'Bajarildi' };
            if (/^\s*🔒/.test(m)) return { cls: 'warn', icon: '🔒', title: 'Ruxsat yo\'q' };
            if (/^\s*(🎤|📶)/.test(m)) return { cls: 'warn', icon: m.trim().slice(0, 2), title: 'Diqqat' };
            return { cls: 'warn', icon: '⚠️', title: 'Diqqat' };
        }
        function uidShowNext() {
            if (UID.cur || !UID.queue.length) return;
            const d = UID.cur = UID.queue.shift();
            const k = uidKind(d.msg, d.type);
            const t = $id('uidTitle');
            t.className = 'uid-title ' + k.cls;
            t.innerText = k.icon + ' ' + k.title;
            $id('uidMsg').innerText = String(d.msg === undefined ? '' : d.msg).replace(/^\s*(✅|⚠️|🔒)\s*/, '');
            const inp = $id('uidInput');
            inp.classList.toggle('hidden', d.type !== 'prompt');
            inp.value = d.type === 'prompt' ? (d.def === undefined || d.def === null ? '' : String(d.def)) : '';
            const b = $id('uidBtns');
            if (d.type === 'alert') b.innerHTML = `<button class="save-btn" onclick="uidClose(true)">Tushunarli</button>`;
            else b.innerHTML = `<button class="save-btn" style="background:#334155;" onclick="uidClose(false)">Bekor qilish</button><button class="save-btn${k.danger ? ' danger' : ''}" onclick="uidClose(true)">${k.danger ? 'Ha' : (d.type === 'prompt' ? 'Saqlash' : 'Ha')}</button>`;
            $id('uiDialog').classList.remove('hidden');
            setTimeout(() => { if (d.type === 'prompt') { inp.focus(); inp.select(); } else { const x = b.querySelector('button:last-child'); if (x) x.focus(); } }, 60);
        }
        function uidClose(ok) {
            const d = UID.cur; if (!d) return;
            UID.cur = null;
            $id('uiDialog').classList.add('hidden');
            if (d.type === 'prompt') d.resolve(ok ? $id('uidInput').value : null);
            else d.resolve(!!ok);
            setTimeout(uidShowNext, 30);
        }
        function uidPush(type, msg, def) { return new Promise(res => { UID.queue.push({ type: type, msg: msg, def: def, resolve: res }); uidShowNext(); }); }
        function uiConfirm(msg) { return uidPush('confirm', msg); }
        function uiPrompt(msg, def) { return uidPush('prompt', msg, def); }
        window.alert = function (msg) { uidPush('alert', msg); };
        document.addEventListener('keydown', e => {
            if (!UID.cur) return;
            if (e.key === 'Enter') { e.preventDefault(); uidClose(true); }
            else if (e.key === 'Escape') { e.preventDefault(); uidClose(false); }
        }, true);

        const DB_KEY = 'agmk_db_v2';
        let currentUser = { name: "Mehmon", role: "Tizimga kiring" };
        let activeStatusFilter = "Barchasi";
        let activeTypeFilter = "Barchasi";
        let activeVagonId = null;
        let currentSectionType = "";
        let currentSectionTitle = "";
        let currentSubUnit = "";
        let activeItemId = null;
        let aiContext = "";

        let viewerImagesList = [];
        let viewerAuthorsList = [];
        let viewerCurrentIndex = 0;

        // ============ XAVFSIZLIK: HTML ESCAPE ============
        // Foydalanuvchi kiritgan har qanday matn innerHTML ichiga qo'yilishidan oldin
        // shu funksiya orqali o'tkaziladi — aks holda XSS (zararli skript kiritish) xavfi bor edi.
        function escapeHtml(str) {
            if (str === null || str === undefined) return "";
            return String(str)
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#39;");
        }

        const subUnits11 = [
            "Boshqarma",
            "TYS-1/ЖДЦ-1",
            "TYS-2/ЖДЦ-2",
            "TYS-3/ЖДЦ-3",
            "TYS-4/ЖДЦ-4",
            "VH/ВС",
            "SMBvaAX / СЦБ",
            "KTUX/СПТО",
            "NQMK/КНСМ",
            "KT /КС",
            "IQX/СВО"
        ];

        const rawVagonlarList = [
            [8113, "37550", 1979, "Dumpkar 2VS-105", "TYS-1/ЖДЦ-1"],
            [8121, "37557", 1979, "Dumpkar 2VS-105", "TYS-2/ЖДЦ-2"],
            [8143, "37575", 1979, "Dumpkar 6VS-60", "Boshqarma"],
            [8130, "37562", 1979, "Yopiq yuk vagoni", "TYS-3/ЖДЦ-3"],
            [8099, "37539", 1979, "Poluvagon", "VH/ВС"],
            [8150, "37580", 1982, "Sisterna", "TYS-4/ЖДЦ-4"],
            [8162, "37591", 1985, "Platforma", "SMBvaAX / СЦБ"],
            [8175, "37604", 1988, "Xopper", "KTUX/СПТО"],
            [8188, "37618", 1990, "Izotermik/ Refrijeratli vagon", "NQMK/КНСМ"],
            [8201, "37630", 1995, "Yo'lovchi vagoni", "KT /КС"]
        ];

        let vagonlarData = rawVagonlarList.map((item, index) => {
            let initialStatus = "Soz";
            if (index % 3 === 0) initialStatus = "Yaqin";
            else if (index % 7 === 0) initialStatus = "Ta'mir talab";
            else if (index === 4) initialStatus = "Tamirda";

            return {
                id: item[0],
                inv: item[1],
                type: item[3],
                yil: item[2],
                seh: item[4],
                tamirTuri: "Depo ta'miri (DR)",
                tamirSanasi: "2025-06-15",
                keyingi: "2026-06-15",
                status: initialStatus,
                kun: 0,
                sortOrder: index + 1,
                history: [],
                gallery: [],
                rahbarIzoh: "",
                rahbarImgs: []
            };
        });

        let sectionItemsDB = { xodim: {}, seh: {}, uskuna: {} };

        subUnits11.forEach((su, idx) => {
            sectionItemsDB.xodim[su] = [
                {
                    id: idx*10 + 1, name: "Alisher Karimov", inv: "3547", tabel: "3547",
                    lavozim: "Teplavoz mashinisti", birthDate: "1980-05-20", yil: 1980, seh: su,
                    status: "Soz", kirganSana: "2010-06-14", photo: null,
                    workHistory: [
                        { start: "2010-06-14", end: "2012-10-18", lavozim: "Chilangar", seh: su },
                        { start: "2012-10-19", end: "2015-12-15", lavozim: "Mashinist yordamchisi", seh: su },
                        { start: "2015-12-16", end: "", lavozim: "Teplavoz mashinisti", seh: "TYS-2/ЖДЦ-2" }
                    ],
                    yutuqlar: [], hafsanalar: [], tatillar: [],
                    spravka: null, oilaviy: "Yaxshi", izoh: "", oilaAzolari: "",
                    history: [], gallery: []
                },
                {
                    id: idx*10 + 2, name: "Sardor Rahimov", inv: "4120", tabel: "4120",
                    lavozim: "Uchastka ustasi", birthDate: "1992-03-10", yil: 1992, seh: su,
                    status: "Soz", kirganSana: "2015-06-01", photo: null,
                    workHistory: [], yutuqlar: [], hafsanalar: [], tatillar: [],
                    spravka: null, oilaviy: "O'rta", izoh: "", oilaAzolari: "",
                    history: [], gallery: []
                }
            ];
            sectionItemsDB.seh[su] = [
                { id: idx*100 + 1, name: su + " Asosiy binosi", inv: "SEH-01", yil: 2005, status: "Soz", model: "Ishlab chiqarish uzel", tamirSanasi: "2025-03-01", history: [], gallery: [], rahbarIzoh: "Hududni nazoratga olish", rahbarImgs: [] }
            ];
            sectionItemsDB.uskuna[su] = [
                { id: idx*1000 + 1, name: "Tokarlik stanok 16K20", inv: "ST-10" + idx, yil: 2012, status: "Soz", model: "Universal", tamirSanasi: "2025-01-10", history: [], gallery: [] },
                { id: idx*1000 + 2, name: "Ekskavator CAT 320", inv: "TEK-20" + idx, yil: 2018, status: "Ta'mir talab", model: "Maxsus texnika", tamirSanasi: "2024-11-05", history: [], gallery: [] }
            ];
        });

        // ============ ORTGA/OLDINGA QAYTARISH (UNDO/REDO) TIZIMI ============
        // Har safar saveDB() chaqirilganda, o'zgarishdan OLDINGI holat avtomatik undoStack'ga yoziladi.
        // Shu tufayli har bir mavjud "qo'shish/o'chirish/tahrirlash" funksiyasi alohida bir narsa
        // yozib qo'yishi shart emas — hammasi saveDB() orqali avtomatik ta'minlanadi.
        let undoStack = [];
        let redoStack = [];
        const MAX_HISTORY = 30;

        function updateUndoRedoButtons() {
            const u = document.getElementById('btn-undo');
            const r = document.getElementById('btn-redo');
            if (u) u.disabled = undoStack.length === 0;
            if (r) r.disabled = redoStack.length === 0;
        }

        function currentStateRaw() {
            return localStorage.getItem(DB_KEY) || JSON.stringify({ vagonlar: vagonlarData, sections: sectionItemsDB });
        }

        function applyStateFromRaw(raw) {
            try {
                const p = JSON.parse(raw);
                vagonlarData = p.vagonlar || [];
                sectionItemsDB = p.sections || { xodim: {}, seh: {}, uskuna: {} };
                migrateData();
                vagonlarData.forEach(recalcVagonStatus);
                localStorage.setItem(DB_KEY, raw);
                refreshCurrentScreen();
            } catch (e) {
                alert("Tarixni tiklashda xatolik yuz berdi.");
            }
        }

        function undoAction() {
            if (undoStack.length === 0) return;
            redoStack.push(currentStateRaw());
            const prevRaw = undoStack.pop();
            applyStateFromRaw(prevRaw);
            updateUndoRedoButtons();
        }

        function redoAction() {
            if (redoStack.length === 0) return;
            undoStack.push(currentStateRaw());
            const nextRaw = redoStack.pop();
            applyStateFromRaw(nextRaw);
            updateUndoRedoButtons();
        }

        // Joriy ochiq ekranni yangilangan ma'lumotlar bilan qayta chizadi
        function refreshCurrentScreen() {
            filterVagonlar();
            if (document.getElementById('screen-xt') && document.getElementById('screen-xt').classList.contains('active') && typeof xtRender === 'function') xtRender();
            if (document.getElementById('screen-vagon-pasport').classList.contains('active')) {
                const v = vagonlarData.find(x => x.id === activeVagonId);
                if (v) openPassport(v.id); else openScreen('screen-vagonlar');
            }
            if (document.getElementById('screen-section-items').classList.contains('active')) {
                renderSectionItems();
            }
            if (document.getElementById('screen-item-pasport').classList.contains('active')) {
                const list = (sectionItemsDB[currentSectionType] && sectionItemsDB[currentSectionType][currentSubUnit]) || [];
                const item = list.find(x => x.id === activeItemId);
                if (item) openItemPasport(item.id); else openScreen('screen-section-items');
            }
        }

        // ============ MA'LUMOTLAR BAZASI: SAQLASH / YUKLASH ============
        // recordHistory=false berilsa (masalan undo/redo ichida), tarixga yozilmaydi.
        function saveDB(recordHistory) {
            if (recordHistory !== false) {
                const prevRaw = localStorage.getItem(DB_KEY);
                if (prevRaw !== null) {
                    undoStack.push(prevRaw);
                    if (undoStack.length > MAX_HISTORY) undoStack.shift();
                    // v3.0: xotira chegarasi — baza kattalashganda ham telefon qotmasin (≈12 MB dan oshmaydi, kamida 3 qadam)
                    let t = undoStack.reduce((a, s) => a + s.length, 0); while (undoStack.length > 3 && t > 6e6) t -= undoStack.shift().length;
                    redoStack = [];
                }
            }
            try {
                localStorage.setItem(DB_KEY, JSON.stringify({ vagonlar: vagonlarData, sections: sectionItemsDB }));
            } catch(e) {
                alert("⚠️ Xotira to'ldi! Rasmlar hajmini kamaytiring yoki eski rasmlarni o'chiring.");
            }
            updateUndoRedoButtons();
        }

        function loadDB() {
            const d = localStorage.getItem(DB_KEY);
            if (d) {
                try {
                    const p = JSON.parse(d);
                    if (p.vagonlar && p.vagonlar.length) vagonlarData = p.vagonlar;
                    if (p.sections) sectionItemsDB = p.sections;
                } catch(e) {}
            }
        }

        // Eski saqlangan ma'lumotlarni yangi formatga moslash (migratsiya)
        function migrateData() {
            vagonlarData.forEach((v, i) => {
                if (!v.gallery) v.gallery = [];
                if (!v.history) v.history = [];
                if (!v.rahbarImgs) v.rahbarImgs = [];
                if (v.rahbarIzoh === undefined) v.rahbarIzoh = "";
                if (v.sortOrder === undefined || v.sortOrder === null) v.sortOrder = i + 1;
            });
            Object.keys(sectionItemsDB).forEach(t => {
                Object.keys(sectionItemsDB[t]).forEach(su => {
                    (sectionItemsDB[t][su] || []).forEach(it => {
                        if (!it.history) it.history = [];
                        if (!it.gallery) it.gallery = [];
                        if (t === 'xodim') {
                            if (it.lavozim === undefined) it.lavozim = it.inv || "—";
                            if (it.tabel === undefined) it.tabel = it.inv || "—";
                            if (it.inv === undefined) it.inv = it.tabel;
                            if (it.birthDate === undefined) it.birthDate = it.birthYear ? (it.birthYear + "-07-01") : "";
                            if (it.seh === undefined) it.seh = su;
                            if (it.kirganSana === undefined) it.kirganSana = it.kirganYil ? (it.kirganYil + "-01-01") : "";
                            if (it.photo === undefined) it.photo = null;
                            if (!it.workHistory) it.workHistory = [];
                            if (!it.yutuqlar) it.yutuqlar = [];
                            if (!it.hafsanalar) it.hafsanalar = [];
                            if (!it.tatillar) it.tatillar = [];
                            if (it.spravka === undefined) it.spravka = null;
                            if (it.oilaviy === undefined) it.oilaviy = "Yaxshi";
                            if (it.izoh === undefined) it.izoh = "";
                            if (it.oilaAzolari === undefined) it.oilaAzolari = "";
                        }
                        if (t === 'seh') {
                            if (!it.rahbarImgs) it.rahbarImgs = [];
                            if (it.rahbarIzoh === undefined) it.rahbarIzoh = "";
                        }
                    });
                });
            });
        }

        // ============ RASM SIQISH (xotirani tejash) ============
        function legacyProcessImage(file, cb) {
            const r = new FileReader();
            r.onload = e => {
                const img = new Image();
                img.onload = () => {
                    const MAX = 1000;
                    let w = img.width, h = img.height;
                    if (w > MAX || h > MAX) {
                        const s = Math.min(MAX / w, MAX / h);
                        w = Math.round(w * s); h = Math.round(h * s);
                    }
                    const c = document.createElement('canvas');
                    c.width = w; c.height = h;
                    c.getContext('2d').drawImage(img, 0, 0, w, h);
                    cb(c.toDataURL('image/jpeg', 0.72));
                };
                img.src = e.target.result;
            };
            r.readAsDataURL(file);
        }

        // ============ KUNLARNI AVTO-HISOSLASH ============
        // Avtomatik holat hisoblash:
        // > 90 kun qoldi  -> Soz (yashil)
        // 31-90 kun qoldi -> Yaqin (sariq)
        // <= 30 kun qoldi yoki muddat o'tgan -> Ta'mir talab (qizil)
        // "Tamirda" holati esa faqat qo'lda (bitta tugma bilan) belgilanadi va avto-hisoblashga bo'ysunmaydi.
        /** 4.8: oxirgi taʼmir — vagonlarda DR (tamirSanasi) va KR (kr) dan kechrogʻi; boshqa texnikada faqat tamirSanasi */
        function agmkLastRep(v) {
            const d = String(v && v.tamirSanasi || '').slice(0, 10), k = v && !v.kind && /^\d{4}-\d{2}-\d{2}/.test(String(v.kr || '')) ? String(v.kr).slice(0, 10) : '';
            return k && k > d ? { d: k, t: 'KR' } : { d: d, t: d ? 'DR' : '' };
        }
        function recalcVagonStatus(v) {
            if (v.ppr && typeof applyPpr === 'function') applyPpr(v);
            if (typeof vTypeNorm === 'function') vTypeNorm(v);
            // 4.8: vagonlarda keyingi DR — oxirgi DR va oxirgi KR dan qaysi biri KECHROQ boʻlsa, oʻshandan (muallif qoidasi)
            if (typeof drMonths === 'function') {
                const lr = agmkLastRep(v), mm = typeof vDrMonths === 'function' ? vDrMonths(v) : drMonths(v.type);
                if (v.drAuto) v.keyingi = lr.d ? addMonthsISO(lr.d, mm) : '';
                else if (lr.t === 'KR' && !v.vgMove && !(v.man && v.man.keyingi && String(v.man.keyingi).slice(0, 10) >= lr.d)) { const kn = addMonthsISO(lr.d, mm); if (!v.keyingi || v.keyingi < kn) v.keyingi = kn; }
            }
            if (v.status === "Tamirda") { v.kun = null; return; }
            const today = new Date(); today.setHours(0, 0, 0, 0);
            const k = new Date((v.keyingi || "") + "T00:00:00");
            if (isNaN(k)) { if (v.src && !v.kind) { v.kun = null; v.status = "Ta'mir talab"; } else if (v.kind) { v.kun = null; v.status = "Soz"; } else { v.kun = 0; v.status = "Soz"; } return; }
            const diff = Math.round((k - today) / 86400000);
            v.kun = diff;
            const lim = v.kind === 'yol' ? [3, 10] : [30, 90];
            if (diff <= lim[0]) v.status = "Ta'mir talab";
            else if (diff <= lim[1]) v.status = "Yaqin";
            else v.status = "Soz";
        }

        // Bitta tugma bilan: vagonni darhol "Tamirda" holatiga o'tkazish (muddatidan qat'iy nazar)
        async function markVagonAsTamirda() {
            let v = vagonlarData.find(item => item.id === activeVagonId);
            if (!v) return;
            // 2 savol: qanday ta'mir turi va qaysi uchastka (kunlik polojeniya shundan tuziladi)
            const a = typeof polAskRepair === 'function' ? await polAskRepair(v) : ((await uiConfirm("Vagon № " + vagonNo(v) + " \"Tamirda\" holatiga o'tkazilsinmi?")) ? {} : null);
            if (!a) return;
            if (!v.history) v.history = [];
            const hm = nowHM(); v.history.unshift({ date: todayISO(), type: "🔧 Ta'mirga yuborildi" + (a.rt ? ' (' + POL_RT[a.rt] + ', ' + a.uch + ')' : '') + " (" + hm + ")", author: authorStr(), ev: 'in', rt: a.rt || '', uch: a.uch || '', hm: hm, src: 'pol' });
            v.status = "Tamirda";
            v.kun = null;
            if (a.rt) v.pol = { rt: a.rt, uch: a.uch, since: todayISO(), at: new Date().toISOString(), by: authorStr() }; // kim, qachon (soat:daqiqa), qayerga
            // ta'mir grafigida kelgusi oyga rejalashtirilgan bo'lsa — nosozlik tufayli joriy oyga
            try { const d = typeof pprDB === 'function' ? pprDB() : null; if (d) { const cur = pprCurM(), no = pprNo(vagonNo(v)); const f = pprFind(d, no, pprAddM(cur, 1))[0]; if (f && !pprFind(d, no).some(z => z.m === cur)) { pprMove(d, no, cur, 'nosozlik tufayli'); pprSave(d); showToast('🗓 №' + vagonNo(v) + ' grafikda ' + pprMName(f.m) + ' → ' + pprMName(cur) + ' (nosozlik)'); } } } catch (e) { console.error(e); }
            saveDB();
            if (typeof hrOnTamir === 'function') hrOnTamir(v);
            openPassport(v.id);
            filterVagonlar();
            showToast("✅ Vagon № " + vagonNo(v) + " ta'mirga yuborildi");
        }

        // Vagonni "Tamirda" holatidan chiqarib, sanaga qarab avto-holatga qaytarish
        async function restoreVagonFromTamirda() {
            let v = vagonlarData.find(item => item.id === activeVagonId);
            if (!v) return;
            if (typeof polRelease === 'function') { if (await polRelease(v.id)) { try { openPassport(v.id); } catch (e) {} } return; } // qaysi sehga — polojeniyaga vaqt va kim bilan yoziladi
            if (!await uiConfirm("Vagon № " + vagonNo(v) + " ta'mirdan chiqarilib, avto-holatga qaytarilsinmi?")) return;
            if (!v.history) v.history = [];
            v.history.unshift({ date: todayISO(), type: "✅ Ta'mirdan chiqarildi (" + nowHM() + ")", author: authorStr() });
            v.status = "Auto";
            recalcVagonStatus(v);
            saveDB();
            openPassport(v.id);
            filterVagonlar();
            showToast("✅ Vagon № " + vagonNo(v) + " ta'mirdan chiqarildi — holati: " + v.status);
        }

        function authorStr() { return currentUser.name + " (" + currentUser.role + ")"; }

        // Aniq sana (kun-oy-yil) asosida yosh yoki staj hisoblash — faqat yilni ayirish emas,
        // tug'ilgan/ishga kirgan kun hali kelmagan bo'lsa bir yosh/yil kam ko'rsatiladi.
        function computeAgeFromDate(dateStr) {
            if (!dateStr) return null;
            const b = new Date(dateStr + "T00:00:00");
            if (isNaN(b)) return null;
            const today = new Date(); today.setHours(0, 0, 0, 0);
            let years = today.getFullYear() - b.getFullYear();
            const m = today.getMonth() - b.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < b.getDate())) years--;
            return years;
        }

        // ============ ILOVA YUKLANGANDA ============
        window.onload = function() {
            loadDB();
            migrateData();
            vagonlarData.forEach(recalcVagonStatus);
            updateUndoRedoButtons();

            document.getElementById('new-tamir-date').value = new Date().toISOString().slice(0, 10);
            document.getElementById('new-item-tamir-date').value = new Date().toISOString().slice(0, 10);

            setTimeout(function() {
                const splash = document.getElementById('splash-screen');
                splash.style.opacity = '0';
                setTimeout(function() {
                    splash.classList.add('hidden');
                }, 300);
            }, 2000);
            filterVagonlar();

            document.getElementById('globalSearchInput').addEventListener('input', filterMainMenu);
            initShtat();
            initRoleCombo();
            placeUndoBar(document.querySelector('.screen.active'));
            window.addEventListener('resize', alignUndoBar);
            initShtatTree();
            initAuth();
            importVagons2026();
            importLok2023();
            importTep2026();
            importAvto2027();
            importYol2026();
            importInfra2023();
            renderTypeTabs();
            filterVagonlar();
            xtAutoAssign();
            migrateOldRahbar();
            initXpCombo();
            initRzCombo();
            initPhotoViewer();
            initMedia();
        };

        // ============ BOSH SAHIFA QIDIRUVI ============
        function filterMainMenu() {
            const q = (document.getElementById('globalSearchInput').value || "").toLowerCase().trim();
            const cards = document.querySelectorAll('#main-card-list .btn-card');
            let visibleCount = 0;
            cards.forEach(card => {
                const key = (card.getAttribute('data-search') || "").toLowerCase();
                const match = q === "" || key.includes(q);
                card.style.display = match ? "" : "none";
                if (match) visibleCount++;
            });
            document.getElementById('main-search-empty').classList.toggle('hidden', visibleCount !== 0);
        }

        // ============ BILDIRISHNOMALAR ============
        function checkNotifications() {
            const t = onlyVagons().filter(v => v.status === "Ta'mir talab");
            const y = onlyVagons().filter(v => v.status === "Yaqin");
            if (t.length > 0 || y.length > 0) {
                let html = "";
                if (t.length > 0) {
                    html += "<div style='color:#f87171;'>🔴 <b>Ta'mir talab (" + t.length + " ta):</b><br>" +
                            t.map(v => "Vagon №" + escapeHtml(vagonNo(v)) + " (" + (v.kun < 0 ? Math.abs(v.kun) + " kun o'tdi" : v.kun + " kun") + ")").join("<br>") + "</div>";
                }
                if (y.length > 0) {
                    html += "<div style='color:#facc15; margin-top:10px;'>🟡 <b>Muddati yaqin (" + y.length + " ta):</b><br>" +
                            y.map(v => "Vagon №" + escapeHtml(vagonNo(v)) + " (" + v.kun + " kun qoldi)").join("<br>") + "</div>";
                }
                document.getElementById('notifBody').innerHTML = html;
                document.getElementById('notifModal').classList.remove('hidden');
            }
        }

        // ============ FOYDALANUVCHI ============
        function saveUserSession() {
            const name = document.getElementById('loginNameInput').value.trim();
            const role = document.getElementById('loginRoleInput').value;
            if (!name) { alert("Ism kiriting!"); return; }
            if (!role) { alert("Lavozimni ro'yxatdan tanlang!"); openRoleList(); return; }
            currentUser = { name: name, role: role };
            localStorage.setItem('agmk_current_user', JSON.stringify(currentUser));
            document.getElementById('currentUserName').innerText = name;
            document.getElementById('currentUserRole').innerText = role;
            document.getElementById('userModal').classList.add('hidden');
            checkNotifications();
        }

        function openScreen(screenId) {
            document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
            const el = document.getElementById(screenId);
            el.classList.add('active');
            el.querySelectorAll('div').forEach(d => {
                if (d.style.overflowY === 'auto' || getComputedStyle(d).overflowY === 'auto') d.scrollTop = 0;
            });
            afterScreenOpen(el);
        }

        function setStatusFilter(status) {
            activeStatusFilter = status;
            filterVagonlar();
        }

        function setTypeFilter(type, element) {
            activeTypeFilter = type;
            if (typeof activeModelFilter !== 'undefined') { activeModelFilter = 'Barchasi'; vgLimit = 60; }
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            if (element) element.classList.add('active');
            if (typeof renderModelChips === 'function') renderModelChips();
            filterVagonlar();
        }

        function updateSortOrder(vagonId, inputVal) {
            let newOrder = parseInt(inputVal);
            if (isNaN(newOrder)) return;
            let v = vagonlarData.find(item => item.id === vagonId);
            if (v) { v.sortOrder = newOrder; saveDB(); filterVagonlar(); }
        }

        function updateStats(data) {
            const jami = data.length;
            const soz = data.filter(v => v.status === "Soz").length;
            const yaqin = data.filter(v => v.status === "Yaqin").length;
            const tamirTalab = data.filter(v => v.status === "Ta'mir talab").length;
            const tamirda = data.filter(v => v.status === "Tamirda").length;

            document.getElementById('stat-jami').innerText = jami;
            document.getElementById('stat-soz').innerText = soz;
            document.getElementById('stat-yaqin').innerText = yaqin;
            document.getElementById('stat-tamir').innerText = tamirTalab;
            document.getElementById('stat-tamirda').innerText = tamirda;
        }

        function filterVagonlar(keepLimit) {
            if (typeof updateWarnBadge === 'function') setTimeout(updateWarnBadge, 0);
            if (keepLimit !== true && typeof vgLimit !== 'undefined') vgLimit = 60;
            const searchText = (document.getElementById('mainSearchInput').value || "").toLowerCase().trim();
            let filtered = vagonlarData.filter(v => !v.kind).filter(v => {
                let matchStatus = (activeStatusFilter === "Barchasi" || v.status === activeStatusFilter);
                let matchType = (activeTypeFilter === "Barchasi" || v.type === activeTypeFilter);
                let matchModel = (typeof activeModelFilter === 'undefined' || activeModelFilter === "Barchasi" || (v.model || '—') === activeModelFilter);
                let matchSearch = typeof vagonMatches === 'function' ? vagonMatches(v, searchText) : (v.id.toString().includes(searchText) || (v.inv || "").toLowerCase().includes(searchText));
                return matchStatus && matchType && matchModel && matchSearch;
            });

            filtered.sort((a, b) => a.sortOrder - b.sortOrder);
            renderVagonlar(filtered);
            updateStats(onlyVagons());
        }


        // ============ YANGI VAGON QO'SHISH ============
        function openAddVagonModal() {
            const maxId = vagonlarData.length ? Math.max(...vagonlarData.map(v => v.id)) : 0;
            const maxOrder = vagonlarData.length ? Math.max(...vagonlarData.map(v => v.sortOrder || 0)) : 0;
            document.getElementById('add-id').value = '';
            document.getElementById('add-inv').value = "";
            document.getElementById('add-yil').value = "";
            document.getElementById('add-tamir-sanasi').value = new Date().toISOString().slice(0, 10);
            const nextYear = new Date(); nextYear.setFullYear(nextYear.getFullYear() + 1);
            document.getElementById('add-keyingi').value = nextYear.toISOString().slice(0, 10);
            document.getElementById('addVagonModal').dataset.sortOrder = maxOrder + 1;
            document.getElementById('addVagonModal').classList.remove('hidden');
        }

        async function addNewVagon() {
            const num = String(document.getElementById('add-id').value || '').trim();
            const inv = document.getElementById('add-inv').value.trim();
            if (!num || !inv) { alert("Vagon raqami va Inventar № kiritilishi shart!"); return; }
            const addType = document.getElementById('add-model').value;
            if (vagonlarData.some(v => v.type === addType && vagonNo(v) === num)) { alert("Bu turdagi shu raqamli vagon allaqachon mavjud!"); return; }
            const id = (vagonlarData.length ? Math.max(...vagonlarData.map(v => v.id)) : 0) + 1;
            if (!await uiConfirm("Yangi vagon qo'shilsinmi?")) return;

            const statusSel = document.getElementById('add-status').value;
            const v = {
                id: id, num: num,
                inv: inv,
                type: document.getElementById('add-model').value,
                seh: document.getElementById('add-seh').value,
                yil: parseInt(document.getElementById('add-yil').value) || 0,
                tamirTuri: document.getElementById('add-tamir-turi').value,
                tamirSanasi: document.getElementById('add-tamir-sanasi').value,
                keyingi: document.getElementById('add-keyingi').value,
                status: statusSel === "Tamirda" ? "Tamirda" : "Soz",
                kun: 0,
                sortOrder: parseInt(document.getElementById('addVagonModal').dataset.sortOrder) || (vagonlarData.length + 1),
                history: [], gallery: [], rahbarIzoh: "", rahbarImgs: []
            };
            recalcVagonStatus(v);
            vagonlarData.push(v);
            saveDB();
            document.getElementById('addVagonModal').classList.add('hidden');
            filterVagonlar();
            alert("Yangi vagon muvaffaqiyatli qo'shildi!");
        }

        // ============ EKSPORT / IMPORT ============
        function downloadFile(content, name, type) {
            const a = document.createElement('a');
            a.href = URL.createObjectURL(new Blob([content], { type: type }));
            a.download = name;
            a.click();
        }

        function csvEscape(val) {
            let s = String(val === null || val === undefined ? "" : val);
            if (/[";\n]/.test(s)) s = '"' + s.replace(/"/g, '""') + '"';
            return s;
        }

        function exportCSV() {
            let rows = [["Tartib", "Vagon №", "Inventar", "Turi", "Model", "Nomi", "Ishlab chiqaruvchi", "Seh", "Yil", "Qo'llanilishi", "Holat", "Qoldiq kun", "Oxirgi DR", "Keyingi DR", "Oxirgi KR", "Muddat uzaytirilgan", "Texnik yechim", "Kim uzaytirgan"]];
            onlyVagons().sort((a, b) => a.sortOrder - b.sortOrder).forEach(v => {
                rows.push([v.sortOrder, vagonNo(v), v.inv, v.type, v.model || '', v.naim || '', v.maker || '', v.seh, v.yil, v.primen || '', v.status, (v.status === "Tamirda" || v.kun === null ? "-" : v.kun), fmtISO(v.tamirSanasi) || v.drTxt || '', fmtISO(v.keyingi), fmtISO(v.kr) || v.krTxt || '', v.srok || '', v.tr || '', v.kem || '']);
            });
            downloadFile('\uFEFF' + rows.map(r => r.map(csvEscape).join(';')).join('\n'), 'vagonlar_' + new Date().toISOString().slice(0, 10) + '.csv', 'text/csv');
        }

        function exportBackup() { return bkExport(); } // v3.0: toʻliq zaxira (mod/backup.js)

        function importBackupTrigger() { document.getElementById('backup-input').click(); }

        function importBackup(input) {
            if (!input.files || !input.files[0]) return;
            if (!/\.json$/i.test(input.files[0].name)) { const f = input.files[0]; input.value = ''; bkImportFile(f).catch(e => { console.error(e); alert('Zaxirani tiklab boʻlmadi: ' + agmkErrUz(e)); }); return; } // v3.0 toʻliq zaxira
            const r = new FileReader();
            r.onload = async e => {
                try {
                    const p = JSON.parse(e.target.result);
                    if (!p.vagonlar) throw "xato";
                    if (!await uiConfirm("Diqqat! Joriy barcha ma'lumotlar zaxira nusxadagi ma'lumotlar bilan ALMASHTIRILADI. Davom etasizmi?")) { input.value = ''; return; }
                    vagonlarData = p.vagonlar;
                    if (p.sections) sectionItemsDB = p.sections;
                    if (Array.isArray(p.shtatlar) && p.shtatlar.length) { shtatList = p.shtatlar; saveShtat(); }
                    migrateData();
                    vagonlarData.forEach(recalcVagonStatus);
                    saveDB();
                    filterVagonlar();
                    alert("Ma'lumotlar muvaffaqiyatli tiklandi!");
                } catch (err) {
                    alert("Fayl formati noto'g'ri!");
                }
                input.value = '';
            };
            r.readAsText(input.files[0]);
        }

        // ============ VAGON PASPORTI ============
        function openPassport(vagonId) {
            activeVagonId = vagonId;
            let v = vagonlarData.find(item => item.id === vagonId);
            if (!v) return;
            recalcVagonStatus(v);

            const isAv = v.kind === 'avto' || v.kind === 'yol' || v.kind === 'infra';
            document.getElementById('screen-vagon-pasport').classList.toggle('pp-infra', v.kind === 'infra');
            document.getElementById('p-extra-title').innerText = v.kind === 'infra' ? "📄 Texnik pasport ma'lumotlari (2023)" : "📄 Kartoteka ma'lumotlari (Excel)";
            document.getElementById('pasport-header-title').innerText = isAv ? (v.kind === 'infra' ? v.naim : v.kind === 'yol' ? v.marka + ' № ' + v.zav : (v.gos || v.naim)) : ((isLok(v) ? v.type : "Vagon") + " № " + vagonNo(v));
            document.getElementById('pasportMainTitle').innerText = v.kind === 'infra' ? (v.infraId.indexOf('pr_') === 0 ? "🛤️ Peregon pasporti" : "🚉 Obyekt pasporti") : isAv ? "📋 Texnika Pasporti va Holati" : (isLok(v) ? "📋 Lokomotiv Pasporti va Holati" : "📋 Vagon Pasporti va Holati");
            document.getElementById('pasportBackBtn').innerText = v.kind === 'infra' ? "‹ Xaritaga" : isAv ? "‹ Texnikalar ro'yxatiga" : (isLok(v) ? "‹ Lokomotivlar ro'yxatiga" : "‹ Vagonlar ro'yxatiga");
            document.getElementById('p-model-label').innerText = isAv ? "MARKASI" : (isLok(v) ? "SERIYASI" : "VAGON MODELI");
            document.getElementById('pasportGalTitle').innerText = v.kind === 'infra' ? "📸 Rasmlar galereyasi" : isAv ? "📸 Texnika Rasmlari Galereyasi" : (isLok(v) ? "📸 Lokomotiv Rasmlari Galereyasi" : "📸 Vagon Rasmlari Galereyasi");
            document.getElementById('p-inventar').innerText = v.inv;
            document.getElementById('p-model').innerText = isAv ? (v.kind === 'yol' ? v.naim + ' · ' + v.marka : v.naim) : (isLok(v) ? v.type : (v.type + (v.model ? ' · ' + v.model : '')));
            document.getElementById('p-yil').innerText = (v.yil || '—') + (unitAge(v) !== null ? ' (' + unitAge(v) + ' yosh)' : '');
            document.getElementById('p-seh').innerText = v.seh;
            document.getElementById('p-tamir-turi').innerText = v.tamirTuri;
            document.getElementById('p-tamir-sanasi').innerText = fmtISO(v.tamirSanasi) || v.drTxt || '—';
            document.getElementById('p-keyingi').innerText = fmtISO(v.keyingi) || '—';
            document.getElementById('p-seh').innerText = v.seh || '—';
            renderPassportExtra(v);

            let holatSpan = document.getElementById('p-holat');
            holatSpan.innerText = v.status;
            if (v.status === "Soz") holatSpan.style.color = "#4ade80";
            else if (v.status === "Yaqin") holatSpan.style.color = "#facc15";
            else if (v.status === "Ta'mir talab") holatSpan.style.color = "#f87171";
            else if (v.status === "Tamirda") holatSpan.style.color = "#38bdf8";

            document.getElementById('btn-mark-tamirda').classList.toggle('hidden', v.status === "Tamirda");
            document.getElementById('btn-restore-auto').classList.toggle('hidden', v.status !== "Tamirda");

            document.getElementById('rahbar-izoh').value = v.rahbarIzoh || "";
            renderRahbarPreview(v);
            renderGallery(v);
            renderZams(v);
            renderTamirHistory(v);
            openScreen('screen-vagon-pasport');
        }

        async function deleteVagon() {
            let v = vagonlarData.find(item => item.id === activeVagonId);
            if (!v) return;
            if (!await uiConfirm("Diqqat! Vagon № " + vagonNo(v) + " ro'yxatdan butunlay o'chirilsinmi?\n(Xato bo'lsa, tepadagi ↩️ Undo tugmasi orqali qaytarish mumkin)")) return;
            vagonlarData = vagonlarData.filter(x => x.id !== activeVagonId);
            saveDB();
            activeVagonId = null;
            openScreen('screen-vagonlar');
            filterVagonlar();
            alert("Vagon o'chirildi.");
        }

        function openEditModal() {
            let v = vagonlarData.find(item => item.id === activeVagonId);
            if (!v) return;
            document.getElementById('edit-id').value = vagonNo(v);
            ensureTypeOption(v.type);
            document.getElementById('edit-inv').value = v.inv;
            document.getElementById('edit-model').value = v.type;
            document.getElementById('edit-seh').value = v.seh;
            document.getElementById('edit-status').value = v.status;
            document.getElementById('edit-yil').value = v.yil;
            document.getElementById('edit-tamir-turi').value = v.tamirTuri;
            document.getElementById('edit-tamir-sanasi').value = v.tamirSanasi;
            document.getElementById('edit-keyingi').value = v.keyingi;
            document.getElementById('editPassportModal').classList.remove('hidden');
        }

        function closeEditModal() { document.getElementById('editPassportModal').classList.add('hidden'); }

        async function savePassportChanges() {
            let v = vagonlarData.find(item => item.id === activeVagonId);
            if (!v) return;
            const newNum = String(document.getElementById('edit-id').value || '').trim() || vagonNo(v);
            if (newNum !== vagonNo(v) && vagonlarData.some(x => x !== v && x.type === document.getElementById('edit-model').value && vagonNo(x) === newNum)) { alert("Bu turdagi shu raqamli vagon mavjud!"); return; }
            if (!await uiConfirm("O'zgarishlar saqlansinmi?")) return;
            const prevKey = v.keyingi, prevDr = v.tamirSanasi;
            v.num = newNum;
            if (v.kind === 'avto' && v.gos !== undefined) v.gos = newNum;
            v.inv = document.getElementById('edit-inv').value;
            v.type = document.getElementById('edit-model').value;
            v.seh = document.getElementById('edit-seh').value;
            const stSel = document.getElementById('edit-status').value;
            v.yil = parseInt(document.getElementById('edit-yil').value) || v.yil;
            v.tamirTuri = document.getElementById('edit-tamir-turi').value;
            v.tamirSanasi = document.getElementById('edit-tamir-sanasi').value;
            v.keyingi = document.getElementById('edit-keyingi').value;
            if (v.keyingi !== prevKey) { v.drAuto = false; if (v.ppr) { v.pprAuto = false; v.nextLabel = ''; } }              // qo'lda kiritilgan keyingi sana saqlanadi
            else if (v.tamirSanasi !== prevDr && v.src) v.drAuto = true; // oxirgi DR o'zgarsa — keyingisi qayta hisoblanadi
            const wasT = v.status === 'Tamirda';
            if (stSel !== "Auto") v.status = stSel;
            recalcVagonStatus(v);
            try { if (typeof polStatusEv === 'function') polStatusEv(v, wasT); } catch (e) {}
            activeVagonId = v.id;

            saveDB();
            closeEditModal();
            openPassport(v.id);
            filterVagonlar();
            alert("O'zgarishlar muvaffaqiyatli saqlandi!");
        }

        function galleryFileSelected(input) {
            if (input.files && input.files.length > 0) {
                let v = vagonlarData.find(item => item.id === activeVagonId);
                if (v) {
                    if (!v.gallery) v.gallery = [];
                    let count = 0, total = input.files.length;
                    Array.from(input.files).forEach(f => {
                        processImage(f, src => {
                            if (src) v.gallery.unshift({ src: src, author: authorStr() });
                            count++;
                            if (count === total) {
                                saveDB();
                                renderGallery(v);
                                alert(total + " ta rasm yuklandi!");
                            }
                        });
                    });
                }
                input.value = '';
            }
        }

        // Albom: rasmlar setka (to'r) ko'rinishida; bosilgan rasm to'liq ekranda ochiladi
        function renderAlbumPreview(containerId, list, emptyText, onOpen) {
            let container = document.getElementById(containerId);
            if (!container) return;
            if (!list || list.length === 0) {
                container.innerHTML = `<div style="text-align:center; color:#94a3b8; font-size:12px; padding:10px;">${emptyText}</div>`;
                return;
            }
            const MAXC = 9;
            let html = '<div class="album-grid">';
            list.slice(0, MAXC).forEach((x, i) => {
                const more = (i === MAXC - 1 && list.length > MAXC) ? `<span class="album-more">+${list.length - MAXC + 1}</span>` : '';
                html += `<div class="album-cell" onclick="window.__albumStart=${i}; ${onOpen}"><img src="${imgSrc(x)}" alt="">${more}</div>`;
            });
            html += `</div><div class="album-info-badge">Jami: ${list.length} ta</div><div class="image-author-label">Oxirgi: ${escapeHtml(list[0].author || '')}</div>`;
            container.innerHTML = html;
        }

        function renderGallery(v) {
            renderAlbumPreview('vagon-gallery-preview', v.gallery, "Rasmlar yo'q", "openVagonGalleryViewer()");
        }

        function openVagonGalleryViewer() {
            let v = vagonlarData.find(item => item.id === activeVagonId);
            if (v && v.gallery && v.gallery.length > 0) {
                openImageViewerModal(v.gallery.map(x => x.src), v.gallery.map(x => "Kiritdi: " + x.author), 0);
            }
        }

        function rahbarFileSelected(input) {
            if (input.files && input.files.length > 0) {
                let v = vagonlarData.find(item => item.id === activeVagonId);
                if (v) {
                    if (!v.rahbarImgs) v.rahbarImgs = [];
                    let count = 0, total = input.files.length;
                    Array.from(input.files).forEach(f => {
                        processImage(f, src => {
                            if (src) v.rahbarImgs.unshift({ src: src, author: authorStr() });
                            count++;
                            if (count === total) {
                                saveDB();
                                renderRahbarPreview(v);
                                alert("Rahbariyat rasmi yuklandi!");
                            }
                        });
                    });
                }
                input.value = '';
            }
        }

        function renderRahbarPreview(v) {
            renderAlbumPreview('rahbar-img-preview', v.rahbarImgs, "Hozircha rasmlar yo'q.", "openRahbarViewer()");
        }

        function openRahbarViewer() {
            let v = vagonlarData.find(item => item.id === activeVagonId);
            if (v && v.rahbarImgs && v.rahbarImgs.length > 0) {
                openImageViewerModal(v.rahbarImgs.map(x => x.src), v.rahbarImgs.map(x => "Kiritdi: " + x.author), 0);
            }
        }

        function updateVagonRahbarIzoh(input) {
            let v = vagonlarData.find(item => item.id === activeVagonId);
            if (v) { v.rahbarIzoh = input.value; saveDB(); }
        }

        function addNewTamir() {
            let turi = document.getElementById('new-tamir-turi').value;
            let sana = document.getElementById('new-tamir-date').value;
            if (!sana) { alert("Sanani tanlang!"); return; }
            let v = vagonlarData.find(item => item.id === activeVagonId);
            if (v) {
                if (!v.history) v.history = [];
                v.history.unshift({ date: sana, type: turi, author: authorStr() });
                saveDB();
                renderTamirHistory(v);
                alert("Ta'mir tarixi saqlandi!");
            }
        }

        function renderTamirHistory(v) {
            let container = document.getElementById('tamir-history-list');
            container.innerHTML = "";
            if (!v.history || v.history.length === 0) {
                container.innerHTML = `<div style="font-size:12px; color:#94a3b8;">Tarix mavjud emas</div>`;
                return;
            }
            v.history.forEach((h, i) => {
                container.innerHTML += `
                    <div class="history-item">
                        🟢 <b>${escapeHtml(h.date)}</b> — ${escapeHtml(h.type)}
                        <span class="hist-actions"><span onclick="editTamirEntry(${i})">✏️</span><span onclick="deleteTamirEntry(${i})">🗑</span></span>
                        <div class="history-author">Kiritdi: ${escapeHtml(h.author)}</div>
                    </div>
                `;
            });
        }

        async function editTamirEntry(i) {
            let v = vagonlarData.find(item => item.id === activeVagonId);
            if (!v || !v.history[i]) return;
            const h = v.history[i];
            const d = await uiPrompt("Sana (YYYY-MM-DD):", h.date);
            if (d === null) return;
            const t = await uiPrompt("Ta'mir turi:", h.type);
            if (t === null) return;
            h.date = d; h.type = t; h.author = authorStr() + " (tahrirlangan)";
            saveDB(); renderTamirHistory(v);
        }

        async function deleteTamirEntry(i) {
            let v = vagonlarData.find(item => item.id === activeVagonId);
            if (!v) return;
            if (!await uiConfirm("Bu yozuv o'chirilsinmi?")) return;
            v.history.splice(i, 1);
            saveDB(); renderTamirHistory(v);
        }

        // ============ QUYI BO'LIMLAR ============
        function openSubUnits(type, title) {
            currentSectionType = type;
            currentSectionTitle = title;
            document.getElementById('subunits-title').innerText = title;
            const container = document.getElementById('subunits-list-container');
            container.innerHTML = type === 'seh' && typeof polOpen === 'function' ? `<div class="btn-card" onclick="polOpen()" style="border-color:#38bdf8"><div class="btn-card-content"><span class="btn-icon">📋</span><span class="btn-text">Kunlik polojeniya (Vagon xizmati)<span class="set-sub">${polInRepair().length} ta vagon taʼmirda</span></span></div><span class="btn-arrow">›</span></div>` : "";
            subUnits11.forEach(su => {
                container.innerHTML += `
                    <div class="btn-card" onclick="openSectionItems('${su.replace(/'/g, "\\'")}')">
                        <div class="btn-card-content"><span class="btn-text">${escapeHtml(su)}</span></div>
                        <span class="btn-arrow">›</span>
                    </div>
                `;
            });
            openScreen('screen-subunits');
        }

        function openSectionItems(subUnitName) {
            currentSubUnit = subUnitName;
            document.getElementById('items-header-title').innerText = subUnitName;
            renderSectionItems();
            openScreen('screen-section-items');
        }

        function renderSectionItems() {
            const container = document.getElementById('section-items-container');
            container.innerHTML = "";
            let list = sectionItemsDB[currentSectionType][currentSubUnit] || [];
            let search = document.getElementById('itemSearchInput').value.toLowerCase();
            let filtered = list.filter(item => (item.name || "").toLowerCase().includes(search) || String(item.inv || "").toLowerCase().includes(search) || String(item.tabel || "").toLowerCase().includes(search) || phoneMatch(item, search));

            if (filtered.length === 0) {
                container.innerHTML = `<div style="text-align:center; color:#94a3b8; padding:20px;">Ma'lumot topilmadi</div>`;
                return;
            }

            // Xodimlar (ishchi shaxslar) uchun "Soz/Ta'mir talab" kabi texnik holat belgisi mantiqiy emas —
            // shu sabab bu bo'lim uchun status-badge butunlay ko'rsatilmaydi.
            const showBadge = currentSectionType !== 'xodim';

            filtered.forEach(item => {
                let infoHtml = "";
                if (currentSectionType === 'xodim') {
                    const age = computeAgeFromDate(item.birthDate);
                    infoHtml = `Seh: <span>${escapeHtml(currentSubUnit)}</span> | Lavozim: <span>${escapeHtml(item.lavozim)}</span><div class="card-row"><span>Tabel №: <span>${escapeHtml(item.tabel)}</span> | Razryad: <span>${item.razryad ? escapeHtml(item.razryad) : '—'}</span> | Yoshi: <span>${age === null ? '—' : age}</span></span>${item.phone ? `<a class="tel-link card-tel" href="${telHref(item.phone)}">📞 ${escapeHtml(item.phone)}</a>` : ''}</div>`;
                } else {
                    infoHtml = `ID/Inv: <span>${escapeHtml(item.inv)}</span> | Yili: <span>${escapeHtml(item.yil)}</span> | Yoshi: <span>${unitAge(item) === null ? '—' : unitAge(item)}</span>`;
                }
                container.innerHTML += `
                    <div class="vagon-card">
                        <div class="vagon-header-row"><div class="vagon-num">${escapeHtml(item.name)}</div>${showBadge ? `<div class="vagon-badge badge-soz">${escapeHtml(item.status)}</div>` : ``}</div>
                        <div class="vagon-info">${infoHtml}</div>
                        <button class="details-btn" onclick="openItemPasport(${item.id})">Pasport va Rasmlar</button>
                    </div>
                `;
            });
        }

        function getActiveItem() {
            return (sectionItemsDB[currentSectionType][currentSubUnit] || []).find(x => x.id === activeItemId);
        }

        // ============ YANGI ELEMENT QO'SHISH (xodim / seh / uskuna) ============
        function openAddItemModal() {
            document.getElementById('ai-name').value = "";
            document.getElementById('ai-tabel').value = "";
            document.getElementById('ai-lavozim').value = "";
            document.getElementById('aiLavozimSearch').value = "";
            xtResetAddPos();
            document.getElementById('ai-birthdate').value = "";
            document.getElementById('ai-startdate').value = new Date().toISOString().slice(0, 10);
            document.getElementById('ai-inv').value = "";
            document.getElementById('ai-yil').value = "";
            document.getElementById('ai-model').value = "";
            document.getElementById('ai-phone').value = "";

            const isXodim = currentSectionType === 'xodim';
            const isUskuna = currentSectionType === 'uskuna';
            document.getElementById('addItemXodimFields').classList.toggle('hidden', !isXodim);
            document.getElementById('addItemInvFields').classList.toggle('hidden', isXodim);
            document.getElementById('addItemModelField').classList.toggle('hidden', !isUskuna);
            document.getElementById('addItemNameLabel').innerText = isXodim ? "F.I.O:" : "Nomi:";
            document.getElementById('addItemInvLabel').innerText = currentSectionType === 'seh' ? "Kod:" : "Inventar №:";
            document.getElementById('addItemModalTitle').innerText = isXodim ? "➕ Yangi xodim qo'shish" : (currentSectionType === 'seh' ? "➕ Yangi seh/uchastka qo'shish" : "➕ Yangi uskuna qo'shish");
            document.getElementById('addItemModal').classList.remove('hidden');
        }

        async function saveNewItem() {
            const name = document.getElementById('ai-name').value.trim();
            if (!name) { alert("Nomni (F.I.O) kiriting!"); return; }
            if (currentSectionType === 'xodim') {
                const tb = cleanTabel(document.getElementById('ai-tabel').value);
                if (!tb) { alert("Tabel raqami majburiy! U xodimning shaxsiy raqami hisoblanadi."); return; }
                const dup = findXodimsByTabel(tb);
                if (dup.length) { alert("Bu tabel raqami boshqa xodimda bor: " + dup[0].item.name + " (" + dup[0].su + "). Tabel raqami takrorlanmasligi kerak."); return; }
                document.getElementById('ai-tabel').value = tb;
                if (!document.getElementById('ai-lavozim').value) { alert("Lavozimni shtatlar ro'yxatidan tanlang!"); return; }
                const ph = normalizePhone(document.getElementById('ai-phone').value);
                if (ph === null) { alert("Telefon raqami noto'g'ri. +998 XX XXX XX XX ko'rinishida kiriting."); return; }
                document.getElementById('ai-phone').value = ph || '';
            }
            if (!await uiConfirm("Yangi ma'lumot qo'shilsinmi?")) return;

            if (!sectionItemsDB[currentSectionType][currentSubUnit]) sectionItemsDB[currentSectionType][currentSubUnit] = [];
            const list = sectionItemsDB[currentSectionType][currentSubUnit];

            let allIds = [];
            Object.values(sectionItemsDB[currentSectionType]).forEach(arr => (arr || []).forEach(x => allIds.push(x.id)));
            const newId = allIds.length ? Math.max(...allIds) + 1 : Date.now();

            let obj;
            if (currentSectionType === 'xodim') {
                const tabel = document.getElementById('ai-tabel').value.trim() || String(newId);
                const lavozim = document.getElementById('ai-lavozim').value.trim() || "—";
                const birthDate = document.getElementById('ai-birthdate').value || "";
                const startDate = document.getElementById('ai-startdate').value || "";
                obj = {
                    id: newId, name: name, inv: tabel, tabel: tabel, lavozim: lavozim,
                    birthDate: birthDate, seh: currentSubUnit, kirganSana: startDate, photo: null,
                    status: "Soz", workHistory: [], yutuqlar: [], hafsanalar: [], tatillar: [],
                    spravka: null, oilaviy: "Yaxshi", izoh: "", oilaAzolari: "", history: [], gallery: [],
                    phone: document.getElementById('ai-phone').value || '', phones2: [],
                    posNo: (XT.addPos ? XT.addPos.no : null)
                };
            } else if (currentSectionType === 'seh') {
                const inv = document.getElementById('ai-inv').value.trim() || ("SEH-" + newId);
                const yil = parseInt(document.getElementById('ai-yil').value) || new Date().getFullYear();
                obj = { id: newId, name: name, inv: inv, yil: yil, status: "Soz", model: "", tamirSanasi: "", history: [], gallery: [], rahbarIzoh: "", rahbarImgs: [] };
            } else {
                const inv = document.getElementById('ai-inv').value.trim() || ("INV-" + newId);
                const yil = parseInt(document.getElementById('ai-yil').value) || new Date().getFullYear();
                const model = document.getElementById('ai-model').value.trim() || "";
                obj = { id: newId, name: name, inv: inv, yil: yil, status: "Soz", model: model, tamirSanasi: "", history: [], gallery: [] };
            }

            list.push(obj);
            saveDB();
            if (currentSectionType === 'xodim' && XT.addPos) { xtResetAddPos(); setTimeout(xtRender, 0); }
            document.getElementById('addItemModal').classList.add('hidden');
            renderSectionItems();
            alert("Muvaffaqiyatli qo'shildi!");
        }

        async function deleteCurrentItem() {
            const item = getActiveItem();
            if (!item) return;
            if (!await uiConfirm("Diqqat! \"" + item.name + "\" ro'yxatdan butunlay o'chirilsinmi?\n(Xato bo'lsa, tepadagi ↩️ Undo tugmasi orqali qaytarish mumkin)")) return;
            sectionItemsDB[currentSectionType][currentSubUnit] = (sectionItemsDB[currentSectionType][currentSubUnit] || []).filter(x => x.id !== activeItemId);
            saveDB();
            activeItemId = null;
            openScreen('screen-section-items');
            renderSectionItems();
            if (currentSectionType === 'xodim') { openScreen('screen-xt'); xtRender(); }
            alert("O'chirildi.");
        }

        function openItemPasport(itemId) {
            activeItemId = itemId;
            let item = getActiveItem();
            if (!item) return;

            document.getElementById('item-pasport-title').innerText = item.name;
            let grid = document.getElementById('item-passport-grid');

            // Xodim surati bloki
            const photoBox = document.getElementById('xodim-photo-box');
            const xodimExtra = document.getElementById('xodim-extra-container');

            if (currentSectionType === 'xodim') {
                document.getElementById('tamir-section-box').style.display = 'none';
                document.getElementById('tamir-history-box').style.display = 'none';
                document.getElementById('rahbariyat-nazorat-box').style.display = 'none';
                photoBox.classList.remove('hidden');
                xodimExtra.style.display = 'block';

                const age = computeAgeFromDate(item.birthDate);
                const staj = computeAgeFromDate(item.kirganSana);
                grid.innerHTML = `
                    <div>F.I.O: <span>${escapeHtml(item.name)}</span></div>
                    <div>LAVOZIM: <span>${escapeHtml(item.lavozim)}</span></div>
                    <div>TABEL №: <span>${escapeHtml(item.tabel)}</span></div>
                    <div>RAZRYAD: <span>${item.razryad ? escapeHtml(item.razryad) : '—'}</span></div>
                    ${typeof okCan === 'function' && okCan() && item.oklad ? `<div>OKLAD: <span>${escapeHtml(okFmt(item.oklad))}</span></div>` : ''}
                    <div style="grid-column: 1 / -1;">ISH JOYI (SEH): <span>${xtPlaceText(item) || (escapeHtml(currentSubUnit) + (item.bolim ? ' — ' + escapeHtml(item.bolim) : ''))}</span></div>
                    <div>TUG'ILGAN SANASI: <span>${escapeHtml(item.birthDate) || '—'} ${age === null ? '' : '(' + age + ' yosh)'}</span></div>
                    <div>ISHGA KIRGAN SANASI: <span>${escapeHtml(item.kirganSana) || '—'} ${staj === null ? '' : '(' + staj + ' yil staj)'}</span></div>
                    ${phoneGridHtml(item)}
                `;
                renderXodimPhoto(item);
                renderXodimExtra(item);
            } else if (currentSectionType === 'seh') {
                document.getElementById('tamir-section-box').style.display = 'block';
                document.getElementById('tamir-history-box').style.display = 'block';
                document.getElementById('rahbariyat-nazorat-box').style.display = 'block';
                photoBox.classList.add('hidden');
                xodimExtra.style.display = 'none';
                document.getElementById('item-rahbar-izoh').value = item.rahbarIzoh || "";
                renderItemRahbarPreview(item);
                grid.innerHTML = `<div>SEH: <span>${escapeHtml(item.name)}</span></div><div>KOD: <span>${escapeHtml(item.inv)}</span></div>`;
            } else {
                document.getElementById('tamir-section-box').style.display = 'block';
                document.getElementById('tamir-history-box').style.display = 'block';
                document.getElementById('rahbariyat-nazorat-box').style.display = 'none';
                photoBox.classList.add('hidden');
                xodimExtra.style.display = 'none';
                grid.innerHTML = `<div>USKUNA: <span>${escapeHtml(item.name)}</span></div><div>INVENTAR: <span>${escapeHtml(item.inv)}</span></div><div>YILI: <span>${escapeHtml(item.yil || '—')}${unitAge(item) !== null ? ' (' + unitAge(item) + ' yosh)' : ''}</span></div>`;
            }

            renderItemGallery(item);
            renderItemTamirHistory(item);
            document.getElementById('item-gallery-box').style.display = currentSectionType === 'xodim' ? 'none' : '';
            document.getElementById('xodim-edit-btn').classList.toggle('hidden', currentSectionType !== 'xodim');
            openScreen('screen-item-pasport');
        }

        // ============ XODIM SURATI ============
        function renderXodimPhoto(item) {
            const box = document.getElementById('xodim-photo-preview');
            if (item.photo && item.photo.src) {
                box.innerHTML = `<img src="${imgSrc(item.photo)}" class="xodim-photo" onclick="openXodimPhotoViewer()">`;
            } else {
                box.innerHTML = `<div class="xodim-photo-ph">👷</div>`;
            }
        }

        function openXodimPhotoViewer() {
            const item = getActiveItem();
            if (item && item.photo && item.photo.src) {
                openImageViewerModal([item.photo.src], ["Kiritdi: " + item.photo.author], 0);
            }
        }

        function xodimPhotoSelected(input) {
            if (!input.files || !input.files[0]) return;
            const item = getActiveItem();
            if (!item) return;
            processImage(input.files[0], src => {
                if (!src) return;
                item.photo = { src: src, author: authorStr() };
                saveDB();
                renderXodimPhoto(item);
                alert("Surat yuklandi!");
            });
            input.value = '';
        }

        // ============ XODIM ICHKI KARTASI ============
        function renderXodimExtra(item) {
            const c = document.getElementById('xodim-extra-container');
            attResetIfNewItem(item);
            const keep = {};
            ['yutuq-date', 'yutuq-text', 'hafsana-date', 'hafsana-text'].forEach(id => { const el = document.getElementById(id); if (el && ATT.itemId === item.id && c.dataset.item === String(item.id)) keep[id] = el.value; });
            c.dataset.item = String(item.id);

            // Ish faoliyati tarixi
            let wh = "";
            (item.workHistory || []).forEach((h, i) => {
                wh += `<div class="history-item">
                    🔧 <b>${escapeHtml(h.start)}</b> → <b>${escapeHtml(h.end) || "hozirda"}</b><br>${escapeHtml(h.lavozim)} — ${escapeHtml(h.seh)}
                    <span class="hist-actions"><span onclick="editWorkHistory(${i})">✏️</span><span onclick="deleteWorkHistory(${i})">🗑</span></span>
                </div>`;
            });

            // Yutuqlar
            let yt = "";
            (item.yutuqlar || []).forEach((q, i) => {
                yt += `<div class="history-item">🏆 <b>${escapeHtml(q.date)}</b> — ${escapeHtml(q.text)}
                    <span class="hist-actions">${attEntryActions('yutuq', i)}<span onclick="deleteYutuq(${i})">🗑</span></span>${attEntryHtml('yutuq', q, i)}</div>`;
            });

            // Hafsanalar
            let hf = "";
            (item.hafsanalar || []).forEach((q, i) => {
                hf += `<div class="history-item">⚠️ <b>${escapeHtml(q.date)}</b> — ${escapeHtml(q.text)}
                    <span class="hist-actions">${attEntryActions('hafsana', i)}<span onclick="deleteHafsana(${i})">🗑</span></span>${attEntryHtml('hafsana', q, i)}</div>`;
            });

            // Tatillar
            let tt = "";
            (item.tatillar || []).forEach((q, i) => {
                tt += `<div class="history-item">📅 <b>${escapeHtml(q.out)}</b> dan <b>${escapeHtml(q.in)}</b> gacha
                    <span class="hist-actions"><span onclick="deleteTatil(${i})">🗑</span></span></div>`;
            });

            const sehOptions = subUnits11.map(s => `<option value="${escapeHtml(s)}" ${item.seh === s ? 'selected' : ''}>${escapeHtml(s)}</option>`).join('');

            c.innerHTML = `
                <!-- ISH FAOLIYATI TARIXI -->
                <div class="passport-container">
                    <div class="passport-title"><span>🔧 Ish Faoliyati Tarixi (qayerda, qachon, qanday lavozimda)</span></div>
                    <div class="form-row">
                        <div><span class="field-label">Boshlangan sana</span><input type="date" id="wh-start" class="custom-input"></div>
                        <div><span class="field-label">Tugagan sana (bo'sh = hozirda)</span><input type="date" id="wh-end" class="custom-input"></div>
                    </div>
                    <div class="form-row">
                        <div style="grid-column: 1 / -1;"><span class="field-label">Seh / Bo'lim</span><select id="wh-seh" class="custom-select">${sehOptions}</select></div>
                    </div>
                    <div class="wh-lav"><span class="field-label">Lavozim (shtatlar ro'yxatidan)</span>
                        <div class="combo" id="whCombo">
                            <input type="text" id="whLavozimSearch" class="custom-input" placeholder="Lavozimni tanlang yoki qidiring..." autocomplete="off" spellcheck="false">
                            <span class="combo-caret" onpointerdown="event.preventDefault(); comboToggle('wh')">▾</span>
                            <div class="combo-list hidden" id="whLavozimList" role="listbox"></div>
                        </div>
                        <input type="hidden" id="wh-lavozim">
                    </div>
                    <button class="action-btn" onclick="addWorkHistory()">+ Tarixga Kiritish</button>
                    <div style="margin-top:10px;">${wh || '<div style="font-size:12px; color:#94a3b8;">Tarix kiritilmagan</div>'}</div>
                </div>

                <!-- YUTUQLAR -->
                <div class="passport-container">
                    <div class="passport-title"><span>🏆 Ishchi Yutuqlari</span></div>
                    <div class="form-row">
                        <div><span class="field-label">Sana</span><input type="date" id="yutuq-date" class="custom-input"></div>
                        <div><span class="field-label">Yutuq</span><input type="text" id="yutuq-text" class="custom-input" placeholder="Yutuq..."></div>
                    </div>
                    ${attPendingHtml('yutuq')}
                    <button class="action-btn" onclick="addYutuq()">+ Yutuq Qo'shish</button>
                    <div style="margin-top:10px;">${yt || '<div style="font-size:12px; color:#94a3b8;">Yutuqlar kiritilmagan</div>'}</div>
                </div>

                <!-- HAFSANALAR -->
                <div class="passport-container">
                    <div class="passport-title"><span>⚠️ Ishchi Hayfsanlari (kamchiliklar)</span></div>
                    <div class="form-row">
                        <div><span class="field-label">Sana</span><input type="date" id="hafsana-date" class="custom-input"></div>
                        <div><span class="field-label">Hayfsan</span><input type="text" id="hafsana-text" class="custom-input" placeholder="Kamchilik..."></div>
                    </div>
                    ${attPendingHtml('hafsana')}
                    <button class="action-btn" style="background:#dc2626; box-shadow:0 4px 12px rgba(220,38,38,0.4);" onclick="addHafsana()">+ Hayfsan Qo'shish</button>
                    <div style="margin-top:10px;">${hf || '<div style="font-size:12px; color:#94a3b8;">Hayfsanlar kiritilmagan</div>'}</div>
                </div>

                <!-- TATILLAR -->
                <div class="passport-container">
                    <div class="passport-title"><span>📅 Tatillarga Chiqish Tarixi</span></div>
                    <div class="form-row">
                        <div><span class="field-label">Tatilga chiqish</span><input type="date" id="tatil-out" class="custom-input"></div>
                        <div><span class="field-label">Ishga qaytish</span><input type="date" id="tatil-in" class="custom-input"></div>
                    </div>
                    <button class="action-btn" onclick="addTatil()">+ Tatil Kiritish</button>
                    <div style="margin-top:10px;">${tt || '<div style="font-size:12px; color:#94a3b8;">Tatillar kiritilmagan</div>'}</div>
                </div>

                <!-- SOG'LIQ SPRAVKASI -->
                <div class="passport-container">
                    <div class="passport-title"><span>🏥 Sog'ligi Haqida Ma'lumotnoma</span></div>
                    <div id="spravka-preview">${item.spravka && item.spravka.src
                        ? `<div class="stacked-album" onclick="openSpravkaViewer()"><div class="stack-card"><img src="${imgSrc(item.spravka)}"></div></div><div class="image-author-label">Kiritdi: ${escapeHtml(item.spravka.author)} &nbsp; <span style="cursor:pointer" onclick="deleteSpravka()">🗑 O'chirish</span></div>`
                        : `<div style="font-size:12px; color:#94a3b8; text-align:center; padding:8px;">Spravka yuklanmagan</div>`}</div>
                    <div class="file-upload-box" style="border-color:#4ade80; color:#4ade80;" onclick="document.getElementById('spravka-input').click()">📎 Spravkani yuklash</div>
                    <input type="file" id="spravka-input" accept="image/*" style="display:none;" onchange="spravkaSelected(this)">
                </div>

                <!-- OILAVIY AHVAL / IZOH / OILA AZOLARI -->
                <div class="passport-container">
                    <div class="passport-title"><span>👨‍👩‍👧 Shaxsiy Ma'lumotlar</span></div>
                    <span class="field-label">Oilaviy ahvoli</span>
                    <select class="custom-select" style="margin-bottom:10px;" onchange="updateXodimField('oilaviy', this.value)">
                        <option ${item.oilaviy === "Og'ir" ? "selected" : ""}>Og'ir</option>
                        <option ${item.oilaviy === "O'rta" ? "selected" : ""}>O'rta</option>
                        <option ${item.oilaviy === "Yaxshi" ? "selected" : ""}>Yaxshi</option>
                        <option ${item.oilaviy === "A'lo" ? "selected" : ""}>A'lo</option>
                    </select>
                    <span class="field-label">Ishchi haqida ma'lumotlar</span>
                    <textarea class="custom-input" style="margin-bottom:10px;" placeholder="Ishchi haqida qo'shimcha ma'lumot..." oninput="updateXodimField('izoh', this.value)">${escapeHtml(item.izoh || "")}</textarea>
                    <span class="field-label">Ishchining oila azolari</span>
                    <textarea class="custom-input" placeholder="Oila azolari (F.I.O, qachon tug'ilgan, lavozimi...)" oninput="updateXodimField('oilaAzolari', this.value)">${escapeHtml(item.oilaAzolari || "")}</textarea>
                </div>
            `;
            document.getElementById('yutuq-date').value = new Date().toISOString().slice(0, 10);
            document.getElementById('hafsana-date').value = new Date().toISOString().slice(0, 10);
            Object.keys(keep).forEach(id => { const el = document.getElementById(id); if (el) el.value = keep[id]; }); // fayl biriktirilganda yozilgan matn saqlanadi
            setupShtatCombo('wh', { wrap: 'whCombo', input: 'whLavozimSearch', hidden: 'wh-lavozim', list: 'whLavozimList' });
        }

        function openSpravkaViewer() {
            const item = getActiveItem();
            if (item && item.spravka && item.spravka.src) {
                openImageViewerModal([item.spravka.src], ["Kiritdi: " + item.spravka.author], 0);
            }
        }

        function updateXodimField(key, val) {
            const item = getActiveItem();
            if (item) { item[key] = val; saveDB(); }
        }

        function addWorkHistory() {
            const item = getActiveItem();
            if (!item) return;
            const start = document.getElementById('wh-start').value;
            const end = document.getElementById('wh-end').value;
            const seh = document.getElementById('wh-seh').value;
            const lavozim = document.getElementById('wh-lavozim').value.trim();
            if (!start || !lavozim) { alert("Boshlangan sana kiritilishi va lavozim shtatlar ro'yxatidan tanlanishi shart!"); return; }
            if (!item.workHistory) item.workHistory = [];
            item.workHistory.push({ start: start, end: end, seh: seh, lavozim: lavozim });
            item.workHistory.sort((a, b) => (a.start < b.start ? -1 : 1));
            saveDB();
            renderXodimExtra(item);
        }

        async function editWorkHistory(i) {
            const item = getActiveItem();
            if (!item || !item.workHistory[i]) return;
            const h = item.workHistory[i];
            const s = await uiPrompt("Boshlangan sana (YYYY-MM-DD):", h.start); if (s === null) return;
            const e = await uiPrompt("Tugagan sana (bo'sh = hozirda):", h.end); if (e === null) return;
            const l0 = await pickRole({ title: "Lavozim (shtatlar ro'yxatidan)", v: h.lavozim, shtatOnly: true }); if (l0 === null) return;
            const l = resolveShtatName(l0);
            if (!l) { alert("\"" + l0 + "\" shtatlar ro'yxatida aniq topilmadi. To'liqroq yozing yoki avval shtatga qo'shing."); return; }
            const sh = await uiPrompt("Seh:", h.seh); if (sh === null) return;
            h.start = s; h.end = e; h.lavozim = l; h.seh = sh;
            saveDB(); renderXodimExtra(item);
        }

        async function deleteWorkHistory(i) {
            const item = getActiveItem();
            if (!item) return;
            if (!await uiConfirm("Bu yozuv o'chirilsinmi?")) return;
            item.workHistory.splice(i, 1);
            saveDB(); renderXodimExtra(item);
        }

        function addYutuq() {
            const item = getActiveItem();
            if (!item) return;
            const date = document.getElementById('yutuq-date').value;
            const text = document.getElementById('yutuq-text').value.trim();
            if (!text) { alert("Yutuq matnini yozing!"); return; }
            if (ATT.busy > 0) { alert("Fayl hali tayyorlanmoqda, biroz kuting."); return; }
            if (!item.yutuqlar) item.yutuqlar = [];
            item.yutuqlar.unshift({ date: date, text: text, files: takePendingAtt('yutuq'), author: authorStr(), at: new Date().toISOString() });
            document.getElementById('yutuq-text').value = '';
            saveDB(); renderXodimExtra(item);
        }

        async function deleteYutuq(i) {
            const item = getActiveItem();
            if (!item || !await uiConfirm("O'chirilsinmi?")) return;
            item.yutuqlar.splice(i, 1);
            saveDB(); renderXodimExtra(item);
        }

        function addHafsana() {
            const item = getActiveItem();
            if (!item) return;
            const date = document.getElementById('hafsana-date').value;
            const text = document.getElementById('hafsana-text').value.trim();
            if (!text) { alert("Hayfsan matnini yozing!"); return; }
            if (ATT.busy > 0) { alert("Fayl hali tayyorlanmoqda, biroz kuting."); return; }
            if (!item.hafsanalar) item.hafsanalar = [];
            item.hafsanalar.unshift({ date: date, text: text, files: takePendingAtt('hafsana'), author: authorStr(), at: new Date().toISOString() });
            document.getElementById('hafsana-text').value = '';
            saveDB(); renderXodimExtra(item);
        }

        async function deleteHafsana(i) {
            const item = getActiveItem();
            if (!item || !await uiConfirm("O'chirilsinmi?")) return;
            item.hafsanalar.splice(i, 1);
            saveDB(); renderXodimExtra(item);
        }

        function addTatil() {
            const item = getActiveItem();
            if (!item) return;
            const out = document.getElementById('tatil-out').value;
            const inp = document.getElementById('tatil-in').value;
            if (!out || !inp) { alert("Ikkala sana ham kiritilishi shart!"); return; }
            if (!item.tatillar) item.tatillar = [];
            item.tatillar.unshift({ out: out, in: inp });
            saveDB(); renderXodimExtra(item);
        }

        async function deleteTatil(i) {
            const item = getActiveItem();
            if (!item || !await uiConfirm("O'chirilsinmi?")) return;
            item.tatillar.splice(i, 1);
            saveDB(); renderXodimExtra(item);
        }

        function spravkaSelected(input) {
            if (!input.files || !input.files[0]) return;
            const item = getActiveItem();
            if (!item) return;
            processImage(input.files[0], src => {
                if (!src) return;
                item.spravka = { src: src, author: authorStr() };
                saveDB();
                renderXodimExtra(item);
                alert("Spravka yuklandi!");
            });
            input.value = '';
        }

        async function deleteSpravka() {
            const item = getActiveItem();
            if (!item || !await uiConfirm("Spravka o'chirilsinmi?")) return;
            item.spravka = null;
            saveDB(); renderXodimExtra(item);
        }

        // ============ ELEMENT RASMLARI / TARIXI ============
        function itemGalleryFileSelected(input) {
            if (input.files && input.files.length > 0) {
                let item = getActiveItem();
                if (item) {
                    if (!item.gallery) item.gallery = [];
                    let count = 0, total = input.files.length;
                    Array.from(input.files).forEach(f => {
                        processImage(f, src => {
                            if (src) item.gallery.unshift({ src: src, author: authorStr() });
                            count++;
                            if (count === total) {
                                saveDB();
                                renderItemGallery(item);
                                alert("Rasm yuklandi!");
                            }
                        });
                    });
                }
                input.value = '';
            }
        }

        function renderItemGallery(item) {
            renderAlbumPreview('item-gallery-preview', item.gallery, "Rasmlar yo'q", "openItemGalleryViewer()");
        }

        function openItemGalleryViewer() {
            let item = getActiveItem();
            if (item && item.gallery && item.gallery.length > 0) {
                openImageViewerModal(item.gallery.map(x => x.src), item.gallery.map(x => "Kiritdi: " + x.author), 0);
            }
        }

        function itemRahbarFileSelected(input) {
            if (input.files && input.files.length > 0) {
                let item = getActiveItem();
                if (item) {
                    if (!item.rahbarImgs) item.rahbarImgs = [];
                    let count = 0, total = input.files.length;
                    Array.from(input.files).forEach(f => {
                        processImage(f, src => {
                            if (src) item.rahbarImgs.unshift({ src: src, author: authorStr() });
                            count++;
                            if (count === total) {
                                saveDB();
                                renderItemRahbarPreview(item);
                                alert("Rasm yuklandi!");
                            }
                        });
                    });
                }
                input.value = '';
            }
        }

        function renderItemRahbarPreview(item) {
            renderAlbumPreview('item-rahbar-img-preview', item.rahbarImgs, "Rasmlar yo'q.", "openItemRahbarViewer()");
        }

        function openItemRahbarViewer() {
            let item = getActiveItem();
            if (item && item.rahbarImgs && item.rahbarImgs.length > 0) {
                openImageViewerModal(item.rahbarImgs.map(x => x.src), item.rahbarImgs.map(x => "Kiritdi: " + x.author), 0);
            }
        }

        function updateItemRahbarIzoh(input) {
            let item = getActiveItem();
            if (item) { item.rahbarIzoh = input.value; saveDB(); }
        }

        function addNewItemTamir() {
            let turi = document.getElementById('new-item-tamir-turi').value;
            let sana = document.getElementById('new-item-tamir-date').value;
            if (!sana) { alert("Sanani tanlang!"); return; }
            let item = getActiveItem();
            if (item) {
                if (!item.history) item.history = [];
                item.history.unshift({ date: sana, type: turi, author: authorStr() });
                saveDB();
                renderItemTamirHistory(item);
                alert("Tarix saqlandi!");
            }
        }

        function renderItemTamirHistory(item) {
            let container = document.getElementById('item-tamir-history-list');
            container.innerHTML = "";
            if (!item.history || item.history.length === 0) {
                container.innerHTML = `<div style="font-size:12px; color:#94a3b8;">Tarix mavjud emas</div>`;
                return;
            }
            item.history.forEach((h, i) => {
                container.innerHTML += `<div class="history-item">🟢 <b>${escapeHtml(h.date)}</b> — ${escapeHtml(h.type)}
                    <span class="hist-actions"><span onclick="editItemTamirEntry(${i})">✏️</span><span onclick="deleteItemTamirEntry(${i})">🗑</span></span>
                    <div class="history-author">Kiritdi: ${escapeHtml(h.author)}</div></div>`;
            });
        }

        async function editItemTamirEntry(i) {
            let item = getActiveItem();
            if (!item || !item.history[i]) return;
            const h = item.history[i];
            const d = await uiPrompt("Sana (YYYY-MM-DD):", h.date); if (d === null) return;
            const t = await uiPrompt("Turi:", h.type); if (t === null) return;
            h.date = d; h.type = t; h.author = authorStr() + " (tahrirlangan)";
            saveDB(); renderItemTamirHistory(item);
        }

        async function deleteItemTamirEntry(i) {
            let item = getActiveItem();
            if (!item) return;
            if (!await uiConfirm("Bu yozuv o'chirilsinmi?")) return;
            item.history.splice(i, 1);
            saveDB(); renderItemTamirHistory(item);
        }

        // ============ OVOZLI QIDIRUV (Web Speech API — brauzer texnologiyasi) ============
        // Diqqat: bu funksiya internetga ulanadigan brauzerning o'z ovozni-matnga aylantirish
        // xizmatidan foydalanadi (Anthropic/Claude'ga bog'liq emas). Ba'zi brauzerlarda
        // (masalan offline yoki eski qurilmalarda) ishlamasligi mumkin.
        function startVoiceSearch(inputId, callback) {
            if (typeof micFallback === 'function' && micBlocked) { micFallback(inputId); return; }
            if (typeof micPrime === 'function' && !micPrimed) { micPrime().then(() => startVoiceSearch(inputId, callback)); return; }
            const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (!SpeechRec) {
                voiceErrorHelp('unsupported', inputId);
                return;
            }
            const micBtn = document.getElementById('mic-' + inputId);
            const recognition = new SpeechRec();
            recognition.lang = 'uz-UZ';
            recognition.interimResults = false;
            recognition.maxAlternatives = 1;
            if (micBtn) micBtn.classList.add('listening');

            recognition.onresult = function(event) {
                const text = event.results[0][0].transcript;
                const input = document.getElementById(inputId);
                if (input) {
                    input.value = text;
                    if (typeof callback === 'function') callback();
                }
            };
            recognition.onerror = function(event) {
                if (event.error !== 'no-speech' && event.error !== 'aborted') {
                    voiceErrorHelp(event.error, inputId);
                }
            };
            recognition.onend = function() {
                if (micBtn) micBtn.classList.remove('listening');
            };
            try { recognition.start(); } catch (e) { if (micBtn) micBtn.classList.remove('listening'); }
        }

        // ============ AI YORDAMCHI (mahalliy, oddiy kalit-so'z tizimi + ovozli kirish/chiqish) ============
        // MUHIM: bu yordamchi haqiqiy sun'iy intellekt (Gemini/ChatGPT kabi) emas — internetga
        // ulanmagan holda ishlaydigan oddiy kalit-so'zlarga asoslangan mahalliy skript.
        // Ovozni matnga (kirish) va matnni ovozga (chiqish) aylantirish uchun brauzerning
        // Web Speech API texnologiyasidan foydalaniladi.
        let aiVoiceOutputEnabled = true;

        function toggleAiVoiceOutput() {
            aiVoiceOutputEnabled = !aiVoiceOutputEnabled;
            const btn = document.getElementById('ai-voice-toggle');
            if (btn) {
                btn.innerText = aiVoiceOutputEnabled ? "🔊 Ovozli javob" : "🔇 Ovozsiz";
                btn.style.color = aiVoiceOutputEnabled ? "#4ade80" : "#94a3b8";
            }
            if (!aiVoiceOutputEnabled) stopAiSpeaking();
        }

        function speakAiText(text) {
            if (!aiVoiceOutputEnabled) return;
            if (!('speechSynthesis' in window)) return;
            try {
                window.speechSynthesis.cancel();
                const utter = new SpeechSynthesisUtterance(text);
                utter.lang = 'uz-UZ';
                utter.rate = 1;
                window.speechSynthesis.speak(utter);
            } catch (e) {}
        }

        function stopAiSpeaking() {
            if ('speechSynthesis' in window) window.speechSynthesis.cancel();
        }

        function startAiVoiceInput() {
            if (typeof micFallback === 'function' && micBlocked) { micFallback('aiInput'); return; }
            if (typeof micPrime === 'function' && !micPrimed) { micPrime().then(() => startAiVoiceInput()); return; }
            const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (!SpeechRec) {
                voiceErrorHelp('unsupported', 'aiInput');
                return;
            }
            const micBtn = document.getElementById('ai-mic-btn');
            const recognition = new SpeechRec();
            recognition.lang = 'uz-UZ';
            recognition.interimResults = false;
            recognition.maxAlternatives = 1;
            if (micBtn) micBtn.classList.add('listening');

            recognition.onresult = function(event) {
                const text = event.results[0][0].transcript;
                document.getElementById('aiInput').value = text;
                sendAiMessage();
            };
            recognition.onerror = function(event) {
                if (event.error !== 'no-speech' && event.error !== 'aborted') {
                    voiceErrorHelp(event.error, 'aiInput');
                }
            };
            recognition.onend = function() {
                if (micBtn) micBtn.classList.remove('listening');
            };
            try { recognition.start(); } catch (e) { if (micBtn) micBtn.classList.remove('listening'); }
        }

        function openAiChat(sec) {
            aiContext = sec;
            document.getElementById('aiContextLabel').innerText = "Bo'lim: " + sec;
            const m = document.getElementById('aiMessages');
            if (!m.innerHTML && typeof aicEmptyState !== 'function') {
                m.innerHTML = `<div class="ai-msg bot">Assalomu alaykum! Men mahalliy yordamchiman (internetga ulanmagan holda ishlayman, tayyor kalit-so'zlar asosida javob beraman). Vagonlar holati haqida savol bering yoki 🎤 tugmasini bosib gapiring. Masalan: "nechta vagon", "tamir talab", "8113".</div>`;
            }
            document.getElementById('aiChatModal').classList.remove('hidden');
        }

        function sendAiMessage() {
            const inp = document.getElementById('aiInput');
            const q = inp.value.trim();
            if (!q) return;
            const m = document.getElementById('aiMessages');
            m.innerHTML += `<div class="ai-msg user">${escapeHtml(q)}</div>`;
            inp.value = "";
            m.scrollTop = m.scrollHeight;
            setTimeout(() => {
                const reply = aiReply(q);
                if (typeof aiCloudReady === 'function' && aiCloudReady()) { aiCloudAnswer(q, reply, m); return; }
                m.innerHTML += `<div class="ai-msg bot">${escapeHtml(reply)}</div>`;
                m.scrollTop = m.scrollHeight;
                speakAiText(reply);
            }, 150);
        }

        var AI_LAST_RAW = '';
        function aiReply(qRaw) {
            AI_LAST_RAW = qRaw;
            if (typeof aiReplyX === 'function') { const rx = aiReplyX(qRaw); if (rx) return rx; }
            const q = qRaw.toLowerCase();
            const nums = q.match(/\d{3,}/);
            if (nums) {
                const v = vagonlarData.find(x => vagonNo(x) === nums[0] || (x.inv || "") === nums[0]) || vagonlarData.find(x => vagonNo(x).includes(nums[0]) || (x.inv || "").includes(nums[0]));
                if (v) return "Vagon №" + vagonNo(v) + ": " + v.type + ", seh: " + v.seh + ", holat: " + v.status + (v.kun !== null ? " (" + (v.kun < 0 ? Math.abs(v.kun) + " kun o'tdi" : v.kun + " kun qoldi") + ")" : "") + ". Keyingi ta'mir: " + v.keyingi + ".";
                return "Kechirasiz, " + nums[0] + " raqamli vagon topilmadi.";
            }
            const stat = {
                jami: onlyVagons().length,
                soz: onlyVagons().filter(v => v.status === "Soz").length,
                yaqin: onlyVagons().filter(v => v.status === "Yaqin").length,
                tamirTalab: onlyVagons().filter(v => v.status === "Ta'mir talab").length,
                tamirda: onlyVagons().filter(v => v.status === "Tamirda").length
            };
            if (q.includes("tamir talab") || q.includes("qizil")) {
                const l = onlyVagons().filter(v => v.status === "Ta'mir talab");
                return l.length ? "Ta'mir talab vagonlar (" + l.length + " ta): " + l.map(v => "№" + vagonNo(v)).join(", ") + "." : "Ajoyib! Ta'mir talab vagonlar yo'q. ✅";
            }
            if (q.includes("yaqin") || q.includes("sariq")) {
                const l = onlyVagons().filter(v => v.status === "Yaqin");
                return l.length ? "Muddati yaqin vagonlar (" + l.length + " ta): " + l.map(v => "№" + vagonNo(v) + " (" + v.kun + " kun)").join(", ") + "." : "Muddati yaqinlashayotgan vagonlar yo'q. ✅";
            }
            if (q.includes("tamirda") || q.includes("ko'k")) {
                const l = onlyVagons().filter(v => v.status === "Tamirda");
                return l.length ? "Tamirdagi vagonlar (" + l.length + " ta): " + l.map(v => "№" + vagonNo(v)).join(", ") + "." : "Hozircha tamirdagi vagonlar yo'q.";
            }
            if (q.includes("nechta") || q.includes("statistika") || q.includes("soni") || q.includes("hisobot")) {
                return "📊 Vagonlar statistikasi:\n• Jami: " + stat.jami + "\n• Soz: " + stat.soz + "\n• Muddati yaqin: " + stat.yaqin + "\n• Ta'mir talab: " + stat.tamirTalab + "\n• Tamirda: " + stat.tamirda;
            }
            if (q.includes("salom") || q.includes("assalom")) return "Assalomu alaykum, " + currentUser.name + "! Qanday yordam bera olaman?";
            if (q.includes("rahmat")) return "Arzimaydi! Yana savolingiz bo'lsa yozing. 😊";
            return "Quyidagilarni so'rashingiz mumkin:\n• «nechta vagon» — umumiy statistika\n• «tamir talab» / «yaqin» / «tamirda» — guruhlar bo'yicha\n• Vagon raqami (masalan: 8113) — bitta vagon haqida ma'lumot";
        }

        // ============ LIGHTBOX (yangilangan: to'liq ekran, kattalashtirish, surib varaqlash) ============
        function openImageViewerModal(srcs, auths, idx) {
            const start = (window.__albumStart !== undefined && window.__albumStart !== null) ? window.__albumStart : idx;
            window.__albumStart = null;
            viewerImagesList = srcs || []; viewerAuthorsList = auths || [];
            viewerCurrentIndex = Math.max(0, Math.min(start || 0, viewerImagesList.length - 1));
            document.getElementById('imageViewerModal').classList.remove('hidden');
            updateViewerImage();
        }
        function closeImageViewer() {
            document.getElementById('imageViewerModal').classList.add('hidden');
            if (PV.url) { URL.revokeObjectURL(PV.url); PV.url = null; }
            PV.pts.clear(); PV.start = null; PV.loadToken++;
        }
        function updateViewerImage() {
            if (!viewerImagesList.length) return;
            const src = viewerImagesList[viewerCurrentIndex];
            const img = document.getElementById('viewerImage');
            pvReset();
            const token = ++PV.loadToken;
            updateViewerDeleteBtn();
            const ref = imgRef(src);
            img.src = imgSrc(src); // avval kichik nusxa, keyin asl rasm
            document.getElementById('viewerAuthorInfo').innerText = viewerAuthorsList[viewerCurrentIndex] || "";
            document.getElementById('imageCounter').innerText = (viewerCurrentIndex + 1) + " / " + viewerImagesList.length;
            const multi = viewerImagesList.length > 1;
            document.getElementById('pvPrev').style.display = multi ? '' : 'none';
            document.getElementById('pvNext').style.display = multi ? '' : 'none';
            const meta = ref ? MEDIA_META.get(ref) : null;
            document.getElementById('pvMeta').innerText = meta ? [fmtDateTime(meta.at), (meta.w && meta.h) ? (meta.w + '×' + meta.h) : '', fmtSize(meta.size)].filter(Boolean).join('   ') : '';
            if (ref) {
                mediaGetBlob(ref).then(b => {
                    if (!b || token !== PV.loadToken) return;
                    if (PV.url) URL.revokeObjectURL(PV.url);
                    PV.url = URL.createObjectURL(b);
                    img.src = PV.url;
                }).catch(() => {});
            }
        }
        function prevImage() { if (viewerImagesList.length < 2) { pvReset(); return; } viewerCurrentIndex = (viewerCurrentIndex - 1 + viewerImagesList.length) % viewerImagesList.length; updateViewerImage(); }
        function nextImage() { if (viewerImagesList.length < 2) { pvReset(); return; } viewerCurrentIndex = (viewerCurrentIndex + 1) % viewerImagesList.length; updateViewerImage(); }

