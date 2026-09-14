import { createClient } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";

const url = process.env.TEST_SUPABASE_URL;
const key = process.env.TEST_SUPABASE_SERVICE_ROLE_KEY;
const enabled = Boolean(url && key);
const integration = enabled ? describe : describe.skip;

integration("Supabase retrieval semantics", () => {
  const client = createClient(url!, key!, { auth: { persistSession: false } });
  const payload = { version: 1, algorithm: "AES-256-GCM", kdf: "PBKDF2-SHA-256", iterations: 600000, salt: "A".repeat(22), iv: "B".repeat(16), ciphertext: "C".repeat(22) };

  it("allows only one concurrent burn retrieval", async () => {
    const { data, error } = await client.from("encrypted_messages").insert({ payload, expires_at: new Date(Date.now() + 60000).toISOString(), burn_after_reading: true }).select("id").single();
    expect(error).toBeNull();
    const [first, second] = await Promise.all([
      client.rpc("retrieve_encrypted_message", { p_id: data!.id }),
      client.rpc("retrieve_encrypted_message", { p_id: data!.id }),
    ]);
    const statuses = [first.data?.[0]?.result_status, second.data?.[0]?.result_status];
    expect(statuses.filter((status) => status === "ok")).toHaveLength(1);
    expect(statuses.filter((status) => status === "consumed")).toHaveLength(1);
  });

  it("rejects and deletes expired messages", async () => {
    const { data } = await client.from("encrypted_messages").insert({ payload, expires_at: new Date(Date.now() + 1000).toISOString(), burn_after_reading: false }).select("id").single();
    await new Promise((resolve) => setTimeout(resolve, 1100));
    const result = await client.rpc("retrieve_encrypted_message", { p_id: data!.id });
    expect(result.data?.[0]?.result_status).toBe("expired");
  });
});
