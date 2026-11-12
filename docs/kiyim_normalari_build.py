# Maxsus kiyim normalari (loyiha) — 3.18 uchun. Manba: OʻzR 3617-son (14.04.2025) namunaviy normalari + xalqaro standartlar.
# Chiqish: kiyim_normalari.json (repo uchun, shaxsiy maʼlumotsiz)
import json, re, sys
OUT = sys.argv[1]
LAV = json.load(open(sys.argv[2])) if len(sys.argv) > 2 else []

# ---- 1) Buyumlar katalogi: kod, nomi, turi, standart ----
KAT = [
    ('kostum',    'Yozgi ish kostumi (ip gazlama, spets odejda)', 'kiyim',   'EN ISO 13688; GOST 12.4.280'),
    ('kombinezon','Ish kombinezoni (ip gazlama)',                 'kiyim',   'EN ISO 13688'),
    ('brezent',   'Brezent kostum (uchqun va eritmadan himoya)',  'kiyim',   'EN ISO 11611 (payvand); EN ISO 11612'),
    ('elkostum',  'Elektrik kostumi (antistatik, yoyga chidamli)','kiyim',   'EN 1149-5; IEC 61482-2'),
    ('kislkostum','Kislota-ishqordan himoya kostumi',             'kiyim',   'EN 13034'),
    ('xalat',     'Ip gazlama xalat',                             'kiyim',   'EN ISO 13688'),
    ('fartuk',    'Rezina (suv/kislota oʻtkazmaydigan) fartuk',   'kiyim',   'EN 14605'),
    ('jilet',     'Otrajeniyali signal nimcha (jilet)',           'signal',  'EN ISO 20471, 2-sinf; GOST 12.4.281'),
    ('plash',     'Kapishonli suv oʻtkazmaydigan plash',          'kiyim',   'EN 343'),
    ('kurtka_q',  'Qishki issiq kurtka (kofayka)',                'qishki',  'EN 342; GOST 12.4.303'),
    ('shim_q',    'Qishki qalin issiq shim',                      'qishki',  'EN 342; GOST 12.4.303'),
    ('ichki_q',   'Issiq ichki kiyim',                            'qishki',  'EN ISO 13688'),
    ('botinka',   'Maxsus charm botinka (metall burunli, neftbardosh taglik)', 'poyabzal', 'EN ISO 20345 S3; GOST 12.4.137'),
    ('etik',      'Kirza / yufta etik',                           'poyabzal','EN ISO 20345'),
    ('rezetik',   'Rezina etik',                                  'poyabzal','EN ISO 20345 S5'),
    ('etik_q',    'Qishki issiq etik / botinka',                  'qishki',  'EN ISO 20345 CI'),
    ('kaska',     'Himoya kaskasi (qishda — issiq podshlemnik bilan)', 'bosh', 'EN 397; GOST 12.4.128'),
    ('kepka',     'Yozgi bosh kiyim (kepka)',                     'bosh',    '—'),
    ('qolqop',    'Kombinatsiyalangan ish qoʻlqopi',              'qoʻl',    'EN 388'),
    ('qolqop_br', 'Brezent / payvandchi qoʻlqopi',                'qoʻl',    'EN 12477; EN 388'),
    ('qolqop_ki', 'Kislota-ishqorbardosh qoʻlqop',                'qoʻl',    'EN ISO 374'),
    ('dielqolqop','Dielektrik qoʻlqop',                           'elektr',  'IEC 60903; EN 60903'),
    ('dielgalosh','Dielektrik galosh / gilamcha',                 'elektr',  'IEC 61111; GOST 13385'),
    ('kozoynak',  'Himoya koʻzoynagi',                            'yuz',     'EN 166'),
    ('niqob',     'Payvandchi niqobi (shchitok)',                 'yuz',     'EN 175; EN 379'),
    ('respirator','Respirator (chang/aerozol)',                   'nafas',   'EN 149 FFP2'),
    ('protivogaz','Shlangli protivogaz',                          'nafas',   'EN 138'),
    ('quloqchin', 'Quloqchin yoki quloq tiqini (shovqindan)',     'quloq',   'EN 352'),
    ('belbog',    'Himoya belbogʻi (balandlikda ishlash)',        'balandlik','EN 361; EN 358'),
]
KATD = {k[0]: k for k in KAT}

