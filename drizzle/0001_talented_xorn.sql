ALTER TABLE "buyer_history" ALTER COLUMN "buyer_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "buyer_history" ALTER COLUMN "changed_by" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "buyer_history" ALTER COLUMN "changed_by" SET NOT NULL;