// ==UserScript==
// @name        Beximco Class & Icon Scraper
// @namespace   beximco
// @version     1.0
// @include     https://www.beximcopharma.com/products/our-product-range
// @grant       none
// ==/UserScript==

(function() {
    'use strict';
    setTimeout(function() {
        var links = document.querySelectorAll('a.reloadPage');
        var classes = [];
        
        links.forEach(function(a) {
            // Find the icon image near this link
            var container = a.closest('[class*="theme"], [class*="product"], div');
            var img = container ? container.querySelector('img[src*="sobipro"]') : null;
            var icon = img ? img.src : '';
            
            classes.push({
                name: a.textContent.trim(),
                url: a.href,
                icon: icon
            });
        });
        
        if (classes.length === 0) {
            alert('No classes found. Page might not be loaded yet.');
            return;
        }
        
        localStorage.setItem('bxm', JSON.stringify({classes: classes, updated: new Date().toISOString()}));
        
        var badge = document.createElement('div');
        badge.style.cssText = 'position:fixed;bottom:20px;right:20px;background:#2563eb;color:white;padding:10px 18px;border-radius:10px;font:bold 14px sans-serif;z-index:99999;cursor:pointer;box-shadow:0 2px 15px rgba(0,0,0,0.2)';
        badge.textContent = classes.length + ' classes with icons';
        badge.onclick = function() {
            var blob = new Blob([JSON.stringify(JSON.parse(localStorage.getItem('bxm')), null, 2)], {type: 'application/json'});
            var a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = 'beximco_classes.json';
            a.click();
        };
        document.body.appendChild(badge);
    }, 3000);
})();
