        // =====================================================================
        // 6.0 — 8-band (muallif videosi 15:38): SVO «🖥 Monitoring oynasi» telefonda kompyuter maketi siqilib chiqar edi
        //  (chap menyu, uch ustun, mayda jadval, tugmalar bir-birining orqasida). Endi telefon (≤ 720 px) uchun alohida
        //  koʻrinish: tepada sarlavha, sana va soat; ostida boʻlimlar — gorizontal yorliqlar (son bilan); bitta ustun;
        //  jadval oʻrniga xodim kartochkalari (ism, sex · lavozim, reja, keldi–ketdi, kech/erta, holat). Kompyuter va
        //  planshetdagi koʻrinish oʻzgarmaydi. Bosilganda xodim oynasi (dvPerson) — avvalgidek.
        // =====================================================================
        const M60: any = window as any;
        function mon60Tel(): boolean { return window.innerWidth <= 720; }
        function mon60Cards(L: any[]): string {
            const S: any = typeof DV_ST !== 'undefined' ? DV_ST : {}, C: any = typeof DV_CODE !== 'undefined' ? DV_CODE : {}, E = M60.dvE, Hm = M60.dvHm, Mi = M60.dvMin;
            return `<div class="dm60-cards">${L.slice(0, 400).map((x: any) => { const st = S[x.st] || ['', x.st, ''];
                const h = x.st === 'sababli' && x.reason ? E(x.reason.name) : st[1];
                return `<div class="dm60-c h-${E(x.st)}" onclick="dvPerson('${E(x.tabel)}')"><div class="dm60-h"><b>${E(x.name)}</b><em class="${st[2] || ''}">${st[0]} ${h}</em></div>
                    <small>${E(x.tabel)} · ${E(x.unitN || '')}${x.lav ? ' · ' + E(x.lav) : ''}</small>
                    <div class="dm60-r"><span>${(C[x.code] || ['—'])[0]}${x.guess ? '?' : ''} ${x.plan ? x.plan.join('–') : ''}</span><span>🛂 ${x.in ? Hm(x.in) : '—'} → ${x.out ? Hm(x.out) : x.inside ? '🟢 ichkarida' : '—'}</span>${x.late ? `<span class="k">🟡 +${Mi(x.late)}</span>` : ''}${x.early ? `<span class="e">🟠 −${Mi(x.early)}</span>` : ''}${x.obj ? `<span>🚧 ${E(x.obj)}</span>` : ''}</div></div>`; }).join('')}</div>${L.length > 400 ? `<div class="nd-tip">… yana ${L.length - 400} — filtrni toraytiring</div>` : ''}${L.length ? '' : '<div class="nd-tip">— roʻyxat boʻsh</div>'}`;
        }
        if (typeof M60.dvMonTable === 'function') M60.dvMonTable = M60.agmkExtend('dvMonTable', '6.0: telefonda kartochkalar', M60.dvMonTable, (o: Function) => function (this: unknown, L: any[]) {
            if (mon60Tel()) { try { return mon60Cards(L || []); } catch (e) { /* */ } } return o.apply(this, arguments);
        });
        // oyna burilganda (telefon ↔ gorizontal) — qayta chizish
        let mon60W = window.innerWidth <= 720;
        window.addEventListener('resize', () => { const t = window.innerWidth <= 720; if (t !== mon60W) { mon60W = t; try { if (M60.$id('dvMon') && typeof M60.dvMonDraw === 'function') M60.dvMonDraw(); } catch (e) { /* */ } } });
        (function () {
            const st = document.createElement('style'); st.id = 'v60monCss';
            st.textContent = `@media (max-width:720px){
            #dvMon{flex-direction:column!important;font-size:13px}
            #dvMon .dm-main{display:contents!important}
            #dvMon .dm-top{order:1;flex-wrap:wrap;gap:6px 10px;padding:calc(10px + env(safe-area-inset-top,0px)) 12px 8px}
            #dvMon #dmTitle{flex:1 1 100%;font-size:16px;color:#fff}
            #dvMon .dm-clock{margin-left:auto;font-size:14px}
            #dvMon .dm-last{flex:1 1 100%;font-size:11.5px}
            #dvMon .dm-dt input{max-width:150px}
            #dvMon .dm-side{order:2;width:auto!important;flex:0 0 auto!important;flex-direction:row!important;overflow-x:auto;overflow-y:hidden;padding:6px 10px 8px!important;gap:6px;border-right:0!important;border-bottom:1px solid rgba(255,255,255,.1);-webkit-overflow-scrolling:touch;scrollbar-width:none}
            #dvMon .dm-side::-webkit-scrollbar{display:none}
            #dvMon .dm-logo,#dvMon .dm-sp{display:none!important}
            #dvMon .dm-mi{flex:0 0 auto;font-size:12.5px!important;white-space:nowrap;padding:8px 12px!important;border-radius:999px;background:rgba(30,41,59,.75);border:1px solid rgba(255,255,255,.12);justify-content:flex-start!important;gap:6px}
            #dvMon .dm-mi span{font-size:15px}
            #dvMon .dm-mi.on{background:#1d4ed8;border-color:#60a5fa;color:#fff}
            #dvMon .dm-mi em{font-style:normal;font-weight:800;color:#fcd34d}
            #dvMon .dm-mi:last-child{order:-1;background:rgba(127,29,29,.55);border-color:rgba(248,113,113,.4)}
            #dvMon .dm-body{order:3;flex:1 1 auto;min-height:0;overflow:auto;padding:10px!important}
            #dvMon .dm-grid{grid-template-columns:1fr!important}
            #dvMon .dm-wide{grid-column:auto!important;grid-row:auto!important}
            #dvMon .dm-scroll{max-height:none!important}
            #dvMon .dm-p{padding:10px!important}
            #dvMon .dm-objs{grid-template-columns:repeat(2,1fr)!important}
            .dm60-cards{display:flex;flex-direction:column;gap:8px}
            .dm60-c{background:linear-gradient(135deg,rgba(30,41,59,.85),rgba(15,23,42,.9));border:1px solid rgba(255,255,255,.1);border-radius:14px;padding:10px 12px;cursor:pointer}
            .dm60-c.h-sababsiz{border-color:rgba(248,113,113,.55)}
            .dm60-h{display:flex;justify-content:space-between;align-items:flex-start;gap:8px}
            .dm60-h b{color:#fff;font-size:14px;line-height:1.25}
            .dm60-h em{font-style:normal;font-size:11.5px;font-weight:700;white-space:nowrap;color:#cbd5e1}
            .dm60-c small{display:block;color:#94a3b8;font-size:11.5px;margin-top:3px}
            .dm60-r{display:flex;flex-wrap:wrap;gap:4px 10px;margin-top:6px;font-size:12px;color:#e2e8f0}
            .dm60-r .k{color:#fcd34d}.dm60-r .e{color:#fdba74}
            }`;
            document.head.appendChild(st);
        })();
        Object.assign(M60, { mon60Cards: mon60Cards });
