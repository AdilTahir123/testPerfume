// Sends mail through Resend (https://resend.com) with plain fetch, so no extra package is needed.
// If RESEND_API_KEY is empty, emails are skipped and the order still works.
import { formatPrice } from "./format";
import { methodLabel } from "./payments";

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

async function send(to: string, subject: string, html: string) {
  const key = process.env.RESEND_API_KEY;
  if (!key || !to) return;
  const from = process.env.EMAIL_FROM || "HAAD Fragrances <onboarding@resend.dev>";
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to, subject, html }),
    });
    if (!res.ok) console.error("Email failed:", res.status, await res.text());
  } catch (e) {
    console.error("Email failed:", e);
  }
}

export type OrderMail = {
  orderNumber: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  note: string;
  payment: string;
  total: number;
  discount: number;
  items: { name: string; quantity: number; price: number }[];
};

export async function sendOrderEmails(o: OrderMail) {
  const rows = o.items
    .map((i) => `<tr><td>${esc(i.name)} × ${i.quantity}</td><td align="right">${formatPrice(i.price * i.quantity)}</td></tr>`)
    .join("");
  const table = `<table cellpadding="6" style="border-collapse:collapse">${rows}${
    o.discount ? `<tr><td>Discount</td><td align="right">− ${formatPrice(o.discount)}</td></tr>` : ""
  }<tr><td><b>Total</b></td><td align="right"><b>${formatPrice(o.total)}</b></td></tr></table>`;
  const pay = methodLabel(o.payment);

  const owner = process.env.ORDER_NOTIFY_EMAIL;
  if (owner) {
    await send(
      owner,
      `New order ${o.orderNumber} · ${formatPrice(o.total)}`,
      `<p><b>${esc(o.name)}</b> · ${esc(o.phone)}${o.email ? ` · ${esc(o.email)}` : ""}</p>
       <p>${esc(o.address)}, ${esc(o.city)}</p>${o.note ? `<p>Note: ${esc(o.note)}</p>` : ""}
       ${table}<p>Payment: ${pay}</p>`,
    );
  }
  if (o.email) {
    await send(
      o.email,
      `Your HAAD order ${o.orderNumber}`,
      `<p>Hello ${esc(o.name.split(" ")[0])}, thank you for your order.</p>${table}
       <p>Payment: ${pay}. We will contact you on ${esc(o.phone)} to confirm.</p><p>HAAD Fragrances</p>`,
    );
  }
}
