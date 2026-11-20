"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { loginAttempts, users } from "@/db/schema";
import { getT } from "@/lib/lang";
import { endSession, hashPassword, startSession, verifyPassword } from "@/lib/auth";

export type FormState = { error?: string; values?: Record<string, string> };

const safeNext = (n: FormDataEntryValue | null) => {
  const s = String(n ?? "");
  // Only a plain path on this site: "//evil.com" and "/\\evil.com" are treated by browsers as other websites
  return /^\/(?![\/\\])[^\x00-\x1f\\]*$/.test(s) ? s : "/account";
};

export async function login(_: FormState, f: FormData): Promise<FormState> {
  const t = await getT();
  const email = String(f.get("email") ?? "").trim().toLowerCase();
  const password = String(f.get("password") ?? "");
  const now = Math.floor(Date.now() / 1000);
  const att = (await db.select().from(loginAttempts).where(eq(loginAttempts.email, email)).limit(1))[0];
  const active = att && now - att.firstAt < 15 * 60;
  if (active && att.fails >= 8) return { error: t("Too many wrong attempts. Please try again in 15 minutes."), values: { email } };
  const u = (await db.select().from(users).where(eq(users.email, email)).limit(1))[0];
  if (!u || !verifyPassword(password, u.passwordHash)) {
    if (email.length <= 120) {
      await db
        .insert(loginAttempts)
        .values({ email, fails: 1, firstAt: now })
        .onConflictDoUpdate({ target: loginAttempts.email, set: active ? { fails: (att?.fails ?? 0) + 1 } : { fails: 1, firstAt: now } });
    }
    return { error: t("Email or password is wrong."), values: { email } };
  }
  await db.delete(loginAttempts).where(eq(loginAttempts.email, email));
  await startSession(u.id);
  redirect(u.role === "admin" && !f.get("next") ? "/admin" : safeNext(f.get("next")));
}

export async function signup(_: FormState, f: FormData): Promise<FormState> {
  const t = await getT();
  const name = String(f.get("name") ?? "").trim().slice(0, 100);
  const email = String(f.get("email") ?? "").trim().toLowerCase().slice(0, 120);
  const phone = String(f.get("phone") ?? "").trim().slice(0, 20);
  const password = String(f.get("password") ?? "");
  if (name.length < 2) return { error: t("Please enter your name."), values: { name, email, phone } };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: t("Enter a valid email address."), values: { name, email, phone } };
  if (password.length < 8) return { error: t("Password must be at least 8 characters."), values: { name, email, phone } };
  const exists = (await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1))[0];
  if (exists) return { error: t("An account with this email already exists. Try logging in."), values: { name, email, phone } };
  const [u] = await db
    .insert(users)
    .values({ name, email, phone: phone || null, passwordHash: hashPassword(password) })
    .returning({ id: users.id });
  await startSession(u.id);
  redirect("/account");
}

export async function logout() {
  await endSession();
  redirect("/");
}