# ---- 2) Normalar guruhlari ----
# satr: (buyum, oy (0 = yaroqsiz boʻlguncha), soni, mavsum 'yil'/'qish', shart (None/'karyer'/'elektrovoz'/...), navbatchi, manba)
D = 'OʻzR 3617'   # davlat namunaviy normasi
K = 'korxona taklifi'  # xalqaro amaliyot asosida qoʻshimcha (davlat normasidan yaxshi tomonga)
def r(b, oy, manba, soni=1, mavsum='yil', shart=None, navb=False): return dict(b=b, oy=oy, soni=soni, mavsum=mavsum, shart=shart, navb=navb, manba=manba)
KARYER = [r('kaska', 24, K, shart='karyer'), r('respirator', 0, K, shart='karyer')]   # razrez/karyer hududida hamma uchun

G = [
 dict(id='lok', nom='Lokomotiv brigadasi (elektrovoz, teplovoz mashinisti va yordamchisi)', band='3617, 20-band', qator=[
    r('kostum',12,D), r('kombinezon',12,D), r('qolqop',1,D), r('kozoynak',0,D), r('botinka',12,D),
    r('dielqolqop',0,D,soni=2,shart='elektrovoz',navb=True), r('dielgalosh',0,D,soni=2,shart='elektrovoz',navb=True), r('jilet',6,D),
    r('kurtka_q',36,D,mavsum='qish'), r('etik_q',12,D,mavsum='qish'), r('shim_q',36,K,mavsum='qish'), *KARYER]),
 dict(id='drez', nom='Drezina, avtomotrisa haydovchisi / mashinisti va yordamchisi', band='3617, 151-band', qator=[
    r('kostum',12,D), r('qolqop',2,D), r('kepka',12,D), r('kozoynak',0,D), r('botinka',12,K), r('jilet',6,K),
    r('kurtka_q',36,D,mavsum='qish'), r('etik_q',12,D,mavsum='qish'), r('shim_q',36,K,mavsum='qish'), *KARYER]),
 dict(id='tamir', nom='Harakat tarkibi va lokomotivlarni taʼmirlash / koʻzdan kechirish chilangarlari', band='3617, 17-band', qator=[
    r('kostum',12,K), r('botinka',12,K), r('qolqop',1,K), r('kozoynak',0,K), r('kaska',0,D), r('respirator',0,D),
    r('kislkostum',18,D,shart='TXP'), r('fartuk',12,D,shart='TXP'), r('jilet',6,K),
    r('kurtka_q',36,D,mavsum='qish'), r('etik_q',24,D,mavsum='qish'), r('shim_q',36,K,mavsum='qish')]),
 dict(id='vagon', nom='Vagonlarni koʻzdan kechirish chilangari', band='3617, 11-band', qator=[
    r('brezent',9,D), r('kostum',12,D), r('etik',6,D), r('qolqop_br',1,D), r('belbog',0,D), r('protivogaz',0,D,navb=True),
    r('jilet',6,K), r('kaska',24,K), r('kurtka_q',36,D,mavsum='qish'), r('shim_q',36,K,mavsum='qish'), r('etik_q',24,K,mavsum='qish')]),
 dict(id='yol', nom='Temir yoʻl ishchisi, temir yoʻl montyori, sunʼiy inshootlar kuzatuvchisi', band='3617, 5- va 28-band', qator=[
    r('kostum',18,D), r('plash',36,D), r('kepka',24,D), r('botinka',24,D), r('jilet',6,D), r('qolqop',1,D),
    r('kurtka_q',36,D,mavsum='qish'), r('etik_q',24,D,mavsum='qish'), r('shim_q',36,K,mavsum='qish'), *KARYER]),
 dict(id='tuz', nom='Poyezdlar tuzuvchi', band='3617, 7-band', qator=[
    r('plash',12,D), r('kostum',24,D), r('kepka',6,D), r('jilet',6,D), r('qolqop',2,D), r('botinka',12,D),
    r('kurtka_q',36,D,mavsum='qish'), r('etik_q',12,D,mavsum='qish'), r('shim_q',36,K,mavsum='qish'), *KARYER]),
 dict(id='stan', nom='Stansiya navbatchisi', band='3617, 1-band', qator=[
    r('plash',36,D,navb=True), r('jilet',6,D), r('qolqop',3,D), r('botinka',24,D),
    r('kurtka_q',36,K,mavsum='qish'), r('shim_q',36,K,mavsum='qish')]),
 dict(id='pereezd', nom='Pereezd navbatchisi', band='3617, 29-band', qator=[
    r('kostum',12,D), r('plash',36,D), r('botinka',24,D), r('qolqop',3,D), r('jilet',6,D),
    r('kurtka_q',36,D,mavsum='qish'), r('shim_q',36,K,mavsum='qish'), r('etik_q',36,K,mavsum='qish')]),
 dict(id='post', nom='Markazlashtirish posti, boshqaruv pulti operatori', band='3617, 66-band', qator=[
    r('kostum',12,D), r('botinka',12,D), r('qolqop',1,D), r('jilet',6,D), r('kurtka_q',36,D,mavsum='qish')]),
 dict(id='payvand', nom='Elektr-gaz payvandchi', band='3617, 31- va 125-band', qator=[
    r('brezent',12,D), r('qolqop_br',1,D), r('botinka',12,D), r('kozoynak',0,D), r('kaska',0,D,navb=True), r('dielqolqop',0,D,navb=True),
    r('niqob',0,K), r('respirator',0,K),
    r('kurtka_q',36,D,mavsum='qish'), r('etik_q',36,D,mavsum='qish'), r('ichki_q',12,D,mavsum='qish'), r('shim_q',36,K,mavsum='qish')]),
 dict(id='smb', nom='SMB va elektr jihozlari elektromontyorlari, elektromexaniklar, sozlovchilar', band='3617, 43- va 49-band', qator=[
    r('elkostum',12,D), r('plash',0,D), r('botinka',12,D), r('qolqop_br',1,D), r('kepka',12,D), r('qolqop_ki',6,D), r('kaska',24,D),
    r('fartuk',24,D), r('dielqolqop',0,D,navb=True), r('dielgalosh',0,D,navb=True), r('jilet',6,K),
    r('kurtka_q',36,D,mavsum='qish'), r('rezetik',0,D,soni=2,mavsum='qish',navb=True), r('shim_q',36,K,mavsum='qish')]),
 dict(id='kontakt', nom='Kontakt tarmogʻi va havo elektr uzatish liniyalari elektromontyorlari', band='3617, 40-band', qator=[
    r('elkostum',12,D), r('plash',36,D), r('jilet',12,D), r('kepka',12,D), r('botinka',24,D), r('kaska',0,D),
    r('belbog',0,K), r('dielqolqop',0,K,navb=True), r('qolqop',1,K),
    r('kurtka_q',36,D,mavsum='qish'), r('shim_q',36,K,mavsum='qish'), r('etik_q',24,K,mavsum='qish')]),
 dict(id='kran', nom='Kran mashinistlari (kozlovoy, avtokran, avtovishka)', band='3617, 75-band', qator=[
    r('kostum',12,D), r('botinka',12,D), r('qolqop',3,D), r('kaska',24,K), r('jilet',6,K),
    r('kurtka_q',36,D,mavsum='qish'), r('etik_q',24,D,mavsum='qish'), r('shim_q',36,K,mavsum='qish')]),
 dict(id='yuk', nom='Stropalchi, yuk tashuvchi, yuk qabul qiluvchi-topshiruvchi', band='3617, 60-band (oʻxshash)', qator=[
    r('kostum',12,D), r('botinka',12,D), r('plash',36,D), r('qolqop',1,K), r('kaska',24,K), r('jilet',6,K),
    r('kurtka_q',36,D,mavsum='qish'), r('etik_q',24,D,mavsum='qish'), r('shim_q',36,K,mavsum='qish')]),
 dict(id='stanok', nom='Tokar, frezalovchi, randalovchi, temirchi, asbobsoz va sex chilangarlari', band='3617, 27- va 108-band', qator=[
    r('kostum',12,D), r('botinka',12,D), r('qolqop_br',1,D), r('kozoynak',0,D), r('kaska',0,D),
    r('quloqchin',0,K,shart='shovqin'), r('fartuk',12,K,shart='temirchi'),
    r('kurtka_q',36,D,mavsum='qish'), r('etik_q',36,D,mavsum='qish')]),
 dict(id='mash', nom='Yoʻl, togʻ-kon va qurilish mashinalari mashinistlari, konveyer, kompressor, qozonxona', band='davlat normasida alohida yoʻq — korxona taklifi', qator=[
    r('kostum',12,K), r('botinka',12,K), r('qolqop',1,K), r('kaska',24,K), r('quloqchin',0,K), r('respirator',0,K), r('kozoynak',0,K), r('jilet',6,K),
    r('kurtka_q',36,K,mavsum='qish'), r('shim_q',36,K,mavsum='qish'), r('etik_q',24,K,mavsum='qish')]),
 dict(id='haydov', nom='Avtomobil, avtobus, samosval haydovchilari, traktorchi', band='3617, 152-band', qator=[
    r('kombinezon',12,D), r('botinka',12,D), r('qolqop',2,D), r('jilet',6,K),
    r('kurtka_q',36,D,mavsum='qish'), *KARYER]),
 dict(id='qoriq', nom='Qoʻriqchilar (binolar, temir yoʻl inshootlari)', band='davlat normasida yoʻq — korxona taklifi', qator=[
    r('kostum',12,K), r('plash',36,K), r('botinka',24,K), r('jilet',6,K),
    r('kurtka_q',36,K,mavsum='qish'), r('shim_q',36,K,mavsum='qish'), r('etik_q',36,K,mavsum='qish')]),
 dict(id='tozal', nom='Farrosh, hudud tozalovchisi, bogʻbon, yuvuvchi-tozalovchi, hammom ishchisi', band='3617, 156-band', qator=[
    r('kostum',12,D), r('fartuk',12,D), r('qolqop',1,D), r('plash',36,D), r('rezetik',12,K,shart='nam ish'),
    r('kurtka_q',36,D,mavsum='qish')]),
 dict(id='ombor', nom='Omborchilar', band='3617, 70-band', qator=[
    r('xalat',12,D), r('qolqop',3,D), r('kurtka_q',36,D,mavsum='qish'),
    r('respirator',0,K,shart='kimyoviy ombor'), r('kozoynak',0,K,shart='kimyoviy ombor'), r('qolqop_ki',6,K,shart='kimyoviy ombor')]),
 dict(id='qurilish', nom='Qurilish va taʼmirlash ishchilari (duradgor, suvoqchi, montajchi, plitkachi, gaz uskunalari)', band='korxona taklifi', qator=[
    r('kostum',12,K), r('botinka',12,K), r('qolqop',1,K), r('kaska',24,K), r('kozoynak',0,K), r('respirator',0,K,shart='chang/gaz'),
    r('kurtka_q',36,K,mavsum='qish'), r('shim_q',36,K,mavsum='qish')]),
 dict(id='akkum', nom='Akkumulyatorchi, izolyatsiyalovchi, laborant', band='3617, 17- va 43-band (oʻxshash)', qator=[
    r('kislkostum',12,D), r('fartuk',12,D), r('rezetik',12,K), r('qolqop_ki',6,D), r('kozoynak',0,K), r('respirator',0,D)]),
 dict(id='usta', nom='Ustalar va yoʻlga chiquvchi muhandis-texnik xodimlar (usta, yoʻl ustasi, revizor, defektoskopchi, marksheyder, yoʻriqchi mashinist)', band='3617, 60-band', qator=[
    r('kostum',12,D), r('plash',36,D), r('botinka',12,D), r('jilet',6,K), r('kaska',24,K), r('qolqop',3,K),
    r('kurtka_q',36,D,mavsum='qish'), r('etik_q',24,D,mavsum='qish'), r('shim_q',36,K,mavsum='qish')]),
 dict(id='ofis', nom='Operatorlar va idora xodimlari (buxgalter, iqtisodchi, dispetcher, operator va b.)', band='doimiy berilmaydi', qator=[
    r('jilet',0,K,navb=True), r('kaska',0,K,navb=True), r('botinka',0,K,navb=True)]),
]

