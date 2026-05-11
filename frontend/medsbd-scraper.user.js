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
    var isListing = url.match(/\/brands\/([a-z])/);
    var isDetail = url.includes('/brand/') && !url.includes('/brands/');

    // ============ DETAIL PAGE ============
    if (isDetail) {
        setTimeout(function() {
            var slug = url.replace(/.*\/brand\//, '').replace(/\/$/, '');

            var detail = {
                brandName: '', genericName: '', dosageForm: '', strength: '',
                companyName: '', packSize: '', unitPrice: '',
                indications: '', adultDose: '', childDose: '', renalDose: '',
                administration: '', contraindications: '', precautions: '',
                pregnancyLactation: '', interactions: '', sideEffects: '', modeOfAction: '',
            };

            var h1 = document.querySelector('h1');
            if (h1) {
                var em = h1.querySelector('em');
                detail.dosageForm = em ? em.textContent.trim() : '';
                detail.brandName = h1.textContent.replace(em ? em.textContent : '', '').trim();
            }

            var iTag = document.querySelector('i');
            if (iTag) detail.genericName = iTag.textContent.trim();

            document.querySelectorAll('table tr').forEach(function(tr) {
                var th = tr.querySelector('th'), td = tr.querySelector('td');
                if (!th || !td) return;
                var lbl = th.textContent.trim().toLowerCase();
                if (lbl.includes('pack')) detail.packSize = td.textContent.trim();
                if (lbl.includes('price') || lbl.includes('unit')) detail.unitPrice = td.textContent.replace(/[^0-9.]/g, '');
            });

            // Find company: any text containing Ltd/Pharma near top
            var texts = document.querySelectorAll('div, span');
            texts.forEach(function(el) {
                var t = el.textContent.trim();
                if (!detail.companyName && t.length < 60 && (t.includes('Ltd') || t.includes('Pharma') || t.includes('Laboratories'))) {
                    detail.companyName = t;
                }
            });

            // Medical sections: h2 + next div
            document.querySelectorAll('h2').forEach(function(h2) {
                var name = h2.textContent.trim().toLowerCase().replace(/\s+/g, '');
                var div = h2.nextElementSibling;
                var content = '';
                while (div && div.tagName !== 'H2') {
                    if (div.tagName === 'DIV') content += div.textContent.trim() + '\n';
                    div = div.nextElementSibling;
                }
                content = content.trim();
                if (name.includes('indications')) detail.indications = content;
                else if (name.includes('adultdose')) detail.adultDose = content;
                else if (name.includes('childdose')) detail.childDose = content;
                else if (name.includes('renaldose')) detail.renalDose = content;
                else if (name.includes('administration')) detail.administration = content;
                else if (name.includes('contraindication')) detail.contraindications = content;
                else if (name.includes('precaution')) detail.precautions = content;
                else if (name.includes('pregnancy') || name.includes('lactation')) detail.pregnancyLactation = content;
                else if (name.includes('interaction')) detail.interactions = content;
                else if (name.includes('sideeffect')) detail.sideEffects = content;
                else if (name.includes('modeofaction')) detail.modeOfAction = content;
            });

            var stored = JSON.parse(localStorage.getItem('msbd') || '{}');
            stored[slug] = detail;
            localStorage.setItem('msbd', JSON.stringify(stored));

            var total = Object.keys(stored).length;
            var badge = document.querySelector('#mbadge') || document.createElement('div');
            badge.id = 'mbadge';
            badge.style.cssText = 'position:fixed;bottom:20px;right:20px;background:#6366f1;color:white;padding:10px 18px;border-radius:10px;font:bold 14px sans-serif;z-index:99999;cursor:pointer';
            badge.textContent = 'Scraped: ' + total + ' brands';
            badge.onclick = function() {
                var blob = new Blob([JSON.stringify(stored, null, 2)], { type: 'application/json' });
                var a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = 'medsbd_details.json';
                a.click();
            };
            if (!document.querySelector('#mbadge')) document.body.appendChild(badge);

            // Go to next unvisited slug
            var allSlugs = JSON.parse(localStorage.getItem('msbd_slugs') || '[]');
            var nextSlug = allSlugs.find(function(s) { return !stored[s]; });
            if (nextSlug) {
                setTimeout(function() { window.location.href = 'https://medsbd.com/brand/' + nextSlug; }, 2500 + Math.random() * 1500);
            } else {
                badge.textContent = '✓ DONE! ' + total + ' brands';
                badge.style.background = '#059669';
            }
        }, 3500);
        return;
    }

    // ============ LISTING PAGE ============
    if (isListing) {
        setTimeout(function() {
            var allSlugs = JSON.parse(localStorage.getItem('msbd_slugs') || '[]');
            var newCount = 0;

            document.querySelectorAll('a[href*="/brand/"]').forEach(function(link) {
                var href = link.getAttribute('href');
                if (!href || href.includes('/brands/')) return;
                var slug = href.replace(/.*\/brand\//, '').replace(/\/$/, '');
                if (slug && !allSlugs.includes(slug)) {
                    allSlugs.push(slug);
                    newCount++;
                }
            });

            if (newCount === 0) return; // Nothing new

            localStorage.setItem('msbd_slugs', JSON.stringify(allSlugs));

            var badge = document.querySelector('#mbadge') || document.createElement('div');
            badge.id = 'mbadge';
            badge.style.cssText = 'position:fixed;bottom:20px;right:20px;background:#0d9488;color:white;padding:10px 18px;border-radius:10px;font:bold 14px sans-serif;z-index:99999;cursor:pointer';
            badge.textContent = 'Total slugs: ' + allSlugs.length + ' (+' + newCount + ')';
            badge.onclick = function() {
                var blob = new Blob([JSON.stringify(allSlugs, null, 2)], { type: 'application/json' });
                var a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = 'medsbd_slugs.json';
                a.click();
            };
            if (!document.querySelector('#mbadge')) document.body.appendChild(badge);

            // Check if this is the last letter
            var currentLetter = url.match(/\/brands\/([a-z])/)[1];
            var idx = LETTERS.indexOf(currentLetter);

            if (idx < LETTERS.length - 1) {
                // Go to next letter
                setTimeout(function() {
                    window.location.href = 'https://medsbd.com/brands/' + LETTERS[idx + 1];
                }, 2000 + Math.random() * 1500);
            } else {
                // All letters done — now start scraping detail pages
                badge.textContent = 'DONE! ' + allSlugs.length + ' slugs. Starting details...';
                badge.style.background = '#8b5cf6';
                localStorage.setItem('msbd_ready', 'true');
                // Go to first detail page
                setTimeout(function() {
                    window.location.href = 'https://medsbd.com/brand/' + allSlugs[0];
                }, 2000);
            }
        }, 3000);
    }
})();
