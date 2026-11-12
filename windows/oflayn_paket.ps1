# AGMK-STTB -- OFLAYN O'RNATISH PAKETINI tayyorlash (muallif kompyuterida, server yig'ilgandan keyin).
# Natija: _oflayn\AGMK-STTB-<versiya>\  -- shu papkani IT ga bering: internetsiz o'rnatiladi (OFLAYN_ORNATISH.bat yoki oflayn_ornatish.sh).
# Ichida: tayyor Docker obrazlari (obrazlar.tar), docker-compose.yml, shlyuz sozlamasi, o'rnatish skriptlari, yo'riqnoma, SHA256 nazorat summalari.
# .env (kalitlar), baza va zaxiralar paketga KIRMAYDI. company\ (xodimlar ro'yxati) -- faqat so'ralganda (HA), chunki maxfiy.
# Eslatma: matnlar faqat lotin harflarida (Windows PowerShell 5 kodirovkasi uchun).
# Savolsiz: -Company yoq (company qo'shilmaydi) yoki -Company HA; -Ustidan HA (bor papka ustidan yoziladi).
param([string]$Company = '', [string]$Ustidan = '')

$ErrorActionPreference = 'Stop'
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root
$Log = Join-Path $Root 'JURNAL.txt'
function Say($t, $c = 'White') { Write-Host $t -ForegroundColor $c; Add-Content -Path $Log -Encoding UTF8 -Value ("[" + (Get-Date -Format 'HH:mm:ss') + "] " + $t) }
function Fail($t) { Say ""; Say "XATO: $t" 'Red'; Say "Shu oynani rasmga olib (yoki JURNAL.txt faylini) Claude ga yuboring." 'Yellow'; Read-Host "Yopish uchun Enter"; exit 1 }
function Run($what, [scriptblock]$cmd) {
    Say ">> $what" 'Cyan'
    $old = $ErrorActionPreference; $ErrorActionPreference = 'Continue'
    $out = & $cmd 2>&1 | ForEach-Object { $_.ToString() }
    $code = $LASTEXITCODE; $ErrorActionPreference = $old
    if ($out) { $out | Out-Host; Add-Content -Path $Log -Encoding UTF8 -Value $out }
    if ($code -ne 0) { Fail "$what bajarilmadi (kod $code)" }
}

Say "==== AGMK-STTB oflayn paket tayyorlash ====" 'Green'
try { $v = (docker version --format '{{.Server.Version}}' 2>$null) } catch { $v = '' }
if (-not $v) { Fail "Docker ishlamayapti. Docker Desktop ni oching va 'Engine running' bo'lishini kuting." }

$ver = (Get-Content (Join-Path $Root 'frontend\package.json') -Raw | ConvertFrom-Json) | ForEach-Object { if ($_.agmkVersion) { $_.agmkVersion } else { $_.version } }
if (-not $ver) { Fail "Versiya topilmadi (frontend\package.json)" }
$imgB = "agmk-sttb/backend:$ver"
$imgs = @($imgB, 'postgres:16-alpine', 'nginx:1.27-alpine')

# 1) Server obrazi yig'ilganmi va versiyasi to'g'rimi
$have = (docker image ls --format '{{.Repository}}:{{.Tag}}' 2>$null)
if ($have -notcontains 'agmk-sttb/backend:local') { Fail "Server obrazi yo'q. Avval 'SERVERNI YOQISH' ni bosing (server yig'iladi), keyin shu faylni qayta ishga tushiring." }
Run "Server obraziga versiya yorlig'i: $ver" { docker image tag agmk-sttb/backend:local $imgB }
foreach ($i in $imgs) { if ((docker image ls --format '{{.Repository}}:{{.Tag}}' 2>$null) -notcontains $i) { Fail "Obraz topilmadi: $i (avval 'SERVERNI YOQISH' ni bosing)" } }

