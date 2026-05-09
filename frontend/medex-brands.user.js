// ==UserScript==
// @name        Med-Ex Brands Verifier
// @namespace   medex-brands
// @version     1.2
// @include     https://medex.com.bd/brands*
// @grant       none
// ==/UserScript==

(function() {
    'use strict';
    setTimeout(function() {
        var rows = document.querySelectorAll('.data-row');
        var results = [];
        
        rows.forEach(function(row) {
            var brandEl = row.querySelector('.data-row-top');
            var strengthEl = row.querySelector('.data-row-strength');
            var companyEl = row.querySelector('.data-row-company');
            if (!brandEl) return;
            
            var icon = brandEl.querySelector('.dosage-icon');
            var dosageForm = icon ? (icon.getAttribute('title') || icon.getAttribute('alt') || '') : '';
            
            // Brand name: textContent minus the icon's alt/title text
            var brand = brandEl.textContent.trim();
            
            var strength = strengthEl ? strengthEl.textContent.trim() : '';
            var company = companyEl ? companyEl.textContent.trim() : '';
            
            // Generic is the 3rd div.col-xs-12 in the row
            var divs = row.children;
            var generic = '';
            if (divs.length >= 3) {
                var gDiv = divs[2];
                if (gDiv && !gDiv.querySelector('.data-row-company')) {
                    generic = gDiv.textContent.trim();
                }
            }
            
            results.push({brand: brand, generic: generic, strength: strength, company: company, dosageForm: dosageForm});
        });
        
        if (results.length < 5) return;
        
        var stored = JSON.parse(localStorage.getItem('mxb') || '[]');
        var keys = {}; stored.forEach(function(r) { keys[r.brand + '|' + r.company + '|' + r.strength + '|' + (r.dosageForm||'')] = true; });
        results.forEach(function(r) { var k = r.brand + '|' + r.company + '|' + r.strength + '|' + (r.dosageForm||''); if (!keys[k]) { stored.push(r); keys[k] = true; } });
        localStorage.setItem('mxb', JSON.stringify(stored));
        
        var pageMatch = window.location.href.match(/[?&]page=(\d+)/);
        var page = pageMatch ? parseInt(pageMatch[1]) : 1;
        
        var badge = document.createElement('div');
        badge.style.cssText = 'position:fixed;bottom:20px;right:20px;background:#8b5cf6;color:white;padding:10px 18px;border-radius:10px;font:bold 14px sans-serif;z-index:99999;cursor:pointer';
        badge.textContent = 'Pg ' + page + '/839 | ' + stored.length + ' brands';
        badge.onclick = function() {
            var blob = new Blob([JSON.stringify(stored, null, 2)], {type: 'application/json'});
            var a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = 'medex_brands.json';
            a.click();
        };
        document.body.appendChild(badge);
        
        if (page < 839) {
            setTimeout(function() { window.location.href = 'https://medex.com.bd/brands?page=' + (page + 1); }, 3000 + Math.random() * 2000);
        }
    }, 4000);
})();
