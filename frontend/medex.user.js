// ==UserScript==
// @name        Med-Ex Scraper
// @namespace   medex
// @version     1.0
// @include     https://medex.com.bd/generics/*
// @grant       none
// ==/UserScript==

(function() {
    'use strict';
    const m = window.location.pathname.match(/\/generics\/(\d+)/);
    if (!m || !document.querySelector('.ac-body')) return;
    const id = parseInt(m[1]);
    const name = document.title.replace(/\s*\|\s*MedEx\s*$/i, '').trim();
    const data = {id, name};
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
    setTimeout(function() { badge.remove(); }, 4000);
})();
