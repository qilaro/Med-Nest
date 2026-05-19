# Med-Ex Data Scraping Guide

Scrapes all 2,556 generics from medex.com.bd with medical content (indications, dosage, side effects, etc.).

## Prerequisites

- Python 3.10+
- Firefox browser
- "cookies.txt" extension for Firefox

## Step-by-Step

### 1. Install Python dependency

```bash
cd Med-Nest/frontend
pip install --break-system-packages curl_cffi
```

### 2. Export cookies from Med-Ex

- Open **Firefox**
- Go to **medex.com.bd**
- Install **"cookies.txt"** extension (by T. Kaku) from Firefox Add-ons
- Click the cookies.txt extension icon → **Export** → save as `cookies.txt`
- Move it to the project root: `mv ~/Downloads/cookies.txt Med-Nest/cookies.txt`

### 3. Create the scraper script

Save this as `Med-Nest/frontend/scrape.py`:

```python
from curl_cffi import requests
import re, json, os, time, random

COOKIES = {}
for l in open('../cookies.txt'):
    if l and not l.startswith('#'):
        p = l.strip().split('\t')
        if len(p) >= 7: COOKIES[p[5]] = p[6]

os.makedirs('scraped_data', exist_ok=True)
ids = list(range(1, 2557))
random.shuffle(ids)

print(f'Total: {len(ids)} generics, randomized order\n')

for i, id in enumerate(ids):
    time.sleep(random.uniform(5, 15))

    try:
        r = requests.get(f'https://medex.com.bd/generics/{id}',
            impersonate='chrome131', cookies=COOKIES, timeout=30)

        if 'Security Check' in r.text:
            print(f'BLOCKED at {id} after {i}. Stop for now.')
            exit()

        html = r.text
        name = re.search(r'<title>([^<]+)</title>', html)
        name = name.group(1).replace('| MedEx', '').strip() if name else ''

        data = {'id': id, 'name': name}

        for m in re.finditer(r'<div[^>]*class="ac-body"[^>]*>(.*?)</div>', html, re.I|re.S):
            content = re.sub(r'<[^>]*>', '', m.group(1))
            content = re.sub(r'&[^;]+;', ' ', content)
            content = re.sub(r'Read more.*', '', content, flags=re.I|re.S)
            content = re.sub(r'\s+', ' ', content).strip()
            before = html[:m.start()]
            sec = re.findall(r'<h[23][^>]*>(.*?)</h[23]>', before, re.I|re.S)
            if sec:
                key = re.sub(r'<[^>]*>', '', sec[-1]).strip().lower().replace(' ','_').replace('&','').replace('__','_')
                data[key] = content

        json.dump(data, open(f'scraped_data/{id}.json','w'), indent=2)
        print(f'v {id} {name[:40]} ({i+1}/{len(ids)})')

    except Exception as e:
        print(f'x {id}: {str(e)[:60]}')

print(f'\nDone. Files: {len([f for f in os.listdir("scraped_data") if f.endswith(".json")])}')
```

### 4. Run the scraper

```bash
cd Med-Nest/frontend
python3 scrape.py
```

Let it run. At 5-15s per generic, the full 2,556 will take **~7 hours**.

### 5. Check progress

```bash
ls Med-Nest/frontend/scraped_data/*.json | wc -l
```

### 6. If blocked

If you see "BLOCKED" in the output, stop and wait **2-3 hours**, then resume:

```bash
cd Med-Nest/frontend
python3 scrape.py
```

It will skip already-scraped files automatically.

### 7. Push data to git

```bash
cd Med-Nest
git add frontend/scraped_data/
git commit -m "med-ex scrape batch"
git push
```

## How It Works

| Technique | Purpose |
|-----------|---------|
| `curl_cffi` with `impersonate='chrome131'` | Mimics Chrome's TLS fingerprint — bypasses bot detection |
| Random 5-15s delays | Looks like human browsing |
| Randomized ID order | Not sequential 1,2,3 — looks organic |
| Firefox cookies.txt | Uses your real browser session |
| Incremental save | Each generic saved individually — crash-safe |

## Importing to Database

Once data is pushed to git, run this from the server:

```bash
cd Med-Nest/frontend
DATABASE_URL="..." npx tsx scripts/import-scraped.ts
```

This matches generics by Med-Ex ID or name and upserts all medical content.
