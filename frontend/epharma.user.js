// ==UserScript==
// @name        ePharma Scraper
// @namespace   epharma
// @version     2.0
// @include     https://epharma.com.bd/en/medicines*
// @grant       none
// ==/UserScript==

(function() {
    'use strict';
    setTimeout(function() {
        var allText = document.body.innerText;
        var lines = allText.split('\n').map(l => l.trim()).filter(l => l.length > 2);
        var skip = ['Home','About Us','Contact Us','Privacy Policy','Returns Policy','Terms and Conditions',
            'Login','Cart','Track Order','Sign in','Sign up','Search','Category',
            'Personal Care','Baby & Mom','Health Accessories','Sexual Wellbeing','Medicines','Diabetic',
            'All Medicines','Filter','Sort by','Add to Bag','Hotline','Reliable','Pay with',
            'Product Type','Brand','Container','Food Supplements','Vitamins & Supplements',
            'Hair Care','Skin Care','Eye Ear Care','Women Care','Men Care',
            'Medicines Price in BD','Order genuine prescription','DBID Registration',
            'Delivery Days/Hours','All Rights Reserved'];
        
        var products = [];
        for (var i = 0; i < lines.length; i++) {
            var l = lines[i];
            if (!l.match(/[a-zA-Z]/) || l.match(/^[৳\$]/) || l === 'MRP') continue;
            if (skip.indexOf(l) !== -1) continue;
            if (l.length < 6) continue;
            
            var price = '', mrp = '';
            for (var j = i+1; j < Math.min(i+8, lines.length); j++) {
                if (lines[j].match(/^[৳\$]\s*[\d,]+/)) { price = lines[j]; break; }
                if (lines[j] === 'MRP' && j+1 < lines.length && lines[j+1].match(/^[৳\$]/)) {
                    mrp = lines[j+1]; break;
                }
            }
            products.push({name: l, price: (price||'').replace('৳','').trim(), mrp: (mrp||'').replace('৳','').trim()});
        }
        
        var stored = JSON.parse(localStorage.getItem('eph') || '[]');
        var names = {}; stored.forEach(function(p) { names[p.name] = true; });
        products.forEach(function(p) { if (!names[p.name]) stored.push(p); });
        localStorage.setItem('eph', JSON.stringify(stored));
        
        var match = window.location.href.match(/page=(\d+)/);
        var page = match ? parseInt(match[1]) : 1;
        
        var badge = document.createElement('div');
        badge.style.cssText = 'position:fixed;bottom:20px;right:20px;background:#10b981;color:white;padding:10px 18px;border-radius:10px;font:bold 14px sans-serif;z-index:99999;cursor:pointer';
        badge.textContent = 'Pg ' + page + ' | ' + stored.length + ' items';
        badge.onclick = function() {
            var blob = new Blob([JSON.stringify(stored, null, 2)], {type: 'application/json'});
            var a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = 'epharma.json';
            a.click();
        };
        document.body.appendChild(badge);
        
        if (page < 273) {
            setTimeout(function() {
                window.location.href = 'https://epharma.com.bd/en/medicines?page=' + (page + 1);
            }, 7000 + Math.floor(Math.random() * 5000));
        }
    }, 8000);
})();
