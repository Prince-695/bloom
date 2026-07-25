# Bloom Architecture Migration Plan

**Project:** Bloom — a terminal-first AI coding agent
**Goal:** Move off Clerk (auth) and Polar (billing), and reorganize the codebase into a cleaner, more scalable structure that can support a real agent runtime.
**Audience:** This document is written in plain language on purpose. You should be able to hand any section to yourself (or an AI coding assistant) and know exactly what to do.

---

## Table of Contents

1. Executive Summary
2. Current Architecture
3. Proposed Architecture
4. Migration Roadmap
5. Authentication Migration (Clerk → Better Auth)
6. Billing Migration (Polar → Stripe)
7. Database Changes
8. Manual Work Checklist
9. AI-Generated Work Checklist
10. File-Level Migration Plan
11. Dependencies
12. Environment Variables
13. Risk Assessment
14. Timeline
15. Future Improvements

---

## 1. Executive Summary

Bloom currently depends on two outside companies for two of its most important systems: **Clerk** handles who is allowed to log in, and **Polar** handles who is allowed to pay and use credits. Both of these are "black boxes" — you don't control them, you can't fully customize them, and if they change their pricing, shut down a feature, or have an outage, Bloom is affected directly.

This migration replaces:

- **Clerk → Better Auth**: Better Auth is a library (not a hosted service) that runs inside your own server. You own the code, the database tables, and the logic. You get full control over the sign-in screen, sessions, and OAuth.
- **Polar → Stripe**: Stripe is the industry standard for payments. It gives you Checkout, a Customer Portal, and reliable Webhooks, and it is very well documented, which matters a lot for long-term maintenance.

At the same time, this is a good moment to clean up the project structure. Right now almost everything server-side is dumped into a single `lib/` folder. That works fine when a project is small, but Bloom is growing into a full AI agent with tools, skills, memory, and multiple AI providers — so this plan also introduces a proper **feature-based** folder structure and a dedicated **runtime layer** for the agent itself.

**Why this benefits Bloom:**

- **Control** — no more depending on Clerk's or Polar's roadmap, pricing, or outages.
- **Cost** — Stripe and Better Auth are generally cheaper at scale than Clerk + Polar combined.
- **Flexibility** — a fully custom auth UI that matches Bloom's terminal-first branding, instead of an embedded third-party widget.
- **Scalability** — a folder structure that can grow into teams, organizations, and a plugin ecosystem without another rewrite.
- **Simplicity for future AI work** — a predictable structure means an AI coding assistant (or a new engineer) can find any file in seconds.

This is not a rewrite of Bloom's product. The chat experience, the AI providers, and the CLI itself stay conceptually the same. What changes is *how identity, money, and code organization* work underneath.

---

## 2. Current Architecture

### 2.1 What Bloom looks like today

```
.
├── packages
│   ├── cli
│   │   ├── src
│   │   │   ├── components
│   │   │   ├── hooks
│   │   │   ├── layouts
│   │   │   ├── lib
│   │   │   │   ├── api-client.ts
│   │   │   │   ├── auth.ts
│   │   │   │   ├── oauth.ts
│   │   │   │   ├── upgrade.ts
│   │   │   │   └── ...
│   │   │   ├── providers
│   │   │   ├── screens
│   │   │   └── theme.ts
│   │   └── ...
│   │
│   ├── server
│   │   ├── src
│   │   │   ├── routes
│   │   │   │   ├── auth.ts
│   │   │   │   ├── billing.ts
│   │   │   │   ├── chat.ts
│   │   │   │   └── sessions.ts
│   │   │   ├── middleware
│   │   │   │   ├── require-auth.ts
│   │   │   │   └── require-credits-balance.ts
│   │   │   ├── lib
│   │   │   │   ├── auth.ts
│   │   │   │   ├── credits.ts
│   │   │   │   ├── models.ts
│   │   │   │   └── polar.ts
│   │   │   ├── tools
│   │   │   ├── system-prompt.ts
│   │   │   └── index.ts
│   │   └── ...
│   │
│   ├── database
│   │   ├── prisma
│   │   ├── generated
│   │   └── src
│   │
│   └── shared
│       ├── schemas.ts
│       ├── models.ts
│       └── index.ts
```

### 2.2 Strengths of the current setup

- **Bun + TypeScript monorepo** is fast and modern, and this is a good foundation — it does not need to change.
- **Clean separation between `cli`, `server`, `database`, and `shared`** already exists at the top level. This plan keeps that idea and just makes each package more organized internally.
- **Clerk and Polar got Bloom to market quickly.** Using hosted services in the early days was the right call — it let you focus on the AI agent instead of building auth and billing from scratch.
- **Prisma + PostgreSQL** is a solid, well-supported combination and stays as-is.
- **AI SDK with multiple providers (Google, Anthropic, OpenAI)** already shows the right instinct: Bloom is provider-agnostic, which this plan builds on.

### 2.3 Weaknesses of the current setup

- **Everything server-side lives in `lib/`.** Auth code, billing code, and generic helpers all sit in the same flat folder. As Bloom grows, this becomes a dumping ground that's hard to navigate.
- **Clerk owns your sign-in UI.** You cannot fully control branding, and you are limited to what Clerk's SDK exposes. It also brings in a lot of client-side JavaScript weight for something meant to be terminal-first.
- **Polar is a smaller, newer platform** compared to Stripe. It has less documentation, a smaller community, and fewer battle-tested integrations, which raises long-term risk.
- **No dedicated "runtime" layer.** Right now, tools, the system prompt, and agent logic sit loosely inside `server/src`. As Bloom becomes a more capable agent (with skills, memory, MCP support, etc.), this will get messy fast without a clear boundary.
- **Billing and credits logic is tightly coupled** to Polar's specific API shape (see `server/lib/polar.ts`), which makes swapping providers or adding new billing features harder than it should be.
- **No clear "integrations" concept.** Third-party services (Stripe, Better Auth, Google, GitHub, SMTP email, Sentry) aren't grouped together, so it's not obvious at a glance what outside systems Bloom depends on.

