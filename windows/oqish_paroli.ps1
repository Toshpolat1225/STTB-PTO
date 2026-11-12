# AGMK-STTB 4.2 -- IT / auditor uchun FAQAT O'QISH huquqli baza foydalanuvchisi (agmk_oqish).
# U faqat 'oqish' sxemasini ko'radi: parol, imzo rasmi, oylik, shaxsiy ma'lumot (hr_pd) va GPS izlari YO'Q.
# Parol ekranda ko'rinmaydi, hech qayerga yozilmaydi. Eslatma: matnlar faqat lotin harflarida (PowerShell 5).
$ErrorActionPreference = 'Stop'
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root
function Plain($s) { $b = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($s); try { [Runtime.InteropServices.Marshal]::PtrToStringBSTR($b) } finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($b) } }
function Psql($sql) { $sql | docker compose exec -T db psql -U agmk -d agmk -v ON_ERROR_STOP=1 -q 2>&1 | Out-Host; return $LASTEXITCODE }

Write-Host "==== agmk_oqish -- faqat o'qish huquqli foydalanuvchi ====" -ForegroundColor Green
Write-Host "1 - parol qo'yish yoki almashtirish (kirish yoqiladi)"
Write-Host "2 - kirishni o'chirish (agmk_oqish bilan endi ulanib bo'lmaydi)"
$m = Read-Host "Tanlang (1 yoki 2)"
if ($m -eq '2') {
    if ((Psql 'ALTER ROLE agmk_oqish NOLOGIN PASSWORD NULL;') -eq 0) { Write-Host "Kirish o'chirildi." -ForegroundColor Green } else { Write-Host "Bajarilmadi -- server ishlayaptimi?" -ForegroundColor Red }
    Read-Host "Yopish uchun Enter"; exit
}
Write-Host "Parol: kamida 12 belgi, faqat lotin harflari, raqamlar, - va _ (masalan: Oqish-2026-Audit)." -ForegroundColor Yellow
$p1 = Plain (Read-Host "Yangi parol" -AsSecureString)
$p2 = Plain (Read-Host "Yana bir marta" -AsSecureString)
if ($p1 -ne $p2) { Write-Host "Parollar mos emas -- hech narsa o'zgarmadi." -ForegroundColor Red; Read-Host "Yopish uchun Enter"; exit 1 }
if ($p1 -notmatch '^[A-Za-z0-9_-]{12,64}$') { Write-Host "Parol talabga mos emas -- hech narsa o'zgarmadi." -ForegroundColor Red; Read-Host "Yopish uchun Enter"; exit 1 }
$code = Psql ("ALTER ROLE agmk_oqish LOGIN PASSWORD '" + $p1 + "';")
$p1 = $null; $p2 = $null
if ($code -ne 0) { Write-Host "Bajarilmadi -- server ishlayaptimi? (4.2 versiya o'rnatilganmi?)" -ForegroundColor Red; Read-Host "Yopish uchun Enter"; exit 1 }
Write-Host ""
Write-Host "Tayyor. DBeaver da yangi ulanish:" -ForegroundColor Green
Write-Host "  Host 127.0.0.1 . Port 5432 . Baza agmk . Foydalanuvchi agmk_oqish . parol -- hozir qo'ygan parolingiz"
Write-Host "  Jadvallar: agmk -> Sxemalar -> oqish (ko'rinishlar). Jurnal butunligi: SELECT * FROM oqish.zanjir_tekshir();"
Read-Host "Yopish uchun Enter"