# ---- 3) Lavozim → guruh (tartib muhim: birinchi mos kelgani olinadi) ----
MAP = [
 ('akkum',   r'akkumulyator|izolyatsiyalovchi|laborant'),
 ('payvand', r'payvand'),
 ('lok',     r'(elektrovoz|teplovoz|lokomotiv brigadasi uchun yo).*mashinist|(elektrovoz|teplovoz) mashinist'),
 ('drez',    r'drezina|avtomotris'),
 ('ofis',    r'boshqarma boshlig|bo.lim boshlig|umumiy masalalar|yoshlar|tovar-moddiy|logistika|kapital qurilish|naryadchi'),
 ('usta',    r'\busta\b|ustasi|revizor|defektoskop|marksheyder|o.lchovchi|boshlig|o.rinbosar|^energetik$|bosh energetik|^mexanik$|^bosh mexanik|nazoratchisi'),
 ('post',    r'markazlashtirish posti|boshqaruv pulti'),
 ('ofis',    r'muhandis|inspektor|iqtisodchi|buxgalter|yuriskonsult|dispetcher|kassir|taftishchi|mutaxassis|operatori|dasturlovchi'),
 ('kontakt', r'kontakt tarmog|havo elektr uzatish|elektruzatish'),
 ('kran',    r'kran|avtovishka|gidro ko'),
 ('vagon',   r'vagonlarni ko.zdan'),
 ('tamir',   r'harakat tarkibini|lokomotivlarni ko.zdan|chilangar-elektrik|yoqilg.i apparatura|yo.l mashinalari va mexanizmlarini ta.mirlovchi|ortish-tushirish mashinalariga'),
 ('tuz',     r'poyezdlar tuzuvchi'),
 ('pereezd', r'pere(e|ye)zd'),
 ('stan',    r'stansiyasi bo.yicha navbatchi|ish taqsimlovchi'),
 ('smb',     r'elektromontyor|elektromexani|sozlovchi|elektr dastgohlar|elektrik dastgohi|elektr-chilangar|sanash-hisoblash'),
 ('yol',     r'temir yo.l ishchisi|temir yo.l montyori|sun.iy inshoot'),
 ('stanok',  r'tokar|frezalovchi|randalovchi|temirchi|asbobsoz|chilangar'),
 ('mash',    r'ekskavator|buldozer|ortish mashinasi|konveyer|bunkerlovchi|maydalovchi|g.alvirlovchi|kompressor|qozonxona|rixtovka|yotqizuvchi|strelkali|shaylovchi|traktor'),
 ('haydov',  r'haydovchi'),
 ('yuk',     r'stropal|yuk tashuvchi|qabul qiluvchi-topshiruvchi'),
 ('qoriq',   r'qo.riqchi'),
 ('tozal',   r'farrosh|tozalovchi|bog.bon|yuvuvchi|hammom|baliqshunos'),
 ('ombor',   r'omborchi'),
 ('qurilish',r'duradgor|suvoqchi|montajchi|plitkachi|gaz uskunalari|badiiy-bezak'),
 ('ofis',    r'.'),
]
SHART = [('karyer', r'razrez|karyer|karer|okolotka'), ('elektrovoz', r'elektrovoz'), ('shovqin', r'temirchi|tokar|frezalovchi|randalovchi'), ('temirchi', r'temirchi')]

