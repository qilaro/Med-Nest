// ==UserScript==
// @name         Med-Ex Generic Scraper
// @namespace    medex-scraper
// @version      1.0
// @description  Scrapes generic data from Med-Ex and saves to localStorage
// @author       Med-Nest
// @match        https://medex.com.bd/generics/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Only run on generic detail pages (not listing pages)
    const match = window.location.pathname.match(/\/generics\/(\d+)/);
    if (!match || document.querySelector('.ac-body') === null) return;

    const id = parseInt(match[1]);
    const name = document.title.replace(' | MedEx', '').trim();

    // Extract all sections
    const data = { id, name };
    document.querySelectorAll('.ac-body').forEach(el => {
        const prev = el.previousElementSibling;
        if (prev) {
            const heading = prev.querySelector('h2, h3, h4');
            if (heading) {
                const key = heading.textContent.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
                data[key] = el.textContent.trim();
            }
        }
    });

    // Store in localStorage
    const stored = JSON.parse(localStorage.getItem('medex_scraped') || '{}');
    stored[id] = data;
    localStorage.setItem('medex_scraped', JSON.stringify(stored));

    // Show a small indicator
    const total = Object.keys(stored).length;
    const badge = document.createElement('div');
    badge.style.cssText = 'position:fixed;bottom:20px;right:20px;background:#22c55e;color:white;padding:8px 16px;border-radius:8px;font:bold 14px sans-serif;z-index:99999;cursor:pointer;box-shadow:0 2px 10px rgba(0,0,0,0.2)';
    badge.textContent = `✓ ${total} generics saved`;
    badge.onclick = function() {
        const allData = JSON.parse(localStorage.getItem('medex_scraped') || '{}');
        const blob = new Blob([JSON.stringify(Object.values(allData), null, 2)], {type: 'application/json'});
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'medex_all_generics.json';
        a.click();
        badge.textContent = 'Downloaded!';
        setTimeout(() => badge.remove(), 2000);
    };
    document.body.appendChild(badge);
    setTimeout(() => badge.remove(), 3000);
})();
