        // =====================================================================
        // 6.2 — Yopiq kontur, yakuniy: tashqi (bulut) sunʼiy intellekt butunlay oʻchirilgan.
        //  • aiCloudReady() har doim «yoʻq» qaytaradi — hech qaysi boʻlim tashqi AI ga murojaat qilmaydi;
        //  • aiCloudCall() chaqirilsa — xato: «Yopiq kontur»; maʼlumot hech qayerga yuborilmaydi;
        //  • Parametrlardagi «Sunʼiy intellekt (AI) ulanishi» tugmasi yashirilgan (markup/body.html).
        //  Ilova ichidagi «aqlli» funksiyalar (qidiruv, tekshiruvlar, eslatmalar) — ilovaning oʻz algoritmlari, ular ishlaydi.
        // =====================================================================
        (function () {
            const Y: any = window as any;
            try {
                if (typeof Y.aiCloudReady === 'function') Y.aiCloudReady = Y.agmkExtend('aiCloudReady', '6.2: yopiq kontur — tashqi AI oʻchirilgan', Y.aiCloudReady, () => function () { return false; });
                if (typeof Y.aiCloudCall === 'function') Y.aiCloudCall = Y.agmkExtend('aiCloudCall', '6.2: yopiq kontur — tashqi AI oʻchirilgan', Y.aiCloudCall, () => async function () { throw new Error('🔒 Yopiq kontur: tashqi sunʼiy intellekt oʻchirilgan'); });
            } catch (e) { /* */ }
        })();
