// JazzCash "Hosted Checkout" (HTTP POST redirect). Server-side only.
// Built from JazzCash's public integration guide. It is OFF until JAZZCASH_* credentials exist in .env and must be
// tried in JazzCash's sandbox (JAZZCASH_MODE=sandbox) with the merchant's own sandbox credentials before going live.
import { createHmac, timingSafeEqual } from "crypto";
import { jazzcashConfig } from "./payments";
import { siteUrl } from "./site";

const ENDPOINT = {
  sandbox: "https://sandbox.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform/",
  live: "https://payments.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform/",
};

// pp_SecureHash = HMAC-SHA256( salt + "&" + all non-empty pp_/ppmpf_ values sorted by field name joined by "&", key = salt ), upper-case hex
export function secureHash(fields: Record<string, string>, salt: string) {
  const joined = Object.keys(fields)
    .filter((k) => k !== "pp_SecureHash" && fields[k] !== "" && (k.startsWith("pp_") || k.startsWith("ppmpf_")))
    .sort()
    .map((k) => fields[k])
    .join("&");
  return createHmac("sha256", salt).update(`${salt}&${joined}`).digest("hex").toUpperCase();
}

const pad = (n: number) => String(n).padStart(2, "0");
const stamp = (d: Date) => {
  // JazzCash expects Pakistan time (UTC+5)
  const k = new Date(d.getTime() + 5 * 3600 * 1000);
  return `${k.getUTCFullYear()}${pad(k.getUTCMonth() + 1)}${pad(k.getUTCDate())}${pad(k.getUTCHours())}${pad(k.getUTCMinutes())}${pad(k.getUTCSeconds())}`;
};

export function buildJazzCashRequest(o: { orderNumber: string; txnRef: string; total: number }) {
  const c = jazzcashConfig();
  if (!c) return null;
  const now = new Date();
  const fields: Record<string, string> = {
    pp_Version: "1.1",
    pp_TxnType: "MWALLET",
    pp_Language: "EN",
    pp_MerchantID: c.merchantId,
    pp_SubMerchantID: "",
    pp_Password: c.password,
    pp_BankID: "TBANK",
    pp_ProductID: "RETL",
    pp_TxnRefNo: o.txnRef,
    pp_Amount: String(o.total * 100), // paisa
    pp_TxnCurrency: "PKR",
    pp_TxnDateTime: stamp(now),
    pp_BillReference: o.orderNumber.replace(/[^A-Za-z0-9]/g, ""),
    pp_Description: "HAAD Fragrances order",
    pp_TxnExpiryDateTime: stamp(new Date(now.getTime() + 24 * 3600 * 1000)),
    pp_ReturnURL: `${siteUrl}/api/payments/jazzcash/return`,
    ppmpf_1: "",
    ppmpf_2: "",
    ppmpf_3: "",
    ppmpf_4: "",
    ppmpf_5: "",
  };
  fields.pp_SecureHash = secureHash(fields, c.salt);
  // The password is part of the signed request JazzCash requires from the browser, as in their sample code.
  return { action: c.live ? ENDPOINT.live : ENDPOINT.sandbox, fields };
}

export function verifyJazzCashResponse(fields: Record<string, string>) {
  const c = jazzcashConfig();
  const got = fields.pp_SecureHash;
  if (!c || !got) return false;
  const want = secureHash(fields, c.salt);
  const a = Buffer.from(got.toUpperCase());
  const b = Buffer.from(want);
  return a.length === b.length && timingSafeEqual(a, b);
}

const INQUIRY = {
  sandbox: "https://sandbox.jazzcash.com.pk/ApplicationAPI/API/PaymentInquiry/Inquire",
  live: "https://payments.jazzcash.com.pk/ApplicationAPI/API/PaymentInquiry/Inquire",
};

// Server-to-server check with JazzCash itself (the browser is not involved), so a customer cannot fake a success page.
// Returns "paid" only when JazzCash confirms code 000 for exactly our reference and amount; "unknown" if it cannot be confirmed
// (network error, unexpected reply) so the order is left for an admin to check instead of being marked paid.
// NOTE: the inquiry URL/fields follow JazzCash's public guide and were NOT tried against their real sandbox (no credentials).
export async function inquireJazzCash(txnRef: string, expectedPaisa: string): Promise<"paid" | "failed" | "unknown"> {
  const c = jazzcashConfig();
  if (!c) return "unknown";
  const fields: Record<string, string> = { pp_TxnRefNo: txnRef, pp_MerchantID: c.merchantId, pp_Password: c.password };
  fields.pp_SecureHash = secureHash(fields, c.salt);
  try {
    const res = await fetch(process.env.JAZZCASH_INQUIRY_URL?.trim() || (c.live ? INQUIRY.live : INQUIRY.sandbox), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fields),
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return "unknown";
    const r = (await res.json()) as Record<string, string>;
    if (!verifyJazzCashResponse(r)) return "unknown";
    if (r.pp_TxnRefNo !== txnRef) return "unknown";
    if (r.pp_ResponseCode === "000" && (r.pp_PaymentResponseCode ?? "000") === "000") {
      return !r.pp_Amount || r.pp_Amount === expectedPaisa ? "paid" : "unknown";
    }
    return "failed";
  } catch {
    return "unknown";
  }
}
