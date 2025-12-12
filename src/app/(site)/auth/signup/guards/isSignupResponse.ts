import type { SignupResponse } from "@/app/(site)/auth/signup/types/signup/api";

export function isSignupResponse(v: unknown): v is SignupResponse {
  if (typeof v !== "object" || v === null) return false;
  const r = v as { ok?: unknown };
  return typeof r.ok === "boolean";
}
