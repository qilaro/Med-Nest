import { pgTable, uuid, varchar, text, timestamp, decimal, integer, boolean, jsonb } from 'drizzle-orm/pg-core';

/**
 * GENERICS TABLE
 * Repository of active ingredients with medical information
 * ~3,000-5,000 records
 */
export const generics = pgTable('generics', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  // Identification
  name: text('name').notNull().unique(),
  slug: varchar('slug', { length: 255 }).unique(), // Generated after validation
  
  // Classification
  therapeuticClass: varchar('therapeutic_class', { length: 255 }),
  
  // Medical Information (Scraped/Enriched)
  indications: text('indications'), // Multi-line: "Fever\nHeadache\nPain"
  sideEffects: text('side_effects'),
  interactions: text('interactions'),
  contraindications: text('contraindications'),
  pregnancyLactation: text('pregnancy_lactation'),
  precautions: text('precautions'),
  dosage: text('dosage'),
  storageConditions: text('storage_conditions'),
  overdoseEffects: text('overdose_effects'),
  specialPopulations: text('special_populations'),
  modeOfAction: text('mode_of_action'),
  administration: text('administration'),
  reconstitution: text('reconstitution'),
  durationOfTreatment: text('duration_of_treatment'),
  pediatricUses: text('pediatric_uses'),
  composition: text('composition'),

  // Metadata
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * COMPANIES TABLE
 * Pharmaceutical manufacturers and distributors
 * ~300-500 records
 */
export const companies = pgTable('companies', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  // Identification
  name: varchar('name', { length: 255 }).notNull().unique(),
  slug: varchar('slug', { length: 255 }).unique(), // Nullable - generated after validation
  
  // Company Information
  address: text('address'),
  
  // Licensing Information
  licenseNoBiological: varchar('license_no_biological', { length: 100 }),
  licenseNoNonBiological: varchar('license_no_non_biological', { length: 100 }),
  validityDate: timestamp('validity_date'),
  dgdaStatus: varchar('dgda_status', { length: 50 }), // Functional, Suspended, Cancelled, Expired
  
  // Geographic & Market Info
  country: varchar('country', { length: 50 }).default('Bangladesh'),
  corporateType: varchar('corporate_type', { length: 50 }).default('Local'),
  
  // Metadata
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * BRANDS TABLE (Core - 40-50K records)
 * Individual branded products available in market
 */
export const brands = pgTable('brands', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  // Product Identification
  brandName: varchar('brand_name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  
  // Foreign Keys
  genericId: uuid('generic_id').references(() => generics.id).notNull(),
  companyId: uuid('company_id').references(() => companies.id).notNull(),
  
  // Formulation Information
  strength: text('strength').notNull(),
  dosageForm: text('dosage_form').notNull(),
  
  // Denormalized Data (for speed - no JOINs needed)
  genericName: varchar('generic_name', { length: 255 }).notNull(),
  companyName: varchar('company_name', { length: 255 }).notNull(),
  therapeuticClass: varchar('therapeutic_class', { length: 255 }),
  indications: text('indications'), // Searchable for indication pages
  
  // Regulatory Information
  darNumber: text('dar_number'),
  darStatus: varchar('dar_status', { length: 50 }).default('Active'),
  gdar: varchar('gdar', { length: 100 }),
  refOfDcc: varchar('ref_of_dcc', { length: 100 }),
  
  // Classification
  medicineType: varchar('medicine_type', { length: 50 }).default('Allopathic'),
  
  // Pricing Information
  priceUnit: decimal('price_unit', { precision: 10, scale: 2 }),
  priceStrip: decimal('price_strip', { precision: 10, scale: 2 }),
  priceBox: decimal('price_box', { precision: 10, scale: 2 }),
  packSize: varchar('pack_size', { length: 100 }),
  
  // Geographic & Market Information
  country: varchar('country', { length: 50 }).default('Bangladesh'),
  
  // User-Generated Data
  averageRating: decimal('average_rating', { precision: 3, scale: 2 }).default('0.00'),
  reviewCount: integer('review_count').default(0),
  
  // Media Information
  imageUrl: text('image_url'),
  packImages: jsonb('pack_images'), // Array of {url, title}
  monographUrl: text('monograph_url'),
  
  // Metadata
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});


/**
 * REVIEWS TABLE
 * User reviews and ratings
 */
export const reviews = pgTable('reviews', {
  id: uuid('id').primaryKey().defaultRandom(),
  brandId: uuid('brand_id').references(() => brands.id).notNull(),
  genericId: uuid('generic_id').references(() => generics.id),
  
  rating: integer('rating').notNull(),
  title: varchar('title', { length: 255 }),
  comment: text('comment'),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * FAQS TABLE
 * Frequently asked questions
 */
export const faqs = pgTable('faqs', {
  id: uuid('id').primaryKey().defaultRandom(),
  brandId: uuid('brand_id').references(() => brands.id),
  genericId: uuid('generic_id').references(() => generics.id),
  
  question: varchar('question', { length: 500 }).notNull(),
  answer: text('answer').notNull(),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * AUDIT_LOGS TABLE
 * Track all changes for compliance
 */
export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  entityType: varchar('entity_type', { length: 50 }),
  entityId: uuid('entity_id'),
  action: varchar('action', { length: 50 }),
  
  oldValues: jsonb('old_values'),
  newValues: jsonb('new_values'),
  
  userId: uuid('user_id'),
  ipAddress: varchar('ip_address', { length: 45 }),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
