// ==UserScript==
// @name        Beximco Product Scraper
// @namespace   beximco
// @version     1.0
// @include     https://www.beximcopharma.com/products/*
// @grant       none
// ==/UserScript==

(function() {
    'use strict';
    
    function extractClasses() {
        var links = document.querySelectorAll('a.reloadPage');
        var imgs = document.querySelectorAll('img[src*="sobipro"]');
        
        var imgMap = {};
        imgs.forEach(function(img) {
            var parent = img.closest('a, div');
            if (parent) imgMap[parent.textContent.trim()] = img.src;
        });
        
        var classes = [];
        links.forEach(function(a) {
            classes.push({
                name: a.textContent.trim(),
                url: a.href,
                icon: imgMap[a.textContent.trim()] || ''
            });
        });
        return classes;
    }
    
    // Run after page load
    setTimeout(function() {
        var classes = extractClasses();
        if (classes.length === 0) return;
        
        var stored = JSON.parse(localStorage.getItem('bxm') || '{}');
        stored.classes = classes;
        stored.updated = new Date().toISOString();
        localStorage.setItem('bxm', JSON.stringify(stored));
        
        var badge = document.createElement('div');
        badge.style.cssText = 'position:fixed;bottom:20px;right:20px;background:#2563eb;color:white;padding:10px 18px;border-radius:10px;font:bold 14px sans-serif;z-index:99999;cursor:pointer;box-shadow:0 2px 15px rgba(0,0,0,0.2)';
        badge.textContent = classes.length + ' classes saved';
        badge.onclick = function() {
            var all = JSON.parse(localStorage.getItem('bxm') || '{}');
            var blob = new Blob([JSON.stringify(all, null, 2)], {type: 'application/json'});
            var a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = 'beximco_data.json';
            a.click();
        };
        document.body.appendChild(badge);
        setTimeout(function() { badge.remove(); }, 5000);
    }, 3000);
})();
