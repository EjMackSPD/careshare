# CareShare Payload Admin Styling

Payload admin branding should be handled as a small design system, not inline CSS inside React components.

## Source Files

- Admin theme stylesheet: `payload/admin/careshare-admin.css`
- Admin brand components: `payload/admin/CareShareBrand.tsx`
- Admin dashboard view: `payload/admin/CareShareDashboard.tsx`
- Payload layout import: `app/(payload)/layout.tsx`
- Payload config component registration: `payload.config.ts`

## Rules

- Do not inject large style strings with `dangerouslySetInnerHTML`.
- Keep brand colors as CSS custom properties at the top of `careshare-admin.css`.
- Keep React admin components structural: logo, labels, dashboard markup, and links only.
- Prefer Payload-supported component slots before replacing entire admin surfaces.
- Keep admin UI quiet and operational. It should support editing, review, and support workflows, not behave like a marketing page.
- Use 8px radii unless matching an existing Payload control requires less.
- Scope overrides to Payload classes and CareShare classes so public site styles do not leak into admin.

## Token Pattern

Brand primitives live once in `:root`, then component rules use semantic aliases:

- `--careshare-teal`
- `--careshare-teal-dark`
- `--careshare-teal-soft`
- `--careshare-ink`
- `--careshare-muted`
- `--careshare-mint`
- `--careshare-surface`
- `--careshare-surface-raised`
- `--careshare-border`
- `--careshare-text-on-brand`

When the brand palette changes, update the tokens first. Component rules should rarely need color edits.

## Login Screen

The admin login is intentionally branded through:

- `CareShareLoginBranding`
- `CareShareLoginFooter`
- `.template-minimal.login` CSS overrides

Desktop should render as a wide two-column panel. Mobile should stack the brand panel above the form without overlap.

## Dashboard

The custom dashboard uses `CareShareDashboard` for data and structure, while layout and visual styling live in `careshare-admin.css`.

Dashboard cards should link to existing Payload collections or support views. Avoid adding dashboard-only APIs unless the data cannot come from Payload or Prisma directly.

## Verification

After admin styling changes:

1. Visit `/admin/login` at desktop and mobile widths.
2. Visit `/admin` after login.
3. Visit a collection list, especially `/admin/collections/pages`.
4. Run `npm run build`.
5. Run targeted lint for changed admin components.
