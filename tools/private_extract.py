# Shaxsiy maʼlumotlarni manba kodidan ajratish (bir martalik va takroriy ishlatsa boʻladi).
#   python3 tools/private_extract.py frontend
# Har bir roʻyxatdagi oʻzgaruvchining qiymati frontend/private/<NOM>.json ga koʻchadi (Git ga TUSHMAYDI — .gitignore),
# manbada esa  var NOM = __PRIVATE__("NOM");  qoladi. Yigʻishda (build.mjs) qiymat qaytadan joylanadi.
# frontend/private.example/<NOM>.json — boʻsh namunalar (repoda), maxfiy fayl boʻlmasa ilova shu bilan yigʻiladi.
import json, os, re, sys

FE = sys.argv[1]
ITEMS = [  # (fayl, oʻzgaruvchi, boʻsh namuna)
    ('src/features/xodimlar/k09_wrkseed_ishchilar_ro_yxati_1c_.ts', 'WRK_SEED', {'v': '', 'rows': []}),  # ishchilar: tabel, F.I.Sh., sex, kasb (1C)
    ('src/features/xodimlar/roster.ts', 'ROSTER', []),                                                 # ITR shtat roʻyxati: tabel, F.I.Sh.
    ('src/features/auth/kir_seed.ts', 'KIR_SEED', {'it': 30000, 'v': '', 'h': {}, 'g': {}}),         # boshlangʻich parollar xeshi
]
dec = json.JSONDecoder()
for rel, name, empty in ITEMS:
    p = os.path.join(FE, rel); t = open(p, encoding='utf8').read()
    m = re.search(r'\b(var|const|let)\s+%s\s*=\s*' % re.escape(name), t)
    if not m: sys.exit('topilmadi: %s %s' % (rel, name))
    if t.startswith('__PRIVATE__("%s")' % name, m.end()): print('allaqachon ajratilgan:', name); continue
    val, end = dec.raw_decode(t, m.end())
    if not t.startswith((';', ','), end): sys.exit('literal oxiri kutilmagan: %s' % name)
    if isinstance(val, dict) and isinstance(empty, dict):  # namunada asl kalitlar tuzilmasi saqlansin
        empty = {k: (empty[k] if k in empty else type(v)()) for k, v in val.items()}
    os.makedirs(os.path.join(FE, 'private'), exist_ok=True); os.makedirs(os.path.join(FE, 'private.example'), exist_ok=True)
    open(os.path.join(FE, 'private', name + '.json'), 'w', encoding='utf8').write(t[m.end():end])  # aynan asl matn
    json.dump(empty, open(os.path.join(FE, 'private.example', name + '.json'), 'w', encoding='utf8'), ensure_ascii=False)
    t = t[:m.end()] + '__PRIVATE__("%s")' % name + t[end:]
    open(p, 'w', encoding='utf8', newline='').write(t)
    print('ajratildi:', name, len(json.dumps(val)) // 1024, 'KB')
