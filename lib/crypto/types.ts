export type EncryptedPayload = {
  version: 1;
  algorithm: "AES-256-GCM";
  kdf: "PBKDF2-SHA-256";
  iterations: 600000;
  salt: string;
  iv: string;
  ciphertext: string;
};
