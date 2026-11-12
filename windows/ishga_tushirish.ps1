# AGMK-STTB -- Windows kompyuterda bitta tugma bilan ishga tushirish (Docker Desktop kerak).
# Birinchi marta: sozlamalar (.env, barcha kalitlar shu yerda) yaratiladi, dastur yig'iladi, server ishga tushadi.
# Keyingi safar: shunchaki ishga tushiradi. Korxona fayllari: shu papkadagi company\ (xodimlar.json, paketlar\).
# Eslatma: matnlar faqat lotin harflarida (Windows PowerShell 5 kodirovkasi uchun).

$ErrorActionPreference = 'Stop'
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root
$Log = Join-Path $Root 'JURNAL.txt'
# 3.19.4: eski aralash kodlashli (UTF-16 + ANSI) jurnal bir marta alohida faylga olinadi
try { if ((Test-Path $Log) -and ([IO.File]::ReadAllBytes($Log) -contains 0)) { Move-Item -Force $Log (Join-Path $Root ('JURNAL_eski_' + (Get-Date -Format 'yyyyMMdd') + '.txt')) } } catch { }
function Say($t, $c = 'White') { Write-Host $t -ForegroundColor $c; Add-Content -Path $Log -Encoding UTF8 -Value ("[" + (Get-Date -Format 'HH:mm:ss') + "] " + $t) }
function Fail($t) { Say ""; Say "XATO: $t" 'Red'; Say "Shu oynani rasmga olib (yoki JURNAL.txt faylini) Claude ga yuboring." 'Yellow'; Read-Host "Yopish uchun Enter"; exit 1 }
function Run($what, [scriptblock]$cmd) {
    Say ">> $what" 'Cyan'
    $old = $ErrorActionPreference; $ErrorActionPreference = 'Continue'   # docker jarayon xabarlarini stderr ga yozadi -- bu xato emas
    # 3.19.4: JURNAL bitta kodlashda (UTF-8) -- avval Tee-Object UTF-16 yozib, matn aralashib ketardi
    $out = & $cmd 2>&1 | ForEach-Object { $_.ToString() }
    $code = $LASTEXITCODE; $ErrorActionPreference = $old
    if ($out) { $out | Out-Host; Add-Content -Path $Log -Encoding UTF8 -Value $out }
    if ($code -ne 0) { Fail "$what bajarilmadi (kod $code)" }
}
function Rnd($n) { $b = New-Object byte[] $n; [System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($b); return (($b | ForEach-Object { $_.ToString('x2') }) -join '') }

Say "==== AGMK-STTB ishga tushirish ====" 'Green'

# 1) Docker ishlayaptimi
try { $v = (docker version --format '{{.Server.Version}}' 2>$null) } catch { $v = '' }
# 4.9 b118: Docker Desktop kompyuter yoqilganda o'zi ishga tushmaydi -- kerak bo'lsa shu yerda ochiladi va kutiladi
if (-not $v) {
    $dd = @((Join-Path $env:LOCALAPPDATA 'Programs\DockerDesktop\Docker Desktop.exe'), (Join-Path $env:ProgramFiles 'Docker\Docker\Docker Desktop.exe')) | Where-Object { Test-Path $_ } | Select-Object -First 1
    if ($dd) {
        Say "Docker Desktop ochilyapti, tayyor bo'lishini kutyapman (3 daqiqagacha)..." 'Yellow'
        Start-Process -FilePath $dd
        for ($i = 0; $i -lt 36 -and -not $v; $i++) { Start-Sleep -Seconds 5; try { $v = (docker version --format '{{.Server.Version}}' 2>$null) } catch { $v = '' } }
    }
}
if (-not $v) { Fail "Docker ishlamayapti. Docker Desktop ni oching, pastki burchakda 'Engine running' (yashil) bo'lishini kuting va qayta bosing." }
Say "Docker ishlayapti (versiya $v)" 'Green'

# 2) Korxona fayllari (paket ichida keladi)
$Co = Join-Path $Root 'company'
if (-not ((Test-Path (Join-Path $Co 'xodimlar.json')) -and (Test-Path (Join-Path $Co 'paketlar')))) { Fail "company papkasi topilmadi yoki to'liq emas (xodimlar.json va paketlar kerak). Zip faylni to'liq oching." }
New-Item -ItemType Directory -Force -Path (Join-Path $Co 'imzo_yuklash'), (Join-Path $Root 'backups') | Out-Null
if (-not (Test-Path (Join-Path $Co 'ishchilar.json'))) { Say "Ogohlantirish: company\ishchilar.json yo'q -- 'Mening hodimlarim' bo'limida ishchilar chiqmaydi (faqat ITR)." 'Yellow' }

# 3) Sozlamalar (.env) -- barcha kalitlar shu yerda, faqat shu kompyuterda, repoga tushmaydi
$envF = Join-Path $Root '.env'
$ip = (Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue | Where-Object { $_.IPAddress -notlike '127.*' -and $_.IPAddress -notlike '169.254.*' -and $_.InterfaceAlias -notmatch 'vEthernet|WSL|Docker|VirtualBox|VMware|Loopback' } | Sort-Object -Property InterfaceMetric | Select-Object -First 1).IPAddress
if (-not $ip) { $ip = '127.0.0.1' }
$first = -not (Test-Path $envF)
if ($first) {
    @(
        "# AGMK-STTB sozlamalari (ishga_tushirish yaratdi). Bu faylni hech kimga bermang: ichida kalitlar bor."
        "AGMK_DB_PASSWORD=$(Rnd 24)"
        "AGMK_JWT_SECRET=$(Rnd 48)"
        "AGMK_ANON_KEY=agmk_$(Rnd 18)"
        "AGMK_PUBLIC_HOSTS=$ip"
        "AGMK_PUBLIC_PORT=8443"
        "AGMK_ADMIN_HOST_PORT=8080"
        "AGMK_ADMIN=2582"
        "AGMK_COMPANY_PATH=./company"
        "AGMK_BACKUP_PATH=./backups"
        "AGMK_BACKUP_KEEP=30"
        "AGMK_TRK_DAYS=90"
        "AGMK_OCR=1"
        "AGMK_LOG_LEVEL=info"
    ) | Set-Content -Path $envF -Encoding ASCII
    Say "Sozlamalar va kalitlar yaratildi (.env)" 'Green'
} else {
    # Noutbuk boshqa Wi-Fi ga o'tsa (uy -> ishxona), QR kodga yangi manzil tushishi uchun har safar yangilanadi
    $lines = Get-Content $envF
    if (($lines | Where-Object { $_ -like 'AGMK_PUBLIC_HOSTS=*' } | Select-Object -First 1) -ne "AGMK_PUBLIC_HOSTS=$ip") {
        $lines | ForEach-Object { if ($_ -like 'AGMK_PUBLIC_HOSTS=*') { "AGMK_PUBLIC_HOSTS=$ip" } else { $_ } } | Set-Content -Path $envF -Encoding ASCII
        Say "Tarmoq manzili yangilandi: $ip" 'Green'
    }
}

# 4) Birinchi marta: oldingi o'rnatishlardan qolgan ma'lumotlar (eski B) bo'lsa -- tozalab, yangidan boshlash
$mark = Join-Path $Root 'backups\.ornatildi'
if (-not (Test-Path $mark)) {
    $old = (docker volume ls --format '{{.Name}}' 2>$null) | Where-Object { $_ -like 'agmk-sttb_*' }
    if ($old) {
        Say ""
        Say "Kompyuterda oldingi o'rnatishdan qolgan ma'lumotlar topildi (eski sinov bazasi)." 'Yellow'
        Say "Yangi toza o'rnatish uchun ular o'chiriladi. Telefonlarda QR kodni qayta skanerlash kerak bo'ladi." 'Yellow'
        $a = Read-Host "Davom etish uchun HA deb yozing va Enter bosing"
        if ($a.Trim().ToUpper() -ne 'HA') { Fail "To'xtatildi. Hech narsa o'chirilmadi." }
        Run "Eski ma'lumotlar o'chirilmoqda" { docker compose down -v --remove-orphans }
    }
}

# 5) Portlar band emasmi (eski A server ishlab qolgan bo'lishi mumkin)
foreach ($p in 8443, 8080) {
    $c = Get-NetTCPConnection -LocalPort $p -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($c) { $pn = (Get-Process -Id $c.OwningProcess -ErrorAction SilentlyContinue).ProcessName
        if ($pn -and $pn -notmatch 'docker|com.docker|wslrelay|vpnkit') { Fail "$p-port band ($pn). Eski server (qora oyna) ochiq bo'lsa -- uni yoping va qayta bosing." } }
}

# 6) Yig'ish (birinchi marta 10-20 daqiqa, internet kerak)
Run "Dastur yig'ilmoqda (birinchi marta uzoq davom etadi, kuting...)" { docker compose build }
# Har versiya o'z yorlig'i bilan saqlanadi -- muammo bo'lsa oldingisiga qaytish mumkin (docs\OFLAYN_ORNATISH.md)
try { $ver = (Get-Content (Join-Path $Root 'frontend\package.json') -Raw | ConvertFrom-Json) | ForEach-Object { if ($_.agmkVersion) { $_.agmkVersion } else { $_.version } }; if ($ver) { docker image tag agmk-sttb/backend:local "agmk-sttb/backend:$ver" 2>$null | Out-Null; Say "Server obrazi: agmk-sttb/backend:$ver" 'Green' } } catch { }

# 7) Ishga tushirish
Run "Server ishga tushirilmoqda" { docker compose up -d }
Say "Server tayyor bo'lishini kutyapman (1-2 daqiqa)..." 'Cyan'
$ok = $false
for ($i = 0; $i -lt 60; $i++) {
    Start-Sleep -Seconds 3
    try { $r = Invoke-WebRequest -UseBasicParsing -Uri 'http://127.0.0.1:8080/' -TimeoutSec 3; if ($r.StatusCode -eq 200) { $ok = $true; break } } catch { }
}
if (-not $ok) { docker compose ps | Out-Host; $l = docker compose logs --tail 80 2>&1 | ForEach-Object { $_.ToString() }; $l | Out-Host; Add-Content -Path $Log -Encoding UTF8 -Value $l; Fail "Server 3 daqiqada ishga tushmadi" }
# 4.1: sertifikat yangilangan bo'lishi mumkin (ichki CA) -- shlyuz uni qayta o'qisin
# 4.2: docker jarayon xabarini (stderr) xato deb to'xtab qolmasin -- avval skript shu yerda TAYYOR gacha yetmasdi
$old = $ErrorActionPreference; $ErrorActionPreference = 'Continue'; docker compose restart gateway 2>&1 | Out-Null; $ErrorActionPreference = $old
Set-Content -Path $mark -Value (Get-Date -Format 'yyyy-MM-dd HH:mm') -Encoding ASCII

# 8) Rabochiy stolda yorliq (bir marta)
try {
    $lnk = Join-Path ([Environment]::GetFolderPath('Desktop')) 'AGMK-STTB.lnk'
    if (-not (Test-Path $lnk)) { $s = (New-Object -ComObject WScript.Shell).CreateShortcut($lnk); $s.TargetPath = (Join-Path $Root 'ISHGA_TUSHIRISH.bat'); $s.WorkingDirectory = $Root; $s.Save(); Say "Rabochiy stolda 'AGMK-STTB' yorlig'i yaratildi" 'Green' }
} catch { }

Say ""
Say "==== TAYYOR ====" 'Green'
Say "Boshqaruv paneli ochilyapti: http://127.0.0.1:8080  (QR kod shu yerda)" 'Green'
Say "Telefonda: 'AGMK-STTB PTO' ilovasini oching -> 'Serverga ulanish' -> paneldagi QR ni skanerlang." 'Green'
Start-Process 'http://127.0.0.1:8080'
Read-Host "Yopish uchun Enter (server ishlashda davom etadi)"
