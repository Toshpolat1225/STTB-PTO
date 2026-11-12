        // =====================================================================
        // 6.0 — 5-6-bandlar (muallif videolari 15:26, 15:30): telefondagi ILOVADA (APK) «tez surish» tugmasi va AI tugmasi
        //  barmoqqa ergashmay qoldi (telefon brauzerida — ishlaydi). Ikkalasiga ham toʻgʻridan-toʻgʻri TEGINISH (touch)
        //  yoʻli qoʻshildi: barmoq tekkan zahoti tugma ergashadi, sahifa surilmaydi (touchmove → preventDefault).
        //  Eski «pointer» yoʻli kompyuter (sichqoncha) uchun qoladi. Ikkalasi birga kelsa — bir xil joyga qoʻyadi.
        //  • Tez surish: koʻrinishi oʻsha (muallifga yoqdi), ushlash maydoni kengroq (48×64), 2,5 s koʻrinib turadi;
        //    qoʻyib yuborilganda roʻyxat orqaga sakramaydi (eski «kerakli joy» belgisi tozalanadi).
        //  • Teginish jurnali (yashirin): shu ikki tugma atrofidagi soʻnggi 40 hodisa — Parametrlar → 🐞 Xatolar jurnali
        //    oxirida koʻrinadi. Sabab aniq boʻlmasa, muallif bir marta tortib koʻradi va jurnal boʻyicha tuzatiladi.
        // =====================================================================
        const T60: any = window as any;
        var TJ60_KEY = 'agmk_tj60';
        function tj60Desc(e: any): string { if (!e || !e.tagName) return '-'; return e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') + (typeof e.className === 'string' && e.className ? '.' + e.className.trim().split(/\s+/).slice(0, 2).join('.') : ''); }
        function tj60Log(type: string, x: number, y: number, tgt: any, note?: string): void {
            try {
                const L = JSON.parse(localStorage.getItem(TJ60_KEY) || '[]');
                L.push({ t: new Date().toISOString().slice(11, 23), type: type, x: Math.round(x), y: Math.round(y), tgt: tj60Desc(tgt), top: tj60Desc(document.elementFromPoint(x, y)), n: note || '' });
                localStorage.setItem(TJ60_KEY, JSON.stringify(L.slice(-40)));
            } catch (e) { /* */ }
        }
        function tj60Near(x: number, y: number): string {
            const hit = (el: any, pad: number) => { if (!el) return false; const r = el.getBoundingClientRect(); return r.width > 0 && x >= r.left - pad && x <= r.right + pad && y >= r.top - pad && y <= r.bottom + pad; };
            const ai = T60.$id('aiGlobal'), th = document.querySelector('#fs59.on .fs59-th');
            return hit(ai, 16) ? 'ai' : hit(th, 24) ? 'fs' : '';
        }
        ['touchstart', 'touchend', 'touchcancel', 'pointerdown', 'pointercancel'].forEach(tp => window.addEventListener(tp, (e: any) => {
            try { const p = e.changedTouches ? e.changedTouches[0] : e; if (!p) return; const w = tj60Near(p.clientX, p.clientY); if (w) tj60Log(tp, p.clientX, p.clientY, e.target, w); } catch (x) { /* */ }
        }, { capture: true, passive: true }));
        function tj60Html(): string {
            let L: any[] = []; try { L = JSON.parse(localStorage.getItem(TJ60_KEY) || '[]'); } catch (e) { /* */ }
            const E = T60.escapeHtml || ((s: string) => s);
            return `<div class="pp-lbl" style="margin-top:12px">TEGINISH JURNALI (tez surish / AI tugmasi) — ${L.length} ta</div>` + (L.length ? '<div style="font:11px/1.45 monospace;max-height:220px;overflow:auto;background:rgba(15,23,42,.6);border-radius:8px;padding:6px">' + L.slice().reverse().map((r: any) => E(`${r.t} ${r.n} ${r.type} (${r.x},${r.y}) → ${r.tgt} | ustida: ${r.top}`)).join('<br>') + '</div>' : '<div class="nd-tip">Hali yozuv yoʻq — tez surish yoki AI tugmasini bir marta tortib koʻring.</div>');
        }
        if (typeof T60.coreErrOpen === 'function') T60.coreErrOpen = T60.agmkExtend('coreErrOpen', '6.0: teginish jurnali', T60.coreErrOpen, (o: Function) => function (this: unknown) {
            const r = o.apply(this, arguments); try { const m = T60.$id('ceMdl'), c = m && m.querySelector('.modal-content'); if (c && !c.querySelector('.tj60')) c.insertAdjacentHTML('beforeend', '<div class="tj60">' + tj60Html() + '</div>'); } catch (e) { /* */ } return r;
        });

        // ---------- AI tugmasi: teginish bilan surish ----------
        (function () {
            const init = (): void => {
                const b = T60.$id('aiGlobal'); if (!b || b._t60) return; b._t60 = true;
                let st: any = null, moved = false, lp: any = 0;
                b.addEventListener('touchstart', (e: any) => {
                    const t = e.touches[0]; if (!t || e.touches.length > 1) return; const r = b.getBoundingClientRect();
                    st = { x: t.clientX, y: t.clientY, dx: t.clientX - r.left, dy: t.clientY - r.top }; moved = false;
                    clearTimeout(lp); lp = setTimeout(() => { if (st && !moved) { st = null; } }, 650); // uzoq bosish — eski yoʻl (pointer) tezkor oynani ochadi
                }, { passive: true });
                b.addEventListener('touchmove', (e: any) => {
                    if (!st) return; const t = e.touches[0]; if (!t) return;
                    if (!moved && Math.hypot(t.clientX - st.x, t.clientY - st.y) < 8) return;
                    moved = true; clearTimeout(lp); e.preventDefault(); e.stopPropagation();
                    b.style.right = 'auto'; b.style.bottom = 'auto';
                    b.style.left = Math.max(0, Math.min(window.innerWidth - b.offsetWidth, t.clientX - st.dx)) + 'px';
                    b.style.top = Math.max(0, Math.min(window.innerHeight - b.offsetHeight, t.clientY - st.dy)) + 'px';
                    b.classList.add('ai-dragging');
                }, { passive: false });
                const end = (): void => {
                    clearTimeout(lp); if (!st) return; const was = moved; st = null; b.classList.remove('ai-dragging');
                    if (was) { const r = b.getBoundingClientRect(), side = (r.left + r.width / 2) < window.innerWidth / 2 ? 'l' : 'r'; try { localStorage.setItem(T60.AIPOS_KEY || 'agmk_ai_pos', JSON.stringify({ side: side, y: r.top / window.innerHeight })); } catch (x) { /* */ } try { T60.aiPosApply(); } catch (x) { /* */ } b._skip = Date.now(); tj60Log('ai-surildi', r.left, r.top, b, 'ai'); }
                };
                b.addEventListener('touchend', end); b.addEventListener('touchcancel', end);
            };
            setTimeout(init, 1200); setTimeout(init, 4000); window.addEventListener('agmk:login', () => setTimeout(init, 900));
        })();

        // ---------- Tez surish: teginish, keng ushlash maydoni, 2,5 s, sakramaslik ----------
        (function () {
            if (typeof T60.fs59Ui !== 'function') return;
            if (typeof T60.fs59Hide === 'function') T60.fs59Hide = function (): void { const F = T60.FS59; clearTimeout(F.t); F.t = setTimeout(() => { if (!F.drag && F.el) F.el.classList.remove('on'); }, 2500); };
            if (typeof T60.fs59DragTo === 'function') { const od = T60.fs59DragTo; T60.fs59DragTo = function (cy: number): void { od(cy); try { const F = T60.FS59, vi = F.sc && T60.fs59VgInfo(F.sc); if (!vi || vi.total <= vi.cards.length) F.want = null; } catch (e) { /* */ } }; }
            const ou = T60.fs59Ui;
            T60.fs59Ui = function (): any {
                const d = ou.apply(this, arguments); const F = T60.FS59;
                if (d && !d._t60) {
                    d._t60 = true;
                    const hit = document.createElement('div'); hit.className = 'fs60-hit'; d.appendChild(hit);
                    const start = (e: any): void => { if (!F.sc) return; F.drag = true; d.classList.add('drag'); clearTimeout(F.t); if (e.cancelable) e.preventDefault(); e.stopPropagation(); try { F.sc.style.scrollBehavior = 'auto'; } catch (x) { /* */ } };
                    const move = (e: any): void => { if (!F.drag) return; const t = e.touches ? e.touches[0] : e; if (!t) return; if (e.cancelable) e.preventDefault(); e.stopPropagation(); T60.fs59DragTo(t.clientY); };
                    const end = (): void => { if (!F.drag) return; F.drag = false; d.classList.remove('drag'); try { T60.fs59Vg(true); } catch (x) { /* */ } T60.fs59Hide(); };
                    [hit, F.th].forEach((el: any) => {
                        el.addEventListener('touchstart', start, { passive: false });
                        el.addEventListener('touchmove', move, { passive: false });
                        el.addEventListener('touchend', end); el.addEventListener('touchcancel', end);
                    });
                    // sichqoncha / qalam — keng maydon ham
                    hit.addEventListener('pointerdown', (e: any) => { if (e.pointerType === 'touch') return; start(e); try { hit.setPointerCapture(e.pointerId); } catch (x) { /* */ } });
                    hit.addEventListener('pointermove', (e: any) => { if (e.pointerType === 'touch') return; move(e); });
                    hit.addEventListener('pointerup', (e: any) => { if (e.pointerType !== 'touch') end(); });
                }
                return d;
            };
            const st = document.createElement('style'); st.id = 'v60touchCss';
            st.textContent = `#fs59 .fs60-hit{position:absolute;right:-8px;top:-9px;width:48px;height:64px;pointer-events:auto;touch-action:none;background:transparent}
            #fs59 .fs59-th{touch-action:none}#fs59:not(.on) .fs60-hit{pointer-events:none}
            #aiGlobal{touch-action:none}`;
            document.head.appendChild(st);
        })();
        Object.assign(T60, { tj60Log: tj60Log, tj60Html: tj60Html });
