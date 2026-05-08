import json, re, subprocess, sys
from datetime import datetime

db_url = subprocess.run(['grep', 'DATABASE_URL', '.env.local'], capture_output=True, text=True).stdout.strip().split('=', 1)[1]
meds = json.load(open('dgda_medicines.json'))

def parse_generic_strength(s):
    s = s.strip()
    m = re.match(r'^(.+?)\s+(\d[\d./]*\s*(?:mg|gm|mcg|ml|iu|unit|%|tablet|capsule|drop|injection|syrup)?.*)$', s, re.I)
    if m: return m.group(1).strip(), m.group(2).strip()
    return s, ''

def slugify(s):
    return re.sub(r'[^a-z0-9]+', '-', s.lower().strip()).strip('-')

def norm_company(s):
    s = s.lower().strip().rstrip(',.')
    s = re.sub(r'\s*\([^)]*\)', '', s)
    s = re.sub(r',.*$', '', s)
    s = s.replace('&amp;', '&')
    return s.strip()

print(f'Total DGDA entries: {len(meds)}')

# Get existing brands with prices (keep these)
result = subprocess.run(['psql', db_url, '-t', '-A', '-c',
    "SELECT slug, price_unit FROM brands WHERE price_unit IS NOT NULL"],
    capture_output=True, text=True, timeout=30)
priced = {}
for line in result.stdout.strip().split('\n'):
    if line:
        parts = line.split('|')
        if len(parts) >= 2:
            priced[parts[0].strip()] = parts[1].strip()
print(f'Brands to keep (with prices): {len(priced)}')

# Get company mapping
result = subprocess.run(['psql', db_url, '-t', '-A', '-c',
    "SELECT id, name, LOWER(name) FROM companies"],
    capture_output=True, text=True, timeout=30)
companies = {}
for line in result.stdout.strip().split('\n'):
    if line:
        parts = line.split('|')
        if len(parts) >= 3:
            companies[norm_company(parts[2].strip())] = parts[0].strip()

print(f'Companies available: {len(companies)}')

# Truncate all brands
subprocess.run(['psql', db_url, '-c', 'TRUNCATE brands CASCADE'], capture_output=True, timeout=30)
print('Truncated brands table')

# Insert all DGDA entries
now = datetime.now().isoformat()
inserted = 0
no_company = 0

# Use batch insert via psql
batch_size = 500
batch_values = []

for m in meds:
    brand = m['brand'].strip().replace("'", "''")
    company = m['company'].strip().replace("'", "''")
    generic_full = m['generic'].strip().replace("'", "''")
    dosage = m['dosage_form'].strip().replace("'", "''")
    
    generic_name, strength = parse_generic_strength(generic_full)
    slug = slugify(brand)
    
    # Get price
    price = priced.get(slug, 'NULL')
    
    # Find company
    nc = norm_company(company)
    cid = 'NULL'
    for dc, cid_val in companies.items():
        if nc == norm_company(dc) or nc in dc or dc in nc:
            cid = f"'{cid_val}'" if cid_val != 'NULL' else 'NULL'
            break
    
    if cid == 'NULL':
        no_company += 1
        continue
    
    gn = generic_name.replace("'", "''")
    st = strength.replace("'", "''")
    
    batch_values.append(f"('{brand}', '{slug}', {cid}, '{gn}', '{company}', '{st}', '{dosage}', {price}, '{now}', '{now}')")
    
    if len(batch_values) >= batch_size:
        sql = f"INSERT INTO brands (brand_name, slug, company_id, generic_name, company_name, strength, dosage_form, price_unit, created_at, updated_at) VALUES {','.join(batch_values)};"
        subprocess.run(['psql', db_url, '-c', sql], capture_output=True, timeout=30)
        inserted += len(batch_values)
        batch_values = []
        print(f'  Inserted {inserted}...')

# Final batch
if batch_values:
    sql = f"INSERT INTO brands (brand_name, slug, company_id, generic_name, company_name, strength, dosage_form, price_unit, created_at, updated_at) VALUES {','.join(batch_values)};"
    subprocess.run(['psql', db_url, '-c', sql], capture_output=True, timeout=30)
    inserted += len(batch_values)

print(f'\nDone!')
print(f'Inserted: {inserted}')
print(f'Skipped (no company match): {no_company}')

# Final count
result = subprocess.run(['psql', db_url, '-t', '-A', '-c', 'SELECT COUNT(*) FROM brands'], capture_output=True, text=True, timeout=5)
result2 = subprocess.run(['psql', db_url, '-t', '-A', '-c', 'SELECT COUNT(*) FROM brands WHERE price_unit IS NOT NULL'], capture_output=True, text=True, timeout=5)
print(f'Total brands: {result.stdout.strip()}')
print(f'With prices: {result2.stdout.strip()}')
