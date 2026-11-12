"""AGMK-STTB: tayyor ilova shabloniga (ilova_yangi/index_shablon.html) korxona serveridagi shaxsiy maʼlumotlarni
(frontend/private/*.json) qoʻyadi → ilova_yangi/index.html. Shaxsiy maʼlumotlar faqat shu kompyuterda qoladi.
   python windows/ilova_birlashtir.py      (repo ildizidan; Docker ichida ham ishlaydi)"""
import json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'ilova_yangi', 'index_shablon.html')
OUT = os.path.join(ROOT, 'ilova_yangi', 'index.html')
PRIV = os.path.join(ROOT, 'frontend', 'private')
EX = os.path.join(ROOT, 'frontend', 'private.example')

html = open(SRC, encoding='utf-8').read()
names = sorted(set(re.findall(r'"__AGMK_PRIV_([A-Z0-9_]+)__"', html)))
for n in names:
    p = os.path.join(PRIV, n + '.json')
    if not os.path.exists(p):
        p = os.path.join(EX, n + '.json')
        print('OGOHLANTIRISH: frontend/private/%s.json yoʻq — boʻsh namuna qoʻyildi' % n)
    data = open(p, encoding='utf-8').read().strip()
    json.loads(data)  # buzilgan JSON boʻlsa — toʻxtaydi
    if '</script' in data.lower():
        sys.exit('XATO: %s ichida «</script» bor' % n)
    html = html.replace('"__AGMK_PRIV_%s__"' % n, data, 1)
    print('qoʻyildi:', n, len(data), 'belgi')
if '__AGMK_PRIV_' in html:
    sys.exit('XATO: shablonda qoʻyilmagan joy qoldi')
open(OUT, 'w', encoding='utf-8', newline='\n').write(html)
print('TAYYOR:', OUT, len(html.encode('utf-8')) // 1024, 'KB')
