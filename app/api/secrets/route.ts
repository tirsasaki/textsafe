import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { createSecretSchema, MAX_REQUEST_BYTES } from "@/lib/validation/secrets";
import { clientIp, rateLimiter } from "@/lib/rate-limit";
import { applyRateHeaders, noStoreJson } from "@/lib/security/http";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const rate = await rateLimiter.check(`create:${clientIp(request.headers)}`, 10, 10 * 60 * 1000);
  if (!rate.allowed) {
    return applyRateHeaders(noStoreJson({ error: "Too many requests" }, { status: 429 }), rate);
  }

  const declaredLength = Number(request.headers.get("content-length") || "0");
  if (declaredLength > MAX_REQUEST_BYTES) {
    return applyRateHeaders(noStoreJson({ error: "Invalid request" }, { status: 413 }), rate);
  }

  try {
    const rawBody = await request.text();
    if (new TextEncoder().encode(rawBody).byteLength > MAX_REQUEST_BYTES) {
      return applyRateHeaders(noStoreJson({ error: "Invalid request" }, { status: 413 }), rate);
    }

    const parsed = createSecretSchema.safeParse(JSON.parse(rawBody));
    if (!parsed.success) {
      return applyRateHeaders(noStoreJson({ error: "Invalid request" }, { status: 400 }), rate);
    }

    const { payload, expiresIn, burnAfterReading, locale } = parsed.data;
    const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("encrypted_messages")
      .insert({
        payload,
        expires_at: expiresAt,
        burn_after_reading: burnAfterReading,
      })
      .select("id, expires_at")
      .single();

    if (error || !data) throw error ?? new Error("Insert failed");

    return applyRateHeaders(
      noStoreJson(
        {
          id: data.id,
          url: `/${locale}/open/${data.id}`,
          expiresAt: data.expires_at,
        },
        { status: 201 },
      ),
      rate,
    );
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[create-secret] Request failed", error instanceof Error ? error.message : "Unknown error");
    }
    return applyRateHeaders(noStoreJson({ error: "Unable to create secret" }, { status: 500 }), rate);
  }
}
