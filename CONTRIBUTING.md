# Contributing

1. Open an issue describing the change and its security implications.
2. Create a focused branch and never commit real credentials or secret-message URLs.
3. Keep interface text in both `messages/en.json` and `messages/id.json`.
4. Preserve the client-only boundary for plaintext, passwords, encryption, and decryption.
5. Run `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build`.
6. Use a separate Supabase project for integration tests.

Changes to cryptographic parameters, payload format, retrieval RPC, CSP, logging, or secret-page caching require explicit security review.