### 2.4 Why migrate now

Bloom is still small enough that this migration is manageable in a few weeks, not months. The longer you wait, the more code gets built on top of Clerk and Polar, and the more expensive this migration becomes later. Doing it now — before teams, organizations, or a plugin marketplace exist — means you only have to migrate the auth and billing surface, not everything built on top of it.

---

## 3. Proposed Architecture

### 3.1 Full new project tree

```
bloom/
├── packages/
│   │
│   ├── cli/
│   │   ├── src/
│   │   │   ├── components/          # Reusable terminal UI pieces (OpenTUI)
│   │   │   ├── hooks/                # React hooks for the TUI
│   │   │   ├── layouts/              # Screen layout shells
│   │   │   ├── screens/              # Full screens (login, chat, settings, upgrade)
│   │   │   ├── providers/            # React context providers
│   │   │   ├── auth/
│   │   │   │   ├── device-flow.ts    # CLI device-code OAuth flow
│   │   │   │   ├── token-storage.ts  # Secure local token storage
│   │   │   │   └── session.ts        # Local session state + refresh
│   │   │   ├── api/
│   │   │   │   ├── client.ts         # Typed HTTP client to the server
│   │   │   │   └── billing-client.ts # Calls to billing endpoints
│   │   │   ├── theme.ts
│   │   │   └── index.tsx
│   │   └── package.json
│   │
│   ├── server/
│   │   ├── src/
│   │   │   ├── features/             # One folder per business capability
│   │   │   │   ├── auth/
│   │   │   │   │   ├── routes.ts
│   │   │   │   │   ├── oauth/
│   │   │   │   │   ├── session/
│   │   │   │   │   ├── providers/    # google.ts, github.ts, email-otp.ts
│   │   │   │   │   └── middleware/
│   │   │   │   ├── billing/
│   │   │   │   │   ├── checkout/
│   │   │   │   │   ├── portal/
│   │   │   │   │   ├── subscriptions/
│   │   │   │   │   ├── webhooks/
│   │   │   │   │   └── prices/
│   │   │   │   ├── chat/
│   │   │   │   │   └── routes.ts
│   │   │   │   └── sessions/
│   │   │   │       └── routes.ts
│   │   │   │
│   │   │   ├── integrations/         # Thin wrappers around outside services
│   │   │   │   ├── stripe/
│   │   │   │   ├── better-auth/
│   │   │   │   ├── google/
│   │   │   │   ├── github/
│   │   │   │   ├── email/
│   │   │   │   └── sentry/
│   │   │   │
│   │   │   ├── middleware/           # Cross-cutting HTTP middleware
│   │   │   │   ├── require-auth.ts
│   │   │   │   ├── require-credits-balance.ts
│   │   │   │   ├── error-handler.ts
│   │   │   │   └── rate-limit.ts
│   │   │   │
│   │   │   ├── runtime/              # The AI agent's "brain" — framework-agnostic
│   │   │   │   ├── agent/            # Orchestration loop
│   │   │   │   ├── tools/            # Tool definitions + execution
│   │   │   │   ├── skills/           # Reusable skill modules
│   │   │   │   ├── prompt/           # System prompt assembly
│   │   │   │   ├── events/           # Internal event bus
│   │   │   │   ├── context/          # Context window management
│   │   │   │   ├── memory/           # Long-term / session memory
│   │   │   │   ├── mcp/              # Model Context Protocol client
│   │   │   │   ├── git/              # Git operations
│   │   │   │   ├── terminal/         # Shell execution sandboxing
│   │   │   │   ├── filesystem/       # File read/write/search
│   │   │   │   └── search/           # Code / web search
│   │   │   │
│   │   │   ├── providers/            # AI model providers
│   │   │   │   ├── openai/
│   │   │   │   ├── anthropic/
│   │   │   │   ├── google/
│   │   │   │   └── registry/         # Central place that picks a provider by name
│   │   │   │
│   │   │   ├── lib/                  # Only truly generic, feature-less helpers
│   │   │   │   ├── logger.ts
│   │   │   │   └── result.ts
│   │   │   │
│   │   │   └── index.ts              # Server entrypoint (Hono app)
│   │   └── package.json
│   │
│   ├── db/
│   │   ├── prisma/
│   │   │   └── schema.prisma
│   │   ├── generated/
│   │   └── src/
│   │       └── client.ts             # Exported Prisma client singleton
│   │
│   └── shared/
│       ├── schemas.ts                # Zod schemas shared by cli + server
│       ├── models.ts                 # Shared TypeScript types
│       ├── constants.ts
│       └── index.ts
│
├── .env.example
├── package.json
├── bunfig.toml
└── turbo.json
```

### 3.2 What changed and why

| Old | New | Why |
|---|---|---|
| `server/src/routes/*.ts` (flat) | `server/src/features/*/routes.ts` (grouped) | Each feature (auth, billing, chat) now owns its own folder with everything it needs — routes, sub-logic, and tests all live together. You never have to jump across four folders to understand one feature. |
| `server/src/lib/` (catch-all) | `server/src/integrations/`, `server/src/lib/` (tiny) | Third-party service code (Stripe, Better Auth, SMTP email, Sentry) is now clearly separated from truly generic helpers. If you ever swap Stripe for something else, you know exactly which folder to replace. |
| No runtime layer | `server/src/runtime/` | This is the most important structural change. It gives the AI agent itself (tools, skills, memory, context, MCP) a home that is completely independent of HTTP routes. This means the agent could theoretically run outside the server one day (e.g., embedded in the CLI directly, or as a background worker) without a rewrite. |
| `database/` | `db/` | Just a shorter, more conventional name. Purely cosmetic — do this only if you want to; it's optional. |
| Scattered AI provider code | `server/src/providers/` with a `registry/` | A single place to add a new AI provider (e.g., a future "Mistral" or "xAI") without touching business logic. The registry pattern means the rest of the app just asks "give me a model" and doesn't care which company built it. |

