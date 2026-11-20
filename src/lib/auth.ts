import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";

export { hashPassword, verifyPassword } from "./password";

const COOKIE = "haad_session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function secret() {
  const s = process.env.AUTH_SECRET;
  if (s && s.length >= 16) return s;
  // A fresh copy of the project has no .env yet: allow a fixed secret on your own computer only
  if (process.env.NODE_ENV !== "production") return "dev-only-secret-do-not-use-on-the-live-site";
  throw new Error("AUTH_SECRET is missing. Add it in Vercel > Settings > Environment Variables.");
}

const sign = (v: string) => createHmac("sha256", secret()).update(v).digest("base64url");

export async function startSession(userId: number) {
  const payload = Buffer.from(JSON.stringify({ uid: userId, exp: Date.now() + MAX_AGE * 1000 })).toString("base64url");
  (await cookies()).set(COOKIE, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function endSession() {
  (await cookies()).delete(COOKIE);
}

export async function getUser() {
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return null;
  const [payload, sig] = raw.split(".");
  if (!payload || !sig) return null;
  const expected = sign(payload);
  if (sig.length !== expected.length || !timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  try {
    const { uid, exp } = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (typeof uid !== "number" || exp < Date.now()) return null;
    const u = (await db.select().from(users).where(eq(users.id, uid)).limit(1))[0];
    return u ?? null;
  } catch {
    return null;
  }
}

export async function requireAdmin() {
  const u = await getUser();
  if (!u) redirect("/login?next=/admin");
  if (u.role !== "admin") redirect("/");
  return u;
}
