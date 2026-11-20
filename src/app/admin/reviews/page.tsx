import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { products, reviews } from "@/db/schema";
import { reviewAction } from "../actions";

export default async function AdminReviews() {
  const list = await db
    .select({ r: reviews, product: products.name })
    .from(reviews)
    .innerJoin(products, eq(products.id, reviews.productId))
    .orderBy(desc(reviews.id))
    .limit(100);
  return (
    <div className="flex flex-col gap-5">
      <h1 className="font-display text-[36px] font-medium leading-none md:text-[48px]">Reviews</h1>
      {list.length === 0 && <p className="rounded border border-line bg-surface p-5 text-muted">No reviews yet.</p>}
      {list.map(({ r, product }) => (
        <article key={r.id} className="flex flex-col gap-2 rounded border border-line bg-surface p-4">
          <div className="flex flex-wrap justify-between gap-2 text-sm text-muted"><span>{product} · {r.name}</span><span>{r.approved ? "Showing on site" : "Waiting for approval"}</span></div>
          <div className="text-accent" role="img" aria-label={`${r.rating} out of 5`}>{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</div>
          <p className="m-0">{r.comment}</p>
          <div className="flex gap-2">
            {!r.approved && (
              <form action={reviewAction}>
                <input type="hidden" name="id" value={r.id} /><input type="hidden" name="do" value="approve" />
                <button className="bg-gold min-h-11 cursor-pointer rounded-sm px-5 text-sm font-semibold uppercase text-onacc">Approve</button>
              </form>
            )}
            <form action={reviewAction}>
              <input type="hidden" name="id" value={r.id} /><input type="hidden" name="do" value="delete" />
              <button className="min-h-11 cursor-pointer rounded-sm border border-line2 px-5 text-sm text-muted">Delete</button>
            </form>
          </div>
        </article>
      ))}
    </div>
  );
}
