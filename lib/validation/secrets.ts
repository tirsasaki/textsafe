import { z } from "zod";

export const MAX_MESSAGE_CHARACTERS = 20000;
export const MAX_CIPHERTEXT_CHARACTERS = 110000;
export const MAX_REQUEST_BYTES = 140000;
export const allowedExpirations = [600, 3600, 86400, 259200, 604800] as const;
const base64Url = /^[A-Za-z0-9_-]+$/;

export const encryptedPayloadSchema = z
  .object({
    version: z.literal(1),
    algorithm: z.literal("AES-256-GCM"),
    kdf: z.literal("PBKDF2-SHA-256"),
    iterations: z.literal(600000),
    salt: z.string().regex(base64Url).min(22).max(64),
    iv: z.string().regex(base64Url).min(16).max(24),
    ciphertext: z.string().regex(base64Url).min(22).max(MAX_CIPHERTEXT_CHARACTERS),
  })
  .strict();

export const createSecretSchema = z
  .object({
    payload: encryptedPayloadSchema,
    expiresIn: z.number().int().refine((value) => allowedExpirations.includes(value as (typeof allowedExpirations)[number])),
    burnAfterReading: z.boolean(),
    locale: z.enum(["en", "id"]).default("en"),
    website: z.string().max(0).optional(),
  })
  .strict()
  .refine((value) => JSON.stringify(value).length <= MAX_REQUEST_BYTES);

export const idSchema = z.uuid();
export type CreateSecretInput = z.infer<typeof createSecretSchema>;
