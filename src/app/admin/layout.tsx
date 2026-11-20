import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin | HAAD Fragrances", robots: { index: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="mx-auto max-w-[1200px] px-5 py-6 md:px-10 md:py-10">
      <nav aria-label="Admin" className="mb-8 flex flex-wrap gap-2 border-b border-line pb-4 text-sm uppercase tracking-[0.08em]">
        {[["/admin", "Orders"], ["/admin/products", "Products"], ["/admin/reviews", "Reviews"], ["/admin/coupons", "Coupons"]].map(([h, t]) => (
          <Link key={h} href={h} className="flex min-h-11 items-center rounded-sm border border-line2 px-4 text-ink hover:text-accent">{t}</Link>
        ))}
      </nav>
      {children}
    </div>
  );
}
