import { NextResponse } from "next/server";
import type { RateLimitResult } from "@/lib/rate-limit";

export function noStoreJson(body: unknown, init: ResponseInit = {}) {
  const response = NextResponse.json(body, init);
  response.headers.set("Cache-Control", "no-store, max-age=0");
  return response;
}

export function applyRateHeaders(response: NextResponse, result: RateLimitResult) {
  response.headers.set("RateLimit-Limit", String(result.limit));
  response.headers.set("RateLimit-Remaining", String(result.remaining));
  response.headers.set("RateLimit-Reset", String(Math.ceil(result.resetAt / 1000)));
  return response;
}
