# CareShare Payload Page Block Library

This is the source of truth for the reusable block system behind the Payload `pages` collection.

## Goals

- Public marketing and legal pages are assembled from reusable, typed blocks.
- Editors choose content, intent, and approved visual options; they do not write CSS.
- Rendering stays centralized in `SectionRenderer`, so layout, accessibility, spacing, and brand treatment are consistent.
- New blocks are added only when an existing block cannot express the content cleanly.

## Source Files

- Payload schema: `payload/blocks.ts`
- Pages collection: `payload/collections/Pages.ts`
- CMS data mapping: `lib/cms.ts`
- React types: `app/components/sections/section-types.ts`
- Renderer: `app/components/sections/SectionRenderer.tsx`
- Renderer styles: `app/components/sections/SectionRenderer.module.css`
- Seed content: `payload/seed-data.ts`

## Authoring Rules

- Prefer structured fields over rich text for repeatable page patterns.
- Prefer select fields for visual choices: theme, layout, background, action variant, icon, accent.
- Do not add raw CSS, color strings, or style snippets to Payload fields.
- Do not put Lucide component names in content. Use controlled `iconKey` values from `iconOptions`.
- Use `sectionId` only for stable anchors. Keep it lowercase, readable, and unique on the page.
- Keep block copy concise. If a block becomes long-form prose, use `content` or `legalArticle`.
- Public rendering should tolerate missing optional fields, but required fields should be enforced in Payload.

## Shared Options

### Actions

Reusable action fields support:

- `label`
- `href`
- `variant`: `primary`, `secondary`, `accent`
- `iconKey`: controlled icon key from `iconOptions`

Use `primary` for the main conversion path, `secondary` for supporting navigation, and `accent` for care-teal demo/support actions. Do not use amber/orange button treatments.

### Backgrounds

Reusable background choices:

- `plain`: normal page surface
- `muted`: soft section surface

Do not create one-off section background colors in content. Add a named renderer option if a new background treatment becomes reusable.

### Accent Presets

Feature item icons use `accentPreset`, not raw colors.

- `brandBlue`: default product/action emphasis
- `careGreen`: health, caregiving, contribution, completion
- `warmGold`: planning, reminders, financial clarity
- `familyPurple`: family coordination, shared responsibility
- `alertRose`: risks, important warnings, sensitive workflows
- `supportOrange`: partner/provider/support operations
- `brandGradient`: high-emphasis brand moments

Preset styles live in `SectionRenderer.module.css`. If the palette changes, update the CSS classes, not seeded content.

## Pages Collection Layout

The `pages` collection uses Payload tabs:

- `Hero`: internal page title, slug, and one required Hero block.
- `Content`: reusable layout blocks rendered below the hero.
- `SEO`: search/social metadata fields.

The Hero block is stored in the top-level `hero` blocks field. The Content tab uses `layout` and should not include hero blocks. The renderer keeps a legacy fallback for older records that still have a hero in `layout`, but new content should use the Hero tab.

## Block Catalog

### `hero`

Primary page introduction.

Fields:

- `variant`: `marketing` or `app`
- `theme`: `light` or `brand`
- `eyebrow`
- `title`
- `highlight`
- `body`
- `actions`
- `media.kind`: `none`, `carousel`, or `image`
- `media.image`: single-image mode, selected from Payload Media
- `media.images[]`: carousel mode, selected from Payload Media
- `media.alt`: optional single-image alt override

Use in the page Hero tab. Keep the title direct and avoid stuffing multiple CTAs into the hero.

Image assets for heroes and carousels must be selected from the `media` collection. Do not add external image URLs to page block content; the seed script syncs known site assets into Payload Media first and then stores Media relationships in the page blocks.

### `featureGrid`

Reusable feature or benefit list.

Fields:

- `title`
- `intro`
- `layout`: `cards` or `compact`
- `background`: `plain` or `muted`
- `items[].title`
- `items[].body`
- `items[].iconKey`
- `items[].accentPreset`
- `items[].bullets`

