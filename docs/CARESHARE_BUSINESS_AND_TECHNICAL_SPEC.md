# CareShare — Business and Technical Specification

**Version:** 1.0  
**Last Updated:** February 2025  
**Status:** Living Document

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Business Overview](#2-business-overview)
3. [Product Vision and Value Proposition](#3-product-vision-and-value-proposition)
4. [Current Features (In Place)](#4-current-features-in-place)
5. [Technical Architecture](#5-technical-architecture)
6. [Data Model](#6-data-model)
7. [API Reference](#7-api-reference)
8. [Security and Authentication](#8-security-and-authentication)
9. [Deployment and Infrastructure](#9-deployment-and-infrastructure)
10. [Roadmap — Soon to Come](#10-roadmap--soon-to-come)
11. [Appendix](#11-appendix)

---

## 1. Executive Summary

**CareShare** is a web platform that helps families coordinate care for elderly or dependent loved ones. It enables family members to share costs, organize tasks, schedule events, manage medications, and stay connected—all in one place.

The product consists of:

- A **public marketing site** (home, features, blog, contact, partnerships, about).
- An **authenticated family dashboard** (tasks, calendar, finances, care plan, resources, family chat, legacy stories, gifts, food, subscription).
- **Family management** (create families, invite members, family detail pages, settings, notes, events, costs, members).
- An **admin portal** for care providers (users, families, blog, content, database tools, settings).
- **Demo mode** for first-time visitors with pre-seeded data.

**Tech stack:** Next.js 15 (App Router), TypeScript, CSS Modules, Prisma, PostgreSQL (Neon), NextAuth.js, Vercel.

---

## 2. Business Overview

### 2.1 Target Users

| Persona | Description | Primary Use |
|--------|-------------|-------------|
| **Family Care Coordinator** | Primary point person for care (e.g., adult child) | Create family, assign tasks, track costs, manage calendar |
| **Family Member** | Sibling, relative, or friend who contributes | View tasks, contribute financially, add events, chat |
| **Care Recipient** | Elder or dependent being cared for | Optional; profile and care details live under a family |
| **Care Provider / Admin** | Nursing home, care agency, or professional | Manage multiple families, users, and content (admin only) |

### 2.2 Core Workflows

- **Onboarding:** Sign up → (optional) onboarding → create or join family → dashboard.
- **Daily use:** View dashboard → tasks, calendar, finances → add/complete tasks, events, costs.
- **Coordination:** Invite members, assign tasks, split costs, use family chat and notes.
- **Content and marketing:** Public blog, SEO, sitemap, related posts, CTA to signup.

---

## 3. Product Vision and Value Proposition

- **Single place** for care coordination: tasks, calendar, costs, care plan, resources, and communication.
- **Transparency:** Shared view of who does what, what’s due, and how costs are split.
- **Reduced burden** on one primary caregiver via clear roles and assignments.
- **Trust and continuity:** Care plans, life stories (“Live Forever”), documents, and notes preserved for the family.

---

## 4. Current Features (In Place)

### 4.1 Public Marketing Site

| Feature | Description | Route(s) |
|---------|-------------|----------|
| Home | Hero, benefits, demo CTA, latest blog posts | `/` |
| Features | Product capabilities and value | `/features` |
| Blog | List and detail with categories, search, pagination, cover images | `/blog`, `/blog/[slug]` |
| About | Company story | `/about` |
| Contact | Contact form/info | `/contact` |
| Partnerships | Partner-focused content | `/partnerships` |
| Privacy / Terms | Legal pages | `/privacy`, `/terms` |
| SEO | Sitemap, robots.txt, JSON-LD on blog posts, cross-linking | `/sitemap.xml`, `robots.txt` |

### 4.2 Authentication and Onboarding

| Feature | Description | Route(s) / API |
|---------|-------------|----------------|
| Sign up | Email/password registration | `/signup`, `POST /api/auth/signup` |
| Login | Email/password + demo mode | `/login`, NextAuth |
| Demo mode | One-click demo with seeded family, tasks, events, costs | `POST /api/auth/demo` |
| Demo reset | Reset demo data | `POST /api/demo/reset` |
| Onboarding | Optional post-signup flow | `/onboarding`, `POST /api/onboarding` |
| Sign out | Session end | `/signout` |

### 4.3 Family Management

| Feature | Description | Route(s) / API |
|---------|-------------|----------------|
| Family list | User’s families with create CTA | `/family` |
| Create family | Name, description, care recipient info | `/family/create` |
| Family detail | Overview, members, quick links | `/family/[familyId]` |
| Family settings | Name, elder details, emergency contact, medical notes, notification preferences | `/family/[familyId]/settings`, `PATCH /api/families/[familyId]`, `GET /api/families/[familyId]` |
| Members list | Family members and roles | `/family/[familyId]/members` |
| Member detail | Single member view | `/family/[familyId]/members/[memberId]` |
| Family events | Events for family | `/family/[familyId]/events` |
| Family costs | Costs for family | `/family/[familyId]/costs` |
| Family notes | Shared notes | `/family/[familyId]/notes` |
| Invitations | Invite by email, role, status | `POST/GET /api/families/[familyId]/invitations` |

### 4.4 Dashboard (Authenticated)

| Feature | Description | Route(s) |
|---------|-------------|----------|
| Main dashboard | Care recipient header, task stats, quick links, calendar overview, finances overview, collaboration, resources, care plan | `/dashboard` |
| Tasks | Task list, filters (category, tab: open/unassigned/completed), sort, add/edit/delete, assign, checkbox complete, file attachment, first-visit checkbox hint | `/dashboard/tasks` |
| Calendar | Month view, event types, add event, selected day events sidebar | `/dashboard/calendar` |
| Finances | Costs, bills, contributions, expense trends, uploads | `/dashboard/finances` |
| Care Plan | Care level, scenarios, cost estimates | `/dashboard/care-plan` |
| Resources | Resource library and bookmarks | `/dashboard/resources`, `/dashboard/resources/[resourceId]` |
| Family collaboration | Family chat and upcoming events | `/dashboard/family-collaboration` |
| Live Forever | Life stories and legacy content | `/dashboard/legacy` |
| Gift marketplace | Gift ideas and orders | `/dashboard/gifts` |
| Food delivery | Food orders and scheduling | `/dashboard/food` |
| Subscription | Subscription management placeholder | `/dashboard/subscription` |
| Medications | Medication list and reminders (data model and API in place) | `/dashboard/medications` |

### 4.5 Left Navigation and UX

- **Family selector** at top: current family, switch between families (if multiple).
- **Sections:** Main Menu, Family, Marketplace, Account; Admin section for admins only.
- **Sticky sidebar** below top nav; responsive with mobile menu.

### 4.6 Profile and Account

| Feature | Description | Route(s) |
|---------|-------------|----------|
| Profile | User profile view (update API noted as TODO in code) | `/profile` |

### 4.7 Admin Portal

| Feature | Description | Route(s) / API |
|---------|-------------|----------------|
| Admin login | Admin auth | `/admin/login` |
| Admin home | Admin dashboard | `/admin` |
| Manage users | List, search, add, edit, delete users | `/admin/users`, `GET/POST /api/admin/users`, `GET/PUT/DELETE /api/admin/users/[userId]` |
| Manage families | List, search, add, edit, delete families | `/admin/families`, `GET/POST /api/admin/families`, `GET/PUT/DELETE /api/admin/families/[familyId]` |
| Blog management | List, search, filter, paginate, add, edit, delete, publish; rich text editor; related posts | `/admin/blog`, `GET/POST /api/admin/blog`, `PUT/DELETE /api/admin/blog/[postId]` |
| Content management | Placeholder | `/admin/content` |
| Database tools | Export/import and DB utilities | `/admin/database` |
| System settings | Placeholder | `/admin/settings` |

Access: restricted to users with approved Payload admin roles.

### 4.8 Blog (Public and Admin)

- **Public:** List with categories, search, pagination, featured post, cover images. Detail page with markdown rendering (bold/italic), related posts, CTA.
- **Admin:** Full CRUD, rich text (markdown) editor, cover image URL, category, author, read time, publish/draft, related post IDs (cross-referencing).
- **SEO:** Sitemap includes blog slugs; JSON-LD on post pages; internal linking.

---

## 5. Technical Architecture

### 5.1 Stack Summary

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15.5 (App Router) |
| Language | TypeScript |
| Styling | CSS Modules |
| Database | PostgreSQL (Neon) |
| ORM | Prisma 6.x |
| Auth | NextAuth.js 5 (beta) |
| Hosting | Vercel |
| Package manager | npm |

### 5.2 Project Structure (High Level)

```
app/
├── api/                    # API routes
│   ├── auth/               # signup, demo, [...nextauth]
│   ├── blog/               # public blog, slug
│   ├── admin/              # admin blog, users, families
│   ├── families/           # families, [familyId] (members, events, costs, tasks, etc.)
│   ├── events/, costs/     # event/cost CRUD
│   ├── tasks/              # task updates
│   ├── care-plan/, care-scenarios/, contributions/
│   ├── documents/, medications/, upload/
│   └── onboarding/, demo/
├── admin/                  # Admin pages
├── dashboard/               # Dashboard and sub-pages
├── family/                  # Family list, create, [familyId], members, notes, etc.
├── blog/                    # Public blog list and [slug]
├── login/, signup/, signout/, onboarding/
├── profile/
├── features/, about/, contact/, partnerships/, privacy/, terms/
├── page.tsx                # Home
components/                  # Navigation, Footer, widgets, RichTextEditor, etc.
lib/                         # prisma, auth, auth-utils
prisma/                      # schema.prisma, seed, seed-blog
public/                      # robots.txt, static assets
docs/                        # This spec
```

### 5.3 Key Conventions

- **Server components** where possible (e.g. dashboard home); **client components** for forms, modals, and client state.
- **API routes:** REST-style; JSON; auth via session/NextAuth.
- **Styling:** One CSS module per page or component; responsive with `@media (max-width: 768px)` (and similar).
- **Images:** Next.js `Image` with `remotePatterns` for Unsplash (blog).

---

## 6. Data Model

### 6.1 Core Entities

| Model | Purpose |
|-------|--------|
| **User** | Auth, role (FAMILY_MEMBER, ADMIN), profile |
| **Account, Session, VerificationToken** | NextAuth |
| **Family** | Family group; elder/care recipient info; notification prefs (JSON) |
| **FamilyMember** | User–family link; role (CARE_MANAGER, FAMILY_MEMBER, CONTRIBUTOR, CARE_RECIPIENT) |
| **FamilyInvitation** | Pending invites by email and role |
| **Event** | Family events (BIRTHDAY, APPOINTMENT, FOOD_DELIVERY, VISIT, OTHER) |
| **Cost** | Shared expense; status (PENDING, PAID, OVERDUE); split type |
| **CostSplit** | Per-user share of a cost |
| **Task** | Family task; priority; status (TODO, IN_PROGRESS, COMPLETED, CANCELLED); optional attachment |
| **TaskAssignment** | Many-to-many task–user assignees |
| **CareActivity** | Care plan activity (category, frequency) |
| **Resource** | Family resource (link or file) |
| **GiftOrder, FoodOrder** | Marketplace orders |
| **Message** | Family chat message |
| **LifeStory** | Legacy story (category, content type, visibility) |
| **Medication** | Medication with dosage, frequency, dates |
| **Note** | Family note (category) |
| **Document** | Uploaded document (category); file URL and metadata |
| **CarePlan** | One per family; care level, cost range, notes |
| **CareScenario** | Scenario type and JSON content |
| **FamilyContribution** | Member name, amount, percentage (for UI) |
| **AdminFamily** | Admin–family link for “manage multiple families” |
| **BlogPost** | Title, slug, excerpt, content, category, author, coverImage, readTime, published, relatedPostIds |

### 6.2 Enums (Summary)

- **UserRole:** FAMILY_MEMBER, ADMIN  
- **FamilyRole:** CARE_MANAGER, FAMILY_MEMBER, CONTRIBUTOR, CARE_RECIPIENT  
- **InvitationStatus:** PENDING, ACCEPTED, DECLINED, EXPIRED  
- **EventType:** BIRTHDAY, APPOINTMENT, FOOD_DELIVERY, VISIT, OTHER  
- **CostStatus:** PENDING, PAID, OVERDUE  
- **TaskPriority:** LOW, MEDIUM, HIGH, URGENT  
- **TaskStatus:** TODO, IN_PROGRESS, COMPLETED, CANCELLED  
- **StoryCategory, ContentType, MedicationFrequency, DocumentCategory, CareLevel, ScenarioType, BlogCategory** (see schema)

---

## 7. API Reference

### 7.1 Auth

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/demo` | Create/login demo user and seed family data |
| * | `/api/auth/[...nextauth]` | NextAuth handlers |

### 7.2 Families

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/families` | Current user’s families |
| POST | `/api/families` | Create family |
| GET | `/api/families/[familyId]` | Family by ID (member check) |
| PATCH | `/api/families/[familyId]` | Update family (settings, notification prefs) |
| GET/POST | `/api/families/[familyId]/members` | List/add members |
| GET/PUT/DELETE | `/api/families/[familyId]/members/[memberId]` | Member detail/update |
| GET/POST | `/api/families/[familyId]/invitations` | List/send invites |
| GET/POST | `/api/families/[familyId]/events` | List/create events |
| GET/POST | `/api/families/[familyId]/costs` | List/create costs |
| GET/POST | `/api/families/[familyId]/tasks` | List/create tasks |
| GET/POST | `/api/families/[familyId]/notes` | List/create notes |
| GET/POST | `/api/families/[familyId]/resources` | List/create resources |
| GET/POST | `/api/families/[familyId]/medications` | List/create medications |
| GET/POST | `/api/families/[familyId]/messages` | List/send messages |
| GET/POST | `/api/families/[familyId]/life-stories` | List/create life stories |
| GET/POST | `/api/families/[familyId]/documents` | List/upload documents (via API) |

### 7.3 Events, Costs, Tasks

| Method | Path | Description |
|--------|------|-------------|
| PATCH | `/api/events/[eventId]` | Update event |
| DELETE | `/api/events/[eventId]` | Delete event |
| PATCH | `/api/costs/[costId]` | Update cost |
| DELETE | `/api/costs/[costId]` | Delete cost |
| PATCH | `/api/tasks/[taskId]` | Update task (e.g. status, assignment) |
| DELETE | `/api/tasks/[taskId]` | Delete task |

### 7.4 Care Plan, Scenarios, Contributions

| Method | Path | Description |
|--------|------|-------------|
| GET/POST | `/api/care-plan` | Care plan (family-scoped) |
| GET/POST | `/api/care-scenarios` | Care scenarios |
| GET | `/api/contributions` | Family contributions (for UI) |

### 7.5 Blog

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/blog` | Published posts (optional category, limit, id) |
| GET | `/api/blog/[slug]` | Single post by slug (increments views) |

### 7.6 Admin

| Method | Path | Description |
|--------|------|-------------|
| GET/POST | `/api/admin/blog` | List/create blog posts |
| GET/PUT/DELETE | `/api/admin/blog/[postId]` | Get/update/delete post |
| GET/POST | `/api/admin/users` | List/create users |
| GET/PUT/DELETE | `/api/admin/users/[userId]` | User CRUD |
| GET/POST | `/api/admin/families` | List/create families |
| GET/PUT/DELETE | `/api/admin/families/[familyId]` | Family CRUD |

### 7.7 Other

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/upload` | File upload (e.g. receipts, task attachments) |
| POST | `/api/onboarding` | Onboarding completion |
| POST | `/api/demo/reset` | Reset demo data |
| GET/POST/PATCH/DELETE | `/api/documents`, `/api/documents/[documentId]` | Document CRUD |
| GET/POST/PATCH/DELETE | `/api/medications/[medicationId]` | Medication CRUD |

---

## 8. Security and Authentication

- **NextAuth.js:** Session-based auth; credentials (email/password) with bcrypt.
- **Protected routes:** Middleware or server-side checks; redirect to `/login` when unauthenticated.
- **Role checks:** Admin routes and APIs validate Payload role assignments instead of hardcoded email addresses.
- **Family scoping:** Family APIs verify the current user is a member of the family (or admin) before returning or modifying data.
- **Secrets:** `NEXTAUTH_SECRET` and `DATABASE_URL` in environment; no secrets in client bundle.

---

## 9. Deployment and Infrastructure

- **Hosting:** Vercel (serverless, server components, API routes).
- **Database:** Neon PostgreSQL (connection pooling supported).
- **Build:** `prisma generate && next build`; `postinstall` runs `prisma generate`.
- **Env:** `DATABASE_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET` (and any upload/API keys if added).
- **SEO:** Dynamic sitemap, `robots.txt`, JSON-LD on blog; internal linking from home and blog.

---

## 10. Roadmap — Soon to Come

Items below are derived from README “Future Enhancements,” in-code TODOs, and product gaps.

### 10.1 High Priority / Near Term

| Area | Description | Notes |
|------|-------------|--------|
| **Email notifications** | Invitation emails, task/cost reminders | TODOs in invitations and onboarding APIs |
| **Profile update API** | Edit name, email, password from profile | Profile page has TODO for update API |
| **Member stats** | Tasks completed, messages, contributions on member detail | TODO in member page |
| **Bookmark save** | Save resource bookmarks to DB | TODO in resources detail page |

### 10.2 Product Enhancements

| Area | Description |
|------|-------------|
| **Real-time notifications** | In-app or push when tasks assigned, costs due, events |
| **Payment processing** | Stripe (or similar) for contributions, subscriptions, marketplace |
| **Document sharing** | Sharable links, permissions, versioning |
| **Medication tracking** | Reminders, refill alerts, adherence (UI and flows) |
| **Care provider scheduling** | Visits, shifts, availability for paid caregivers |
| **Video chat** | Family or care-provider video calls |

### 10.3 Platform and Scale

| Area | Description |
|------|-------------|
| **Mobile app** | Native or React Native app (marketing mentions “Mobile apps coming soon”) |
| **Email service** | Transactional email (e.g. Resend, SendGrid) for invites and notifications |
| **File storage** | Dedicated storage (e.g. S3, Vercel Blob) for uploads; currently upload API may point to local or temp |
| **Rate limiting and abuse protection** | Per-user or per-IP limits on auth and API |
| **Audit logging** | Admin actions and sensitive family actions logged for compliance |

### 10.4 Content and Growth

| Area | Description |
|------|-------------|
| **Blog analytics** | View counts, popular posts (views already stored) |
| **Newsletter** | Signup and digest emails from blog |
| **Localization** | i18n for multiple languages |

---

## 11. Appendix

### 11.1 Public and Dashboard Routes (Summary)

- **Public:** `/`, `/features`, `/blog`, `/blog/[slug]`, `/about`, `/contact`, `/partnerships`, `/privacy`, `/terms`, `/login`, `/signup`.
- **Auth:** `/dashboard`, `/dashboard/tasks`, `/dashboard/calendar`, `/dashboard/finances`, `/dashboard/care-plan`, `/dashboard/resources`, `/dashboard/resources/[resourceId]`, `/dashboard/family-collaboration`, `/dashboard/legacy`, `/dashboard/gifts`, `/dashboard/food`, `/dashboard/subscription`, `/dashboard/medications`, `/family`, `/family/create`, `/family/[familyId]`, `/family/[familyId]/settings`, `/family/[familyId]/members`, `/family/[familyId]/members/[memberId]`, `/family/[familyId]/events`, `/family/[familyId]/costs`, `/family/[familyId]/notes`, `/profile`, `/signout`, `/onboarding`.
- **Admin:** `/admin`, `/admin/login`, `/admin/users`, `/admin/families`, `/admin/blog`, `/admin/content`, `/admin/database`, `/admin/settings`.

### 11.2 Environment Variables

```env
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="..."
```

### 11.3 Key Scripts

```bash
npm run dev        # Next.js dev with Turbopack
npm run build      # prisma generate && next build
npm run start      # Production server
npm run lint       # Next lint
npx prisma studio  # DB GUI
npx prisma generate
npx prisma db push
npm run seed       # tsx prisma/seed.ts (if configured)
```

### 11.4 Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Feb 2025 | Initial business and technical spec from codebase and README |

---

*This document reflects the application as implemented in the repository. For implementation details, refer to the code and Prisma schema.*