### 3.3 Explanation of every top-level directory

- **`packages/cli`** — Everything the user sees and types into. The terminal UI, local auth handling (device flow), and API calls to the server.
- **`packages/server`** — The brain's home base. Handles HTTP requests, authentication, billing, and hosts the agent runtime.
- **`packages/db`** — Owns the database schema and the Prisma client. No business logic lives here — just schema and a way to connect.
- **`packages/shared`** — Types and validation schemas (Zod) that both the CLI and server need, so they never drift out of sync (e.g., the shape of a "chat message" is defined once).

### 3.4 Explanation of every server subfolder

- **`features/`** — "What can a user do?" Each folder answers one part of that question: log in, pay, chat, manage sessions.
- **`integrations/`** — "What outside companies do we depend on?" Each folder wraps one vendor's SDK so the rest of the app never imports Stripe's SDK directly — it imports your own `integrations/stripe` wrapper instead. This means if Stripe changes their SDK, you only update one folder.
- **`middleware/`** — "What runs on every request, or many requests?" Auth checks, credit checks, error handling, rate limiting.
- **`runtime/`** — "How does the AI agent actually think and act?" This is Bloom's core IP. Explained in detail in section 3.5 below.
- **`providers/`** — "Which AI model do we talk to?" A clean abstraction so switching between OpenAI, Anthropic, and Google is a config change, not a code change.
- **`lib/`** — "Boring, generic code with no opinions." A logger, a `Result<T, E>` type helper, etc. If a file in here starts needing to know about Stripe or Better Auth, it belongs in `integrations/` instead.

### 3.5 The Runtime Layer, explained simply

Think of the runtime layer as Bloom's "engine," completely separate from the "car body" (the CLI) and the "dashboard" (the server routes). Here's what each piece does, in plain terms:

- **`agent/`** — The main loop. Takes a user's message, decides what to do (think, call a tool, respond), and repeats until done.
- **`tools/`** — Individual actions the agent can take (e.g., "read a file," "run a shell command," "search the web"). Each tool has a name, a description, and a function.
- **`skills/`** — Bigger, reusable "recipes" built out of tools — e.g., a "fix failing tests" skill might use the terminal tool, the filesystem tool, and the git tool together.
- **`prompt/`** — Builds the system prompt sent to the AI model, pulling in the right instructions, tools, and context for the current task.
- **`events/`** — An internal event bus so different parts of the runtime can react to things happening (e.g., "a tool just finished running") without being directly wired together.
- **`context/`** — Manages what fits in the AI model's context window — trimming, summarizing, and prioritizing information.
- **`memory/`** — Anything that needs to persist across sessions (project notes, past decisions, user preferences).
- **`mcp/`** — Support for the Model Context Protocol, so Bloom can connect to external tool servers built by others.
- **`git/`, `terminal/`, `filesystem/`, `search/`** — Low-level building blocks that tools are made from. Keeping these separate from `tools/` means the same building blocks can be reused across multiple tools and skills.

**Why keep the runtime independent of the CLI:** today, the runtime effectively only exists to serve the CLI. But if you ever want to run Bloom as a background service, a web app, a GitHub Action, or a Slack bot, the runtime should not need to know or care. It should just be a library that takes a task and returns a result.

---

## 4. Migration Roadmap

This migration is broken into 7 phases. Do them roughly in order — each phase is designed to leave the app in a working state, so you're never stuck mid-migration with something broken in production.

### Phase 1 — Foundation & Folder Restructure

- **Goal:** Reorganize the codebase into the new structure *before* touching auth or billing logic, so the actual migration work happens in a clean, understandable layout.
- **Deliverables:** New folder structure created; existing Clerk/Polar code moved (not rewritten yet) into the new `features/auth` and `features/billing` locations; all imports updated; app still builds and runs exactly as before.
- **Risks:** Import path mistakes breaking the build. Mitigate by moving one package at a time and running the build after each move.
- **Dependencies:** None — this can start immediately.
- **Completion Criteria:** App builds, all existing tests pass (if any exist), and the app behaves identically to before — Clerk and Polar still work, just in new folder locations.

### Phase 2 — Database Schema Update

- **Goal:** Add all new tables needed for Better Auth and Stripe, without removing old tables yet.
- **Deliverables:** Updated `schema.prisma` with new tables (see Section 7); migration applied to a staging database; both old (Clerk-linked) and new tables exist side by side temporarily.
- **Risks:** Migrating a live production database. Mitigate by testing the migration on a copy of production data first.
- **Dependencies:** Phase 1 complete.
- **Completion Criteria:** New tables exist in staging and production; no data loss; old tables untouched and still functional.

### Phase 3 — Authentication Migration

- **Goal:** Fully replace Clerk with Better Auth.
- **Deliverables:** Better Auth installed and configured; custom sign-in/sign-up UI built in the CLI; Google, GitHub, and Email OTP working; session management working; all Clerk code removed.
- **Risks:** Users get logged out during the cutover; OAuth callback URLs misconfigured. Mitigate with a maintenance window and by testing OAuth against a staging environment with real (but non-production) OAuth apps first.
- **Dependencies:** Phase 2 complete.
- **Completion Criteria:** No Clerk package remains in `package.json`; every auth flow (sign in, sign up, logout, OAuth, session refresh) works end-to-end in staging.

