// ==UserScript==
// @name         MedEx Generic Scraper
// @namespace    medex-generics
// @version      4.2
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

    function updateBadge(text) {
        var b = document.querySelector('#mxbadge');
        if (!b) {
            b = document.createElement('div');
            b.id = 'mxbadge';
            b.style.cssText = 'position:fixed;bottom:20px;right:20px;background:#8b5cf6;color:white;padding:10px 18px;border-radius:10px;font:bold 14px sans-serif;z-index:99999;cursor:pointer';
            b.onclick = function() {
                var blob = new Blob([JSON.stringify(JSON.parse(localStorage.getItem('mx_gen4')||'{}'),null,2)], {type:'application/json'});
                var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'medex_generics.json'; a.click();
            };
            document.body.appendChild(b);
        }
        b.textContent = text;
    }

    function getTotals() {
        var stored = JSON.parse(localStorage.getItem('mx_gen4') || '{}');
        var gens = Object.keys(stored).filter(function(k) { return !k.endsWith('_prices'); }).length;
        var prices = Object.keys(stored).filter(function(k) { return k.endsWith('_prices'); }).reduce(function(s,k) { return s + stored[k].length; }, 0);
        return { gens: gens, prices: prices };
    }

    function nextRandomPage() {
        var visited = JSON.parse(localStorage.getItem('mx_visited') || '[]');
        // Mark current as visited
        if (visited.indexOf(genId) === -1) { visited.push(genId); localStorage.setItem('mx_visited', JSON.stringify(visited)); }
        // Pick random unvisited between 3 and 2656
        var unvisited = [];
        for (var i = 3; i <= 2656; i++) {
            if (visited.indexOf(i.toString()) === -1) unvisited.push(i);
        }
        if (unvisited.length === 0) return 0; // done
        var idx = Math.floor(Math.random() * unvisited.length);
        return unvisited[idx];
    }

    setTimeout(function() {

        function extractBrandPrices() {
            var brands = [];

            // tr.brand-row (brand-names page)
            document.querySelectorAll('tr.brand-row').forEach(function(tr) {
                var name = tr.getAttribute('data-name');
                var strength = tr.getAttribute('data-strength') || '';
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
                brands.push({ brand: name, strength: strength, dosageForm: dosageForm, company: companyName, unitPrice: unitPrice, packInfo: packInfo });
            });

            // .hoverable-block (generic page, no "View More Brands")
            if (!brands.length) {
                document.querySelectorAll('.hoverable-block').forEach(function(block) {
                    var dr = block.querySelector('.data-row');
                    if (!dr) return;
                    var brandEl = dr.querySelector('.data-row-top');
                    var strEl = dr.querySelector('.data-row-strength');
                    var coEl = dr.querySelector('.data-row-company');
                    var priceEl = block.querySelector('.package-pricing, [class*="price"]');
                    if (!brandEl) return;
                    var name = brandEl.textContent.trim().replace(/^\S+\s+/, '');
                    var strength = strEl ? strEl.textContent.trim() : '';
                    var company = coEl ? coEl.textContent.trim() : '';
                    var price = '';
                    if (priceEl) {
                        var m = priceEl.textContent.match(/[\d,]+\.?\d*/);
                        if (m) price = m[0].replace(/,/g, '');
                    }
                    brands.push({ brand: name, strength: strength, dosageForm: '', company: company, unitPrice: price, packInfo: '' });
                });
            }

            return brands;
        }

        if (isBrandsPage) {
            var prices = extractBrandPrices();
            if (prices.length) save('gen_' + genId + '_prices', prices);
            var t = getTotals();
            updateBadge('Pg ' + genId + '/2656 | ' + t.gens + ' gens | ' + t.prices + ' prices');
            var delay = (parseInt(genId) % 100 === 0) ? 300000 : 3000 + Math.random() * 2000;
            setTimeout(function() { window.location.href = 'https://medex.com.bd/generics/' + (parseInt(genId)+1); }, delay);
        }

        if (isGenericPage) {
            // Medical info
            var titleEl = document.querySelector('h1') || document.querySelector('[class*="page-title"]');
            var genName = titleEl ? titleEl.textContent.trim() : '';
            var acs = document.querySelectorAll('.ac-body');
            var content = '';
            acs.forEach(function(el) { content += el.textContent.trim() + '\n\n'; });
            if (content.length > 100) save('gen_' + genId, { name: genName, id: genId, content: content });

            // Only "View More Brands" — NOT "View All"
            var moreBtn = Array.from(document.querySelectorAll('a, button')).find(function(el) {
                var t = (el.textContent || '').toLowerCase().trim();
                return t.indexOf('view more brand') !== -1;
            });

            if (moreBtn) {
                var brandUrl = moreBtn.href || moreBtn.getAttribute('data-url') || url.replace(/\/$/, '') + '/brand-names';
                setTimeout(function() { window.location.href = brandUrl; }, 2500 + Math.random() * 1500);
                return;
            }

            // No "View More Brands" → scrape visible brands on this page
            var prices = extractBrandPrices();
            if (prices.length) save('gen_' + genId + '_prices', prices);

            var t = getTotals();
            updateBadge('Pg ' + genId + '/2656 | ' + t.gens + ' gens | ' + t.prices + ' prices');
            var delay = (parseInt(genId) % 100 === 0) ? 300000 : 3000 + Math.random() * 2000;
            setTimeout(function() { window.location.href = 'https://medex.com.bd/generics/' + (parseInt(genId)+1); }, delay);
        }

    }, 4000);
})();
