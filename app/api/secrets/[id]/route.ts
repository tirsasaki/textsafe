import { NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { idSchema, encryptedPayloadSchema } from "@/lib/validation/secrets";
import { clientIp, rateLimiter } from "@/lib/rate-limit";
import { applyRateHeaders, noStoreJson } from "@/lib/security/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: Context) {
  const rate = await rateLimiter.check(`retrieve:${clientIp(request.headers)}`, 30, 10 * 60 * 1000);
  if (!rate.allowed) return applyRateHeaders(noStoreJson({ error: "Too many requests" }, { status: 429 }), rate);

  const { id } = await context.params;
  if (!idSchema.safeParse(id).success) return applyRateHeaders(noStoreJson({ error: "Secret is unavailable" }, { status: 404 }), rate);

  try {
    const supabase = createServiceClient();
    if (request.nextUrl.searchParams.get("metadata") === "1") {
      const { data, error } = await supabase.from("encrypted_messages").select("expires_at, burn_after_reading").eq("id", id).maybeSingle();
      if (error) throw error;
      if (!data) {
        const { data: consumed, error: consumedError } = await supabase.from("consumed_message_ids").select("id").eq("id", id).gt("expires_at", new Date().toISOString()).maybeSingle();
        if (consumedError) throw consumedError;
        return applyRateHeaders(noStoreJson({ error: "Secret is unavailable", ...(consumed ? { status: "consumed" } : {}) }, { status: consumed ? 410 : 404 }), rate);
      }
      if (new Date(data.expires_at).getTime() <= Date.now()) {
        await supabase.from("encrypted_messages").delete().eq("id", id);
        return applyRateHeaders(noStoreJson({ error: "Secret is unavailable", status: "expired" }, { status: 410 }), rate);
      }
      return applyRateHeaders(noStoreJson({ expiresAt: data.expires_at, burnAfterReading: data.burn_after_reading }), rate);
    }

    const { data, error } = await supabase.rpc("retrieve_encrypted_message", { p_id: id });
    if (error) throw error;
    const result = Array.isArray(data) ? data[0] : data;
    const status = result?.result_status;
    if (status === "expired" || status === "consumed") return applyRateHeaders(noStoreJson({ error: "Secret is unavailable", status }, { status: 410 }), rate);
    if (status !== "ok") return applyRateHeaders(noStoreJson({ error: "Secret is unavailable" }, { status: 404 }), rate);

    const payload = encryptedPayloadSchema.safeParse(result.result_payload);
    if (!payload.success) throw new Error("Stored payload is invalid");
    return applyRateHeaders(noStoreJson({ payload: payload.data, expiresAt: result.result_expires_at, burnAfterReading: result.result_burn_after_reading }), rate);
  } catch (error) {
    if (process.env.NODE_ENV === "development") console.error("[retrieve-secret] Request failed", error instanceof Error ? error.message : "Unknown error");
    return applyRateHeaders(noStoreJson({ error: "Unable to retrieve secret" }, { status: 500 }), rate);
  }
}
