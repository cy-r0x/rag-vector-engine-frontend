import type { Metadata } from "next";
import Link from "next/link";

import { AuthCard } from "../ui";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = {
  title: "Create account",
};

export default function RegisterPage() {
  return (
    <AuthCard
      title="Create your account"
      description="Onboard your business and become its first owner."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-normal text-primary hover:text-primary-deep">
            Sign in
          </Link>
        </>
      }
    >
      <RegisterForm />
    </AuthCard>
  );
}
