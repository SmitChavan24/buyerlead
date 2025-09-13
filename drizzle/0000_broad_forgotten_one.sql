CREATE TABLE "accounts" (
	"user_id" text NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"provider_account_id" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" timestamp with time zone,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text,
	CONSTRAINT "accounts_provider_provider_account_id_pk" PRIMARY KEY("provider","provider_account_id")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"session_token" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"expires" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255),
	"name" varchar(255),
	"role" varchar(50),
	"image" varchar(255),
	"emailVerified" timestamp,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verificationToken" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp with time zone NOT NULL,
	CONSTRAINT "verificationToken_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
CREATE TABLE "buyer_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"buyer_id" uuid,
	"changed_by" uuid,
	"changed_at" timestamp DEFAULT now(),
	"diff" json
);
--> statement-breakpoint
CREATE TABLE "buyers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"full_name" varchar(80),
	"email" varchar(255) DEFAULT '' NOT NULL,
	"phone" varchar(15),
	"city" varchar(50),
	"property_type" varchar(50),
	"bhk" varchar(10) DEFAULT '',
	"purpose" varchar(10),
	"budget_min" integer DEFAULT 0,
	"budget_max" integer DEFAULT 0,
	"timeline" varchar(20),
	"source" varchar(20),
	"status" varchar(20) DEFAULT 'New',
	"notes" text DEFAULT '',
	"tags" json DEFAULT '[]',
	"owner_id" serial NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
