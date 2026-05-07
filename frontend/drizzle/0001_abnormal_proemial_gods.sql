ALTER TABLE "generics" ADD COLUMN "interactions" text;--> statement-breakpoint
ALTER TABLE "generics" ADD COLUMN "contraindications" text;--> statement-breakpoint
ALTER TABLE "generics" ADD COLUMN "pregnancy_lactation" text;--> statement-breakpoint
ALTER TABLE "generics" ADD COLUMN "precautions" text;--> statement-breakpoint
ALTER TABLE "generics" ADD COLUMN "special_populations" text;--> statement-breakpoint
ALTER TABLE "generics" ADD COLUMN "overdose_effects" text;--> statement-breakpoint
ALTER TABLE "generics" ADD COLUMN "therapeutic_class" varchar(255);--> statement-breakpoint
ALTER TABLE "generics" ADD COLUMN "storage_conditions" text;--> statement-breakpoint
ALTER TABLE "generics" ADD COLUMN "chemical_structure" text;--> statement-breakpoint
ALTER TABLE "generics" ADD COLUMN "structure_image_url" text;--> statement-breakpoint
ALTER TABLE "generics" ADD COLUMN "medical_reviewer" varchar(255);--> statement-breakpoint
ALTER TABLE "generics" ADD COLUMN "last_updated" timestamp;--> statement-breakpoint
ALTER TABLE "generics" DROP COLUMN "warnings";