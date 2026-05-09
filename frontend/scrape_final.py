"""
Final scraper: Incepta + Square + PDFs + Images
Usage: python3 scrape_final.py <company>
Companies: incepta, square, all
"""
import urllib.request, re, json, ssl, time, random, subprocess, sys, os

ssl._create_default_https_context = ssl._create_unverified_context
h = {'User-Agent': 'Mozilla/5.0'}

def ext(html, tag, cls=''):
    """Extract text from HTML tag."""
    p = re.compile(rf'<{tag}[^>]*class="{cls}"[^>]*>(.*?)</{tag}>', re.I|re.S) if cls else re.compile(rf'<{tag}[^>]*>(.*?)</{tag}>', re.I|re.S)
    m = p.search(html)
    return m.group(1).strip() if m else ''

def pdf_text(url):
    """Download PDF and extract text."""
    try:
        data = urllib.request.urlopen(urllib.request.Request(url, headers=h), timeout=15).read()
        r = subprocess.run(['pdftotext', '-', '-'], input=data, capture_output=True, timeout=15)
        return r.stdout.decode('utf-8', errors='ignore')
    except: return ''

def extract_pdf_sections(text):
    """Extract sections from PDF text."""
    sections = {}
    patterns = [
        ('description', r'DESCRIPTION\s*(.*?)(?=INDICATIONS|COMPOSITION|$)'),
        ('indications', r'INDICATIONS\s*(.*?)(?=DOSAGE|CONTRAINDICATIONS|PRECAUTIONS|$)'),
        ('dosage', r'DOSAGE AND ADMINISTRATION\s*(.*?)(?=CONTRAINDICATIONS|PRECAUTIONS|DRUG INTERACTIONS|$)'),
        ('contraindications', r'CONTRAINDICATIONS\s*(.*?)(?=PRECAUTIONS|DRUG INTERACTIONS|WARNINGS|$)'),
        ('precautions', r'PRECAUTIONS\s*(.*?)(?=DRUG INTERACTIONS|OVERDOSAGE|SIDE EFFECTS|$)'),
        ('interactions', r'DRUG INTERACTIONS\s*(.*?)(?=OVERDOSAGE|SIDE EFFECTS|USE IN PREGNANCY|$)'),
        ('side_effects', r'SIDE EFFECTS\s*(.*?)(?=USE IN PREGNANCY|STORAGE|HOW SUPPLIED|$)'),
        ('pregnancy', r'USE IN PREGNANCY[^)]*\s*(.*?)(?=STORAGE|HOW SUPPLIED|$)'),
        ('overdose', r'OVERDOSAGE\s*(.*?)(?=SIDE EFFECTS|USE IN PREGNANCY|STORAGE|$)'),
        ('storage', r'STORAGE\s*(.*?)(?=HOW SUPPLIED|KEEP OUT|$)'),
        ('composition', r'COMPOSITION\s*(.*?)(?=DESCRIPTION|INDICATIONS|$)'),
    ]
    for key, pattern in patterns:
        m = re.search(pattern, text, re.I|re.S)
        if m:
            sections[key] = m.group(1).strip().replace('\n', ' ').replace('  ', ' ')
    return sections

def scrape_company(name, base_url, listing_url, company_name):
    """Generic scraper for Incepta-style sites."""
    print(f'\n=== {name} ===')
    
    # Get all product IDs
    ids = set()
    for char in 'ABCDEFGHIJKLMNOPQRSTUVWXYZ':
        url = f'{listing_url}{char}'
        try:
            html = urllib.request.urlopen(urllib.request.Request(url, headers=h), timeout=15).read().decode('utf-8', errors='ignore')
            ids.update(int(x) for x in re.findall(r'product-details\.php\?pid=(\d+)', html))
        except: pass
    
    ids = sorted(ids)
    print(f'Products: {len(ids)}')
    
    results = []
    for i, pid in enumerate(ids):
        try:
            html = urllib.request.urlopen(urllib.request.Request(f'{base_url}/product-details.php?pid={pid}', headers=h), timeout=10).read().decode('utf-8', errors='ignore')
            
            # Extract basic info
            h3 = ext(html, 'h3')
            h4 = ext(html, 'h4')
            if not h3: continue
            
            # Find PDF link
            pdf_url = ''
            pdf_m = re.search(r'href="([^"]*pdoc[^"]*\.pdf)"', html)
            if pdf_m: pdf_url = base_url + '/' + pdf_m.group(1)
            
            # Find image URL
            img_url = ''
            img_m = re.search(r'<img[^>]*src="([^"]*products[^"]+\.(?:jpg|png|webp))"', html)
            if img_m: img_url = base_url + '/' + img_m.group(1) if img_m.group(1).startswith('/') else base_url + '/' + img_m.group(1)
            
            # Get PDF sections
            pdf_sections = {}
            if pdf_url:
                text = pdf_text(pdf_url)
                if text: pdf_sections = extract_pdf_sections(text)
            
            results.append({
                'id': pid, 'brand': h3, 'generic': h4,
                'company': company_name,
                'image_url': img_url,
                'pdf_url': pdf_url,
                'description': pdf_sections.get('description', ''),
                'indications': pdf_sections.get('indications', ext(html, 'p')),
                'dosage': pdf_sections.get('dosage', ''),
                'contraindications': pdf_sections.get('contraindications', ''),
                'precautions': pdf_sections.get('precautions', ''),
                'interactions': pdf_sections.get('interactions', ''),
                'side_effects': pdf_sections.get('side_effects', ''),
                'pregnancy': pdf_sections.get('pregnancy', ''),
                'overdose': pdf_sections.get('overdose', ''),
                'storage': pdf_sections.get('storage', ''),
                'composition': pdf_sections.get('composition', ''),
            })
        except: pass
        
        if (i+1) % 30 == 0:
            json.dump(results, open(f'{name}_data.json', 'w'))
            print(f'  {i+1}/{len(ids)} ({len(results)} with data)')
        time.sleep(random.uniform(0.15, 0.3))
    
    json.dump(results, open(f'{name}_data.json', 'w'), indent=2)
    print(f'Done: {len(results)} products')
    return results

if __name__ == '__main__':
    target = sys.argv[1] if len(sys.argv) > 1 else 'all'
    
    sites = []
    if target in ('incepta', 'all'):
        sites.append(('incepta', 'https://www.inceptapharma.com',
            'https://www.inceptapharma.com/products-by-trade-name.php?char=',
            'Incepta Pharmaceuticals Ltd.'))
    if target in ('square', 'all'):
        sites.append(('square', 'https://www.squarepharma.com.bd',
            'https://www.squarepharma.com.bd/products-by-tradename.php?type=pharma&char=',
            'Square Pharmaceuticals PLC.'))
    
    all_data = []
    for name, base, listing, company in sites:
        data = scrape_company(name, base, listing, company)
        all_data.extend(data)
    
    json.dump(all_data, open('all_company_data.json', 'w'), indent=2)
    print(f'\nTotal: {len(all_data)} products from {len(sites)} companies')
