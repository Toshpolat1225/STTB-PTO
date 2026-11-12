"""frontend/src/features/<boʻlim>/README.md ni yangilaydi: fayllar (yigʻish tartibida), saqlash kalitlari va server API.

    python3 tools/feature_readme.py

Boʻlim tavsifi pastdagi NAMES da; fayl tavsifi — faylning birinchi izoh qatori (yoki fayl nomi).
"""
import json
import os
import re

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'frontend', 'src')
NAMES = {
    'core': 'Yadro: ishga tushish, saqlash, menyu, dizayn, server rejimi, oflayn, umumiy interfeys',
    'auth': 'Kirish (tabel, parol, PIN), rollar va huquqlar',
    'vagonlar': 'Vagonlar bazasi va pasporti, taʼmir grafigi, probeg, QR yorliqlar, gʻildirak juftliklari',
    'texnika': 'Lokomotivlar, teplovozlar, elektrovozlar, avtotraktor parki, mashinistlar, dispetcherlik, GPS',
    'temir_yol': 'Temir yoʻl xaritasi, uchastkalar, stansiya sxemalari, yoʻl uzunliklari',
    'hujjatlar': 'Normativ hujjatlar, Word/PDF/Excel eksporti, hujjat tili, yuklab olish',
    'aktlar': 'Dalolatnomalar, bildirgilar, imzo chekuvchilar, nosozlik albomi, kalkulyatsiya',
    'hisobot_tekshiruvi': 'Oylik toʻplam va 1C (Forma-30) bilan spravka-raschet tekshiruvi, haftalik achot',
    'iqtisod_buxgalteriya': 'FOT tahlili, jirovka, tasdiqlangan normalar, ОС-3, xarajatlar',
    'mttb_ombor': 'MTTB zayavkalari, kirish nazorati, qabul qilingan ehtiyot qismlar',
    'xodimlar': 'Shtat, xodimlar, davomat (SVO), mehnat muhofazasi, polojeniya, tugʻilgan kunlar',
    'imzo': 'Ichki elektron imzo (korxona ichidagi tasdiqlash)',
    'salohiyat': 'Korxona salohiyati, ishlab chiqarish koʻrsatkichlari, ruda tashish',
    'ai_ovoz': 'Mahalliy yordamchi va ovozli buyruqlar (tashqi AI xizmatlari yopiq kontur sababli oʻchirilgan)',
    'yozishmalar': 'Ichki yozishmalar',
    '_yangilanishlar': 'Bir nechta boʻlimni birdan oʻzgartirgan versiya paketlari',
}
NOTE = {
    '_yangilanishlar': 'Bu papkadagi fayllar ilovaning turli versiyalarida bir nechta boʻlimga birdan kiritilgan oʻzgarishlar paketidir. '
                       'Ular oldingi funksiyalarni `agmkExtend` bilan oʻraydi, shuning uchun boʻlimlarga boʻlinmagan va '
                       '**yigʻish tartibi (`TARTIB.json`) saqlanishi shart**.\n',
}


def first_comment(src: str) -> str:
    for line in src.splitlines()[:40]:
        m = re.match(r'^\s*//\s*([^=\s/-].*)$', line)
        if m:
            return m.group(1).strip()
    return ''


def main() -> None:
    order_list = json.load(open(os.path.join(ROOT, 'TARTIB.json'), encoding='utf8'))
    order = {p: i for i, p in enumerate(order_list['main'] + order_list['mod'])}
    feats = os.path.join(ROOT, 'features')
    for c in sorted(os.listdir(feats)):
        d = os.path.join(feats, c)
        if not os.path.isdir(d):
            continue
        files = sorted((f for f in os.listdir(d) if f.endswith('.ts')), key=lambda f: order.get(f'features/{c}/{f}', 10 ** 6))
        keys, apis, rows = set(), set(), []
        for f in files:
            s = open(os.path.join(d, f), encoding='utf8').read()
            keys |= set(re.findall(r"['\"`](agmk_[a-z0-9_]{2,40})['\"`]", s))
            apis |= set(re.findall(r"['\"`](/api/[a-z0-9_/]+)", s))
            desc = first_comment(s) or re.sub(r'^\d+_(\d+_)?(bosqich_)?', '', f[:-3]).replace('_', ' ')
            i = order.get(f'features/{c}/{f}')
            rows.append(f"| {i + 1 if i is not None else '—'} | `{f}` | {desc.replace('|', '/')[:120]} |")
        out = [f'# features/{c}\n', f'**{NAMES.get(c, c)}.**\n']
        if c in NOTE:
            out.append(NOTE[c])
        out += ['## Fayllar (yigʻish tartibida)\n', '| # | Fayl | Tavsif |', '|---|---|---|'] + rows
        if keys:
            out.append('\n## Saqlash kalitlari (localStorage / sinxron)\n\n' + ', '.join(f'`{k}`' for k in sorted(keys)))
        if apis:
            out.append('\n## Server API\n\n' + ', '.join(f'`{a}`' for a in sorted(apis)))
        out.append('\n## Qoidalar\n\n- Fayl nomi oʻzgartirilmaydi (yigʻilgan ilovadagi belgilar shu nomga bogʻlangan).\n'
                   '- Yangi fayl — shu papkaga va `TARTIB.json` dagi `mod` roʻyxatining oxiriga.\n'
                   '- Mavjud funksiyani oʻzgartirish — `agmkExtend` bilan oʻrash orqali.\n')
        open(os.path.join(d, 'README.md'), 'w', encoding='utf8').write('\n'.join(out))
    print('README lar yangilandi')


if __name__ == '__main__':
    main()
