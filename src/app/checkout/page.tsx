import type { Metadata } from "next";
import { getUser } from "@/lib/auth";
import { availability, bankDetails } from "@/lib/payments";
import CheckoutForm from "./CheckoutForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Checkout | HAAD Fragrances", robots: { index: false } };

export default async function CheckoutPage() {
  const u = await getUser();
  return <CheckoutForm defaults={{ name: u?.name ?? "", phone: u?.phone ?? "", email: u?.email ?? "" }} available={availability()} bank={bankDetails()} />;
}
