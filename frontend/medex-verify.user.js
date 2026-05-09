// ==UserScript==
// @name        Med-Ex Brand Verifier
// @namespace   medex-verify
// @version     1.1
// @include     https://medex.com.bd/search*
// @grant       none
// ==/UserScript==

(function() {
    'use strict';
    setTimeout(function() {
        var rows = document.querySelectorAll('.search-result-row');
        var results = [];
        
        rows.forEach(function(row) {
            var link = row.querySelector('.search-result-title a');
            var p = row.querySelector('p');
            if (!link) return;
            
            var href = link.getAttribute('href') || '';
            var fullText = link.textContent.trim();
            
            // Parse "Brand Name (Dosage Form)"
            var brand = fullText;
            var dosageForm = '';
            var idx = fullText.lastIndexOf('(');
            if (idx > 0 && fullText.endsWith(')')) {
                brand = fullText.substring(0, idx).trim();
                dosageForm = fullText.substring(idx + 1, fullText.length - 1).trim();
            }
            
            // Parse generic from <i> tag
            var generic = '';
            var iTag = row.querySelector('i');
            if (iTag) generic = iTag.textContent.trim();
            
            // Parse company from text
            var company = '';
            if (p) {
                var txt = p.textContent;
                var cm = txt.match(/manufactured by (.+?)(?:\.\s*)?$/);
                if (cm) company = cm[1].trim();
            }
            
            var type = href.indexOf('/generics/') >= 0 ? 'generic' : 'brand';
            
            results.push({
                name: brand,
                generic: generic,
                company: company,
                dosage_form: dosageForm,
                type: type
            });
        });
        
        if (results.length === 0) return;
        
        var stored = JSON.parse(localStorage.getItem('medex_v') || '[]');
        var keys = {}; stored.forEach(function(r) { keys[r.name + '|' + r.company] = true; });
        results.forEach(function(r) { if (!keys[r.name + '|' + r.company]) { stored.push(r); keys[r.name + '|' + r.company] = true; } });
        localStorage.setItem('medex_v', JSON.stringify(stored));
        
        var url = window.location.href;
        var letter = (url.match(/search=([A-Z])/i) || [,'?'])[1].toUpperCase();
        var page = parseInt(url.match(/page=(\d+)/) || [,'1'])[1];
        
        var badge = document.createElement('div');
        badge.style.cssText = 'position:fixed;bottom:20px;right:20px;background:#8b5cf6;color:white;padding:10px 18px;border-radius:10px;font:bold 14px sans-serif;z-index:99999;cursor:pointer';
        badge.textContent = letter + ' p' + page + ' | ' + stored.length + ' total';
        badge.onclick = function() {
            var blob = new Blob([JSON.stringify(stored, null, 2)], {type: 'application/json'});
            var a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = 'medex_v.json';
            a.click();
        };
        document.body.appendChild(badge);
        
        // Find next page
        var nextLink = document.querySelector('a.page-link[rel="next"]');
        var nextUrl = '';
        
        if (nextLink) {
            nextUrl = nextLink.href;
        } else {
            var letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            var idx = letters.indexOf(letter);
            if (idx >= 0 && idx < 25) {
                nextUrl = 'https://medex.com.bd/search?search=' + letters[idx + 1];
            }
        }
        
        if (nextUrl) {
            setTimeout(function() { window.location.href = nextUrl; }, 2000 + Math.random() * 2000);
        } else {
            document.body.innerHTML = '<h1 style="text-align:center;margin-top:40vh;color:#8b5cf6">✓ ALL 26 LETTERS DONE!</h1>';
        }
    }, 3000);
})();
