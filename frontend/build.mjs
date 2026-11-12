// AGMK-STTB PTO — frontend yigʻuvchisi.
//   node build.mjs            → TypeScript fayllar tsc (transpileModule) orqali JS ga oʻgiriladi va bitta HTML yigʻiladi
//   node build.mjs --raw      → oʻgirishsiz (manba matni aynan) — eski 3.16.4 bilan bayt-baraybar solishtirish uchun
//   node build.mjs --out F    → natija fayli (standart: dist/agmk-sttb-pto.html)
// Natija: bitta mustaqil HTML (APK ichiga assets/index.html sifatida va server orqali brauzerga beriladi).
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(ROOT, 'src');
const args = process.argv.slice(2);
const RAW = args.includes('--raw');
const OUT = args.includes('--out') ? path.resolve(args[args.indexOf('--out') + 1]) : path.join(ROOT, 'dist', 'agmk-sttb-pto.html');

function loadTs() {
    const require = createRequire(import.meta.url);
    for (const p of ['typescript', path.join(ROOT, 'node_modules', 'typescript'), '/opt/node-tools/node_modules/typescript']) {
        try { return require(p); } catch (e) { /* keyingisi */ }
    }
    throw new Error('TypeScript topilmadi: frontend papkasida «npm install» bajaring');
}
const ts = RAW ? null : loadTs();
const read = rel => fs.readFileSync(path.join(SRC, rel), 'utf8');

let errors = 0;
function compile(rel) {
    const code = read(rel);
    if (RAW || !rel.endsWith('.ts')) return rel.endsWith('.ts') ? privateData(code) : code;
    const r = ts.transpileModule(code, {
        fileName: rel, reportDiagnostics: true,
        compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ESNext, moduleDetection: ts.ModuleDetectionKind.Legacy, removeComments: false, newLine: ts.NewLineKind.LineFeed }
    });
    for (const d of r.diagnostics || []) {
        const { line, character } = d.file ? d.file.getLineAndCharacterOfPosition(d.start) : { line: 0, character: 0 };
        console.error(`XATO ${rel}:${line + 1}:${character + 1} ${ts.flattenDiagnosticMessageText(d.messageText, '\n')}`); errors++;
    }
    let js = r.outputText.replace(/\n?\/\/# sourceMappingURL=.*$/, '');
    if (!code.endsWith('\n') && js.endsWith('\n')) js = js.slice(0, -1); // qoʻshni qismlar orasidagi tuzilma saqlansin
    return privateData(js);
}
// Shaxsiy maʼlumotlar (private/*.json — Git ga tushmaydi). Boʻlmasa — private.example/ dagi boʻsh namuna (ogohlantirish bilan).
const PRIV_MISSING = new Set();
function privateData(js) {
    return js.replace(/__PRIVATE__\("([A-Z0-9_]+)"\)/g, (_, n) => {
        const p = path.join(ROOT, 'private', n + '.json');
        if (fs.existsSync(p)) return fs.readFileSync(p, 'utf8').trim();
        PRIV_MISSING.add(n); return fs.readFileSync(path.join(ROOT, 'private.example', n + '.json'), 'utf8').trim();
    });
}
function assets(text) { // data:...;base64,@@ASSET:...@@ → fayl mazmuni
    return text.replace(/@@ASSET:([^@]+)@@/g, (_, rel) => fs.readFileSync(path.join(SRC, rel)).toString('base64'));
}
function guardScript(js, where) { // <script> ichida «</script» boʻlsa HTML buziladi
    const i = js.search(/<\/script/i);
    if (i >= 0) { console.error(`XATO ${where}: kod ichida «</script» bor (${js.slice(Math.max(0, i - 60), i + 20)})`); errors++; }
    return js;
}

const T = JSON.parse(read('TARTIB.json'));
const ver = /AGMK_VERSION = '([^']+)'/.exec(read('features/core/ver.ts'));
const V = ver ? ver[1] : '0';
let kod = T.main.map(compile).join('');
for (const m of T.mod) kod += `\n        // ===== [v${V} modul: ${path.basename(m, '.ts')}.js] =====\n` + compile(m);


