# Arreglao Design System

## What is Arreglao

Arreglao is a home-services marketplace app. People who need a job done (repairs, cleaning, moving, small renovations…) publish an **annonce** (a listing/request) describing the work. Only people looking for help can publish — it's need-driven, not a catalog of standing service listings. Professionals and helpers browse open annonces and **apply**. The person who posted the annonce reviews applicants and **chooses** who does the work. Core loop: **Post → Apply → Choose → Get it done.**

Primary surface: a mobile app (iOS-style). No web marketing site or codebase was provided in this pass.

## Sources

- One reference image was uploaded: `uploads/b8d525c42c96270d0dfd2f2787bdea96.webp` — three mobile screens from an unrelated travel-guide app. **This is a mood/style reference only** (it is not Arreglao's own UI — different product, different copy). No Figma file, GitHub repo, or Arreglao product screenshots were provided.
- Everything below (palette, type, components, UI kit copy) is originated from that visual mood plus the product description, since no existing Arreglao brand or codebase exists yet. Treat this as v1 — see the ask at the end.

## Content fundamentals

- **Voice:** direct, practical, encouraging — like a helpful neighbor, not a corporate platform. Short sentences. Verbs first ("Post a job", "Choose your pro").
- **Person:** speak to the user as "you"; the poster is "you", the professional is "you" when addressed directly. Refer to the two sides plainly as **the poster** and **the helper/pro** — avoid jargon like "requester" or "provider".
- **Casing:** sentence case everywhere (buttons, headers, nav labels) — never title case, never all-caps except tiny eyebrow labels/badges.
- **Terminology:** the core object is an **annonce** (kept as-is, not translated to "listing" or "post") — it's the product's own word. An annonce has a **status** (open, in review, assigned, done). People who respond are **applicants**; the poster **chooses** one, never "hires" or "books".
- **Emoji:** none in UI chrome. Fine only in optional freeform chat messages between users.
- **Numbers/specifics:** show real, concrete details (distance, price range, rating, response time) rather than vague marketing language — mirrors the reference app's "4.0 km", "4.1 ★" style of ambient specificity.
- **Tone examples:**
  - Empty state: "No annonces near you yet. Widen your search or check back soon."
  - CTA: "Post what you need" / "Apply to help"
  - Confirmation: "You picked Marco for this job. We'll let the other applicants know."

## Visual foundations

- **Palette:** warm sand/off-white base (`--bg-page`) with an olive-tinted neutral scale (`--olive-*`) instead of cool grays — nods to the reference's outdoor, natural mood. One loud accent: a lime/chartreuse (`--accent`) used sparingly for primary actions, active states and highlight chips — never as a background wash. Deep near-black ink (`--ink-900`) doubles as body text color and as a dark surface for photo overlays and inverse cards.
- **Type:** one family, Plus Jakarta Sans (Google Fonts nearest match — see note below) — geometric, rounded terminals, friendly but efficient. Bold/extrabold for display headlines, medium/semibold for UI labels, regular for body. Tight tracking on large display text, normal elsewhere.
- **Backgrounds:** full-bleed photography is the default hero treatment (job/location photos), with dark gradient scrims for text legibility — never flat illustration or geometric patterns. No repeating textures.
- **Cards:** medium-large radii (14–20px), soft ambient shadow (`--shadow-card`), no colored left-border accents. Photo cards carry a bottom dark gradient scrim with white text; content cards on sand background use a plain white surface with a 1px subtle olive border instead of a shadow when nested.
- **Glass/overlay chips:** small pill-shaped info chips floating on photos (distance, rating, nav instructions) use a dark translucent glass fill (`rgba(20,23,15,0.55)` + blur) with white text — this is the system's signature "floating chip on photo" motif.
- **Buttons:** pill-shaped (`--radius-pill`), lime fill + dark ink text for primary; dark ink fill + white text for secondary/inverse contexts; plain outline/ghost for tertiary. No gradients on buttons.
- **Hover/press:** hover deepens the lime a step (`--accent` → `--accent-hover`); press deepens further (`--accent-active`) plus a subtle `scale(0.98)`. Outline/ghost buttons gain a faint sand fill on hover. No opacity-fade hover style.
- **Motion:** fast and understated — 120–180ms ease-out for hover/press, 200–260ms ease-in-out for sheets/modals sliding up. No bounce, no springs, no big fades.
- **Shadows:** one soft ambient card shadow + a heavier modal shadow for sheets/dialogs. No hard drop shadows, no inner shadows except a 1px inner highlight on the glass chips.
- **Corner radii scale:** 8 / 14 / 20 / 28 / pill — small controls use 8–14, cards 14–20, sheets/hero cards 20–28, buttons/chips/tags full pill.
- **Transparency/blur:** used only for chips and nav bars sitting on top of photography (never on plain sand backgrounds) — always paired with a dark tint so white text stays legible.
- **Imagery color vibe:** warm, saturated greens and natural daylight tones (mirroring the reference), no black-and-white, no heavy grain/filter.
- **Layout:** single-column mobile-first screens, fixed bottom tab bar (3 items), fixed top status/location bar; content scrolls beneath both.

## Iconography

No icon set or codebase was provided. Icons are sourced from **Lucide** (CDN, MIT-licensed, stroke-based — closest match to the reference app's thin-stroke line icons for search/heart/bell/nav) — this is a **flagged substitution**, not the brand's real icon set. Used at 20–24px, 1.5–1.75px stroke, no fill by default; filled/lime variant only for active/selected states (e.g. active tab icon, saved heart). No emoji, no unicode glyphs as icons.

## Fonts note

No Arreglao font files were provided. **Plus Jakarta Sans** (Google Fonts) is used as the nearest match to the reference image's rounded geometric sans. Flagging this — if Arreglao has real brand font files, please share them and this will be swapped in `tokens/fonts.css`.

## Logo

No Arreglao logo was provided. The brand name is rendered in plain type (Plus Jakarta Sans, extrabold) wherever a mark would normally sit. Do not draw a substitute mark — this system waits on a real logo.

## Components

- **Core** (`components/core/`): Button, IconButton, Card, Badge, Tag, Avatar (intentional addition — see below)
- **Forms** (`components/forms/`): Input, Select, Checkbox, Radio, Switch
- **Feedback** (`components/feedback/`): Dialog, Toast, Tooltip
- **Navigation** (`components/navigation/`): Tabs

No codebase or Figma defined a component inventory, so this is the standard set sized to Arreglao's needs (annonce browsing, applying, choosing). **Intentional addition:** Avatar — not in the reference image, added because poster/applicant identity is central to the product.

## Index

- `styles.css` — root stylesheet entry (imports everything below)
- `tokens/` — colors, typography, spacing/radii/shadows, fonts
- `components/` — reusable UI primitives (see component cards in the Design System tab)
- `ui_kits/app/` — Arreglao mobile app: onboarding, home/browse, annonce detail, applicants, post-annonce, profile — click-through in `ui_kits/app/index.html`
- `guidelines/` — foundation specimen cards (colors, type, spacing, radii/shadows, brand motifs)
- `assets/mood-reference.webp` — the uploaded style reference (different product; style only)
- `SKILL.md` — portable skill file for use elsewhere (e.g. Claude Code)

## Ask

This is a v1 built from a single mood-reference image plus your product description — no existing Arreglao brand, codebase, or Figma was available. To get this to "perfect": please share (1) a real logo/wordmark if one exists, (2) real brand fonts if you have them, (3) any existing Arreglao screenshots or copy so tone/colors can be corrected against the real product, and (4) whether the target market is French- or Spanish-speaking (the word "annonce" reads French, "Arreglao" reads Spanish) so terminology matches.
