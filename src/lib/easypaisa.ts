// Easypaisa (Easypay hosted checkout). Server-side only. OFF until EASYPAISA_* credentials exist in .env.
// IMPORTANT: this module only prepares the signed request. Easypaisa's final server-to-server confirmation step could not be
// verified against official documentation, so a returning customer is NEVER marked paid automatically: the order goes to
// "Pending verification" and an admin confirms it against the Easypaisa merchant portal.
import { createCipheriv } from "crypto";
import { easypaisaConfig } from "./payments";
import { siteUrl } from "./site";

const ENDPOINT = {
  sandbox: "https://easypaystg.easypaisa.com.pk/easypay/Index.jsf",
  live: "https://easypay.easypaisa.com.pk/easypay/Index.jsf",
};

export function buildEasypaisaRequest(o: { orderNumber: string; txnRef: string; total: number; email: string; phone: string }) {
  const c = easypaisaConfig();
  if (!c) return null;
  const exp = new Date(Date.now() + 24 * 3600 * 1000 + 5 * 3600 * 1000);
  const p = (n: number) => String(n).padStart(2, "0");
  const expiryDate = `${exp.getUTCFullYear()}${p(exp.getUTCMonth() + 1)}${p(exp.getUTCDate())} ${p(exp.getUTCHours())}${p(exp.getUTCMinutes())}${p(exp.getUTCSeconds())}`;
  const fields: Record<string, string> = {
    amount: o.total.toFixed(1),
    autoRedirect: "1",
    emailAddr: o.email,
    expiryDate,
    mobileNum: o.phone,
    orderRefNum: o.txnRef,
    paymentMethod: "InitialRequest",
    postBackURL: `${siteUrl}/api/payments/easypaisa/return`,
    storeId: c.storeId,
  };
  // merchantHashedReq = AES-128-ECB(hashKey) over the sorted "key=value&..." string, base64
  const signed = Object.keys(fields).filter((k) => k !== "mobileNum").sort().map((k) => `${k}=${fields[k]}`).join("&");
  const cipher = createCipheriv("aes-128-ecb", Buffer.from(c.hashKey, "utf8"), null);
  fields.merchantHashedReq = Buffer.concat([cipher.update(signed, "utf8"), cipher.final()]).toString("base64");
  return { action: c.live ? ENDPOINT.live : ENDPOINT.sandbox, fields };
}
