import { pgTable, uuid, varchar, text, timestamp, decimal, integer, boolean, jsonb, date } from 'drizzle-orm/pg-core';

/**
 * GENERICS TABLE
 * Repository of active ingredients with medical information
 * Uses JSONB `extra` for extensibility — add new fields without migrations
 */
export const generics = pgTable('generics', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Identification
  name: text('name').notNull().unique(),
  slug: varchar('slug', { length: 255 }).unique(),
  pronunciation: varchar('pronunciation', { length: 255 }),

  // Classification
  therapeuticClass: varchar('therapeutic_class', { length: 255 }),
  drugClassName: varchar('drug_class_name', { length: 255 }),

  // Core Medical Content (structured for direct query)
  whatIs: text('what_is'),
  indications: text('indications'),
  warnings: text('warnings'),
  precautions: text('precautions'),
  dosage: text('dosage'),
  sideEffects: text('side_effects'),
  interactions: text('interactions'),
  contraindications: text('contraindications'),
  pregnancyLactation: text('pregnancy_lactation'),
  overdoseEffects: text('overdose_effects'),
  storageConditions: text('storage_conditions'),
  specialPopulations: text('special_populations'),
  modeOfAction: text('mode_of_action'),
  pharmacology: text('pharmacology'),
  pharmacokinetics: text('pharmacokinetics'),
  administration: text('administration'),
  reconstitution: text('reconstitution'),
  durationOfTreatment: text('duration_of_treatment'),
  pediatricUses: text('pediatric_uses'),
  composition: text('composition'),
  alcoholWarning: text('alcohol_warning'),
  monitoring: text('monitoring'),

  // Review & Authority
  reviewedBy: varchar('reviewed_by', { length: 255 }),
  reviewedAt: date('reviewed_at'),

  // Chemical & Pharmacological Properties
  chemicalFormula: varchar('chemical_formula', { length: 100 }),
  molecularWeight: varchar('molecular_weight', { length: 50 }),
  halfLife: varchar('half_life', { length: 100 }),
  proteinBinding: varchar('protein_binding', { length: 100 }),
  metabolism: text('metabolism'),
  excretion: text('excretion'),
  pregnancyCategory: varchar('pregnancy_category', { length: 10 }),
  csaSchedule: varchar('csa_schedule', { length: 50 }),

  // Source & Classification
  medicineType: varchar('medicine_type', { length: 50 }).default('Allopathic'),
  sourceUrl: text('source_url'),
  sourceId: varchar('source_id', { length: 50 }),

  // Denormalized / Flexible Data (JSONB)
  brandNamesList: jsonb('brand_names_list').default('[]'),
  relatedDrugs: jsonb('related_drugs').default('[]'),
  patientTips: jsonb('patient_tips').default('[]'),
  commonQuestions: jsonb('common_questions').default('[]'),
  treatmentGuides: jsonb('treatment_guides').default('[]'),
  extra: jsonb('extra').default('{}'),

  // Metadata
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * COMPANIES TABLE
 * Pharmaceutical manufacturers
 */
export const companies = pgTable('companies', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull().unique(),
  slug: varchar('slug', { length: 255 }).unique(),
  address: text('address'),
  licenseNoBiological: varchar('license_no_biological', { length: 100 }),
  licenseNoNonBiological: varchar('license_no_non_biological', { length: 100 }),
  validityDate: timestamp('validity_date'),
  dgdaStatus: varchar('dgda_status', { length: 50 }),
  country: varchar('country', { length: 50 }).default('Bangladesh'),
  corporateType: varchar('corporate_type', { length: 50 }).default('Local'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * BRANDS TABLE
 * Individual branded products (40K+ records)
 */
export const brands = pgTable('brands', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Product Identification
  brandName: varchar('brand_name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  shortCodes: text('short_codes'),

  // Foreign Keys
  genericId: uuid('generic_id').references(() => generics.id).notNull(),
  companyId: uuid('company_id').references(() => companies.id).notNull(),

  // Formulation Information
  strength: text('strength').notNull(),
  dosageForm: text('dosage_form').notNull(),

  // Denormalized Data (for speed — no JOINs needed)
  genericName: varchar('generic_name', { length: 255 }).notNull(),
  companyName: varchar('company_name', { length: 255 }).notNull(),
  therapeuticClass: varchar('therapeutic_class', { length: 255 }),

  // Brand-Specific Content
  description: text('description'),

  // Verification (3 dimensions)
  brandVerified: boolean('brand_verified').default(false),
  priceVerified: boolean('price_verified').default(false),
  genericVerified: boolean('generic_verified').default(false),
  verifiedAt: timestamp('verified_at'),
  verifiedBy: varchar('verified_by', { length: 255 }),
  verificationNotes: text('verification_notes'),

  // Regulatory & Status
  darNumber: text('dar_number'),
  darStatus: varchar('dar_status', { length: 50 }).default('Active'),
  gdar: varchar('gdar', { length: 100 }),
  refOfDcc: varchar('ref_of_dcc', { length: 100 }),
  medicineType: varchar('medicine_type', { length: 50 }).default('Allopathic'),
  isOtc: boolean('is_otc').default(false),
  isDiscontinued: boolean('is_discontinued').default(false),

  // Pricing Information
  priceUnit: decimal('price_unit', { precision: 10, scale: 2 }),
  priceStrip: decimal('price_strip', { precision: 10, scale: 2 }),
  priceBox: decimal('price_box', { precision: 10, scale: 2 }),
  packSize: varchar('pack_size', { length: 100 }),

  // Geographic & Market
  country: varchar('country', { length: 50 }).default('Bangladesh'),

  // User-Generated Data
  averageRating: decimal('average_rating', { precision: 3, scale: 2 }).default('0.00'),
  reviewCount: integer('review_count').default(0),

  // Media Information
  imageUrl: text('image_url'),
  packImages: jsonb('pack_images'),
  monographUrl: text('monograph_url'),

  // Metadata
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * REVIEWS TABLE
 * User ratings and reviews
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
 * Pharmacist-verified Q&A
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
 * NEWS TABLE
 * Articles, blog posts, and health news
 */
export const news = pgTable('news', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 500 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  excerpt: text('excerpt'),
  content: text('content').notNull(),
  author: varchar('author', { length: 255 }),
  imageUrl: text('image_url'),
  category: varchar('category', { length: 100 }),
  tags: jsonb('tags').default('[]'),
  isPublished: boolean('is_published').default(false),
  publishedAt: timestamp('published_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * DRUG INTERACTIONS TABLE
 * Structured interaction data between generics
 */
export const drugInteractions = pgTable('drug_interactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  genericId: uuid('generic_id').references(() => generics.id).notNull(),
  interactsWithGenericId: uuid('interacts_with_generic_id').references(() => generics.id).notNull(),
  severity: varchar('severity', { length: 20 }).notNull(),
  description: text('description').notNull(),
  mechanism: text('mechanism'),
  management: text('management'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
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

/**
 * VERIFICATION_LOG TABLE
 * Track all verification actions
 */
export const verificationLog = pgTable('verification_log', {
  id: uuid('id').primaryKey().defaultRandom(),
  entityType: varchar('entity_type', { length: 50 }).notNull(),
  entityId: uuid('entity_id').notNull(),
  action: varchar('action', { length: 50 }).notNull(),
  oldValues: jsonb('old_values'),
  newValues: jsonb('new_values'),
  changedFields: text('changed_fields').array(),
  performedBy: varchar('performed_by', { length: 255 }).default('system'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
