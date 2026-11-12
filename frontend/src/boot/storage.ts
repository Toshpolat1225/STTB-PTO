(function () { // Excel kutubxonasi (≈0,8 MB) — birinchi murojaatda ishga tushadi
    Object.defineProperty(window, 'XLSX', { configurable: true, get: function () { var src = document.getElementById('xlsxLibSrc'); delete window.XLSX; if (!src) return undefined; var n = document.createElement('script'); n.text = src.textContent; document.head.appendChild(n); return window.XLSX; }, set: function (v) { Object.defineProperty(window, 'XLSX', { value: v, writable: true, configurable: true, enumerable: true }); } });
})();
/* ===== AGMK-STTB PTO v3.0 — MAʼLUMOTLAR OMBORI (katta maʼlumotlar IndexedDB da) =====
   Muammo: brauzer/WebView localStorage chegarasi ≈5 MB — baza (vagonlar, aktlar, yozishmalar, buxgalteriya …)
   o'sgan sari «Xotira to'ldi» bo'lib, yozuv saqlanmay qolardi; har saqlashda bir necha MB sinxron yozilib telefon qotardi.
   Yechim: 48 KB dan katta qiymatlar avtomatik IndexedDB ga (yuzlab MB) o'tadi; ilova kodi o'zgarmaydi — localStorage
   so'rovlari xotiradagi nusxadan tez javob oladi, diskka yozish fonda (0,25 s kechikish bilan, ilova yopilayotganda darhol).
   Ilova asosiy kodi maʼlumotlar xotiraga to'liq yuklangandan keyingina ishga tushadi. */
(function () {
    var LS; try { LS = window.localStorage; } catch (e) { LS = null; }
    var main = document.getElementById('agmkMain');
    function start() {
        if (!main || main.__run) return;
        if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', start); return; } // sahifa (HTML) toʻliq oʻqilgach
        main.__run = true;
        var n = document.createElement('script'); n.id = 'agmkMainRun'; n.text = main.textContent; main.parentNode.insertBefore(n, main.nextSibling);
        if (document.readyState === 'complete' && typeof window.onload === 'function') { try { window.onload({ type: 'load' }); } catch (e) { console.error(e); } }
    }
    if (!LS || !window.indexedDB) { start(); return; }
    var P = Storage.prototype, oGet = P.getItem, oSet = P.setItem, oDel = P.removeItem;
    var IDX = 'agmk_big_keys', LIM = 48 * 1024, MEM = {}, BIG = {}, db = null, q = {}, qt = 0, broken = false;
    try { (JSON.parse(oGet.call(LS, IDX) || '[]') || []).forEach(function (k) { BIG[k] = 1; }); } catch (e) {}
    function saveIdx() { try { oSet.call(LS, IDX, JSON.stringify(Object.keys(BIG))); } catch (e) {} }
    function flush() {
        qt = 0; var w = q; q = {}; if (broken) return;
        try { var tx = db.transaction('kv', 'readwrite'), st = tx.objectStore('kv'); for (var k in w) { if (w[k] === null) st.delete(k); else st.put(w[k], k); } }
        catch (e) { console.error('ombor', e); for (var k2 in w) q[k2] = w[k2]; if (!qt) qt = setTimeout(flush, 2000); }
    }
    function sched(k, v) { q[k] = v; if (!qt) qt = setTimeout(flush, 250); }
    P.getItem = function (k) { if (this === LS && BIG[k]) return Object.prototype.hasOwnProperty.call(MEM, k) ? MEM[k] : null; return oGet.call(this, k); };
    P.setItem = function (k, v) {
        if (this !== LS) return oSet.call(this, k, v); v = String(v);
        if (BIG[k] || (v.length > LIM && db)) { MEM[k] = v; if (!BIG[k]) { BIG[k] = 1; saveIdx(); try { oDel.call(LS, k); } catch (e) {} } sched(k, v); return; }
        return oSet.call(this, k, v);
    };
    P.removeItem = function (k) { if (this === LS && BIG[k]) { delete MEM[k]; delete BIG[k]; saveIdx(); sched(k, null); return; } return oDel.call(this, k); };
    function now() { if (qt) { clearTimeout(qt); flush(); } }
    window.addEventListener('pagehide', now); document.addEventListener('visibilitychange', function () { if (document.hidden) now(); });
    window.agmkStoreInfo = function () { var t = 0; for (var k in MEM) t += MEM[k].length; return { keys: Object.keys(BIG), chars: t, ok: !broken }; };
    var r; try { r = indexedDB.open('agmk_kv', 1); } catch (e) { start(); return; }
    r.onupgradeneeded = function () { r.result.createObjectStore('kv'); };
    r.onerror = function () { broken = true; start(); };
    r.onsuccess = function () {
        db = r.result; var keys = Object.keys(BIG); if (!keys.length) { start(); return; }
        var tx = db.transaction('kv', 'readonly'), st = tx.objectStore('kv'), left = keys.length, bad = false;
        keys.forEach(function (k) { var g = st.get(k); g.onsuccess = function () { if (g.result !== undefined) MEM[k] = g.result; if (--left === 0) done(); }; g.onerror = function () { bad = true; if (--left === 0) done(); }; });
        function done() { if (bad) { broken = true; try { alert("⚠️ Telefon xotirasidagi maʼlumotlarni oʻqib boʻlmadi. Ilovani yopib qayta oching (maʼlumotlar oʻchmagan)."); } catch (e) {} } start(); }
    };
})();
