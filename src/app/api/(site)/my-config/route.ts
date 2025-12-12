// src/app/api/my-config/route.ts
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { Prisma } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import { encryptAesGcm, getAes256GcmKeyFromEnv } from "@/lib/crypto";
import { getUserId } from "@/lib/request-user";
import {
  DeleteBodySchema,
  DeleteResult,
  DeleteResultSchema,
  ErrorResponse,
  HistoryListSchema,
  PostBodySchema,
  SaveResult,
  SaveResultSchema,
} from "@/app/(site)/my-config/types";

export const runtime = "nodejs";

// 간단한 디버그 플래그 (원하면 .env 에 MY_CONFIG_DEBUG=1 추가)
const MY_CONFIG_DEBUG = process.env.MY_CONFIG_DEBUG === "1";

function jsonError(
  status: number,
  payload: ErrorResponse
): NextResponse<ErrorResponse> {
  if (MY_CONFIG_DEBUG) {
    // 응답으로 내보내는 에러도 같이 로그
    // details 안에 민감정보가 들어가면 안 되므로 여기서는 그대로 사용
    console.error("[/api/my-config] jsonError", status, payload);
  }
  return NextResponse.json(payload, { status });
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const json = await req.json();
    if (MY_CONFIG_DEBUG) {
      console.log("[/api/my-config] POST raw body", json);
    }

    // UID + (필요 시) passphrase 포함한 body 검증
    const body = PostBodySchema.parse(json);

    if (MY_CONFIG_DEBUG) {
      const passphraseVal = (body as { passphrase?: string }).passphrase ?? "";
      console.log("[/api/my-config] POST parsed body", {
        exchangeCode: body.exchangeCode,
        uid: body.uid,
        apiKeyPreview: body.apiKey.slice(0, 6),
        apiSecretPreview: body.apiSecret.slice(0, 6),
        hasPassphrase: passphraseVal.trim() !== "",
      });
    }

    const userId = await getUserId();
    if (MY_CONFIG_DEBUG) {
      console.log("[/api/my-config] POST userId", userId);
    }
    if (!userId) return jsonError(401, { error: "Unauthorized" });

    const exchange = await prisma.exchange.findUnique({
      where: { code: body.exchangeCode },
      select: { id: true, code: true },
    });
    if (MY_CONFIG_DEBUG) {
      console.log("[/api/my-config] POST exchange", exchange);
    }
    if (!exchange) return jsonError(404, { error: "Exchange not found" });

    // AES-256-GCM 키 획득 및 암호화
    const key = getAes256GcmKeyFromEnv();
    if (MY_CONFIG_DEBUG) {
      console.log(
        "[/api/my-config] POST got AES key length",
        key.length,
        "env(CRED_ENC_KEY_B64) exists=",
        typeof process.env.CRED_ENC_KEY_B64 === "string"
      );
    }

    const apiKeyEnc = encryptAesGcm(body.apiKey, key);
    const apiSecretEnc = encryptAesGcm(body.apiSecret, key);

    const passphraseRaw = (body as { passphrase?: string }).passphrase ?? "";
    const hasPassphrase = passphraseRaw.trim() !== "";
    const passphraseEnc = hasPassphrase
      ? encryptAesGcm(passphraseRaw, key)
      : null;

    if (MY_CONFIG_DEBUG) {
      console.log("[/api/my-config] POST encrypted blobs", {
        apiKeyCipherLen: apiKeyEnc.cipherTextB64.length,
        secretCipherLen: apiSecretEnc.cipherTextB64.length,
        hasPassphrase,
        passphraseCipherLen: passphraseEnc?.cipherTextB64.length ?? 0,
      });
    }

    const saved = await prisma.exchangeCredential.upsert({
      where: { userId_exchangeId: { userId, exchangeId: exchange.id } },
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
        // ✅ passphrase 필드 (KuCoin 등에서 사용, 없으면 NULL)
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

    if (MY_CONFIG_DEBUG) {
      console.log("[/api/my-config] POST upsert saved", saved);
    }

    const result: SaveResult = {
      id: saved.id,
      exchangeCode: exchange.code,
      updatedAt: saved.updatedAt.toISOString(),
    };

    SaveResultSchema.parse(result);
    return NextResponse.json(result, { status: 200 });
  } catch (err: unknown) {
    console.error("[/api/my-config] POST error", err);

    if (err instanceof ZodError) {
      return jsonError(400, { error: "VALIDATION_ERROR", details: err.issues });
    }

    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      return jsonError(500, {
        error: "PRISMA_ERROR",
        details: { code: err.code, meta: err.meta },
      });
    }

    if (err instanceof Error) {
      return jsonError(500, {
        error: "INTERNAL_ERROR",
        details: err.message,
      });
    }

    return jsonError(500, { error: "INTERNAL_ERROR" });
  }
}

export async function GET(): Promise<NextResponse> {
  try {
    const userId = await getUserId();
    if (MY_CONFIG_DEBUG) {
      console.log("[/api/my-config] GET userId", userId);
    }
    if (!userId) return jsonError(401, { error: "Unauthorized" });

    const rows = await prisma.exchangeCredential.findMany({
      where: { userId },
      orderBy: [{ updatedAt: "desc" }],
      include: { exchange: { select: { code: true, name: true } } },
    });

    if (MY_CONFIG_DEBUG) {
      console.log("[/api/my-config] GET rows count", rows.length);
    }

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
    console.error("[/api/my-config] GET error", err);

    if (err instanceof ZodError) {
      return jsonError(500, {
        error: "SCHEMA_VALIDATION_FAILED",
        details: err.issues,
      });
    }

    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      return jsonError(500, {
        error: "PRISMA_ERROR",
        details: { code: err.code, meta: err.meta },
      });
    }

    if (err instanceof Error) {
      return jsonError(500, {
        error: "INTERNAL_ERROR",
        details: err.message,
      });
    }

    return jsonError(500, { error: "INTERNAL_ERROR" });
  }
}

export async function DELETE(req: NextRequest): Promise<NextResponse> {
  try {
    const userId = await getUserId();
    if (MY_CONFIG_DEBUG) {
      console.log("[/api/my-config] DELETE userId", userId);
    }
    if (!userId) return jsonError(401, { error: "Unauthorized" });

    const json = await req.json();
    if (MY_CONFIG_DEBUG) {
      console.log("[/api/my-config] DELETE raw body", json);
    }
    const body = DeleteBodySchema.parse(json); // { exchangeCode }

    const exchange = await prisma.exchange.findUnique({
      where: { code: body.exchangeCode },
      select: { id: true, code: true },
    });
    if (MY_CONFIG_DEBUG) {
      console.log("[/api/my-config] DELETE exchange", exchange);
    }
    if (!exchange) return jsonError(404, { error: "Exchange not found" });

    const deleted = await prisma.exchangeCredential.delete({
      where: { userId_exchangeId: { userId, exchangeId: exchange.id } },
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
    console.error("[/api/my-config] DELETE error", err);

    if (err instanceof ZodError) {
      return jsonError(400, {
        error: "VALIDATION_ERROR",
        details: err.issues,
      });
    }

    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2025"
    ) {
      return jsonError(404, { error: "Credential not found" });
    }

    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      return jsonError(500, {
        error: "PRISMA_ERROR",
        details: { code: err.code, meta: err.meta },
      });
    }

    if (err instanceof Error) {
      return jsonError(500, {
        error: "INTERNAL_ERROR",
        details: err.message,
      });
    }

    return jsonError(500, { error: "INTERNAL_ERROR" });
  }
}
