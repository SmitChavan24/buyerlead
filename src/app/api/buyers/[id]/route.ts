import { db } from "@/db";
import { buyers } from "@/db/schema/buyer";
import { eq } from "drizzle-orm";
import { logBuyerHistory } from "@/lib/api/history";

export async function PUT(req: Request, context: { params: { id: string } }) {
  const buyerId = context.params.id;
  const body = await req.json();
  const userId = body.userId; // get from session in real app

  // Update buyer
  await db.update(buyers).set(body).where(eq(buyers.id, buyerId));

  // Log changes
  await logBuyerHistory(buyerId, body, userId);

  return new Response(JSON.stringify({ success: true }));
}
