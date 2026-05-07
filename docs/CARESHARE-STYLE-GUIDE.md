# CareShare Healthcare Style Guide

This guide defines the CareShare visual system for public marketing pages, product navigation, and Payload admin surfaces. It is based on the public menu and logo: simple navigation, a calm blue brand mark, clear caregiver language, and a professional healthcare tone.

## Design Principles

- Clinical calm: interfaces should feel steady, legible, and low-friction, especially for families under stress.
- Human warmth: use mint, care teal, and soft surfaces to keep the brand from feeling cold or institutional.
- Clear hierarchy: one primary action per view, restrained secondary actions, and readable content rhythm.
- Operational trust: admin and dashboard surfaces should be compact, organized, and scannable.
- No raw one-off styling: use the global tokens in `app/globals.css` and mirrored Payload admin tokens in `payload/admin/careshare-admin.css`.

## Menu-Derived Navigation

Primary public navigation stays focused:

- Features
- Blog
- Partnerships
- Login
- Try Demo

Navigation should use white or translucent raised surfaces, blue hover/focus states, and one care-colored action. Avoid adding extra labels, badges, or decorative controls to the header unless the product flow requires them.

## Color System

- Brand blue: `--cs-color-brand` / `#287fae`
  Used for primary brand actions, links, active states, and key headings.
- Deep clinical blue: `--cs-color-brand-deep` / `#12384d`
  Used for footer, high-contrast text, and serious operational surfaces.
- Care teal: `--cs-color-care` / `#0f766e`
  Used for success, care coordination, support context, and admin emphasis.
- Mint surface: `--cs-color-care-soft` / `#e4f6ef`
  Used for selected rows, soft panels, and quiet healthcare backgrounds.
- Warm amber: `--cs-color-warm` / `#f2ad4b`
  Reserved for small semantic accents and icon presets only. Do not use amber/orange for buttons.
- Rose: `--cs-color-rose` / `#d94f5c`
  Used only for destructive, risk, or error states.
- Ink/text: `--cs-color-ink`, `--cs-color-text`, `--cs-color-muted`
  Used for readable hierarchy. Do not use pure black for product text.

## Typography

Use `--cs-font-sans` everywhere. Headings should be confident but not oversized inside operational UIs. Body copy should sit around `1rem` to `1.125rem` with generous line height. Labels and table headers use uppercase only for short operational group labels.

## Shape And Elevation

- Small controls: `--cs-radius-sm` (`6px`)
- Buttons/cards/admin rows: `--cs-radius-md` (`8px`)
- Larger media frames or hero panels: `--cs-radius-lg` to `--cs-radius-xl`
- Use `--cs-shadow-soft` for resting elevation and `--cs-shadow-lift` for hover.

Cards should be quiet and purposeful. Avoid nested cards and avoid heavy shadows.

## Button System

- Primary buttons: brand blue gradient, white text, brand shadow. Use for the main action in a view.
- Secondary buttons: white or glass surface, brand text, restrained border. Use for supporting navigation.
- Care accent buttons: care teal to brand blue gradient, white text, care shadow. Use for demo/support/help actions that need distinction without using orange.
- Ghost buttons: transparent or lightly tinted surface. Use only in dense nav, admin chrome, and compact toolbars.
- Destructive buttons: rose, only for destructive or high-risk actions.

Shared button tokens live in `app/globals.css` as `--cs-button-*`. Payload action variant values remain `primary`, `secondary`, and `accent`; `accent` means Care Accent, not orange.

## Components

- Feature icons: semantic presets only. Do not store raw hex values in CMS content.
- Media: images should come from Payload Media and sit in stable aspect-ratio frames.
- Footer: deep clinical blue with muted copy and mint/blue hover states.
- Admin: compact white surfaces, 8px radius, blue-led brand tokens, teal support accents.

## Accessibility

All focus states should use a visible brand or care outline. Text on brand/deep surfaces must be white or near-white. Do not place small text on image backgrounds without a strong overlay or surface.
