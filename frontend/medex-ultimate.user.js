// ==UserScript==
// @name        Med-Ex Ultimate
// @namespace   medex-ultimate
// @version     1.0
// @include     https://medex.com.bd/generics/\*
// @grant       none
// ==/UserScript==
(function() {
    'use strict';
    var m = window.location.pathname.match(/\/generics\/(\d+)/);
    if (!m) return;
    var id = parseInt(m[1]);
    var hasData = document.querySelector('.ac-body');
    if (hasData) {
        var name = document.title.replace(/\s*\|\s*MedEx\s*$/i, '').trim();
        var data = {id: id, name: name};
        document.querySelectorAll('.ac-body').forEach(function(el) {
            var prev = el.previousElementSibling;
            if (prev) {
                var h = prev.querySelector('h2, h3, h4');
                if (h) {
                    var key = h.textContent.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
                    data[key] = el.textContent.trim();
                }
            }
        });
        var prices = {};
        document.querySelectorAll('.available-brands').forEach(function(el) {
            var brand = el.querySelector('.data-row-top');
            var priceEl = el.querySelector('.package-pricing');
            if (brand && priceEl) prices[brand.textContent.trim()] = priceEl.textContent.trim();
        });
        if (Object.keys(prices).length > 0) data.brand_prices = prices;
        var stored = JSON.parse(localStorage.getItem('mx') || '{}');
        stored[id] = data;
        localStorage.setItem('mx', JSON.stringify(stored));
        var total = Object.keys(stored).length;
        var badge = document.createElement('div');
        badge.style.cssText = 'position:fixed;bottom:20px;right:20px;background:#22c55e;color:white;padding:8px 16px;border-radius:8px;font:bold 14px sans-serif;z-index:99999;cursor:pointer';
        badge.textContent = total + ' saved';
        badge.onclick = function() {
            var all = JSON.parse(localStorage.getItem('mx') || '{}');
            var blob = new Blob([JSON.stringify(Object.values(all), null, 2)], {type: 'application/json'});
            var a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = 'medex.json';
            a.click();
        };
        document.body.appendChild(badge);
        setTimeout(function() { badge.remove(); }, 5000);
    }
    setTimeout(function() {
        var done = JSON.parse(localStorage.getItem('mx') || '{}');
        var doneIds = Object.keys(done).map(Number);
        var remaining = [];
        for (var i = 1; i <= 2556; i++) {
            if (doneIds.indexOf(i) === -1) remaining.push(i);
        }
        if (remaining.length === 0) {
            document.body.innerHTML = '<h1 style="text-align:center;margin-top:40vh;color:#22c55e">✓ ALL 2556 GENERICS SCRAPED</h1>';
            return;
        }
        var next = remaining[Math.floor(Math.random() * remaining.length)];
        var delay = 15000 + Math.floor(Math.random() * 10000);
        if (doneIds.length > 0 && doneIds.length % 15 === 0) delay = 180000 + Math.floor(Math.random() * 120000);
        setTimeout(function() { window.location.href = 'https://medex.com.bd/generics/' + next; }, delay);
    }, 5000);
})();
