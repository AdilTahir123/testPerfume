"use client";

import { useActionState } from "react";
import type { Product } from "@/db/schema";
import { saveProduct } from "@/app/admin/actions";

const field = "min-h-11 w-full rounded border border-line2 bg-surface px-3 text-base text-ink";
const label = "mb-1 block text-xs uppercase tracking-[0.18em] text-muted";

export default function ProductForm({ product }: { product?: Product }) {
  const [state, run, pending] = useActionState(saveProduct, {});
  const p = product;
  return (
    <form action={run} encType="multipart/form-data" className="flex max-w-[720px] flex-col gap-4">
      <input type="hidden" name="id" value={p?.id ?? 0} />
      <div className="grid gap-4 md:grid-cols-2">
        <div><label htmlFor="name" className={label}>Name</label><input id="name" name="name" required defaultValue={p?.name} className={field} /></div>
        <div><label htmlFor="slug" className={label}>Link name (optional)</label><input id="slug" name="slug" defaultValue={p?.slug} placeholder="made from the name" className={field} /></div>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <div><label htmlFor="tag" className={label}>For</label>
          <select id="tag" name="tag" defaultValue={p?.tag ?? "Unisex"} className={field}>{["For him", "For her", "Unisex"].map((t) => <option key={t}>{t}</option>)}</select></div>
        <div><label htmlFor="price" className={label}>Price (Rs.)</label><input id="price" name="price" type="number" min={1} required defaultValue={p?.price} className={field} /></div>
        <div><label htmlFor="stock" className={label}>Stock</label><input id="stock" name="stock" type="number" min={0} required defaultValue={p?.stock ?? 0} className={field} /></div>
        <div><label htmlFor="sizeMl" className={label}>Size (ml)</label><input id="sizeMl" name="sizeMl" type="number" min={1} defaultValue={p?.sizeMl ?? 50} className={field} /></div>
      </div>
      <div><label htmlFor="description" className={label}>Description</label><textarea id="description" name="description" rows={4} defaultValue={p?.description} className={`${field} py-2`} /></div>
      <div className="grid gap-4 md:grid-cols-3">
        <div><label htmlFor="topNotes" className={label}>Top notes</label><input id="topNotes" name="topNotes" defaultValue={p?.topNotes} className={field} /></div>
        <div><label htmlFor="heartNotes" className={label}>Heart notes</label><input id="heartNotes" name="heartNotes" defaultValue={p?.heartNotes} className={field} /></div>
        <div><label htmlFor="baseNotes" className={label}>Base notes</label><input id="baseNotes" name="baseNotes" defaultValue={p?.baseNotes} className={field} /></div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div><label htmlFor="imageFile" className={label}>Photo (JPG, PNG, WebP, max 5 MB)</label><input id="imageFile" name="imageFile" type="file" accept="image/jpeg,image/png,image/webp" className={field} /></div>
        <div><label htmlFor="imageUrl" className={label}>Current photo (set automatically)</label><input id="imageUrl" name="imageUrl" defaultValue={p?.image} className={field} /></div>
      </div>
      <div><label htmlFor="imageAlt" className={label}>Photo description (for screen readers)</label><input id="imageAlt" name="imageAlt" defaultValue={p?.imageAlt} className={field} /></div>
      <div className="flex flex-wrap gap-6">
        <label className="flex min-h-11 items-center gap-2"><input type="checkbox" name="active" defaultChecked={p?.active ?? true} className="accent-[#ddb54a]" /> Visible in shop</label>
        <label className="flex min-h-11 items-center gap-2"><input type="checkbox" name="featured" defaultChecked={p?.featured ?? false} className="accent-[#ddb54a]" /> Show on home page</label>
      </div>
      {state.error && <p role="alert" className="m-0 rounded border border-red-400/60 bg-red-400/10 p-3 text-red-300">{state.error}</p>}
      <button disabled={pending} className="bg-gold flex min-h-[52px] w-fit cursor-pointer items-center rounded-sm px-10 text-sm font-semibold uppercase tracking-[0.08em] text-onacc disabled:opacity-60">{pending ? "Saving…" : "Save perfume"}</button>
    </form>
  );
}
