import type { Metadata } from "next";
import Link from "next/link";

import { AuthCard } from "../ui";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function LoginPage() {
  return (
    <AuthCard
      title="Sign in"
      description="Welcome back. Sign in to manage your documents."
      footer={
        <>
          New to RAG Vector Engine?{" "}
          <Link href="/register" className="font-normal text-primary hover:text-primary-deep">
            Create an account
          </Link>
        </>
      }
    >
      <LoginForm />
    </AuthCard>
  );
}
