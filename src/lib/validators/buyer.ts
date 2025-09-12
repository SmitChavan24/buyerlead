// lib/validators/buyer.ts
import { z } from "zod";

export const cityEnum = z.enum([
  "Chandigarh",
  "Mohali",
  "Zirakpur",
  "Panchkula",
  "Other",
]);
export const propertyTypeEnum = z.enum([
  "Apartment",
  "Villa",
  "Plot",
  "Office",
  "Retail",
]);
export const bhkEnum = z.enum(["1", "2", "3", "4", "Studio"]);
export const purposeEnum = z.enum(["Buy", "Rent"]);
export const timelineEnum = z.enum(["0-3m", "3-6m", ">6m", "Exploring"]);
export const sourceEnum = z.enum([
  "Website",
  "Referral",
  "Walk-in",
  "Call",
  "Other",
]);
export const statusEnum = z.enum([
  "New",
  "Qualified",
  "Contacted",
  "Visited",
  "Negotiation",
  "Converted",
  "Dropped",
]);

export const buyerBase = z.object({
  fullName: z.string().min(2).max(80),
  email: z
    .string()
    .email()
    .optional()
    .or(z.literal(""))
    .transform((v) => (v === "" ? undefined : v)),
  phone: z.string().regex(/^\d{10,15}$/, "Phone must be numeric 10-15 digits"),
  city: cityEnum,
  propertyType: propertyTypeEnum,
  bhk: z.union([bhkEnum, z.undefined(), z.null()]).optional(),
  purpose: purposeEnum,
  budgetMin: z.number().int().positive().optional().nullable(),
  budgetMax: z.number().int().positive().optional().nullable(),
  timeline: timelineEnum,
  source: sourceEnum,
  notes: z.string().max(1000).optional().nullable(),
  tags: z.array(z.string()).optional().default([]),
  status: statusEnum.optional().default("New"),
});

export const buyerCreate = buyerBase
  .refine(
    (data) => {
      if (["Apartment", "Villa"].includes(data.propertyType)) {
        return !!data.bhk;
      }
      return true;
    },
    {
      message: "BHK is required for Apartment or Villa",
      path: ["bhk"],
    }
  )
  .superRefine((data, ctx) => {
    if (data.budgetMin != null && data.budgetMax != null) {
      if (data.budgetMax < data.budgetMin) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "budgetMax must be >= budgetMin",
          path: ["budgetMax"],
        });
      }
    }
  });

export type BuyerCreate = z.infer<typeof buyerCreate>;
