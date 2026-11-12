        function __lz(id) { var e = document.getElementById(id), v = JSON.parse(e.textContent); e.textContent = ''; return v; }
        function __lzVar(n) { function fix(v) { Object.defineProperty(window, n, { value: v, writable: true, configurable: true, enumerable: true }); return v; } Object.defineProperty(window, n, { configurable: true, enumerable: true, get: function () { return fix(__lz('lz_' + n)); }, set: fix }); }
        function __lzKey(o, n, k) { Object.defineProperty(o, k, { configurable: true, enumerable: true, get: function () { var v = __lz('lz_' + n + '__' + k); Object.defineProperty(o, k, { value: v, writable: true, configurable: true, enumerable: true }); return v; }, set: function (v) { Object.defineProperty(o, k, { value: v, writable: true, configurable: true, enumerable: true }); } }); }

        // ===== Kengaytmalar reyestri (v3.0) =====
        // Ilova bosqichma-bosqich kengaygan: ayrim funksiyalarga keyingi boʻlimlar qoʻshimcha qadam qoʻshadi.
        // Har bir bunday qoʻshimcha shu yerda nomi bilan roʻyxatga olinadi — yashirin «yamoq» yoʻq:
        // agmkExtList() — qaysi funksiyaga qaysi boʻlim nima qoʻshgani (audit uchun).
        var AGMK_EXT = {};
        function agmkExtend(fname, label, cur, make) {
            if (typeof cur !== 'function') { console.error('agmkExtend: «' + fname + '» topilmadi (' + label + ')'); return cur; }
            (AGMK_EXT[fname] = AGMK_EXT[fname] || []).push(label);
            return make(cur);
        }
        function agmkExtList() { return Object.keys(AGMK_EXT).sort().map(k => k + ' (' + AGMK_EXT[k].length + '): ' + AGMK_EXT[k].join(' → ')); }

