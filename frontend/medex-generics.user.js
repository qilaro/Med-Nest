// ==UserScript==
// @name         MedEx Generic Scraper
// @namespace    medex-generics
// @version      1.0
// @match        https://medex.com.bd/generics/*
// @match        https://medex.com.bd/brands*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Check if we're on a brands listing page (for price extraction)
    var isBrandsPage = window.location.href.includes('/brand-names');
    var isGenericPage = window.location.href.includes('/generics/') && !isBrandsPage;

    setTimeout(function() {

        // === BRANDS LISTING PAGE: Extract all brand prices ===
        if (isBrandsPage) {
            var brandRows = document.querySelectorAll('.data-row, .brand-row, table tr');
            var prices = [];

            // Try structured table rows first
            var tables = document.querySelectorAll('table');
            tables.forEach(function(table) {
                var rows = table.querySelectorAll('tr');
                rows.forEach(function(row) {
                    var cells = row.querySelectorAll('td');
                    if (cells.length >= 4) {
                        var brand = cells[0]?.textContent?.trim() || '';
                        var strength = cells[1]?.textContent?.trim() || '';
                        var dosage = cells[2]?.textContent?.trim() || '';
                        var price = cells[3]?.textContent?.trim() || '';
                        if (brand && price && /[\d.]+/.test(price)) {
                            prices.push({ brand: brand, strength: strength, dosage: dosage, price: price.replace(/[^0-9.]/g, '') });
                        }
                    }
                });
            });

            // If no table found, try data-row divs
            if (prices.length === 0) {
                document.querySelectorAll('.data-row').forEach(function(row) {
                    var brandEl = row.querySelector('.data-row-top, [class*="brand"]');
                    var priceEl = row.querySelector('[class*="price"], [class*="pricing"]');
                    var strengthEl = row.querySelector('.data-row-strength, [class*="strength"]');
                    if (brandEl && priceEl) {
                        var p = priceEl.textContent.trim().replace(/[^0-9.]/g, '');
                        if (p) prices.push({
                            brand: brandEl.textContent.trim(),
                            strength: strengthEl ? strengthEl.textContent.trim() : '',
                            dosage: '',
                            price: p
                        });
                    }
                });
            }

            if (prices.length > 0) {
                var stored = JSON.parse(localStorage.getItem('mx_generic') || '{}');
                var genId = window.location.href.match(/\/generics\/(\d+)/)?.[1] || 'unknown';
                stored['gen_' + genId + '_prices'] = prices;
                localStorage.setItem('mx_generic', JSON.stringify(stored));

                var badge = document.querySelector('#mxbadge') || document.createElement('div');
                badge.id = 'mxbadge';
                badge.style.cssText = 'position:fixed;bottom:20px;right:20px;background:#22c55e;color:white;padding:10px 18px;border-radius:10px;font:bold 14px sans-serif;z-index:99999;cursor:pointer';
                badge.textContent = 'Prices: ' + prices.length + ' | Page ' + (parseInt(genId)||0);
                if (!document.querySelector('#mxbadge')) document.body.appendChild(badge);
            }

            // Go back to continue after 3s
            var nextId = parseInt(window.location.href.match(/\/generics\/(\d+)/)?.[1] || '0') + 1;
            setTimeout(function() {
                window.location.href = 'https://medex.com.bd/generics/' + nextId;
            }, 3000);
            return;
        }

        // === GENERIC PAGE: Extract medical info ===
        if (isGenericPage) {
            var genId = window.location.href.match(/\/generics\/(\d+)/)?.[1] || '';

            // Extract generic name
            var nameEl = document.querySelector('h1, .page-title, [class*="title"]');
            var genName = nameEl ? nameEl.textContent.trim().replace(/^\s*(Generic|জেনেরিক)\s*/i, '') : '';

            // Extract medical content
            var extractSection = function(heading) {
                var el = document.querySelector('[id*="' + heading + '"], [data-section*="' + heading + '"], h2, h3, h4');
                if (!el && heading === 'indications') {
                    // Try the main content area
                    var main = document.querySelector('.ac-body, .generic-details, [class*="content"], [class*="description"]');
                    if (main) return main.textContent.trim().slice(0, 5000);
                }
                if (el) {
                    var next = el.nextElementSibling;
                    var text = '';
                    while (next && next.tagName !== 'H2' && next.tagName !== 'H3') {
                        text += ' ' + (next.textContent || '');
                        next = next.nextElementSibling;
                    }
                    return text.trim().slice(0, 5000);
                }
                return '';
            };

            var info = {
                name: genName,
                id: genId,
                indications: extractSection('indications') || extractSection('indication'),
                pharmacology: extractSection('pharmacology') || extractSection('pharmac'),
                dosage: extractSection('dosage') || extractSection('dose'),
                administration: extractSection('administration'),
                sideEffects: extractSection('side') || extractSection('adverse'),
                contraindications: extractSection('contraindications') || extractSection('contra'),
                warnings: extractSection('warnings') || extractSection('precautions') || extractSection('warning'),
                precautions: extractSection('precautions'),
                pregnancyLactation: extractSection('pregnancy') || extractSection('lactation'),
                overdoseEffects: extractSection('overdose'),
                interactions: extractSection('interaction'),
                storageConditions: extractSection('storage'),
                pediatricUses: extractSection('pediatric'),
                drugClass: '',
                therapeuticClass: ''
            };

            // Try to get drug class and therapeutic class
            var classEls = document.querySelectorAll('[class*="drug-class"], [class*="therapeutic"], .breadcrumb li, .breadcrumb a');
            classEls.forEach(function(el) {
                var t = el.textContent.trim();
                if (t && t.length > 2 && t.length < 60 && !t.includes('Home') && !t.includes('Generics')) {
                    if (!info.drugClass) info.drugClass = t;
                    else if (!info.therapeuticClass) info.therapeuticClass = t;
                }
            });

            // Only save if we got meaningful data
            if (info.indications || info.pharmacology || info.sideEffects) {
                var stored = JSON.parse(localStorage.getItem('mx_generic') || '{}');
                stored['gen_' + genId] = info;
                localStorage.setItem('mx_generic', JSON.stringify(stored));

                var badge = document.querySelector('#mxbadge') || document.createElement('div');
                badge.id = 'mxbadge';
                badge.style.cssText = 'position:fixed;bottom:20px;right:20px;background:#8b5cf6;color:white;padding:10px 18px;border-radius:10px;font:bold 14px sans-serif;z-index:99999;cursor:pointer';
                badge.textContent = 'Gen ' + genId + ': ' + genName.slice(0, 30);
                badge.onclick = function() {
                    var blob = new Blob([JSON.stringify(stored, null, 2)], {type: 'application/json'});
                    var a = document.createElement('a');
                    a.href = URL.createObjectURL(blob);
                    a.download = 'medex_generics.json';
                    a.click();
                };
                if (!document.querySelector('#mxbadge')) document.body.appendChild(badge);
            }

            // Check for "View More Brands" button
            var moreBtn = document.querySelector('[class*="view-more"], [class*="load-more"], [class*="show-more"], button:has-text("Brand"), button:has-text("brand"), a:has-text("Brand"), a:has-text("brand")') ||
                         Array.from(document.querySelectorAll('a, button')).find(function(el) {
                             return /view.*more.*brand|show.*all.*brand|load.*more.*brand/i.test(el.textContent || '');
                         });

            // Also check for pagination with next page
            var hasBrandsLink = document.querySelector('a[href*="brand-names"]') ||
                               document.querySelector('a[href*="/brands"]');

            if (moreBtn || hasBrandsLink) {
                // Go to brand names page for prices
                var brandUrl = hasBrandsLink ? hasBrandsLink.href : null;
                if (!brandUrl && moreBtn) {
                    brandUrl = moreBtn.href || moreBtn.getAttribute('data-url');
                }
                if (!brandUrl) {
                    // Construct URL
                    var slug = window.location.href.split('/').slice(5).join('/').replace(/\/$/, '');
                    brandUrl = window.location.origin + '/generics/' + genId + '/' + slug + '/brand-names';
                }
                if (brandUrl) {
                    setTimeout(function() {
                        window.location.href = brandUrl;
                    }, 2500 + Math.random() * 1500);
                    return;
                }
            }

            // No more brands button → go to next generic
            var nextId = parseInt(genId) + 1;
            setTimeout(function() {
                window.location.href = 'https://medex.com.bd/generics/' + nextId;
            }, 2000 + Math.random() * 1500);
        }

    }, 4000);
})();
