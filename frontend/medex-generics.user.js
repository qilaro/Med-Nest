// ==UserScript==
// @name         MedEx Generic Scraper
// @namespace    medex-generics
// @version      2.0
// @match        https://medex.com.bd/generics/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    var url = window.location.href;
    var isBrandsPage = url.includes('/brand-names');
    var isGenericPage = !isBrandsPage && url.includes('/generics/');

    setTimeout(function() {

        // === BRANDS LISTING PAGE ===
        if (isBrandsPage) {
            var genId = url.match(/\/generics\/(\d+)/)?.[1] || '';
            var prices = [];

            // Each brand is in a .hoverable-block > .row.data-row
            document.querySelectorAll('.hoverable-block').forEach(function(block) {
                var dataRow = block.querySelector('.data-row');
                if (!dataRow) return;

                var brandEl = dataRow.querySelector('.data-row-top');
                var strengthEl = dataRow.querySelector('.data-row-strength');
                var companyEl = dataRow.querySelector('.data-row-company');
                var priceEl = block.querySelector('.package-pricing');

                var brand = brandEl ? brandEl.textContent.trim().replace(/^\\s*\\S+\\s+/, '') : '';
                var strength = strengthEl ? strengthEl.textContent.trim() : '';
                var company = companyEl ? companyEl.textContent.trim() : '';
                var price = '';
                if (priceEl) {
                    var m = priceEl.textContent.match(/[\\d,]+(?:\\.[\\d]+)?/);
                    if (m) price = m[0].replace(/,/g, '');
                }

                if (brand && price) {
                    prices.push({ brand: brand, strength: strength, company: company, price: price });
                }
            });

            if (prices.length > 0) {
                var stored = JSON.parse(localStorage.getItem('mx_gen') || '{}');
                stored['gen_' + genId + '_prices'] = prices;
                localStorage.setItem('mx_gen', JSON.stringify(stored));
            }

            var badge = document.querySelector('#mxbadge') || document.createElement('div');
            badge.id = 'mxbadge';
            badge.style.cssText = 'position:fixed;bottom:20px;right:20px;background:#22c55e;color:white;padding:10px 18px;border-radius:10px;font:bold 14px sans-serif;z-index:99999;cursor:pointer';
            badge.textContent = 'Prices: ' + prices.length + ' | Gen ' + genId;
            if (!document.querySelector('#mxbadge')) document.body.appendChild(badge);

            // Go to next generic
            var nextId = parseInt(genId) + 1;
            setTimeout(function() {
                window.location.href = 'https://medex.com.bd/generics/' + nextId;
            }, 3000);
            return;
        }

        // === GENERIC PAGE ===
        if (isGenericPage) {
            var genId = url.match(/\/generics\/(\d+)/)?.[1] || '';

            // Extract generic name from h1 or breadcrumb
            var titleEl = document.querySelector('h1') || document.querySelector('[class*="page-title"]');
            var genName = titleEl ? titleEl.textContent.trim() : '';

            // Extract ALL ac-body content (medical info)
            var acBodies = document.querySelectorAll('.ac-body');
            var fullContent = '';
            acBodies.forEach(function(el) {
                fullContent += el.textContent.trim() + '\\n\\n';
            });

            if (fullContent.length > 100) {
                var stored = JSON.parse(localStorage.getItem('mx_gen') || '{}');
                stored['gen_' + genId] = {
                    name: genName,
                    id: genId,
                    content: fullContent
                };
                localStorage.setItem('mx_gen', JSON.stringify(stored));
            }

            // Show badge
            var badge = document.querySelector('#mxbadge') || document.createElement('div');
            badge.id = 'mxbadge';
            badge.style.cssText = 'position:fixed;bottom:20px;right:20px;background:#8b5cf6;color:white;padding:10px 18px;border-radius:10px;font:bold 14px sans-serif;z-index:99999;cursor:pointer';
            badge.textContent = 'Gen ' + genId + ': ' + genName.slice(0, 30);
            badge.onclick = function() {
                var blob = new Blob([JSON.stringify(JSON.parse(localStorage.getItem('mx_gen') || '{}'), null, 2)], {type: 'application/json'});
                var a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = 'medex_generics.json';
                a.click();
            };
            if (!document.querySelector('#mxbadge')) document.body.appendChild(badge);

            // Check for "View More Brands" button
            var moreBtn = Array.from(document.querySelectorAll('a, button')).find(function(el) {
                return /view.*more.*brand|show.*all.*brand|load.*more.*brand/i.test(el.textContent || '');
            }) || document.querySelector('a[href*="brand-names"]');

            if (moreBtn) {
                var brandUrl = moreBtn.href || moreBtn.getAttribute('data-url');
                if (!brandUrl) {
                    brandUrl = url.replace(/\/$/, '') + '/brand-names';
                }
                if (brandUrl) {
                    setTimeout(function() { window.location.href = brandUrl; }, 2500 + Math.random() * 1500);
                    return;
                }
            }

            // No "View More" → scrape visible brands on this page
            var prices = [];
            document.querySelectorAll('.hoverable-block').forEach(function(block) {
                var dataRow = block.querySelector('.data-row');
                if (!dataRow) return;
                var brandEl = dataRow.querySelector('.data-row-top');
                var strengthEl = dataRow.querySelector('.data-row-strength');
                var companyEl = dataRow.querySelector('.data-row-company');
                var priceEl = block.querySelector('.package-pricing');
                var brand = brandEl ? brandEl.textContent.trim().replace(/^\\s*\\S+\\s+/, '') : '';
                var strength = strengthEl ? strengthEl.textContent.trim() : '';
                var company = companyEl ? companyEl.textContent.trim() : '';
                var price = '';
                if (priceEl) {
                    var m = priceEl.textContent.match(/[\\d,]+(?:\\.[\\d]+)?/);
                    if (m) price = m[0].replace(/,/g, '');
                }
                if (brand && price) {
                    prices.push({ brand: brand, strength: strength, company: company, price: price });
                }
            });

            if (prices.length > 0) {
                var stored2 = JSON.parse(localStorage.getItem('mx_gen') || '{}');
                stored2['gen_' + genId + '_prices'] = prices;
                localStorage.setItem('mx_gen', JSON.stringify(stored2));
            }

            // Go to next generic
            var nextId = parseInt(genId) + 1;
            setTimeout(function() {
                window.location.href = 'https://medex.com.bd/generics/' + nextId;
            }, 2000 + Math.random() * 1500);
        }

    }, 4000);
})();
