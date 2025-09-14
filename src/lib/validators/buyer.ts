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

export const buyerBase = z
  .object({
    fullName: z
      .string()
      .min(2, "Full name must be at least 2 characters")
      .regex(/^[A-Za-z\s]+$/, "Full name must only contain letters and spaces"),
    email: z.string().email("Invalid email").optional().or(z.literal("")),
    phone: z.string().regex(/^\d{10}$/, "Phone must be 10 digits"),
    city: z.enum(["Chandigarh", "Mohali", "Zirakpur", "Panchkula", "Other"]),
    propertyType: z.enum(["Apartment", "Villa", "Plot", "Office", "Retail"]),
    bhk: z.enum(["1", "2", "3", "4", "Studio"]).optional(),
    purpose: z.enum(["Buy", "Rent"]),
    budgetMin: z
      .union([
        z.literal(""), // allow empty string
        z.coerce.number().int().positive("Budget Min must be greater than 0"),
      ])
      .optional()
      .transform((val) => (val === "" ? undefined : val)),
    budgetMax: z
      .union([
        z.literal(""),
        z.coerce.number().int().positive("Budget Max must be greater than 0"),
      ])
      .optional()
      .transform((val) => (val === "" ? undefined : val)),
    timeline: z.enum(["0-3m", "3-6m", ">6m", "Exploring"]),

    source: z.enum(["Website", "Referral", "Walk-in", "Call", "Other"]),
    notes: z.string().max(1000).optional(),
    status: z
      .enum([
        "New",
        "Qualified",
        "Contacted",
        "Visited",
        "Negotiation",
        "Converted",
        "Dropped",
      ])
      .default("New"),
    tags: z
      .union([
        z.string().transform((val) =>
          val
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        ),
        z.array(z.string()),
      ])
      .optional(),
  })
  .refine(
    (data) => {
      // Case 1: both empty → valid
      if (!data.budgetMin && !data.budgetMax) return true;

      // Case 2: one empty → invalid
      if (
        (data.budgetMin && !data.budgetMax) ||
        (!data.budgetMin && data.budgetMax)
      ) {
        return false;
      }

      // Case 3: both filled but invalid range → invalid
      if (
        data.budgetMin &&
        data.budgetMax &&
        data.budgetMax <= data.budgetMin
      ) {
        return false;
      }

      // Case 4: all good
      return true;
    },
    {
      message:
        "Please enter both Budget Min and Budget Max, and ensure Max > Min.",
      path: ["budget"], // ✅ virtual field, error shows under both
    }
  )
  .refine(
    (data) => {
      if (["Apartment", "Villa"].includes(data.propertyType)) {
        return !!data.bhk;
      }
      return true;
    },
    {
      message: "BHK is required for Apartment or Villa.",
      path: ["bhk"],
    }
  );
