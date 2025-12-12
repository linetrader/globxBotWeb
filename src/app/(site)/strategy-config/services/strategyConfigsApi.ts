// src/features/strategy-configs/services/strategyConfigsApi.ts
export type DeleteStrategyBody = { id: string };

async function parseError(res: Response, fallback: string): Promise<never> {
  let msg = `${fallback} (${res.status})`;
  try {
    const ej = (await res.json()) as { error?: string };
    if (typeof ej?.error === "string") msg = ej.error;
  } catch {
    // ignore
  }
  throw new Error(msg);
}

export async function deleteStrategyById(
  body: DeleteStrategyBody
): Promise<void> {
  const res = await fetch("/api/strategy-config", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) return parseError(res, "Delete failed");
}