# 2) Papka
$Out = Join-Path $Root "_oflayn\AGMK-STTB-$ver"
if (Test-Path $Out) {
    $a = if ($Ustidan) { $Ustidan } else { Read-Host "Papka bor: $Out -- ustidan yozilsinmi? HA deb yozing" }
    if ($a.Trim().ToUpper() -ne 'HA') { Fail "To'xtatildi. Hech narsa o'zgarmadi." }
    Remove-Item -Recurse -Force (Join-Path $Out '*')
}
New-Item -ItemType Directory -Force -Path $Out, (Join-Path $Out 'gateway'), (Join-Path $Out 'windows'), (Join-Path $Out 'company'), (Join-Path $Out 'backups') | Out-Null

# 3) Obrazlar -- bitta faylga (5-10 daqiqa, ~1 GB)
Run "Obrazlar saqlanmoqda: $($imgs -join ', ')" { docker save -o (Join-Path $Out 'obrazlar.tar') $imgs }

# 4) Fayllar
Copy-Item (Join-Path $Root 'docker-compose.yml') $Out
Copy-Item (Join-Path $Root 'gateway\nginx.conf') (Join-Path $Out 'gateway')
Copy-Item (Join-Path $Root 'windows\oflayn_ornatish.ps1') (Join-Path $Out 'windows')
foreach ($f in 'OFLAYN_ORNATISH.bat', 'oflayn_ornatish.sh', 'HOLAT.bat', 'TOXTATISH.bat', '.env.example') { Copy-Item (Join-Path $Root $f) $Out }
Copy-Item (Join-Path $Root 'docs\OFLAYN_ORNATISH.md') (Join-Path $Out 'OQING_OFLAYN_ORNATISH.md')
Copy-Item (Join-Path $Root 'docs\IT_QOLLANMA.md') $Out
Set-Content -Path (Join-Path $Out 'VERSIYA.txt') -Encoding ASCII -Value @("AGMK_VERSION=$ver", "AGMK_IMAGE_TAG=$ver", ("TAYYORLANDI=" + (Get-Date -Format 'yyyy-MM-dd HH:mm')), ("OBRAZLAR=" + ($imgs -join ' ')))

# 5) company\ -- maxfiy (xodimlar ro'yxati). Faqat IT serveriga o'rnatish uchun, muallif ruxsati bilan
Say ""
Say "company papkasi (xodimlar ro'yxati, kirish kodlari) MAXFIY." 'Yellow'
Say "Paketni IT serveriga o'rnatish uchun berayotgan bo'lsangiz -- qo'shish kerak. Sinov yoki ko'rib chiqish uchun -- qo'shmang." 'Yellow'
$a = if ($Company) { $Company } else { Read-Host "company papkasi paketga qo'shilsinmi? HA / yo'q" }
if ($a.Trim().ToUpper() -eq 'HA') {
    Copy-Item -Recurse -Force (Join-Path $Root 'company\*') (Join-Path $Out 'company')
    Say "company qo'shildi (MAXFIY -- paketni faqat IT mas'uliga, qo'lma-qo'l bering)" 'Yellow'
} else { Say "company qo'shilmadi (bo'sh papka). O'rnatgandan keyin company\ ichiga xodimlar.json va paketlar\ qo'yiladi." 'Green' }

# 6) Nazorat summalari
Say ">> SHA256 nazorat summalari" 'Cyan'
$sums = Get-ChildItem -Path $Out -Recurse -File | Where-Object { $_.Name -ne 'SHA256SUMS.txt' } | ForEach-Object {
    $rel = $_.FullName.Substring($Out.Length + 1).Replace('\', '/')
    (Get-FileHash -Algorithm SHA256 -Path $_.FullName).Hash.ToLower() + '  ' + $rel
}
Set-Content -Path (Join-Path $Out 'SHA256SUMS.txt') -Encoding ASCII -Value $sums

$mb = [math]::Round(((Get-ChildItem -Path $Out -Recurse -File | Measure-Object -Property Length -Sum).Sum) / 1MB)
Say ""
Say "==== TAYYOR ====" 'Green'
Say "Paket: $Out  ($mb MB)" 'Green'
Say "Ichida OQING_OFLAYN_ORNATISH.md -- IT uchun yo'riqnoma." 'Green'
Start-Process explorer.exe $Out
Read-Host "Yopish uchun Enter"
