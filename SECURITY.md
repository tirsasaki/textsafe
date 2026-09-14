# Security Policy

## Supported version

Security fixes are applied to the latest commit on `main`.

## Reporting a vulnerability

Please do not publish exploitable details in a public issue. Use GitHub's private vulnerability reporting feature for this repository when available. Include the affected route or component, reproduction steps using non-sensitive test data, expected impact, and a proposed mitigation if known.

Never include real plaintext, passwords, Supabase keys, Vercel tokens, secret URLs, database exports, or production logs in a report.

## Security invariants

- Plaintext and passwords remain in browser memory.
- Only versioned encrypted payloads reach the API.
- The service-role key is server-only.
- Secret pages are no-store, noindex, and do not load third-party scripts.
- Burn-after-reading retrieval is atomic at the database layer.
- Production errors do not expose database details.

## Response

Maintainers will acknowledge valid reports when practicable, investigate privately, rotate affected credentials if necessary, and publish a fix before detailed disclosure.
