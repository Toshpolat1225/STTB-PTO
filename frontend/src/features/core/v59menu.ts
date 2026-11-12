        // =====================================================================
        // 5.9 — 8-band (muallif, 02.11.2026): Web (≥ 1200 px) — chapdagi doimiy boʻlimlar paneli doim ochiq turmaydi.
        //  Bosh sahifaning eng yuqorisida ☰ menyu tugmasi; bosilganda oʻsha panel ochiladi (telefondagidek).
        //  Ichki sahifalarda ☰ allaqachon bor (v49 yuqori qatori) — panel yopilgach u ham koʻrinadi.
        //  Yuqori tugmalar (yozishmalar, vazifalar, ⚠, ⓘ) ☰ ostiga suriladi — ustma-ust tushmaydi.
        //  Faqat planshet/kompyuter kengligida (≥ 720 px); telefonda bosh sahifa oʻzgarmaydi.
        //  Eski wbSide oʻchirilmadi — oʻrab olindi.
        // =====================================================================
        const MN9: any = window as any;
        if (typeof MN9.wbSide === 'function') MN9.wbSide = MN9.agmkExtend('wbSide', '5.9: doimiy chap panel oʻrniga ☰ tugmasi', MN9.wbSide, (o: Function) => function (this: unknown) {
            if (!document.body.classList.contains('wb-side')) return;
            document.body.classList.remove('wb-side');
            try { const d = MN9.$id('h9Drw'); if (d) d.classList.remove('on'); if (MN9.H9) MN9.H9.drw = false; } catch (e) { /* */ }
        });
        function mn59Btn(): void {
            try {
                const s = MN9.$id('screen-main'); if (!s) return; const h = s.querySelector('.header'); if (!h) return;
                let b = MN9.$id('mn59Menu');
                if (!b) {
                    b = document.createElement('button'); b.id = 'mn59Menu'; b.type = 'button'; b.className = 'h9-c mn59-menu'; b.title = 'Bosh menyu';
                    b.innerHTML = typeof MN9.h9Ic === 'function' ? MN9.h9Ic('menu') : '☰';
                    b.addEventListener('click', (e: any) => { e.stopPropagation(); try { MN9.h9DrawerOpen(); } catch (x) { /* */ } });
                    h.appendChild(b);
                }
                document.body.classList.add('mn59-on');
            } catch (e) { /* */ }
        }
        (function () {
            const st = document.createElement('style'); st.id = 'v59menuCss';
            st.textContent = `
            #mn59Menu{display:none}
            @media (min-width:720px){
            #mn59Menu{display:inline-flex}
            #screen-main .header #mn59Menu{position:absolute;left:0;top:-4px;z-index:6;width:44px!important;height:44px!important;min-width:44px}
            body.mn59-on:not([data-theme="glass"]):not([data-theme="vitrina"]):not([data-theme="minimal"]) #screen-main :is(#chatTopBtn,#opsBtn,#nsBtn){transform:translateY(52px)}
            body.mn59-on:not([data-theme="glass"]):not([data-theme="vitrina"]):not([data-theme="minimal"]) #screen-main .ui-i-main{transform:translateY(60px)!important}
            body:is([data-theme="glass"],[data-theme="vitrina"],[data-theme="minimal"]) #screen-main .header #mn59Menu{top:70px!important}
            body.mn59-on:is([data-theme="glass"],[data-theme="vitrina"],[data-theme="minimal"]) #screen-main :is(#chatTopBtn,#opsBtn,#nsBtn,.ui-i-main){transform:translateX(54px)}
            }
            body.locked #mn59Menu{display:none}
            `;
            document.head.appendChild(st);
            setTimeout(() => { try { MN9.wbSide(); } catch (e) { /* */ } mn59Btn(); }, 0);
        })();
        if (typeof MN9.openScreen === 'function') MN9.openScreen = MN9.agmkExtend('openScreen', '5.9: bosh sahifada ☰', MN9.openScreen, (o: Function) => function (this: unknown, id: any) { const r = o.apply(this, arguments); if (id === 'screen-main') setTimeout(mn59Btn, 0); return r; });
        window.addEventListener('agmk:login', () => setTimeout(mn59Btn, 300));
        Object.assign(MN9, { mn59Btn: mn59Btn });
