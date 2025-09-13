import { db } from "@/db";
import { buyerHistory, buyers } from "@/db/schema/buyer";
import { eq } from "drizzle-orm";

type Buyer = typeof buyers.$inferSelect;
type BuyerUpdate = Partial<Buyer>;

export async function logBuyerHistory(
  buyerId: string,
  updates: BuyerUpdate,
  userId: string
) {
  const [oldBuyer] = await db
    .select()
    .from(buyers)
    .where(eq(buyers.id, buyerId));

  if (!oldBuyer) {
    console.warn(`Buyer ${buyerId} not found`);
    return;
  }

  const diff: Record<string, [any, any]> = {};

  (Object.keys(updates) as (keyof BuyerUpdate)[]).forEach((key) => {
    if (updates[key] !== undefined && oldBuyer[key] !== updates[key]) {
      diff[key as string] = [oldBuyer[key], updates[key]];
    }
  });

  if (Object.keys(diff).length > 0) {
    await db.insert(buyerHistory).values({
      buyerId,
      changedBy: userId,
      diff,
    });
  }
}
