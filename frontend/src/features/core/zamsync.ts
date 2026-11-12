
        // =====================================================================
        // v3.2.2 — 🚨 ZAMECHANIYA RASMLARI VA OVOZLARI BOSHQA TELEFONLARDA HAM
        //  Muammo: rasm faqat olingan telefonda (IndexedDB) turardi, serverga faqat matn borardi — boshqa telefonda «rasm yoʻq»,
        //  server javobi kelganda esa olingan telefonda ham rasm havolasi yoʻqolardi.
        //  Endi: sinxronlashdan oldin rasm/ovoz korxona serveriga («*zam» boʻlim fayli, shifrlangan) yuklanadi,
        //  boshqa telefon uni serverdan oladi va oʻzida saqlaydi (keyin internetsiz ham koʻrinadi).
        //  Serverdan kelgan yozuvda rasm boʻlmasa — telefondagi rasm oʻchirilmaydi.
        // =====================================================================
        var ZS = { busy: false, hyd: false };
        function zsItems(fn) { // barcha zamechaniya va urinishlardagi rasm/ovoz obyektlari
            (vagonlarData || []).forEach(v => ['gallery', 'rahbarImgs'].forEach(k => (v[k] || []).forEach(x => x && typeof x === 'object' && fn(x, v)))); // v3.4: galereya ham
            (vagonlarData || []).forEach(v => (v.zams || []).forEach(z => { [z].concat(z.attempts || []).forEach(o => { (o.photos || []).forEach(x => x && typeof x === 'object' && fn(x, v)); if (o.audio && typeof o.audio === 'object') fn(o.audio, v); }); }));
        }
        function zsRef(x) { return typeof imgRef === 'function' ? imgRef(x.src) : (/^idb:/.test(x.src || '') ? x.src.slice(4) : null); }
        async function zsUpload() {
            if (ZS.busy || typeof srvRaw !== 'function' || !(typeof sigSrv === 'function' && sigSrv())) return 0;
            ZS.busy = true; let n = 0;
            try {
                const L = []; zsItems(x => { if (!x.srv && zsRef(x)) L.push(x); });
                for (const x of L) {
                    const ref = zsRef(x); let b = null; try { b = await mediaGetBlob(ref); } catch (e) {} if (!b) continue;
                    try { const r = await srvRaw('/api/files/v1?to=' + encodeURIComponent('*zam') + '&name=' + encodeURIComponent(ref) + '&mime=' + encodeURIComponent(b.type || 'application/octet-stream'), { method: 'POST', body: b }); x.srv = (await r.json()).id; n++; } catch (e) { break; }
                }
                if (n) saveDB(false);
            } finally { ZS.busy = false; }
            return n;
        }
        async function zsHydrate() {
            if (ZS.hyd || typeof srvFileGet !== 'function' || !(typeof sigSrv === 'function' && sigSrv())) return 0;
            ZS.hyd = true; let n = 0;
            try {
                const L = []; zsItems(x => { const ref = zsRef(x); if (x.srv && ref && !THUMBS.has(ref) && !(MEDIA_META && MEDIA_META.has(ref))) L.push(x); });
                for (const x of L) {
                    const ref = zsRef(x);
                    try {
                        const b = await srvFileGet(x.srv); if (!b) continue;
                        if (/^image\//.test(b.type) || /^img_/.test(ref)) {
                            const d = await decodeImage(b); try { const thumb = makeThumb(d.src, d.w, d.h), meta = { id: ref, thumb: thumb, w: d.w, h: d.h, size: b.size, type: b.type || 'image/jpeg', at: new Date().toISOString(), by: 'server' }; await mediaSave(ref, b, meta); THUMBS.set(ref, thumb); MEDIA_META.set(ref, meta); } finally { if (d.close) d.close(); }
                        } else { const meta = { id: ref, kind: 'audio', size: b.size, type: b.type || 'audio/webm', dur: x.dur || 0, at: new Date().toISOString(), by: 'server' }; await mediaSave(ref, b, meta); MEDIA_META.set(ref, meta); }
                        n++;
                    } catch (e) { console.error('zam media', e); }
                }
                if (n) { try { const v = vagonlarData.find(x => x.id === activeVagonId); if (v && typeof renderZams === 'function' && $id('zamList')) renderZams(v); } catch (e) {} try { refreshCurrentScreen(); } catch (e) {} }
            } finally { ZS.hyd = false; }
            return n;
        }
        (function () {
            // Sinxronlashdan oldin — yuklash, keyin — yetishmaganlarini olish
            if (typeof syncNow === 'function') syncNow = agmkExtend('syncNow', 'v3.2.2: zamechaniya rasmlari serverga / serverdan', syncNow, o => async function () {
                try { await zsUpload(); } catch (e) {}
                const r = await o.apply(this, arguments);
                zsHydrate().catch(() => {});
                return r;
            });
            // Serverdan kelgan yozuvda rasm yoʻq (eski ilova yoki hali yuklanmagan) — telefondagisi saqlanadi
            if (typeof syncApply === 'function') syncApply = agmkExtend('syncApply', 'v3.2.2: telefondagi zamechaniya rasmlari oʻchmaydi', syncApply, o => function (rec) {
                if (!rec || rec.kind !== 'unit') return o.apply(this, arguments);
                const id = String(rec.id).slice(2), old = vagonlarData.find(x => String(x.id) === id), keep = old && old.zams ? JSON.parse(JSON.stringify(old.zams)) : null;
                const r = o.apply(this, arguments);
                try {
                    const v = vagonlarData.find(x => String(x.id) === id);
                    if (v && keep && v.zams) v.zams.forEach(z => {
                        const oz = keep.find(q => q.no === z.no); if (!oz) return;
                        const mergeM = (a, b) => { const L = (a || []).slice(); (b || []).forEach(x => { if (x && !L.some(y => y && y.src === x.src)) L.push(x); }); L.forEach(x => { const m = (b || []).find(y => y && y.src === x.src); if (m && m.srv && !x.srv) x.srv = m.srv; }); return L; };
                        z.photos = mergeM(z.photos, oz.photos); if (!z.audio && oz.audio) z.audio = oz.audio; else if (z.audio && oz.audio && oz.audio.srv && !z.audio.srv && z.audio.src === oz.audio.src) z.audio.srv = oz.audio.srv;
                        (z.attempts || []).forEach((a, i) => { const oa = (oz.attempts || [])[i]; if (!oa) return; a.photos = mergeM(a.photos, oa.photos); if (!a.audio && oa.audio) a.audio = oa.audio; });
                    });
                } catch (e) { console.error(e); }
                return r;
            });
            window.addEventListener('agmk:login', () => setTimeout(() => { zsUpload().then(() => zsHydrate()).catch(() => {}); }, 3000));
        })();

