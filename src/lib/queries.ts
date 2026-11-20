import { and, asc, desc, eq, like, ne } from "drizzle-orm";
import { db } from "@/db";
import { products, reviews, type Product } from "@/db/schema";

export const TAGS = ["For him", "For her", "Unisex"] as const;
export type Sort = "newest" | "price-asc" | "price-desc";

export async function getActiveProducts(): Promise<Product[]> {
  try {
    return await db
      .select()
      .from(products)
      .where(eq(products.active, true))
      .orderBy(asc(products.id));
  } catch (e) {
    // Most likely the database was not set up yet: run "npm run db:setup".
    console.error("Could not read products:", e);
    return [];
  }
}

export async function getFeaturedProduct(list: Product[]): Promise<Product | undefined> {
  return list.find((p) => p.featured) ?? list[0];
}

export async function searchProducts(opts: {
  q?: string;
  tag?: string;
  sort?: Sort;
}): Promise<Product[]> {
  const conditions = [eq(products.active, true)];
  const q = opts.q?.trim();
  if (q) conditions.push(like(products.name, `%${q}%`));
  if (opts.tag && (TAGS as readonly string[]).includes(opts.tag)) {
    conditions.push(eq(products.tag, opts.tag));
  }
  const order =
    opts.sort === "price-asc"
      ? asc(products.price)
      : opts.sort === "price-desc"
        ? desc(products.price)
        : desc(products.id);
  try {
    return await db
      .select()
      .from(products)
      .where(and(...conditions))
      .orderBy(order);
  } catch (e) {
    console.error("Could not search products:", e);
    return [];
  }
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const rows = await db
    .select()
    .from(products)
    .where(and(eq(products.slug, slug), eq(products.active, true)))
    .limit(1);
  return rows[0];
}

export async function getRelatedProducts(product: Product, limit = 3): Promise<Product[]> {
  return db
    .select()
    .from(products)
    .where(and(eq(products.active, true), ne(products.id, product.id)))
    .orderBy(asc(products.id))
    .limit(limit);
}

export async function getApprovedReviews(productId: number) {
  return db
    .select()
    .from(reviews)
    .where(and(eq(reviews.productId, productId), eq(reviews.approved, true)))
    .orderBy(desc(reviews.id));
}

export async function getLatestReviews(limit = 3) {
  try {
    return await db
      .select()
      .from(reviews)
      .where(eq(reviews.approved, true))
      .orderBy(desc(reviews.id))
      .limit(limit);
  } catch {
    return [];
  }
}