### Phase 4 — Billing Migration

- **Goal:** Fully replace Polar with Stripe.
- **Deliverables:** Stripe Checkout, Customer Portal, and Webhooks integrated; subscription and credits syncing working; all Polar code removed.
- **Risks:** Existing paying customers losing access or being double-charged during cutover. Mitigate by migrating customer records to Stripe *before* cutting traffic over, and by reconciling subscription status carefully (see Section 13).
- **Dependencies:** Phase 3 complete (billing routes are protected by the new auth system).
- **Completion Criteria:** No Polar package remains in `package.json`; a test purchase, upgrade, downgrade, and cancellation all work end-to-end in Stripe test mode.

### Phase 5 — Runtime Layer Introduction

- **Goal:** Move existing tools/system-prompt code into the new `runtime/` structure without changing behavior.
- **Deliverables:** `runtime/agent`, `runtime/tools`, `runtime/prompt` populated with existing logic, reorganized; no new features added yet.
- **Risks:** Subtle behavior changes if logic is refactored, not just moved. Mitigate by moving code with minimal changes first, refactoring later.
- **Dependencies:** Phase 1 complete (can run in parallel with Phases 2–4 if you have the bandwidth).
- **Completion Criteria:** Agent behaves identically to before; all existing tools still work.

### Phase 6 — Cleanup & Hardening

- **Goal:** Remove all dead code, old environment variables, and unused dependencies.
- **Deliverables:** `polar.ts`, Clerk middleware, and any leftover references fully deleted; `.env.example` updated; dependency list cleaned up (see Section 11).
- **Risks:** Low — this is mostly deletion. Main risk is deleting something still in use; mitigate by searching the whole codebase for references before deleting.
- **Dependencies:** Phases 3 and 4 complete.
- **Completion Criteria:** No references to Clerk or Polar anywhere in the codebase (search confirms zero matches); no unused dependencies in `package.json`.

### Phase 7 — Production Cutover

- **Goal:** Switch production traffic over safely.
- **Deliverables:** Production environment variables set; production OAuth apps and Stripe products configured; monitoring in place; rollback plan documented and tested.
- **Risks:** Real users, real money — this is the highest-risk phase. Mitigate with a maintenance window, a tested rollback plan, and close monitoring for the first 48 hours.
- **Dependencies:** All previous phases complete and verified in staging.
- **Completion Criteria:** Production is fully on Better Auth + Stripe; Clerk and Polar accounts can be safely canceled after a short observation period (recommend waiting 2–4 weeks before canceling, in case you need to check historical data).

---

## 5. Authentication Migration

### 5.1 What's changing, in plain terms

Right now, when someone signs in to Bloom, Clerk handles the entire process — showing the login screen, checking passwords, managing OAuth with Google, and remembering who's logged in. Bloom's own code just asks Clerk "is this person logged in?" and trusts the answer.

After this migration, Bloom will handle all of that itself using **Better Auth**, a library that runs inside your own server and stores its own data in your own database. Nothing about identity will depend on an outside company anymore.

### 5.2 Database changes

New tables are needed to store what Clerk used to store for you (see full schema in Section 7):

- A `User` table (you likely already have one — it gets new fields).
- A `Session` table — tracks active logins, replacing Clerk's session tokens.
- An `Account` table — stores OAuth connections (Google, GitHub) linked to a user.
- A `Verification` table — stores email OTP codes and email verification tokens.

### 5.3 Session changes

