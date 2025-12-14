import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
// [수정] 💡 'Prisma' unused warning 해결: Prisma 런타임 객체 대신 타입만 사용하므로 import를 제거
// import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { encryptAesGcm, getAes256GcmKeyFromEnv } from "@/lib/crypto";
import { getUserId } from "@/lib/request-user";

// [중요] 다국어 경로([locale])가 포함된 올바른 타입 경로
import {
  DeleteBodySchema,
  DeleteResult,
  DeleteResultSchema,
  ErrorResponse,
  HistoryListSchema,
  PostBodySchema,
  SaveResult,
  SaveResultSchema,
} from "@/app/[locale]/(site)/my-config/types";

export const runtime = "nodejs";

// 간단한 디버그 플래그 (원하면 .env 에 MY_CONFIG_DEBUG=1 추가)
const MY_CONFIG_DEBUG = process.env.MY_CONFIG_DEBUG === "1";

// 에러 응답 헬퍼 함수
function jsonError(
  status: number,
  payload: ErrorResponse
): NextResponse<ErrorResponse> {
  if (MY_CONFIG_DEBUG) {
    console.error("[/api/my-config] jsonError", status, payload);
  }
  return NextResponse.json(payload, { status });
}

// 1. POST: 설정 저장 (생성 및 수정)
// 💡 [수정] Promise<NextResponse> 타입 명시
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const json = await req.json();
    if (MY_CONFIG_DEBUG) console.log("[/api/my-config] POST raw body", json);

    // [검증] Zod 스키마로 파싱
    const body = PostBodySchema.parse(json);

    // passphrase 처리 (안전하게 접근)
    // 💡 [수정] any 제거: PostBodySchema의 types.ts에 passphrase가 Optional로 정의되어 있다고 가정
    const passphraseVal =
      "passphrase" in body ? (body as { passphrase?: string }).passphrase : "";

    if (MY_CONFIG_DEBUG) {
      console.log("[/api/my-config] POST parsed body", {
        exchangeCode: body.exchangeCode,
        uid: body.uid,
        apiKeyPreview: body.apiKey.slice(0, 6) + "...",
        hasPassphrase: !!passphraseVal,
      });
    }

    const userId = await getUserId();
    if (!userId) return jsonError(401, { error: "Unauthorized" });

    // 거래소 정보 조회
    const exchange = await prisma.exchange.findUnique({
      where: { code: body.exchangeCode },
      select: { id: true, code: true },
    });

    if (!exchange) return jsonError(404, { error: "Exchange not found" });

    // 암호화 키 가져오기
    const key = getAes256GcmKeyFromEnv();

    // 데이터 암호화
    const apiKeyEnc = encryptAesGcm(body.apiKey, key);
    const apiSecretEnc = encryptAesGcm(body.apiSecret, key);

    // Passphrase 암호화
    const hasPassphrase =
      typeof passphraseVal === "string" && passphraseVal.trim().length > 0;
    const passphraseEnc = hasPassphrase
      ? encryptAesGcm(passphraseVal, key)
      : null;

    // DB Upsert
    const saved = await prisma.exchangeCredential.upsert({
      where: {
        userId_exchangeId: {
          userId,
          exchangeId: exchange.id,
        },
      },
      create: {
        userId,
        exchangeId: exchange.id,
        exchangeUid: body.uid,
        apiKeyCipher: apiKeyEnc.cipherTextB64,
        apiKeyIv: apiKeyEnc.ivB64,
        apiKeyTag: apiKeyEnc.tagB64,
        secretCipher: apiSecretEnc.cipherTextB64,
        secretIv: apiSecretEnc.ivB64,
        secretTag: apiSecretEnc.tagB64,
        keyAlg: "aes-256-gcm",
        keyVersion: 1,
        passphraseCipher: passphraseEnc?.cipherTextB64 ?? null,
        passphraseIv: passphraseEnc?.ivB64 ?? null,
        passphraseTag: passphraseEnc?.tagB64 ?? null,
      },
      update: {
        exchangeUid: body.uid,
        apiKeyCipher: apiKeyEnc.cipherTextB64,
        apiKeyIv: apiKeyEnc.ivB64,
        apiKeyTag: apiKeyEnc.tagB64,
        secretCipher: apiSecretEnc.cipherTextB64,
        secretIv: apiSecretEnc.ivB64,
        secretTag: apiSecretEnc.tagB64,
        keyAlg: "aes-256-gcm",
        keyVersion: 1,
        passphraseCipher: passphraseEnc?.cipherTextB64 ?? null,
        passphraseIv: passphraseEnc?.ivB64 ?? null,
        passphraseTag: passphraseEnc?.tagB64 ?? null,
      },
      select: { id: true, updatedAt: true },
    });

    const result: SaveResult = {
      id: saved.id,
      exchangeCode: exchange.code,
      updatedAt: saved.updatedAt.toISOString(),
    };

    SaveResultSchema.parse(result);
    return NextResponse.json(result, { status: 200 });
  } catch (err: unknown) {
    // 💡 [수정] any 대신 unknown 사용 (가장 안전)
    console.error("[/api/my-config] POST error", err);

    if (err instanceof ZodError) {
      return jsonError(400, { error: "VALIDATION_ERROR", details: err.issues });
    }

    // 💡 [수정] any 제거: err가 객체이고 code 속성을 가질 때 처리
    const errObj = err as { code?: string };

    if (errObj.code && typeof errObj.code === "string") {
      return jsonError(500, {
        error: "PRISMA_ERROR",
        details: { code: errObj.code },
      });
    }

    return jsonError(500, { error: "INTERNAL_ERROR" });
  }
}

