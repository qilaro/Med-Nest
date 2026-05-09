// ==UserScript==
// @name        Med-Ex Brand Verifier
// @namespace   medex-verify
// @version     1.0
// @include     https://medex.com.bd/search*
// @grant       none
// ==/UserScript==

(function() {
    'use strict';
    setTimeout(function() {
        var results = [];
        document.querySelectorAll('.search-result-row').forEach(function(row) {
            var titleEl = row.querySelector('.search-result-title');
            if (!titleEl) return;
            
            var link = titleEl.querySelector('a');
            var p = row.querySelector('p');
            if (!link || !p) return;
            
            var href = link.getAttribute('href') || '';
            
            // Parse: "Brand Name (Dosage Form)"
            var fullText = link.textContent.trim();
            var brand = fullText;
            var dosageForm = '';
            var m = fullText.match(/^(.*?)\s*\(([^)]*)\)\s*$/);
            if (m) { brand = m[1].trim(); dosageForm = m[2].trim(); }
            
            // Parse: "Brand Name (Generic Name) is manufactured by Company"
            var pText = p.innerHTML;
            var generic = '';
            var company = '';
            
            var gm = pText.match(/<i>(.*?)<\/i>/);
            if (gm) generic = gm[1].trim();
            
            var cm = pText.match(/manufactured by (.+?)\.?\s*$/);
            if (cm) company = cm[1].trim();
            
            var type = 'brand';
            if (href.indexOf('/generics/') >= 0) type = 'generic';
            
            results.push({
                name: brand,
                generic: generic,
                company: company,
                dosage_form: dosageForm,
                url: href,
                type: type
            });
        });
        
        if (results.length === 0) return;
        
        var stored = JSON.parse(localStorage.getItem('medex_verified') || '[]');
        var keys = {}; stored.forEach(function(r) { keys[r.name + r.company] = true; });
        results.forEach(function(r) { if (!keys[r.name + r.company]) stored.push(r); });
        localStorage.setItem('medex_verified', JSON.stringify(stored));
        
        var match = window.location.href.match(/search=([A-Za-z])/);
        var letter = match ? match[1].toUpperCase() : '?';
        
        var pageMatch = window.location.href.match(/page=(\d+)/);
        var page = pageMatch ? parseInt(pageMatch[1]) : 1;
        
        var totalByLetter = {};
        stored.forEach(function(r) { 
            var first = r.name.charAt(0).toUpperCase();
            if (first.match(/[A-Z]/)) totalByLetter[first] = (totalByLetter[first] || 0) + 1;
        });
        
        var badge = document.createElement('div');
        badge.style.cssText = 'position:fixed;bottom:20px;right:20px;background:#8b5cf6;color:white;padding:10px 18px;border-radius:10px;font:bold 14px sans-serif;z-index:99999;cursor:pointer';
        var done = Object.keys(totalByLetter).length;
        badge.textContent = letter + ' pg' + page + ' | ' + stored.length + ' brands | ' + done + '/26 letters';
        badge.onclick = function() {
            var blob = new Blob([JSON.stringify(stored, null, 2)], {type: 'application/json'});
            var a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = 'medex_verified.json';
            a.click();
        };
        document.body.appendChild(badge);
        
        // Find next page to scrape
        var nextPage = page + 1;
        var nextUrl = '';
        
        // Check if next page exists
        var nextLink = document.querySelector('a.page-link[rel="next"]');
        if (nextLink) {
            nextUrl = 'https://medex.com.bd/search?search=' + letter + '&page=' + nextPage;
        } else {
            // Move to next letter
            var letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            var idx = letters.indexOf(letter);
            if (idx >= 0 && idx < 25) {
                var nextLetter = letters[idx + 1];
                nextUrl = 'https://medex.com.bd/search?search=' + nextLetter;
            }
        }
        
        if (nextUrl) {
            setTimeout(function() {
                window.location.href = nextUrl;
            }, 2000 + Math.floor(Math.random() * 2000));
        } else {
            document.body.innerHTML = '<h1 style="text-align:center;margin-top:40vh;color:#8b5cf6">✓ ALL 26 LETTERS COMPLETE!</h1>';
        }
    }, 3000);
})();