- Clerk currently issues its own session tokens, checked via Clerk's SDK.
- Better Auth issues its own session tokens (cookie-based for the web, and a portable token for the CLI's device-flow).
- **Remember Me** is handled by adjusting the session's expiration length at login time — a longer-lived session token when the user opts in.
- **Refresh Sessions** — Better Auth automatically extends valid sessions on activity; no separate refresh endpoint needed for the typical case, but a manual "refresh" endpoint is added for the CLI to explicitly re-check its token validity on startup.

### 5.4 OAuth changes

- Google OAuth and GitHub OAuth move from Clerk's managed OAuth apps to **your own** OAuth apps registered directly with Google and GitHub (this is manual work — see Section 8).
- Callback URLs change from Clerk's domain to your own server's domain (e.g., `https://api.bloom.dev/auth/callback/google`).
- The CLI uses a **device authorization flow**: it opens a browser to your server's OAuth start URL, the user completes login in the browser, and the CLI polls for a token — this replaces Clerk's CLI SDK helpers.

### 5.5 Middleware changes

- `require-auth.ts` is rewritten to check a Better Auth session instead of asking Clerk's SDK.
- All Clerk-specific middleware is deleted entirely.

### 5.6 API changes

- Every route that previously used Clerk's `auth()` helper to get the current user now reads the user from Better Auth's session instead. The *shape* of "who is the current user" passed around the app stays the same, so downstream code (billing, chat, etc.) barely changes.

### 5.7 CLI changes

- `cli/src/lib/auth.ts` and `cli/src/lib/oauth.ts` are rewritten to talk to Better Auth's endpoints instead of Clerk's.
- Token storage on disk stays conceptually the same (a token saved locally), just pointed at a different auth system.
- The login screen UI is rebuilt from scratch (previously partially provided by Clerk's SDK) as a fully custom Bloom-branded terminal screen.

### 5.8 Files to modify

| File | Change |
|---|---|
| `server/src/lib/auth.ts` | Rewrite to configure and export Better Auth instance |
| `server/src/middleware/require-auth.ts` | Rewrite to check Better Auth session |
| `server/src/routes/auth.ts` → `server/src/features/auth/routes.ts` | Rewrite endpoints (sign in, sign up, logout, OAuth start/callback, OTP) |
| `cli/src/lib/auth.ts` | Rewrite to call new Better Auth endpoints |
| `cli/src/lib/oauth.ts` | Rewrite for device-flow OAuth against your own server |
| `cli/src/lib/api-client.ts` | Update auth header/token handling |
| `database/prisma/schema.prisma` | Add `Session`, `Account`, `Verification` models; extend `User` |

### 5.9 Files to delete

- Any Clerk webhook handler file
- Any Clerk-specific middleware file
- Any file that imports `@clerk/*` packages

### 5.10 Files to create

- `server/src/integrations/better-auth/config.ts` — Better Auth setup and configuration
- `server/src/integrations/better-auth/adapter.ts` — Prisma adapter wiring
- `server/src/features/auth/providers/google.ts`
- `server/src/features/auth/providers/github.ts`
- `server/src/features/auth/providers/email-otp.ts`
- `server/src/features/auth/session/index.ts`
- `cli/src/auth/device-flow.ts`
- `cli/src/screens/SignIn.tsx`, `cli/src/screens/SignUp.tsx` (custom UI screens)

---

## 6. Billing Migration

### 6.1 What's changing, in plain terms

Polar currently handles subscriptions, payment collection, and (presumably) credit tracking for Bloom. Stripe will now do the payment collection and subscription tracking, while Bloom's own database remains the source of truth for **credits** (since credits are a Bloom-specific concept Stripe doesn't know about).

### 6.2 Stripe Checkout

- Used for new subscriptions (monthly and annual). The CLI opens a browser to a Stripe-hosted Checkout page; after payment, Stripe redirects back and your server confirms the subscription via webhook.

### 6.3 Stripe Customer Portal

- Used for anything a customer needs to self-manage: updating a card, viewing invoices, canceling, or resuming a subscription. Instead of building all of this yourself, Stripe hosts a pre-built portal page you simply link to.

### 6.4 Stripe Webhooks

- Stripe sends your server events whenever something billing-related happens (payment succeeded, subscription updated, subscription canceled, etc.). Your server listens for these events and updates its own database accordingly. This webhook is the **single source of truth** for subscription state — never trust the frontend alone to say "I'm subscribed now."

Key events to handle:

- `checkout.session.completed` — a new subscription was purchased
- `customer.subscription.updated` — plan changed (upgrade/downgrade), or renewed
- `customer.subscription.deleted` — subscription canceled
- `invoice.payment_failed` — a renewal payment failed
- `invoice.payment_succeeded` — used to trigger credit allocation on renewal

### 6.5 Subscription syncing

- Every time a relevant webhook fires, your server updates a local `Subscription` table with the current plan, status, and renewal date. The app should always read subscription status from *your* database (kept in sync by webhooks), not by calling Stripe live on every request — this keeps things fast and resilient to Stripe downtime.

### 6.6 Credits syncing

- Credits stay a Bloom-specific concept, tracked entirely in your own database.
- When a subscription payment succeeds (new purchase or renewal), a webhook handler allocates the correct number of credits to that user for the billing period.
- Upgrades and downgrades adjust the credit allocation going forward (not retroactively, unless you decide otherwise).

### 6.7 Trial support

- Stripe supports trial periods natively on subscriptions. Configure the trial length on the Stripe Price/Product (manual work, see Section 8), and Stripe will handle not charging the card until the trial ends — your webhook handler just needs to allocate trial-level credits when the subscription starts in `trialing` status.

### 6.8 Files affected

| File | Action |
|---|---|
| `server/src/lib/polar.ts` | Delete |
| `server/src/lib/credits.ts` | Rewrite to be provider-agnostic (no more Polar-specific assumptions) |
| `server/src/routes/billing.ts` → `server/src/features/billing/*` | Rewrite as Checkout, Portal, and Webhook route handlers |
| `cli/src/lib/upgrade.ts` | Rewrite to call new Stripe Checkout endpoint |
| `database/prisma/schema.prisma` | Add `Subscription`, `Price` models |

### 6.9 Files to create

- `server/src/integrations/stripe/client.ts` — Stripe SDK client wrapper
- `server/src/integrations/stripe/webhook-verify.ts` — signature verification helper
- `server/src/features/billing/checkout/create-session.ts`
- `server/src/features/billing/portal/create-session.ts`
- `server/src/features/billing/webhooks/handler.ts`
- `server/src/features/billing/subscriptions/sync.ts`
- `server/src/features/billing/prices/registry.ts` — maps your internal plan names to Stripe Price IDs

---

## 7. Database Changes

### 7.1 Proposed schema (plain-English description)

- **User** — one row per person using Bloom. Now includes fields Better Auth needs (email verification status, etc.) and a link to their Stripe Customer ID.
- **Session** — one row per active login. Linked to a User. Has an expiration time.
- **Account** — one row per OAuth connection (e.g., one row for "Google," one for "GitHub," if a user connects both). Linked to a User.
- **Verification** — one row per pending email OTP code or email verification token. Linked to an email address, with an expiration time.
- **Subscription** — one row per active or past subscription. Linked to a User, stores the Stripe Subscription ID, current status, plan, and renewal date.
- **Price** — one row per billing plan (e.g., "Monthly Pro," "Annual Pro"). Stores the Stripe Price ID and the number of credits it grants.
- **Credits** — tracks a user's current credit balance and history of credit grants/usage. Linked to a User.

### 7.2 Relationships (plain-English)

- A **User** has **one or many Sessions** (they can be logged in on multiple devices).
- A **User** has **one or many Accounts** (one per OAuth provider they've connected).
- A **User** has **at most one active Subscription** at a time (but may have a history of past ones).
- A **Subscription** references **one Price** (the plan it's currently on).
- A **User** has **one Credits record** that gets updated over time.

### 7.3 Example schema shape

```prisma
model User {
  id              String    @id @default(cuid())
  email           String    @unique
  emailVerified   Boolean   @default(false)
  name            String?
  image           String?
  stripeCustomerId String?  @unique
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  sessions        Session[]
  accounts        Account[]
  subscription    Subscription?
  credits         Credits?
}

model Session {
  id        String   @id @default(cuid())
  userId    String
  token     String   @unique
  expiresAt DateTime
  createdAt DateTime @default(now())

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Account {
  id                String   @id @default(cuid())
  userId            String
  provider          String   // "google" | "github"
  providerAccountId String
  createdAt         DateTime @default(now())

  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Verification {
  id         String   @id @default(cuid())
  identifier String   // email address
  value      String   // OTP code or token
  expiresAt  DateTime
  createdAt  DateTime @default(now())
}

model Subscription {
  id                  String   @id @default(cuid())
  userId              String   @unique
  stripeSubscriptionId String  @unique
  status              String   // "active" | "trialing" | "past_due" | "canceled"
  priceId             String
  currentPeriodEnd    DateTime
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  user                User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  price               Price    @relation(fields: [priceId], references: [id])
}

model Price {
  id            String   @id @default(cuid())
  stripePriceId String   @unique
  name          String   // "Monthly Pro", "Annual Pro"
  interval      String   // "month" | "year"
  creditsPerPeriod Int

  subscriptions Subscription[]
}

model Credits {
  id        String   @id @default(cuid())
  userId    String   @unique
  balance   Int      @default(0)
  updatedAt DateTime @updatedAt

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

*(This is a starting point, not a final production schema — review field types and add indexes as needed once you finalize it.)*

---

## 8. Manual Work Checklist

Things only you can do (an AI assistant cannot do these for you):

- [ ] Create a Google Cloud project and OAuth 2.0 credentials (Client ID + Secret) for Better Auth
- [ ] Create a GitHub OAuth App (Client ID + Secret) for Better Auth
- [ ] Set OAuth callback/redirect URLs for both Google and GitHub, for both staging and production domains
- [ ] Generate and store a Better Auth secret key (used to sign sessions)
- [ ] Set up SMTP credentials for Email OTP delivery (`SMTP_*`, `EMAIL_FROM`)
- [ ] Prefer Gmail App Password or a transactional SMTP provider for production
- [ ] Create a Stripe account (if you don't already have one) and complete business verification
- [ ] Create Stripe Products (e.g., "Bloom Pro")
- [ ] Create Stripe Prices under each Product (monthly and annual)
- [ ] Configure trial period length on relevant Stripe Prices, if offering trials
- [ ] Set up a Stripe Webhook endpoint in the Stripe Dashboard pointing to your server
- [ ] Copy the Stripe Webhook signing secret into your environment variables
- [ ] Get your Stripe API keys (publishable + secret) for both test mode and live mode
- [ ] Set up a Sentry project (if using Sentry) and get the DSN
- [ ] Update all environment variables in staging and production (see Section 12)
- [ ] Configure production domain(s) and DNS if not already done
- [ ] Decide on and communicate a maintenance window for the production cutover (Phase 7)
- [ ] Manually reconcile existing Polar subscribers — export their subscription data and, where needed, recreate equivalent Stripe subscriptions or grant equivalent credits, before cutting traffic to Stripe
- [ ] Cancel your Clerk and Polar subscriptions once you've confirmed the migration is stable (recommended: wait 2–4 weeks after cutover)

---

## 9. AI-Generated Work Checklist

Things an AI coding assistant can safely automate for you:

- [ ] Move existing files into the new folder structure and fix all import paths
- [ ] Generate the Better Auth configuration file and Prisma adapter wiring
- [ ] Generate new auth route handlers (sign in, sign up, logout, OAuth start/callback, OTP)
- [ ] Generate the `require-auth` middleware rewrite
- [ ] Generate the CLI's device-flow OAuth client code
- [ ] Generate the custom sign-in/sign-up terminal UI screens
- [ ] Generate the Stripe integration wrapper (client setup, webhook signature verification)
- [ ] Generate Checkout session creation endpoint
- [ ] Generate Customer Portal session creation endpoint
- [ ] Generate the webhook event handler with a switch/case for each event type
- [ ] Generate subscription-sync logic that updates the database from webhook payloads
- [ ] Generate credits allocation logic tied to successful payments
- [ ] Update the Prisma schema with new models (Session, Account, Verification, Subscription, Price)
- [ ] Generate and run the Prisma migration
- [ ] Update `shared/schemas.ts` with new Zod validation schemas for auth and billing payloads
- [ ] Update the CLI's API client to use new auth headers/tokens
- [ ] Remove all Clerk and Polar imports and delete now-unused files
- [ ] Update `package.json` dependencies (remove Clerk/Polar packages, add Better Auth/Stripe packages)
- [ ] Generate a complete `.env.example` file
- [ ] Write basic integration tests for the new auth and billing flows

**Keep these two lists separate** — anything in Section 8 should never be delegated to an AI assistant (it requires access to real accounts, real business decisions, or real dashboards), and anything in Section 9 should not be done by hand if it can be automated safely.

---

## 10. File-Level Migration Plan

| Current File | Action | Reason | Replacement |
|---|---|---|---|
| `server/src/lib/polar.ts` | DELETE | Replaced by Stripe integration | `server/src/integrations/stripe/` |
| `server/src/lib/auth.ts` | REWRITE | Clerk → Better Auth | `server/src/integrations/better-auth/config.ts` |
| `server/src/lib/credits.ts` | REWRITE | Must become provider-agnostic | `server/src/features/billing/*` (credits logic) |
| `server/src/lib/models.ts` | MOVE | Belongs with AI providers, not generic lib | `server/src/providers/registry/` |
| `server/src/routes/auth.ts` | REWRITE + MOVE | New auth system, new folder convention | `server/src/features/auth/routes.ts` |
| `server/src/routes/billing.ts` | REWRITE + MOVE | New billing system, new folder convention | `server/src/features/billing/*` |
| `server/src/routes/chat.ts` | MOVE (no logic change) | Folder convention only | `server/src/features/chat/routes.ts` |
| `server/src/routes/sessions.ts` | MOVE (no logic change) | Folder convention only | `server/src/features/sessions/routes.ts` |
| `server/src/middleware/require-auth.ts` | REWRITE | Must check Better Auth session, not Clerk | Same path, new logic |
| `server/src/middleware/require-credits-balance.ts` | KEEP | Still valid, only depends on your own Credits table | No change needed |
| `server/src/tools/*` | MOVE | Belongs in the runtime layer | `server/src/runtime/tools/` |
| `server/src/system-prompt.ts` | MOVE | Belongs in the runtime layer | `server/src/runtime/prompt/` |
| `cli/src/lib/auth.ts` | REWRITE | Clerk client calls → Better Auth client calls | `cli/src/auth/session.ts` |
| `cli/src/lib/oauth.ts` | REWRITE | Clerk OAuth → device-flow OAuth | `cli/src/auth/device-flow.ts` |
| `cli/src/lib/upgrade.ts` | REWRITE | Polar checkout → Stripe checkout | `cli/src/api/billing-client.ts` |
| `cli/src/lib/api-client.ts` | MODIFY | Update auth token handling | Same path, updated logic |
| `database/prisma/schema.prisma` | MODIFY | Add new models, remove Clerk/Polar-specific fields once migrated | Same path |
| `shared/schemas.ts` | MODIFY | Add auth + billing validation schemas | Same path |
| Any `@clerk/*` webhook route | DELETE | No longer applicable | n/a |
| Any Clerk middleware file | DELETE | Replaced entirely | `server/src/middleware/require-auth.ts` |

*(This table covers the files explicitly mentioned in your project structure. Run a project-wide search for `clerk` and `polar` before Phase 6 to catch anything not listed here.)*

---

## 11. Dependencies

### 11.1 Packages to remove

- `@clerk/backend` (or equivalent Clerk server SDK)
- `@clerk/clerk-sdk-node` / any Clerk CLI-facing SDK
- Any `@polar-sh/*` packages

### 11.2 Packages to add

- `better-auth` — core authentication library
- `@better-auth/cli` (optional) — for generating/managing Better Auth schema
- `stripe` — official Stripe Node.js SDK
- `nodemailer` — send Email OTP codes over SMTP

### 11.3 Packages to update

- `@prisma/client` and `prisma` — keep on the latest stable version, since you're adding new models and running new migrations
- `hono` — check for any version bump that improves middleware typing, since middleware is being rewritten
- `zod` — keep current, used more heavily now for auth/billing payload validation

### 11.4 Why each dependency exists

- **`better-auth`** — replaces Clerk entirely; handles sessions, OAuth, and OTP.
- **`stripe`** — replaces Polar entirely; handles Checkout, Portal, and Webhooks.
- **`nodemailer`** — sends Email OTP codes that Better Auth triggers over SMTP.
- **`prisma`** — unchanged role, but now manages more tables.

---

## 12. Environment Variables

```env
# ─── Better Auth ───────────────────────────────
BETTER_AUTH_SECRET=              # random 32+ character string, used to sign sessions
BETTER_AUTH_URL=                 # e.g. https://api.bloom.dev

# ─── Google OAuth ──────────────────────────────
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# ─── GitHub OAuth ──────────────────────────────
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# ─── Stripe ─────────────────────────────────────
STRIPE_SECRET_KEY=               # sk_test_... or sk_live_...
STRIPE_PUBLISHABLE_KEY=          # pk_test_... or pk_live_...
STRIPE_WEBHOOK_SECRET=           # whsec_..., from the Stripe Dashboard webhook config
STRIPE_PRICE_ID_MONTHLY=         # price_... for the monthly plan
STRIPE_PRICE_ID_ANNUAL=          # price_... for the annual plan

# ─── Database ───────────────────────────────────
DATABASE_URL=                    # postgres connection string

# ─── SMTP (Email OTP) ───────────────────────────
SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=


# ─── AI Providers ───────────────────────────────
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
GOOGLE_GENERATIVE_AI_API_KEY=    # for Gemini via the AI SDK

# ─── Miscellaneous ──────────────────────────────
NODE_ENV=                        # development | production
APP_URL=                         # public URL of the CLI's companion web pages, if any
SENTRY_DSN=                      # optional, for error tracking
```

### What each variable is for, in plain language

- **`BETTER_AUTH_SECRET`** — a private password-like string used to cryptographically sign session tokens. Never share it.
- **`BETTER_AUTH_URL`** — tells Better Auth what your server's public address is, so it can build correct callback URLs.
- **`GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`** — credentials from your own Google Cloud OAuth app, proving to Google that requests are coming from Bloom.
- **`GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET`** — same idea, for GitHub.
- **`STRIPE_SECRET_KEY`** — used server-side to create checkouts, manage subscriptions, etc. Keep this absolutely private.
- **`STRIPE_PUBLISHABLE_KEY`** — safe to expose to the client; used to initialize Stripe.js if you ever build a web checkout page.
- **`STRIPE_WEBHOOK_SECRET`** — used to verify that incoming webhook requests really came from Stripe and not an attacker.
- **`STRIPE_PRICE_ID_MONTHLY` / `STRIPE_PRICE_ID_ANNUAL`** — the specific Price IDs from your Stripe Dashboard, so your code knows which plan is which.
- **`DATABASE_URL`** — how the app connects to PostgreSQL.
- **`SMTP_HOST` / `SMTP_PORT` / `SMTP_SECURE` / `SMTP_USER` / `SMTP_PASS`** — SMTP server used to deliver Email OTP codes.
- **`EMAIL_FROM`** — From address on OTP emails (e.g. `"Bloom <you@gmail.com>"`).
- **`OPENAI_API_KEY` / `ANTHROPIC_API_KEY` / `GOOGLE_GENERATIVE_AI_API_KEY`** — credentials for each AI provider Bloom can use.
- **`NODE_ENV`** — tells the app whether it's running in development or production (affects logging, error detail, etc.).
- **`SENTRY_DSN`** — where error reports get sent, if you use Sentry.

---

## 13. Risk Assessment

### 13.1 Possible migration issues

- Users being logged out unexpectedly during the auth cutover.
- Paying customers being double-billed or losing access if subscription data isn't reconciled correctly between Polar and Stripe.
- OAuth misconfiguration causing "redirect URI mismatch" errors in production.
- Webhook events arriving out of order (e.g., a "subscription updated" event processed before "subscription created"), causing incorrect state — handle this by always trusting the latest `currentPeriodEnd`/timestamp rather than assuming event order.
- Missing edge cases in credit allocation (e.g., what happens to unused credits on downgrade).

### 13.2 Rollback plan

- Keep the Clerk and Polar integrations in the codebase (behind a feature flag or simply on a separate branch) until Phase 7 is fully verified in production. Do not delete them until you're confident the cutover is stable.
- Keep both Clerk and Polar accounts active (but not receiving new traffic) for at least 2–4 weeks after cutover, in case you need to reference historical data or temporarily roll back.
- Take a full database backup immediately before running the Phase 2 migration and again immediately before Phase 7 cutover.

### 13.3 Breaking changes

- Any existing CLI installed on a user's machine that still expects Clerk-based auth will break after the server cuts over — plan a forced CLI update prompt, or version-gate the API so old CLI versions get a clear "please update" message instead of a silent failure.

### 13.4 Data migration concerns

- Existing Clerk user IDs and Polar customer IDs need to be mapped to new Better Auth and Stripe records — do not lose this mapping, or you risk creating duplicate accounts for existing users.
- Decide upfront whether existing users need to "re-verify" their email under the new system, or whether you'll trust Clerk's existing verification status during migration.

### 13.5 Production concerns

- Rate limiting on auth endpoints (especially OTP requests) to prevent abuse — Better Auth doesn't fully replace the abuse-protection Clerk provided out of the box, so add your own rate limiting.
- Monitor Stripe webhook delivery in the Stripe Dashboard for the first few weeks to catch any failed deliveries early.

### 13.6 Testing strategy

- Test every auth flow (sign up, sign in, logout, OAuth, OTP, session expiry) manually and with automated tests in staging before touching production.
- Test every billing flow (checkout, upgrade, downgrade, cancel, resume, failed payment) using Stripe's test mode and test card numbers before going live.
- Run the full webhook event list through Stripe's CLI (`stripe trigger`) against your staging webhook endpoint to confirm each event type is handled correctly.

---

## 14. Timeline

Estimates assume one experienced full-stack engineer working with AI-assisted coding tools. Adjust up if working solo without AI help, or down with a small team.

| Phase | Size | Estimated Hours | Estimated Days |
|---|---|---|---|
| Phase 1 — Folder Restructure | Medium | 6–10 hrs | 1–2 days |
| Phase 2 — Database Schema | Small | 3–5 hrs | 0.5–1 day |
| Phase 3 — Auth Migration | Large | 20–30 hrs | 4–6 days |
| Phase 4 — Billing Migration | Large | 20–30 hrs | 4–6 days |
| Phase 5 — Runtime Layer | Medium | 8–12 hrs | 1.5–2 days |
| Phase 6 — Cleanup | Small | 4–6 hrs | 1 day |
| Phase 7 — Production Cutover | Medium | 6–10 hrs (+ monitoring time) | 1–2 days |
| **Total** | | **~67–103 hrs** | **~13–20 days** |

This assumes phases are done mostly sequentially. Phase 5 can run in parallel with Phases 2–4 if you have extra bandwidth, which would shorten the total calendar time (though not the total hours).

---

## 15. Future Improvements

Once this migration is complete and stable, these are natural next steps:

- **Plugin runtime** — allow third parties to write plugins that hook into the agent runtime's event bus.
- **Agent SDK** — package `runtime/` as a standalone, publishable library so others could build their own CLI or interface on top of Bloom's agent engine.
- **Skill SDK** — a defined format for authoring and sharing skills, so the community can contribute.
- **Marketplace** — a place to discover and install community-built skills/plugins.
- **Multi-provider auth expansion** — add more OAuth providers (e.g., Microsoft, GitLab) using the same `features/auth/providers/` pattern.
- **Teams** — allow multiple users to share a workspace and billing plan.
- **Organizations** — a layer above Teams for larger companies, with shared billing and admin controls.
- **RBAC (Role-Based Access Control)** — fine-grained permissions once Teams/Organizations exist.
- **Audit logs** — record important actions (billing changes, admin actions) for security and compliance.
- **Vector memory** — upgrade `runtime/memory/` to use embeddings for smarter long-term recall.
- **Analytics** — track usage patterns to inform product decisions.
- **Usage dashboard** — let users see their own credit usage and history in the CLI.
- **Feature flags** — roll out new features gradually and safely.
- **Background jobs / queue workers** — move heavy or slow tasks (e.g., large repo indexing) off the main request path.
- **Observability** — deeper tracing and metrics across the runtime layer, not just error tracking.

These are intentionally *not* part of the current migration — attempting them alongside the Clerk/Polar migration would add risk and delay. Treat this list as the roadmap for after Phase 7 is stable.

---

*End of PLAN.md*