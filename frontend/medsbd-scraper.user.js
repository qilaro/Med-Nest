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
        // Get total pages from pagination "Showing X to Y of Z results"
        var showingText = document.body.textContent.match(/Showing\s+\d+\s+to\s+\d+\s+of\s+(\d+)\s+results/i);
        var totalItems = showingText ? parseInt(showingText[1]) : 0;
        totalPages = Math.ceil(totalItems / 30) || 1;

        // Extract brands from exact HTML structure
        var brands = [];
        var brandLinks = document.querySelectorAll('a[href*="/brand/"]');

        brandLinks.forEach(function(link) {
            var href = link.getAttribute('href');
            if (!href || href.includes('/brands/')) return; // Skip letter nav links

            // Dosage form
            var formEl = link.querySelector('.form > .text-sm, .form');
            var dosageForm = formEl ? formEl.textContent.trim() : '';

            // Brand name
            var nameEl = link.querySelector('.brand_name');
            var brandName = nameEl ? nameEl.textContent.trim() : '';

            // Strength
            var strengthEl = link.querySelector('.strength');
            var strength = strengthEl ? strengthEl.textContent.trim() : '';

            // Generic name (<i> tag)
            var genericEl = link.querySelector('i');
            var genericName = genericEl ? genericEl.textContent.trim() : '';

            // Company name (last .text-sm inside the link, not the dosage form)
            var companyName = '';
            var textSmEls = link.querySelectorAll('.text-sm');
            for (var i = textSmEls.length - 1; i >= 0; i--) {
                var txt = textSmEls[i].textContent.trim();
                if (txt && txt !== dosageForm) { companyName = txt; break; }
            }

            if (!brandName) return;

            var slug = href.replace(/.*\/brand\//, '').replace(/\/$/, '');

            brands.push({
                brandName: brandName,
                dosageForm: dosageForm,
                strength: strength,
                genericName: genericName,
                companyName: companyName,
                slug: slug,
                url: href.startsWith('http') ? href : 'https://medsbd.com' + href
            });
        });

        if (brands.length === 0) {
            console.log('MedsBD scraper: No brands found');
            return;
        }

        // Store in localStorage, grouped by letter > page
        var stored = JSON.parse(localStorage.getItem('msbd') || '{}');
        if (!stored[currentLetter]) stored[currentLetter] = {};
        stored[currentLetter]['page_' + currentPage] = brands;
        localStorage.setItem('msbd', JSON.stringify(stored));

        // Accumulate total across all letters/pages
        var totalBrands = 0;
        for (var l in stored) {
            for (var p in stored[l]) {
                totalBrands += stored[l][p].length;
            }
        }

        // Badge
        var badge = document.querySelector('#msbdbadge') || document.createElement('div');
        badge.id = 'msbdbadge';
        badge.style.cssText = 'position:fixed;bottom:20px;right:20px;background:#0d9488;color:white;padding:10px 18px;border-radius:10px;font:bold 14px sans-serif;z-index:99999;cursor:pointer';
        badge.textContent = currentLetter.toUpperCase() + ' pg' + currentPage + '/' + totalPages + ' | ' + brands.length + ' new | ' + totalBrands + ' total';
        badge.onclick = function() {
            var blob = new Blob([JSON.stringify(stored, null, 2)], { type: 'application/json' });
            var a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = 'medsbd_brands.json';
            a.click();
        };
        if (!document.querySelector('#msbdbadge')) document.body.appendChild(badge);

        // === NAVIGATION ===
        var delay = 2000 + Math.random() * 2000;

        // Next page or next letter
        var nextPageUrl = '';
        var nextLink = document.querySelector('a[rel="next"], a[href*="page=' + (currentPage + 1) + '"]');
        if (nextLink) {
            nextPageUrl = nextLink.getAttribute('href') || '';
        }

        if (nextPageUrl) {
            var fullUrl = nextPageUrl.startsWith('http') ? nextPageUrl : 'https://medsbd.com' + nextPageUrl;
            setTimeout(function() { window.location.href = fullUrl; }, delay);
        } else {
            // Move to next letter
            var currentIdx = LETTERS.indexOf(currentLetter);
            if (currentIdx >= 0 && currentIdx < LETTERS.length - 1) {
                var nextLetter = LETTERS[currentIdx + 1];
                setTimeout(function() {
                    window.location.href = 'https://medsbd.com/brands/' + nextLetter;
                }, delay);
            } else {
                badge.textContent = '✓ DONE! ' + totalBrands + ' brands collected';
                badge.style.background = '#059669';
            }
        }

    }, 3000);
})();
