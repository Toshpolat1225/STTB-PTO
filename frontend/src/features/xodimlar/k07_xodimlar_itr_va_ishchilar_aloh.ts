        //  • «Ishchi xodimlar» sahifasi ikki qism: ITR (rahbar, mutaxassis, texnik xodim) va 👷 Ishchilar (sex › kasb › ishchi).
        //  • Ishchilar ham ITR kabi pasport bilan: rasm, galereya, telefon, ish tarixi, taʼtillar — bir xil «Pasport va Rasmlar».
        //  • Struktura, Ishchi xodimlar va Shtatlar — bitta maʼlumotdan: biri oʻzgarsa, qolganlarida ham darhol koʻrinadi.
        XT.w = false;
        function xwIsW(p) { return !!p && p.cat === 'ishchi'; }
        function xwCounts() { const M = new Map(); allXodims().forEach(r => { const n = Number(r.item.posNo); if (n) M.set(n, (M.get(n) || 0) + 1); }); return M; }
        function xwBand(M, L) { return L.reduce((s, p) => s + (M.get(p.no) || 0), 0); }
        function xwRoot() {
            const M = xwCounts(), itrP = shtatTree.pos.filter(p => !xwIsW(p)), wP = shtatTree.pos.filter(xwIsW), bI = xwBand(M, itrP), bW = xwBand(M, wP);
            const none = allXodims().filter(r => !(r.item.posNo && posByNo(r.item.posNo))).length;
            let h = '';
            try { if (typeof ROSTER !== 'undefined' && typeof rosterOpen === 'function') h += `<div class="btn-card xt-unit rs-card" onclick="rosterOpen()"><div class="btn-card-content"><span class="btn-text">📋 Shtat roʻyxati · ${fmtISO(ROSTER_V)}<span class="xt-sub">${ROSTER.length} ITR xodim tabel raqami bilan · kim roʻyxatdan oʻtgan, noaniqliklar</span></span></div><span class="btn-arrow">›</span></div>`; } catch (e) {}
            h += `<div class="xt-head"><b>STTB: ${bI + bW} xodim</b><span class="xt-sub">ITR: ${bI} (shtat ${shtatSum(itrP)}) · Ishchilar: ${bW}${wP.length ? ' (shtat ' + shtatSum(wP) + ')' : ''}</span></div>`;
            h += `<div class="xt-sec">👷 Ishchilar</div>` + xtFolderCard('👷 Ishchilar roʻyxati', wP.length ? `${bW} ishchi · ${wP.length} kasb · ${new Set(wP.map(p => p.u)).size} ta sex va xizmat` : 'Roʻyxat hali yuklanmagan — Struktura › ⋯ › Import', `XT.w=true;XT.u=null;XT.g=null;XT.pos=null;XT.none=false;xtRender()`, 'xw-card');
            h += `<div class="xt-sec">👔 ITR — rahbarlar, mutaxassislar, texnik xodimlar</div>`;
            shtatTree.units.forEach(un => { const ps = itrP.filter(x => x.u === un.id); if (!ps.length) return; h += xtFolderCard(un.name, `${ps.length} lavozim · ${xwBand(M, ps)}/${shtatSum(ps)} band`, `XT.w=false;xtGo('${un.id}')`); });
            if (none) h += `<div class="xt-sec">Diqqat</div>` + xtFolderCard('⚠️ Lavozimga biriktirilmagan xodimlar', `${none} ta — lavozimini tanlash kerak`, `XT.none=true; XT.u=null; XT.g=null; XT.pos=null; xtRender()`, 'xt-warn');
            return h;
        }
        function xwUnitItr(u) { // ITR boʻlinmasi — ishchi kasblarisiz
            const M = xwCounts(), allU = shtatTree.pos.filter(x => x.u === u.id && !xwIsW(x)), direct = allU.filter(x => !x.g).sort((a, b) => a.no - b.no);
            let h = `<div class="xt-head"><b>${escapeHtml(u.name)}</b><span class="xt-sub">ITR: ${allU.length} lavozim · Shtat: ${shtatSum(allU)} birlik · Band: ${xwBand(M, allU)}</span></div>`;
            if (direct.length) h += `<div class="xt-sec">Rahbariyat va umumiy lavozimlar</div>` + direct.map(xtPosRow).join('');
            const groups = shtatTree.groups.filter(x => x.u === u.id && allU.some(p => p.g === x.id));
            if (groups.length) h += `<div class="xt-sec">Boʻlimlar va uchastkalar (${groups.length})</div>` + groups.map(gr => { const ps = allU.filter(x => x.g === gr.id); return xtFolderCard(gr.name, `${ps.length} lavozim · ${xwBand(M, ps)}/${shtatSum(ps)} band`, `xtGo('${u.id}','${gr.id}')`); }).join('');
            const wn = shtatTree.pos.filter(x => x.u === u.id && xwIsW(x)); if (wn.length) h += `<div class="xt-sec">👷 Ishchilar</div>` + xtFolderCard('👷 ' + u.short + ' ishchilari', `${xwBand(M, wn)} ishchi · ${wn.length} kasb`, `XT.w=true;xtGo('${u.id}')`, 'xw-card');
            return h;
        }
        function xwWRoot() {
            const M = xwCounts(), wP = shtatTree.pos.filter(xwIsW);
            if (!wP.length) return `<div class="xt-head"><b>👷 Ishchilar</b><span class="xt-sub">Ishchilar roʻyxati hali yuklanmagan.</span></div><div class="xt-empty" style="line-height:1.6">Kadrlar boʻlimidan (1C ZUP) Excel roʻyxat: <b>Struktura › ⋯ › «Ishchilar roʻyxatini import qilish»</b>. Har bir ishchi oʻz sexi va kasbiga joylanadi, pasporti shu yerda yuritiladi.</div>` + (typeof stEdit === 'function' && stEdit() ? `<button class="xt-tool" onclick="openStruct();setTimeout(stImpOpen,400)">📥 Ishchilar roʻyxatini import qilish</button>` : '');
            let h = `<div class="xt-head"><b>👷 Ishchilar: ${xwBand(M, wP)}</b><span class="xt-sub">${wP.length} kasb · shtat ${shtatSum(wP)} · har bir ishchining pasporti ITR kabi yuritiladi</span></div>`;
            shtatTree.units.forEach(un => { const ps = wP.filter(x => x.u === un.id); if (!ps.length) return; h += xtFolderCard(un.name, `${xwBand(M, ps)} ishchi · ${ps.length} kasb · shtat ${shtatSum(ps)}`, `XT.w=true;xtGo('${un.id}')`); });
            return h;
        }
        function xwWUnit(u) {
            const M = xwCounts(), ps = shtatTree.pos.filter(x => x.u === u.id && xwIsW(x)).sort((a, b) => (M.get(b.no) || 0) - (M.get(a.no) || 0) || a.name.localeCompare(b.name));
            let h = `<div class="xt-head"><b>👷 ${escapeHtml(u.name)} — ishchilar</b><span class="xt-sub">${xwBand(M, ps)} ishchi · ${ps.length} kasb · shtat ${shtatSum(ps)}</span></div>`;
            const direct = ps.filter(p => !p.g); if (direct.length) h += direct.map(xtPosRow).join('');
            shtatTree.groups.filter(g => g.u === u.id).forEach(g => { const gp = ps.filter(p => p.g === g.id); if (gp.length) h += `<div class="xt-sec">${escapeHtml(g.name)}</div>` + gp.map(xtPosRow).join(''); });
            return h || '<div class="xt-empty">Ishchi yoʻq</div>';
        }
        (function () {
            if (typeof xtRender === 'function') xtRender = agmkExtend('xtRender', 'v3.14.2: ITR va 👷 Ishchilar alohida', xtRender, o => function () {
                try {
                    if (!shtatTree || $id('xtSearch').value.trim() || XT.none || XT.pos || XT.g) return o.apply(this, arguments);
                    const box = $id('xtList'), u = XT.u ? unitById(XT.u) : null;
                    $id('xtTitle').innerText = XT.w ? '👷 Ishchilar' : (u ? u.short : 'Ishchi xodimlar'); xtCrumbs(); $id('xtFab').classList.add('hidden');
                    box.innerHTML = XT.w ? (u ? xwWUnit(u) : xwWRoot()) : (u ? xwUnitItr(u) : xwRoot());
                    return;
                } catch (e) { console.error(e); }
                return o.apply(this, arguments);
            });
            if (typeof xtGo === 'function') xtGo = agmkExtend('xtGo', 'v3.14.2: ishchilar rejimi', xtGo, o => function (u, g, pos) { if (!u) XT.w = false; else if (pos) { const p = posByNo(pos); XT.w = xwIsW(p); } return o.apply(this, arguments); });
            if (typeof xtBack === 'function') xtBack = agmkExtend('xtBack', 'v3.14.2: ishchilar rejimi', xtBack, o => function () {
                if (XT.w && !XT.u && !XT.pos && !XT.none && !$id('xtSearch').value.trim()) { XT.w = false; xtRender(); return; }
                return o.apply(this, arguments);
            });
            if (typeof xtCrumbs === 'function') xtCrumbs = agmkExtend('xtCrumbs', 'v3.14.2: ishchilar', xtCrumbs, o => function () {
                const r = o.apply(this, arguments);
                try { if (XT.w) { const c = $id('xtCrumbs'), f = c.querySelector('span'); if (f) f.insertAdjacentHTML('afterend', ' › <span onclick="XT.w=true;XT.u=null;XT.g=null;XT.pos=null;xtRender()">👷 Ishchilar</span>'); c.querySelectorAll('span[onclick^="xtGo(\'u"]').forEach(s => s.setAttribute('onclick', 'XT.w=true;' + s.getAttribute('onclick'))); } } catch (e) {}
                return r;
            });
            if (typeof openXodimTree === 'function') openXodimTree = agmkExtend('openXodimTree', 'v3.14.2: ITR boʻlimidan boshlanadi', openXodimTree, o => function () { XT.w = false; return o.apply(this, arguments); });
            // Kranlar va maxsus texnikalar — mostoviy kranlar uchun boʻsh turadi (roʻyxati hali shakllanmagan)
            try { if (typeof MENU_CNT !== 'undefined') delete MENU_CNT['6.6']; } catch (e) {}
            menuKran = function () {
                mdl('menuKran', `<div class="px-h"><b>🏗 Kranlar va maxsus texnikalar</b><button class="mini-btn" onclick="mdlClose('menuKran')">✕</button></div>
                    <div class="xt-empty" style="padding:14px 8px;line-height:1.5">Bu boʻlimga <b>mostoviy (koʻprikli) kranlar</b> kiritiladi — roʻyxati hali shakllanmagan.</div>
                    <div class="nd-tip">Yoʻl yotqizuvchi kranlar — «Yoʻl qurilishi va taʼmirlash»da, maxsus texnika — «Avtotraktor parki»da oʻz joyida.</div>`);
            };
            const st = document.createElement('style'); st.textContent = `.xw-card .btn-text{color:#fde68a}`; document.head.appendChild(st);
        })();

    

