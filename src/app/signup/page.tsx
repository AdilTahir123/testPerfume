import type { Metadata } from "next";
import AuthForm from "@/components/AuthForm";
import { signup } from "../login/actions";

export const metadata: Metadata = { title: "Create account | HAAD Fragrances" };

export default function SignupPage() {
  return <AuthForm mode="signup" action={signup} />;
}
