// ==UserScript==
// @name         MedEx Generic Scraper
// @namespace    medex-generics
// @version      4.0
// @match        https://medex.com.bd/generics/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    var url = window.location.href;
    var genId = url.match(/\/generics\/(\d+)/)?.[1] || '';
    var isBrandsPage = url.includes('/brand-names');
    var isGenericPage = !isBrandsPage && url.includes('/generics/');

    function save(k, v) {
        var s = JSON.parse(localStorage.getItem('mx_gen4') || '{}');
        s[k] = v;
        localStorage.setItem('mx_gen4', JSON.stringify(s));
    }

    setTimeout(function() {

        // === BRANDS PAGE / GENERIC PAGE WITH BRANDS ===
        function extractBrandPrices() {
            var brands = [];
            document.querySelectorAll('tr.brand-row').forEach(function(tr) {
                var name = tr.getAttribute('data-name') || '';
                var company = tr.getAttribute('data-company') || '';
                var strength = tr.getAttribute('data-strength') || '';
                var price = tr.getAttribute('data-price') || '';
                var dosageForm = (tr.querySelector('td:nth-child(2)')?.textContent || '').trim();
                var companyName = (tr.querySelector('td:nth-child(4)')?.textContent || '').trim();

                var unitPrice = '';
                var packInfo = '';
                var containers = tr.querySelectorAll('.package-container');
                containers.forEach(function(c) {
                    var up = c.querySelector('span:nth-child(2)')?.textContent?.trim()?.replace(/[^0-9.]/g, '') || '';
                    var pi = c.querySelector('.pack-size-info')?.textContent?.trim() || '';
                    if (!unitPrice && up) unitPrice = up;
                    if (pi) packInfo += (packInfo ? ' | ' : '') + pi;
                });

                if (!name) return;
                brands.push({
                    brand: name,
                    strength: strength,
                    dosageForm: dosageForm,
                    company: companyName || company,
                    unitPrice: unitPrice || price,
                    packInfo: packInfo
                });
            });
            return brands;
        }

        if (isBrandsPage || isGenericPage) {
            if (isBrandsPage) {
                var prices = extractBrandPrices();
                if (prices.length) {
                    save('gen_' + genId + '_prices', prices);
                    var badge = document.querySelector('#mxbadge') || document.createElement('div');
                    badge.id = 'mxbadge'; badge.style.cssText = 'position:fixed;bottom:20px;right:20px;background:#22c55e;color:white;padding:10px 18px;border-radius:10px;font:bold 14px sans-serif;z-index:99999;cursor:pointer';
                    badge.textContent = 'Gen ' + genId + ' | Prices: ' + prices.length;
                    if (!document.querySelector('#mxbadge')) document.body.appendChild(badge);
                }
                setTimeout(function() { window.location.href = 'https://medex.com.bd/generics/' + (parseInt(genId)+1); }, 3000);
                return;
            }

            // === GENERIC PAGE: Medical info ===
            var titleEl = document.querySelector('h1') || document.querySelector('[class*="page-title"]');
            var genName = titleEl ? titleEl.textContent.trim() : '';
            var acs = document.querySelectorAll('.ac-body');
            var content = '';
            acs.forEach(function(el) { content += el.textContent.trim() + '\n\n'; });

            if (content.length > 100) {
                save('gen_' + genId, { name: genName, id: genId, content: content });
            }

            // Check for "View More Brands" or brand-names link
            var moreBtn = Array.from(document.querySelectorAll('a, button')).find(function(el) {
                return /view.*more.*brand|show.*all|load.*more/i.test(el.textContent||'');
            }) || document.querySelector('a[href*="brand-names"]');

            if (moreBtn) {
                var brandUrl = moreBtn.href || moreBtn.getAttribute('data-url') || url.replace(/\/$/, '') + '/brand-names';
                setTimeout(function() { window.location.href = brandUrl; }, 2500 + Math.random() * 1500);
                return;
            }

            // No "View More" → scrape visible brands on this page
            var prices = extractBrandPrices();
            if (prices.length) {
                save('gen_' + genId + '_prices', prices);
            }

            // Totals for badge
            var stored = JSON.parse(localStorage.getItem('mx_gen4') || '{}');
            var totalGens = Object.keys(stored).filter(function(k) { return !k.endsWith('_prices'); }).length;
            var totalPrices = Object.keys(stored).filter(function(k) { return k.endsWith('_prices'); })
                .reduce(function(s,k) { return s + stored[k].length; }, 0);

            var badge = document.querySelector('#mxbadge') || document.createElement('div');
            badge.id = 'mxbadge'; badge.style.cssText = 'position:fixed;bottom:20px;right:20px;background:#8b5cf6;color:white;padding:10px 18px;border-radius:10px;font:bold 14px sans-serif;z-index:99999;cursor:pointer';
            badge.textContent = 'Pg ' + genId + '/2656 | ' + totalGens + ' gens | ' + totalPrices + ' prices';
            badge.onclick = function() {
                var blob = new Blob([JSON.stringify(JSON.parse(localStorage.getItem('mx_gen4')||'{}'),null,2)], {type:'application/json'});
                var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'medex_generics.json'; a.click();
            };
            if (!document.querySelector('#mxbadge')) document.body.appendChild(badge);

            setTimeout(function() { window.location.href = 'https://medex.com.bd/generics/' + (parseInt(genId)+1); }, 2000 + Math.random() * 1500);
        }

    }, 4000);
})();
