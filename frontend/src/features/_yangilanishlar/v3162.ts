        // v3.16.2 — 3.16.1 (boshqa sessiya) asl manbaga birlashtirildi; kuzatilgan kamchiliklar tuzatildi
        //  1) «Hamma uchun ochiq» rejimini administrator Sozlamalarda yoqadi / oʻchiradi (avval kod ichida doim yoqilgan edi)
        //  2) Sozlamalardagi administrator kartalari (xavfsizlik jurnali, parollar jurnali…) — faqat haqiqiy administratorga
        //  3) Sinxron band paytida bosilgan «Sinxronlash» yoʻqolmaydi — joriy sinxron tugashini kutadi (srv.js ichida)
        function openAllToggle() {
            if (!isAdminReal()) { alert('Faqat administrator oʻzgartira oladi.'); return; }
            const on = !AGMK_OPEN_ALL;
            uiConfirm(on ? '🔓 «Hamma uchun ochiq» rejimi yoqilsinmi?\n\nHar bir xodim barcha boʻlimlarni koʻradi va tahrirlay oladi (parol, rol, kalit va oklad — faqat administratorda qoladi).\n\nIlova qayta ochiladi.'
                : '🔒 «Hamma uchun ochiq» rejimi oʻchirilsinmi?\n\nHar kim faqat oʻz roliga berilgan imkoniyatlarni koʻradi.\n\nIlova qayta ochiladi.').then(ok => {
                if (!ok) return; try { localStorage.setItem('agmk_open_all', on ? '1' : '0'); } catch (e) {}
                try { if (typeof audLog === 'function') audLog('huquq', '«Hamma uchun ochiq» rejimi ' + (on ? 'yoqildi' : 'oʻchirildi')); } catch (e) {}
                location.reload();
            });
        }
        if (typeof renderSettings === 'function') renderSettings = agmkExtend('renderSettings', 'v3.16.2: ochiq rejim kartasi, admin kartalari', renderSettings, o => function () {
            const r = o.apply(this, arguments);
            try {
                const adm = isAdminReal();
                document.querySelectorAll('#screen-settings .set-admin').forEach(c => c.classList.toggle('hidden', !adm));
                document.querySelectorAll('#screen-settings .set-nonadmin').forEach(c => c.classList.toggle('hidden', adm));
                let c = $id('set-openall');
                const anchor = document.querySelector('#screen-settings .set-admin');
                if (!c && anchor) { c = document.createElement('div'); c.id = 'set-openall'; c.className = 'btn-card set-admin'; c.onclick = openAllToggle; anchor.parentNode.insertBefore(c, anchor); }
                if (c) {
                    c.classList.toggle('hidden', !adm);
                    c.innerHTML = `<div class="btn-card-content"><span class="btn-icon">${AGMK_OPEN_ALL ? '🔓' : '🔒'}</span><span class="btn-text">Hamma uchun ochiq rejim<small id="set-openall-sub">${AGMK_OPEN_ALL ? 'Yoqilgan — har bir xodim hamma boʻlimni koʻradi (parol, rol, oklad — faqat sizda). Oʻchirish uchun bosing' : 'Oʻchirilgan — har kim oʻz roli boʻyicha. Yoqish uchun bosing'}</small></span></div>`;
                }
            } catch (e) {}
            return r;
        });
        // 4) «STTB texnikalari» kartasida boʻlimlar soni: Lokomotivlar ichida Teplovozlar va Elektrovozlar alohida (6 emas — 7)
        if (typeof menuArrange === 'function') menuArrange = agmkExtend('menuArrange', 'v3.16.2: STTB boʻlimlar soni', menuArrange, o => function () {
            const r = o.apply(this, arguments);
            try { const el = document.querySelector('#main-card-list [data-sec="grp-sttb"] .mn-cnt'), lok = document.querySelector('#main-card-list [data-mn="6.1"]');
                if (el && lok && lok.classList.contains('mn-in')) { const n = parseInt(el.textContent, 10); if (n && !el.dataset.lk) { el.textContent = (n + 1) + ' boʻlim'; el.dataset.lk = '1'; } } } catch (e) {}
            return r;
        });
        // 5) Dispetcherlik: bir xil «jonli xarita» kartasi ikki marta chiqardi — bittasi qoladi
        if (typeof renderHrHome === 'function') renderHrHome = agmkExtend('renderHrHome', 'v3.16.2: takror jonli xarita kartasi', renderHrHome, o => function () {
            const r = o.apply(this, arguments);
            try { const el = $id('hrHome'); if (el) { const L = [...el.querySelectorAll('.btn-card')].filter(c => /mashOpen\('live','rail'\)/.test(c.getAttribute('onclick') || '')); L.slice(1).forEach(c => c.remove()); } } catch (e) {}
            return r;
        });

