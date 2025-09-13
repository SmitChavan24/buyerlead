import { NextResponse } from "next/server";
import { db } from "@/db";
import { buyers } from "@/db/schema/buyer";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

// ✅ Validation schema (without ownerId now)
const buyerSchema = z.object({
  fullName: z.string().min(2).max(80),
  email: z.string().optional(),
  phone: z.string().min(10).max(15),
  city: z.string().optional(),
  propertyType: z.string().optional(),
  bhk: z.string().optional().default(""),
  purpose: z.string().optional(),
  budgetMin: z.coerce.number().int().optional(),
  budgetMax: z.coerce.number().int().optional(),
  timeline: z.string().optional(),
  source: z.string().optional(),
  status: z.string().optional(),
  notes: z.string().optional(),
  tags: z
    .union([z.string(), z.array(z.string())])
    .transform((val) =>
      typeof val === "string" ? val.split(",").map((t) => t.trim()) : val
    )
    .optional()
    .default([]),
  updatedAt: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    // ✅ Ensure user is logged in
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    if (!body.buyers || !Array.isArray(body.buyers)) {
      return NextResponse.json(
        { error: "Invalid payload: expected { buyers: [...] }" },
        { status: 400 }
      );
    }

    // ✅ Parse & validate rows
    const parsed = buyerSchema.array().parse(body.buyers);

    // ✅ Inject logged-in user’s ID as ownerId
    const values = parsed.map((b) => ({
      ...b,
      ownerId: Number(session.user.id), // auto-assign owner
      updatedAt: b.updatedAt ? new Date(b.updatedAt) : new Date(),
    }));

    // ✅ Bulk insert
    await db.insert(buyers).values(values);

    return NextResponse.json({
      message: `${values.length} buyers imported successfully`,
    });
  } catch (err: any) {
    console.error("CSV Import Error:", err);
    return NextResponse.json(
      { error: err.message || "Import failed" },
      { status: 500 }
    );
  }
}
