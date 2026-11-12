        // =====================================================================
        // YANGI (8-bosqich): SHTATLAR JADVALI (2026-yil 1-maydan) — bo'linma › bo'lim › lavozim
        // va Ishchi xodimlar shu tuzilma bo'yicha. Manba: tasdiqlangan shtatlar jadvali (307 birlik).
        // =====================================================================
        const SHTAT_TREE_KEY = 'agmk_shtat_tree';
        const SHTAT_2026 = {"v": 1, "src": "Shtatlar jadvali, 2026-yil 1-maydan joriy", "units": [{"id": "u1", "name": "Boshqaruv apparati", "key": "Boshqarma", "short": "Boshqaruv apparati"}, {"id": "u2", "name": "Qolmaqir konidan texnologik tashuvlar 1 - sonli temir yo'l sexi", "key": "TYS-1/ЖДЦ-1", "short": "1-TYS"}, {"id": "u3", "name": "Tashqi transport va texnologik tashuvlar 2 - sonli temir yo'l sexi", "key": "TYS-2/ЖДЦ-2", "short": "2-TYS"}, {"id": "u4", "name": "Harakatlanuvchi sostavlarni ta'mirlash bo'yicha 3 - sonli temir yo'l sexi", "key": "TYS-3/ЖДЦ-3", "short": "3-TYS"}, {"id": "u5", "name": "Temir yo'llarni ta'mirlash bo'yicha 4 - sonli temir yo'l sexi", "key": "TYS-4/ЖДЦ-4", "short": "4-TYS"}, {"id": "u6", "name": "Noruda qurilish materiallari karyeri", "key": "NQMK/КНСМ", "short": "NQMK"}, {"id": "u7", "name": "Signalizatsiya, markazlashtirish, blokirovkalash va aloqa xizmati", "key": "SMBvaAX / СЦБ", "short": "SMBvaAX"}, {"id": "u8", "name": "Energiya ta'minoti xizmati", "key": "ET/ЭС", "short": "ET"}, {"id": "u9", "name": "Ko'tarma-transport uskunalari xizmati", "key": "KTUX/СПТО", "short": "KTUX"}, {"id": "u10", "name": "Vagonlar xizmati", "key": "VH/ВС", "short": "VX"}, {"id": "u11", "name": "Ma'muriy-xo'jalik qismi", "key": "MXQ/АХЧ", "short": "MXQ"}, {"id": "u12", "name": "Ichki qo'riqlash xizmati", "key": "IQX/СВО", "short": "IQX"}, {"id": "u13", "name": "Texnologik jarayonlar avtomatlashtirilgan boshqaruv tizimlari xizmati", "key": "TJABTX/АСУТП", "short": "TJABTX"}], "groups": [{"id": "u1g1", "u": "u1", "name": "Ishlab chiqarishni muvofiqlashtirish va logistika xizmati"}, {"id": "u1g2", "u": "u1", "name": "Bosh mexanik bo'limi"}, {"id": "u1g3", "u": "u1", "name": "Ishlab chiqarish-texnik bo'limi"}, {"id": "u1g4", "u": "u1", "name": "Transport va yoqilg'i-moylash materiallari nazorati bo'limi"}, {"id": "u1g5", "u": "u1", "name": "Moddiy-texnik ta'minoti bo'limi"}, {"id": "u1g6", "u": "u1", "name": "Harakat xavfsizligi, mehnat muhofazasi va texnika xavfsizligi bo'limi"}, {"id": "u1g7", "u": "u1", "name": "Kapital qurilish bo'limi"}, {"id": "u1g8", "u": "u1", "name": "Kadrlar bo'limi"}, {"id": "u1g9", "u": "u1", "name": "Mehnatni tashkil etish va ish haqi bo'limi"}, {"id": "u1g10", "u": "u1", "name": "Iqtisodiy rejalashtirish bo'limi"}, {"id": "u1g11", "u": "u1", "name": "Buxgalteriya"}, {"id": "u2g1", "u": "u2", "name": "Harakatlanuvchi sostav ekspluatatsiyasi uchatkasi"}, {"id": "u2g2", "u": "u2", "name": "Poyezdlar harakati uchastkasi"}, {"id": "u2g3", "u": "u2", "name": "Harakatlanuvchi sostavni ta'mirlash deposi"}, {"id": "u2g4", "u": "u2", "name": "Lokomotivlarni ta'mirlash uchastkasi"}, {"id": "u2g5", "u": "u2", "name": "Lokomotivlarga texnik xizmat ko'rsatish punkti"}, {"id": "u2g6", "u": "u2", "name": "Vagonlarni ta'mirlash parki"}, {"id": "u2g7", "u": "u2", "name": "Vagonlarga texnik xizmat ko'rsatish punkti"}, {"id": "u2g8", "u": "u2", "name": "Tayyorlov uchastkasi"}, {"id": "u3g1", "u": "u3", "name": "Yuk ishlari uchastkasi"}, {"id": "u3g2", "u": "u3", "name": "Harakatlanuvchi sostav ekspluatatsiyasi uchastkasi"}, {"id": "u3g3", "u": "u3", "name": "Poyezdlar xarakati uchastkasi"}, {"id": "u3g4", "u": "u3", "name": "Harakatlanuvchi sostavni ta'mirlash uchastkasi"}, {"id": "u3g5", "u": "u3", "name": "Lokomotivlarga texnik xizmat ko'rsatish punkti"}, {"id": "u3g6", "u": "u3", "name": "Vagonlarni ta'mirlash parki"}, {"id": "u3g7", "u": "u3", "name": "Vagonlarga texnik xizmat ko'rsatish punkti"}, {"id": "u4g1", "u": "u4", "name": "Lokomotivlarni ta'mirlash deposi"}, {"id": "u4g2", "u": "u4", "name": "Tayyorlov uchastkasi"}, {"id": "u4g3", "u": "u4", "name": "Ixtirochilik-ilmiy amaliy uchastkasi"}, {"id": "u4g4", "u": "u4", "name": "Tortish agregatlarini kapital ta'mirlash uchastkasi"}, {"id": "u4g5", "u": "u4", "name": "Tortuv agregatlarini 3-darajali ta'mirlash uchastkasi"}, {"id": "u4g6", "u": "u4", "name": "Elektrotexnika, elektrmashinalarni va elektr uskunalarni ta'mirlash uchastkasi"}, {"id": "u4g7", "u": "u4", "name": "Tortish agregatlarini 1- va 2- darajali ta'mirlash uchastkasi"}, {"id": "u4g8", "u": "u4", "name": "Teplovozlarni ta'mirlash uchastkasi"}, {"id": "u4g9", "u": "u4", "name": "Temir yo'l va avtotraktor texnikalari deposi"}, {"id": "u5g1", "u": "u5", "name": "Temir yo'l zvenolarini yig'ish bazasi"}, {"id": "u5g2", "u": "u5", "name": "Qolmaqir uchastkasi"}, {"id": "u5g3", "u": "u5", "name": "2-TYS tashqi transporti uchastkasi"}, {"id": "u5g4", "u": "u5", "name": "Xo'jalik uchastkasi"}, {"id": "u5g5", "u": "u5", "name": "Sun'iy inshootlarga texnik xizmat ko'rsatish va ta'mirlash uchastkasi"}, {"id": "u8g1", "u": "u8", "name": "Kontakt tarmog'iga texnik xizmat ko'rsatish va ta'mirlash uchastkasi"}, {"id": "u10g1", "u": "u10", "name": "Vagonlarni ta'mirlash uchastkasi"}, {"id": "u10g2", "u": "u10", "name": "Mexanika uchastkasi"}, {"id": "u10g3", "u": "u10", "name": "G'ildirak uchastkasi"}], "pos": [{"no": 1, "name": "Boshqarma boshlig'i", "cnt": 1, "cat": "rah.", "u": "u1", "g": null}, {"no": 2, "name": "Bosh muhandis", "cnt": 1, "cat": "rah.", "u": "u1", "g": null}, {"no": 3, "name": "Umumiy masalalar bo'yicha boshliq o'rinbosari", "cnt": 1, "cat": "rah.", "u": "u1", "g": null}, {"no": 4, "name": "Kapital qurilish, bino va inshootlarni saqlash bo'yicha boshliq o'rinbosari", "cnt": 1, "cat": "rah.", "u": "u1", "g": null}, {"no": 5, "name": "STTB Yoshlar ittifoqi raisi - yoshlar masalalari bo'yicha boshliq yordamchisi", "cnt": 1, "cat": "rah.", "u": "u1", "g": null}, {"no": 6, "name": "Ishlab chiqarish va tashqi logistika bo'yicha boshliq o'rinbosari", "cnt": 1, "cat": "rah.", "u": "u1", "g": null}, {"no": 7, "name": "Tovar-moddiy boyliklarini saqlash bo'yicha boshliq o'rinbosari", "cnt": 1, "cat": "rah.", "u": "u1", "g": null}, {"no": 8, "name": "Harakat xavfsizligi, mehnat muhofazasi va texnika xavfsizligi bo'yicha bosh muhandis o'rinbosari", "cnt": 1, "cat": "rah.", "u": "u1", "g": null}, {"no": 9, "name": "I-toifali yuriskonsult", "cnt": 1, "cat": "mutax.", "u": "u1", "g": null}, {"no": 10, "name": "Xizmat boshlig'i", "cnt": 1, "cat": "rah.", "u": "u1", "g": "u1g1"}, {"no": 11, "name": "Xizmat boshlig'i o'rinbosari", "cnt": 1, "cat": "rah.", "u": "u1", "g": "u1g1"}, {"no": 12, "name": "Smena boshlig'i", "cnt": 4, "cat": "rah.", "u": "u1", "g": "u1g1"}, {"no": 13, "name": "Bosh mexanik", "cnt": 1, "cat": "rah.", "u": "u1", "g": "u1g2"}, {"no": 14, "name": "Bosh mexanik o'rinbosari", "cnt": 1, "cat": "rah.", "u": "u1", "g": "u1g2"}, {"no": 15, "name": "Mahalliylashtirish bo'yicha I-toifali muhandis-mexanik", "cnt": 1, "cat": "mutax.", "u": "u1", "g": "u1g2"}, {"no": 16, "name": "Yuk ko'tarish mexanizmlari, texnologik uskunalarni va qurilmalarni ta'mirlash va xizmat ko'rsatish bo'yicha I-toifali muhandis", "cnt": 1, "cat": "mutax.", "u": "u1", "g": "u1g2"}, {"no": 17, "name": "Yetakchi muhandis-konstruktor", "cnt": 1, "cat": "mutax.", "u": "u1", "g": "u1g2"}, {"no": 18, "name": "Bo'lim boshlig'i", "cnt": 1, "cat": "rah.", "u": "u1", "g": "u1g3"}, {"no": 19, "name": "Vagon parkini saqlash bo'yicha yetakchi muhandis", "cnt": 1, "cat": "mutax.", "u": "u1", "g": "u1g3"}, {"no": 20, "name": "Lokomotivlar I-toifali muhandisi (tortuv agregatlar)", "cnt": 1, "cat": "mutax.", "u": "u1", "g": "u1g3"}, {"no": 21, "name": "Lokomotivlar I-toifali muhandisi (teplovozlar)", "cnt": 1, "cat": "mutax.", "u": "u1", "g": "u1g3"}, {"no": 22, "name": "Temir yo'l harakat tarkibi I-toifali muhandisi", "cnt": 2, "cat": "mutax.", "u": "u1", "g": "u1g3"}, {"no": 23, "name": "Avtotransport vositalari bo'yicha I-toifali muhandis", "cnt": 1, "cat": "mutax.", "u": "u1", "g": "u1g3"}, {"no": 24, "name": "Temir yo'l qurilishi bo'yicha I-toifali muhandis", "cnt": 2, "cat": "mutax.", "u": "u1", "g": "u1g3"}, {"no": 25, "name": "Elektr energetika tizimlari I-toifali muhandisi (kontakt tarmog'i)", "cnt": 1, "cat": "mutax.", "u": "u1", "g": "u1g3"}, {"no": 26, "name": "Transport I-toifali muhandisi (temir yo'l texnikalar)", "cnt": 1, "cat": "mutax.", "u": "u1", "g": "u1g3"}, {"no": 27, "name": "Avtomatlashtirish bo'yicha I-toifali muhandis (signallashtirish, markazlashtirish va bloklash qurilmalariqurilmalari va aloqa)", "cnt": 1, "cat": "mutax.", "u": "u1", "g": "u1g3"}, {"no": 28, "name": "Ish yuritish bo'yicha I-toifali inspektor", "cnt": 1, "cat": "mutax.", "u": "u1", "g": "u1g3"}, {"no": 29, "name": "Metrologiya va sertifikatsiya bo'yicha I-toifali muhandis", "cnt": 1, "cat": "mutax.", "u": "u1", "g": "u1g3"}, {"no": 30, "name": "Bo'lim boshlig'i", "cnt": 1, "cat": "rah.", "u": "u1", "g": "u1g4"}, {"no": 31, "name": "Yoqilg'i-moylash materiallari yetakchi muhandisi", "cnt": 1, "cat": "mutax.", "u": "u1", "g": "u1g4"}, {"no": 32, "name": "GPS bo'yicha katta elektromexanik", "cnt": 1, "cat": "mutax.", "u": "u1", "g": "u1g4"}, {"no": 33, "name": "Bo'lim boshlig'i", "cnt": 1, "cat": "rah.", "u": "u1", "g": "u1g5"}, {"no": 34, "name": "Jihozlar va materiallarni komplektlash bo'yicha I-toifali muhandis-mexanik", "cnt": 1, "cat": "mutax.", "u": "u1", "g": "u1g5"}, {"no": 35, "name": "Bo'lim boshlig'i", "cnt": 1, "cat": "rah.", "u": "u1", "g": "u1g6"}, {"no": 36, "name": "Mehnat muhofazasi, avtomobil harakat xavfsizligi va texnika xavfsizligi yetakchi muhandisi", "cnt": 1, "cat": "mutax.", "u": "u1", "g": "u1g6"}, {"no": 37, "name": "Sanoat xavfsizligi yetakchi muhandis", "cnt": 1, "cat": "mutax.", "u": "u1", "g": "u1g6"}, {"no": 38, "name": "Mehnat muhofazasi, texnika xavfsizligi va harakat xavfsizligi katta revizori", "cnt": 3, "cat": "mutax.", "u": "u1", "g": "u1g6"}, {"no": 39, "name": "Sanoat uskunalari va asboblari bo'yicha I-toifali muhandis", "cnt": 1, "cat": "mutax.", "u": "u1", "g": "u1g6"}, {"no": 40, "name": "Atrof-muhitni muhofaza qilish bo'yicha I-toifali muhandis", "cnt": 1, "cat": "mutax.", "u": "u1", "g": "u1g6"}, {"no": 41, "name": "Bo'lim boshlig'i", "cnt": 1, "cat": "rah.", "u": "u1", "g": "u1g7"}, {"no": 42, "name": "Loyiha-smeta ishlari bo'yicha yetakchi muhandis", "cnt": 1, "cat": "mutax.", "u": "u1", "g": "u1g7"}, {"no": 43, "name": "Avtomatlashtirish bo'yicha yetakchi muhandis (signallashtirish, markazlashtirish va bloklash qurilmalariqurilmalari va aloqa)", "cnt": 1, "cat": "mutax.", "u": "u1", "g": "u1g7"}, {"no": 44, "name": "Elektr energetika tizimlari yetakchi muhandisi (kontakt tarmog'i)", "cnt": 1, "cat": "mutax.", "u": "u1", "g": "u1g7"}, {"no": 45, "name": "Yo'l-qurilish ishlarini nazorat qilish bo'yicha yetakchi muhandis (Temir yo'lda)", "cnt": 1, "cat": "mutax.", "u": "u1", "g": "u1g7"}, {"no": 46, "name": "Bino va inshootlari qurilishi bo'yicha yetakchi muhandis", "cnt": 1, "cat": "mutax.", "u": "u1", "g": "u1g7"}, {"no": 47, "name": "Yetakchi muhandis-texnolog", "cnt": 1, "cat": "mutax.", "u": "u1", "g": "u1g7"}, {"no": 48, "name": "Bo'lim boshlig'i", "cnt": 1, "cat": "rah.", "u": "u1", "g": "u1g8"}, {"no": 49, "name": "Kadrlar bo'yicha texnik-inspektor", "cnt": 1, "cat": "texn.", "u": "u1", "g": "u1g8"}, {"no": 50, "name": "Bo'lim boshlig'i", "cnt": 1, "cat": "rah.", "u": "u1", "g": "u1g9"}, {"no": 51, "name": "Mehnatni tashkil qilish va me'yorlashtirish yetakchi muhandisi", "cnt": 1, "cat": "mutax.", "u": "u1", "g": "u1g9"}, {"no": 52, "name": "Bo'lim boshlig'i", "cnt": 1, "cat": "rah.", "u": "u1", "g": "u1g10"}, {"no": 53, "name": "Rejalashtirish bo'yicha yetakchi iqtisodchi", "cnt": 1, "cat": "mutax.", "u": "u1", "g": "u1g10"}, {"no": 54, "name": "Rejalashtirish bo'yicha I-toifali iqtisodchi", "cnt": 1, "cat": "mutax.", "u": "u1", "g": "u1g10"}, {"no": 55, "name": "Bosh buxgalter", "cnt": 1, "cat": "rah.", "u": "u1", "g": "u1g11"}, {"no": 56, "name": "Yetakchi buxgalter", "cnt": 1, "cat": "mutax.", "u": "u1", "g": "u1g11"}, {"no": 57, "name": "Sex boshlig'i", "cnt": 1, "cat": "rah.", "u": "u2", "g": null}, {"no": 58, "name": "Elektr energetika tizimida nazorat va xavfsizligi yetakchi muhandisi", "cnt": 1, "cat": "mutax.", "u": "u2", "g": null}, {"no": 59, "name": "Mehnat bo'yicha I-toifali iqtisodchi", "cnt": 1, "cat": "mutax.", "u": "u2", "g": null}, {"no": 60, "name": "I-toifali buxgalter", "cnt": 2, "cat": "mutax.", "u": "u2", "g": null}, {"no": 61, "name": "Lokomotiv (poyezd) brigadalari katta naryadchisi", "cnt": 1, "cat": "texn.", "u": "u2", "g": null}, {"no": 62, "name": "Harakatlanuvchi sostav ekspluatatsiyasi bo'yicha sex boshlig'i o'rinbosari", "cnt": 1, "cat": "rah.", "u": "u2", "g": "u2g1"}, {"no": 63, "name": "Lokomotiv brigadasi uchun yo'riqchi mashinisti", "cnt": 6, "cat": "mutax.", "u": "u2", "g": "u2g1"}, {"no": 64, "name": "Harakat bo'yicha sex boshlig'i o'rinbosari", "cnt": 1, "cat": "rah.", "u": "u2", "g": "u2g2"}, {"no": 65, "name": "Stansiya boshlig'i (temir yo'lda)", "cnt": 3, "cat": "rah.", "u": "u2", "g": "u2g2"}, {"no": 66, "name": "Temir yo'l lokomotiv dispetcheri", "cnt": 4, "cat": "texn.", "u": "u2", "g": "u2g2"}, {"no": 67, "name": "Temir yo'l stansiyasi bo'yicha navbatchi", "cnt": 24, "cat": "texn.", "u": "u2", "g": "u2g2"}, {"no": 68, "name": "Harakatlanuvchi sostavni ta'mirlash bo'yicha sex boshlig'i o'rinbosari", "cnt": 1, "cat": "rah.", "u": "u2", "g": "u2g3"}, {"no": 69, "name": "Harakatlanuvchi sostav deposi boshlig'i", "cnt": 1, "cat": "rah.", "u": "u2", "g": "u2g3"}, {"no": 70, "name": "Uchastka ustasi", "cnt": 4, "cat": "rah.", "u": "u2", "g": "u2g4"}, {"no": 71, "name": "Uchastka ustasi", "cnt": 2, "cat": "rah.", "u": "u2", "g": "u2g5"}, {"no": 72, "name": "Uchastka ustasi", "cnt": 2, "cat": "rah.", "u": "u2", "g": "u2g6"}, {"no": 73, "name": "Uchastka ustasi", "cnt": 4, "cat": "rah.", "u": "u2", "g": "u2g7"}, {"no": 74, "name": "Uchastka ustasi", "cnt": 2, "cat": "rah.", "u": "u2", "g": "u2g8"}, {"no": 75, "name": "Sex boshlig'i", "cnt": 1, "cat": "rah.", "u": "u3", "g": null}, {"no": 76, "name": "Harakat xavfsizligi, mehnat muhofazasi va texnika xavfsizligi katta revizori (shaxobcha yo'llari bo'yicha)", "cnt": 1, "cat": "mutax.", "u": "u3", "g": null}, {"no": 77, "name": "Mehnat bo'yicha I-toifali iqtisodchi", "cnt": 1, "cat": "mutax.", "u": "u3", "g": null}, {"no": 78, "name": "I-toifali buxgalter", "cnt": 1, "cat": "mutax.", "u": "u3", "g": null}, {"no": 79, "name": "Lokomotiv (poyezd) brigadalari katta naryadchisi", "cnt": 1, "cat": "texn.", "u": "u3", "g": null}, {"no": 80, "name": "Tashqi logistika bo'yicha sex boshlig'i o'rinbosari", "cnt": 1, "cat": "rah.", "u": "u3", "g": null}, {"no": 81, "name": "Tovar taftishchisi", "cnt": 1, "cat": "mutax.", "u": "u3", "g": null}, {"no": 82, "name": "Logistika bo'yicha I-toifali professional-mutaxassis", "cnt": 1, "cat": "mutax.", "u": "u3", "g": null}, {"no": 83, "name": "Yuk ishlari bo'yicha sex boshlig'i o'rinbosari", "cnt": 1, "cat": "rah.", "u": "u3", "g": "u3g1"}, {"no": 84, "name": "Tovar (yuk) katta kassiri", "cnt": 1, "cat": "mutax.", "u": "u3", "g": "u3g1"}, {"no": 85, "name": "Harakatlanuvchi sostav ekspluatatsiyasi bo'yicha sex boshlig'i o'rinbosari", "cnt": 1, "cat": "rah.", "u": "u3", "g": "u3g2"}, {"no": 86, "name": "Lokomotiv brigadasi uchun yo'riqchi mashinisti", "cnt": 6, "cat": "mutax.", "u": "u3", "g": "u3g2"}, {"no": 87, "name": "Harakat bo'yicha sex boshlig'i o'rinbosari", "cnt": 1, "cat": "rah.", "u": "u3", "g": "u3g3"}, {"no": 88, "name": "Stansiya boshlig'i (temir yo'lda)", "cnt": 4, "cat": "rah.", "u": "u3", "g": "u3g3"}, {"no": 89, "name": "Temir yo'l lokomotiv dispetcheri", "cnt": 4, "cat": "texn.", "u": "u3", "g": "u3g3"}, {"no": 90, "name": "Temir yo'l stansiyasi bo'yicha navbatchi (Svinsovaya)", "cnt": 4, "cat": "texn.", "u": "u3", "g": "u3g3"}, {"no": 91, "name": "Temir yo'l stansiyasi bo'yicha navbatchi", "cnt": 24, "cat": "texn.", "u": "u3", "g": "u3g3"}, {"no": 92, "name": "Harakatlanuvchi sostavlarni ta'mirlash bo'yicha sex boshlig'i o'rinbosari", "cnt": 1, "cat": "rah.", "u": "u3", "g": "u3g4"}, {"no": 93, "name": "Uchastka ustasi", "cnt": 2, "cat": "rah.", "u": "u3", "g": "u3g5"}, {"no": 94, "name": "Uchastka ustasi", "cnt": 2, "cat": "rah.", "u": "u3", "g": "u3g6"}, {"no": 95, "name": "Uchastka ustasi", "cnt": 2, "cat": "rah.", "u": "u3", "g": "u3g7"}, {"no": 96, "name": "Sex boshlig'i", "cnt": 1, "cat": "rah.", "u": "u4", "g": null}, {"no": 97, "name": "Lokomotivlarni modernizatsiya qilish bo'yicha sex boshlig'i o'rinbosari", "cnt": 1, "cat": "rah.", "u": "u4", "g": null}, {"no": 98, "name": "Mehnat bo'yicha I-toifali iqtisodchi", "cnt": 1, "cat": "mutax.", "u": "u4", "g": null}, {"no": 99, "name": "I-toifali buxgalter", "cnt": 1, "cat": "mutax.", "u": "u4", "g": null}, {"no": 100, "name": "Lokomotivlarni ta'mirlash bo'yicha sex boshlig'i o'rinbosari", "cnt": 1, "cat": "rah.", "u": "u4", "g": "u4g1"}, {"no": 101, "name": "Uchastka ustasi", "cnt": 2, "cat": "rah.", "u": "u4", "g": "u4g2"}, {"no": 102, "name": "Uchastka ustasi", "cnt": 1, "cat": "rah.", "u": "u4", "g": "u4g3"}, {"no": 103, "name": "Uchastka ustasi", "cnt": 1, "cat": "rah.", "u": "u4", "g": "u4g4"}, {"no": 104, "name": "Uchastka ustasi", "cnt": 2, "cat": "rah.", "u": "u4", "g": "u4g5"}, {"no": 105, "name": "Uchastka ustasi", "cnt": 2, "cat": "rah.", "u": "u4", "g": "u4g6"}, {"no": 106, "name": "Uchastka ustasi", "cnt": 2, "cat": "rah.", "u": "u4", "g": "u4g7"}, {"no": 107, "name": "Uchastka ustasi", "cnt": 2, "cat": "rah.", "u": "u4", "g": "u4g8"}, {"no": 108, "name": "Temir yo'l va avtotraktor texnikalari bo'yicha sex boshlig'i o'rinbosari", "cnt": 1, "cat": "rah.", "u": "u4", "g": "u4g9"}, {"no": 109, "name": "Mexanik", "cnt": 2, "cat": "mutax.", "u": "u4", "g": "u4g9"}, {"no": 110, "name": "Sex boshlig'i", "cnt": 1, "cat": "rah.", "u": "u5", "g": null}, {"no": 111, "name": "Yetakchi marksheyder", "cnt": 1, "cat": "mutax.", "u": "u5", "g": null}, {"no": 112, "name": "I-toifali marksheyder", "cnt": 2, "cat": "mutax.", "u": "u5", "g": null}, {"no": 113, "name": "Mehnat bo'yicha I-toifali iqtisodchi", "cnt": 1, "cat": "mutax.", "u": "u5", "g": null}, {"no": 114, "name": "I-toifali buxgalter", "cnt": 1, "cat": "mutax.", "u": "u5", "g": null}, {"no": 115, "name": "Temir yo'lni kapital ta'mirlash bo'yicha sex boshlig'i o'rinbosari", "cnt": 1, "cat": "rah.", "u": "u5", "g": "u5g1"}, {"no": 116, "name": "Katta yo'l ustasi", "cnt": 1, "cat": "rah.", "u": "u5", "g": "u5g1"}, {"no": 117, "name": "Usta", "cnt": 2, "cat": "rah.", "u": "u5", "g": "u5g1"}, {"no": 118, "name": "Yo'l mashinalari va mexanizmlarini ekspluatatsiyasi bo'yicha usta", "cnt": 1, "cat": "rah.", "u": "u5", "g": "u5g1"}, {"no": 119, "name": "Temir yo'lni joriy saqlash va ta'mirlash bo'yicha sex boshlig'i o'rinbosari (Qolmaqir uchastkasi)", "cnt": 1, "cat": "rah.", "u": "u5", "g": "u5g2"}, {"no": 120, "name": "Katta yo'l ustasi", "cnt": 1, "cat": "rah.", "u": "u5", "g": "u5g2"}, {"no": 121, "name": "Yo'l ustasi", "cnt": 7, "cat": "rah.", "u": "u5", "g": "u5g2"}, {"no": 122, "name": "Yo'l ustasi, razrezlar, karerlar va otvallarda band bo'lgan (9 okolotka)", "cnt": 1, "cat": "rah.", "u": "u5", "g": "u5g2"}, {"no": 123, "name": "Yo'l mashinalari va mexanizmlarini ekspluatatsiyasi bo'yicha usta", "cnt": 1, "cat": "rah.", "u": "u5", "g": "u5g2"}, {"no": 124, "name": "Temir yo'lni joriy saqlash va ta'mirlash bo'yicha sex boshlig'i o'rinbosari (2-TYS tashqi transporti uchastkasi)", "cnt": 1, "cat": "rah.", "u": "u5", "g": "u5g3"}, {"no": 125, "name": "Katta yo'l ustasi", "cnt": 1, "cat": "rah.", "u": "u5", "g": "u5g3"}, {"no": 126, "name": "Yo'l ustasi", "cnt": 5, "cat": "rah.", "u": "u5", "g": "u5g3"}, {"no": 127, "name": "Yo'l mashinalari va mexanizmlarini ekspluatatsiyasi bo'yicha usta", "cnt": 1, "cat": "rah.", "u": "u5", "g": "u5g3"}, {"no": 128, "name": "Usta", "cnt": 1, "cat": "rah.", "u": "u5", "g": "u5g4"}, {"no": 129, "name": "Usta", "cnt": 1, "cat": "rah.", "u": "u5", "g": "u5g5"}, {"no": 130, "name": "Karyer boshlig'i", "cnt": 1, "cat": "rah.", "u": "u6", "g": null}, {"no": 131, "name": "Bosh muhandis", "cnt": 1, "cat": "rah.", "u": "u6", "g": null}, {"no": 132, "name": "Mexanik", "cnt": 1, "cat": "mutax.", "u": "u6", "g": null}, {"no": 133, "name": "Energetik", "cnt": 1, "cat": "mutax.", "u": "u6", "g": null}, {"no": 134, "name": "Smena ustasi", "cnt": 4, "cat": "rah.", "u": "u6", "g": null}, {"no": 135, "name": "Xizmat boshlig'i", "cnt": 1, "cat": "rah.", "u": "u7", "g": null}, {"no": 136, "name": "Xizmat boshlig'i o'rinbosari", "cnt": 1, "cat": "rah.", "u": "u7", "g": null}, {"no": 137, "name": "Avtomatlashtirish va tizimlarni integratsiya qilish bo'yicha yetakchi muhandis", "cnt": 1, "cat": "mutax.", "u": "u7", "g": null}, {"no": 138, "name": "Katta elektromexanik (Svinsovaya, Mednaya, Qolmaqir temir yo'l stansiyalari)", "cnt": 2, "cat": "mutax.", "u": "u7", "g": null}, {"no": 139, "name": "Radioaloqa katta elektromexanigi", "cnt": 1, "cat": "mutax.", "u": "u7", "g": null}, {"no": 140, "name": "Katta elektromexanik", "cnt": 1, "cat": "mutax.", "u": "u7", "g": null}, {"no": 141, "name": "Elektromexanik", "cnt": 6, "cat": "mutax.", "u": "u7", "g": null}, {"no": 142, "name": "Simli aloqa elektromexanigi", "cnt": 1, "cat": "mutax.", "u": "u7", "g": null}, {"no": 143, "name": "Bosh energetik-xizmat boshlig'i", "cnt": 1, "cat": "rah.", "u": "u8", "g": null}, {"no": 144, "name": "Elektruzatish liniyalarini, elektr qurilmalarini va elektr jihozlarini ta'mirlash bo'yicha xizmat boshlig'i", "cnt": 1, "cat": "rah.", "u": "u8", "g": null}, {"no": 145, "name": "Muhandislik kommunikatsiyalarini saqlash va ta'mirlash bo'yicha xizmat boshlig'i o'rinbosari", "cnt": 1, "cat": "rah.", "u": "u8", "g": null}, {"no": 146, "name": "Mehnat bo'yicha I-toifali iqtisodchi", "cnt": 1, "cat": "mutax.", "u": "u8", "g": null}, {"no": 147, "name": "Elektruzatish liniyalarini, elektr qurilmalarini va elektr jihozlarini ta'mirlash bo'yicha katta usta", "cnt": 1, "cat": "rah.", "u": "u8", "g": null}, {"no": 148, "name": "Muhandislik kommunikatsiyalari va elektr jihozlarini saqlash va ta'mirlash bo'yicha katta usta", "cnt": 4, "cat": "rah.", "u": "u8", "g": null}, {"no": 149, "name": "Yetakchi buxgalter", "cnt": 1, "cat": "mutax.", "u": "u8", "g": null}, {"no": 150, "name": "Sanoat energetikasi elektr jihozlarini ta'mirlash bo'yicha I-toifali muhandis", "cnt": 1, "cat": "mutax.", "u": "u8", "g": null}, {"no": 151, "name": "Kontakt tarmog'iga texnik xizmat ko'rsatish va ta'mirlash bo'yicha xizmat boshlig'i o'rinbosari", "cnt": 1, "cat": "rah.", "u": "u8", "g": "u8g1"}, {"no": 152, "name": "Kontakt tarmog'iga texnik xizmat ko'rsatish va ta'mirlash bo'yicha uchastka boshlig'i", "cnt": 1, "cat": "rah.", "u": "u8", "g": "u8g1"}, {"no": 153, "name": "Elektromexanik", "cnt": 6, "cat": "mutax.", "u": "u8", "g": "u8g1"}, {"no": 154, "name": "Xizmat boshlig'i", "cnt": 1, "cat": "rah.", "u": "u9", "g": null}, {"no": 155, "name": "Xizmat boshlig'i o'rinbosari", "cnt": 1, "cat": "rah.", "u": "u9", "g": null}, {"no": 156, "name": "Elektromexanik", "cnt": 6, "cat": "mutax.", "u": "u9", "g": null}, {"no": 157, "name": "Xizmat boshlig'i", "cnt": 1, "cat": "rah.", "u": "u10", "g": null}, {"no": 158, "name": "Xizmat boshlig'i o'rinbosari", "cnt": 1, "cat": "rah.", "u": "u10", "g": null}, {"no": 159, "name": "I-toifali buxgalter", "cnt": 1, "cat": "mutax.", "u": "u10", "g": null}, {"no": 160, "name": "Mehnat bo'yicha I-toifali iqtisodchi", "cnt": 1, "cat": "mutax.", "u": "u10", "g": null}, {"no": 161, "name": "Uchastka ustasi", "cnt": 2, "cat": "rah.", "u": "u10", "g": "u10g1"}, {"no": 162, "name": "Uchastka ustasi", "cnt": 2, "cat": "rah.", "u": "u10", "g": "u10g2"}, {"no": 163, "name": "Uchastka ustasi", "cnt": 2, "cat": "rah.", "u": "u10", "g": "u10g3"}, {"no": 164, "name": "Qurilish va montaj ishlari ustasi", "cnt": 1, "cat": "rah.", "u": "u11", "g": null}, {"no": 165, "name": "Uchastka ustasi", "cnt": 1, "cat": "rah.", "u": "u11", "g": null}, {"no": 166, "name": "Ichki qo'riqlash xizmat boshlig'i", "cnt": 1, "cat": "rah.", "u": "u12", "g": null}, {"no": 167, "name": "Smena katta qo'riqchisi", "cnt": 2, "cat": "rah.", "u": "u12", "g": null}, {"no": 168, "name": "Fuqaro mudofaasi, yong'in xavfsizligi va favqulotda holatlar bo'yicha muhandis", "cnt": 1, "cat": "mutax.", "u": "u12", "g": null}, {"no": 169, "name": "Qo'riqlash va tartibot bo'yicha inspektor", "cnt": 1, "cat": "mutax.", "u": "u12", "g": null}, {"no": 170, "name": "Xizmat boshlig'i", "cnt": 1, "cat": "rah.", "u": "u13", "g": null}, {"no": 171, "name": "Raqamli hisoblash tizimlari yetakchi muhandisi", "cnt": 1, "cat": "mutax.", "u": "u13", "g": null}, {"no": 172, "name": "Yetakchi muhandis-dasturlovchi", "cnt": 1, "cat": "mutax.", "u": "u13", "g": null}, {"no": 173, "name": "Muhandis-dasturlovchi", "cnt": 1, "cat": "mutax.", "u": "u13", "g": null}]};
        // Eski "seh" kalitlari yangi bo'linmalarga mos keladi (KT/КС — Energiya ta'minoti xizmati tarkibida)
        const OLD_KEY_UNIT = { 'KT /КС': 'u8' };
        let shtatTree = null;

        function cloneTree(t) { return JSON.parse(JSON.stringify(t)); }
        function getShtatTree() { return shtatTree; }
        function deriveShtatList() {
            const seen = new Set(), out = [];
            shtatTree.pos.slice().sort((a, b) => a.no - b.no).forEach(p => { const k = normTxt(p.name); if (!seen.has(k)) { seen.add(k); out.push(p.name); } });
            shtatList = out;
        }
        function saveShtatTree(t) {
            if (t) shtatTree = t;
            try { localStorage.setItem(SHTAT_TREE_KEY, JSON.stringify(shtatTree)); } catch (e) { alert("⚠️ Xotira to'ldi! Shtat saqlanmadi."); }
            deriveShtatList();
            try { localStorage.setItem(SHTAT_KEY, JSON.stringify(shtatList)); } catch (e) {}
        }
        function initShtatTree() {
            let t = null;
            try { t = JSON.parse(localStorage.getItem(SHTAT_TREE_KEY) || 'null'); } catch (e) {}
            if (!t || !Array.isArray(t.pos) || !t.pos.length) { t = cloneTree(SHTAT_2026); shtatTree = t; saveShtatTree(); }
            else { shtatTree = t; let fx = false; (t.units || []).forEach(u => { if (u && u.short === 'VH') { u.short = 'VX'; fx = true; } }); if (fx) saveShtatTree(t); else deriveShtatList(); } // v4.7: VH → VX (xizmat — X bilan)
        }
        const unitById = id => shtatTree.units.find(u => u.id === id);
        const groupById = id => shtatTree.groups.find(g => g.id === id);
        const posByNo = no => shtatTree.pos.find(p => p.no === Number(no));
        function unitForKey(key) {
            if (OLD_KEY_UNIT[key]) return unitById(OLD_KEY_UNIT[key]);
            return shtatTree.units.find(u => u.key === key) || null;
        }
        function posPath(p, short) {
            if (!p) return '';
            const u = unitById(p.u), g = p.g ? groupById(p.g) : null;
            return (u ? (short ? u.short : u.name) : '') + (g ? ' › ' + g.name : '');
        }
        function xtPlaceText(item) { const p = item && item.posNo ? posByNo(item.posNo) : null; return p ? escapeHtml(posPath(p, false)) : ''; }

        // Xodimlarni lavozimiga ko'ra avtomatik joylash (lavozim nomi shtatda aniq bitta joyda bo'lsa)
        function xtAutoAssign() {
            let changed = 0;
            allXodims().forEach(r => {
                const it = r.item;
                if (it.posNo && posByNo(it.posNo)) return;
                const k = normTxt(it.lavozim);
                if (!k || k === '—') return;
                const all = shtatTree.pos.filter(p => normTxt(p.name) === k);
                const u = unitForKey(r.su);
                const inUnit = u ? all.filter(p => p.u === u.id) : [];
                let p = null;
                if (inUnit.length === 1) p = inUnit[0]; else if (!inUnit.length && all.length === 1) p = all[0];
                if (!p) return;
                it.posNo = p.no;
                const targetKey = unitById(p.u).key;
                if (targetKey !== r.su) { // xodim tegishli bo'linma ro'yxatiga ko'chiriladi
                    sectionItemsDB.xodim[r.su] = (sectionItemsDB.xodim[r.su] || []).filter(x => x !== it);
                    if (!sectionItemsDB.xodim[targetKey]) sectionItemsDB.xodim[targetKey] = [];
                    sectionItemsDB.xodim[targetKey].push(it);
                    it.seh = targetKey;
                }
                changed++;
            });
            if (changed) saveDB(false);
            return changed;
        }

        // ============ ISHCHI XODIMLAR — daraxt bo'yicha ko'rish ============
        const XT = { u: null, g: null, pos: null, none: false, addPos: null };
        function xodimsAt(no) { return allXodims().filter(r => Number(r.item.posNo) === Number(no)); }
        function bandCount(filterFn) { return allXodims().filter(r => { const p = r.item.posNo ? posByNo(r.item.posNo) : null; return p && filterFn(p); }).length; }
        function shtatSum(list) { return list.reduce((s, p) => s + (Number(p.cnt) || 0), 0); }
        function cntBadge(band, cnt) {
            const cls = band > cnt ? 'over' : (band === cnt && cnt > 0 ? 'full' : (band > 0 ? 'part' : 'empty'));
            return `<span class="xt-cnt ${cls}">${band}/${cnt}</span>`;
        }
        function openXodimTree() {
            XT.u = null; XT.g = null; XT.pos = null; XT.none = false;
            $id('xtSearch').value = '';
            currentSectionType = 'xodim'; currentSectionTitle = 'Ishchi xodimlar';
            openScreen('screen-xt');
            xtRender();
        }
        function xtGo(u, g, pos) {
            XT.u = u || null; XT.g = g || null; XT.pos = pos || null; XT.none = false;
            $id('xtSearch').value = '';
            xtRender();
            $id('xtBody').scrollTop = 0;
        }
        function xtBack() {
            if ($id('xtSearch').value.trim()) { $id('xtSearch').value = ''; xtRender(); return; }
            if (XT.none) { XT.none = false; xtRender(); return; }
            if (XT.pos) { const p = posByNo(XT.pos); XT.pos = null; if (p && !p.g) XT.g = null; xtRender(); return; }
            if (XT.g) { XT.g = null; xtRender(); return; }
            if (XT.u) { XT.u = null; xtRender(); return; }
            openScreen('screen-main');
        }
        function xtCrumbs() {
            const parts = [`<span onclick="xtGo()">Ishchi xodimlar</span>`];
            if (XT.none) parts.push('Lavozimga biriktirilmaganlar');
            const u = XT.u ? unitById(XT.u) : null, g = XT.g ? groupById(XT.g) : null, p = XT.pos ? posByNo(XT.pos) : null;
            if (u) parts.push(`<span onclick="xtGo('${u.id}')">${escapeHtml(u.short)}</span>`);
            if (g) parts.push(`<span onclick="xtGo('${u.id}','${g.id}')">${escapeHtml(g.name)}</span>`);
            if (p) parts.push('№' + p.no);
            $id('xtCrumbs').innerHTML = parts.join(' › ');
        }
        function xtPosRow(p) {
            return `<div class="xt-pos" onclick="xtGo('${p.u}', ${p.g ? `'${p.g}'` : 'null'}, ${p.no})"><span class="xt-no">${p.no}</span><span class="xt-name">${escapeHtml(p.name)}</span>${cntBadge(xodimsAt(p.no).length, p.cnt)}<span class="btn-arrow">›</span></div>`;
        }
        function xtFolderCard(title, sub, onclick, extraCls) {
            return `<div class="btn-card xt-unit ${extraCls || ''}" onclick="${onclick}"><div class="btn-card-content"><span class="btn-text">${escapeHtml(title)}<span class="xt-sub">${sub}</span></span></div><span class="btn-arrow">›</span></div>`;
        }
        function xtXodimCard(r) {
            const it = r.item, p = it.posNo ? posByNo(it.posNo) : null, age = computeAgeFromDate(it.birthDate);
            return `<div class="vagon-card">
                <div class="vagon-header-row"><div class="vagon-num">${escapeHtml(it.name)}</div></div>
                <div class="vagon-info">Lavozim: <span>${escapeHtml(it.lavozim || '—')}</span>${p ? `<br>Joyi: <span>${escapeHtml(posPath(p, true))}</span>` : ''}
                    <div class="card-row"><span>Tabel №: <span>${escapeHtml(it.tabel)}</span> | Razryad: <span>${it.razryad ? escapeHtml(it.razryad) : '—'}</span> | Yoshi: <span>${age === null ? '—' : age}</span></span>${it.phone ? `<a class="tel-link card-tel" href="${telHref(it.phone)}" onclick="event.stopPropagation()">📞 ${escapeHtml(it.phone)}</a>` : ''}</div></div>
                <button class="details-btn" onclick="xtOpenXodim(${it.id})">Pasport va Rasmlar</button>
            </div>`;
        }
        function xtMatch(it, q) {
            const n = normTxt(q);
            if (!n) return true;
            const p = it.posNo ? posByNo(it.posNo) : null;
            const hay = normTxt([it.name, it.tabel, it.lavozim, p ? posPath(p) : ''].join(' '));
            return n.split(' ').every(t => hay.includes(t)) || phoneMatch(it, q);
        }
        function xtRender() {
            if (!shtatTree) return;
            const box = $id('xtList');
            const q = $id('xtSearch').value.trim();
            const u = XT.u ? unitById(XT.u) : null, g = XT.g ? groupById(XT.g) : null, p = XT.pos ? posByNo(XT.pos) : null;
            $id('xtTitle').innerText = p ? ('Lavozim №' + p.no) : (g ? 'Bo\'lim' : (u ? u.short : (XT.none ? 'Biriktirilmaganlar' : 'Ishchi xodimlar')));
            xtCrumbs();
            $id('xtFab').classList.toggle('hidden', !(p && isAdmin() && !q));
            if (q) { // qidiruv — barcha xodimlar bo'yicha
                const res = allXodims().filter(r => xtMatch(r.item, q));
                box.innerHTML = `<div class="xt-sec">Topildi: ${res.length} ta xodim</div>` + (res.map(xtXodimCard).join('') || '<div class="xt-empty">Hech kim topilmadi</div>');
                return;
            }
            if (XT.none) { // lavozimga biriktirilmaganlar
                const list = allXodims().filter(r => !(r.item.posNo && posByNo(r.item.posNo)));
                const demo = list.filter(r => ['Alisher Karimov', 'Sardor Rahimov'].includes(r.item.name) && ['3547', '4120'].includes(cleanTabel(r.item.tabel)));
                box.innerHTML = `<div class="xt-head"><b>Lavozimga biriktirilmagan xodimlar: ${list.length} ta</b><span class="xt-sub">Pasportini ochib ✏️ Tahrirlash orqali shtatdagi lavozimini tanlang — xodim o'z joyiga o'tadi.</span></div>` +
                    (isAdmin() && demo.length ? `<button class="xt-tool" onclick="xtDeleteDemo()">🧹 Namuna xodimlarni o'chirish (Alisher Karimov, Sardor Rahimov — ${demo.length} ta)</button>` : '') +
                    (list.map(xtXodimCard).join('') || '<div class="xt-empty">Hammasi joyida ✅</div>');
                return;
            }
            if (p) { // lavozim — xodimlar kartalari
                const list = xodimsAt(p.no);
                const free = Math.max(0, (Number(p.cnt) || 0) - list.length);
                let html = `<div class="xt-head"><b>№${p.no}. ${escapeHtml(p.name)}</b><span class="xt-sub">${escapeHtml(posPath(p, false))}<br>Shtat: ${p.cnt} birlik · ${escapeHtml(p.cat || '')} · Band: ${list.length} · Bo'sh: ${free}</span></div>`;
                html += list.map(xtXodimCard).join('');
                for (let i = 0; i < free; i++) html += `<div class="xt-vacant${isAdmin() ? ' can' : ''}" ${isAdmin() ? 'onclick="xtAddXodim()"' : ''}>${isAdmin() ? '➕ Bo\'sh o\'rin — xodim qo\'shish' : 'Bo\'sh o\'rin'}</div>`;
                if (!list.length && !free) html += '<div class="xt-empty">Bu lavozimda xodim yo\'q</div>';
                box.innerHTML = html;
                return;
            }
            if (u) { // bo'linma yoki bo'lim ichi
                const direct = shtatTree.pos.filter(x => x.u === u.id && (g ? x.g === g.id : !x.g)).sort((a, b) => a.no - b.no);
                let html = '';
                if (g) {
                    const all = direct;
                    html += `<div class="xt-head"><b>${escapeHtml(g.name)}</b><span class="xt-sub">${escapeHtml(u.name)}<br>${all.length} lavozim · Shtat: ${shtatSum(all)} · Band: ${bandCount(x => x.g === g.id)}</span></div>`;
                    html += direct.map(xtPosRow).join('') || '<div class="xt-empty">Lavozim yo\'q</div>';
                } else {
                    const allU = shtatTree.pos.filter(x => x.u === u.id);
                    html += `<div class="xt-head"><b>${escapeHtml(u.name)}</b><span class="xt-sub">${allU.length} lavozim · Shtat: ${shtatSum(allU)} birlik · Band: ${bandCount(x => x.u === u.id)}</span></div>`;
                    if (direct.length) html += `<div class="xt-sec">Rahbariyat va umumiy lavozimlar</div>` + direct.map(xtPosRow).join('');
                    const groups = shtatTree.groups.filter(x => x.u === u.id);
                    if (groups.length) html += `<div class="xt-sec">Bo'limlar va uchastkalar (${groups.length})</div>` + groups.map(gr => {
                        const ps = shtatTree.pos.filter(x => x.g === gr.id);
                        return xtFolderCard(gr.name, `${ps.length} lavozim · ${bandCount(x => x.g === gr.id)}/${shtatSum(ps)} band`, `xtGo('${u.id}','${gr.id}')`);
                    }).join('');
                }
                box.innerHTML = html;
                return;
            }
            // Yuqori daraja — bo'linmalar
            const none = allXodims().filter(r => !(r.item.posNo && posByNo(r.item.posNo))).length;
            const total = shtatSum(shtatTree.pos), band = bandCount(() => true);
            let html = `<div class="xt-head"><b>STTB shtati: ${total} birlik · Band: ${band}</b><span class="xt-sub">${escapeHtml(shtatTree.src || '')}</span></div>`;
            shtatTree.units.forEach((un, i) => {
                if (i === 0) html += `<div class="xt-sec">Boshqaruv apparati</div>`;
                if (i === 1) html += `<div class="xt-sec">Ishlab chiqarish xodimlari</div>`;
                const ps = shtatTree.pos.filter(x => x.u === un.id);
                html += xtFolderCard(un.name, `${ps.length} lavozim · ${bandCount(x => x.u === un.id)}/${shtatSum(ps)} band`, `xtGo('${un.id}')`);
            });
            if (none) html += `<div class="xt-sec">Diqqat</div>` + xtFolderCard('⚠️ Lavozimga biriktirilmagan xodimlar', `${none} ta — lavozimini tanlash kerak`, `XT.none=true; XT.u=null; XT.g=null; XT.pos=null; xtRender()`, 'xt-warn');
            box.innerHTML = html;
        }
        function xtOpenXodim(id) {
            const r = allXodims().find(x => x.item.id === id);
            if (!r) return;
            currentSectionType = 'xodim'; currentSubUnit = r.su;
            openItemPasport(id);
        }
        // Xodim pasportidan orqaga — xodim bo'lsa daraxtga qaytadi
        function itemPasportBack() {
            if (currentSectionType === 'xodim') { openScreen('screen-xt'); xtRender(); }
            else openSectionItems(currentSubUnit);
        }
        async function xtAddXodim() {
            const p = XT.pos ? posByNo(XT.pos) : null;
            if (!p || !isAdmin()) return;
            const band = xodimsAt(p.no).length;
            if (band >= p.cnt && !await uiConfirm("Bu lavozimda shtat birligi to'lgan (" + band + "/" + p.cnt + "). Baribir qo'shilsinmi?")) return;
            currentSectionType = 'xodim'; currentSubUnit = unitById(p.u).key;
            openAddItemModal();
            XT.addPos = p;
            $id('aiCombo').classList.add('hidden');
            $id('aiPosFixed').classList.remove('hidden');
            $id('aiPosFixed').innerHTML = `№${p.no}. ${escapeHtml(p.name)}<small>${escapeHtml(posPath(p, false))}</small>`;
            $id('ai-lavozim').value = p.name;
            $id('aiLavozimSearch').value = p.name;
        }
        function xtResetAddPos() {
            XT.addPos = null;
            const c = $id('aiCombo'), f = $id('aiPosFixed');
            if (c) c.classList.remove('hidden');
            if (f) f.classList.add('hidden');
        }
        async function xtDeleteDemo() {
            if (!isAdmin()) return;
            const list = allXodims().filter(r => !(r.item.posNo && posByNo(r.item.posNo)) && ['Alisher Karimov', 'Sardor Rahimov'].includes(r.item.name) && ['3547', '4120'].includes(cleanTabel(r.item.tabel)));
            if (!list.length) return;
            if (!await uiConfirm(list.length + " ta namuna xodim (Alisher Karimov, Sardor Rahimov) o'chirilsinmi?\n(Xato bo'lsa, ↩️ bilan qaytarish mumkin)")) return;
            list.forEach(r => { sectionItemsDB.xodim[r.su] = (sectionItemsDB.xodim[r.su] || []).filter(x => x !== r.item); });
            saveDB();
            xtRender();
            showToast("🧹 " + list.length + " ta namuna xodim o'chirildi");
        }

        // ============ XODIM TAHRIRIDA LAVOZIM — shtatdagi aniq o'rin bilan ============
        const XP = { items: [], active: -1 };
        function xpMatches(q) {
            const toks = normTxt(q).split(' ').filter(Boolean);
            return shtatTree.pos.filter(p => { const h = normTxt(p.no + ' ' + p.name + ' ' + posPath(p) + ' ' + unitById(p.u).short); return toks.every(t => h.includes(t)); }).sort((a, b) => a.no - b.no);
        }
        function xpOpen(q) {
            XP.items = xpMatches(q);
            XP.active = XP.items.length && String(q || '').trim() ? 0 : -1;
            const sel = Number($id('xePosNo').value);
            const shown = XP.items.slice(0, 80);
            let html = `<div class="combo-meta">${String(q || '').trim() ? XP.items.length + ' / ' + shtatTree.pos.length : shtatTree.pos.length} ta lavozim${XP.items.length > 80 ? ' — aniqroq yozing' : ''}</div>`;
            if (!XP.items.length) html += '<div class="combo-empty">Mos lavozim topilmadi</div>';
            html += shown.map((p, k) => `<div class="combo-opt${p.no === sel ? ' selected' : ''}${k === XP.active ? ' active' : ''}" onpointerdown="event.preventDefault()" onclick="xpChoose(${k})">№${p.no}. ${highlightMatch(p.name, q)}<div class="wl-sub">${escapeHtml(posPath(p, true))} · ${xodimsAt(p.no).length}/${p.cnt}</div></div>`).join('');
            $id('xpList').innerHTML = html;
            $id('xpList').classList.remove('hidden');
            $id('xpCombo').classList.add('open');
        }
        function xpShowSelected() {
            const p = posByNo($id('xePosNo').value);
            $id('xpSearch').value = p ? ('№' + p.no + '. ' + p.name) : '';
            $id('xpPath').innerText = p ? posPath(p, false) : "Lavozim tanlanmagan";
        }
        function xpClose() { $id('xpList').classList.add('hidden'); $id('xpCombo').classList.remove('open'); xpShowSelected(); }
        function xpChoose(k) {
            const p = XP.items[k];
            if (!p) return;
            $id('xePosNo').value = p.no;
            $id('xeLavozim').value = p.name;
            xpClose(); $id('xpSearch').blur();
        }
        function xpToggle() { if ($id('xpList').classList.contains('hidden')) $id('xpSearch').focus(); else $id('xpSearch').blur(); }
        function initXpCombo() {
            const inp = $id('xpSearch');
            inp.addEventListener('focus', () => { inp.value = ''; xpOpen(''); });
            inp.addEventListener('input', () => xpOpen(inp.value));
            inp.addEventListener('blur', () => setTimeout(xpClose, 150));
            inp.addEventListener('keydown', e => {
                if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                    e.preventDefault(); if (!XP.items.length) return;
                    XP.active = e.key === 'ArrowDown' ? Math.min(Math.min(XP.items.length, 80) - 1, XP.active + 1) : Math.max(0, XP.active - 1);
                    $id('xpList').querySelectorAll('.combo-opt').forEach((el, k) => el.classList.toggle('active', k === XP.active));
                } else if (e.key === 'Enter') { e.preventDefault(); if (XP.active >= 0) xpChoose(XP.active); else if (XP.items.length === 1) xpChoose(0); }
                else if (e.key === 'Escape') inp.blur();
            });
        }

        // ============ SHTATLAR RO'YXATI — bo'linmalar bo'yicha (eski ro'yxat o'rniga) ============
        const SHT = { open: new Set() };
        function shtToggleUnit(id) { if (SHT.open.has(id)) SHT.open.delete(id); else SHT.open.add(id); renderShtatList(); }
        function shtPosHtml(p, q) {
            const band = xodimsAt(p.no).length;
            return `<div class="sht-pos"><span class="xt-no">${p.no}</span><span class="sht-pname">${highlightMatch(p.name, q)}<span class="sht-pmeta">${p.cnt} birlik · ${escapeHtml(p.cat || '')} · band: ${band}</span></span>
                <button class="shtat-crown ${isRahbarLavozim(p.name) ? 'on' : ''}" onclick="shtCrown(${p.no})" title="Rahbar lavozimi">👑</button>
                <button class="shtat-act" onclick="openShtPos(${p.no})" title="Tahrirlash">✏️</button>
                <button class="shtat-act" onclick="shtDelPos(${p.no})" title="O'chirish">🗑</button></div>`;
        }
        function renderShtatList() {
            const box = document.getElementById('shtatListContainer');
            if (!box || !shtatTree) return;
            const q = document.getElementById('shtatSearchInput').value.trim();
            const toks = normTxt(q).split(' ').filter(Boolean);
            const hit = p => !toks.length || toks.every(t => normTxt(p.no + ' ' + p.name + ' ' + posPath(p)).includes(t));
            const shown = shtatTree.pos.filter(hit);
            document.getElementById('shtatMeta').innerText = (q ? ("Topildi: " + shown.length + " / ") : "") + shtatTree.pos.length + " lavozim · " + shtatSum(shtatTree.pos) + " shtat birligi · " + shtatTree.units.length + " bo'linma";
            let html = '';
            shtatTree.units.forEach(u => {
                const ps = shown.filter(p => p.u === u.id);
                if (q && !ps.length) return;
                const open = q ? true : SHT.open.has(u.id);
                let body = '';
                const direct = ps.filter(p => !p.g && p.cat !== 'ishchi').sort((a, b) => a.no - b.no);
                body += direct.map(p => shtPosHtml(p, q)).join('');
                const wpx = ps.filter(p => !p.g && p.cat === 'ishchi').sort((a, b) => a.name.localeCompare(b.name)); // v3.14.2: ishchilar shtati — alohida
                const wbody = wpx.length ? `<div class="sht-group-h"><span>👷 Ishchilar — ${wpx.length} kasb · ${shtatSum(wpx)} shtat birligi</span></div>` + wpx.map(p => shtPosHtml(p, q)).join('') : '';
                shtatTree.groups.filter(g => g.u === u.id).forEach(g => {
                    const gp = ps.filter(p => p.g === g.id).sort((a, b) => a.no - b.no);
                    if (q && !gp.length) return;
                    body += `<div class="sht-group-h"><span>${escapeHtml(g.name)}</span><button onclick="shtRenameGroup('${g.id}')" title="Nomini o'zgartirish">✏️</button>${gp.length ? '' : `<button onclick="shtDelGroup('${g.id}')" title="O'chirish">🗑</button>`}</div>` + gp.map(p => shtPosHtml(p, q)).join('');
                });
                body += wbody;
                const all = shtatTree.pos.filter(p => p.u === u.id);
                html += `<div class="sht-unit${open ? ' open' : ''}"><div class="sht-unit-h" onclick="shtToggleUnit('${u.id}')"><span class="sht-arrow">▸</span><b>${escapeHtml(u.name)}</b><span class="sht-total">${all.length} / ${shtatSum(all)}</span></div><div class="sht-unit-b">${body || '<div class="xt-empty">Lavozim yo\'q</div>'}</div></div>`;
            });
            box.innerHTML = html || '<div class="shtat-empty">Bunday lavozim topilmadi.</div>';
        }
        function shtCrown(no) {
            if (!shtatUnlocked) return;
            const p = posByNo(no); if (!p) return;
            let a = getRahbarList();
            if (isRahbarLavozim(p.name)) a = a.filter(x => normTxt(x) !== normTxt(p.name)); else a.push(p.name);
            saveRahbarList(a);
            renderShtatList();
            showToast(isRahbarLavozim(p.name) ? ("👑 \"" + p.name + "\" — rahbar lavozimi") : ("\"" + p.name + "\" rahbar lavozimlaridan olindi"));
        }
        let spEditNo = null;
        function spFillGroups(sel) {
            const uid = $id('spUnit').value;
            $id('spGroup').innerHTML = `<option value="">— Bo'linmaning o'zi (rahbariyat va umumiy) —</option>` +
                shtatTree.groups.filter(g => g.u === uid).map(g => `<option value="${g.id}">${escapeHtml(g.name)}</option>`).join('') +
                `<option value="__new">➕ Yangi bo'lim / uchastka...</option>`;
            $id('spGroup').value = sel || '';
            spGroupChanged();
        }
        function spGroupChanged() { $id('spNewGroupBox').classList.toggle('hidden', $id('spGroup').value !== '__new'); }
        function openShtatAdd() { openShtPos(null); }
        function openShtPos(no) {
            if (!shtatUnlocked) { openShtat(); return; }
            spEditNo = no;
            const p = no ? posByNo(no) : null;
            $id('spTitle').innerText = p ? ("✏️ Lavozim №" + p.no) : "➕ Lavozim qo'shish";
            $id('spNameLabel').innerText = p ? "Lavozim nomi:" : "Lavozim nomi (bir nechtasi bo'lsa — har biri yangi qatordan):";
            $id('spUnit').innerHTML = shtatTree.units.map(u => `<option value="${u.id}">${escapeHtml(u.name)}</option>`).join('');
            const openU = p ? p.u : (Array.from(SHT.open)[0] || shtatTree.units[0].id);
            $id('spUnit').value = openU;
            spFillGroups(p ? (p.g || '') : '');
            $id('spNewGroup').value = '';
            $id('spName').value = p ? p.name : '';
            $id('spCnt').value = p ? p.cnt : 1;
            $id('spCat').value = p ? (p.cat || 'mutax.') : 'mutax.';
            $id('spErr').innerText = '';
            $id('shtPosModal').classList.remove('hidden');
        }
        function spSave() {
            if (!shtatUnlocked) return;
            const err = $id('spErr');
            const uid = $id('spUnit').value;
            let gid = $id('spGroup').value;
            const cnt = parseInt($id('spCnt').value, 10);
            if (!(cnt >= 1 && cnt <= 999)) { err.innerText = "Birliklar soni 1 dan 999 gacha bo'lishi kerak."; return; }
            if (gid === '__new') {
                const gname = $id('spNewGroup').value.replace(/\s+/g, ' ').trim();
                if (!gname) { err.innerText = "Yangi bo'lim / uchastka nomini yozing."; return; }
                gid = uid + 'g' + Date.now().toString(36);
                shtatTree.groups.push({ id: gid, u: uid, name: gname });
            }
            const cat = $id('spCat').value;
            if (spEditNo) {
                const p = posByNo(spEditNo);
                const nm = $id('spName').value.replace(/\s+/g, ' ').trim();
                if (!nm) { err.innerText = "Lavozim nomini yozing."; return; }
                const oldNm = p.name;
                p.name = nm; p.cnt = cnt; p.cat = cat; p.u = uid; p.g = gid || null;
                if (normTxt(oldNm) !== normTxt(nm)) {
                    xodimsAt(p.no).forEach(r => { r.item.lavozim = nm; });
                    const ra = getRahbarList(); const k = ra.findIndex(x => normTxt(x) === normTxt(oldNm));
                    if (k >= 0 && !shtatTree.pos.some(x => x !== p && normTxt(x.name) === normTxt(oldNm))) { ra[k] = nm; saveRahbarList(ra); }
                }
                // xodimlar yangi bo'linmaga ko'chsa — ro'yxati ham ko'chadi
                const key = unitById(uid).key;
                xodimsAt(p.no).forEach(r => { if (r.su !== key) { sectionItemsDB.xodim[r.su] = sectionItemsDB.xodim[r.su].filter(x => x !== r.item); (sectionItemsDB.xodim[key] = sectionItemsDB.xodim[key] || []).push(r.item); r.item.seh = key; } });
                saveDB();
            } else {
                const names = parseShtatText($id('spName').value);
                if (!names.length) { err.innerText = "Lavozim nomini yozing."; return; }
                let no = shtatTree.pos.reduce((m, x) => Math.max(m, x.no), 0);
                names.forEach(nm => { shtatTree.pos.push({ no: ++no, name: nm, cnt: cnt, cat: cat, u: uid, g: gid || null }); });
                showToast("✅ " + names.length + " ta lavozim qo'shildi");
            }
            saveShtatTree();
            SHT.open.add(uid);
            $id('shtPosModal').classList.add('hidden');
            renderShtatList();
        }
        async function shtDelPos(no) {
            if (!shtatUnlocked) return;
            const p = posByNo(no); if (!p) return;
            const band = xodimsAt(no).length;
            if (band) { alert("Bu lavozimda " + band + " ta xodim bor. Avval ularni boshqa lavozimga o'tkazing (xodim pasporti → ✏️ Tahrirlash)."); return; }
            if (!await uiConfirm("№" + p.no + ". \"" + p.name + "\" shtatdan o'chirilsinmi?")) return;
            shtatTree.pos = shtatTree.pos.filter(x => x !== p);
            saveShtatTree();
            renderShtatList();
        }
        async function shtRenameGroup(gid) {
            if (!shtatUnlocked) return;
            const g = groupById(gid); if (!g) return;
            const v = await uiPrompt("Bo'lim / uchastka nomi:", g.name);
            if (v === null) return;
            const nv = v.replace(/\s+/g, ' ').trim();
            if (!nv) return;
            g.name = nv; saveShtatTree(); renderShtatList();
        }
        async function shtDelGroup(gid) {
            if (!shtatUnlocked) return;
            if (shtatTree.pos.some(p => p.g === gid)) return;
            if (!await uiConfirm("Bo'sh bo'lim / uchastka o'chirilsinmi?")) return;
            shtatTree.groups = shtatTree.groups.filter(g => g.id !== gid);
            saveShtatTree(); renderShtatList();
        }


