CREATE TABLE "ai_training_data" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question" text NOT NULL,
	"gemini_answer" text NOT NULL,
	"drug_context" text,
	"user_language" varchar(10) DEFAULT 'en',
	"created_at" timestamp DEFAULT now() NOT NULL
);
