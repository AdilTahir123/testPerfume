import { eq } from "drizzle-orm";
import { db } from "@/db";
import { paymentReceipts } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";

// Receipts are private: only a logged-in admin can open them. The type shown is the one verified when the file was uploaded.
export async function GET(_: Request, { params }: { params: Promise<{ name: string }> }) {
  await requireAdmin();
  const { name } = await params;
  if (!/^\d{1,9}$/.test(name)) return new Response("Not found", { status: 404 });
  const row = (await db.select().from(paymentReceipts).where(eq(paymentReceipts.id, Number(name))).limit(1))[0];
  if (!row) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(row.data), {
    headers: { "Content-Type": row.mime, "Cache-Control": "private, no-store", "Content-Disposition": "inline", "X-Content-Type-Options": "nosniff", "Content-Security-Policy": "default-src 'none'; img-src 'self' data:; style-src 'unsafe-inline'; sandbox" },
  });
}
