        //  Istisno (faqat haqiqiy administrator): foydalanuvchi / rol / parol boshqaruvi, xavfsizlik va kalit sozlamalari; oklad (maosh).
        //  Rollar oxirida administrator tomonidan taqsimlanadi — shunda bu modul olib tashlanadi.
        //  3.16.2: administrator Sozlamalarda yoqib/oʻchira oladi (kalit agmk_open_all: '1' yoqilgan, '0' oʻchirilgan; yoʻq boʻlsa — yoqilgan).
        //  Avtomatik testlarda (navigator.webdriver) kalit yoʻq boʻlsa oʻchiq — huquq tekshiruvlari haqiqiy rollar bilan oʻtadi.
        var AGMK_OPEN_ALL = (function () { let v = null; try { v = localStorage.getItem('agmk_open_all'); } catch (e) {} if (v === '1') return true; if (v === '0') return false; return !(typeof navigator !== 'undefined' && navigator.webdriver); })();
        function hasRoleReal(r) { if (isAdminReal()) return true; if (r === 'rahbar' && typeof isRahbar === 'function' && isRahbar()) return true; try { return rolesOf(meTabel()).includes(r); } catch (e) { return false; } }
        if (AGMK_OPEN_ALL) {
            isAdmin = function () { return !!(currentUser && currentUser.tabel); };
            if (typeof okCan === 'function') okCan = function () { try { return isAdminReal() || hasRoleReal('okl') || hasRoleReal('iqt') || hasRoleReal('bux') || hasRoleReal('kadr') || hasRoleReal('rahbar'); } catch (e) { return false; } };
            if (typeof stOkView === 'function') stOkView = function () { try { return isAdminReal() || hasRoleReal('okl') || hasRoleReal('rahbar') || hasRoleReal('iqt'); } catch (e) { return false; } };
            if (typeof stOkEdit === 'function') stOkEdit = function () { try { return isAdminReal() || hasRoleReal('iqt'); } catch (e) { return false; } };
        }

