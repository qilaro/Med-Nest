import urllib.request, re, json, ssl, time, random, os
ssl._create_default_https_context = ssl._create_unverified_context
headers = {'User-Agent': 'Mozilla/5.0'}
print('Getting product IDs...')
ids = set()
for letter in 'ABCDEFGHIJKLMNOPQRSTUVWXYZ':
    url = f'https://www.inceptapharma.com/products-by-trade-name.php?char={letter}'
    html = urllib.request.urlopen(urllib.request.Request(url, headers=headers), timeout=15).read().decode('utf-8', errors='ignore')
    ids.update(int(x) for x in re.findall(r'product-details\.php\?pid=(\d+)', html))
    print(f'  {letter}: {len(ids)} total')
ids = sorted(ids)
print(f'\nTotal: {len(ids)} products')
def ext(html, h):
    m = re.search(rf'<h3>{re.escape(h)}</h3>\s*<p>(.*?)</p>', html, re.I|re.S)
    if m: return re.sub(r'<[^>]*>', '', m.group(1)).replace('&','&').replace('<br />','\n').strip()
    return ''
results = []
for i, pid in enumerate(ids):
    try:
        html = urllib.request.urlopen(urllib.request.Request(f'https://www.inceptapharma.com/product-details.php?pid={pid}', headers=headers), timeout=10).read().decode('utf-8', errors='ignore')
        
        t = re.search(r'<h2>(.*?)</h2>', html)
        if not t: continue
        g = re.search(r'<span>(.*?)</span>', t.group(1))
        brand = t.group(1).replace(g.group(0), '').strip() if g else t.group(1).strip()
        generic = g.group(1).strip() if g else ''
        tc = re.search(r'<h3 class="tclshead">(.*?)</h3>', html)
        
        results.append({
            'id': pid, 'brand': brand, 'generic': generic,
            'therapeutic_class': tc.group(1).replace('Therapeutic Group: ','').strip() if tc else '',
            'indications': ext(html, 'Indications'),
            'dosage': ext(html, 'Dosage & Administration'),
            'side_effects': ext(html, 'Side Effects'),
            'precautions': ext(html, 'Precautions'),
            'interaction': ext(html, 'Drug Interaction'),
            'contraindications': ext(html, 'Contraindications'),
            'presentation': ext(html, 'Presentation'),
        })
    except: pass
    
    if (i+1) % 50 == 0:
        json.dump(results, open('incepta_products.json', 'w'))
        print(f'  {i+1}/{len(ids)} ({len(results)} with data)')
    
    time.sleep(random.uniform(0.15, 0.3))
json.dump(results, open('incepta_products.json', 'w'))
print(f'\nDone! {len(results)} products scraped')
