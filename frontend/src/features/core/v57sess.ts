        // =====================================================================
        // 5.7 — «Ilova oʻzidan-oʻzi chiqib ketyapti» (muallif, 30.10.2026)
        //  Sabab: Android xotira tejash uchun orqa fondagi ilova sahifasini (WebView) oʻchiradi yoki u qulab tushadi →
        //  ilova qayta ochiladi (loading) → kirish oynasi. Telefon sozlamasi «Ne sohranyat deystviya / Don't keep activities»
        //  (IT sinovida yoqilgan boʻlishi mumkin) yoki batareya tejash buni har safar qiladi.
        //  Endi: kirgan xodim 15 daqiqa ichida kutilmagan qayta ochilishda qayta kirmaydi — sessiya va oxirgi sahifa tiklanadi.
        //  «Chiqish» bosilsa yoki 15 daqiqadan koʻp oʻtsa — odatdagidek PIN / parol soʻraladi.
        // =====================================================================
        const SS57: any = window as any;
        var SS57_KEY = 'agmk_alive', SS57_MIN = 12 * 60; // 5.8: bir ish smenasi (12 soat) — kutish rejimidan keyin qayta kirish soʻralmaydi
        function ss57Mark(): void {
            try {
                const u: any = typeof currentUser !== 'undefined' ? currentUser : null; if (!u || !u.tabel || document.body.classList.contains('locked')) return;
                const a: any = document.querySelector('.screen.active');
                localStorage.setItem(SS57_KEY, JSON.stringify({ t: String(u.tabel), at: Date.now(), scr: a ? a.id : '' }));
            } catch (e) { /* */ }
        }
        function ss57Clear(): void { try { localStorage.removeItem(SS57_KEY); } catch (e) { /* */ } }
        setInterval(ss57Mark, 20000);
        document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') ss57Mark(); });
        window.addEventListener('pagehide', ss57Mark);
        if (typeof SS57.logout === 'function') SS57.logout = SS57.agmkExtend('logout', '5.7: «Chiqish» — sessiya tiklanmaydi', SS57.logout, (o: Function) => async function (this: unknown) {
            const r = await o.apply(this, arguments);
            try { if (document.body.classList.contains('locked')) ss57Clear(); } catch (e) { /* */ }
            return r;
        });
        function ss57Resume(): boolean {
            try {
                if (!document.body.classList.contains('locked')) return false;
                const m = JSON.parse(localStorage.getItem(SS57_KEY) || 'null'); if (!m || !m.t || !m.at) return false;
                if (Date.now() - +m.at > SS57_MIN * 60000) { ss57Clear(); return false; }
                const ses = typeof SS57.getSession === 'function' ? SS57.getSession() : null;
                if (!ses || String(ses.tabel) !== String(m.t)) return false; // «Chiqish» bosilgan yoki boshqa hisob
                const lk = SS57.lookupXodim(m.t); if (!lk || lk.err) return false;
                if (typeof SS57.secBlockMsg === 'function' && SS57.secBlockMsg(m.t)) return false;
                SS57.setSessionUser(lk.rec.item); SS57.hideLock();
                try { SS57.modRefresh(); } catch (e) { /* */ }
                if (m.scr && m.scr !== 'screen-main' && document.getElementById(m.scr)) { try { SS57.openScreen(m.scr); } catch (e) { /* */ } }
                try { SS57.showToast('♻️ Ilova qayta ochildi — davom etyapsiz'); } catch (e) { /* */ }
                ss57Mark(); return true;
            } catch (e) { console.error('5.7 sessiya', e); return false; }
        }
        setTimeout(ss57Resume, 900);
        Object.assign(SS57, { ss57Resume: ss57Resume, ss57Mark: ss57Mark });
