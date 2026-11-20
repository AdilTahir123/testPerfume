import Image from "next/image";
import Link from "next/link";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { products } from "@/db/schema";
import { formatPrice } from "@/lib/format";
import { toggleProduct } from "../actions";

export default async function AdminProducts() {
  const list = await db.select().from(products).orderBy(desc(products.id));
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-[36px] font-medium leading-none md:text-[48px]">Products</h1>
        <Link href="/admin/products/new" className="bg-gold flex min-h-11 items-center rounded-sm px-6 text-sm font-semibold uppercase tracking-[0.08em] text-onacc">Add perfume</Link>
      </div>
      <ul className="m-0 flex list-none flex-col gap-3 p-0">
        {list.map((p) => (
          <li key={p.id} className="flex flex-wrap items-center gap-4 rounded border border-line bg-surface p-3">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded"><Image src={p.image} alt="" fill sizes="64px" className="object-cover" /></div>
            <div className="min-w-0 flex-1 basis-48">
              <div className="font-medium">{p.name}</div>
              <div className="text-sm text-muted">{p.tag} · {formatPrice(p.price)} · stock {p.stock}{p.featured ? " · featured" : ""}{p.active ? "" : " · hidden"}</div>
            </div>
            <Link href={`/admin/products/${p.id}`} className="flex min-h-11 items-center rounded-sm border border-line2 px-4 text-sm text-ink">Edit</Link>
            <form action={toggleProduct}>
              <input type="hidden" name="id" value={p.id} />
              <button className="min-h-11 cursor-pointer rounded-sm border border-line2 px-4 text-sm text-muted">{p.active ? "Hide" : "Show"}</button>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}
