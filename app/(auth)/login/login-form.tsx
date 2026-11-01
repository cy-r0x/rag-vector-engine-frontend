"use client";

import { useActionState } from "react";

import { login } from "@/app/actions/auth";

import { Field, FormAlert, SubmitButton } from "../ui";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <form action={action} noValidate className="flex flex-col gap-5">
      <FormAlert message={state?.message} />
      <Field
        label="Email"
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
        autoComplete="current-password"
        required
        maxLength={128}
        error={state?.errors?.password}
      />
      <SubmitButton pending={pending} pendingLabel="Signing in…">
        Sign in
      </SubmitButton>
    </form>
  );
}
