        function stSnapHtml(full, forPrint) {
            const cv = $id('stCv'); const org = cv && cv.querySelector('.st-org'); if (!org) return null;
            const cl = [].slice.call(cv.querySelectorAll('.st-chs.cl')), prev = cl.map(c => c.classList.contains('show'));
            if (full) cl.forEach(c => c.classList.add('show')); try { stDrawLinks(); } catch (e) {}
            const w = org.offsetWidth + 60, h = org.offsetHeight + 60, html = org.outerHTML;
            if (full) { cl.forEach((c, i) => c.classList.toggle('show', prev[i])); try { stDrawLinks(); } catch (e) {} }
            const css = [].slice.call(document.querySelectorAll('style')).map(s => s.textContent).filter(t => t.indexOf('.st-org') >= 0).join('\n');
            const pw = 1123 - 30, ph = 1587 - 30, z = forPrint ? Math.min(1, pw / w, ph / h) : 1;
            return { w: w, h: h, html: '<!DOCTYPE html><html lang="uz"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>AGMK STTB — tashkiliy tuzilma</title><style>' + css + '</style><style>html,body{margin:0;background:#fff}.st-cv{position:relative!important;transform:none!important;padding:30px;width:' + w + 'px}' + (full ? '.st-more{display:none!important}' : '') + (forPrint ? '@page{size:A3 portrait;margin:5mm}body{zoom:' + z.toFixed(4) + '}' : '') + '</style></head><body><div class="st-cv">' + html + '</div></body></html>' };
        }
        function stPdfMenu() {
            mdl('stMdl', `<div class="px-h"><b>📥 Sxemani yuklab olish</b><button class="mini-btn" onclick="mdlClose('stMdl')">✕</button></div>
                <div class="nd-tip">Ekrandagi holat: katta roʻyxatlar yigʻilgan. «Toʻliq» — hamma ismlar ochilgan. Oklad chiqmaydi.</div>
                <button class="action-btn" onclick="stPdf(false)">📄 PDF — ekrandagidek</button>
                <button class="action-btn sec" onclick="stPdf(true)">📄 PDF — toʻliq roʻyxat bilan</button>
                <button class="action-btn sec" onclick="stHtmlDl(false)">🌐 Elektron nusxa (HTML, kattalashtirib koʻriladi)</button>
                <div class="nd-tip">PDF: chop etish oynasida «PDF sifatida saqlash»ni tanlang. Sxema bitta A3 sahifaga sigʻdiriladi — PDF’ni kattalashtirsangiz yozuvlar xiralashmaydi.</div>`, true);
        }
        function stNoOk(fn) { const k = typeof stOkView === 'function' ? stOkView : null; try { if (k) stOkView = () => false; if (k) stRender(true); return fn(); } finally { if (k) { stOkView = k; stRender(true); } } }
        function stPdf(full) {
            mdlClose('stMdl'); const S = stNoOk(() => stSnapHtml(full, true)); if (!S) { showToast('Sxema topilmadi'); return; }
            try { if (window.AgmkNative && window.AgmkNative.print) { window.AgmkNative.print(S.html, 'AGMK STTB tuzilma'); return; } } catch (e) {}
            const w = window.open('', '_blank'); if (w && w.document) { w.document.write(S.html); w.document.close(); setTimeout(() => { try { w.print(); } catch (e) {} }, 600); } else stHtmlDl(full);
        }
        function stHtmlDl(full) {
            mdlClose('stMdl'); const S = stNoOk(() => stSnapHtml(full, false)); if (!S) return;
            docDownload([{ name: 'AGMK_STTB_tuzilma' + (full ? '_toliq' : '') + '.html', mime: 'text/html', blob: new Blob([S.html], { type: 'text/html' }) }]); showToast('🌐 Sxema fayli tayyorlandi');
        }
        if (typeof stMenu === 'function') stMenu = agmkExtend('stMenu', 'v3.15.1: sxemani yuklab olish', stMenu, o => function () {
            o.apply(this, arguments);
            try { const m = $id('stMdl'), b = m && m.querySelector('.action-btn'); if (b) { const n = document.createElement('button'); n.className = 'action-btn'; n.textContent = '📥 Sxemani yuklab olish (PDF / elektron)'; n.onclick = () => stPdfMenu(); b.parentNode.insertBefore(n, b); } } catch (e) {}
        });

