# APK yigʻish (5.9 dan)

Android loyihasining manbasi bu omborda yoʻq — APK oldingi imzolangan APK dan **apktool** bilan qayta yigʻiladi.
Bu papkada 5.9 da qoʻlda oʻzgartirilgan fayllar turibdi (keyingi versiyalar uchun asos):

| Fayl | Nima oʻzgardi |
|---|---|
| `AndroidManifest.xml` | Gmail / boshqa ilovadan fayl qabul qilish: `VIEW` (content://) va `SEND` / `SEND_MULTIPLE` — xls, xlsx, xlsm, doc, docx, pdf, rtf |
| `AgmkIn.smali` (yangi) | `grab(Activity, Intent)` — kelgan fayllarni JSON (`name`, `mime`, `b64`) qiladi; `openUri(Activity, uri, mime)` — saqlangan faylni tizim orqali ochadi |
| `MainActivity.smali` | `pendingIn` maydoni; `onCreate` / `onNewIntent` da `AgmkIn.grab` (try/catch bilan); `deepUrl` faqat `agmk://` uchun; `doSave` saqlangandan keyin JS ga `agmkSaved(nom, uri)` |
| `MainActivity$Bridge.smali` | `takeIncoming()` va `openUri(uri, mime)` (`@JavascriptInterface`) |
| `apktool.yml` | `versionCode` / `versionName` |

JS tomoni: `frontend/src/features/hujjatlar/v59in.ts` (`agmkIncomingPoll`, `agmkSaved`), `frontend/src/features/core/v59dl.ts`.

## Qadamlar (bulutdagi ish muhitida)
1. Noutbukdagi oxirgi APK ni ol: `Desktop\1. AGMK-STTB <versiya> (ilova)\1. Telefon (APK)\*.apk`.
2. `java -jar apktool.jar d -f -o dec eski.apk` (apktool 2.10.0, GitHub releases).
3. Shu papkadagi fayllarni `dec/` ga qoʻy (yoki farqlarni qoʻl bilan qoʻsh), `apktool.yml` da versiyani oshir.
4. `dec/assets/index.html` ← `node build.mjs` natijasi (`frontend/private/*.json` bilan yigʻilgan toʻliq html).
5. `java -jar apktool.jar b dec -o unsigned.apk`.
6. Imzo: `java -jar uber-apk-signer.jar -a unsigned.apk --ks agmk-release.jks --ksAlias agmk --ksPass "$P" --ksKeyPass "$P"`
   (`uber-apk-signer.jar` — noutbukda `C:\AGMK\IMZO\kit\`; kalit va parol — `Desktop\MAXFIY …`; parolni ekranga chiqarma).
   Natijada SHA-256 `31:63:96:DF:…:7B:C9` boʻlishi shart (eski ilova ustidan yangilanishi uchun).
7. Yigʻib boʻlgach bulutdagi kalit, parol va `private/` nusxalarini **darhol oʻchir**.
