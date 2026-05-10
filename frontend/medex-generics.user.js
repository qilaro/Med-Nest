// ==UserScript==
// @name         MedEx Generic Scraper
// @namespace    medex-generics
// @version      3.0
// @match        https://medex.com.bd/generics/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    var url = window.location.href;
    var isBrandsPage = url.includes('/brand-names');
    var isGenericPage = !isBrandsPage && url.includes('/generics/');

    setTimeout(function() {

        function saveAndShow(key, val) {
            var s = JSON.parse(localStorage.getItem('mx_gen') || '{}');
            s[key] = val;
            localStorage.setItem('mx_gen', JSON.stringify(s));
        }

        function extractPrice(el) {
            if (!el) return '';
            // Try package-pricing first
            var pp = el.querySelector('.package-pricing') || el.querySelector('[class*="package-pricing"]') || (el.closest && el.closest('.hoverable-block')?.querySelector('.package-pricing')) || (el.closest && el.closest('tr')?.querySelector('[class*="package-pricing"]'));
            if (pp) {
                var m = pp.textContent.match(/[\d,]+\.?\d*/);
                if (m && parseFloat(m[0]) > 0) return m[0].replace(/,/g, '');
            }
            // Any number in the text
            var txt = el.textContent;
            var nums = txt.match(/[\d,]+\.?\d*/g);
            if (nums) {
                for (var i = 0; i < nums.length; i++) {
                    var n = parseFloat(nums[i].replace(/,/g, ''));
                    if (n > 0 && n < 1000000) return n.toString();
                }
            }
            return '';
        }

        function extractBrands() {
            var brands = [];

            // Method 1: Tables
            document.querySelectorAll('table:not(.table-condensed)').forEach(function(table) {
                table.querySelectorAll('tr').forEach(function(row) {
                    var cells = row.querySelectorAll('td');
                    if (cells.length < 4) return;

                    var b = (cells[0]?.textContent || '').trim();
                    var s = (cells[1]?.textContent || '').trim(); // dosage form
                    var d = (cells[2]?.textContent || '').trim(); // strength
                    var p = extractPrice(cells[3] || row);
                    if (!p) p = extractPrice(row); // try whole row

                    // Skip header rows
                    if (/brand|trade/i.test(b)) return;
                    if (!b || !p) return;

                    brands.push({ brand: b, dosageForm: s, strength: d, price: p });
                });
            });

            // Method 2: hoverable-block (brand-names page)
            if (!brands.length) {
                document.querySelectorAll('.hoverable-block').forEach(function(block) {
                    var dr = block.querySelector('.data-row');
                    var brandEl = dr?.querySelector('.data-row-top');
                    var strEl = dr?.querySelector('.data-row-strength');
                    var coEl = dr?.querySelector('.data-row-company');
                    var p = extractPrice(block);

                    if (brandEl && p) {
                        var brandText = brandEl.textContent.trim().replace(/^\S+\s+/, '');
                        brands.push({
                            brand: brandText,
                            dosageForm: strEl?.textContent?.trim() || '',
                            strength: '',
                            company: coEl?.textContent?.trim() || '',
                            price: p
                        });
                    }
                });
            }

            return brands;
        }

        // === BRANDS LISTING PAGE ===
        if (isBrandsPage) {
            var genId = url.match(/\/generics\/(\d+)/)?.[1] || '';
            var prices = extractBrands();

            if (prices.length) {
                saveAndShow('gen_' + genId + '_prices', prices);
            }

            var badge = document.querySelector('#mxbadge') || document.createElement('div');
            badge.id = 'mxbadge'; badge.style.cssText = 'position:fixed;bottom:20px;right:20px;background:#22c55e;color:white;padding:10px 18px;border-radius:10px;font:bold 14px sans-serif;z-index:99999;cursor:pointer';
            badge.textContent = 'Gen ' + genId + ' | Prices: ' + prices.length;
            if (!document.querySelector('#mxbadge')) document.body.appendChild(badge);

            setTimeout(function() { window.location.href = 'https://medex.com.bd/generics/' + (parseInt(genId)+1); }, 3000);
            return;
        }

        // === GENERIC PAGE ===
        if (isGenericPage) {
            var genId = url.match(/\/generics\/(\d+)/)?.[1] || '';
            var titleEl = document.querySelector('h1') || document.querySelector('[class*="page-title"]');
            var genName = titleEl ? titleEl.textContent.trim() : '';

            // Medical content from .ac-body
            var acs = document.querySelectorAll('.ac-body');
            var content = '';
            acs.forEach(function(el) { content += el.textContent.trim() + '\n\n'; });

            if (content.length > 100) {
                saveAndShow('gen_' + genId, { name: genName, id: genId, content: content });
            }

            // Check for View More Brands
            var moreBtn = Array.from(document.querySelectorAll('a, button')).find(function(el) {
                return /view.*more.*brand|show.*all.*brand|load.*more/i.test(el.textContent || '');
            }) || document.querySelector('a[href*="brand-names"]');

            if (moreBtn) {
                var brandUrl = moreBtn.href || moreBtn.getAttribute('data-url') || url.replace(/\/$/, '') + '/brand-names';
                setTimeout(function() { window.location.href = brandUrl; }, 2500 + Math.random() * 1500);
                return;
            }

            // No View More — scrape visible brands
            var prices = extractBrands();
            if (prices.length) {
                saveAndShow('gen_' + genId + '_prices', prices);
            }

            // Get totals for badge
            var stored = JSON.parse(localStorage.getItem('mx_gen') || '{}');
            var totalGens = Object.keys(stored).filter(function(k) { return !k.endsWith('_prices'); }).length;
            var totalPrices = Object.keys(stored).filter(function(k) { return k.endsWith('_prices'); })
                .reduce(function(sum, k) { return sum + stored[k].length; }, 0);

            var badge = document.querySelector('#mxbadge') || document.createElement('div');
            badge.id = 'mxbadge'; badge.style.cssText = 'position:fixed;bottom:20px;right:20px;background:#8b5cf6;color:white;padding:10px 18px;border-radius:10px;font:bold 14px sans-serif;z-index:99999;cursor:pointer';
            badge.textContent = 'Pg ' + genId + '/2656 | ' + totalGens + ' gens | ' + totalPrices + ' prices';
            badge.onclick = function() {
                var blob = new Blob([JSON.stringify(JSON.parse(localStorage.getItem('mx_gen') || '{}'), null, 2)], { type: 'application/json' });
                var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'medex_generics.json'; a.click();
            };
            if (!document.querySelector('#mxbadge')) document.body.appendChild(badge);

            setTimeout(function() { window.location.href = 'https://medex.com.bd/generics/' + (parseInt(genId)+1); }, 2000 + Math.random() * 1500);
        }

    }, 4000);
})();
