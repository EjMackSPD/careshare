# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

CareShare is a Next.js (App Router) app that helps families coordinate elder care: shared costs, event/task planning, documents, and an AI care assistant. Product data lives in Prisma/Postgres; marketing/CMS content and authentication live in Payload CMS, sharing the same Postgres database (Payload uses the `payload` schema, Prisma uses the default `public` schema).

Existing root docs (`README.md`, `PROJECT_OVERVIEW.md`) describe an older NextAuth-based version of this app and are stale — do not trust their auth/architecture claims. `docs/CARESHARE_BUSINESS_AND_TECHNICAL_SPEC.md`, `docs/PAGE-BLOCKS-PLAYBOOK.md`, `docs/SECTION-SYSTEM.md`, `docs/CARESHARE-STYLE-GUIDE.md`, and `docs/ADMIN-CMS-STYLING.md` are current and authoritative for their respective areas.

## Commands

```bash
npm run dev                    # Start dev server (Turbopack)
npm run build                  # prisma generate && next build
npm run lint                   # ESLint (flat config, eslint.config.mjs)

# Prisma (product data)
npx prisma generate
npx prisma migrate dev         # create + apply a migration
npx prisma studio              # DB GUI
npm run seed                   # tsx prisma/seed.ts

# Payload (CMS/auth)
npm run generate:payload-types      # regenerate payload-types.ts after collection changes
npm run generate:payload-importmap  # regenerate admin import map after adding admin components
npm run payload:migrate             # apply Payload's own migrations
npm run seed:payload                # seed CMS content (payload/seed-data.ts)
npm run migrate:payload-users       # one-off: migrate legacy Prisma users into Payload
npm run sync:site-assets            # sync static site assets into Payload media

npm run doctor                 # scripts/local-doctor.mjs — local environment sanity check
```

There is no test runner configured (no test script in `package.json`, no test files) — do not assume Jest/Vitest exist.

## Architecture

### Two data/auth systems sharing one Postgres database

- **Payload CMS** (`payload.config.ts`, `payload/`) owns authentication (the `users` collection), marketing pages/posts (`Pages`, `Posts`), media (backed by Vercel Blob), and contact submissions. It's mounted at `/admin` (admin UI) and `/payload-api` (REST/GraphQL), configured via `routes` in `payload.config.ts`. Its Postgres tables live in the `payload` schema.
- **Prisma** (`prisma/schema.prisma`) owns all product data: families, care recipients, events, costs/contributions, tasks, documents, medications, life stories, AI conversations, audit logs, etc. It also retains legacy `Account`/`Session`/`VerificationToken` models "for auth compatibility" — these are not the active auth path.
- **Sync bridge**: `payload/hooks/syncUserToPrisma.ts` mirrors a Payload user into the Prisma `User` table (mapping Payload `roles` → Prisma `UserRole`) whenever a session is resolved. `lib/auth.ts` is the entry point: it validates the Payload auth cookie/JWT (`payload-token`), calls Payload's `auth()`, and on success syncs/reads the corresponding Prisma user so route handlers can query product data by a stable Prisma `User.id`.

When adding a field that affects both authorization and product data (e.g. a new role), you generally need to update both `payload/access.ts` (Payload roles: `super-admin`, `content-editor`, `support-admin`, `family-member`) and the Prisma `UserRole`/`FamilyRole` enums, plus the mapping in `syncUserToPrisma.ts`.

### Auth/authorization call chain

`lib/auth.ts` (`auth()`) → `lib/auth-utils.ts` helpers, used from API routes and server components:
- `getCurrentUser()` — current user or null
- `requireAuth()` — throws if unauthenticated
- `requireAdmin()` — throws unless `isOperationalAdmin` (Payload `super-admin`/`support-admin` or Prisma `UserRole.ADMIN`)
- `requireFamilyMembership(familyId, allowedRoles?)` — checks `FamilyMember` row (admins bypass)
- `requireFamilyCapability(familyId, capability)` — checks a fine-grained capability via `lib/family-permissions.ts` (e.g. `bills.write`, `sensitive.read`) against the member's `FamilyRole`

`middleware.ts` only does a coarse cookie-presence redirect for `/dashboard`, `/family`, `/profile` — it does not itself do role/family checks. Route handlers and server components are responsible for calling `requireAuth`/`requireFamilyMembership`/`requireFamilyCapability` themselves.

`FamilyRole` (Prisma) has more granularity than Payload roles: `OWNER`, `PRIMARY_CAREGIVER`, `FAMILY_ADMIN`, `CONTRIBUTOR`, `VIEWER`, `CARE_RECIPIENT`. `normalizeFamilyRole()` maps legacy/loose role strings (`CARE_MANAGER`, `FAMILY_MEMBER`) onto this set.

### App Router layout

- `app/(site)/` — the authenticated product and public marketing pages (dashboard, family, onboarding, blog, about, login, etc.) share this route group.
- `app/(payload)/` — Payload's own admin UI mount.
- `app/api/` — REST-style API routes for product resources (families, events, costs, tasks, documents, medications, care-plan, care-scenarios, contributions, onboarding, demo, contact-submissions), plus `auth`, `blob`, `upload`. Handlers typically: get the user via `getCurrentUser()`/`requireAuth()`, authorize via family-membership/capability helpers, then read/write via `lib/prisma.ts`'s singleton `prisma` client.
- `app/components/sections/` + `app/content/` — a typed page-section system (`SectionRenderer.tsx`, `section-types.ts`) for marketing pages. Prefer composing existing section types (`hero`, `feature-grid`, `stats`, `content`, `cta`, `testimonial`, `faq`, etc.) over one-off markup; see `docs/SECTION-SYSTEM.md` and `docs/PAGE-BLOCKS-PLAYBOOK.md` (the latter is current source of truth for Payload-managed blocks, which are mapped to these section types by `lib/cms.ts`'s `mapCMSBlock`).
- `lib/cms.ts` — bridges Payload documents (pages, posts, blocks) into the frontend's `PageSection`/`BlogListItem` shapes; also handles media URL normalization (including proxying private Vercel Blob URLs through `/api/blob`).
- `lib/care-ai.ts` / `lib/openai.ts` — the AI care assistant backend (OpenAI-backed), persisted via the Prisma `AIConversation`/`AIMessage` models.

### Styling

Global design tokens live in `app/globals.css` (`--cs-color-*`, `--cs-radius-*`, `--cs-shadow-*`), mirrored for the Payload admin in `payload/admin/careshare-admin.css`. Components use CSS Modules (`Component.module.css`) scoped per component. Follow `docs/CARESHARE-STYLE-GUIDE.md` for color/typography/component conventions rather than introducing new one-off styles — e.g. amber is reserved for small accents (never buttons), rose is reserved for destructive/error states only.
