import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { buyers } from "@/db/schema/buyer";
import { eq } from "drizzle-orm";
import { logBuyerHistory } from "@/lib/api/history";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { buyerBase } from "@/lib/validators/buyer";
import { users } from "@/db/schema/auth";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const buyerId = await params.id;
  if (!buyerId) {
    return NextResponse.json({ error: "Missing buyerId" }, { status: 400 });
  }
  // ✅ Get current user
  const [currentUser] = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (!currentUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // ✅ Fetch existing buyer
  const [existingBuyer] = await db
    .select()
    .from(buyers)
    .where(eq(buyers.id, buyerId))
    .limit(1);

  if (!existingBuyer) {
    return NextResponse.json({ error: "Buyer not found" }, { status: 404 });
  }

  // ✅ Permission check
  const isOwner = existingBuyer.ownerId === currentUser.id;
  const isAdmin = currentUser.role === "admin";

  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // ✅ Validate body
  const body = await req.json();
  const parse = buyerBase.partial().safeParse(body); // partial for updates
  if (!parse.success) {
    return NextResponse.json({ error: parse.error.format() }, { status: 400 });
  }

  const updateData = {
    ...parse.data,
    ownerId: Number(session.user.id),
    updatedAt: new Date(),
  };

  // ✅ Update buyer
  const [updatedBuyer] = await db
    .update(buyers)
    .set(updateData)
    .where(eq(buyers.id, buyerId))
    .returning();

  if (!updatedBuyer) {
    return NextResponse.json({ error: "Buyer not found" }, { status: 404 });
  }

  // ✅ Log history
  await logBuyerHistory(buyerId, updateData, session.user.id);

  return NextResponse.json({ buyer: updatedBuyer });
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = await params.id;
    const buyer = await db
      .select()
      .from(buyers)
      .where(eq(buyers.id, id)) // if `id` is uuid keep as string
      .limit(1);

    if (!buyer) {
      return NextResponse.json({ error: "Buyer not found" }, { status: 404 });
    }

    return NextResponse.json(buyer);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch buyer" },
      { status: 500 }
    );
  }
}
