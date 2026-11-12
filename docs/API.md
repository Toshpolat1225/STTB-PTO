# Server API (avtomatik roʻyxat)

> Manba: `backend/app/api/router.py` (`ROUTES`). Barcha manzillar shlyuz (nginx, 8443 HTTPS) orqasida; `auth` dan tashqari hammasi sessiya tokenini talab qiladi, huquq `app/core/permissions.py` da tekshiriladi.

| Usul | Manzil | Ishlovchi | Tavsif |
|---|---|---|---|
| POST | `/api/adm/v1/pw` | `api.people.adm_pw` | Administrator xodimga yangi kirish paroli beradi (eskisi darhol ishlamay qoladi). |
| POST | `/api/dav/v1/assign` | `api.attendance.dav_assign` |  |
| GET | `/api/dav/v1/cfg` | `api.attendance.dav_cfg` |  |
| GET | `/api/dav/v1/day` | `api.attendance.dav_day` |  |
| POST | `/api/dav/v1/import` | `api.attendance.dav_import` |  |
| GET | `/api/dav/v1/objects` | `api.attendance.dav_objects` |  |
| GET | `/api/dav/v1/p` | `api.attendance.dav_person` |  |
| POST | `/api/dav/v1/pattern` | `api.attendance.dav_pattern` |  |
| POST | `/api/dav/v1/reason` | `api.attendance.dav_reason` |  |
| POST | `/api/dav/v1/reason/cancel` | `api.attendance.dav_reason_cancel` |  |
| GET | `/api/dav/v1/reasons` | `api.attendance.dav_reasons` |  |
| GET | `/api/dav/v1/tabel` | `api.attendance.dav_tabel` |  |
| POST | `/api/files/v1` | `api.data.files_post` |  |
| GET | `/api/geo/v1` | `app.geo_info` |  |
| GET | `/api/geo/v1/rev` | `app.geo_rev_get` |  |
| POST | `/api/geo/v1/rev` | `app.geo_rev_post` |  |
| POST | `/api/hr/v1/import` | `api.my.hr_import` |  |
| POST | `/api/kiy/v1/ack` | `api.my.kiy_ack` |  |
| POST | `/api/kiy/v1/cancel` | `api.my.kiy_cancel` |  |
| GET | `/api/kiy/v1/due` | `api.my.kiy_due` | Muddati kelgan / yaqinlashgan — ombor rejasi uchun (butun korxona yoki faqat mening hodimlarim). |
| POST | `/api/kiy/v1/issue` | `api.my.kiy_issue` |  |
| GET | `/api/kiy/v1/norma` | `api.my.kiy_norma` |  |
| GET | `/api/kiy/v1/p` | `api.my.kiy_person` |  |
| POST | `/api/kiy/v1/person` | `api.my.kiy_person_set` |  |
| POST | `/api/log/v1` | `api.data.app_log` |  |
| GET | `/api/my/v1` | `api.my.my_list` |  |
| GET | `/api/my/v1/find` | `api.my.my_find` |  |
| GET | `/api/my/v1/p` | `api.my.my_passport` |  |
| POST | `/api/my/v1/rel` | `api.my.my_rel` |  |
| POST | `/api/my/v1/rel/cancel` | `api.my.my_rel_cancel` |  |
| GET | `/api/my/v1/tel` | `api.my.my_tel` | 6.1: xodim pasportidagi «📞 Qoʻngʻiroq» — telefon raqami faqat bosilganda, faqat vakolatlilarga (oʻzi, kadrlar, |
| GET | `/api/my/v1/tk` | `api.my.my_tk` |  |
| GET | `/api/ocr/v1` | `app.ocr_get` |  |
| POST | `/api/ocr/v1` | `app.ocr_post` |  |
| GET | `/api/pack/v1/sxema` | `api.data.pack_sxema` |  |
| GET | `/api/pos/v1/trail` | `app.pos_trail` |  |
| GET | `/api/roster/v1` | `api.people.roster_list` |  |
| GET | `/api/roster/v1/oklad` | `api.people.oklad_get` | Maosh — faqat administrator va «okl» roli; oddiy xodim faqat oʻzinikini oladi. |
| PUT | `/api/roster/v1/oklad` | `api.people.oklad_put` | Oklad / razryad oʻzgartirish — faqat administrator va iqtisodchi (ilovadagi «iqt» roli). |
| GET | `/api/sig/v1/me` | `api.people.sig_get` |  |
| PUT | `/api/sig/v1/me` | `api.people.sig_put` |  |
| GET | `/api/sig/v1/pin` | `api.people.pin_get` |  |
| PUT | `/api/sig/v1/pin` | `api.people.pin_put` | Imzo kodi (4 xonali; ilova xeshlab yuboradi). Almashtirish — eski kod yoki kirish paroli bilan. |
| GET | `/api/vt/v1/active` | `api.people.vt_list` |  |
| POST | `/api/vt/v1/cancel` | `api.people.vt_cancel` |  |
| GET | `/auth/v1/user` | `api.auth.user_get_me` |  |
| POST | `/auth/v1/user` | `api.auth.user_change_pw` |  |
| PUT | `/auth/v1/user` | `api.auth.user_change_pw` |  |
| GET | `/rest/v1/agmk_messages` | `api.data.messages_get` |  |
| POST | `/rest/v1/agmk_messages` | `api.data.messages_post` |  |
| GET | `/rest/v1/agmk_records` | `api.data.records_get` |  |
| POST | `/rest/v1/agmk_records` | `api.data.records_post` |  |
| GET | `/rest/v1/agmk_users` | `api.people.users_active` |  |

**Qoʻshimcha (prefiks boʻyicha):** `/api/sign/v1/*` — elektron imzo (`api.sign.sign_api`), `/api/files/v1/<id>` — fayl, `/api/seed/v1/<nom>` — boshlangʻich maʼlumot, `/api/pos/v1`, `/api/trk/v1`, `/api/gps/v1/last` — jonli joylashuv (`realtime`).
