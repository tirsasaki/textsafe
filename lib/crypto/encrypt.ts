import { bytesToBase64Url } from "./encoding";
import { deriveKey, PBKDF2_ITERATIONS } from "./key-derivation";
import { randomBytes } from "./random";
import type { EncryptedPayload } from "./types";

export async function encryptMessage(message: string, password: string): Promise<EncryptedPayload> {
  if (!message) throw new Error("Message is required");
  if (!password) throw new Error("Password is required");

  const salt = randomBytes(16);
  const iv = randomBytes(12);
  const key = await deriveKey(password, salt);
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    new TextEncoder().encode(message),
  );

  return {
    version: 1,
    algorithm: "AES-256-GCM",
    kdf: "PBKDF2-SHA-256",
    iterations: PBKDF2_ITERATIONS,
    salt: bytesToBase64Url(salt),
    iv: bytesToBase64Url(iv),
    ciphertext: bytesToBase64Url(new Uint8Array(ciphertext)),
  };
}
