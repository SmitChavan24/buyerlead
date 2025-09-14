import { NextResponse } from "next/server";
import { db } from "@/db";
import { buyers } from "@/db/schema/buyer";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { buyerBase } from "@/lib/validators/buyer";

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
    const parsed = buyerBase.array().parse(body.buyers);

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
