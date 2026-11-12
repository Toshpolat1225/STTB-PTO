        // =====================================================================
        // YANGI (7-bosqich): adashib yuklangan rasmni o'chirish, lavozimni ro'yxatdan tanlash
        // =====================================================================

        // ============ RASM QAYERGA TEGISHLI EKANINI TOPISH ============
        function mediaBy(src) { const m = MEDIA_META.get(imgRef(src)); return m ? (m.by || '') : ''; }
        function findImageOwner(src) {
            if (!src) return null;
            let hit = null;
            const scanArr = (arr, persist, extra, hold) => {
                if (hit || !Array.isArray(arr)) return;
                const i = arr.findIndex(x => x && x.src === src);
                if (i < 0) return;
                hit = { author: arr[i].author || mediaBy(src), persist: persist, extra: extra,
                    remove: () => { const k = arr.findIndex(x => x && x.src === src); if (k >= 0) { if (hold && arr[k].srv) (hold.galDel = hold.galDel || []).push(src); arr.splice(k, 1); } } }; // v3.4: serverdagi rasm o'chirilsa — boshqa telefonlarda ham o'chadi
            };
            const scanObj = (o, key) => {
                if (hit || !o || !o[key] || o[key].src !== src) return;
                hit = { author: o[key].author || mediaBy(src), persist: 'db', remove: () => { o[key] = null; } };
            };
            (vagonlarData || []).forEach(v => { scanArr(v.gallery, 'db', undefined, v); scanArr(v.rahbarImgs, 'db', undefined, v); (v.zams || []).forEach(z => { scanArr(z.photos, 'db'); (z.attempts || []).forEach(a => scanArr(a.photos, 'db')); }); });
            if (typeof ZF !== 'undefined') { scanArr(ZF.photos, 'none'); scanArr(FX.photos, 'none'); }
            Object.keys(sectionItemsDB || {}).forEach(t => Object.keys(sectionItemsDB[t] || {}).forEach(su => (sectionItemsDB[t][su] || []).forEach(it => {
                scanArr(it.gallery, 'db'); scanArr(it.rahbarImgs, 'db');
                scanObj(it, 'photo'); scanObj(it, 'spravka');
                (it.yutuqlar || []).concat(it.hafsanalar || []).forEach(e => scanArr(e && e.files, 'db'));
            })));
            // Hali saqlanmagan (qo'shish shaklidagi) rasmlar
            if (typeof ATT !== 'undefined') { scanArr(ATT.pending.yutuq, 'none'); scanArr(ATT.pending.hafsana, 'none'); }
            if (typeof FB !== 'undefined') scanArr(FB.files, 'none');
            // Shikoyat-taklif rasmlari (alohida saqlanadi)
            if (!hit && typeof getFeedback === 'function') {
                const list = getFeedback();
                list.forEach(x => scanArr(x.files, 'fb', list));
            }
            return hit;
        }
        // O'chirish huquqi: rasmni yuklagan xodimning o'zi yoki administrator
        function canDeleteImage(owner) {
            if (!owner) return false;
            if (owner.persist === 'none' || isAdmin()) return true;
            const nm = currentUser && currentUser.name;
            return !!(nm && owner.author && String(owner.author).indexOf(nm) === 0);
        }
        function updateViewerDeleteBtn() {
            const btn = document.getElementById('pvDel');
            if (!btn) return;
            const src = viewerImagesList[viewerCurrentIndex];
            btn.classList.toggle('hidden', !canDeleteImage(findImageOwner(src)));
        }
        async function deleteViewerImage() {
            const src = viewerImagesList[viewerCurrentIndex];
            const owner = findImageOwner(src);
            if (!canDeleteImage(owner)) { alert("Bu rasmni faqat uni yuklagan xodim yoki administrator o'chira oladi."); return; }
            if (!await uiConfirm("Bu rasm o'chirilsinmi?")) return;
            owner.remove();
            if (owner.persist === 'db') saveDB();               // ↩️ bilan qaytarish mumkin
            else if (owner.persist === 'fb') saveFeedback(owner.extra);
            viewerImagesList.splice(viewerCurrentIndex, 1);
            viewerAuthorsList.splice(viewerCurrentIndex, 1);
            refreshAfterImageDelete();
            if (!viewerImagesList.length) closeImageViewer();
            else { viewerCurrentIndex = Math.min(viewerCurrentIndex, viewerImagesList.length - 1); updateViewerImage(); }
            showToast(owner.persist === 'db' ? "🗑 Rasm o'chirildi. Qaytarish uchun ↩️ ni bosing" : "🗑 Rasm o'chirildi");
        }
        // Sahifani tepaga sakratmasdan faqat albomlarni qayta chizadi
        function refreshAfterImageDelete() {
            const act = (document.querySelector('.screen.active') || {}).id;
            try {
                if (act === 'screen-vagon-pasport') {
                    const v = vagonlarData.find(x => x.id === activeVagonId);
                    if (v) { renderGallery(v); renderRahbarPreview(v); renderZams(v); }
                }
                if (act === 'screen-item-pasport') {
                    const item = getActiveItem();
                    if (item) {
                        renderItemGallery(item);
                        if (currentSectionType === 'seh') renderItemRahbarPreview(item);
                        if (currentSectionType === 'xodim') { renderXodimPhoto(item); renderXodimExtra(item); }
                    }
                }
            } catch (e) {}
            try { if (!document.getElementById('fbInboxModal').classList.contains('hidden')) renderFbInbox(); } catch (e) {}
            try { if (!document.getElementById('feedbackModal').classList.contains('hidden')) renderFbFiles(); } catch (e) {}
            try { if (!document.getElementById('fixModal').classList.contains('hidden')) renderFxFiles(); } catch (e) {}
        }

        // ============ LAVOZIMNI SHTATDAN ANIQLASH ============
        // Aniq mos kelsa yoki qidiruvda bitta natija chiqsa — o'sha lavozim; aks holda null
        function resolveShtatName(text) {
            const t = String(text || '').trim();
            if (!t) return null;
            const exact = shtatList.find(x => normTxt(x) === normTxt(t));
            if (exact) return exact;
            const m = shtatMatches(t);
            return m.length === 1 ? m[0].name : null;
        }


