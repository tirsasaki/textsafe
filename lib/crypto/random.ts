import { bytesToBase64Url } from "./encoding";

export function randomBytes(length: number): Uint8Array<ArrayBuffer> {
  if (!globalThis.crypto?.getRandomValues) throw new Error("Secure randomness is unavailable");
  return globalThis.crypto.getRandomValues(new Uint8Array(length));
}

export function generatePassword(bytes = 24): string {
  return bytesToBase64Url(randomBytes(bytes));
}
