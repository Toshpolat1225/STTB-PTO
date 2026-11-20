// AGMK-STTB PTO — kompyuter (Windows) versiyasi. Electron oynasi ichida oʻsha ilova (index.html) ochiladi.
// Xavfsizlik (yopiq kontur): internetga hech qanday soʻrov ketmaydi — faqat ilovaning oʻz fayli va ichki tarmoq
// (127.0.0.1, 10.x, 172.16–31.x, 192.168.x, *.local) dagi korxona serveri. Node.js sahifaga berilmaydi.
'use strict';
const { app, BrowserWindow, session, shell, Menu } = require('electron');
const path = require('path');
const fs = require('fs');
// 5.7: oyna toʻliq ekranda ochiladi; Ctrl +/− bilan tanlangan kattalik eslab qolinadi
const ZF = () => path.join(app.getPath('userData'), 'zoom.json');
function zoomGet() { try { const z = JSON.parse(fs.readFileSync(ZF(), 'utf8')).z; return typeof z === 'number' && z >= -3 && z <= 4 ? z : 0; } catch (e) { return 0; } }
function zoomSet(z) { try { fs.writeFileSync(ZF(), JSON.stringify({ z: z })); } catch (e) { /* */ } }

const LAN = /^(localhost|127\.\d+\.\d+\.\d+|10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+|\[?::1\]?|[a-z0-9-]+\.local|[a-z0-9-]+)$/i;
function allowed(u) {
  try {
    const x = new URL(u);
    if (['file:', 'data:', 'blob:', 'devtools:', 'chrome-extension:', 'about:'].includes(x.protocol)) return true;
    if (x.protocol === 'http:' || x.protocol === 'https:' || x.protocol === 'ws:' || x.protocol === 'wss:') return LAN.test(x.hostname);
  } catch (e) { /* */ }
  return false;
}

// Chromium fon tarmoq soʻrovlari (komponent yangilanishi va h.k.) — oʻchirilgan
['disable-background-networking', 'disable-component-update', 'disable-domain-reliability', 'no-pings', 'disable-breakpad'].forEach(s => app.commandLine.appendSwitch(s));
// Ichki tarmoqdan tashqariga har qanday soʻrov (Chromium ichki xizmatlari ham) — mavjud boʻlmagan proksiga, yaʼni hech qayerga ketmaydi
app.commandLine.appendSwitch('proxy-server', 'http://127.0.0.1:9');
app.commandLine.appendSwitch('proxy-bypass-list', '<local>;localhost;127.0.0.1;::1;10.0.0.0/8;172.16.0.0/12;192.168.0.0/16;*.local');
app.commandLine.appendSwitch('disable-features', 'SpareRendererForSitePerProcess,AutofillServerCommunication,OptimizationHints,MediaRouter,Translate');

if (!app.requestSingleInstanceLock()) { app.quit(); }
app.on('second-instance', () => { const w = BrowserWindow.getAllWindows()[0]; if (w) { if (w.isMinimized()) w.restore(); w.focus(); } });

app.whenReady().then(() => {
  Menu.setApplicationMenu(null);
  const ses = session.defaultSession;
  ses.webRequest.onBeforeRequest((d, cb) => cb({ cancel: !allowed(d.url) }));
  ses.setPermissionRequestHandler((wc, perm, cb) => cb(['media', 'clipboard-sanitized-write', 'fullscreen', 'notifications'].includes(perm)));
  const win = new BrowserWindow({
    width: 1280, height: 860, minWidth: 380, minHeight: 560, title: 'AGMK STTB-AIT', backgroundColor: '#0f172a', autoHideMenuBar: true, show: false,
    icon: path.join(__dirname, 'icon.png'),
    webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true, spellcheck: false },
  });
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('blob:') || url.startsWith('data:')) return { action: 'allow' }; // chop etish / PDF koʻrish
    if (allowed(url) && /^https?:/.test(url)) { shell.openExternal(url); }
    return { action: 'deny' };
  });
  win.webContents.on('will-navigate', (e, url) => { if (!url.startsWith('file:')) e.preventDefault(); });
  // Ctrl + / Ctrl − / Ctrl 0 — kattalashtirish (kompyuter ekrani uchun)
  win.webContents.on('before-input-event', (e, i) => {
    if (!i.control || i.type !== 'keyDown') return; const z = win.webContents.getZoomLevel();
    if (i.key === '=' || i.key === '+') { win.webContents.setZoomLevel(Math.min(z + 0.5, 4)); zoomSet(win.webContents.getZoomLevel()); e.preventDefault(); }
    else if (i.key === '-') { win.webContents.setZoomLevel(Math.max(z - 0.5, -3)); zoomSet(win.webContents.getZoomLevel()); e.preventDefault(); }
    else if (i.key === '0') { win.webContents.setZoomLevel(0); zoomSet(0); e.preventDefault(); }
    else if (i.key === 'F12' || (i.shift && i.key.toLowerCase() === 'i')) { e.preventDefault(); }
  });
  win.webContents.on('did-finish-load', () => { try { win.webContents.setZoomLevel(zoomGet()); } catch (e) { /* */ } });
  win.once('ready-to-show', () => { win.maximize(); win.show(); });
  win.loadFile(path.join(__dirname, 'index.html'));
});
app.on('window-all-closed', () => app.quit());
