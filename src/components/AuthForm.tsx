"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { FormState } from "@/app/login/actions";
import { useT } from "@/lib/lang-client";

const field = "min-h-11 w-full rounded border border-line2 bg-surface px-3 text-base text-ink";
const label = "mb-1 block text-xs uppercase tracking-[0.18em] text-muted";

export default function AuthForm({
  mode,
  action,
  next,
}: {
  mode: "login" | "signup";
  action: (s: FormState, f: FormData) => Promise<FormState>;
  next?: string;
}) {
  const t = useT();
  const [state, run, pending] = useActionState(action, {});
  const login = mode === "login";
  const v = state.values ?? {};
  return (
    <section className="mx-auto flex max-w-[460px] flex-col gap-6 px-5 py-10 md:py-16">
      <h1 className="font-display text-[40px] font-medium leading-[1.05] md:text-[48px]">{login ? t("Log in") : t("Create account")}</h1>
      <form action={run} className="flex flex-col gap-4">
        {next && <input type="hidden" name="next" value={next} />}
        {!login && (
          <>
            <div><label htmlFor="name" className={label}>{t("Full name")}</label><input id="name" name="name" required autoComplete="name" defaultValue={v.name} className={field} /></div>
            <div><label htmlFor="phone" className={label}>{t("Mobile (optional)")}</label><input id="phone" name="phone" type="tel" autoComplete="tel" defaultValue={v.phone} className={field} /></div>
          </>
        )}
        <div><label htmlFor="email" className={label}>{t("Email")}</label><input id="email" name="email" type="email" required autoComplete="email" defaultValue={v.email} className={field} /></div>
        <div><label htmlFor="password" className={label}>{t("Password")}</label><input id="password" name="password" type="password" required minLength={login ? undefined : 8} autoComplete={login ? "current-password" : "new-password"} className={field} /></div>
        {state.error && <p role="alert" className="m-0 rounded border border-red-400/60 bg-red-400/10 p-3 text-red-300">{state.error}</p>}
        <button type="submit" disabled={pending} className="bg-gold flex min-h-[52px] cursor-pointer items-center justify-center rounded-sm text-sm font-semibold uppercase tracking-[0.08em] text-onacc disabled:opacity-60">
          {pending ? t("Please wait…") : login ? t("Log in") : t("Sign up")}
        </button>
      </form>
      <p className="m-0 text-muted">
        {login ? t("New here? ") : t("Already have an account? ")}
        <Link href={login ? "/signup" : "/login"} className="text-accent underline">{login ? t("Create an account") : t("Log in")}</Link>
      </p>
    </section>
  );
}
