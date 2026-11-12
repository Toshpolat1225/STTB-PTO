// Turlar tekshiruvi (tsc --noEmit) — «qadamli» (ratchet) usulda.
// Eski koddagi turlar qarzi types/baseline.json da fayl boʻyicha qayd etilgan. Tekshiruv:
//   • biror faylda xatolar soni bazaviydan OSHSA — xato (yangi kod turlarsiz yozilmaydi);
//   • kamaysa — bazaviy son yangilanadi (node check.mjs --update), qarz faqat kamayadi.
// Yangi fayllar uchun bazaviy son 0: yangi kod toʻliq turlangan boʻlishi shart.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
let ts; for (const p of ['typescript', path.join(ROOT, 'node_modules', 'typescript'), '/opt/node-tools/node_modules/typescript']) { try { ts = require(p); break; } catch (e) { } }
if (!ts) { console.error('TypeScript topilmadi: «npm install»'); process.exit(2); }

const cfg = ts.getParsedCommandLineOfConfigFile(path.join(ROOT, 'tsconfig.json'), {}, { ...ts.sys, onUnRecoverableConfigFileDiagnostic: d => { throw new Error(ts.flattenDiagnosticMessageText(d.messageText, '\n')); } });
const prog = ts.createProgram(cfg.fileNames, cfg.options);
const diags = ts.getPreEmitDiagnostics(prog);
const by = {};
for (const d of diags) { const f = d.file ? path.relative(ROOT, d.file.fileName) : '(umumiy)'; by[f] = (by[f] || 0) + 1; }
const BL = path.join(ROOT, 'types', 'baseline.json');
const base = fs.existsSync(BL) ? JSON.parse(fs.readFileSync(BL, 'utf8')) : {};
if (process.argv.includes('--update') || !fs.existsSync(BL)) {
    const out = {}; Object.keys(by).sort().forEach(k => { out[k] = Math.min(by[k], base[k] === undefined ? by[k] : base[k]); });
    fs.mkdirSync(path.dirname(BL), { recursive: true }); fs.writeFileSync(BL, JSON.stringify(out, null, 1) + '\n');
    console.log(`Bazaviy qarz yozildi: ${Object.values(out).reduce((a, b) => a + b, 0)} ta (${Object.keys(out).length} fayl)`); process.exit(0);
}
let bad = 0, better = 0;
for (const [f, n] of Object.entries(by)) {
    const b = base[f] || 0;
    if (n > b) {
        bad++; console.error(`✗ ${f}: ${n} ta tur xatosi (ruxsat: ${b})`);
        diags.filter(d => d.file && path.relative(ROOT, d.file.fileName) === f).slice(0, 5).forEach(d => { const { line } = d.file.getLineAndCharacterOfPosition(d.start); console.error(`    ${line + 1}: ${ts.flattenDiagnosticMessageText(d.messageText, ' ')}`); });
    } else if (n < b) better++;
}
const total = Object.values(by).reduce((a, b) => a + b, 0), btotal = Object.values(base).reduce((a, b) => a + b, 0);
console.log(`Turlar: ${total} ta eski qarz (bazaviy ${btotal})${better ? ` · ${better} faylda kamaydi — «node check.mjs --update»` : ''}`);
if (bad) { console.error(`${bad} faylda yangi tur xatolari — tuzating`); process.exit(1); }
console.log('✅ Yangi tur xatolari yoʻq');