let html = read('shell.html');
html = html.replace(/@@INC:([^@]+)@@/g, (_, rel) => { const t = compile(rel); return rel.endsWith('.ts') ? guardScript(t, rel) : assets(t); });
html = html.replace('@@KOD@@', () => guardScript(kod, 'asosiy kod'));
// Xodimlarning haqiqiy ismlari (private/NAMES.json — Git ga tushmaydi): manbada @@N:raqam@@ belgisi turadi.
// Fayl boʻlmasa (GitHub, sinov) — «F.I.Sh.» qoʻyiladi.
const NAMES = (() => { const p = path.join(ROOT, 'private', 'NAMES.json'); if (fs.existsSync(p)) return JSON.parse(fs.readFileSync(p, 'utf8')); PRIV_MISSING.add('NAMES'); return {}; })();
// Administrator (namunaviy yoki korxona) — kodda emas, sozlamada: muhit oʻzgaruvchisi yoki ../.env dagi AGMK_ADMIN; ism — private/NAMES.json ("admin").
// Ilovadagi administrator tekshiruvi faqat interfeys uchun; haqiqiy huquq serverda (sessiya roli) tekshiriladi.
const ADMIN = (() => { if (process.env.AGMK_ADMIN) return process.env.AGMK_ADMIN; try { const m = /^AGMK_ADMIN=(\d+)\s*$/m.exec(fs.readFileSync(path.join(ROOT, '..', '.env'), 'utf8')); if (m) return m[1]; } catch (e) {} try { const m = /^AGMK_ADMIN=(\d+)\s*$/m.exec(fs.readFileSync(path.join(ROOT, '..', '.env.example'), 'utf8')); if (m) return m[1]; } catch (e) {} return '0'; })();
html = html.replace(/@@ADMIN_TABEL@@/g, ADMIN).replace(/@@ADMIN_NAME@@/g, () => (NAMES[ADMIN] || NAMES.admin || 'Administrator').replace(/"/g, ''));
html = html.replace(/@@N:(\d+)@@/g, (_, k) => NAMES[k] || 'F.I.Sh.');
html = html.replace(/@@VENDOR:([^@]+)@@/g, (_, f) => fs.readFileSync(path.join(ROOT, 'vendor', f), 'utf8'));
html = html.replace(/<title>AGMK-STTB PTO v[^<]*<\/title>/, `<title>AGMK-STTB PTO v${V}</title>`);
// ---------- 🔒 YOPIQ KONTUR (6.1/138): CSP va tashqi murojaat tekshiruvi ----------
// CSP: tashqi skript, shrift, freym, obyekt yuklanmaydi (web, telefon, kompyuter — bir xil). Tarmoq soʻrovlarini features/core/v61yk.ts qoʻriqlaydi.
const CSP = "object-src 'none'; base-uri 'self'; form-action 'self'; frame-src 'self' blob: data:; font-src 'self' data: blob:; script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: data: file:; worker-src 'self' blob: data:";
if (!/http-equiv="Content-Security-Policy"/.test(html)) html = html.replace(/<head>/i, m => m + `<meta http-equiv="Content-Security-Policy" content="${CSP}">`);
if (!/http-equiv="Content-Security-Policy"/.test(html)) { console.error('XATO: CSP qoʻyilmadi (<head> topilmadi)'); errors++; }
{
  const DENY = /(api\.anthropic\.com|generativelanguage\.googleapis|googleapis\.com|openai\.com|cognitiveservices|speech\.microsoft|overpass-api|project-osrm|arcgisonline|tile\.openstreetmap|openrailwaymap\.org|unpkg\.com|cdnjs\.|jsdelivr|fonts\.gstatic|mapbox\.com|google-analytics|googletagmanager|sentry\.io)/i;
  const PAT = [
    [/\bfetch\(\s*[`'"]\s*(?:https?:)?\/\/[^`'"]+/g, 'fetch → tashqi manzil'],
    [/tileLayer\(\s*[`'"]https?:\/\/[^`'"]+/g, 'xarita foni → internet'],
    [/new\s+(?:WebSocket|EventSource)\(\s*[`'"](?:wss?|https?):\/\/[^`'"]+/g, 'WebSocket/EventSource → tashqi'],
    [/\.open\(\s*[`'"](?:GET|POST|PUT)[`'"]\s*,\s*[`'"]https?:\/\/[^`'"]+/g, 'XMLHttpRequest → tashqi'],
    [/<script[^>]+src=["']?https?:\/\/[^"' >]+/gi, '<script src> → internet'],
    [/<link[^>]+href=["']?https?:\/\/[^"' >]+[^>]*>/gi, '<link> → internet'],
    [/@import\s+url\(\s*["']?https?:\/\/[^)"']+/gi, 'CSS @import → internet'],
  ];
  const bad = [];
  for (const [re, why] of PAT) for (const m of html.matchAll(re)) { if (why === '<link> → internet' && !/stylesheet|preload|icon|manifest|prefetch/i.test(m[0])) continue; bad.push(why + ': ' + m[0].slice(0, 140)); }
  for (const m of html.matchAll(new RegExp(DENY.source, 'gi'))) bad.push('taqiqlangan xizmat: ' + html.slice(Math.max(0, m.index - 60), m.index + 60).replace(/\s+/g, ' '));
  if (bad.length) { console.error(`\n🔒 YOPIQ KONTUR: ${bad.length} ta tashqi murojaat topildi — versiya chiqmaydi:`); bad.slice(0, 40).forEach(b => console.error('   • ' + b)); errors++; }
  else console.log('🔒 Yopiq kontur tekshiruvi: tashqi murojaat yoʻq');
}
if (/@@(INC|ASSET|VENDOR|KOD|N:|ADMIN_)/.test(html)) { console.error('XATO: almashtirilmagan belgi qoldi'); errors++; }

if (errors) { console.error(`\n${errors} ta xato — yigʻish toʻxtatildi`); process.exit(1); }
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, html);
if (PRIV_MISSING.size) console.warn(`⚠️  Shaxsiy maʼlumot fayllari yoʻq (frontend/private/): ${[...PRIV_MISSING].join(', ')} — boʻsh namuna bilan yigʻildi`);
console.log(`✅ ${path.relative(process.cwd(), OUT)} · v${V} · ${T.main.length} qism + ${T.mod.length} modul · ${(html.length / 1e6).toFixed(1)} MB${RAW ? ' · --raw' : ' · TypeScript'}`);