// 2. GET: 설정 목록 조회
export async function GET(): Promise<NextResponse> {
  try {
    const userId = await getUserId();
    if (!userId) return jsonError(401, { error: "Unauthorized" });

    // DB 조회
    const rows = await prisma.exchangeCredential.findMany({
      where: { userId },
      orderBy: [{ updatedAt: "desc" }],
      include: {
        exchange: {
          select: { code: true, name: true },
        },
      },
    });

    // DTO 변환
    const list = rows.map((r) => ({
      id: r.id,
      exchangeCode: r.exchange.code,
      exchangeName: r.exchange.name,
      uid: r.exchangeUid ?? undefined,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }));

    HistoryListSchema.parse(list);
    return NextResponse.json(list, { status: 200 });
  } catch (err: unknown) {
    // 💡 [수정] any 대신 unknown 사용
    console.error("[/api/my-config] GET error", err);

    if (err instanceof ZodError) {
      return jsonError(500, {
        error: "SCHEMA_VALIDATION_FAILED",
        details: err.issues,
      });
    }
    return jsonError(500, { error: "INTERNAL_ERROR" });
  }
}

// 3. DELETE: 설정 삭제
export async function DELETE(req: NextRequest): Promise<NextResponse> {
  try {
    const userId = await getUserId();
    if (!userId) return jsonError(401, { error: "Unauthorized" });

    const json = await req.json();
    const body = DeleteBodySchema.parse(json);

    // 거래소 ID 찾기
    const exchange = await prisma.exchange.findUnique({
      where: { code: body.exchangeCode },
      select: { id: true, code: true },
    });

    if (!exchange) return jsonError(404, { error: "Exchange not found" });

    // 삭제 수행
    const deleted = await prisma.exchangeCredential.delete({
      where: {
        userId_exchangeId: {
          userId,
          exchangeId: exchange.id,
        },
      },
      select: { id: true },
    });

    const result: DeleteResult = {
      id: deleted.id,
      exchangeCode: exchange.code,
      ok: true,
    };

    DeleteResultSchema.parse(result);
    return NextResponse.json(result, { status: 200 });
  } catch (err: unknown) {
    // 💡 [수정] any 대신 unknown 사용
    console.error("[/api/my-config] DELETE error", err);

    if (err instanceof ZodError) {
      return jsonError(400, { error: "VALIDATION_ERROR", details: err.issues });
    }

    // 💡 [수정] any 제거: err가 객체이고 code 속성을 가질 때 처리
    const errObj = err as { code?: string };

    // [수정] instanceof 대신 code 직접 확인 (가장 안전한 방법)
    if (errObj.code === "P2025") {
      return jsonError(404, { error: "Credential not found" });
    }

    if (errObj.code && typeof errObj.code === "string") {
      return jsonError(500, {
        error: "PRISMA_ERROR",
        details: { code: errObj.code },
      });
    }

    return jsonError(500, { error: "INTERNAL_ERROR" });
  }
}
