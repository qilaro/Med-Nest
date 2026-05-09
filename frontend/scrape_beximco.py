"""
Beximco Pharma Scraper
Run: python3 scrape_beximco.py
"""
from playwright.sync_api import sync_playwright
import json, time, random

BASE = 'https://www.beximcopharma.com'

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    
    # Step 1: Get all class links + icons
    print('Step 1: Getting class list...')
    page.goto(f'{BASE}/products/our-product-range', wait_until='domcontentloaded', timeout=30000)
    page.wait_for_timeout(5000)
    
    classes = page.evaluate('''
        () => {
            const links = document.querySelectorAll('a.reloadPage');
            const imgs = document.querySelectorAll('img[src*="sobipro"]');
            const imgMap = {};
            imgs.forEach(img => {
                const parent = img.closest('a, div');
                if (parent) imgMap[parent.textContent.trim()] = img.src;
            });
            
            return Array.from(links).map(a => ({
                name: a.textContent.trim(),
                url: a.href,
                icon: imgMap[a.textContent.trim()] || ''
            }));
        }
    ''')
    
    print(f'  Found {len(classes)} classes')
    
    # Step 2: Visit each class page and get products
    all_products = []
    
    for cls in classes:
        print(f'\n  {cls["name"]}...', end=' ')
        try:
            page.goto(cls['url'], wait_until='domcontentloaded', timeout=30000)
            page.wait_for_timeout(3000)
            
            products = page.evaluate('''
                () => {
                    const items = [];
                    // Look for product names - try various selectors
                    const selectors = [
                        '[class*="product-name"]', '[class*="product-title"]',
                        '[class*="entry-title"]', '[class*="field-name"]',
                        'h2', 'h3', 'h4', 'h5',
                        'a[href*="product"]', '[class*="sobipro"] li',
                        '.spFieldsData', '.field'
                    ];
                    
                    for (const sel of selectors) {
                        const els = document.querySelectorAll(sel);
                        if (els.length > 1) {
                            return Array.from(els).map(el => ({
                                text: el.textContent.trim(),
                                tag: el.tagName,
                                class: el.className.slice(0, 60)
                            })).filter(p => p.text && p.text.length > 1 && p.text.length < 200);
                        }
                    }
                    
                    // Fallback: all visible text blocks
                    const all = document.querySelectorAll('[class*="product"], [class*="field"], li, p');
                    return Array.from(all).map(el => ({
                        text: el.textContent.trim().slice(0, 100),
                        tag: el.tagName,
                        class: el.className.slice(0, 60)
                    })).filter(p => p.text && p.text.length > 2 && p.text.length < 150);
                }
            ''')
            
            print(f'{len(products)} products')
            
            all_products.append({
                'class': cls['name'],
                'icon': cls['icon'],
                'url': cls['url'],
                'products': products[:50]
            })
            
        except Exception as e:
            print(f'ERROR: {str(e)[:30]}')
        
        time.sleep(random.uniform(1, 2))
    
    # Save
    output = {'classes': all_products}
    json.dump(output, open('beximco_data.json', 'w'), indent=2)
    
    print(f'\n\n=== Done ===')
    print(f'Classes: {len(classes)}')
    print(f'Saved to beximco_data.json')
    
    browser.close()
