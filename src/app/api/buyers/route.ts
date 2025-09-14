import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { buyers, buyerHistory } from "@/db/schema/buyer";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { buyerBase } from "@/lib/validators/buyer";
import { and, eq, like, sql } from "drizzle-orm";

export async function POST(req: NextRequest) {
  // ✅ Get session safely
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ✅ Validate body
  const body = await req.json();
  const parse = buyerBase.safeParse(body);
  if (!parse.success) {
    return NextResponse.json({ error: parse.error.format() }, { status: 400 });
  }

  const buyerData = {
    ...parse.data,
    ownerId: session.user.id,
    updatedAt: new Date(),
  };

  // ✅ Insert buyer
  const [newBuyer] = await db.insert(buyers).values(buyerData).returning();

  // ✅ Insert initial history
  await db.insert(buyerHistory).values({
    buyerId: newBuyer.id,
    changedBy: session.user.id,
    diff: buyerData, // you could also store `{ created: buyerData }`
  });

  return NextResponse.json({ buyer: newBuyer });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const page = Number(searchParams.get("page") || "1");
  const pageSize = 10;
  const offset = (page - 1) * pageSize;

  const q = searchParams.get("q") || "";
  const city = searchParams.get("city") || "";
  const propertyType = searchParams.get("propertyType") || "";
  const status = searchParams.get("status") || "";
  const timeline = searchParams.get("timeline") || "";

  // ✅ Build filters
  const conditions = [];
  if (q) conditions.push(like(buyers.fullName, `%${q}%`));
  if (city) conditions.push(eq(buyers.city, city));
  if (propertyType) conditions.push(eq(buyers.propertyType, propertyType));
  if (status) conditions.push(eq(buyers.status, status));
  if (timeline) conditions.push(eq(buyers.timeline, timeline));

  // ✅ Query with filters + pagination
  const items = await db
    .select()
    .from(buyers)
    .where(conditions.length ? and(...conditions) : undefined)
    .limit(pageSize)
    .offset(offset)
    .orderBy(sql`${buyers.updatedAt} DESC`);

  // ✅ Get total count for pagination
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(buyers)
    .where(conditions.length ? and(...conditions) : undefined);

  return NextResponse.json({
    items,
    total: Number(count),
    page,
    totalPages: Math.ceil(Number(count) / pageSize),
  });
}
