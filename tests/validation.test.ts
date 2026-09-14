import { describe, expect, it } from "vitest";
import { createSecretSchema, MAX_CIPHERTEXT_CHARACTERS } from "@/lib/validation/secrets";

const valid = {
  payload: {
    version: 1,
    algorithm: "AES-256-GCM",
    kdf: "PBKDF2-SHA-256",
    iterations: 600000,
    salt: "A".repeat(22),
    iv: "B".repeat(16),
    ciphertext: "C".repeat(22),
  },
  expiresIn: 86400,
  burnAfterReading: true,
  locale: "en",
  website: "",
};

describe("encrypted request validation", () => {
  it("accepts a valid encrypted-only payload", () => expect(createSecretSchema.safeParse(valid).success).toBe(true));
  it("rejects an empty ciphertext", () => expect(createSecretSchema.safeParse({ ...valid, payload: { ...valid.payload, ciphertext: "" } }).success).toBe(false));
  it("rejects an oversized ciphertext", () => expect(createSecretSchema.safeParse({ ...valid, payload: { ...valid.payload, ciphertext: "A".repeat(MAX_CIPHERTEXT_CHARACTERS + 1) } }).success).toBe(false));
  it("rejects unknown plaintext and password fields", () => {
    expect(createSecretSchema.safeParse({ ...valid, plaintext: "leak" }).success).toBe(false);
    expect(createSecretSchema.safeParse({ ...valid, password: "leak" }).success).toBe(false);
  });
  it("rejects unsupported expiry and malformed Base64URL", () => {
    expect(createSecretSchema.safeParse({ ...valid, expiresIn: 42 }).success).toBe(false);
    expect(createSecretSchema.safeParse({ ...valid, payload: { ...valid.payload, salt: "not+base64/padding=" } }).success).toBe(false);
  });
});
