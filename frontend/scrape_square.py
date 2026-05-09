import urllib.request, re, json, ssl, time, random, os

ssl._create_default_https_context = ssl._create_unverified_context
h = {'User-Agent': 'Mozilla/5.0'}
BASE = 'https://www.squarepharma.com.bd'

print('Collecting Square Pharma product IDs...')
ids = set()
for char in 'ABCDEFGHIJKLMNOPQRSTUVWXYZ':
    for ptype in ['pharma', 'herbal', 'agrovet']:
        url = f'{BASE}/products-by-tradename.php?type={ptype}&char={char}'
        try:
            html = urllib.request.urlopen(urllib.request.Request(url, headers=h), timeout=15).read().decode('utf-8', errors='ignore')
            ids.update(int(x) for x in re.findall(r'product-details\.php\?pid=(\d+)', html))
        except: pass
    print(f'  {char}: {len(ids)} total')

ids = sorted(ids)
print(f'\nTotal products: {len(ids)}')

def ext(html, heading):
    """Extract section content between heading tags."""
    patterns = [
        rf'<h3[^>]*>{re.escape(heading)}[^<]*</h3>\s*<p>(.*?)</p>',
        rf'<b>{re.escape(heading)}[^<]*</b>\s*<p>(.*?)</p>',
    ]
    for p in patterns:
        m = re.search(p, html, re.I|re.S)
        if m:
            return re.sub(r'<[^>]*>', '', m.group(1)).replace('&amp;','&').replace('<br />','\n').replace('<br/>','\n').replace('&nbsp;',' ').strip()
    return ''

results = []
for i, pid in enumerate(ids):
    try:
        html = urllib.request.urlopen(urllib.request.Request(f'{BASE}/product-details.php?pid={pid}', headers=h), timeout=10).read().decode('utf-8', errors='ignore')
        
        # Extract brand name from <h3>
        brand_m = re.search(r'<h3[^>]*>(.*?)</h3>', html)
        if not brand_m: continue
        brand = re.sub(r'<[^>]*>', '', brand_m.group(1)).strip()
        
        # Extract generic from <h4>
        generic_m = re.search(r'<h4[^>]*>(.*?)</h4>', html)
        generic = re.sub(r'<[^>]*>', '', generic_m.group(1)).strip() if generic_m else ''
        
        # Therapeutic class (the <p> after brand name)
        tc_m = re.search(rf'<h3[^>]*>.*?</h3>\s*<h4[^>]*>.*?</h4>\s*<p>(.*?)</p>', html, re.I|re.S)
        tc = re.sub(r'<[^>]*>', '', tc_m.group(1)).strip() if tc_m else ''
        
        results.append({
            'id': pid, 'brand': brand, 'generic': generic,
            'therapeutic_class': tc,
            'indications': ext(html, 'Indication'),
            'dosage': ext(html, 'Dosage'),
            'preparation': ext(html, 'Preparation'),
        })
    except: pass
    
    if (i+1) % 50 == 0:
        json.dump(results, open('square_products.json', 'w'))
        print(f'  {i+1}/{len(ids)} ({len(results)} with data)')
    
    time.sleep(random.uniform(0.15, 0.3))

json.dump(results, open('square_products.json', 'w'), indent=2)
print(f'\nDone! {len(results)} products scraped')
