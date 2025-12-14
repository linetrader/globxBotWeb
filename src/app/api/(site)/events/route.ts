// src/app/api/(site)/events/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { BoardType, PostVisibility } from "@/generated/prisma";
import { z } from "zod";

// 공용 응답 헬퍼
function ok<T>(data: T) {
  return NextResponse.json({ ok: true, data } as const, { status: 200 });
}
function err(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message } as const, { status });
}

// 쿼리 검증
const IdQuerySchema = z.object({ id: z.string().min(1) });

// GET: 목록/상세 (공개 + 발행된 이벤트만)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    // 상세
    if (id) {
      const parsed = IdQuerySchema.safeParse({ id });
      if (!parsed.success) return err("INVALID_ID", 400);

      const post = await prisma.post.findFirst({
        where: {
          id: parsed.data.id,
          boardType: BoardType.EVENT,
          visibility: PostVisibility.PUBLIC,
          isPublished: true,
        },
        select: {
          id: true,
          title: true,
          bodyHtml: true,
          publishedAt: true,
          createdAt: true,
          // 이벤트 전용 필드
          eventStartAt: true,
          eventEndAt: true,
          bannerUrl: true,
          ctaLinkUrl: true,
        },
      });

      if (!post) return err("NOT_FOUND", 404);

      return ok({
        id: post.id,
        title: post.title,
        bodyHtml: post.bodyHtml,
        publishedAt: post.publishedAt ? post.publishedAt.toISOString() : null,
        createdAt: post.createdAt.toISOString(),
        eventStartAt: post.eventStartAt
          ? post.eventStartAt.toISOString()
          : null,
        eventEndAt: post.eventEndAt ? post.eventEndAt.toISOString() : null,
        bannerUrl: post.bannerUrl ?? null,
        ctaLinkUrl: post.ctaLinkUrl ?? null,
      });
    }

    // 목록
    // - 이벤트는 기간이 중요하니 eventStartAt 최신순 우선
    // - 없으면 publishedAt / createdAt로 정렬
    const rows = await prisma.post.findMany({
      where: {
        boardType: BoardType.EVENT,
        visibility: PostVisibility.PUBLIC,
        isPublished: true,
      },
      orderBy: [
        { eventStartAt: "desc" },
        { publishedAt: "desc" },
        { createdAt: "desc" },
      ],
      select: {
        id: true,
        title: true,
        publishedAt: true,
        createdAt: true,
        eventStartAt: true,
        eventEndAt: true,
        bannerUrl: true,
      },
    });

    return ok(
      rows.map((r) => ({
        id: r.id,
        title: r.title,
        publishedAt: (r.publishedAt ?? r.createdAt).toISOString(),
        eventStartAt: r.eventStartAt ? r.eventStartAt.toISOString() : null,
        eventEndAt: r.eventEndAt ? r.eventEndAt.toISOString() : null,
        bannerUrl: r.bannerUrl ?? null,
      }))
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : "INTERNAL_ERROR";
    return err(msg, 500);
  }
}