def guruh(lav):
    s = lav.lower().replace('ʻ', "'").replace('ʼ', "'").replace('‘', "'").replace('’', "'")
    for g, rx in MAP:
        if re.search(rx, s): return g
def shartlar(lav):
    s = lav.lower()
    return [k for k, rx in SHART if re.search(rx, s)]

QOIDA = [
 'Foydalanish muddati buyum xodimga berilgan kundan boshlab hisoblanadi.',
 'Qishki buyumlar (kurtka, shim, issiq etik) qish mavsumidan oldin — 15-oktyabrgacha beriladi; yozda ham muddat hisoblanaveradi.',
 '«Yaroqsiz boʻlguncha» belgili buyumlar muddatsiz: eskirsa yoki shikastlansa dalolatnoma bilan almashtiriladi.',
 '«Navbatchi» buyumlar xodimga emas, ish joyiga (lokomotiv, post, smena) biriktiriladi va smenadan smenaga topshiriladi.',
 'Har bir berish shaxsiy kartochkaga yoziladi: sana, buyum, oʻlcham, soni, standart/sertifikat, beruvchi va oluvchi tasdigʻi.',
 'Muddatidan oldin ish jarayonida yaroqsiz boʻlsa — dalolatnoma asosida bepul almashtiriladi.',
 'Boshqa lavozimga oʻtganda yangi lavozim normasi qoʻllanadi; ishdan boʻshaganda muddati tugamagan buyumlar korxona tartibiga koʻra qaytariladi.',
 'Har bir xodimning oʻlchamlari saqlanadi: boʻyi, kiyim oʻlchami, poyabzal oʻlchami, bosh oʻlchami.',
 'Barcha buyumlar sertifikatlangan boʻlishi kerak; korxona normasi davlat namunaviy normasidan kam boʻlmasligi, faqat yaxshi tomonga farq qilishi mumkin.',
 'Muddat tugashidan 30 kun oldin ilova xodim, uning rahbari va omborga eslatadi.',
]

res = dict(versiya='loyiha 14.10.2026', manba=['OʻzR Kambagʻallikni qisqartirish va bandlik vazirligi buyrugʻi, AV 3617-son, 14.04.2025 — temir yoʻl transporti xodimlari uchun namunaviy normalar',
                                              'Xalqaro standartlar: EN ISO 20471, EN 342, EN 343, EN ISO 20345, EN 397, EN 388, IEC 60903, EN ISO 11611, EN 166, EN 149, EN 352, EN 361'],
           katalog=[dict(kod=k[0], nom=k[1], tur=k[2], standart=k[3]) for k in KAT], guruhlar=G, qoidalar=QOIDA,
           moslash=[dict(guruh=g, regex=rx) for g, rx in MAP], shartlar=[dict(shart=k, regex=rx) for k, rx in SHART])
for g in G:
    for q in g['qator']: assert q['b'] in KATD, q['b']
if LAV:
    res['lavozimlar'] = {l: dict(guruh=guruh(l), shart=shartlar(l)) for l in LAV}
json.dump(res, open(OUT, 'w'), ensure_ascii=False, indent=1)
print('ok', len(G), 'guruh', len(KAT), 'buyum')
