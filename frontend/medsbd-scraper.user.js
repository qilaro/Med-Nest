// ==UserScript==
// @name         MedsBD Brand Scraper
// @namespace    medsbd
// @version      1.0
// @match        https://medsbd.com/brands/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    var LETTERS = 'abcdefghijklmnopqrstuvwxyz'.split('');
    var url = window.location.href;
    var letterMatch = url.match(/\/brands\/([a-z])/);
    var pageMatch = url.match(/[?&]page=(\d+)/);
    var currentLetter = letterMatch ? letterMatch[1] : '';
    var currentPage = pageMatch ? parseInt(pageMatch[1]) : 1;
    var totalPages = 0;

    setTimeout(function() {
        // Calculate total pages from the pagination
        var paginationLinks = document.querySelectorAll('a[href*="page="]');
        paginationLinks.forEach(function(link) {
            var n = parseInt(link.textContent.trim());
            if (n && n > totalPages) totalPages = n;
        });
        // Also check for "Next" to know if more pages exist
        var hasNext = Array.from(paginationLinks).some(function(l) { return l.textContent.trim().toLowerCase().includes('next'); });

        // Extract brand rows
        // Each brand is inside an <a> tag (direct link to brand detail page)
        var brands = [];
        var brandLinks = document.querySelectorAll('a[href*="/brand/"]');

        brandLinks.forEach(function(link) {
            var href = link.getAttribute('href');
            if (!href) return;

            // Dosage form: in a div with class "form" or the first visible text
            var formEl = link.querySelector('.form, [class*="form"]');
            var dosageForm = formEl ? formEl.textContent.trim() : '';

            // Brand name
            var nameEl = link.querySelector('.brand_name, [class*="brand_name"]');
            var brandName = nameEl ? nameEl.textContent.trim() : '';

            // Strength
            var strengthEl = link.querySelector('.strength, sup');
            var strength = strengthEl ? strengthEl.textContent.trim() : '';

            // Generic name
            var genericEl = link.querySelector('.generic, i, em');
            var genericName = genericEl ? genericEl.textContent.trim() : '';

            // Company name
            // It's the text after the generic, try to find it
            var companyName = '';
            if (genericEl && genericEl.parentElement) {
                var parent = genericEl.parentElement;
                var nextSibling = parent.nextElementSibling;
                if (nextSibling) {
                    companyName = nextSibling.textContent.trim();
                } else if (parent.parentElement) {
                    var grandparent = parent.parentElement;
                    var allDivs = grandparent.querySelectorAll(':scope > div');
                    for (var i = 0; i < allDivs.length; i++) {
                        var txt = allDivs[i].textContent.trim();
                        if (txt && !txt.includes(brandName) && !txt.includes(strength) && !txt.includes(genericName) && !txt.includes(dosageForm)) {
                            companyName = txt;
                            break;
                        }
                    }
                }
            }

            if (!brandName) return;

            brands.push({
                brandName: brandName,
                dosageForm: dosageForm,
                strength: strength,
                genericName: genericName,
                companyName: companyName,
                url: href.startsWith('http') ? href : 'https://medsbd.com' + href
            });
        });

        // If brandLinks didn't work, try the other structure (maybe not inside <a>)
        if (brands.length === 0) {
            document.querySelectorAll('[class*="brand_name"]').forEach(function(el) {
                var link = el.closest('a');
                var href = link ? link.getAttribute('href') : '';

                var brandRow = el.closest('[class*="py-2"], .md\\:flex, [class*="block"]') || el.parentElement;
                var formEl = brandRow ? brandRow.querySelector('.form, [class*="form"]') : null;
                var strengthEl = brandRow ? brandRow.querySelector('.strength, sup') : null;
                var genericEl = brandRow ? brandRow.querySelector('.generic, i, em') : null;

                var brandName = el.textContent.trim();
                var dosageForm = formEl ? formEl.textContent.trim() : '';
                var strength = strengthEl ? strengthEl.textContent.trim() : '';
                var genericName = genericEl ? genericEl.textContent.trim() : '';

                // Company: find the last div/span with text
                var companyName = '';
                if (brandRow) {
                    var texts = brandRow.querySelectorAll('div');
                    texts.forEach(function(div) {
                        var t = div.textContent.trim();
                        if (t && !t.includes(brandName) && !t.includes(strength) && !t.includes(genericName) && t !== dosageForm) {
                            companyName = t;
                        }
                    });
                }

                if (brandName) brands.push({
                    brandName: brandName,
                    dosageForm: dosageForm,
                    strength: strength,
                    genericName: genericName,
                    companyName: companyName,
                    url: href ? (href.startsWith('http') ? href : 'https://medsbd.com' + href) : ''
                });
            });
        }

        if (brands.length === 0) {
            return; // No brands found, skip
        }

        // Store
        var stored = JSON.parse(localStorage.getItem('msbd') || '{}');
        if (!stored[currentLetter]) stored[currentLetter] = {};
        var key = 'page_' + currentPage;
        stored[currentLetter][key] = brands;
        localStorage.setItem('msbd', JSON.stringify(stored));

        // Show badge
        var badge = document.querySelector('#msbdbadge') || document.createElement('div');
        badge.id = 'msbdbadge';
        badge.style.cssText = 'position:fixed;bottom:20px;right:20px;background:#0d9488;color:white;padding:10px 18px;border-radius:10px;font:bold 14px sans-serif;z-index:99999;cursor:pointer';
        badge.textContent = currentLetter.toUpperCase() + ' pg' + currentPage + '/' + (totalPages || '?') + ' | ' + brands.length + ' brands';
        badge.onclick = function() {
            var blob = new Blob([JSON.stringify(JSON.parse(localStorage.getItem('msbd') || '{}'), null, 2)], { type: 'application/json' });
            var a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = 'medsbd_brands.json';
            a.click();
        };
        if (!document.querySelector('#msbdbadge')) document.body.appendChild(badge);

        // === PAGE NAVIGATION LOGIC ===
        var delay = 2000 + Math.random() * 2000;

        // Check if there's a next page
        var nextLink = Array.from(document.querySelectorAll('a')).filter(function(a) {
            return a.textContent.trim().toLowerCase().includes('next') || 
                   (a.getAttribute('href') && a.getAttribute('href').includes('page=' + (currentPage + 1)));
        })[0];

        if (nextLink) {
            var nextUrl = nextLink.getAttribute('href') || '';
            if (nextUrl) {
                if (nextUrl.startsWith('http')) {
                    setTimeout(function() { window.location.href = nextUrl; }, delay);
                } else {
                    setTimeout(function() { window.location.href = 'https://medsbd.com' + nextUrl; }, delay);
                }
                return;
            }
        }

        // No next page — move to next letter or done
        var currentIdx = LETTERS.indexOf(currentLetter);
        if (currentIdx >= 0 && currentIdx < LETTERS.length - 1) {
            var nextLetter = LETTERS[currentIdx + 1];
            setTimeout(function() {
                window.location.href = 'https://medsbd.com/brands/' + nextLetter;
            }, delay);
        } else {
            badge.textContent = 'DONE! All letters complete';
            badge.style.background = '#059669';
        }

    }, 3000);
})();
