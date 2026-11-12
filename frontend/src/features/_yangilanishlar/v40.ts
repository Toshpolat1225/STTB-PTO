        // =====================================================================
        // v4.0 — Skaner: «toza hujjat» (docs/KAMCHILIKLAR.md K-52)
        //  Muallif talabi: skanerlangan qogʻozdan imzo va muhrlarsiz, kompyuterda noldan terilgandek Word va PDF.
        //  • Rangli siyoh (koʻk/binafsha/qizil imzo va muhr) rasmdan oʻchiriladi — OCR ga xalaqit bermaydi, hujjatga tushmaydi.
        //  • Jadval chiziqlari topiladi → haqiqiy jadval (birlashgan kataklar: colspan / rowspan, ustun kengligi asl nisbatda);
        //    chiziqlar OCR rasmidan oʻchiriladi («|», «п р» kabi shovqin yoʻq).
        //  • Ikki ustunli sarlavha («Kelishildi» chapda, «Tasdiqlayman» oʻngda) va imzolar roʻyxati — chegarasiz jadval;
        //    imzo chizigʻi «________» boʻlib qoladi. Rasm, muhr va qoʻl imzosi — umuman yoʻq.
        //  • Til avtomatik: aralash tilda oʻqilgach, matn kirillcha boʻlsa rus (yoki oʻzbek kirill), lotincha boʻlsa oʻzbek tilida qayta oʻqiladi.
        //  • Ishonchsiz soʻz — sariq; imzo qoldigʻi (past ishonch, siyoh ustida) — tashlab yuboriladi.
        //  • Eski usul (rasm, muhr va qoʻl imzolari joyida — 3.18.1) yoʻqolmadi: skaner sahifasida belgilab tanlanadi.
        //  • Word (.docx) — haqiqiy Word jadvali (gridSpan, vMerge), Times New Roman; PDF — matnli, chiziqlari bilan.
        // =====================================================================
        const SK: any = window as any;
        type SkSeg = { c: number; a: number; b: number; n: number };
        type SkWord = { s: string; c: number; x: number; y: number; w: number; h: number; bold?: boolean; u?: boolean };
        type SkLine = { b: number; p: number; x: number; y: number; w: number; h: number; words: SkWord[] };
        type SkCell = { r: number; c: number; rs: number; cs: number; hole: boolean; words: SkWord[] };
        type SkImg = { W: number; H: number; L: Uint8Array; ink: Uint8Array; hs: SkSeg[]; vs: SkSeg[]; ocr: HTMLCanvasElement; ang: number };
        type SkTab = { x1: number; y1: number; x2: number; y2: number; X: number[]; Y: number[]; cells: SkCell[]; unit: Int32Array };
        var SK_MIX = 'uzb+uzb_cyrl+rus+eng';

        // ---------- 1) Rasm: rangli siyohni olib tashlash, chiziqlarni topish ----------
        function skAnalyze(cv: HTMLCanvasElement): SkImg {
            const W = cv.width, H = cv.height, N = W * H, d = (cv.getContext('2d') as CanvasRenderingContext2D).getImageData(0, 0, W, H).data;
            const L = new Uint8Array(N), ink = new Uint8Array(N), B = new Uint8Array(N);
            for (let i = 0; i < N; i++) {
                const r = d[i * 4], g = d[i * 4 + 1], b = d[i * 4 + 2], mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (r * 299 + g * 587 + b * 114) / 1000;
                if (mx - mn > 38 && l > 28) { ink[i] = 1; L[i] = 255; } else L[i] = l;
                B[i] = L[i] < 165 ? 1 : 0;
            }
            const T = Math.max(4, Math.round(W / 330)), gapMax = T + 2, minH = Math.round(W * 0.022), minV = Math.round(W * 0.016);
            // «ingichka» qorongʻi piksel: chiziq boʻylab davom etadi, koʻndalangiga T piksel narida oq
            const runs = (horiz: boolean): Uint8Array => {
                const M = new Uint8Array(N), len = horiz ? W : H, cnt = horiz ? H : W, minL = horiz ? minH : minV, st = horiz ? W : 1, step = horiz ? 1 : W;
                for (let k = T; k < cnt - T; k++) {
                    const base = horiz ? k * W : k; let s = -1, last = -1;
                    const flush = (): void => { if (s >= 0 && last - s + 1 >= minL) for (let j = s; j <= last; j++) { const p = base + j * step; if (B[p]) M[p] = 1; } s = -1; };
                    for (let j = 0; j < len; j++) {
                        const p = base + j * step, on = B[p] && (!B[p - T * st] || !B[p + T * st]);
                        if (on) { if (s < 0) s = j; last = j; } else if (s >= 0 && j - last > gapMax) flush();
                    }
                    flush();
                }
                return M;
            };
            const angs: { a: number; w: number }[] = [];
            const segs = (M: Uint8Array, horiz: boolean): { S: SkSeg[]; K: Uint8Array } => {
                const lab = new Int32Array(N), stk = new Int32Array(N), S: SkSeg[] = [], K = new Uint8Array(N), keep: number[] = []; let id = 0;
                const minL = horiz ? minH : minV;
                for (let i = 0; i < N; i++) {
                    if (!M[i] || lab[i]) continue; id++; let sp = 0, x1 = W, x2 = 0, y1 = H, y2 = 0, sc = 0, n = 0, sa = 0, saa = 0, sab = 0; stk[sp++] = i; lab[i] = id;
                    while (sp) {
                        const p = stk[--sp], x = p % W, y = (p / W) | 0, al = horiz ? x : y; n++; sc += horiz ? y : x; sa += al; saa += al * al; sab += al * (horiz ? y : x);
                        if (x < x1) x1 = x; if (x > x2) x2 = x; if (y < y1) y1 = y; if (y > y2) y2 = y;
                        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const xx = x + dx, yy = y + dy; if (xx < 0 || yy < 0 || xx >= W || yy >= H) continue; const q = yy * W + xx; if (M[q] && !lab[q]) { lab[q] = id; stk[sp++] = q; } }
                    }
                    const along = horiz ? x2 - x1 + 1 : y2 - y1 + 1, across = horiz ? y2 - y1 + 1 : x2 - x1 + 1;
                    if (horiz && along > W * 0.2) { const den = n * saa - sa * sa; if (den > 0) angs.push({ a: (n * sab - sa * sc) / den, w: along }); }
                    if (along >= minL && across <= along * 0.03 + 12) { S.push(horiz ? { c: sc / n, a: x1, b: x2, n: n } : { c: sc / n, a: y1, b: y2, n: n }); keep[id] = 1; }
                }
                for (let i = 0; i < N; i++) if (lab[i] && keep[lab[i]]) K[i] = 1;
                // bir chiziqda yotgan boʻlaklar (kesishmada uzilgan) — bitta
                S.sort((p, q) => p.c - q.c || p.a - q.a); const out: SkSeg[] = [];
                S.forEach(s => { const m = out.find(o => Math.abs(o.c - s.c) <= 5 && s.a - o.b <= gapMax * 2 + 6 && o.a - s.b <= gapMax * 2 + 6); if (m) { m.c = (m.c * (m.b - m.a) + s.c * (s.b - s.a)) / Math.max(1, m.b - m.a + s.b - s.a); m.a = Math.min(m.a, s.a); m.b = Math.max(m.b, s.b); m.n += s.n; } else out.push({ c: s.c, a: s.a, b: s.b, n: s.n }); });
                return { S: out, K: K };
            };
            const h = segs(runs(true), true), v = segs(runs(false), false);
            // OCR uchun rasm: chiziqlar (2 piksel atrofi bilan) oʻchiriladi
            const R = 2, O = new Uint8Array(L);
            for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const i = y * W + x; if (!h.K[i] && !v.K[i]) continue; for (let dy = -R; dy <= R; dy++) for (let dx = -R; dx <= R; dx++) { const xx = x + dx, yy = y + dy; if (xx >= 0 && yy >= 0 && xx < W && yy < H) O[yy * W + xx] = 255; } }
            const oc = document.createElement('canvas'); oc.width = W; oc.height = H; const og = oc.getContext('2d') as CanvasRenderingContext2D, od = og.createImageData(W, H);
            for (let i = 0; i < N; i++) { const q = i * 4; od.data[q] = od.data[q + 1] = od.data[q + 2] = O[i]; od.data[q + 3] = 255; }
            og.putImageData(od, 0, 0);
            angs.sort((p, q) => p.a - q.a); let tw2 = angs.reduce((p, q) => p + q.w, 0) / 2, ang = 0; for (const z of angs) { tw2 -= z.w; if (tw2 <= 0) { ang = Math.atan(z.a); break; } }
            return { W: W, H: H, L: O, ink: ink, hs: h.S, vs: v.S, ocr: oc, ang: ang };
        }

        // qiyshiqlikni toʻgʻrilash: uzun gorizontal chiziqlar boʻyicha topilgan burchakka buriladi
        function skRotate(cv: HTMLCanvasElement, a: number): HTMLCanvasElement {
            const c = document.createElement('canvas'); c.width = cv.width; c.height = cv.height; const g = c.getContext('2d') as CanvasRenderingContext2D;
            g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); g.translate(c.width / 2, c.height / 2); g.rotate(a); g.drawImage(cv, -cv.width / 2, -cv.height / 2); return c;
        }
        // ---------- 2) Jadvallar: kesishgan chiziqlar → katakchalar ----------
        function skCluster(vals: number[], tol: number): number[] {
            const a = vals.slice().sort((p, q) => p - q), out: number[][] = [];
            a.forEach(v => { const g = out[out.length - 1]; if (g && v - g[g.length - 1] <= tol) g.push(v); else out.push([v]); });
            return out.map(g => g.reduce((s, v) => s + v, 0) / g.length);
        }
        function skTables(I: SkImg): SkTab[] {
            const hs = I.hs, vs = I.vs, n = hs.length + vs.length, par = Array.from({ length: n }, (_, i) => i), tol = Math.max(8, I.W * 0.006);
            const f = (i: number): number => { while (par[i] !== i) { par[i] = par[par[i]]; i = par[i]; } return i; };
            hs.forEach((h, i) => vs.forEach((v, j) => { if (v.c >= h.a - tol && v.c <= h.b + tol && h.c >= v.a - tol && h.c <= v.b + tol) par[f(i)] = f(hs.length + j); }));
            const G: Record<number, { h: SkSeg[]; v: SkSeg[] }> = {};
            hs.forEach((h, i) => { const k = f(i); (G[k] = G[k] || { h: [], v: [] }).h.push(h); });
            vs.forEach((v, j) => { const k = f(hs.length + j); (G[k] = G[k] || { h: [], v: [] }).v.push(v); });
            const out: SkTab[] = [];
            Object.keys(G).forEach(k => {
                const g = G[+k]; if (g.h.length < 2 || g.v.length < 2) return;
                let X = skCluster(g.v.map(v => v.c), tol), Y = skCluster(g.h.map(h => h.c), tol); if (X.length < 2 || Y.length < 2) return;
                const covH = (y: number, x1: number, x2: number): number => { let s = 0; g.h.forEach(h => { if (Math.abs(h.c - y) <= tol) s += Math.max(0, Math.min(h.b, x2) - Math.max(h.a, x1)); }); return s / Math.max(1, x2 - x1); };
                const covV = (x: number, y1: number, y2: number): number => { let s = 0; g.v.forEach(v => { if (Math.abs(v.c - x) <= tol) s += Math.max(0, Math.min(v.b, y2) - Math.max(v.a, y1)); }); return s / Math.max(1, y2 - y1); };
                const build = (): SkTab | null => {
                    const nR = Y.length - 1, nC = X.length - 1, U = nR * nC, P = Array.from({ length: U }, (_, i) => i);
                    const fu = (i: number): number => { while (P[i] !== i) { P[i] = P[P[i]]; i = P[i]; } return i; };
                    const vB = (r: number, j: number): boolean => covV(X[j], Y[r], Y[r + 1]) >= 0.5, hB = (i: number, c: number): boolean => covH(Y[i], X[c], X[c + 1]) >= 0.5;
                    for (let r = 0; r < nR; r++) for (let c = 0; c < nC; c++) { if (c < nC - 1 && !vB(r, c + 1)) P[fu(r * nC + c)] = fu(r * nC + c + 1); if (r < nR - 1 && !hB(r + 1, c)) P[fu(r * nC + c)] = fu((r + 1) * nC + c); }
                    const outside = new Set<number>();
                    for (let r = 0; r < nR; r++) for (let c = 0; c < nC; c++) { if ((c === 0 && !vB(r, 0)) || (c === nC - 1 && !vB(r, nC)) || (r === 0 && !hB(0, c)) || (r === nR - 1 && !hB(nR, c))) outside.add(fu(r * nC + c)); }
                    // chetdagi butunlay «tashqi» qator/ustunlar kesib tashlanadi (masalan jadval ustidagi sarlavha chizigʻi)
                    const rowOut = (r: number): boolean => { for (let c = 0; c < nC; c++) if (!outside.has(fu(r * nC + c))) return false; return true; };
                    const colOut = (c: number): boolean => { for (let r = 0; r < nR; r++) if (!outside.has(fu(r * nC + c))) return false; return true; };
                    if (nR > 1 && rowOut(0)) { Y = Y.slice(1); return null; } if (nR > 1 && rowOut(nR - 1)) { Y = Y.slice(0, -1); return null; }
                    if (nC > 1 && colOut(0)) { X = X.slice(1); return null; } if (nC > 1 && colOut(nC - 1)) { X = X.slice(0, -1); return null; }
                    const unit = new Int32Array(U).fill(-1), cells: SkCell[] = [];
                    for (let r = 0; r < nR; r++) for (let c = 0; c < nC; c++) {
                        const u = r * nC + c; if (unit[u] >= 0) continue; const k2 = fu(u), hole = outside.has(k2);
                        let r2 = r, c2 = c;
                        if (!hole) { for (let rr = r; rr < nR; rr++) for (let cc = c; cc < nC; cc++) if (fu(rr * nC + cc) === k2) { r2 = Math.max(r2, rr); c2 = Math.max(c2, cc); } }
                        let ok = true; for (let rr = r; rr <= r2 && ok; rr++) for (let cc = c; cc <= c2; cc++) { const q = rr * nC + cc; if (unit[q] >= 0 || fu(q) !== k2) { ok = false; break; } }
                        if (!ok || hole) { r2 = r; c2 = c; while (c2 + 1 < nC && unit[r * nC + c2 + 1] < 0 && fu(r * nC + c2 + 1) === k2) c2++; }
                        for (let rr = r; rr <= r2; rr++) for (let cc = c; cc <= c2; cc++) unit[rr * nC + cc] = cells.length;
                        cells.push({ r: r, c: c, rs: r2 - r + 1, cs: c2 - c + 1, hole: hole, words: [] });
                    }
                    if (cells.filter(z => !z.hole).length < 2) return null;
                    return { x1: X[0], y1: Y[0], x2: X[nC], y2: Y[nR], X: X, Y: Y, cells: cells, unit: unit };
                };
                for (let it = 0; it < 12; it++) { if (X.length < 2 || Y.length < 2) return; const t = build(); if (t) { out.push(t); return; } }
            });
            return out.sort((a, b) => a.y1 - b.y1);
        }

        // ---------- 3) Soʻzlar: imzo qoldigʻi, qalin harf ----------
        function skInkFrac(I: SkImg, w: SkWord): number { let n = 0, k = 0; for (let y = Math.max(0, w.y); y < Math.min(I.H, w.y + w.h); y += 2) for (let x = Math.max(0, w.x); x < Math.min(I.W, w.x + w.w); x += 2) { n++; k += I.ink[y * I.W + x]; } return n ? k / n : 0; }
        function skDark(I: SkImg, w: SkWord): number { let n = 0, k = 0; for (let y = Math.max(0, w.y); y < Math.min(I.H, w.y + w.h); y++) for (let x = Math.max(0, w.x); x < Math.min(I.W, w.x + w.w); x++) { n++; if (I.L[y * I.W + x] < 140) k++; } return n ? k / n : 0; }
        // shtrix qalinligi (harf chizigʻining oʻrtacha eni) / soʻz balandligi — qalin harfni ajratadi
        function skStroke(I: SkImg, w: SkWord): number {
            let runs = 0, px = 0; for (let y = Math.max(0, w.y + Math.round(w.h * 0.2)); y < Math.min(I.H, w.y + Math.round(w.h * 0.8)); y++) { let r = 0; for (let x = Math.max(0, w.x); x <= Math.min(I.W - 1, w.x + w.w); x++) { const dk = I.L[y * I.W + x] < 140; if (dk) { r++; px++; } else if (r) { runs++; r = 0; } } if (r) runs++; }
            return runs ? px / runs / Math.max(1, w.h) : 0;
        }
        function skJunk(I: SkImg, w: SkWord): boolean {
            const s = String(w.s || '').trim(); if (!s) return true;
            const al = (s.match(/[\p{L}\p{N}]/gu) || []).length;
            if (/^[|¦!lI\[\]{}]+$/.test(s)) return true; // chiziq qoldigʻi
            if (!al && !/^[_\-–—.,:;"«»“”'()№%/]+$/.test(s)) return true;
            if (w.c < 25) return true;
            if (w.c < 55 && (skInkFrac(I, w) > 0.05 || (al < 2 && w.c < 40))) return true; // qoʻl imzosi / muhr ustidagi «soʻz»
            return false;
        }

        // ---------- 4) Sahifa → HTML ----------
        function skE(s: string): string { return SK.escapeHtml ? SK.escapeHtml(s) : String(s).replace(/[&<>"]/g, (c: string) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' } as any)[c]); }
        function skWordHtml(w: SkWord): string { const t = skE(w.s); const m = !w.u && w.c < 70 ? `<mark class="up-lc">${t}</mark>` : t; return w.bold ? `<b>${m}</b>` : m; }
        function skLinesOf(ws: SkWord[]): SkWord[][] {
            const a = ws.slice().sort((p, q) => (p.y + p.h / 2) - (q.y + q.h / 2)), L: SkWord[][] = [];
            a.forEach(w => { const cy = w.y + w.h / 2, l = L.find(z => { const y1 = Math.min(...z.map(q => q.y)), y2 = Math.max(...z.map(q => q.y + q.h)); return cy > y1 && cy < y2; }); if (l) l.push(w); else L.push([w]); });
            return L.map(l => l.sort((p, q) => p.x - q.x)).sort((p, q) => p[0].y - q[0].y);
        }
        function skAlign(ws: SkWord[], x1: number, x2: number): string {
            if (!ws.length) return ''; const a = Math.min(...ws.map(w => w.x)), b = Math.max(...ws.map(w => w.x + w.w)), lg = a - x1, rg = x2 - b, cw = x2 - x1;
            if (Math.abs(lg - rg) < cw * 0.12 && lg > cw * 0.06) return 'center'; if (rg < lg * 0.45) return 'right'; return '';
        }
        function skTableHtml(t: SkTab, left: number, tw: number): string {
            const nC = t.X.length - 1, nR = t.Y.length - 1, pw = t.x2 - t.x1;
            const cw = t.X.slice(1).map((x, i) => ((x - t.X[i]) / pw).toFixed(4)).join(','), rh = t.Y.slice(1).map((y, i) => Math.round(y - t.Y[i])).join(',');
            let h = `<table class="sk-t" data-gx="${Math.max(0, (t.x1 - left) / tw).toFixed(4)}" data-gw="${Math.min(1, pw / tw).toFixed(4)}" data-cw="${cw}" data-rh="${rh}" data-tp="${Math.round(pw)}">`;
            for (let r = 0; r < nR; r++) {
                h += '<tr>';
                t.cells.filter(c => c.r === r).sort((a, b) => a.c - b.c).forEach(c => {
                    const x1 = t.X[c.c], x2 = t.X[c.c + c.cs], L = skLinesOf(c.words), al = skAlign(c.words, x1, x2);
                    const body = L.map(l => l.map(skWordHtml).join(' ')).join(' ');
                    h += `<td${c.cs > 1 ? ` colspan="${c.cs}"` : ''}${c.rs > 1 ? ` rowspan="${c.rs}"` : ''}${c.hole ? ' class="sk-h"' : ''}${L.length === 1 ? ' data-l="1"' : ''}${al ? ` style="text-align:${al}"` : ''}>${body}</td>`;
                });
                h += '</tr>';
            }
            void nC; return h + '</table>';
        }
        // bir nechta boʻlakli qatorlar: chegarasiz jadval (imzolar roʻyxati) yoki ikki ustunli sarlavha
        function skSegsOf(l: SkLine, gap: number): SkWord[][] { const W = l.words.slice().sort((a, b) => a.x - b.x), seg: SkWord[][] = [[W[0]]]; for (let i = 1; i < W.length; i++) { const p = W[i - 1]; if (W[i].x - (p.x + p.w) > gap) seg.push([W[i]]); else seg[seg.length - 1].push(W[i]); } return seg; }
        function skNbHtml(rows: SkWord[][][], left: number, right: number, ys: number[], hNext: number): string {
            const tw = Math.max(1, right - left), mid = (left + right) / 2, all = rows.reduce((a, r) => a.concat(r), [] as SkWord[][]);
            const sx = (s: SkWord[]): number => s[0].x, ex = (s: SkWord[]): number => { const w = s[s.length - 1]; return w.x + w.w; };
            const two = rows.every(r => r.length <= 2 && r.every(s => (sx(s) < mid && ex(s) < mid + tw * 0.08) || (sx(s) > mid - tw * 0.08 && ex(s) > right - tw * 0.12))) && rows.some(r => r.length === 2);
            const txt = (s: SkWord[]): string => s.map(skWordHtml).join(' ');
            if (two) { // ustunma-ustun: chap blok va oʻng blok (qatorlari mustaqil)
                const Lc: string[] = [], Rc: string[] = [], Re: number[] = [], Rs: number[] = [];
                rows.forEach(r => r.forEach(s => { if (sx(s) < mid && ex(s) < mid + tw * 0.08) Lc.push(txt(s)); else { Rc.push(txt(s)); Re.push(ex(s)); Rs.push(sx(s)); } }));
                const sd = (a: number[]): number => { if (a.length < 2) return 0; const m = a.reduce((p, q) => p + q, 0) / a.length; return Math.sqrt(a.reduce((p, q) => p + (q - m) * (q - m), 0) / a.length); };
                const rAl = sd(Re) < sd(Rs) ? 'right' : 'left', rx = Math.min(...Rs), gx = Math.max(0.5, (rx - left) / tw);
                const H = Math.round(ys[ys.length - 1] - ys[0] + hNext);
                return `<table class="sk-t sk-nb" data-gx="0" data-gw="1" data-cw="${gx.toFixed(4)},${(1 - gx).toFixed(4)}" data-rh="${H}" data-tp="${Math.round(tw)}"><tr><td data-l="1">${Lc.join('<br>')}</td><td data-l="1"${rAl === 'right' ? ' style="text-align:right"' : ''}>${Rc.join('<br>')}</td></tr></table>`;
            }
            // qatorma-qator: ustunlar boʻlak boshlanishi boʻyicha
            const X = skCluster(all.map(sx), tw * 0.08).sort((a, b) => a - b), nC = X.length;
            const colOf = (s: SkWord[]): number => { let b = 0; X.forEach((x, i) => { if (Math.abs(x - sx(s)) < Math.abs(X[b] - sx(s))) b = i; }); return b; };
            const bnd = [left].concat(X.slice(1).map(x => x - tw * 0.01)).concat([right]).map((x, i) => i === 0 ? Math.min(left, X[0]) : x);
            const cw = bnd.slice(1).map((x, i) => Math.max(0.02, (x - bnd[i]) / tw)), cs = cw.reduce((a, b) => a + b, 0);
            const al: string[] = X.map((_, i) => { const S = all.filter(s => colOf(s) === i); return S.length && S.every(s => ex(s) > right - tw * 0.06) && sx(S[0]) > mid ? 'right' : ''; });
            const rh = ys.map((y, i) => Math.round((i + 1 < ys.length ? ys[i + 1] : y + hNext) - y));
            let h = `<table class="sk-t sk-nb" data-gx="0" data-gw="1" data-cw="${cw.map(x => (x / cs).toFixed(4)).join(',')}" data-rh="${rh.join(',')}" data-tp="${Math.round(tw)}">`;
            rows.forEach(r => { const C: string[] = Array(nC).fill(''); r.forEach(s => { const i = colOf(s); C[i] = (C[i] ? C[i] + ' ' : '') + txt(s); }); h += '<tr>' + C.map((c, i) => `<td data-l="1"${al[i] ? ` style="text-align:${al[i]}"` : ''}>${c}</td>`).join('') + '</tr>'; });
            return h + '</table>';
        }
        function skPageHtml(p: any, I: SkImg): string {
            const k = p.w && p.w !== I.W ? I.W / p.w : 1, lines0: SkLine[] = (p.lines || []).map((l: any) => ({ b: l.b, p: l.p, x: l.x * k, y: l.y * k, w: l.w * k, h: l.h * k, words: (l.words || []).map((w: any) => ({ s: w.s, c: w.c, x: Math.round(w.x * k), y: Math.round(w.y * k), w: Math.round(w.w * k), h: Math.round(w.h * k) })) }));
            const words: SkWord[] = []; const dbg = SK.SKDBG_ON ? (SK.SKDBG = { all: [] as any[], hs: I.hs, vs: I.vs, W: I.W, H: I.H }) : null; lines0.forEach(l => l.words.forEach(w => { const j = skJunk(I, w); if (dbg) dbg.all.push(Object.assign({ j: j, ink: +skInkFrac(I, w).toFixed(3), dk: +skDark(I, w).toFixed(3), sw: +skStroke(I, w).toFixed(3) }, w)); if (!j) words.push(w); }));
            if (!words.length) return '';
            // (qalin harf rasmdan ishonchli ajralmaydi — telefon surati past aniqlikda; sarlavha qalin boʻladi)
            const hs = words.map(w => w.h).sort((a, b) => a - b), lh = hs[hs.length >> 1] || 24;
            const T = skTables(I), inT = (w: SkWord): SkTab | undefined => { const cx = w.x + w.w / 2, cy = w.y + w.h / 2; return T.find(t => cx > t.x1 && cx < t.x2 && cy > t.y1 && cy < t.y2); };
            const flow: SkWord[] = [];
            words.forEach(w => {
                const t = inT(w); if (!t) { flow.push(w); return; }
                const cx = w.x + w.w / 2, cy = w.y + w.h / 2, nC = t.X.length - 1; let r = 0, c = 0;
                while (r < t.Y.length - 2 && cy > t.Y[r + 1]) r++; while (c < nC - 1 && cx > t.X[c + 1]) c++;
                const cell = t.cells[t.unit[r * nC + c]]; if (!cell || cell.hole) flow.push(w); else cell.words.push(w);
            });
            // jadvaldan tashqaridagi chiziqlar — imzo / sana uchun «________»
            const inAnyT = (s: SkSeg): boolean => T.some(t => s.c > t.y1 - 6 && s.c < t.y2 + 6 && s.b > t.x1 && s.a < t.x2);
            const U: SkSeg[] = []; I.hs.filter(s => !inAnyT(s) && s.b - s.a < I.W * 0.6 && s.c > I.H * 0.03 && s.c < I.H * 0.97).sort((a, b) => a.c - b.c || a.a - b.a).forEach(s => { const m = U.find(u => Math.abs(u.c - s.c) < 6 && s.a - u.b < lh * 3 && u.a - s.b < lh * 3); if (m) { m.a = Math.min(m.a, s.a); m.b = Math.max(m.b, s.b); } else U.push({ c: s.c, a: s.a, b: s.b, n: s.n }); });
            U.forEach(s => { const n = Math.max(4, Math.round((s.b - s.a) / (I.W * 0.0109))); flow.push({ s: '_'.repeat(n), c: 99, x: s.a, y: Math.round(s.c - lh), w: s.b - s.a, h: lh, u: true }); });
            // qatorlar (bir xil balandlikdagi soʻzlar — bitta qator)
            const L: SkLine[] = skLinesOf(flow).map(ws => { const x = Math.min(...ws.map(w => w.x)), y = Math.min(...ws.map(w => w.y)), x2 = Math.max(...ws.map(w => w.x + w.w)), y2 = Math.max(...ws.map(w => w.y + w.h)); return { b: 0, p: 0, x: x, y: y, w: x2 - x, h: y2 - y, words: ws }; });
            const xs = L.filter(l => !l.words.every(w => w.u)).map(l => l.x).sort((a, b) => a - b), xe = L.map(l => l.x + l.w).sort((a, b) => a - b);
            let left = xs.length ? xs[Math.floor(xs.length * 0.1)] : 0, right = xe.length ? xe[Math.floor(xe.length * 0.92)] : I.W;
            T.forEach(t => { left = Math.min(left, t.x1); right = Math.max(right, t.x2); }); const tw = Math.max(1, right - left), gap = Math.max(tw * 0.06, lh * 3);
            // tartib: yuqoridan pastga — qatorlar va jadvallar
            type SkIt = { y: number; t?: SkTab; l?: SkLine }; const items: SkIt[] = (L.map(l => ({ y: l.y, l: l })) as SkIt[]).concat(T.map(t => ({ y: t.y1, t: t }))).sort((a, b) => a.y - b.y);
            const out: string[] = []; let para: SkLine[] = [], multi: { segs: SkWord[][]; y: number }[] = [];
            const S = { h: lh, left: left, right: right };
            const fP = (): void => { if (para.length) { out.push(SK.upOcrHtml({ lines: para.map(l => Object.assign({}, l, { b: 1, p: 1 })) }, true, S)); para = []; } };
            const fM = (next: number): void => { if (multi.length) { out.push(skNbHtml(multi.map(m => m.segs), left, right, multi.map(m => m.y), Math.min(lh * 2.2, Math.max(lh * 1.4, next - multi[multi.length - 1].y)))); multi = []; } };
            // har qator turi: M — bir necha boʻlak, R — faqat oʻngda, L — chapda qisqa, O — boshqa
            const mid = (left + right) / 2, kind = (l: SkLine): string => { if (skSegsOf(l, gap).length > 1) return 'M'; if (l.x > mid - tw * 0.08 && l.x + l.w > right - tw * 0.12) return 'R'; if (l.x < left + tw * 0.1 && l.x + l.w < mid + tw * 0.08) return 'L'; return 'O'; };
            const K = items.map(it => it.l ? kind(it.l) : 'T'), inM = K.map(() => false);
            for (let i = 0; i < K.length;) { if (!/[LRM]/.test(K[i])) { i++; continue; } let j = i; while (j + 1 < K.length && /[LRM]/.test(K[j + 1]) && ((items[j + 1].l as SkLine).y - (items[j].l as SkLine).y) < lh * 4.2) j++; const run = K.slice(i, j + 1); if (run.some(k => k === 'M' || k === 'R') && run.length > 1) for (let q = i; q <= j; q++) inM[q] = true; i = j + 1; }
            items.forEach((it, i) => {
                if (it.t) { fP(); fM(it.y); out.push(skTableHtml(it.t, left, tw)); return; }
                const l = it.l as SkLine;
                if (inM[i]) { fP(); multi.push({ segs: skSegsOf(l, gap), y: l.y }); return; }
                fM(l.y);
                const cx = l.x + l.w / 2, lg = l.x - left, rg = right - (l.x + l.w);
                if (Math.abs(cx - (left + right) / 2) < tw * 0.04 && lg > tw * 0.04 && rg > tw * 0.04 && l.w > tw * 0.5) { fP(); out.push(`<p style="text-align:center">${l.words.map(skWordHtml).join(' ')}</p>`); return; }
                para.push(l);
            });
            fP(); fM(I.H);
            // upOcrHtml qalin harfni bilmaydi: butunlay qalin qator — <b>
            return out.join('');
        }
        // boʻsh qolgan kataklar (Tesseract alohida turgan «1», «шт», «Кол-во» ni oʻtkazib yuboradi): bitta yigʻma rasmda qayta oʻqiladi
        async function skFill(p: any, I: SkImg, lang: string, ocr: (c: HTMLCanvasElement, l: string, psm: string) => Promise<any>): Promise<void> {
            const k = p.w && p.w !== I.W ? I.W / p.w : 1, T = skTables(I); if (!T.length) return;
            const has = (x1: number, y1: number, x2: number, y2: number): boolean => (p.lines || []).some((l: any) => (l.words || []).some((w: any) => { const cx = (w.x + w.w / 2) * k, cy = (w.y + w.h / 2) * k; return cx > x1 && cx < x2 && cy > y1 && cy < y2 && !skJunk(I, { s: w.s, c: w.c, x: Math.round(w.x * k), y: Math.round(w.y * k), w: Math.round(w.w * k), h: Math.round(w.h * k) }); }));
            const C: { x: number; y: number; w: number; h: number; oy: number }[] = []; let H = 20, Wm = 0;
            T.forEach(t => t.cells.forEach(c => {
                if (c.hole) return; const x1 = Math.round(t.X[c.c]) + 5, x2 = Math.round(t.X[c.c + c.cs]) - 5, y1 = Math.round(t.Y[c.r]) + 4, y2 = Math.round(t.Y[c.r + c.rs]) - 4; if (x2 - x1 < 8 || y2 - y1 < 8 || has(x1, y1, x2, y2)) return;
                let dk = 0; for (let y = y1; y < y2; y++) for (let x = x1; x < x2; x++) if (I.L[y * I.W + x] < 140) dk++; if (dk < 12) return;
                C.push({ x: x1, y: y1, w: x2 - x1, h: y2 - y1, oy: H }); H += y2 - y1 + 40; Wm = Math.max(Wm, x2 - x1);
            }));
            if (!C.length) return;
            const cv = document.createElement('canvas'); cv.width = Wm + 60; cv.height = H + 20; const g = cv.getContext('2d') as CanvasRenderingContext2D; g.fillStyle = '#fff'; g.fillRect(0, 0, cv.width, cv.height);
            C.forEach(c => g.drawImage(I.ocr, c.x, c.y, c.w, c.h, 30, c.oy, c.w, c.h));
            const r = await ocr(cv, lang, '6'), add: any[] = [];
            (r.lines || []).forEach((l: any) => (l.words || []).forEach((w: any) => { const cy = w.y + w.h / 2, c = C.find(z => cy >= z.oy - 6 && cy <= z.oy + z.h + 6); if (!c) return; add.push({ s: w.s, c: w.c, x: Math.round((w.x - 30 + c.x) / k), y: Math.round((w.y - c.oy + c.y) / k), w: Math.round(w.w / k), h: Math.round(w.h / k) }); }));
            add.forEach(w => p.lines.push({ b: 900, p: 1, x: w.x, y: w.y, w: w.w, h: w.h, words: [w] }));
        }
        function skLangOf(R: any[]): string {
            let cy = 0, la = 0, uz = 0; R.forEach(p => (p.lines || []).forEach((l: any) => (l.words || []).forEach((w: any) => { if (w.c < 50) return; const s = String(w.s); cy += (s.match(/[А-Яа-яЁёЎўҚқҒғҲҳ]/g) || []).length; la += (s.match(/[A-Za-z]/g) || []).length; uz += (s.match(/[ЎўҚқҒғҲҳ]/g) || []).length; })));
            const n = cy + la; if (n < 30) return '';
            if (cy / n >= 0.7) return uz >= 3 ? 'uzb_cyrl+rus' : 'rus';
            if (la / n >= 0.7) return 'uzb+eng';
            return '';
        }

        // ---------- 5) Skaner oqimi (yangi): rangli toʻgʻrilash → tahlil → OCR → hujjat ----------
        async function skScanGo(): Promise<boolean> {
            const UP = SK.UP;
            try { await SK.upScanProc(); } catch (e) { alert('⚠️ Skanerlashda xato: ' + SK.agmkErrUz(e)); SK.upScanRender(); return true; }
            const why = await SK.upOcrOk(); if (why) return false; // OCR yoʻq — eski yoʻl (rasmli fayl taklifi)
            const P: { I: SkImg; r: any }[] = [], lang0 = UP.lang || SK_MIX;
            const ocrC = async (c: HTMLCanvasElement, l: string, psm: string): Promise<any> => {
                const blob: Blob = await new Promise(res => c.toBlob(b => res(b as Blob), 'image/jpeg', 0.92));
                const r = await SK.srvRaw('/api/ocr/v1?l=' + encodeURIComponent(l) + (psm ? '&psm=' + psm : ''), { method: 'POST', body: blob, headers: { 'Content-Type': 'image/jpeg' } }); return r.json();
            };
            const ocr = (I: SkImg, l: string): Promise<any> => ocrC(I.ocr, l, '');
            try {
                for (let i = 0; i < UP.scans.length; i++) {
                    SK.upBusy('🧹 ' + (i + 1) + ' / ' + UP.scans.length + ' — imzo, muhr va jadval chiziqlari ajratilmoqda…'); await new Promise(z => setTimeout(z, 30));
                    const s = UP.scans[i]; let cv: HTMLCanvasElement = SK.upWarp(Object.assign({}, s, { mode: 'color' })), I = skAnalyze(cv);
                    if (Math.abs(I.ang) > 0.0015 && Math.abs(I.ang) < 0.12) { cv = skRotate(cv, -I.ang); I = skAnalyze(cv); }
                    SK.upBusy('🔤 Matn oʻqilmoqda: ' + (i + 1) + ' / ' + UP.scans.length + ' (har bir sahifa 10–40 soniya)…');
                    P.push({ I: I, r: await ocr(I, lang0) });
                }
                let lng = lang0;
                if (lang0 === SK_MIX) { const l2 = skLangOf(P.map(x => x.r)); if (l2) { lng = l2; for (let i = 0; i < P.length; i++) { SK.upBusy('🔤 Til aniqlandi (' + l2 + ') — aniqroq oʻqilmoqda: ' + (i + 1) + ' / ' + P.length + '…'); P[i].r = await ocr(P[i].I, l2); } } }
                for (let i = 0; i < P.length; i++) { SK.upBusy('🔎 Jadval kataklari tekshirilmoqda: ' + (i + 1) + ' / ' + P.length + '…'); try { await skFill(P[i].r, P[i].I, lng, ocrC); } catch (e) { console.warn(e); } }
            } catch (e) { alert('⚠️ Matnni oʻqib boʻlmadi: ' + SK.agmkErrUz(e)); SK.upScanRender(); return true; }
            UP.ocr = P.map(x => x.r); UP.scInfo = null;
            UP.ocrHtml = P.map(x => skPageHtml(x.r, x.I)).join('<p class="ni up-pb">&nbsp;</p>');
            const t = /<p class="a-title">([^<]{3,120})<\/p>/.exec(UP.ocrHtml.replace(/<\/?(mark|b)[^>]*>/g, '')); if (t && /^Skaner hujjat/.test(UP.title)) UP.title = t[1].replace(/&[a-z]+;/g, ' ').trim();
            UP.st = 'ocr'; SK.upRender(); return true;
        }
        if (typeof SK.upScanGo === 'function') SK.upScanGo = SK.agmkExtend('upScanGo', 'v4.0: toza hujjat — imzosiz, haqiqiy jadvallar (K-52)', SK.upScanGo, (o: Function) => async function (this: unknown) {
            const UP = SK.UP; if (UP.skOld || !UP.scans || !UP.scans.length) return o.apply(this, arguments);
            if (await skScanGo()) return; return o.apply(this, arguments);
        });
        if (typeof SK.upScanRender === 'function') SK.upScanRender = SK.agmkExtend('upScanRender', 'v4.0: eski usul tanlovi', SK.upScanRender, (o: Function) => function (this: unknown) {
            const r = o.apply(this, arguments);
            try { const sel = document.querySelector('#screen-hisob select'), box = sel && sel.closest('.hs-box'); if (box && !box.querySelector('.sk-old')) box.insertAdjacentHTML('beforeend', `<div class="nd-tip sk-tip">🧹 Natija — <b>toza hujjat</b>: imzo va muhrlar olib tashlanadi, jadvallar haqiqiy jadval boʻlib qayta teriladi, imzo oʻrnida «________».</div><label class="sk-old"><input type="checkbox"${SK.UP.skOld ? ' checked' : ''} onchange="UP.skOld=this.checked"> 🖼 Rasm, muhr va qoʻl imzolarini joyida saqlash (eski usul)</label>`); } catch (e) { /* */ }
            return r;
        });
        // tahrirdan keyingi tozalash: jadval tuzilmasi (rowspan, kengliklar) saqlanadi
        if (typeof SK.upClean === 'function') SK.upClean = SK.agmkExtend('upClean', 'v4.0: jadval tuzilmasi saqlanadi', SK.upClean, (o: Function) => function (this: unknown, html: string) {
            const r = o.call(this, html); if (!/class="sk-t/.test(String(html || ''))) return r;
            try {
                const a = document.createElement('div'), b = document.createElement('div'); a.innerHTML = html; b.innerHTML = r;
                const ta = a.querySelectorAll('table'), tb = b.querySelectorAll('table'); if (ta.length !== tb.length) return r;
                ta.forEach((t, i) => {
                    if (!t.classList.contains('sk-t')) return; const u = tb[i]; u.className = t.className;
                    ['data-gx', 'data-gw', 'data-cw', 'data-rh', 'data-tp'].forEach(k => { const v = t.getAttribute(k); if (v != null) u.setAttribute(k, v); });
                    const ca = t.querySelectorAll('td'), cb = u.querySelectorAll('td'); if (ca.length !== cb.length) return;
                    ca.forEach((c, j) => { const d = cb[j] as HTMLTableCellElement; if ((c as HTMLTableCellElement).rowSpan > 1) d.rowSpan = (c as HTMLTableCellElement).rowSpan; if (c.classList.contains('sk-h')) d.className = 'sk-h'; if (c.hasAttribute('data-l')) d.setAttribute('data-l', '1'); });
                });
                return b.innerHTML;
            } catch (e) { return r; }
        });

        // ---------- 6) Jadval geometriyasi (PDF va Word uchun umumiy) ----------
        type SkGC = { r: number; c: number; rs: number; cs: number; td: HTMLTableCellElement; hole: boolean };
        function skGrid(t: HTMLTableElement): { G: SkGC[]; nR: number; nC: number; cw: number[]; rh: number[]; gx: number; gw: number; tp: number; nb: boolean } {
            const occ: Record<string, number> = {}, G: SkGC[] = []; let nC = 0; const rows = Array.from(t.rows);
            rows.forEach((tr, r) => { let c = 0; Array.from(tr.cells).forEach(td => { while (occ[r + ':' + c]) c++; const rs = Math.max(1, td.rowSpan || 1), cs = Math.max(1, td.colSpan || 1); for (let i = 0; i < rs; i++) for (let j = 0; j < cs; j++) occ[(r + i) + ':' + (c + j)] = 1; G.push({ r: r, c: c, rs: rs, cs: cs, td: td, hole: td.classList.contains('sk-h') }); c += cs; nC = Math.max(nC, c); }); });
            let cw = String(t.getAttribute('data-cw') || '').split(',').map(Number).filter(x => x > 0); if (cw.length !== nC) cw = Array(nC).fill(1 / Math.max(1, nC)); const s = cw.reduce((a, b) => a + b, 0); cw = cw.map(x => x / s);
            let rh = String(t.getAttribute('data-rh') || '').split(',').map(Number); if (rh.length !== rows.length) rh = rows.map(() => 0);
            return { G: G, nR: rows.length, nC: nC, cw: cw, rh: rh, gx: +(t.getAttribute('data-gx') || 0), gw: +(t.getAttribute('data-gw') || 1) || 1, tp: +(t.getAttribute('data-tp') || 0), nb: t.classList.contains('sk-nb') };
        }
        type SkTok = { s: string; st: string; sp: boolean; br?: boolean };
        function skToks(td: HTMLElement): SkTok[] {
            const out: SkTok[] = []; let sp = false;
            const walk = (n: Node, b: boolean): void => {
                if (n.nodeType === 3) { String(n.textContent || '').replace(/[ \t]/g, ' ').split(/( +)/).forEach(p => { if (!p) return; if (/^ +$/.test(p)) { sp = true; return; } out.push({ s: SK.pdfNorm ? SK.pdfNorm(p) : p, st: b ? 'Bold' : 'Regular', sp: sp }); sp = false; }); return; }
                if (n.nodeName === 'BR') { out.push({ s: '', st: 'Regular', sp: false, br: true }); sp = false; return; }
                Array.from(n.childNodes).forEach(k => walk(k, b || /^(B|STRONG|TH)$/.test(n.nodeName)));
            };
            walk(td, false); return out;
        }
        function skWrap(tk: SkTok[], w: number, fs: number): { ws: { s: string; st: string; w: number; sp: boolean }[]; w: number }[] {
            const L: { ws: { s: string; st: string; w: number; sp: boolean }[]; w: number }[] = [{ ws: [], w: 0 }], spw = SK.pdfW('Regular', ' ', fs);
            tk.forEach(t => {
                if (t.br) { L.push({ ws: [], w: 0 }); return; }
                const cur = L[L.length - 1], tw = SK.pdfW(t.st, t.s, fs), add = cur.ws.length && t.sp ? spw : 0;
                if (cur.ws.length && cur.w + add + tw > w) L.push({ ws: [{ s: t.s, st: t.st, w: tw, sp: false }], w: tw });
                else { cur.ws.push({ s: t.s, st: t.st, w: tw, sp: !!add }); cur.w += add + tw; }
            });
            while (L.length > 1 && !L[L.length - 1].ws.length) L.pop();
            return L;
        }
        // jadval shrifti: bir qatorda boʻlgan katak matni (asl hujjatdagidek) bir qatorga sigʻsin — 8 pt dan kichik emas
        function skFitFs(g: ReturnType<typeof skGrid>, tW: number, base: number, pad: number): number {
            let fs = base;
            g.G.forEach(z => { if (!z.td.hasAttribute('data-l')) return; const w = g.cw.slice(z.c, z.c + z.cs).reduce((a, b) => a + b, 0) * tW - pad * 2 - 2; const segs: SkTok[][] = [[]]; skToks(z.td).forEach(t => { if (t.br) segs.push([]); else segs[segs.length - 1].push(t); });
                segs.forEach(sg => { if (!sg.length) return; const nat = sg.reduce((a, t, i) => a + SK.pdfW(t.st, t.s, base) + (i && t.sp ? SK.pdfW('Regular', ' ', base) : 0), 0); if (nat > w && w > 0) fs = Math.min(fs, base * w / nat); }); });
            return Math.max(10, Math.floor(fs * 4) / 4); // kichikroq boʻlsa — matn katakda qatorga koʻchadi
        }
        function skAl(el: HTMLElement): string { const a = (el.style && el.style.textAlign) || el.getAttribute('align') || ''; return /center/.test(a) ? 'center' : /right/.test(a) ? 'right' : 'left'; }

        // ---------- 7) PDF: jadval oʻrniga belgi qoʻyiladi, keyin aynan oʻsha joyga chiziladi ----------
        if (typeof SK.pdfLayoutAkt === 'function') SK.pdfLayoutAkt = SK.agmkExtend('pdfLayoutAkt', 'v4.0: skaner jadvallari (K-52)', SK.pdfLayoutAkt, (o: Function) => function (this: unknown, root: any) {
            if (!root || !root.querySelector || !root.querySelector('table.sk-t')) return o.apply(this, arguments);
            const cl = root.cloneNode(true) as HTMLElement; cl.style.cssText = 'position:absolute;left:-99999px;top:0;width:794px;visibility:hidden'; document.body.appendChild(cl);
            const AKT = !!cl.querySelector('.a-approve, .a-title, .a-head'), mm = 72 / 25.4, Pfs = AKT ? 12 : 14, step = Pfs * (AKT ? 1.15 : 1.18) + 2, Lm = 30 * mm, cwPt = 595.28 - Lm - 15 * mm;
            const TB: { g: ReturnType<typeof skGrid>; rh: number[]; cells: { z: SkGC; L: ReturnType<typeof skWrap>; al: string }[]; fs: number; pad: number }[] = [];
            cl.querySelectorAll('table.sk-t').forEach((t: Element) => {
                const g = skGrid(t as HTMLTableElement), pad = g.nb ? 1 : 3, tW = g.gw * cwPt, fs = skFitFs(g, tW, g.nb ? Pfs : 11, pad), lh = fs * 1.2, k = g.tp ? tW / g.tp : 0;
                const cells = g.G.map(z => { const w = g.cw.slice(z.c, z.c + z.cs).reduce((a, b) => a + b, 0) * tW; return { z: z, L: skWrap(skToks(z.td), w - pad * 2 - 1, fs), al: skAl(z.td) }; });
                const rh = g.rh.map(px => px * k * (g.nb ? 0.9 : 0.85));
                cells.forEach(c => { if (c.z.rs === 1) rh[c.z.r] = Math.max(rh[c.z.r] || 0, c.L.length * lh + pad * 2 + 1); });
                cells.forEach(c => { if (c.z.rs > 1) { const need = c.L.length * lh + pad * 2 + 1, have = rh.slice(c.z.r, c.z.r + c.z.rs).reduce((a, b) => a + b, 0); if (need > have) rh[c.z.r + c.z.rs - 1] += need - have; } });
                const i = TB.length; TB.push({ g: g, rh: rh, cells: cells, fs: fs, pad: pad });
                const n = Math.ceil((rh.reduce((a, b) => a + b, 0) + 6) / step) + 1, fr = document.createDocumentFragment();
                for (let j = 0; j < n; j++) { const q = document.createElement('p'); q.className = 'ni'; q.textContent = 'zzSKT' + i + 'zz'; fr.appendChild(q); }
                (t.parentNode as Node).replaceChild(fr, t);
            });
            let lay: any; try { lay = o.call(this, cl); } finally { cl.remove(); }
            try {
                const P = lay.P, cw = P.W - P.L - P.R;
                TB.forEach((tb, i) => {
                    const tok = 'zzSKT' + i + 'zz', hits: { pi: number; y: number }[] = [];
                    lay.pages.forEach((ops: any[], pi: number) => ops.forEach((op: any) => { if (op.k === 't' && op.s === tok) hits.push({ pi: pi, y: op.y - op.fs * 0.89 }); }));
                    lay.pages = lay.pages.map((ops: any[]) => ops.filter((op: any) => !(op.k === 't' && op.s === tok)));
                    if (!hits.length) return;
                    const pages = Array.from(new Set(hits.map(h => h.pi))); let pk = 0;
                    const top = (pi: number): number => Math.min(...hits.filter(h => h.pi === pi).map(h => h.y)), end = (pi: number): number => Math.max(...hits.filter(h => h.pi === pi).map(h => h.y)) + step;
                    const g = tb.g, tW = g.gw * cw, x0 = P.L + g.gx * cw, cx = g.cw.map((_, j) => x0 + g.cw.slice(0, j).reduce((a, b) => a + b, 0) * tW).concat([x0 + tW]);
                    const rowPos: { pi: number; y: number }[] = []; let y = top(pages[0]) + 2;
                    tb.rh.forEach((h, r) => { if (y + h > end(pages[pk]) && pk + 1 < pages.length) { pk++; y = top(pages[pk]); } rowPos[r] = { pi: pages[pk], y: y }; y += h; });
                    const lh = tb.fs * 1.2;
                    tb.cells.forEach(c => {
                        const z = c.z, rp = rowPos[z.r]; if (!rp) return; const ops = lay.pages[rp.pi], x1 = cx[z.c], x2 = cx[z.c + z.cs], y1 = rp.y;
                        let h = 0; for (let r = z.r; r < z.r + z.rs; r++) h += (rowPos[r] && rowPos[r].pi === rp.pi) ? tb.rh[r] : 0; const y2 = y1 + h;
                        if (!g.nb && !z.hole) { ops.push({ k: 'l', x1: x1, y1: y1, x2: x2, y2: y1, w: 0.5 }, { k: 'l', x1: x1, y1: y2, x2: x2, y2: y2, w: 0.5 }, { k: 'l', x1: x1, y1: y1, x2: x1, y2: y2, w: 0.5 }, { k: 'l', x1: x2, y1: y1, x2: x2, y2: y2, w: 0.5 }); }
                        const th = c.L.length * lh; let ty = g.nb ? y1 + tb.pad : y1 + Math.max(tb.pad, (h - th) / 2);
                        const spw = SK.pdfW('Regular', ' ', tb.fs);
                        c.L.forEach(l => {
                            const base = ty + tb.fs * 0.89, nat = l.w; let x = c.al === 'center' ? x1 + (x2 - x1 - nat) / 2 : c.al === 'right' ? x2 - tb.pad - 1 - nat : x1 + tb.pad + 1;
                            l.ws.forEach((w, j) => { if (j && w.sp) x += spw; if (w.s) ops.push({ k: 't', x: x, y: base, s: w.s, st: w.st, fs: tb.fs }); x += w.w; });
                            ty += lh;
                        });
                    });
                });
            } catch (e) { console.error(e); }
            return lay;
        });

        // ---------- 8) Word: haqiqiy jadval (gridSpan, vMerge, ustun kengligi, chegarasiz katak) ----------
        function skDocxTbl(t: HTMLTableElement): string {
            const TW = 9355, g = skGrid(t), tW = Math.round(g.gw * TW), cols = g.cw.map(x => Math.round(x * tW)), esc = SK.xmlEsc || ((s: string) => s);
            const B1 = '<w:tcBorders><w:top w:val="single" w:sz="4"/><w:left w:val="single" w:sz="4"/><w:bottom w:val="single" w:sz="4"/><w:right w:val="single" w:sz="4"/></w:tcBorders>';
            const B0 = '<w:tcBorders><w:top w:val="nil"/><w:left w:val="nil"/><w:bottom w:val="nil"/><w:right w:val="nil"/></w:tcBorders>';
            const fs = skFitFs(g, g.gw * 467.7, g.nb ? 12 : 11, 3), sz = `<w:sz w:val="${Math.round(fs * 2)}"/><w:szCs w:val="${Math.round(fs * 2)}"/>`;
            const paras = (td: HTMLElement, al: string): string => {
                const P: string[][] = [[]]; skToks(td).forEach(tk => { if (tk.br) { P.push([]); return; } P[P.length - 1].push(`<w:r><w:rPr>${tk.st === 'Bold' ? '<w:b/>' : ''}${sz}</w:rPr><w:t xml:space="preserve">${esc((tk.sp ? ' ' : '') + tk.s)}</w:t></w:r>`); });
                return P.map(rs => `<w:p><w:pPr><w:spacing w:after="0"/>${al !== 'left' ? `<w:jc w:val="${al}"/>` : ''}</w:pPr>${rs.join('')}</w:p>`).join('');
            };
            const k = g.tp ? (g.gw * 467.7) / g.tp : 0; // pt / piksel (sahifa matn kengligi ~467.7 pt)
            let x = `<w:tbl><w:tblPr><w:tblW w:w="${tW}" w:type="dxa"/>${g.gx > 0.005 ? `<w:tblInd w:w="${Math.round(g.gx * TW)}" w:type="dxa"/>` : ''}<w:tblBorders><w:top w:val="nil"/><w:left w:val="nil"/><w:bottom w:val="nil"/><w:right w:val="nil"/><w:insideH w:val="nil"/><w:insideV w:val="nil"/></w:tblBorders><w:tblLayout w:type="fixed"/><w:tblCellMar><w:left w:w="57" w:type="dxa"/><w:right w:w="57" w:type="dxa"/></w:tblCellMar></w:tblPr><w:tblGrid>${cols.map(c => `<w:gridCol w:w="${c}"/>`).join('')}</w:tblGrid>`;
            for (let r = 0; r < g.nR; r++) {
                const hpt = g.rh[r] * k * (g.nb ? 0.9 : 0.85);
                x += `<w:tr>${hpt > 8 ? `<w:trPr><w:trHeight w:val="${Math.round(hpt * 20)}" w:hRule="atLeast"/></w:trPr>` : ''}`;
                for (let c = 0; c < g.nC;) {
                    const st = g.G.find(z => z.r === r && z.c === c), cov = st ? null : g.G.find(z => z.c === c && z.r < r && z.r + z.rs > r);
                    const z = st || cov; if (!z) { x += `<w:tc><w:tcPr><w:tcW w:w="${cols[c]}" w:type="dxa"/>${B0}</w:tcPr><w:p/></w:tc>`; c++; continue; }
                    const w = cols.slice(z.c, z.c + z.cs).reduce((a, b) => a + b, 0), al = skAl(z.td);
                    x += `<w:tc><w:tcPr><w:tcW w:w="${w}" w:type="dxa"/>${z.cs > 1 ? `<w:gridSpan w:val="${z.cs}"/>` : ''}${z.rs > 1 ? (st ? '<w:vMerge w:val="restart"/>' : '<w:vMerge/>') : ''}${g.nb || z.hole ? B0 : B1}<w:vAlign w:val="${g.nb ? 'top' : 'center'}"/></w:tcPr>${st ? paras(z.td, al) : '<w:p/>'}</w:tc>`;
                    c += z.cs;
                }
                x += '</w:tr>';
            }
            return x + '</w:tbl>';
        }
        if (typeof SK.docxFromEl === 'function') SK.docxFromEl = SK.agmkExtend('docxFromEl', 'v4.0: skaner jadvallari — Word jadvali (K-52)', SK.docxFromEl, (o: Function) => function (this: unknown, root: any) {
            if (!root || !root.querySelector || !root.querySelector('table.sk-t')) return o.apply(this, arguments);
            const cl = root.cloneNode(true) as HTMLElement, X: string[] = [];
            cl.querySelectorAll('table.sk-t').forEach((t: Element) => { X.push(skDocxTbl(t as HTMLTableElement)); const q = document.createElement('p'); q.className = 'ni'; q.textContent = 'zzSKT' + (X.length - 1) + 'zz'; (t.parentNode as Node).replaceChild(q, t); });
            const oz = SK.zipBlob;
            SK.zipBlob = function (files: any[], mime: string) {
                try { files = files.map((f: any) => f.name !== 'word/document.xml' ? f : { name: f.name, data: String(f.data).replace(/<w:p>(?:(?!<w:p>).)*?zzSKT(\d+)zz(?:(?!<\/w:p>).)*<\/w:p>/g, (m: string, i: string) => (X[+i] || '') + '<w:p><w:pPr><w:spacing w:after="0"/><w:rPr><w:sz w:val="12"/></w:rPr></w:pPr></w:p>') }); } catch (e) { console.error(e); }
                return oz.call(this, files, mime);
            };
            try { return o.call(this, cl); } finally { SK.zipBlob = oz; }
        });

        // ---------- 9) Koʻrinish ----------
        (function () {
            const st = document.createElement('style');
            st.textContent = `table.sk-t{border-collapse:collapse;margin:6px 0;font-size:.92em}
table.sk-t td{border:1px solid #333;padding:2px 4px;vertical-align:middle}
table.sk-t.sk-nb td{border:none;vertical-align:top;padding:1px 2px}
table.sk-t td.sk-h{border:none}
label.sk-old{display:flex;gap:8px;align-items:center;font-size:13px;margin-top:8px}`;
            document.head.appendChild(st);
            // HTML koʻrinishida jadval kengligi va oʻrni
            const fix = (): void => { document.querySelectorAll('table.sk-t:not([data-skw])').forEach((t: Element) => { const e = t as HTMLElement; e.setAttribute('data-skw', '1'); e.style.width = (+(e.getAttribute('data-gw') || 1) * 100).toFixed(1) + '%'; const gx = +(e.getAttribute('data-gx') || 0); if (gx > 0.005) e.style.marginLeft = (gx * 100).toFixed(1) + '%'; }); };
            try { new MutationObserver(fix).observe(document.body, { childList: true, subtree: true }); } catch (e) { /* */ }
        })();
