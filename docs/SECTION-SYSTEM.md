# CareShare Section System

Use this system when building new marketing or informational page sections in CareShare.

## Recommended Skills

- `frontend-skill`: shape the visual direction and section hierarchy before adding UI.
- `build-web-apps:react-best-practices`: keep pages mostly server-rendered and move repeated markup into shared components.
- `build-web-apps:web-design-guidelines`: review accessibility, heading order, spacing, and interaction quality.
- `vercel:nextjs`: apply when section work touches App Router structure, metadata, or server/client boundaries.

## Authoring Pattern

Add new sections as typed objects in a content file, then render them through `SectionRenderer`.

Current source of truth:

- `app/components/sections/section-types.ts`
- `app/components/sections/SectionRenderer.tsx`
- `app/content/marketingSections.tsx`

## Supported Section Types

- `hero`
- `feature-grid`
- `stats`
- `content`
- `cta`
- `testimonial`
- `faq`

## Rules

- Prefer structured section data over one-off page markup.
- Use semantic `<section aria-labelledby="...">` wrappers with a single heading owner.
- Keep copy and content in data objects whenever layout is known in advance.
- Use `content` or rich text only for prose-heavy sections.
- Reuse existing section types before inventing a new one.
- If a new layout repeats twice, extract it into the renderer instead of duplicating page markup.
