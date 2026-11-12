# AGMK-STTB -- INTERNETSIZ o'rnatish va yangilash (Windows, Docker Desktop kerak). Paket ichidagi OFLAYN_ORNATISH.bat shu faylni ishga tushiradi.
#  Birinchi marta: obrazlar yuklanadi, .env (kalitlar) yaratiladi, server ishga tushadi.
#  Yangi versiya paketi bilan: shu papkadagi .env, company\ va backups\ ni yangi paket papkasiga ko'chiring (yoki yangi fayllarni
#  eski papka ustiga yozing) va qayta ishga tushiring -- obrazlar yangilanadi, baza saqlanadi.
#  Orqaga qaytish: .env dagi AGMK_IMAGE_TAG ni oldingi versiyaga qaytaring va qayta ishga tushiring (eski obraz Docker da qoladi).
#  "sinov" rejimi (OFLAYN_ORNATISH.bat sinov): alohida loyiha (agmk-sinov), portlar 9443/9080 -- ishlab turgan serverga tegmaydi.
#  Hech qachon "docker compose down -v" ishlatilmaydi.
# Eslatma: matnlar faqat lotin harflarida (Windows PowerShell 5 kodirovkasi uchun).
param([string]$Rejim = '')

$ErrorActionPreference = 'Stop'
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root
$Log = Join-Path $Root 'JURNAL.txt'
$Sinov = ($Rejim -eq 'sinov')
$Proj = if ($Sinov) { 'agmk-sinov' } else { 'agmk-sttb' }
function Say($t, $c = 'White') { Write-Host $t -ForegroundColor $c; Add-Content -Path $Log -Encoding UTF8 -Value ("[" + (Get-Date -Format 'HH:mm:ss') + "] " + $t) }
function Fail($t) { Say ""; Say "XATO: $t" 'Red'; Say "JURNAL.txt faylini mas'ulga yuboring." 'Yellow'; Read-Host "Yopish uchun Enter"; exit 1 }
function Run($what, [scriptblock]$cmd) {
    Say ">> $what" 'Cyan'
    $old = $ErrorActionPreference; $ErrorActionPreference = 'Continue'
    $out = & $cmd 2>&1 | ForEach-Object { $_.ToString() }
    $code = $LASTEXITCODE; $ErrorActionPreference = $old
    if ($out) { $out | Out-Host; Add-Content -Path $Log -Encoding UTF8 -Value $out }
    if ($code -ne 0) { Fail "$what bajarilmadi (kod $code)" }
}
function Rnd($n) { $b = New-Object byte[] $n; [System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($b); return (($b | ForEach-Object { $_.ToString('x2') }) -join '') }
function Dc { docker compose -p $Proj @args }

Say ("==== AGMK-STTB oflayn o'rnatish" + $(if ($Sinov) { ' (SINOV: agmk-sinov, 9443/9080)' } else { '' }) + " ====") 'Green'

# 1) Docker
try { $v = (docker version --format '{{.Server.Version}}' 2>$null) } catch { $v = '' }
if (-not $v) { Fail "Docker ishlamayapti. Docker Desktop ni oching, 'Engine running' (yashil) bo'lishini kuting va qayta bosing." }
Say "Docker ishlayapti (versiya $v)" 'Green'

# 2) Paket butunligi
$vf = Join-Path $Root 'VERSIYA.txt'; $tar = Join-Path $Root 'obrazlar.tar'
if (-not ((Test-Path $vf) -and (Test-Path $tar))) { Fail "Paket to'liq emas: VERSIYA.txt va obrazlar.tar bo'lishi kerak." }
$V = @{}; Get-Content $vf | ForEach-Object { $p = $_.Split('=', 2); if ($p.Count -eq 2) { $V[$p[0]] = $p[1] } }
$tag = $V['AGMK_IMAGE_TAG']; if (-not $tag) { Fail "VERSIYA.txt da AGMK_IMAGE_TAG yo'q" }
$sumF = Join-Path $Root 'SHA256SUMS.txt'
if (Test-Path $sumF) {
    Say ">> Nazorat summasi tekshirilmoqda (obrazlar.tar, 1-2 daqiqa)" 'Cyan'
    $want = (Get-Content $sumF | Where-Object { $_ -match '  obrazlar\.tar$' } | Select-Object -First 1)
    $got = (Get-FileHash -Algorithm SHA256 -Path $tar).Hash.ToLower()
    if ($want -and -not $want.StartsWith($got)) { Fail "obrazlar.tar buzilgan (nazorat summasi mos emas). Paketni qayta ko'chiring." }
    Say "Paket butun" 'Green'
}

# 3) Obrazlarni yuklash (internet kerak emas)
$need = ($V['OBRAZLAR'] -split ' ') | Where-Object { $_ }
$have = (docker image ls --format '{{.Repository}}:{{.Tag}}' 2>$null)
if (@($need | Where-Object { $have -notcontains $_ }).Count -gt 0) { Run "Obrazlar yuklanmoqda (2-5 daqiqa)" { docker load -i $tar } } else { Say "Obrazlar allaqachon yuklangan" 'Green' }

# 4) company va backups
$Co = Join-Path $Root 'company'
New-Item -ItemType Directory -Force -Path $Co, (Join-Path $Co 'imzo_yuklash'), (Join-Path $Root 'backups') | Out-Null
if (-not (Test-Path (Join-Path $Co 'xodimlar.json'))) { Say "Ogohlantirish: company\xodimlar.json yo'q -- server ishlaydi, lekin xodimlar ro'yxati va boshlang'ich parollar bo'lmaydi. Keyin qo'yib, qayta ishga tushiring." 'Yellow' }

# 5) .env
$envF = Join-Path $Root '.env'
$ip = (Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue | Where-Object { $_.IPAddress -notlike '127.*' -and $_.IPAddress -notlike '169.254.*' -and $_.InterfaceAlias -notmatch 'vEthernet|WSL|Docker|VirtualBox|VMware|Loopback' } | Sort-Object -Property InterfaceMetric | Select-Object -First 1).IPAddress
if (-not $ip) { $ip = '127.0.0.1' }
if (-not (Test-Path $envF)) {
    @(
        "# AGMK-STTB sozlamalari (oflayn o'rnatish yaratdi). Bu faylni hech kimga bermang: ichida kalitlar bor."
        "AGMK_DB_PASSWORD=$(Rnd 24)"
        "AGMK_JWT_SECRET=$(Rnd 48)"
        "AGMK_ANON_KEY=agmk_$(Rnd 18)"
        "AGMK_PUBLIC_HOSTS=$ip"
        "AGMK_PUBLIC_PORT=$(if ($Sinov) { 9443 } else { 8443 })"
        "AGMK_ADMIN_HOST_PORT=$(if ($Sinov) { 9080 } else { 8080 })"
        "AGMK_ADMIN=2582"
        "AGMK_COMPANY_PATH=./company"
        "AGMK_BACKUP_PATH=./backups"
        "AGMK_BACKUP_KEEP=30"
        "AGMK_TRK_DAYS=90"
        "AGMK_OCR=1"
        "AGMK_LOG_LEVEL=info"
        "AGMK_IMAGE_TAG=$tag"
    ) | Set-Content -Path $envF -Encoding ASCII
    Say "Sozlamalar va kalitlar yaratildi (.env) -- IP: $ip" 'Green'
} else {
    $lines = @(Get-Content $envF)
    if (-not ($lines | Where-Object { $_ -like 'AGMK_IMAGE_TAG=*' })) { $lines += "AGMK_IMAGE_TAG=$tag" }
    $lines = $lines | ForEach-Object { if ($_ -like 'AGMK_IMAGE_TAG=*') { "AGMK_IMAGE_TAG=$tag" } else { $_ } }
    $lines | Set-Content -Path $envF -Encoding ASCII
    Say "Mavjud .env saqlandi (kalitlar o'zgarmadi), versiya: $tag" 'Green'
}
$port = ((Get-Content $envF | Where-Object { $_ -like 'AGMK_ADMIN_HOST_PORT=*' } | Select-Object -First 1) -replace '^.*=', '')
if (-not $port) { $port = '8080' }

# 6) Ishga tushirish -- yig'ishsiz, internetsiz
Run "Server ishga tushirilmoqda ($tag)" { Dc up -d --no-build --pull never }
Say "Server tayyor bo'lishini kutyapman (1-2 daqiqa)..." 'Cyan'
$ok = $false
for ($i = 0; $i -lt 60; $i++) {
    Start-Sleep -Seconds 3
    try { $r = Invoke-WebRequest -UseBasicParsing -Uri "http://127.0.0.1:$port/" -TimeoutSec 3; if ($r.StatusCode -eq 200) { $ok = $true; break } } catch { }
}
if (-not $ok) { Dc ps | Out-Host; $l = Dc logs --tail 80 2>&1 | ForEach-Object { $_.ToString() }; $l | Out-Host; Add-Content -Path $Log -Encoding UTF8 -Value $l; Fail "Server 3 daqiqada ishga tushmadi" }
$old = $ErrorActionPreference; $ErrorActionPreference = 'Continue'; Dc restart gateway 2>&1 | Out-Null; $ErrorActionPreference = $old   # sertifikat yangilangan bo'lishi mumkin (ichki CA)
Set-Content -Path (Join-Path $Root 'backups\.ornatildi') -Value (Get-Date -Format 'yyyy-MM-dd HH:mm') -Encoding ASCII

Say ""
Say "==== TAYYOR ($tag) ====" 'Green'
Say "Boshqaruv paneli: http://127.0.0.1:$port  (QR kod shu yerda)" 'Green'
if ($Sinov) { Say "SINOV rejimi: bu alohida nusxa. To'xtatish: docker compose -p agmk-sinov stop" 'Yellow' }
Start-Process "http://127.0.0.1:$port"
Read-Host "Yopish uchun Enter (server ishlashda davom etadi)"
