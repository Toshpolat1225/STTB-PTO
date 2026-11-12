        // =====================================================================
        // v2.0 — KORXONA SERVERI (ichki tarmoq, ofis kompyuteri) ga QR orqali ulanish
        // QR: {"u":"https://<ip>:8443","k":"<anon kalit>","f":"<sertifikat SHA-256>","n":"AGMK-STTB"}
        // APK sertifikatni faqat shu barmoq izi bo'yicha qabul qiladi (pinning). Tashqi internet kerak emas.
        // =====================================================================
        function srvParseQr(txt) {
            let j = null; try { j = JSON.parse(String(txt || '').replace(/[\r\n\t\u00a0\u200b]+/g, '').trim()); } catch (e) { return null; } // eslatmaga koʻchirilganda qator boʻlinib qolishi mumkin
            if (!j || !/^https:\/\/(10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|127\.)[\d.]+(:\d+)?\/?$/.test(j.u || '') || !j.k || String(j.k).length < 20 || !/^[0-9a-f]{64}$/i.test(String(j.f || '').replace(/:/g, ''))) return null;
            return { u: j.u.replace(/\/+$/, ''), k: String(j.k), f: String(j.f).replace(/:/g, '').toLowerCase(), n: j.n || 'AGMK-STTB' };
        }
        async function srvQrFromImage(file) {
            if (!('BarcodeDetector' in window)) throw new Error("Bu qurilmada QR oʻquvchi yoʻq — QR ostidagi matnni nusxalab «Matn bilan ulash»ni tanlang");
            const bm = await createImageBitmap(file), det = new BarcodeDetector({ formats: ['qr_code'] }), r = await det.detect(bm);
            if (!r.length) throw new Error('Rasmda QR kod topilmadi — yaqinroqdan, tekis qilib qayta rasmga oling');
            return r[0].rawValue;
        }
        async function srvConnect(q) {
            if (!q) { alert('⚠️ QR maʼlumoti notoʻgʻri yoki bu korxona serverining QR kodi emas (faqat ichki tarmoq manzillari qabul qilinadi).'); return; }
            if (!(await uiConfirm('📡 Korxona serveriga ulanish:\n' + q.u + '\nSertifikat: ' + q.f.slice(0, 16) + '…\n\nDavom etilsinmi?'))) return;
            let pinned = false; try { if (window.AgmkNative && AgmkNative.setPin) pinned = !!AgmkNative.setPin(q.f); } catch (e) {}
            syncPut(SYNC_CFG, { url: q.u, key: q.k, on: true, lan: true, fp: q.f, name: q.n }); SYNC.err = '';
            try { const r = await fetch(q.u + '/health', { cache: 'no-store' }); if (!r.ok) throw new Error('HTTP ' + r.status); }
            catch (e) { alert("⚠️ Serverga yetib boʻlmadi: " + agmkErrUz(e) + "\n\nTekshiring: telefon korxona Wi-Fi tarmogʻidami, server kompyuteri yoqilganmi." + (window.AgmkNative ? '' : "\n(Brauzerda: avval " + q.u + "/health manzilini ochib, xavfsizlik ogohlantirishini qabul qiling)")); if ($id("syncBox")) syncRender(); syncUi(); return; }
            const pw = await uiPrompt("🔐 Serverga kirish uchun oʻz parolingizni kiriting (tabel " + ((currentUser && currentUser.tabel) || '') + "):", '');
            if (pw === null) { if ($id("syncBox")) syncRender(); return; }
            try { await sbLogin(currentUser.tabel, pw); showToast('🟢 Korxona serveriga ulandi' + (pinned ? ' · sertifikat mahkamlandi' : '')); syncLoop(); syncNow(); } catch (e) { SYNC.err = agmkErrUz(e); alert('⚠️ ' + e.message); }
            if ($id('syncBox')) syncRender(); syncUi();
        }
        async function srvScan(input) { const f = (input.files || [])[0]; input.value = ''; if (!f) return; try { srvConnect(srvParseQr(await srvQrFromImage(f))); } catch (e) { alert('⚠️ ' + agmkErrUz(e)); } }
        async function srvText() { const t = await uiPrompt('QR ostidagi matnni (yoki server oynasidagi «Ulanish matni»ni) shu yerga qoʻying:', ''); if (!t) return; srvConnect(srvParseQr(t)); }
        (function () {
            if (typeof syncRender !== 'function') return;
            syncRender = agmkExtend('syncRender', 'syncRender', syncRender, o => function () {
                const r = o.apply(this, arguments);
                try { const b = $id('syncBox'); if (!b || b.querySelector('.srv-lan')) return r; const c = syncCfg();
                    const d = document.createElement('div'); d.className = 'srv-lan';
                    d.innerHTML = `<div class="pp-lbl">📡 KORXONA SERVERI (ichki tarmoq)</div>${c.lan ? `<div class="nd-tip">🔒 ${escapeHtml(c.url)} · sertifikat ${escapeHtml(String(c.fp || '').slice(0, 12))}…</div>` : ''}
                        <div class="pk-btns"><label class="srv-qr">📷 QR kodni skanerlash<input type="file" accept="image/*" capture="environment" onchange="srvScan(this)"></label><button onclick="srvText()">⌨️ Matn bilan ulash</button></div>
                        <div class="nd-tip">Server kompyuterida «ishga_tushirish.bat» ochilgach, ekrandagi QR kodni shu tugma bilan rasmga oling. Internet kerak emas — faqat korxona Wi-Fi.</div>`;
                    const h = b.querySelector('.pk-h'); if (h) h.after(d); else b.prepend(d); } catch (e) {}
                return r;
            });
        })();

