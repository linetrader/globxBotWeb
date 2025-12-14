// src/app/(site)/strategy-config/utils/formValue.ts
export function pickValue(
  v: string | React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
): string {
  return typeof v === "string" ? v : (v.target?.value ?? "");
}

export function pickChecked(e: React.ChangeEvent<HTMLInputElement>): boolean {
  return Boolean(e.target?.checked);
}

export function toInt(s: string): number | undefined {
  const n = Number.parseInt(s, 10);
  return Number.isFinite(n) ? n : undefined;
}

export function toFloat(s: string): number | undefined {
  const n = Number.parseFloat(s);
  return Number.isFinite(n) ? n : undefined;
}

export function toNullableFloat(s: string): number | null | undefined {
  if (s === "") return null;
  const n = Number.parseFloat(s);
  return Number.isFinite(n) ? n : undefined;
}
