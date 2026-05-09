import urllib.request, re, json, ssl, time, random, subprocess
ssl._create_default_https_context = ssl._create_unverified_context
h = {'User-Agent': 'Mozilla/5.0'}
BASE = 'https://www.squarepharma.com.bd'
def ext(html, tag):
    m = re.search(rf'<{tag}[^>]*>(.*?)</{tag}>', html, re.I|re.S)
    return re.sub(r'<[^>]*>', '', m.group(1)).strip() if m else ''
def pdf_text(url):
    try:
        data = urllib.request.urlopen(urllib.request.Request(url, headers=h), timeout=15).read()
        r = subprocess.run(['pdftotext', '-', '-'], input=data, capture_output=True, timeout=15)
        return r.stdout.decode('utf-8', errors='ignore')
    except: return ''
results = []
for pid in range(1, 1060):
    try:
        html = urllib.request.urlopen(urllib.request.Request(f'{BASE}/product-details.php?pid={pid}', headers=h), timeout=10).read().decode('utf-8', errors='ignore')
        if '<h3' not in html: continue
        
        brand = ext(html, 'h3')
        generic = ext(html, 'h4')
        
        img_m = re.search(r'<img[^>]*src="([^"]*products[^"]+\.(?:jpg|png))"', html)
        img_url = f'{BASE}/{img_m.group(1)}' if img_m else ''
        
        pdf_url = ''
        pdf_m = re.search(r'href="(downloads/[^"]*pdoc[^"]*\.pdf)"', html)
        if pdf_m: pdf_url = f'{BASE}/{pdf_m.group(1)}'
        
        sections = {}
        if pdf_url:
            text = pdf_text(pdf_url)
            if text:
                for key, pattern in [
                    ('description', r'DESCRIPTION\s*(.*?)(?=INDICATIONS|$)'),
                    ('indications', r'INDICATIONS\s*(.*?)(?=DOSAGE|CONTRAINDICATIONS|$)'),
                    ('dosage', r'DOSAGE AND ADMINISTRATION\s*(.*?)(?=CONTRAINDICATIONS|PRECAUTIONS|$)'),
                    ('contraindications', r'CONTRAINDICATIONS\s*(.*?)(?=PRECAUTIONS|DRUG INTERACTIONS|$)'),
                    ('interactions', r'DRUG INTERACTIONS\s*(.*?)(?=OVERDOSAGE|SIDE EFFECTS|$)'),
                    ('side_effects', r'SIDE EFFECTS\s*(.*?)(?=USE IN PREGNANCY|STORAGE|$)'),
                    ('pregnancy', r'USE IN PREGNANCY[^)]*\s*(.*?)(?=STORAGE|HOW SUPPLIED|$)'),
                    ('overdose', r'OVERDOSAGE\s*(.*?)(?=SIDE EFFECTS|$)'),
                    ('storage', r'STORAGE\s*(.*?)(?=HOW SUPPLIED|$)'),
                ]:
                    m = re.search(pattern, text, re.I|re.S)
                    if m: sections[key] = m.group(1).strip().replace('\n', ' ').replace('  ', ' ')
        
        results.append({
            'id': pid, 'brand': brand, 'generic': generic,
            'image_url': img_url, 'pdf_url': pdf_url, **sections
        })
    except: pass
    
    if pid % 100 == 0: print(f'  {pid}/1059 ({len(results)} found)')
    time.sleep(random.uniform(0.1, 0.25))
json.dump(results, open('square_final.json', 'w'), indent=2)
print(f'\nDone! {len(results)} products')
