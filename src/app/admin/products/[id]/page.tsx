import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { products } from "@/db/schema";
import ProductForm from "@/components/ProductForm";

export default async function EditProduct({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (id === "new") {
    return (<div className="flex flex-col gap-6"><h1 className="font-display text-[36px] font-medium leading-none md:text-[48px]">Add perfume</h1><ProductForm /></div>);
  }
  const p = Number.isInteger(Number(id)) ? (await db.select().from(products).where(eq(products.id, Number(id))).limit(1))[0] : undefined;
  if (!p) notFound();
  return (<div className="flex flex-col gap-6"><h1 className="font-display text-[36px] font-medium leading-none md:text-[48px]">Edit {p.name}</h1><ProductForm product={p} /></div>);
}
