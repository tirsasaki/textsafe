import { describe, expect, it } from "vitest";
import { decryptMessage } from "@/lib/crypto/decrypt";
import { encryptMessage } from "@/lib/crypto/encrypt";
import { base64UrlToBytes, bytesToBase64Url } from "@/lib/crypto/encoding";

describe("browser cryptography", () => {
  it("encrypts and decrypts Unicode and emoji", async () => {
    const text = "Rahasia 日本語 🔐\nbaris kedua";
    const payload = await encryptMessage(text, "correct horse battery staple");
    await expect(decryptMessage(payload, "correct horse battery staple")).resolves.toBe(text);
  }, 30000);

  it("rejects a wrong password", async () => {
    const payload = await encryptMessage("private", "correct horse battery staple");
    await expect(decryptMessage(payload, "incorrect password")).rejects.toThrow();
  }, 30000);

  it("rejects modified ciphertext", async () => {
    const payload = await encryptMessage("private", "correct horse battery staple");
    const bytes = base64UrlToBytes(payload.ciphertext);
    bytes[0] ^= 1;
    await expect(decryptMessage({ ...payload, ciphertext: bytesToBase64Url(bytes) }, "correct horse battery staple")).rejects.toThrow();
  }, 30000);

  it("uses fresh salt and IV, producing different ciphertext", async () => {
    const first = await encryptMessage("same", "correct horse battery staple");
    const second = await encryptMessage("same", "correct horse battery staple");
    expect(first.iv).not.toBe(second.iv);
    expect(first.salt).not.toBe(second.salt);
    expect(first.ciphertext).not.toBe(second.ciphertext);
  }, 30000);

  it("rejects an empty message", async () => {
    await expect(encryptMessage("", "correct horse battery staple")).rejects.toThrow();
  });
});
