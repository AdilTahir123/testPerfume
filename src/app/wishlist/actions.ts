"use server";

import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { wishlist } from "@/db/schema";
import { getUser } from "@/lib/auth";

export async function toggleWishlist(productId: number): Promise<{ login: true } | { wished: boolean }> {
  const user = await getUser();
  if (!user) return { login: true };
  if (!Number.isInteger(productId)) return { wished: false };
  const where = and(eq(wishlist.userId, user.id), eq(wishlist.productId, productId));
  const has = (await db.select({ id: wishlist.id }).from(wishlist).where(where).limit(1))[0];
  if (has) {
    await db.delete(wishlist).where(where);
    return { wished: false };
  }
  await db.insert(wishlist).values({ userId: user.id, productId }).onConflictDoNothing();
  return { wished: true };
}
