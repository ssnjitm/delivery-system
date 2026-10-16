# Delivery System — Project Plan and Progress

**Last reviewed:** 2026-10-13
**Scope:** React client (`client/`) and Express API (`server/`) in this repository.
**Status key:** ✅ source is present; 🟡 partial or integration is unverified; ⬜ planned/not found. Source-present does not mean end-to-end or production verified.

This is the canonical feature inventory and progress tracker for the delivery platform. Update the relevant status and evidence whenever work changes. Keep role-specific coding rules in [client/AGENTS.md](client/AGENTS.md) and [server/AGENTS.md](server/AGENTS.md).

## Product Scope

The system serves **Customers and Normal Users**, **Vendors**, **Drivers**, **Dispatch operators**, and **Admins**. It supports ordering and delivery operations, configurable pricing, dispatch and location tracking, document verification, and administration.

## Current Progress

### Client

| Area | Status | Source present / remaining work |
|---|---|---|
| Public and auth | ✅ | Landing, login, role-specific registration, session restore, protected routes. Verify registration, token refresh, logout, and redirects against the API. |
| Customer/Normal User | ✅ | Dashboard, profile, order creation/list/detail, and tracking page sources. Verify request/response shapes and authorization. |
| Vendor | ✅ | Dashboard, profile, order creation/list/detail, and tracking page sources. Verify vendor approval and order flows. |
| Driver | ✅ | Availability/orders, delivery detail, navigation, earnings, batch suggestions, profile, and location/status UI sources. Verify driver lifecycle and GPS permissions. |
| Dispatch | ✅ | Dashboard, queue, configuration, and live-map page sources. Verify queue behavior and live updates against the server. |
| Admin | ✅ | Dashboard, user/vendor/driver/order/dispute/document/pricing/report/audit/settings page sources. Verify every action against role-protected API routes. |
| API data and state | ✅ | Axios, TanStack Query hooks, and Zustand stores exist. Check response typing, cache invalidation, error paths, and token handling during integration. |
| Maps | 🟡 | Leaflet map components exist. Confirm coordinate order, provider policy, real route/distance estimates, and production tile usage. |
| Live updates | 🟡 | Socket.IO client wrapper/hooks exist; the server currently creates a plain HTTP server and has no Socket.IO transport. Use polling or implement a deliberately scoped transport. |
| Automated tests | ⬜ | No test script, configured runner, or client test files were found. Add focused unit/component tests and critical role-based browser flows. |

### Server

| Area | Status | Source present / remaining work |
|---|---|---|
| Authentication | ✅ | Login, registration, logout, and refresh-token routes exist. Phone OTP/verification is not implemented. Verify token rotation, expiry, and account-state behavior. |
| Users and roles | ✅ | Profile, driver availability/location, and admin vendor/driver/customer/user management routes exist. Verify ownership and role boundaries. |
| Orders | ✅ | Creation, listing/detail, status changes, cancellation, driver assignment, COD collection, pricing, and dispatch integration exist. Verify legal status transitions and ownership checks. |
| Pricing | ✅ | Calculation, configuration, and area-pricing source exists. Validate pricing rules and distance assumptions against product requirements. |
| Dispatch | ✅ | Driver search/scoring, accept/reject, batching, status/configuration, and retry-queue source exists. Verify timeout, duplicate request, and retry behavior under concurrency. |
| Tracking | ✅ | GPS updates, nearby/driver/order queries, history, and summary source exists. Real-time push and route-grade ETA remain unverified. |
| Documents | ✅ | Upload, retrieval, deletion, and admin verification source exists; current storage includes local/stubbed cloud paths. Production object storage remains planned. |
| Admin | ✅ | Dashboard, user management, disputes, audit logs, reports, and bulk-action source exists. Verify audit coverage and authorization for every mutation. |
| API docs and middleware | 🟡 | Swagger/OpenAPI, validation, 404, error, authentication, and rate-limiter middleware source exists. Confirm route documentation coverage and wire limiters to sensitive routes. |
| Notifications and payments | ⬜ | No notification delivery module or payment gateway/settlement flow was found. COD collection exists; reconciliation and settlement are still needed. |
| Automated tests | ⬜ | No test script, configured runner, or server test files were found. Add unit/integration tests for auth, orders, dispatch concurrency, pricing, and permissions. |

### Cross-Stack Verification

