        // =====================================================================
        // v2.4 — Harakat tarkibi: holat belgilarining izohi
        // =====================================================================
        var HR_SHORT = { tarkib: 'Tarkibda', ishda: 'Ishda', kutish: 'Kutishda', yuklash: 'Yuklashda', bosh: 'Boʻsh', tamirda: 'Taʼmirda' };
        var HR_TSHORT = { yukli: 'Yukli', yuksiz: 'Yuksiz', kutish: 'Kutishda', yuklash: 'Yuklashda' };
        function hrLegendHtml() {
            return `<details class="hr-legend"><summary>ℹ️ Belgilar izohi</summary><div><b>Tarkiblar:</b> ${Object.keys(HR_T).map(k => HR_T[k][0] + ' ' + escapeHtml(HR_T[k][1])).join(' · ')}</div><div><b>Texnika:</b> ${Object.keys(HR_U).map(k => HR_U[k][0] + ' ' + escapeHtml(HR_U[k][1])).join(' · ')}</div>${typeof hdLegendHtml === 'function' ? '<div><b>Chizmalar:</b></div>' + hdLegendHtml() : ''}</details>`;
        }

