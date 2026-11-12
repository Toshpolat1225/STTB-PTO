        // =====================================================================
        // 6.1 (138) — 🔒 YOPIQ KONTUR (muallif tasdiqladi, 04.11.2026; IT talabi: «xavfsizlik birinchi oʻrinda»)
        //  1) Tashqi xizmatlar koddan olib tashlandi: tashqi AI (Claude/Gemini), tashqi ovoz (Microsoft), OpenStreetMap soʻrovi,
        //     OSRM marshruti — ularning manzillari oʻrniga agmkNoNet() (chaqirilsa — «yopiq kontur» xatosi, tarmoqqa hech narsa ketmaydi).
        //     AI sozlamasi yashirildi, bulut AI hech qachon yoqilmaydi; ilovaning mahalliy qidiruv va tekshiruvlari ishlaydi.
        //  2) Xarita fonlari internetdan olinmaydi: «agmk-tile://…» — korxona serverida xarita boʻlsa (/tiles), shundan;
        //     boʻlmasa — boʻsh (toʻq) fon, ustida sxema, GPS nuqtalar va marshrutlar.
        //  3) Tarmoq qoʻriqchisi (telefon, kompyuter, web — bir xil): fetch, XMLHttpRequest, WebSocket, EventSource, sendBeacon,
        //     rasm manzillari va window.open — faqat korxona serveri / ichki tarmoq (10.*, 172.16–31.*, 192.168.*, 127.*, *.local …).
        //     Boshqa manzil bloklanadi va hisobga yoziladi (faqat host nomi, maʼlumot emas).
        //  4) build.mjs — yigʻishda tashqi murojaat qiladigan kod topilsa, versiya chiqmaydi (tools: «yopiq kontur tekshiruvi»).
        // =====================================================================
        function agmkNoNet(w: string): any { throw new Error('🔒 Yopiq kontur: ' + w + ' oʻchirilgan — ilova faqat korxona serveri bilan ishlaydi'); }
        const YK61: any = window as any;
        var YK61_LOG = 'agmk_net_block';
        // ---------- 1) bulut AI hech qachon yoqilmaydi ----------
        if (typeof YK61.aicGet === 'function') YK61.aicGet = function () { return { on: false, prov: 'gemini', key: '', model: '', share: false }; };
        YK61.aicSet = function () { return false; };
        YK61.aiCloudReady = function () { return false; };
        function yk61HideAi(): void { try { const e = YK61.$id('set-ai-sub'); const c = e && e.closest('.btn-card'); if (c) (c as any).style.display = 'none'; } catch (e) { /* */ } }
        setTimeout(yk61HideAi, 0); setTimeout(yk61HideAi, 1500);

        // ---------- 3) tarmoq qoʻriqchisi ----------
        function yk61SrvHosts(): string[] {
            const L: string[] = [];
            try { const c = YK61.syncCfg && YK61.syncCfg(); if (c && c.url) L.push(new URL(c.url).hostname.toLowerCase()); } catch (e) { /* */ }
            try { (JSON.parse(localStorage.getItem('agmk_allow_hosts') || '[]') || []).forEach((h: string) => L.push(String(h).toLowerCase())); } catch (e) { /* */ }
            return L;
        }
        function yk61Private(h: string): boolean {
            h = h.toLowerCase().replace(/^\[|\]$/g, '');
            if (!h || h === 'localhost' || h === '::1' || /\.(local|lan|internal|localdomain|home\.arpa)$/.test(h) || h.indexOf('.') < 0 && h.indexOf(':') < 0) return true;
            const m = /^(\d+)\.(\d+)\.(\d+)\.(\d+)$/.exec(h);
            if (m) { const a = +m[1], b = +m[2]; return a === 10 || a === 127 || (a === 192 && b === 168) || (a === 172 && b >= 16 && b <= 31) || (a === 169 && b === 254); }
            return /^f[cd][0-9a-f]{2}:/.test(h) || /^fe80:/.test(h);
        }
        function yk61Ok(u: any): boolean {
            let x: URL; try { x = new URL(String(u), location.href); } catch (e) { return true; } // notoʻgʻri manzil — brauzerning oʻzi rad etadi
            const p = x.protocol;
            if (!/^(https?|wss?|ftp):$/.test(p)) return true; // data:, blob:, file:, tel:, mailto: — tarmoqqa chiqmaydi
            const h = x.hostname.toLowerCase();
            if (location.protocol !== 'file:' && h === location.hostname.toLowerCase()) return true;
            return yk61Private(h) || yk61SrvHosts().indexOf(h) >= 0;
        }
        function yk61Block(kind: string, u: any): void {
            let h = ''; try { h = new URL(String(u), location.href).hostname; } catch (e) { h = '?'; }
            try { const o = JSON.parse(localStorage.getItem(YK61_LOG) || '{}') || {}; o.n = (o.n || 0) + 1; o.last = { h: h, k: kind, at: new Date().toISOString() }; o.hosts = o.hosts || {}; o.hosts[h] = (o.hosts[h] || 0) + 1; localStorage.setItem(YK61_LOG, JSON.stringify(o)); } catch (e) { /* */ }
            try { console.warn('🔒 Yopiq kontur: tashqi manzil bloklandi —', kind, h); } catch (e) { /* */ }
        }
        function yk61Err(): Error { return new TypeError('🔒 Yopiq kontur: tashqi manzil bloklandi (ilova faqat korxona serveri bilan ishlaydi)'); }
        (function () {
            try {
                const of = window.fetch; if (of) window.fetch = function (this: unknown, i: any, o?: any) { const u = i && typeof i === 'object' && 'url' in i ? i.url : i; if (!yk61Ok(u)) { yk61Block('fetch', u); return Promise.reject(yk61Err()); } return of.apply(this, arguments as any); } as any;
                const xo = XMLHttpRequest.prototype.open; XMLHttpRequest.prototype.open = function (this: any, m: string, u: any) { if (!yk61Ok(u)) { yk61Block('xhr', u); throw yk61Err(); } return xo.apply(this, arguments as any); } as any;
                const W = (window as any).WebSocket; if (W) { const NW: any = function (u: any, p?: any) { if (!yk61Ok(u)) { yk61Block('ws', u); throw yk61Err(); } return p === undefined ? new W(u) : new W(u, p); }; NW.prototype = W.prototype; ['CONNECTING', 'OPEN', 'CLOSING', 'CLOSED'].forEach(k => { NW[k] = W[k]; }); (window as any).WebSocket = NW; }
                const ES = (window as any).EventSource; if (ES) { const NE: any = function (u: any, o?: any) { if (!yk61Ok(u)) { yk61Block('sse', u); throw yk61Err(); } return new ES(u, o); }; NE.prototype = ES.prototype; (window as any).EventSource = NE; }
                if (navigator.sendBeacon) { const sb = navigator.sendBeacon.bind(navigator); (navigator as any).sendBeacon = function (u: any, d?: any) { if (!yk61Ok(u)) { yk61Block('beacon', u); return false; } return sb(u, d); }; }
                const wo = window.open; window.open = function (this: unknown, u?: any) { if (u && !yk61Ok(u)) { yk61Block('open', u); try { YK61.showToast('🔒 Yopiq kontur: tashqi sayt ochilmaydi'); } catch (e) { /* */ } return null; } return wo.apply(this, arguments as any); } as any;
                // rasmlar (xarita fonlari va h.k.)
                const D = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src');
                if (D && D.set) Object.defineProperty(HTMLImageElement.prototype, 'src', { configurable: true, enumerable: D.enumerable, get: D.get, set: function (this: any, v: any) { if (v && !yk61Ok(v)) { yk61Block('img', v); return D.set!.call(this, YK61_BLANK); } return D.set!.call(this, v); } });
                const sa = Element.prototype.setAttribute; Element.prototype.setAttribute = function (this: any, n: string, v: any) { if ((n === 'src' || n === 'srcset') && (this instanceof HTMLImageElement || this instanceof HTMLScriptElement || this instanceof HTMLIFrameElement) && v && !yk61Ok(String(v).split(/\s+/)[0])) { yk61Block(n, v); return sa.call(this, n, this instanceof HTMLImageElement ? YK61_BLANK : 'about:blank'); } return sa.apply(this, arguments as any); } as any;
            } catch (e) { console.error('6.1 yopiq kontur', e); }
        })();

        // ---------- 2) xarita fonlari: agmk-tile:// → korxona serveri yoki boʻsh ----------
        var YK61_BLANK = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
        function yk61TileBase(): string {
            try { if (localStorage.getItem('agmk_tiles_on') !== '1') return ''; const c = YK61.syncCfg && YK61.syncCfg(); return c && c.url ? String(c.url).replace(/\/+$/, '') + '/tiles/' : ''; } catch (e) { return ''; }
        }
        function yk61PatchTiles(): boolean {
            const L = YK61.L; if (!L || !L.TileLayer || L.TileLayer.prototype.__yk61) return !!(L && L.TileLayer);
            const og = L.TileLayer.prototype.getTileUrl;
            L.TileLayer.prototype.getTileUrl = function (this: any, c: any) {
                const u = String(this._url || '');
                if (u.indexOf('agmk-tile://') === 0) { const b = yk61TileBase(); if (!b) return YK61_BLANK; const s = this._url; this._url = b + u.slice(12); try { return og.call(this, c); } finally { this._url = s; } }
                if (!yk61Ok(u.replace(/\{[^}]+\}/g, 'a'))) { yk61Block('tile', u.replace(/\{[^}]+\}/g, 'a')); return YK61_BLANK; }
                return og.call(this, c);
            };
            L.TileLayer.prototype.__yk61 = true; return true;
        }
        (function () { let n = 0; const t = setInterval(() => { if (yk61PatchTiles() || ++n > 60) clearInterval(t); }, 500); yk61PatchTiles(); })();
        (function () {
            const st = document.createElement('style'); st.id = 'v61ykCss';
            st.textContent = `.leaflet-container{background:#0b1220 linear-gradient(rgba(148,163,184,.07) 1px,transparent 1px) 0 0/48px 48px,linear-gradient(90deg,rgba(148,163,184,.07) 1px,transparent 1px) 0 0/48px 48px!important}`;
            document.head.appendChild(st);
        })();
        /** IT uchun: necha marta va qaysi hostlarga murojaat bloklangan */
        function agmkNetReport(): any { try { return JSON.parse(localStorage.getItem(YK61_LOG) || '{}') || {}; } catch (e) { return {}; } }
        Object.assign(YK61, { agmkNoNet: agmkNoNet, agmkNetReport: agmkNetReport, yk61Ok: yk61Ok });
