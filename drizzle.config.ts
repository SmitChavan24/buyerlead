import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: ["./src/db/schema/auth.ts", "./src/db/schema/buyer.ts"],
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url:
      process.env.NEXT_PUBLIC_DATABASE_URL ||
      "postgresql://postgres.ussepzkyurcmptiwohwu:Smit@2341@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres",
  },
});
