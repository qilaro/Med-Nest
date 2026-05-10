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
            // Method 1: tr.brand-row (brand-names page)
            document.querySelectorAll('tr.brand-row').forEach(function(tr) {
                var name = tr.getAttribute('data-name') || '';
                var company = tr.getAttribute('data-company') || '';
                var strength = tr.getAttribute('data-strength') || '';
                var price = tr.getAttribute('data-price') || '';
                var dosageForm = (tr.querySelector('td:nth-child(2)')?.textContent || '').trim();
                var companyName = (tr.querySelector('td:nth-child(4)')?.textContent || '').trim();
                var unitPrice = '';
                var packInfo = '';
                tr.querySelectorAll('.package-container').forEach(function(c) {
                    var up = c.querySelector('span:nth-child(2)')?.textContent?.trim()?.replace(/[^0-9.]/g, '') || '';
                    var pi = c.querySelector('.pack-size-info')?.textContent?.trim() || '';
                    if (!unitPrice && up) unitPrice = up;
                    if (pi) packInfo += (packInfo ? ' | ' : '') + pi;
                });
                if (!name) return;
                brands.push({ brand: name, strength: strength, dosageForm: dosageForm, company: companyName || company, unitPrice: unitPrice || price, packInfo: packInfo });
            });

            // Method 2: .hoverable-block (generic page, no "View More" button)
            if (!brands.length) {
                document.querySelectorAll('.hoverable-block').forEach(function(block) {
                    var dr = block.querySelector('.data-row');
                    if (!dr) return;
                    var brandEl = dr.querySelector('.data-row-top');
                    var strEl = dr.querySelector('.data-row-strength');
                    var coEl = dr.querySelector('.data-row-company');
                    var priceEl = block.querySelector('.package-pricing, [class*="price"]');
                    var name = brandEl ? brandEl.textContent.trim().replace(/^\S+\s+/, '') : '';
                    var strength = strEl ? strEl.textContent.trim() : '';
                    var company = coEl ? coEl.textContent.trim() : '';
                    var price = '';
                    if (priceEl) {
                        var m = priceEl.textContent.match(/[\d,]+\.?\d*/);
                        if (m) price = m[0].replace(/,/g, '');
                    }
                    if (name) brands.push({ brand: name, strength: strength, dosageForm: '', company: company, unitPrice: price, packInfo: '' });
                });
            }

            return brands;
        }

        if (isBrandsPage || isGenericPage) {
            if (isBrandsPage) {
                var prices = extractBrandPrices();
                if (prices.length) save('gen_' + genId + '_prices', prices);

                var stored = JSON.parse(localStorage.getItem('mx_gen4') || '{}');
                var tg = Object.keys(stored).filter(function(k) { return !k.endsWith('_prices'); }).length;
                var tp = Object.keys(stored).filter(function(k) { return k.endsWith('_prices'); }).reduce(function(s,k) { return s + stored[k].length; }, 0);
                updateBadge('Pg ' + genId + '/2656 | ' + tg + ' gens | ' + tp + ' prices');

                setTimeout(function() { window.location.href = 'https://medex.com.bd/generics/' + (parseInt(genId)+1); }, 3000);
                return;
            }
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

            // Only care about "View More Brands" button — NOT "View All"
            var moreBtn = Array.from(document.querySelectorAll('a, button')).find(function(el) {
                var t = (el.textContent || '').toLowerCase().trim();
                return t.indexOf('view more brand') !== -1 || t.indexOf('view more brands') !== -1;
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
            updateBadge('Pg ' + genId + '/2656 | ' + totalGens + ' gens | ' + totalPrices + ' prices');

            setTimeout(function() { window.location.href = 'https://medex.com.bd/generics/' + (parseInt(genId)+1); }, 2000 + Math.random() * 1500);
        }

    }, 4000);
})();
