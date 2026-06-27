# Task: Export security analysis to vuln.md

Copy the full vulnerability analysis below into `vuln.md` at project root.

---

# Security Vulnerability Analysis — Hyperlocal / Safar

## Context

Full read-only audit of the Next.js 16 + better-auth + Prisma/PostgreSQL admin system. Three audit passes (auth/authz, data layer, injection/config) plus manual verification of the highest-impact items. Findings below are ranked by severity with file:line. Remediation plan at the end — approving this plan authorizes the fixes.

> Verified manually: `.env` is **not** git-tracked and not in git history (gitignored) — the "committed secrets" claim is FALSE and excluded. Server-action and validation-route gaps confirmed by direct read.

---

## CRITICAL

### C1 — Privilege escalation: self-register as admin (`lib/auth.ts:17-21`)

```ts
role: { type: "string", defaultValue: "user", input: true }
```

`input: true` lets the client set `role` in the better-auth sign-up payload. The register form hardcodes `"user"`, but an attacker bypasses the form and POSTs directly to `/api/auth/sign-up/email` with `role: "admin"` → instant admin. This defeats every middleware/role check in the app.
**Impact:** Total system compromise. **Fix:** `input: false` (set role server-side only).

### C2 — `/api/validations` + `/api/validations/[id]` fully unauthenticated

- `app/api/validations/route.ts` — GET lists all validations, POST creates (no auth).
- `app/api/validations/[id]/route.ts:85` PATCH — gets session but `validatorId = session?.user?.id || null`; proceeds with `null`. **Anyone can approve/reject halal certifications and destinations.**
- `app/api/validations/[id]/route.ts:221` DELETE — no auth at all.

These routes are excluded from middleware (see H3), so there is zero gate. **Impact:** Anyone can forge/approve/delete the core halal-certification records — the product's trust anchor. **Fix:** require session + `role === "admin"`.

### C3 — Unauthenticated admin + AI endpoints (cost abuse, data exposure, prompt injection)

No auth check on:

- `app/api/admin/ai-test/route.ts:24` — calls Groq LLM, billable.
- `app/api/admin/analytics/gap-analysis/route.ts:68` — exposes admin analytics.
- `app/api/admin/coverage-areas/route.ts` GET + `[id]/route.ts` PUT — read/write coverage areas, no zod on PUT body.
- `app/api/explore/route.ts:129` — Gemini call, user `q` injected into system prompt (line ~250).
- `app/api/assistant/route-finder/route.ts:131` — Groq call, user `query` into prompt.
- `app/api/recommendations/route.ts:70` — Gemini call.
  **Impact:** Unmetered LLM spend on your keys, prompt injection, admin data leak. **Fix:** auth+role on `/api/admin/*`; auth + rate limit on public AI routes.

### C4 — Server actions have no auth/role guard (`lib/actions/*`)

Verified `createDestination` (`destination-actions.ts:21`) validates with zod but never checks session/role. Same pattern in `updateDestination:96`, `deleteDestination:189`, `umkm-actions.ts` (11/33/55), `category-actions.ts` (10/38/67). They rely entirely on `proxy.ts` middleware gating the page. Server actions are POST-invocable and should never trust the surrounding route for authz.
**Impact:** Create/modify/delete destinations, UMKMs, categories without admin rights. **Fix:** `requireAdmin()` at the top of every mutating action.

---

## HIGH

### H1 — Broken object/role authz on analytics (`app/api/admin/analytics/trends/route.ts:30`, `analytics/route.ts:17`)

Checks `!session?.user.id` only — any logged-in non-admin user passes. Should be `session.user.role === "admin"`.

### H2 — No rate limiting anywhere

`express-rate-limit` is in the lockfile but unused. No throttle on auth (brute force), AI endpoints (cost), or `/api/upload` (spam). **Fix:** rate-limit auth, AI, upload at minimum.

### H3 — All `/api/*` excluded from middleware (`proxy.ts:13` and matcher `:64`)

```ts
matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"];
```

Every API route must self-guard — and many (C2/C3) don't. This is the structural reason the gaps exist. **Fix:** either include `/api/(admin|validations)` in the matcher, or (better) enforce per-route guards via the shared helper.

---

## MEDIUM

- **M1 — No security headers** (`next.config.ts`): missing CSP, X-Frame-Options, HSTS, X-Content-Type-Options. Add a `headers()` block.
- **M2 — `trustedProxyHeaders: true`** (`lib/auth.ts:29`): trusts `X-Forwarded-*`. Safe only behind a trusted proxy; on direct exposure enables IP/host spoofing. Confirm deployment topology.
- **M3 — Stored-content XSS surface** (`components/editor/rich-text-renderer.tsx:53`): `dangerouslySetInnerHTML` over tiptap `generateHTML()` from DB JSON. Admin-authored (lower risk) but unsanitized; sanitize output (e.g. DOMPurify) or trust boundary doc.
- **M4 — Prompt injection** (AI routes): user text concatenated into system prompts. Separate user/system roles; constrain output use.
- **M5 — Verbose error logging** (`analytics/route.ts:38` `console.log(error)`, validation routes): full error objects to console may leak internals. Log messages, not raw objects, in prod.

## Positives (no action)

`.env` correctly gitignored & absent from history · `/api/upload` validates mime/size/folder · image `remotePatterns` restricted (no `**`) · services explicitly map fields (no `...body` mass assignment) · Prisma parameterized (no SQLi) · bcrypt password hashing via better-auth.

---

## Remediation Plan (on approval)

**P0 — stop the bleeding**

1. `lib/auth.ts`: `role.input` → `false`.
2. New `lib/auth-guard.ts`: `requireAdmin()` / `requireSession()` returning `{ session }` or throwing a 401/403 helper for routes, plus an action variant returning the `{ error }` shape actions already use.
3. Add the guard to: all `/api/validations/**`, all `/api/admin/**`, and the AI routes (`explore`, `assistant/route-finder`, `recommendations` — session OR public+ratelimit, your call per route).
4. Add `requireAdmin()` to every mutating server action in `lib/actions/*`.

**P1 — hardening** 5. Fix role checks in `analytics/route.ts` + `analytics/trends/route.ts`. 6. Rate limiting (auth, AI, upload) — lightweight in-memory/Upstash limiter. 7. Security headers in `next.config.ts`.

**P2 — depth** 8. Zod on `coverage-areas` PUT; sanitize rich-text render; split AI prompt roles; scrub prod error logs; confirm `trustedProxyHeaders` topology.

## Verification

- Attempt `POST /api/auth/sign-up/email` with `role:"admin"` → role must persist as `"user"`.
- `PATCH /api/validations/<id>` unauthenticated → 401; as non-admin → 403; as admin → 200.
- Call a mutating server action while logged out / as non-admin → rejected.
- Unauthenticated GET on each `/api/admin/*` → 401.
- Hammer an AI endpoint → throttled after N requests.
- Response headers include CSP / X-Frame-Options / X-Content-Type-Options.
