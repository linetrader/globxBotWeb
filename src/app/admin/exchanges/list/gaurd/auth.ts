import { getUserId } from "@/lib/request-user";

export async function requireAdmin(): Promise<string> {
  const userId = await getUserId();
  if (!userId) {
    throw new Error("Unauthorized");
  }
  const allow = (process.env.ADMIN_USER_IDS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  if (allow.length > 0 && !allow.includes(userId)) {
    throw new Error("Forbidden");
  }
  return userId;
}
