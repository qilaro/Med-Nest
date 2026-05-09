// ==UserScript==
// @name        Beximco Icons
// @namespace   beximco-icons
// @version     1.1
// @include     https://www.beximcopharma.com/products/our-product-range
// @grant       none
// ==/UserScript==

(function() {
    'use strict';
    setTimeout(function() {
        var result = [];
        document.querySelectorAll('.product-copy').forEach(function(el) {
            var a = el.querySelector('a.reloadPage');
            var img = el.closest('[class*="row"]').querySelector('img');
            if (a) {
                result.push({
                    name: a.textContent.trim(),
                    icon: img ? img.src : '',
                    url: a.href
                });
            }
        });
        
        if (result.length === 0) {
            alert('No classes found. Try reloading.');
            return;
        }
        
        localStorage.setItem('bxm_classes', JSON.stringify(result));
        
        var badge = document.createElement('div');
        badge.style.cssText = 'position:fixed;bottom:20px;right:20px;background:#2563eb;color:white;padding:10px 18px;border-radius:10px;font:bold 14px sans-serif;z-index:99999;cursor:pointer';
        badge.textContent = result.length + ' classes';
        badge.onclick = function() {
            var blob = new Blob([JSON.stringify(result, null, 2)], {type: 'application/json'});
            var a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = 'beximco_classes.json';
            a.click();
        };
        document.body.appendChild(badge);
    }, 3000);
})();
