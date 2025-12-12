// src/app/(site)/bot-config/lib/fetcher.ts

export async function postJson<TReq extends object, TRes>(
  url: string,
  body: TReq,
  init?: Omit<RequestInit, "method" | "body" | "headers">
): Promise<TRes> {
  const res = await fetch(url, {
    ...(init ?? {}),
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return (await res.json()) as TRes;
}

export async function getJson<TRes>(
  url: string,
  init?: RequestInit
): Promise<TRes> {
  const res = await fetch(url, { ...(init ?? {}), method: "GET" });
  return (await res.json()) as TRes;
}
