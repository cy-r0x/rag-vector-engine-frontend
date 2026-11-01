"use server";

import { redirect } from "next/navigation";

import { postJson, type TokenResponse } from "@/lib/api";
import { createSession, deleteSession } from "@/lib/session";

export type AuthFormState<F extends string> =
  | {
      errors?: Partial<Record<F, string>>;
      message?: string;
      values?: Partial<Record<F, string>>;
    }
  | undefined;

export type LoginField = "email" | "password";
export type RegisterField = "business_name" | "email" | "password";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MAX = 128;
const PASSWORD_MIN = 8;
const BUSINESS_NAME_MAX = 200;

export async function login(
  _prev: AuthFormState<LoginField>,
  formData: FormData,
): Promise<AuthFormState<LoginField>> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const values = { email };

  const errors: Partial<Record<LoginField, string>> = {};
  if (!EMAIL_PATTERN.test(email)) errors.email = "Enter a valid email address.";
  if (!password) errors.password = "Enter your password.";
  else if (password.length > PASSWORD_MAX) errors.password = `Password must be at most ${PASSWORD_MAX} characters.`;
  if (Object.keys(errors).length > 0) return { errors, values };

  const result = await postJson<TokenResponse>("/v1/auth/login", { email, password });
  if (!result.ok) {
    return { errors: result.fieldErrors, message: result.detail, values };
  }

  await createSession(result.data);
  redirect("/");
}

export async function register(
  _prev: AuthFormState<RegisterField>,
  formData: FormData,
): Promise<AuthFormState<RegisterField>> {
  const businessName = String(formData.get("business_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const values = { business_name: businessName, email };

  const errors: Partial<Record<RegisterField, string>> = {};
  if (!businessName) errors.business_name = "Enter your business name.";
  else if (businessName.length > BUSINESS_NAME_MAX)
    errors.business_name = `Business name must be at most ${BUSINESS_NAME_MAX} characters.`;
  if (!EMAIL_PATTERN.test(email)) errors.email = "Enter a valid email address.";
  if (password.length < PASSWORD_MIN) errors.password = `Password must be at least ${PASSWORD_MIN} characters.`;
  else if (password.length > PASSWORD_MAX) errors.password = `Password must be at most ${PASSWORD_MAX} characters.`;
  if (Object.keys(errors).length > 0) return { errors, values };

  const result = await postJson<TokenResponse>("/v1/auth/register", {
    business_name: businessName,
    email,
    password,
  });
  if (!result.ok) {
    if (result.status === 409) {
      return { errors: { email: result.detail }, values };
    }
    return { errors: result.fieldErrors, message: result.detail, values };
  }

  await createSession(result.data);
  redirect("/");
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}