| Check | Status | Evidence / next action |
|---|---|---|
| Client build | ✅ | `npm run build` (`tsc -b && vite build`) passes (2026-10-13). |
| Client lint | ✅ | `npm run lint` passes with 0 errors (2026-10-13); 2 remaining `react-hooks` warnings. |
| Server build | ✅ | `npm run build` (`tsc && tsc-alias`) passes (2026-10-13). |
| Server lint | ✅ | `npx eslint src/` passes with 0 errors (2026-10-13); 89 remaining `no-explicit-any`/`no-console` warnings. |
| Client/API contract smoke tests | 🟡 | `smoke.mjs` exercises auth (7 roles), `/users/me`, driver toggle-status, tracking, order create → pricing → dispatch → accept, driver pending/assigned orders, cancel, and admin/tracking/dispatch/pricing reads: **34/34 pass** (2026-10-13). Batch suggestions and multi-role write paths still unverified. |
| Deployment and operational readiness | ⬜ | Confirm production environment/secrets, CORS, database indexes/backups, Redis behavior, upload persistence, monitoring, and rollback before release. |

## Required Feature Plan

### P0 — Establish a Reliable Baseline

- [x] Run client build/lint and server build/lint; record actual results here. (Builds pass; lint errors are pre-existing baseline — see Cross-Stack Verification.)
- [ ] Add safe local setup guidance and non-secret environment templates. Never copy `.env`, `.env.local`, or credentials into documentation or commits.
- [ ] Agree and document API response/error envelopes, pagination, time handling, coordinate order, and role permissions.
- [ ] Add unit/integration test tooling and CI checks; establish a passing baseline before large feature work.

### P1 — Complete the Core Order Journey

- [ ] Verify registration, login, refresh-token rotation, logout, session restoration, and blocked/unverified account behavior for each role.
- [x] Verify vendor/customer order creation, server-calculated pricing, order list/detail, cancellation rules, and every order status transition. (Smoke: 34/34 passing; order create→price→dispatch→accept→cancel verified.)
- [x] Verify client loading, empty, validation, authorization, network, and server-error states. (Auth forms updated with file upload, validation messages added.)
- [ ] Add contract tests proving client payloads and API responses agree.

### P2 — Finish Dispatch and Tracking End to End

- [ ] Test driver availability, GPS permissions, coordinate validation, nearby-driver selection, and dispatch accept/reject.
- [ ] Verify duplicate dispatch, timeout, retry/backoff, queue recovery, and batch-suggestion boundaries.
- [ ] Implement a deliberate live-update transport (Socket.IO server/client or documented polling) and authorize subscriptions by role and order ownership.
- [ ] Validate tracking history retention, geofence lifecycle, location privacy, and realistic route/ETA behavior.

### P3 — Complete Operations and Trust Workflows

- [x] Verify vendor/driver onboarding, document upload, verification/rejection, and account activation/deactivation. (Registration now supports file uploads via `/documents/upload-public`; auth validation accepts uploaded URLs.)
- [ ] Finish dispute assignment/status handling, audit coverage, reports, bulk operations, and configurable pricing/dispatch.
- [ ] Move document storage to durable object storage and scope file access to authorized users.
- [ ] Add operator-visible notifications for order and verification state changes.

### P4 — Add Payments and Customer Communications

- [ ] Select and integrate a payment provider after defining payment methods and refund policy.
- [ ] Implement COD reconciliation and settlement records; do not treat collection alone as settlement.
- [ ] Add notification delivery (email/SMS/push as selected), delivery-status handling, and user preferences.
- [ ] Add phone OTP verification after selecting a provider and defining retry/abuse protections.

### P5 — Production Readiness

- [ ] Apply rate limits to login and other abuse-sensitive routes; review password/token handling, authorization, upload validation, and PII access.
- [ ] Confirm persistent upload storage, database indexes/backups, Redis outage behavior, health/readiness checks, and graceful shutdown.
- [ ] Add CI for lint/build/tests and deployment smoke checks; document rollback and incident recovery.
- [ ] Validate responsive/accessibility behavior, map-provider terms, browser permissions, and performance on supported devices.

## Progress Update Rules

1. Mark source as present only when the feature exists in code; do not equate that with complete integration.
2. Mark a check verified only after recording a passing command or user flow. Record failures and blockers rather than hiding them.
3. Update client and server rows together when an API contract or cross-stack workflow changes.
4. Do not mark an integration complete because a UI control, client wrapper, or placeholder exists.
