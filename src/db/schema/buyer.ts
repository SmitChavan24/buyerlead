import {
  pgTable,
  serial,
  text,
  varchar,
  timestamp,
  uuid,
  integer,
  json,
  primaryKey,
} from "drizzle-orm/pg-core";
import { z } from "zod";

export const buyers = pgTable("buyers", {
  id: uuid("id").primaryKey().defaultRandom(),
  fullName: varchar("full_name", { length: 80 }),
  email: varchar("email", { length: 255 }).notNull().default(""),
  phone: varchar("phone", { length: 15 }),
  city: varchar("city", { length: 50 }),
  propertyType: varchar("property_type", { length: 50 }),
  bhk: varchar("bhk", { length: 10 }).default(""),
  purpose: varchar("purpose", { length: 10 }),
  budgetMin: integer("budget_min").default(0),
  budgetMax: integer("budget_max").default(0),
  timeline: varchar("timeline", { length: 20 }),
  source: varchar("source", { length: 20 }),
  status: varchar("status", { length: 20 }).default("New"),
  notes: text("notes").default(""),
  tags: json("tags").default("[]"),
  ownerId: serial("owner_id").notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const buyerHistory = pgTable("buyer_history", {
  id: uuid("id").primaryKey().defaultRandom(),
  buyerId: uuid("buyer_id").notNull(),
  changedBy: serial("changed_by").notNull(),
  changedAt: timestamp("changed_at").defaultNow(),
  diff: json("diff"),
});