Use for scannable benefits, values, or capability groups. Keep items parallel in length and choose accent presets by meaning.

### `stats`

Metrics or step-style proof points.

Fields:

- `title`
- `intro`
- `variant`: `metrics` or `steps`
- `background`: `plain` or `muted`
- `items[].value`
- `items[].label`
- `items[].description`

Use `metrics` for numbers and proof points. Use `steps` for lightweight process sequences.

### `content`

Flexible informational content with optional split aside.

Fields:

- `title`
- `intro`
- `prose`
- `bullets`
- `actions`
- `aside.title`
- `aside.body`
- `aside.actions`
- `aside.note`
- `layout`: `centered` or `split`
- `background`: `plain` or `muted`

Use for explanatory sections. Use `split` when there is a clear supporting panel or next action.

### `cta`

Conversion or next-step section.

Fields:

- `title`
- `body`
- `actions`
- `note`
- `theme`: `brand` or `slate`
- `pattern`: `none`, `softGrid`, `careDots`, `diagonalLines`, or `gentleWaves`

Use once near the end of a page, or after a major section when the next action is obvious.

### `media`

Reusable image block for page layouts.

Fields:

- `image`: required Payload Media upload relationship
- `alt`: optional alt override
- `caption`
- `layout`: `contained` or `wide`
- `background`: `plain` or `muted`

Use when a page needs an image inside the Content tab instead of the Hero tab. All selectable image assets should live in the `media` collection first.

### `testimonial`

Short quote with attribution.

Fields:

- `quote`
- `author`
- `role`

Use for brief social proof. Do not use it for long case studies; create a specific story block if that pattern repeats.

### `faq`

Question-and-answer list.

Fields:

- `title`
- `intro`
- `items[].question`
- `items[].answer`

Use for concise objections or support content. Keep answers short enough to scan.

### `legalArticle`

Structured legal or policy page content.

Fields:

- `title`
- `lastUpdated`
- `intro`
- `sections[].anchor`
- `sections[].title`
- `sections[].iconKey`
- `sections[].body`
- `sections[].bullets`

Use for `/privacy` and `/terms`. Anchors power the quick navigation, so keep them stable.

### `contactForm`

Public contact submission section.

Fields:

- `title`
- `intro`
- `inquiryTypes[].label`
- `inquiryTypes[].value`
- `contactCards[].title`
- `contactCards[].body`
- `contactCards[].href`
- `contactCards[].iconKey`
- `contactCards[].note`

Use only where public submissions should create `contact-submissions` records.

### `partnershipCards`

Partner/audience cards with bullets and actions.

Fields:

- `title`
- `intro`
- `items[].title`
- `items[].subtitle`
- `items[].body`
- `items[].iconKey`
- `items[].bullets`
- `items[].actions`

Use for partnership audiences, provider types, or repeated program cards.

### `blogArchive`

Published post listing.

Fields:

- `title`
- `intro`

Use on `/blog`. The renderer pulls published posts separately.

## Adding Or Changing Blocks

1. Confirm no existing block can represent the content.
2. Add or update the block schema in `payload/blocks.ts`.
3. Add or update the TypeScript shape in `app/components/sections/section-types.ts`.
4. Map Payload data in `lib/cms.ts`.
5. Render the block in `SectionRenderer.tsx`.
6. Add CSS in `SectionRenderer.module.css`; use classes and tokens, not inline styling.
7. Update `payload/seed-data.ts` if seeded pages need the block.
8. Run `npm run generate:payload-types`.
9. Run `npm run build`.
10. Update this document in the same change.

## Review Checklist

- The block has a clear purpose and is reusable.
- Editors choose from controlled options for visual behavior.
- No raw CSS or arbitrary color strings are stored in Payload content.
- The renderer uses semantic markup and stable heading structure.
- The block is responsive without text overlap.
- Missing optional fields fail gracefully.
- Seed data represents the current public site.
