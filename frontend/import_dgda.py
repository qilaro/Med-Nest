import json, re, urllib.request, time, random, subprocess, sys

db_url = subprocess.run(['grep', 'DATABASE_URL', '.env.local'], capture_output=True, text=True).stdout.strip().split('=', 1)[1]
meds = json.load(open('dgda_medicines.json'))
headers = {'User-Agent': 'Mozilla/5.0'}
updated = 0
no_price = 0
no_match = 0

for i, m in enumerate(meds):
    try:
        req = urllib.request.Request(m['url'], headers=headers)
        html = urllib.request.urlopen(req, timeout=15).read().decode()
        prices = re.findall(r'<td>([\d.]+)\s*TK</td>', html)
        if not prices:
            no_price += 1
            continue
        unit_price = prices[0]
        company = m['company'].replace("'", "''")
        brand = m['brand'].replace("'", "''")
        result = subprocess.run(['psql', db_url, '-c',
            f"UPDATE brands SET price_unit = {unit_price} WHERE LOWER(brand_name) = LOWER('{brand}') AND LOWER(company_name) = LOWER('{company}') AND price_unit IS NULL"],
            capture_output=True, text=True, timeout=10)
        if 'UPDATE 1' in result.stderr or 'UPDATE 1' in result.stdout:
            updated += 1
        else:
            no_match += 1
    except:
        no_price += 1

    if (i+1) % 500 == 0:
        print(f'Progress: {i+1}/41089 | Updated: {updated} | No match: {no_match} | No price: {no_price}')
        sys.stdout.flush()

    time.sleep(random.uniform(0.1, 0.3))

print(f'\nDONE! Updated: {updated} | No match: {no_match} | No price: {no_price}')
