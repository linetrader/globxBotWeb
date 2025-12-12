import type { ResolveUserResponse } from "@/app/(site)/auth/signup/types/signup/api";

export function isResolveUserResponse(v: unknown): v is ResolveUserResponse {
  if (typeof v !== "object" || v === null) return false;
  const r = v as { ok?: unknown };
  return typeof r.ok === "boolean";
}
