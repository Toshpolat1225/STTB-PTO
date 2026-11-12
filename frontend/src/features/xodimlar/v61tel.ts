        // =====================================================================
        // 6.1 — xodim pasportida «📞 Qoʻngʻiroq» (muallif 13:36, namuna «qongiroq_namuna.png» — tasdiqlangan)
        //  • Tugma bosilganda raqam korxona serveridan olinadi (/api/my/v1/tel) — ilova faylida (APK, html) raqam YOʻQ.
        //  • Koʻradi: admin, kadrlar, rahbariyat, oklad roli (server tekshiradi; oʻz boʻysunuvchilari ham). Boshqalarda tugma yoʻq.
        //  • Bitta raqam — darhol telefonning qoʻngʻiroq oynasi (raqam terilgan, qoʻngʻiroqni foydalanuvchi boshlaydi);
        //    ikkita boʻlsa — tanlash oynasi. Kompyuterda — raqam koʻrsatiladi, nusxalash tugmasi bilan.
        //  • Server ulanmagan yoki raqam kiritilmagan boʻlsa — sababi yoziladi.
        // =====================================================================
        const C61: any = window as any;
        function c61Can(): boolean { try { return C61.isAdmin() || ['kadr', 'rahbar', 'okl'].some((r: string) => C61.hasRole(r)); } catch (e) { return false; } }
        function c61Phone(): boolean { try { return !!(C61.AgmkNative) || /Android|iPhone|iPad|Mobile/i.test(navigator.userAgent); } catch (e) { return false; } }
        function c61Fmt(p: string): string { const d = String(p || '').replace(/\D/g, ''); return d.length === 12 ? '+' + d.slice(0, 3) + ' ' + d.slice(3, 5) + ' ' + d.slice(5, 8) + ' ' + d.slice(8, 10) + ' ' + d.slice(10) : '+' + d; }
        function c61Dial(p: string): void {
            const u = 'tel:' + String(p).replace(/[^\d+]/g, '');
            try { C61.mdlClose('c61M'); } catch (e) { /* */ }
            if (c61Phone()) { try { if (typeof C61.chatOpenLink === 'function') C61.chatOpenLink(u); else location.href = u; } catch (e) { location.href = u; } return; }
            c61Sheet([p], C61.$id('c61M') ? (C61.$id('c61M') as any)._n : '', true);
        }
        function c61Sheet(L: string[], name: string, pc?: boolean): void {
            const E = C61.escapeHtml;
            C61.mdl('c61M', `<div class="px-h"><b>📞 Qoʻngʻiroq qilish</b><button class="mini-btn" onclick="mdlClose('c61M')">✕</button></div>
                <div class="nd-tip">${E(name || '')}${pc ? ' — kompyuterdan qoʻngʻiroq qilib boʻlmaydi: raqamni telefonda tering yoki nusxalang.' : ' — raqam korxona serveridan olindi. Bosing — telefonning qoʻngʻiroq oynasiga oʻtadi.'}</div>
                ${L.map((p, i) => `<div class="c61-n${i ? ' o' : ''}" onclick="${pc ? '' : `c61Dial('${E(p)}')`}"><i>📞</i><div><b>${E(c61Fmt(p))}</b><small>${i ? 'Qoʻshimcha raqam' : 'Asosiy raqam'}</small></div>${pc ? `<button class="mini-btn" onclick="event.stopPropagation(); c61Copy('${E(p)}')">📋 Nusxa</button>` : ''}</div>`).join('')}
                <button class="mini-btn c61-x" onclick="mdlClose('c61M')">Bekor qilish</button>`);
            try { (C61.$id('c61M') as any)._n = name; } catch (e) { /* */ }
        }
        function c61Copy(p: string): void { try { navigator.clipboard.writeText(p); C61.showToast('📋 Nusxalandi: ' + p); } catch (e) { C61.showToast(p); } }
        async function c61Call(): Promise<void> {
            const it = typeof C61.getActiveItem === 'function' ? C61.getActiveItem() : null; if (!it) return;
            const t = typeof C61.cleanTabel === 'function' ? C61.cleanTabel(it.tabel) : String(it.tabel || ''), name = it.name || '';
            if (!t) { C61.showToast('📞 Xodimning tabel raqami yoʻq'); return; }
            let cfg: any = {}; try { cfg = C61.syncCfg() || {}; } catch (e) { /* */ }
            if (!cfg.url) { C61.alert('📞 Raqam korxona serverida saqlanadi — server ulanmagan.\nParametrlar → Server (sinxronlash) orqali ulaning.'); return; }
            const b = C61.$id('c61B'); if (b) { b.disabled = true; b.textContent = '⏳ Raqam olinmoqda…'; }
            let r: any = null, er = '';
            try { r = await C61.sbFetch('/api/my/v1/tel?t=' + encodeURIComponent(t), { method: 'GET' }); } catch (e) { er = String((e as any) && (e as any).message || e); }
            if (b) { b.disabled = false; b.innerHTML = '📞 Qoʻngʻiroq'; }
            if (er) { C61.alert('📞 ' + (/403|ruxsat/i.test(er) ? 'Bu xodimning raqamini koʻrishga ruxsatingiz yoʻq.' : 'Raqamni olib boʻlmadi: ' + er)); return; }
            const L: string[] = (r && Array.isArray(r.phones)) ? r.phones : [];
            if (!L.length) { C61.alert('📞 ' + name + ' — telefon raqami kiritilmagan.\nKadrlar boʻlimi kiritadi.'); return; }
            if (L.length === 1 && c61Phone()) { c61Dial(L[0]); return; }
            c61Sheet(L, name, !c61Phone());
        }
        function c61Btn(): void {
            try {
                const bar = C61.$id('xodim-contact-bar'); if (!bar || bar.style.display === 'none') return;
                // eski «📞» (telefondagi kartochkada raqam boʻlsagina chiqardi) oʻrniga — server orqali
                bar.querySelectorAll('button').forEach((x: any) => { if (/tel:/.test(x.getAttribute('onclick') || '')) x.remove(); });
                if (!c61Can() || bar.querySelector('#c61B')) return;
                const b = document.createElement('button'); b.id = 'c61B'; b.className = 'c61-b'; b.innerHTML = '📞 Qoʻngʻiroq'; b.onclick = () => { c61Call(); };
                bar.insertBefore(b, bar.firstChild);
            } catch (e) { console.error('6.1 qoʻngʻiroq', e); }
        }
        if (typeof C61.xodimAccessApply === 'function') C61.xodimAccessApply = C61.agmkExtend('xodimAccessApply', '6.1: qoʻngʻiroq tugmasi', C61.xodimAccessApply, (o: Function) => function (this: unknown) { const r = o.apply(this, arguments); c61Btn(); return r; });
        if (typeof C61.openItemPasport === 'function') C61.openItemPasport = C61.agmkExtend('openItemPasport', '6.1: qoʻngʻiroq tugmasi', C61.openItemPasport, (o: Function) => function (this: unknown) { const r = o.apply(this, arguments); setTimeout(c61Btn, 50); setTimeout(c61Btn, 400); return r; });
        (function () {
            const st = document.createElement('style'); st.id = 'v61telCss';
            st.textContent = `.xc-bar .c61-b{background:linear-gradient(135deg,#16a34a,#15803d)!important;border-color:#22c55e!important;color:#fff!important;font-weight:700;box-shadow:0 6px 18px rgba(22,163,74,.3)}
            #c61M .c61-n{display:flex;align-items:center;gap:12px;padding:14px;border-radius:16px;background:#0b1220;border:1px solid rgba(34,197,94,.5);margin:8px 0;cursor:pointer}
            #c61M .c61-n.o{border-color:rgba(255,255,255,.14)}#c61M .c61-n i{width:42px;height:42px;flex:0 0 42px;border-radius:50%;background:#16a34a;display:grid;place-items:center;font-style:normal;font-size:20px}#c61M .c61-n.o i{background:#334155}
            #c61M .c61-n div{flex:1}#c61M .c61-n b{display:block;font-size:18px;color:#fff;letter-spacing:.4px}#c61M .c61-n small{color:#94a3b8;font-size:12px}
            #c61M .c61-x{width:100%;margin-top:6px;height:44px}`;
            document.head.appendChild(st);
        })();
        Object.assign(C61, { c61Call: c61Call, c61Dial: c61Dial, c61Copy: c61Copy, c61Btn: c61Btn });
