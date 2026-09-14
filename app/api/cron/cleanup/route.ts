import { timingSafeEqual } from "node:crypto";
import { NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { noStoreJson } from "@/lib/security/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function authorized(header: string | null, secret: string | undefined): boolean {
  if (!header || !secret) return false;
  const expected = Buffer.from(`Bearer ${secret}`);
  const actual = Buffer.from(header);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export async function GET(request: NextRequest) {
  if (!authorized(request.headers.get("authorization"), process.env.CRON_SECRET)) {
    return noStoreJson({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase.rpc("cleanup_expired_messages");
    if (error) throw error;
    return noStoreJson({ ok: true, removed: data ?? 0 });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[cleanup] Cleanup failed", error instanceof Error ? error.message : "Unknown error");
    }
    return noStoreJson({ error: "Cleanup failed" }, { status: 500 });
  }
}
