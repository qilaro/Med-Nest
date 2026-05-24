# Med-Nest AI Assistant Rules

## DB Import Rules (MedEasy → Brands)

### Dosage Form
- ALWAYS use MedEasy's `category_name` as `dosage_form` verbatim
- NEVER infer or override it
- Examples: "Tablet", "Capsule", "Oral Solution", "Pediatric Drops", "Injection", "Nasal Spray", "SC Injection", "Chewable Tablet", "Dispersible Tablet", "Powder for Suspension", "Ophthalmic Solution", "Ear Drop", "Gel"

### Pricing
- `unit_prices` array: each entry has `{unit, unit_size, price}`
- For Tablet/Capsule: find entry with "Strip" in `unit` name
  - `price_unit = price / unit_size` (per piece)
  - `price_strip = price` (total strip price)
  - `pack_size = unit` (e.g., "10's Strip")
- For Liquids/Bottles/Injections/Drops/Syrups (non-tablet): use first entry
  - `price_unit = price / unit_size` (per bottle/ampoule)
  - `price_strip = price`
  - `pack_size = unit` (e.g., "100 ml bottle", "5 ml drop", "1 ml ampoule")

### Generic
- `generic_name` = from MedEasy
- `generic_id` = looked up from generics table by LOWER(name) match

### Verification
- `brand_verified = true`
- `price_verified = true`

### Medicine Type
- Always "Allopathic"

### OTC
- `is_otc = !rx_required`

### What we NEVER touch
- `therapeutic_class` — kept from original generics data only
- Medical info fields (indications, side_effects, etc.) — kept from original generics data only

### Import Order
1. INSERT new generics first (for any MedEasy generic_name not in DB)
2. DELETE all existing brands for this company
3. INSERT fresh from MedEasy
4. Old data goes to brands_staging
