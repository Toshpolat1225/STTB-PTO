"""3.19.0: QR yorliq PDF larini haqiqiy QR oʻquvchi (OpenCV) bilan tekshirish.
Ishga tushirish: python3 qr_decode.py <papka>   (qr_e2e.js yozgan qr_bitta.pdf, qr_varaq.pdf, qr_kutilgan.json)
"""
import json
import subprocess
import sys
from pathlib import Path

import cv2

d = Path(sys.argv[1] if len(sys.argv) > 1 else "/tmp")
want = json.loads((d / "qr_kutilgan.json").read_text())
det = cv2.QRCodeDetector()
bad = 0
for name, exp in (("bitta", want["bitta"]), ("varaq", want["varaq"])):
    pdf = d / f"qr_{name}.pdf"
    subprocess.run(["pdftoppm", "-r", "200", "-png", str(pdf), str(d / f"qr_{name}")], check=True)
    got = []
    for png in sorted(d.glob(f"qr_{name}-*.png")):
        img = cv2.imread(str(png))
        ok, txt, _pts, _ = det.detectAndDecodeMulti(img)
        found = [t for t in (txt if ok else []) if t]
        # varaqda bir nechta: har yorliqni alohida qirqib ham tekshiramiz (Multi baʼzan hammasini topmaydi)
        if len(found) < 8 and name == "varaq":
            h, w = img.shape[:2]
            for r in range(4):
                for c in range(2):
                    t, _p, _s = det.detectAndDecode(img[r * h // 4:(r + 1) * h // 4, c * w // 2:(c + 1) * w // 2])
                    if t and t not in found:
                        found.append(t)
        got += found
    miss = [t for t in exp if t not in got]
    print(("✅ " if not miss else "❌ ") + f"{name}: {len(exp) - len(miss)}/{len(exp)} QR oʻqildi" + (f", oʻqilmadi: {miss}" if miss else ""))
    bad += bool(miss)
print("✅ ALL OK" if not bad else f"❌ {bad} ta xato")
sys.exit(1 if bad else 0)
