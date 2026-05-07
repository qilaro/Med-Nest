CREATE TABLE "companies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"description" text,
	"logo_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "companies_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "drugs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"brand_name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"generic_id" uuid NOT NULL,
	"company_id" uuid NOT NULL,
	"dosage_form" varchar(100) NOT NULL,
	"strength" varchar(100) NOT NULL,
	"price_unit" numeric(10, 2),
	"price_strip" numeric(10, 2),
	"price_box" numeric(10, 2),
	"pack_size" varchar(100),
	"image_url" text,
	"pronunciation" varchar(100),
	"average_rating" numeric(3, 2) DEFAULT '0.00',
	"review_count" integer DEFAULT 0,
	"is_featured" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "drugs_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "faqs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"drug_id" uuid,
	"generic_id" uuid,
	"question" text NOT NULL,
	"answer" text NOT NULL,
	"is_pharmacist_verified" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "generics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"indications" text,
	"dosage" text,
	"side_effects" text,
	"warnings" text,
	"pharmacology" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "generics_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"drug_id" uuid NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"user_name" varchar(255) NOT NULL,
	"rating" integer NOT NULL,
	"comment" text,
	"is_pharmacist" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "drugs" ADD CONSTRAINT "drugs_generic_id_generics_id_fk" FOREIGN KEY ("generic_id") REFERENCES "public"."generics"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drugs" ADD CONSTRAINT "drugs_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "faqs" ADD CONSTRAINT "faqs_drug_id_drugs_id_fk" FOREIGN KEY ("drug_id") REFERENCES "public"."drugs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "faqs" ADD CONSTRAINT "faqs_generic_id_generics_id_fk" FOREIGN KEY ("generic_id") REFERENCES "public"."generics"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_drug_id_drugs_id_fk" FOREIGN KEY ("drug_id") REFERENCES "public"."drugs"("id") ON DELETE no action ON UPDATE no action;