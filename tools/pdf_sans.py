# 5.9: Struktura PDF uchun sans shrift (Liberation Sans — SIL OFL) maʼlumotini yigʻadi:
#   python3 tools/pdf_sans.py  →  frontend/src/data/lz_AGMK_PDF_SANS.json
# Belgilar toʻplami — AGMK_PDF_FONT (serif) bilan bir xil (lotin, kirill, oʻzbek belgilari, tinish).
import json, base64, io, os
from fontTools.ttLib import TTFont
from fontTools import subset
R = os.path.join(os.path.dirname(__file__), '..', 'frontend', 'src', 'data')
serif = json.load(open(os.path.join(R, 'lz_AGMK_PDF_FONT.json')))
uni = sorted(set(int(k) for k in serif['Regular']['cmap']) | set(int(k) for k in serif['Bold']['cmap']) | set(range(0x20, 0x7f)) | {0x2026, 0x2116, 0xb7, 0x25b8, 0x25be})
out = {}
for st, fn in (('Regular', 'LiberationSans-Regular.ttf'), ('Bold', 'LiberationSans-Bold.ttf')):
    f = TTFont('/usr/share/fonts/truetype/liberation/' + fn)
    o = subset.Options(); o.notdef_outline = True; o.name_IDs = ['*']; o.layout_features = []; o.hinting = False
    s = subset.Subsetter(o); s.populate(unicodes=uni); s.subset(f)
    b = io.BytesIO(); f.save(b); f = TTFont(io.BytesIO(b.getvalue()))
    order = f.getGlyphOrder(); gid = {g: i for i, g in enumerate(order)}
    cmap = {str(u): gid[g] for u, g in f.getBestCmap().items()}
    hm = f['hmtx']; head = f['head']; os2 = f['OS/2']
    out[st] = {'upm': head.unitsPerEm, 'cmap': cmap, 'w': [hm[g][0] for g in order], 'asc': f['hhea'].ascent, 'desc': f['hhea'].descent,
               'cap': getattr(os2, 'sCapHeight', 1409) or 1409, 'bbox': [head.xMin, head.yMin, head.xMax, head.yMax], 'ttf': base64.b64encode(b.getvalue()).decode()}
json.dump(out, open(os.path.join(R, 'lz_AGMK_PDF_SANS.json'), 'w'), separators=(',', ':'))
print({k: (len(v['cmap']), len(v['ttf'])) for k, v in out.items()})
