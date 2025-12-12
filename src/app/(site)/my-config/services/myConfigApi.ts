// src/app/(site)/my-config/services/myConfigApi.ts
import type { PostBody } from "../types/index";

export function apiLoadHistory(): Promise<Response> {
  return fetch("/api/my-config", { method: "GET" });
}

export function apiSaveConfig(body: PostBody): Promise<Response> {
  return fetch("/api/my-config", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export function apiDeleteByExchangeCode(
  exchangeCode: string
): Promise<Response> {
  return fetch("/api/my-config", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ exchangeCode }),
  });
}
