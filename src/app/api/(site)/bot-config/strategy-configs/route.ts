// src/app/api/bot-config/strategy-configs/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // 싱글톤 권장
import { getUserId } from "@/lib/request-user"; // ← 여기!

export const runtime = "nodejs";

export async function GET(): Promise<Response> {
  const userId = await getUserId(); // 헤더에서 x-user-id 추출
  if (!userId) {
    return NextResponse.json(
      { ok: false, code: "UNAUTHORIZED" },
      { status: 401 }
    );
  }

  const rows = await prisma.strategyConfig.findMany({
    where: { userId }, // ★ 본인 것만
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  // 프론트 훅은 배열을 기대하므로 배열 그대로 응답
  return NextResponse.json(rows);
}
