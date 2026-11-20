import { methodLabel } from "./payments";

// Order -> WhatsApp. The shop number that should receive every order.
export const ORDER_WHATSAPP = (process.env.ORDER_WHATSAPP || "923087475047").replace(/\D/g, "");

export type OrderForMessage = {
  orderNumber: string;
  name: string;
  phone: string;
  email?: string | null;
  address: string;
  city: string;
  note?: string | null;
  payment: string;
  subtotal?: number;
  discount: number;
  total: number;
  couponCode?: string | null;
  items: { name: string; quantity: number; price: number }[];
};

const rs = (n: number) => `Rs. ${n.toLocaleString("en-US")}`;

export function buildOrderText(o: OrderForMessage) {
  const lines = [
    `*New HAAD order ${o.orderNumber}*`,
    "",
    ...o.items.map((i) => `• ${i.name} × ${i.quantity} = ${rs(i.price * i.quantity)}`),
    "",
    o.discount > 0 ? `Discount${o.couponCode ? ` (${o.couponCode})` : ""}: − ${rs(o.discount)}` : "",
    `*Total: ${rs(o.total)}*`,
    `Payment: ${methodLabel(o.payment)}${o.payment === "cod" ? "" : " (not yet confirmed)"}`,
    "",
    `Name: ${o.name}`,
    `Phone: ${o.phone}`,
    o.email ? `Email: ${o.email}` : "",
    `Address: ${o.address}, ${o.city}`,
    o.note ? `Note: ${o.note}` : "",
  ];
  return lines.filter((l, i) => l !== "" || lines[i - 1] !== "").join("\n").trim();
}

// Pakistani mobile (03xx..., +92...) -> digits for wa.me
export function waDigits(phone: string) {
  const d = phone.replace(/\D/g, "");
  if (d.startsWith("92")) return d;
  if (d.startsWith("0")) return "92" + d.slice(1);
  return d;
}

// Automatic delivery to the shop's WhatsApp using CallMeBot (free; the shop owner activates it once, see README).
// Does nothing when CALLMEBOT_APIKEY is empty. Never throws: an order must not fail because WhatsApp is down.
export async function notifyShopWhatsApp(text: string) {
  const key = process.env.CALLMEBOT_APIKEY;
  if (!key) return;
  try {
    const url = `https://api.callmebot.com/whatsapp.php?phone=${ORDER_WHATSAPP}&text=${encodeURIComponent(text)}&apikey=${encodeURIComponent(key)}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) console.error("WhatsApp notify failed:", res.status);
  } catch (e) {
    console.error("WhatsApp notify error:", e);
  }
}
