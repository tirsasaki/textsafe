import { base64UrlToBytes } from "./encoding";
import { deriveKey } from "./key-derivation";
import type { EncryptedPayload } from "./types";

export async function decryptMessage(payload: EncryptedPayload, password: string): Promise<string> {
  if (!password) throw new Error("Password is required");
  const salt = base64UrlToBytes(payload.salt);
  const iv = base64UrlToBytes(payload.iv);
  const ciphertext = base64UrlToBytes(payload.ciphertext);
  const key = await deriveKey(password, salt, payload.iterations);
  const plaintext = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ciphertext);
  return new TextDecoder("utf-8", { fatal: true }).decode(plaintext);
}
