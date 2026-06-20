---
name: book-studio-design-system
description: Premium publishing-studio design system for Book Studio AI. Apply whenever creating or modifying UI, UX, branding, marketing pages, onboarding flows, dashboards, components, typography, color systems, animations, illustrations, copywriting, or user journeys.
version: 1.0.0
owner: Product Design
priority: high
---

# Book Studio AI — Design System

Book Studio AI transforms knowledge into published books. The product is **not** an AI writing tool — it is a **premium publishing studio**. Every decision reinforces: *"I already have a book inside me."*

## Authority (resolve conflicts top-down)

1. User trust
2. Emotional clarity
3. Publishing-studio identity
4. Mobile usability
5. Accessibility
6. Performance
7. Implementation simplicity

Never sacrifice a higher principle for a lower one.

## Positioning

| We are | We are not |
|---|---|
| Premium publishing studio | Generic SaaS app |
| Guided authoring platform | AI chatbot |
| Knowledge-to-book system | Productivity tool |
| Creative companion | Content generator |
| Author transformation platform | Startup template |

Reference brands: Apple, Linear, Notion, Arc, Penguin Random House.

## Emotional outcomes (every screen supports ≥1)

1. I already have valuable knowledge.
2. My content can become a book.
3. The process feels achievable.
4. The output feels professional.
5. I can become an author.

## Visual language

- **Pursue:** editorial, premium, literary, modern, calm, human, aspirational.
- **Avoid:** playful, cartoon, technical, futuristic, crypto, startup aesthetic.

## Color tokens

```css
/* Foundation */
--background: #FAF8F5;   --surface: #FFFFFF;
--text-primary: #111827; --text-secondary: #6B7280; --border: #E7E3DD;
/* Brand */
--midnight: #0F172A; --ink: #1E293B;
--indigo: #4F46E5;   --indigo-soft: #6366F1; --indigo-glow: #818CF8;
--success: #0F766E;
/* Signature gradient */
background: linear-gradient(135deg, #4F46E5 0%, #6366F1 40%, #818CF8 100%);
```

**Codebase mapping (Tailwind):** `bg-canvas` / `bg-card` / `text-ink` / `text-subtle` / `border-line` / `bg-midnight` / `bg-midnight-soft` / `text-indigo` `bg-indigo` / `text-indigo-glow` / `text-success` / gradient `bg-brand` + `.text-gradient`.

**Rules:** indigo is the primary accent; midnight signals premium emphasis; ivory backgrounds by default. **No new accent colors without explicit approval. Orange is deprecated.**

## Typography

- **Playfair Display** (`.font-display`) → headlines, editorial moments, book titles, transformation messaging.
- **Inter** (`font-sans`) → navigation, forms, dashboards, settings, buttons, supporting copy.
- Headlines inspire; body explains. Avoid jargon and AI buzzwords. Prefer outcomes over features.

## Layout

- Generous whitespace — breathing room reads as quality.
- One primary action per section; one primary CTA per viewport.
- Remove anything that doesn't improve clarity, trust, or conversion.

## Scrollytelling framework

Marketing pages follow a narrative, never unrelated feature blocks. Every section advances the story:

1. **Knowledge Exists** — the user already has valuable content.
2. **Knowledge Is Scattered** — across notes, PDFs, recipes, posts, memories.
3. **Transformation** — Book Studio AI organizes and structures it.
4. **Blueprint** — a clear book structure emerges.
5. **Manuscript** — chapters are created and refined.
6. **Publication** — a finished book becomes reality.

## Motion

- Communicate progress, transformation, discovery, completion.
- Stack: Framer Motion + GSAP ScrollTrigger.
- Characteristics: smooth, elegant, slow, intentional.
- Avoid bounce, excessive parallax, decorative animation.

## Components

- **Buttons** — prefer: *Start My Book · Create My Book · Build My Blueprint · Generate My Chapters · Publish My Book*. Avoid: *Get Started · Submit · Generate Content*.
- **Cards** — editorial: soft shadows, subtle borders, large spacing, clear hierarchy. Avoid heavy borders, dashboard styling, dense layouts.
- **Navigation** — minimal. Desktop: Logo · How It Works · Pricing · Dashboard · primary CTA. Mobile: Logo · Menu · primary CTA.
- **Book visuals** — prefer covers, manuscripts, chapters, editorial layouts, publishing artifacts. Avoid robots, AI mascots, abstract tech graphics. *The hero is becoming an author, not using AI.*

## Copy

Lead with transformation, not functionality.

- **Prefer:** "Turn your knowledge into a published book." · "Transform years of experience into a manuscript." · "Build your blueprint." · "Become an author."
- **Avoid:** "AI-powered content generation." · "Leverage large language models." · "Next-generation writing assistant."

## Mobile (required)

Mobile-first; no horizontal scroll; no overlapping elements; ≥44px tap targets; sticky CTA when beneficial; reduced animation complexity. **If desktop and mobile conflict, choose the better mobile experience.**

## Accessibility (not optional)

WCAG AA contrast · keyboard navigation · visible focus states · semantic HTML · `prefers-reduced-motion` support.

## Performance

Lighthouse > 95 · CLS < 0.1 · fast mobile rendering · 60fps animations. Prefer perceived performance over visual complexity.

## Review checklist (block merge on any "No")

- [ ] Feels like a publishing studio?
- [ ] Reinforces author identity?
- [ ] Improves trust?
- [ ] Color system consistent?
- [ ] Typography consistent?
- [ ] Mobile excellent?
- [ ] Motion purposeful?
- [ ] Accessibility preserved?
- [ ] Clear primary CTA?
- [ ] Feels premium?
