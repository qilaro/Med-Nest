// ==UserScript==
// @name         MedsBD Scraper
// @namespace    medsbd
// @version      1.0
// @match        https://medsbd.com/brands/*
// @match        https://medsbd.com/brand/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    var LETTERS = 'abcdefghijklmnopqrstuvwxyz'.split('');
    var url = window.location.href;
    var isListing = url.match(/\/brands\/([a-z])/) && !url.includes('/brand/');
    var isDetail = url.includes('/brand/') && !url.includes('/brands/');

    // ============ BRAND DETAIL PAGE ============
    if (isDetail) {
        setTimeout(function() {
            var detail = {
                url: url,
                brandName: '',
                genericName: '',
                dosageForm: '',
                strength: '',
                companyName: '',
                packSize: '',
                unitPrice: '',

                indications: '',
                adultDose: '',
                childDose: '',
                renalDose: '',
                administration: '',
                contraindications: '',
                precautions: '',
                pregnancyLactation: '',
                interactions: '',
                sideEffects: '',
                modeOfAction: '',
            };

            // Brand name, dosage form, generic from the header
            var nameEl = document.querySelector('h1');
            if (nameEl) {
                var txt = nameEl.textContent.trim();
                var em = nameEl.querySelector('em');
                detail.dosageForm = em ? em.textContent.trim() : '';
                detail.brandName = txt.replace(em ? em.textContent : '', '').trim();
            }

            var genericEl = document.querySelector('.medicine-name + div i, [class*="page-heading"] + div i');
            if (!genericEl) genericEl = document.querySelector('i');
            if (genericEl) detail.genericName = genericEl.textContent.trim();

            // Strength: the span after the heading
            var strengthEl = document.querySelector('[class*="medicine-name"] + div + span, span:has(+ div)');
            if (!strengthEl) {
                var allSpans = document.querySelectorAll('span');
                for (var i = 0; i < allSpans.length; i++) {
                    var t = allSpans[i].textContent.trim();
                    if (t.match(/^\d/) && t.length < 30) { strengthEl = allSpans[i]; break; }
                }
            }
            detail.strength = strengthEl ? strengthEl.textContent.trim() : '';

            // Company name
            var companyEl = document.querySelector('[class*="page-heading"] + div + span + div, h1 + div + span + div');
            if (!companyEl) {
                var divs = document.querySelectorAll('div');
                for (var i = 0; i < divs.length; i++) {
                    var txt = divs[i].textContent.trim();
                    if (txt.includes('Ltd.') || txt.includes('Limited') || txt.includes('Pharma')) {
                        if (txt.length < 60) { companyEl = divs[i]; break; }
                    }
                }
            }
            detail.companyName = companyEl ? companyEl.textContent.trim() : '';

            // Pack size & Unit Price from <table>
            var rows = document.querySelectorAll('table tr');
            rows.forEach(function(tr) {
                var th = tr.querySelector('th');
                var td = tr.querySelector('td');
                if (!th || !td) return;
                var label = th.textContent.trim().toLowerCase();
                var val = td.textContent.trim();
                if (label.includes('pack')) detail.packSize = val;
                if (label.includes('price') || label.includes('unit')) detail.unitPrice = val.replace(/[^0-9.]/g, '');
            });

            // Medical info sections: each h2 + following div
            var sections = document.querySelectorAll('h2');
            sections.forEach(function(h2) {
                var sectionName = h2.textContent.trim().toLowerCase().replace(/\s+/g, '');
                var nextDiv = h2.nextElementSibling;
                var content = '';
                while (nextDiv && nextDiv.tagName !== 'H2') {
                    if (nextDiv.tagName === 'DIV') content += nextDiv.textContent.trim() + '\n';
                    nextDiv = nextDiv.nextElementSibling;
                }
                content = content.trim();

                if (sectionName.includes('indications')) detail.indications = content;
                else if (sectionName.includes('adultdose')) detail.adultDose = content;
                else if (sectionName.includes('childdose')) detail.childDose = content;
                else if (sectionName.includes('renaldose')) detail.renalDose = content;
                else if (sectionName.includes('administration')) detail.administration = content;
                else if (sectionName.includes('contraindication')) detail.contraindications = content;
                else if (sectionName.includes('precaution')) detail.precautions = content;
                else if (sectionName.includes('pregnancy') || sectionName.includes('lactation')) detail.pregnancyLactation = content;
                else if (sectionName.includes('interaction')) detail.interactions = content;
                else if (sectionName.includes('sideeffect')) detail.sideEffects = content;
                else if (sectionName.includes('modeofaction')) detail.modeOfAction = content;
            });

            // Save to localStorage
            var slug = url.replace(/.*\/brand\//, '').replace(/\/$/, '');
            var stored = JSON.parse(localStorage.getItem('msbd_detail') || '{}');
            stored[slug] = detail;
            localStorage.setItem('msbd_detail', JSON.stringify(stored));

            // Show badge
            var total = Object.keys(stored).length;
            var badge = document.querySelector('#msbdbadge') || document.createElement('div');
            badge.id = 'msbdbadge';
            badge.style.cssText = 'position:fixed;bottom:20px;right:20px;background:#6366f1;color:white;padding:10px 18px;border-radius:10px;font:bold 14px sans-serif;z-index:99999;cursor:pointer';
            badge.textContent = 'Details: ' + total;
            badge.onclick = function() {
                var blob = new Blob([JSON.stringify(stored, null, 2)], { type: 'application/json' });
                var a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = 'medsbd_details.json';
                a.click();
            };
            if (!document.querySelector('#msbdbadge')) document.body.appendChild(badge);

            // === GO TO NEXT BRAND OR NEXT PAGE ===
            // Check what's next from the listing state
            var state = JSON.parse(localStorage.getItem('msbd_state') || '{}');
            var detailQueue = JSON.parse(localStorage.getItem('msbd_queue') || '[]');

            // Mark this slug as done
            state[slug] = true;
            localStorage.setItem('msbd_state', JSON.stringify(state));

            // Remove from queue
            detailQueue = detailQueue.filter(function(s) { return s !== slug; });
            localStorage.setItem('msbd_queue', JSON.stringify(detailQueue));

            // Next: if queue is not empty, go to next detail page
            if (detailQueue.length > 0) {
                var nextSlug = detailQueue[0];
                setTimeout(function() { window.location.href = 'https://medsbd.com/brand/' + nextSlug; }, 2000 + Math.random() * 1000);
            } else {
                // Queue empty — go back to listing and process next page/letter
                var returnUrl = JSON.parse(localStorage.getItem('msbd_return') || '""');
                if (returnUrl) {
                    localStorage.setItem('msbd_return', '""');
                    setTimeout(function() { window.location.href = returnUrl; }, 1000);
                }
            }
        }, 3000);
        return;
    }

    // ============ LISTING PAGE ============
    if (isListing) {
        setTimeout(function() {
            var letterMatch = url.match(/\/brands\/([a-z])/);
            var pageMatch = url.match(/[?&]page=(\d+)/);
            var currentLetter = letterMatch ? letterMatch[1] : '';
            var currentPage = pageMatch ? parseInt(pageMatch[1]) : 1;
            var totalPages = 1;

            // Get total items count from "Showing X to Y of Z results"
            var showingText = document.body.textContent.match(/Showing\s+\d+\s+to\s+\d+\s+of\s+(\d+)\s+/i);
            var totalItems = showingText ? parseInt(showingText[1]) : 0;
            totalPages = Math.ceil(totalItems / 30) || 1;

            // Extract brand slugs from the page
            var slugs = [];
            var brandLinks = document.querySelectorAll('a[href*="/brand/"]');
            brandLinks.forEach(function(link) {
                var href = link.getAttribute('href');
                if (!href || href.includes('/brands/')) return;
                var slug = href.replace(/.*\/brand\//, '').replace(/\/$/, '');
                if (slug) slugs.push(slug);

                // Also save listing summary
                var formEl = link.querySelector('.form > .text-sm, .form');
                var nameEl = link.querySelector('.brand_name');
                var strengthEl = link.querySelector('.strength');
                var genericEl = link.querySelector('i');
                var textSmEls = link.querySelectorAll('.text-sm');
                var companyName = '';
                for (var i = textSmEls.length - 1; i >= 0; i--) {
                    var t = textSmEls[i].textContent.trim();
                    if (t && t !== (formEl ? formEl.textContent.trim() : '')) { companyName = t; break; }
                }

                var listing = JSON.parse(localStorage.getItem('msbd_listing') || '{}');
                listing[slug] = {
                    brandName: nameEl ? nameEl.textContent.trim() : '',
                    dosageForm: formEl ? formEl.textContent.trim() : '',
                    strength: strengthEl ? strengthEl.textContent.trim() : '',
                    genericName: genericEl ? genericEl.textContent.trim() : '',
                    companyName: companyName
                };
                localStorage.setItem('msbd_listing', JSON.stringify(listing));
            });

            if (slugs.length === 0) return;

            // Remove already-done slugs
            var state = JSON.parse(localStorage.getItem('msbd_state') || '{}');
            var todo = slugs.filter(function(s) { return !state[s]; });

            if (todo.length === 0) {
                // All brands on this page done — go to next page
                goNextPage(currentLetter, currentPage, totalPages);
                return;
            }

            // Save return URL for coming back after details
            var nextPageUrl = '';
            var nextLink = document.querySelector('a[rel="next"], a[href*="page=' + (currentPage + 1) + '"]');
            if (nextLink) {
                var np = nextLink.getAttribute('href') || '';
                nextPageUrl = np.startsWith('http') ? np : 'https://medsbd.com' + np;
            } else {
                // Go to next letter
                var currentIdx = LETTERS.indexOf(currentLetter);
                if (currentIdx >= 0 && currentIdx < LETTERS.length - 1) {
                    nextPageUrl = 'https://medsbd.com/brands/' + LETTERS[currentIdx + 1];
                }
            }

            localStorage.setItem('msbd_queue', JSON.stringify(todo));
            localStorage.setItem('msbd_return', JSON.stringify(nextPageUrl || ''));

            // Total count
            var allSlugs = Object.keys(JSON.parse(localStorage.getItem('msbd_listing') || '{}'));
            var totalDone = Object.keys(state).length;

            var badge = document.querySelector('#msbdbadge') || document.createElement('div');
            badge.id = 'msbdbadge';
            badge.style.cssText = 'position:fixed;bottom:20px;right:20px;background:#0d9488;color:white;padding:10px 18px;border-radius:10px;font:bold 14px sans-serif;z-index:99999;cursor:pointer';
            badge.textContent = currentLetter.toUpperCase() + ' pg' + currentPage + '/' + totalPages + ' | queue:' + todo.length + ' | done:' + totalDone;
            badge.onclick = function() {
                var blob = new Blob([JSON.stringify(JSON.parse(localStorage.getItem('msbd_listing') || '{}'), null, 2)], { type: 'application/json' });
                var a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = 'medsbd_listing.json';
                a.click();
            };
            if (!document.querySelector('#msbdbadge')) document.body.appendChild(badge);

            // Navigate to first brand detail
            var firstSlug = todo[0];
            setTimeout(function() {
                window.location.href = 'https://medsbd.com/brand/' + firstSlug;
            }, 2000 + Math.random() * 1000);

        }, 3000);
        return;
    }

    // ============ HELPER: Go to next page/letter ============
    function goNextPage(letter, page, totalPages) {
        var delay = 2000 + Math.random() * 2000;

        // Try next page in current letter
        if (page < totalPages) {
            setTimeout(function() { window.location.href = 'https://medsbd.com/brands/' + letter + '?page=' + (page + 1); }, delay);
            return;
        }

        // Move to next letter
        var idx = LETTERS.indexOf(letter);
        if (idx >= 0 && idx < LETTERS.length - 1) {
            setTimeout(function() { window.location.href = 'https://medsbd.com/brands/' + LETTERS[idx + 1]; }, delay);
            return;
        }

        // Done!
        var badge = document.querySelector('#msbdbadge');
        if (badge) badge.textContent = '✓ ALL DONE!';
    }
})();
