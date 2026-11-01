"use client";

import { useActionState } from "react";

import { register } from "@/app/actions/auth";

import { Field, FormAlert, SubmitButton } from "../ui";

export function RegisterForm() {
  const [state, action, pending] = useActionState(register, undefined);

  return (
    <form action={action} noValidate className="flex flex-col gap-5">
      <FormAlert message={state?.message} />
      <Field
        label="Business name"
        name="business_name"
        autoComplete="organization"
        placeholder="Acme Inc."
        required
        maxLength={200}
        defaultValue={state?.values?.business_name}
        error={state?.errors?.business_name}
      />
      <Field
        label="Work email"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="you@company.com"
        required
        defaultValue={state?.values?.email}
        error={state?.errors?.email}
      />
      <Field
        label="Password"
        name="password"
        type="password"
        autoComplete="new-password"
        required
        minLength={8}
        maxLength={128}
        hint="At least 8 characters."
        error={state?.errors?.password}
      />
      <SubmitButton pending={pending} pendingLabel="Creating account…">
        Create account
      </SubmitButton>
    </form>
  );
}
