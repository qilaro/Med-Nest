from curl_cffi import requests
import re, json, os, time, random, sys

IMPERSONATE = ['chrome131', 'chrome129', 'chrome120', 'chrome110', 'chrome101']

COOKIES = {}
for l in open('../cookies.txt'):
    if l and not l.startswith('#'):
        p = l.strip().split('\t')
        if len(p) >= 7: COOKIES[p[5]] = p[6]

os.makedirs('scraped_data', exist_ok=True)

existing = set()
for f in os.listdir('scraped_data'):
    if f.endswith('.json'):
        try: existing.add(int(json.load(open(f'scraped_data/{f}'))['id']))
        except: pass

ids = [i for i in range(1, 2557) if i not in existing]
random.shuffle(ids)
total = len(ids)
print(f'Existing: {len(existing)}, Remaining: {total}')
print('20/batch, 5min pause, rotating Chrome fingerprint')

pos = 0
while pos < len(ids):
    batch = ids[pos:pos+20]
    for idx, id in enumerate(batch):
        imp = IMPERSONATE[idx % len(IMPERSONATE)]
        time.sleep(random.uniform(3, 8))
        try:
            r = requests.get(f'https://medex.com.bd/generics/{id}',
                impersonate=imp, cookies=COOKIES, timeout=30)
            if 'Security Check' in r.text:
                print(f'BLOCKED at {id}')
                sys.exit()

            html = r.text
            title = re.search(r'<title>([^<]+)</title>', html)
            title = title.group(1).replace('| MedEx', '').strip() if title else ''
            data = {'id': id, 'name': title}

            for m in re.finditer(r'<div[^>]*class="ac-body"[^>]*>(.*?)</div>', html, re.I|re.S):
                c = re.sub(r'<[^>]*>', '', m.group(1))
                c = re.sub(r'&[^;]+;', ' ', c)
                c = re.sub(r'Read more.*', '', c, flags=re.I|re.S)
                before = html[:m.start()]
                sec = re.findall(r'<h[23][^>]*>(.*?)</h[23]>', before, re.I|re.S)
                if sec:
                    key = re.sub(r'<[^>]*>', '', sec[-1]).strip().lower().replace(' ', '_')
                    data[key.strip('_')] = re.sub(r'\s+', ' ', c).strip()

            prices = {}
            for m in re.finditer(r'<div class="data-row-top">(.*?)</div>.*?<span class="package-pricing">(.*?)</span>', html, re.I|re.S):
                b = re.sub(r'<[^>]*>', '', m.group(1)).strip()
                p = re.sub(r'<[^>]*>', '', m.group(2)).strip()
                if b: prices[b] = p
            if prices: data['brand_prices'] = prices

            json.dump(data, open(f'scraped_data/{id}.json', 'w'), indent=2)
            print(f'v {id} {title[:35]} ({len(prices)} prices) [{imp}]')
        except Exception as e:
            print(f'x {id}: {str(e)[:40]}')

    pos += 20
    left = total - pos
    if left > 0:
        print(f'\n--- {left} left. Pause 5 min ---')
        for m in range(5, 0, -1):
            sys.stdout.write(f'\r{str(m).zfill(2)}:00')
            sys.stdout.flush()
            time.sleep(60)
        print()

print(f'\nDONE! {len([f for f in os.listdir("scraped_data") if f.endswith(".json")])} files')
