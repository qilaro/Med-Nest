// ==UserScript==
// @name        ePharma Scraper
// @namespace   epharma
// @version     1.0
// @include     https://epharma.com.bd/en/medicines*
// @grant       none
// ==/UserScript==

(function() {
    'use strict';
    setTimeout(function() {
        var items = document.querySelectorAll('[class*="product"], [class*="medicine"]');
        var products = [];
        
        // Try to extract product info from the page
        // Look for product name + price patterns
        var allText = document.body.innerText;
        var lines = allText.split('\n').map(l => l.trim()).filter(l => l.length > 3);
        
        // Find product lines (they have specific patterns)
        var navItems = ['Home','Login','Cart','Track Order','Sign in','Sign up','Search','Category',
            'Personal Care','Baby & Mom','Health Accessories','Sexual Wellbeing','Medicines','Diabetic',
            'Contact Us','About Us','Track Order','Pay with','Product Type','Brand','Container',
            'Medicines Price in BD','All Medicines','Filter','Sort by'];
        
        // Extract products: pairs of (name, price) nearby
        var collected = [];
        for (var i = 0; i < lines.length; i++) {
            var l = lines[i];
            if (navItems.indexOf(l) !== -1) continue;
            if (l.match(/^\d+%?$/) || l.match(/^\d+%/)) continue;
            if (l.match(/^৳/)) continue;
            if (l === 'MRP') continue;
            
            // If this looks like a product name
            if (l.length > 5 && l.match(/[a-zA-Z]/) && !l.match(/^https?/)) {
                var price = '';
                var mrp = '';
                // Look for price in next lines
                for (var j = i+1; j < Math.min(i+5, lines.length); j++) {
                    if (lines[j].match(/^৳\d+/)) {
                        price = lines[j]; break;
                    }
                    if (lines[j] === 'MRP' && j+1 < lines.length && lines[j+1].match(/^৳\d+/)) {
                        mrp = lines[j+1]; break;
                    }
                }
                collected.push({name: l, price: price, mrp: mrp});
                i += 3; // skip ahead
            }
        }
        
        if (collected.length === 0) {
            alert('No products found. Page might not be loaded yet.');
            return;
        }
        
        // Save to localStorage
        var existing = JSON.parse(localStorage.getItem('epharma') || '[]');
        var newProducts = collected.filter(function(p) {
            return !existing.some(function(e) { return e.name === p.name; });
        });
        Array.prototype.push.apply(existing, newProducts);
        localStorage.setItem('epharma', JSON.stringify(existing));
        
        // Show badge
        var badge = document.createElement('div');
        badge.style.cssText = 'position:fixed;bottom:20px;right:20px;background:#10b981;color:white;padding:10px 18px;border-radius:10px;font:bold 14px sans-serif;z-index:99999;cursor:pointer';
        badge.textContent = existing.length + ' products';
        badge.onclick = function() {
            var blob = new Blob([JSON.stringify(existing, null, 2)], {type: 'application/json'});
            var a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = 'epharma_products.json';
            a.click();
        };
        document.body.appendChild(badge);
        
        // Auto-advance to next page
        var match = window.location.href.match(/page=(\d+)/);
        var page = match ? parseInt(match[1]) : 1;
        if (page < 273) {
            setTimeout(function() {
                window.location.href = 'https://epharma.com.bd/en/medicines?page=' + (page + 1);
            }, 5000 + Math.floor(Math.random() * 3000));
        } else {
            document.body.innerHTML = '<h1 style="text-align:center;margin-top:40vh;color:#10b981">✓ ALL 273 PAGES SCRAPED</h1>';
        }
    }, 4000);
})();
