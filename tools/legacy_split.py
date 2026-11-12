# Bir martalik vosita: 3.16.4 (bitta HTML) → frontend/src (TypeScript loyiha tuzilmasi).
# Foydalanish: python3 tools/legacy_split.py <v4/base.html> <v4/mod> <frontend>
# Natijani frontend/build.mjs qayta yigʻadi; tekshiruv: yigʻilgan HTML asl 3.16.4 bilan bir xil ishlashi kerak.
import base64, hashlib, json, os, re, sys

BASE, MODDIR, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
SRC = os.path.join(OUT, 'src')
s = open(BASE, encoding='utf8').read()

def w(rel, text, binary=False):
    p = os.path.join(SRC, rel); os.makedirs(os.path.dirname(p), exist_ok=True)
    if binary: open(p, 'wb').write(text)
    else: open(p, 'w', encoding='utf8', newline='').write(text)

# --- data: URI → assets/ (yigʻishda qayta joylanadi; APK bitta fayl boʻlib qoladi)
EXT = {'image/jpeg': 'jpg', 'image/png': 'png', 'image/svg+xml': 'svg', 'image/webp': 'webp', 'image/gif': 'gif',
       'font/woff2': 'woff2', 'font/woff': 'woff', 'font/ttf': 'ttf', 'application/font-woff2': 'woff2',
       'application/x-font-woff': 'woff', 'application/font-woff': 'woff', 'font/otf': 'otf', 'application/x-font-ttf': 'ttf'}
assets = {}
def pull_assets(text, prefix):
    def rep(m):
        mime, b64 = m.group(1), m.group(2)
        raw = base64.b64decode(b64)
        if base64.b64encode(raw).decode() != b64: return m.group(0)  # kanonik boʻlmasa — oʻz holicha qoladi
        h = hashlib.sha256(raw).hexdigest()[:10]
        name = 'assets/%s_%s.%s' % (prefix, h, EXT.get(mime, 'bin'))
        assets[name] = mime; w(name, raw, True)
        return 'data:%s;base64,@@ASSET:%s@@' % (mime, name)
    return re.sub(r'data:([a-z]+/[a-z0-9.+\-]+);base64,([A-Za-z0-9+/=]{2000,})', rep, text)

parts = []  # shell.html qismlari
pos = 0
def take(upto):
    global pos; parts.append(s[pos:upto]); pos = upto
def inc(rel):
    parts.append('@@INC:%s@@' % rel)

# 1) Android koʻprigi
a = s.index('<head><script>') + len('<head><script>'); b = s.index('</script>', a)
take(a); w('android/bridge.ts', s[a:b]); inc('android/bridge.ts'); pos = b
# 2) Asosiy CSS
a = s.index('<style>', pos) + len('<style>'); b = s.index('</style>', a)
while len(s[a:b]) < 100000: a = s.index('<style>', b) + len('<style>'); b = s.index('</style>', a)
take(a); w('styles/app.css', pull_assets(s[a:b], 'css')); inc('styles/app.css'); pos = b
# 3) Sahifa belgilashi (HTML) — </style> dan birinchi maʼlumot blokigacha
first_lz = s.index('<script type="application/json" id="lz_', pos)
a = s.index('<body', pos); a = s.index('>', a) + 1
take(a); w('markup/body.html', pull_assets(s[a:first_lz], 'img')); inc('markup/body.html'); pos = first_lz
# 4) Katta maʼlumot bloklari (lz_*)
data_files = []
for m in re.finditer(r'<script type="application/json" id="(lz_[A-Za-z0-9_]+)">', s):
    if m.start() < pos: continue
    if s.find('<script type="text/x-agmk-main"', pos) < m.start(): break
    a = m.end(); b = s.index('</script>', a)
    take(a); rel = 'data/%s.json' % m.group(1); w(rel, s[a:b]); inc(rel); pos = b; data_files.append(rel)
# 5) Asosiy kod: boʻlimlar boʻyicha fayllarga; modullar alohida
a = s.index('<script type="text/x-agmk-main" id="agmkMain">', pos) + len('<script type="text/x-agmk-main" id="agmkMain">')
mk = s.index('\n        // @@MODULLAR@@', a); b = s.index('</script>', mk)
take(a); main = s[a:mk]
cuts = [0]
for x in re.finditer(r'\n {0,8}// ={20,}\n.*?\n {0,8}// ={20,}', main, re.S): cuts.append(x.start() + 1)
for x in re.finditer(r'\n {0,8}/\* ===== ', main): cuts.append(x.start() + 1)
cuts = sorted(set(cuts))
def slug(t):
    t = t.lower()
    for k, v in (("oʻ", 'o'), ("o'", 'o'), ("gʻ", 'g'), ("g'", 'g'), ('ʼ', ''), ("'", '')): t = t.replace(k, v)
    t = re.sub(r'[^a-z0-9]+', '_', t).strip('_')
    return t[:48].rstrip('_') or 'qism'
order = []
for i, c in enumerate(cuts):
    chunk = main[c:cuts[i + 1] if i + 1 < len(cuts) else len(main)]
    head = re.search(r'(?://|/\*) ?={3,}\s*\n?\s*(?://)?\s*(?:YANGI\s*)?\(?([^\n=]{3,80})', chunk[:600])
    name = '%03d_%s.ts' % (i, slug(head.group(1)) if (i and head) else 'yadro')
    w('main/' + name, chunk); order.append('main/' + name)
# modullar
tartib = json.load(open(os.path.join(MODDIR, 'TARTIB.json'), encoding='utf8'))
for m in tartib:
    w('mod/' + m[:-3] + '.ts', open(os.path.join(MODDIR, m), encoding='utf8').read())
json.dump({'main': order, 'mod': ['mod/' + m[:-3] + '.ts' for m in tartib]}, open(os.path.join(SRC, 'TARTIB.json'), 'w', encoding='utf8'), ensure_ascii=False, indent=1)
parts.append('@@KOD@@'); pos = mk + len('\n        // @@MODULLAR@@')
# 6) Ishga tushirish skripti (maʼlumotlar ombori) va uchinchi tomon kutubxonalari
a = s.index('<script>', pos) + len('<script>'); b = s.index('</script>', a)
take(a); w('boot/storage.ts', s[a:b]); inc('boot/storage.ts'); pos = b
for vid, vname in (('xlsxLibSrc', 'xlsx.full.min.js'), ('pdfjsLibSrc', 'pdf.js'), ('pdfjsWorkerSrc', 'pdf.worker.js')):
    a = s.index('<script type="text/plain" id="%s">' % vid, pos); a = s.index('>', a) + 1; b = s.index('</script>', a)
    take(a); os.makedirs(os.path.join(OUT, 'vendor'), exist_ok=True)
    open(os.path.join(OUT, 'vendor', vname), 'w', encoding='utf8', newline='').write(s[a:b]); parts.append('@@VENDOR:%s@@' % vname); pos = b
take(len(s))
w('shell.html', ''.join(parts))
print('qismlar:', len(order), 'modul:', len(tartib), 'maʼlumot:', len(data_files), 'asset:', len(assets))
