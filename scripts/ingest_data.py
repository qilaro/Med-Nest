import csv
import json
import os
import re

def slugify(text):
    text = text.lower().strip()
    text = re.sub(r'[^a-z0-9]+', '-', text)
    return text

input_csv = '/home/xmm/Downloads/feature_engineered_medicine_dataset_v4_TG.csv'
output_dir = 'frontend/public/data/drug_details'

if not os.path.exists(output_dir):
    os.makedirs(output_dir)

with open(input_csv, mode='r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        brand_name = row['brand_name']
        # Use slugified brand name as the filename
        slug = slugify(brand_name)
        
        detail = {
            "id": None, # Will be set if matched with existing ID
            "slug": slug,
            "brandName": brand_name,
            "genericName": row['generic_name_with_strength'].split(' ')[0],
            "dosageForm": row['dosage_form'],
            "strength": row['total_strength'] + " " + row['unit_type'],
            "drugClass": row['TG_therapeutic_group'],
            "company": row['company'],
            "fixedMarketPrice": 0.0, # Placeholder
            "availabilityInBD": True,
            "brandName_bn": "",
            "bmDcVerificationLink": "",
            "indications": row['indication_category'],
            "warnings": f"High risk flag: {row['high_risk_flag']}. CNS risk: {row['cns_risk']}.",
            "dosage": "Consult a registered doctor.",
            "sideEffects": row['common_side_effects'],
            "interactions": f"Interaction score: {row['drug_interaction_score']}",
            "faqs": [],
            "disclaimer": "This information is for educational purposes only."
        }
        
        with open(os.path.join(output_dir, f"{slug}.json"), 'w', encoding='utf-8') as outfile:
            json.dump(detail, outfile, indent=2)

print(f"Processed drugs into {output_dir}")
