"use server";

import { eq } from "drizzle-orm";
import { db } from "@/db";
import { products, reviews } from "@/db/schema";
import { getUser } from "@/lib/auth";
import { getT } from "@/lib/lang";

export type ReviewState = { error?: string; done?: boolean };

export async function submitReview(_: ReviewState, f: FormData): Promise<ReviewState> {
  if (String(f.get("website") ?? "") !== "") return { done: true }; // hidden field: only bots fill it
  const t = await getT();
  const productId = Number(f.get("productId"));
  const rating = Math.round(Number(f.get("rating")));
  const comment = String(f.get("comment") ?? "").trim().slice(0, 600);
  const user = await getUser();
  const name = (user?.name ?? String(f.get("name") ?? "")).trim().slice(0, 60);
  if (name.length < 2) return { error: t("Please enter your name.") };
  if (!(rating >= 1 && rating <= 5)) return { error: t("Choose a star rating.") };
  if (comment.length < 5) return { error: t("Please write a few words about the perfume.") };
  const p = (await db.select({ id: products.id }).from(products).where(eq(products.id, productId)).limit(1))[0];
  if (!p) return { error: t("This perfume was not found.") };
  await db.insert(reviews).values({ productId, userId: user?.id ?? null, name, rating, comment, approved: false });
  return { done: true };
}
