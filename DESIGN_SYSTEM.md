# neurox-console Design System

**Version 1.0** | Last Updated: April 17, 2026  
**Status**: Foundation for frontend refactor (Fey-inspired, dark-first, purple brand, data-forward)

---

## Table of Contents

1. [Design Philosophy](#design-philosophy)
2. [Color Tokens](#color-tokens)
3. [Typography Scale](#typography-scale)
4. [Spacing Scale](#spacing-scale)
5. [Border Radius](#border-radius)
6. [Elevation & Surfaces](#elevation--surfaces)
7. [Component Specifications](#component-specifications)
8. [Layout System](#layout-system)
9. [Motion & Animation](#motion--animation)
10. [Accessibility](#accessibility)
11. [CSS Variables Reference](#css-variables-reference)
12. [Migration Guide](#migration-guide)

---

## Design Philosophy

The neurox-console design system follows a **premium dark-first aesthetic** inspired by Fey.com, optimized for data-heavy admin dashboards. Every design decision prioritizes clarity, efficiency, and visual hierarchy without unnecessary ornamentation.

### 1. **Neutral Profundity**

Colors are intentionally near-monochromatic. Information density and importance drive visual hierarchy, not bright decorations. The canvas is pure black (`#0a0a0a`), and surfaces layer upward through carefully calibrated gray tones. Only semantic states (success, danger, warning) and the brand accent (purple) break neutrality, and only when meaning is critical.

**Practical implementation**:
- Avoid colored borders or backgrounds for aesthetic reasons
- Reserve color for data (positive/negative indicators, status badges, brand CTAs)
- Use opacity and surface elevation to show relationships, not hue shifts

### 2. **Data-Forward Typography**

Numbers, metrics, and labels are the protagonist. Typography is tight, large for primary data, and scaled aggressively for visual scanning. Titles are uppercase, condensed, and discretely colored in muted gray to avoid visual clutter.

**Practical implementation**:
- Price/metric values: `2.5–3rem`, `font-weight: 700`, `letter-spacing: -0.02em` (negative tracking for tightness)
- Section titles: `0.75rem`, uppercase, `letter-spacing: 0.08em`, muted color
- Body copy: `0.875rem`, `line-height: 1.6` for readability

### 3. **Generous Spacing & Breathing Room**

Whitespace (or in dark theme, "darkspace") is abundant. Cards have `24px` padding. Sections are separated by `32–48px` vertical gaps. Empty space is intentional and functional, not a residual. This reduces cognitive load in a data-heavy UI.

**Practical implementation**:
- Minimum padding on containers: `24px`
- Gap between major sections: `32px` (or `48px` for visual breaks)
- Internal component spacing: `12–16px` for nested elements
- Use gap utilities aggressively; never cramp components

### 4. **Invisible Elevation**

Depth is achieved through color value shifts, not shadows. Cards are elevated by changing background to a slightly lighter gray (`#161616`), with a hairline border in `rgba(255,255,255,0.06)`. Shadows are minimal or absent. This creates a flat, modern aesthetic while maintaining depth.

**Practical implementation**:
- Base surface: `#0a0a0a`
- Elevated surface (cards, modals): `#161616` + subtle border
- Hover/interactive elevation: `#1a1a1a` + slight border intensification
- Never rely on `box-shadow` for visual structure; use surface color instead

### 5. **Without Sidebar, With Floating Dock**

Navigation is not a fixed sidebar consuming 15–20% of viewport width. Instead, the primary navigation is a **floating bottom dock** (similar to macOS Dock), centered horizontally near the bottom, shaped like a pill. This preserves content real estate and feels lightweight. Secondary/contextual navigation lives in collapsible panels or top header.

**Practical implementation**:
- Primary nav: floating bottom dock, `position: fixed`, centered, `z-index: 1000`
- Secondary nav: header or right sidebar (collapsible)
- Content stretches full width, unobstructed by fixed sidebars
- Dock icons: `24px`, spacing `12px` internal

---

## Color Tokens

All colors use CSS custom properties (variables) for theme consistency and future light-mode support.

### Base Palette

| Token | Hex | Rgba | Use Case |
|-------|-----|------|----------|
| `--surface-0` | `#0a0a0a` | Page background, base |
| `--surface-1` | `#0f0f0f` | Alt page background, divider fills |
| `--surface-2` | `#161616` | Card backgrounds, elevated surfaces |
| `--surface-3` | `#1a1a1a` | Hover state, secondary cards |
| `--surface-4` | `#1e1e1e` | Tab active, button hover |
| `--surface-5` | `#222222` | Deep elevated surfaces, panels |

### Text Colors

| Token | Hex | Use Case |
|-------|-----|----------|
| `--text-primary` | `#f5f5f5` | Body text, primary labels |
| `--text-secondary` | `#888888` | Secondary labels, description |
| `--text-tertiary` | `#555555` | Muted text, subtle captions |
| `--text-disabled` | `#404040` | Disabled form fields, inactive elements |
| `--text-inverse` | `#ffffff` | White text on colored backgrounds (badges, buttons) |

### Border Colors

| Token | Rgba | Use Case |
|-------|------|----------|
| `--border-subtle` | `rgba(255,255,255,0.06)` | Default card border, divider lines |
| `--border-default` | `rgba(255,255,255,0.08)` | Focused input border, emphasized divider |
| `--border-strong` | `rgba(255,255,255,0.12)` | Error state border, strong visual divider |

### Brand & Accent

| Token | Hex | Use Case |
|-------|-----|----------|
| `--brand-500` | `#7c6af7` | Primary CTA button, active state |
| `--brand-600` | `#6d5ae3` | Brand hover state |
| `--brand-400` | `#9984ff` | Brand background (low-contrast), brand badge |
| `--brand-light` | `rgba(124, 106, 247, 0.12)` | Brand badge background |

### Semantic Colors

| Token | Hex | Use Case |
|-------|-----|----------|
| `--success-500` | `#22c55e` | Positive action, success state |
| `--success-400` | `#4ade80` | Success text variant |
| `--success-light` | `rgba(34, 197, 94, 0.12)` | Success badge background |
| `--danger-500` | `#ef4444` | Error state, destructive action |
| `--danger-400` | `#f87171` | Error text variant |
| `--danger-light` | `rgba(239, 68, 68, 0.12)` | Danger badge background |
| `--warning-500` | `#f59e0b` | Warning, caution action |
| `--warning-400` | `#fbbf24` | Warning text variant |
| `--warning-light` | `rgba(245, 158, 11, 0.12)` | Warning badge background |
| `--info-500` | `#3b82f6` | Informational, secondary action |
| `--info-400` | `#60a5fa` | Info text variant |
| `--info-light` | `rgba(59, 130, 246, 0.12)` | Info badge background |

### Transparency & Overlay

| Token | Rgba | Use Case |
|-------|------|----------|
| `--overlay-light` | `rgba(0, 0, 0, 0.3)` | Modal overlay, light dimming |
| `--overlay-dark` | `rgba(0, 0, 0, 0.6)` | Modal overlay, strong dimming |

---

## Typography Scale

All typography uses the system font stack: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif` (equivalent to Inter in rendering).

### Headline & Display

| Level | Size | Weight | Line-Height | Letter-Spacing | Use Case |
|-------|------|--------|-------------|-----------------|----------|
| Display | `3rem` (48px) | 700 | 1.2 | `-0.02em` | Page hero title (rarely used in admin) |
| H1 | `2rem` (32px) | 700 | 1.3 | `-0.01em` | Page title |
| H2 | `1.5rem` (24px) | 700 | 1.3 | `0em` | Section heading |
| H3 | `1.25rem` (20px) | 600 | 1.4 | `0em` | Subsection heading |
| H4 | `1rem` (16px) | 600 | 1.5 | `0em` | Card title |

### Metric/Data

| Level | Size | Weight | Line-Height | Letter-Spacing | Use Case |
|-------|------|--------|-------------|-----------------|----------|
| Metric-XL | `2.5rem` (40px) | 700 | 1 | `-0.02em` | Large number (price, count) |
| Metric-L | `2rem` (32px) | 700 | 1 | `-0.02em` | Large number variant |
| Metric-M | `1.5rem` (24px) | 600 | 1 | `-0.02em` | Medium metric |
| Metric-S | `1.25rem` (20px) | 600 | 1 | `-0.01em` | Small metric |

### Body & UI

| Level | Size | Weight | Line-Height | Letter-Spacing | Use Case |
|-------|------|--------|-------------|-----------------|----------|
| Body-L | `1rem` (16px) | 400 | 1.6 | `0em` | Body text, descriptions |
| Body-M | `0.875rem` (14px) | 400 | 1.6 | `0em` | Standard body copy, list items |
| Body-S | `0.8125rem` (13px) | 400 | 1.5 | `0em` | Small body, table cells |
| Label | `0.75rem` (12px) | 500 | 1.5 | `0.08em` | Form labels, column headers (uppercase) |
| Caption | `0.6875rem` (11px) | 400 | 1.4 | `0em` | Muted captions, help text, metadata |
| Overline | `0.625rem` (10px) | 600 | 1 | `0.12em` | Stats label, timestamp prefix (uppercase) |

---

## Spacing Scale

Based on a **4px grid**. All spacing uses multiples of 4px for consistency.

### Scale

| Token | Value | Common Use |
|-------|-------|-----------|
| `xs` | `4px` | Gaps in tight components, icon spacing |
| `sm` | `8px` | Padding in small buttons, internal badge spacing |
| `md` | `12px` | Internal padding in form fields |
| `lg` | `16px` | Card padding (internal), component spacing |
| `xl` | `20px` | Standard container padding |
| `2xl` | `24px` | Card padding (standard) |
| `3xl` | `28px` | Large card padding |
| `4xl` | `32px` | Section gap |
| `5xl` | `40px` | Major section separation |
| `6xl` | `48px` | Full-page layout gap, dock margin-bottom |
| `7xl` | `64px` | Viewport spacing, large breaks |

### Layout Padding

- **Page wrapper**: `2xl` (24px) on desktop, `xl` (20px) on tablet, `lg` (16px) on mobile
- **Card internal**: `2xl` (24px) horizontal, `xl` (20px) vertical
- **Modal padding**: `2xl` (24px) all sides
- **Dock bottom margin**: `6xl` (48px) to avoid overlap with content

---

## Border Radius

| Token | Value | Use Case |
|-------|-------|----------|
| `pill` | `9999px` | Buttons, badges, dock shape |
| `lg` | `16px` | Large cards, panels, modals |
| `md` | `12px` | Standard card, table cells, inputs |
| `sm` | `8px` | Small components, time-range pills, tabs |
| `xs` | `4px` | Micro-elements, icon buttons |

---

## Elevation & Surfaces

Elevation is achieved through **background color**, not shadows. All surface changes are accompanied by optional subtle borders.

### Elevation Levels

| Level | Background | Border | Use Case |
|-------|-----------|--------|----------|
| Flat | `--surface-0` | None | Page background |
| Raised | `--surface-1` | `--border-subtle` (optional) | Alternative fill, subtle emphasis |
| Elevated | `--surface-2` | `--border-subtle` | Cards, contained sections |
| Interactive | `--surface-3` | `--border-default` | Hover state, focused containers |
| Panel | `--surface-5` | `--border-default` | Side panels, modals, drawers |

### Shadow Use (Minimal)

Only use subtle shadows in these cases:

- **Dock shadow**: `0 8px 32px rgba(0, 0, 0, 0.6)` — floating bottom navigation
- **Modal overlay**: `0 20px 60px rgba(0, 0, 0, 0.4)` — dialog backdrop
- **Tooltip**: `0 4px 12px rgba(0, 0, 0, 0.3)` — tooltip on hover

Never use shadows for primary elevation; rely on color shifts.

---

## Component Specifications

### Floating Bottom Dock (Primary Navigation)

The primary navigation replaces the traditional sidebar. It floats at the bottom center of the viewport.

**Anatomy**:

```
┌─────────────────────────────────────────────────┐
│                    CONTENT                      │
│                                                 │
│                                                 │
│                                                 │
├───────────────────────────────────────────────┤
│  padding: 6xl (48px) to avoid overlap           │
└─────────────────────────────────────────────────┘

         ┌──────────────────────────┐
         │  ⌂  📊  ⚙️  👤  🔑  📋  │
         └──────────────────────────┘
         (floating at bottom center)
```

**Styles**:

| Property | Value |
|----------|-------|
| `position` | `fixed` |
| `bottom` | `24px` |
| `left` | `50%` |
| `transform` | `translateX(-50%)` |
| `z-index` | `1000` |
| `background` | `--surface-3` (or `rgba(0,0,0,0.8)` if needed for contrast) |
| `border` | `1px solid --border-subtle` |
| `border-radius` | `pill` (9999px) |
| `padding` | `md` (12px) on x, `sm` (8px) on y (or tighter) |
| `display` | `flex` |
| `gap` | `md` (12px) |
| `box-shadow` | `0 8px 32px rgba(0, 0, 0, 0.6)` |
| `backdrop-filter` | `blur(10px)` (optional for glassmorphic feel) |

**Icon spacing**:

- Icon size: `24px`
- Gap between icons: `12px`
- Active indicator: `4px` dot below icon, color `--brand-500`, or light circular background `--surface-4`

**Responsive**:

- Desktop: Fixed bottom center
- Tablet (< 768px): Consider moving to top (easier thumb reach) or keeping bottom with larger touch targets
- Mobile: Dock should stretch if needed, but prefer `32px+` height for thumb accessibility

**Active State**:

- Background circle behind active icon: `--surface-4`, `border-radius: sm`, opacity blend into button shape
- Icon color: `--brand-500` or `--text-primary` (depend on contrast)

### Header (Minimal)

The header is lean and context-specific. No heavy navigation menu.

**Layout**:

```
[Logo/Title]                    [Context Actions] [User Menu]
```

**Styles**:

| Property | Value |
|----------|-------|
| `height` | `64px` |
| `background` | `--surface-0` |
| `border-bottom` | `1px solid --border-subtle` |
| `padding` | `0 2xl (24px)` |
| `display` | `flex` |
| `align-items` | `center` |
| `justify-content` | `space-between` |

**Logo/Title area**:

- Font: `Body-L` (16px), `font-weight: 600`, color `--text-primary`
- Optional icon: `24px`, margin-right `md` (12px)

**Context Actions** (right-aligned):

- Buttons or icon buttons (see [Buttons](#buttons))
- Breadcrumbs (if needed): `Caption`, muted color, separator `/`
- Search input (if needed): `--surface-2` background, `--border-subtle` border, `md` padding

### Cards (Data Cards, Stat Cards)

Cards are the primary container for isolated information.

**Styles**:

| Property | Value |
|----------|-------|
| `background` | `--surface-2` |
| `border` | `1px solid --border-subtle` |
| `border-radius` | `md` (12px) |
| `padding` | `2xl` (24px) or `xl` (20px) if compact |

**Stat Card variant** (KPI display):

```
┌──────────────────────┐
│ Metric Label (small) │  ← Label: Caption / Overline, --text-tertiary
│ 1,234.56             │  ← Value: Metric-L, --text-primary
│ +12.5% ↑             │  ← Change: Body-S, --success-500 (or --danger-500)
└──────────────────────┘
```

**Layout**:

```css
.stat-card {
  display: flex;
  flex-direction: column;
  gap: lg (16px);
}
.stat-label {
  font-size: 0.6875rem; /* Caption */
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
.stat-value {
  font-size: 2rem; /* Metric-M */
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--text-primary);
}
.stat-change {
  font-size: 0.875rem; /* Body-M */
  color: var(--success-500); /* or --danger-500 */
}
```

### Tables

Tables display structured data with subtle separators.

**Styles**:

| Property | Value |
|----------|-------|
| `background` | `--surface-2` |
| `border` | `1px solid --border-subtle` |
| `border-radius` | `md` (12px) |
| `overflow` | `hidden` |

**Header row**:

- Background: `--surface-3`
- Font: `Label` (12px, uppercase, letter-spacing: 0.08em)
- Color: `--text-secondary`
- Padding: `lg` (16px) vertical, `xl` (20px) horizontal
- Border-bottom: `1px solid --border-subtle`

**Body rows**:

- Font: `Body-M` (14px)
- Padding: `lg` (16px) vertical, `xl` (20px) horizontal
- Border-bottom: `1px solid --border-subtle` (except last row)
- Hover: Background `--surface-3`
- Color: `--text-primary`

**Condensed metrics** (right-aligned):

- Font: `Body-S` (13px), monospace if numeric (optional)
- Color: Semantic (green for positive, red for negative) or `--text-secondary`

### Badges (Status, Visibility, Role)

Small inline labels for status, visibility level, or classification.

**Styles**:

| Style | Background | Text | Border | Radius | Use Case |
|-------|-----------|------|--------|--------|----------|
| Primary | `--brand-light` | `--brand-500` | None | `sm` (8px) | Brand badge |
| Success | `--success-light` | `--success-500` | None | `sm` | Active, positive |
| Danger | `--danger-light` | `--danger-500` | None | `sm` | Inactive, error |
| Warning | `--warning-light` | `--warning-500` | None | `sm` | Caution |
| Info | `--info-light` | `--info-500` | None | `sm` | Info |
| Neutral | `--surface-3` | `--text-secondary` | `1px solid --border-subtle` | `sm` | Neutral state |
| Outline | `transparent` | Color varies | `1px solid` (color-matched) | `sm` | Secondary badge |

**Typography**:

- Font: `Body-S` (13px), `font-weight: 600`
- Padding: `xs` (4px) on y, `sm` (8px) on x
- Line-height: `1`

**Example HTML**:

```html
<!-- Success badge -->
<span class="badge badge-success">
  Active
</span>

<!-- Custom visibility badge -->
<span class="badge badge-outline" style="--badge-color: var(--text-secondary);">
  Personal
</span>
```

### Buttons

Buttons have three primary variants: Primary, Secondary, Ghost. Plus a Danger variant for destructive actions.

#### Primary Button

- **Background**: `--brand-500`
- **Text**: `--text-inverse`
- **Padding**: `sm` (8px) vertical, `lg` (16px) horizontal
- **Radius**: `pill` (9999px) or `sm` (8px) (consult existing buttons in project)
- **Font**: `Body-M` (14px), `font-weight: 600`
- **Hover**: Background `--brand-600`
- **Active**: Background `--brand-600`, slightly darker
- **Disabled**: Background `--surface-3`, text `--text-disabled`

#### Secondary Button

- **Background**: `--surface-3`
- **Text**: `--text-primary`
- **Border**: `1px solid --border-default`
- **Padding/Radius/Font**: Same as Primary
- **Hover**: Background `--surface-4`
- **Disabled**: Background `--surface-1`, text `--text-disabled`

#### Ghost Button

- **Background**: `transparent`
- **Text**: `--text-primary`
- **Border**: None
- **Padding/Radius/Font**: Same as Primary
- **Hover**: Background `--surface-2`
- **Disabled**: Text `--text-disabled`

#### Danger Button

- **Background**: `--danger-500`
- **Text**: `--text-inverse`
- **Padding/Radius/Font**: Same as Primary
- **Hover**: Background darker (e.g., `#dc2626`)
- **Disabled**: Same as Primary disabled

#### Icon Button

- **Size**: `36px` or `40px` (square or circle)
- **Background**: `--surface-2` or transparent
- **Radius**: `sm` (8px) or `pill`
- **Icon**: `20px`, center-aligned
- **Hover**: Background `--surface-3`

### Forms & Inputs

#### Text Input

- **Background**: `--surface-2`
- **Border**: `1px solid --border-subtle`
- **Padding**: `md` (12px) on x, `sm` (8px) on y
- **Radius**: `sm` (8px)
- **Font**: `Body-M` (14px), `--text-primary`
- **Focus**: Border `--border-default`, outline `2px solid --brand-400`, outline-offset `2px`
- **Placeholder**: `--text-tertiary`
- **Disabled**: Background `--surface-1`, border `--border-subtle`, text `--text-disabled`

#### Select Dropdown

- Same as Text Input
- Arrow icon: `--text-secondary`, right-aligned, `16px`

#### Checkbox / Radio

- **Size**: `16px`
- **Unchecked border**: `1px solid --border-default`, `2px` for radio
- **Checked background**: `--brand-500`
- **Checked icon/dot**: `--text-inverse`
- **Focus**: Outline (same as inputs)
- **Disabled**: Opacity `0.5`

#### Form Label

- **Font**: `Label` (12px, uppercase, letter-spacing: 0.08em)
- **Color**: `--text-secondary`
- **Margin-bottom**: `sm` (8px)

### Time Range Pills

Horizontal selector for time periods (1D, 1W, 1M, YTD, etc.).

**Inactive state**:

- Background: `transparent`
- Text: `--text-secondary`
- Border: None
- Padding: `xs` (4px) y, `sm` (8px) x

**Active state**:

- Background: `--surface-3`
- Text: `--text-primary`
- Border: None
- Padding: Same
- Radius: `sm` (8px)

**Hover state** (inactive):

- Background: `--surface-2` (subtle indication)

### Tab Selector

Horizontal tab navigation within a section.

**Inactive tab**:

- Background: `transparent`
- Text: `--text-secondary`
- Border-bottom: `2px solid transparent`
- Padding: `sm` (8px) y, `md` (12px) x

**Active tab**:

- Background: `transparent` or `--surface-3` (depends on design intent)
- Text: `--text-primary`
- Border-bottom: `2px solid --brand-500`
- Padding: Same

### Dialogs & Modals

#### Modal Overlay

- Background: `--overlay-dark` (`rgba(0, 0, 0, 0.6)`)
- Position: `fixed`, full viewport

#### Modal Container

- **Background**: `--surface-2`
- **Border**: `1px solid --border-subtle`
- **Radius**: `lg` (16px)
- **Padding**: `2xl` (24px)
- **Max-width**: `512px` (standard), `768px` (large)
- **Box-shadow**: `0 20px 60px rgba(0, 0, 0, 0.4)`

#### Modal Header

- **Title**: `H3` (20px), margin-bottom `lg` (16px)
- **Close button**: Icon button (top right), `--text-secondary`, hover → `--text-primary`

#### Modal Footer

- **Border-top**: `1px solid --border-subtle`
- **Padding-top**: `2xl` (24px)
- **Button layout**: Flex, gap `md` (12px), justify `flex-end`

### Empty States

When a section has no data, show an empty state illustration + message + optional action.

**Styles**:

- **Container**: Centered, `py: 4xl` (32px), `px: 2xl` (24px)
- **Illustration**: `64px` or `80px` icon/SVG, opacity `0.5`, color `--text-tertiary`
- **Title**: `H4` (16px), color `--text-primary`, margin-top `lg` (16px)
- **Description**: `Body-M` (14px), color `--text-secondary`, max-width `320px`, center, margin-top `sm` (8px)
- **Action button**: Primary button, margin-top `lg` (16px)

### Loading Skeletons

Skeleton screens mimic component structure while content loads.

**Styles**:

- **Background**: `--surface-3`
- **Radius**: Match target component (e.g., `md` for cards)
- **Animation**: `opacity: 0.6` → `opacity: 1` → loop, duration `1.5s`, `ease-in-out`
- **Height**: Approximate line height of content (e.g., `24px` for title, `16px` for body text)

---

## Layout System

### Page Structure

All pages follow a consistent layout:

```
┌─────────────────────────────────────────────────────────────┐
│                        HEADER (64px)                         │
├─────────────────────────────────────────────────────────────┤
│                    CONTENT AREA                              │
│  ┌─────────────────────────┬──────────────────────────────┐  │
│  │ MAIN (70%)              │ SIDEBAR (30%, collapsible)   │  │
│  │                         │                              │  │
│  │ - Title                 │ - Context info               │  │
│  │ - Breadcrumb (opt.)     │ - Related actions            │  │
│  │ - Filters/Controls      │ - Metadata                   │  │
│  │ - Data (table/cards)    │                              │  │
│  │                         │                              │  │
│  └─────────────────────────┴──────────────────────────────┘  │
│  Padding: 2xl (24px) on desktop, xl (20px) on tablet        │
├─────────────────────────────────────────────────────────────┤
│  FOOTER (optional, auto-push with sticky dock bottom)       │
└─────────────────────────────────────────────────────────────┘

         ┌────────────────────────────────┐
         │  ⌂  📊  ⚙️  👤  🔑  📋        │ (Floating dock, z:1000)
         └────────────────────────────────┘
```

### Main Content Area

- **Max-width**: `1400px` (or full on ultra-wide, with side margins)
- **Margin**: `0 auto` (center)
- **Padding**: `2xl` (24px) on x-axis (desktop), `xl` (20px) on tablet, `lg` (16px) on mobile
- **Grid**: 2-column (main + sidebar on desktop), single column on mobile

### Two-Column Layout

- **Main column**: `flex: 0.7`
- **Sidebar column**: `flex: 0.3`, min-width `280px`, collapsible on mobile
- **Gap**: `2xl` (24px)

---

## Motion & Animation

### Transitions

All transitions use consistent timing and easing:

- **Duration**: `150ms` for quick feedback (hover, state change), `300ms` for deliberate motion (open/close)
- **Easing**: `cubic-bezier(0.4, 0, 0.2, 1)` (smooth standard easing)

### Common Transitions

| Element | Property | Duration | Easing |
|---------|----------|----------|--------|
| Button | `background-color`, `border-color` | `150ms` | smooth |
| Input focus | `border-color`, `outline` | `150ms` | smooth |
| Modal open | `opacity`, `transform` (scale) | `300ms` | smooth |
| Dropdown menu | `opacity`, `transform` (translateY) | `200ms` | smooth |
| Sidebar toggle | `width`, `opacity` | `300ms` | smooth |

### Loading Animation

```css
@keyframes skeleton-pulse {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}

.skeleton {
  animation: skeleton-pulse 1.5s ease-in-out infinite;
}
```

### Hover States

- **Cards**: Background `--surface-3`, subtle transition `150ms`
- **Buttons**: Color shift + slight scale (optional, `1.02`)
- **Links**: Color shift (no underline, use opacity change or fade to lighter color)

---

## Accessibility

### Color Contrast

**Minimum WCAG AA compliance** (4.5:1 for normal text, 3:1 for large text):

| Combination | Contrast Ratio | Status |
|-------------|-----------------|--------|
| `--text-primary` on `--surface-0` | ~15:1 | ✅ Pass AAA |
| `--text-primary` on `--surface-2` | ~14:1 | ✅ Pass AAA |
| `--text-secondary` on `--surface-0` | ~4.8:1 | ✅ Pass AA |
| `--brand-500` on `--surface-2` | ~3.2:1 | ⚠️ Avoid for text |
| `--success-500` on white (if needed) | ~3.8:1 | ✅ Pass AA |

**Rules**:

- Never use `--brand-500` as text on dark backgrounds; use `--brand-400` or white text on branded background
- Ensure all interactive elements meet 4.5:1 contrast
- Test with tools: WebAIM Contrast Checker, Stark (Figma)

### Focus Styles

All interactive elements must have visible focus indicators:

```css
input:focus,
button:focus-visible,
a:focus-visible {
  outline: 2px solid var(--brand-400);
  outline-offset: 2px;
}
```

- **Outline width**: `2px` minimum
- **Color**: Brand or high-contrast color (e.g., `--brand-400`)
- **Offset**: `2px` to avoid clipping
- **Never hide focus**: Use `:focus-visible` for better UX (show focus only for keyboard)

### ARIA Patterns

- **Buttons**: No `role` attribute needed if HTML `<button>`
- **Links**: Use `<a>` for navigation; `<button>` for actions
- **Forms**: Always pair `<label for="id">` with `<input id="id">`
- **Icons**: If icon-only button, use `aria-label="Action Name"`
- **Modals**: Use `role="dialog"`, `aria-modal="true"`, `aria-labelledby="title-id"`
- **Tables**: Use `<thead>`, `<tbody>`, `<th scope="col">` for headers
- **Lists**: Use `<ul>`, `<li>` for semantic structure

### Motion & Reduced-Motion

Respect user preference for reduced motion:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## CSS Variables Reference

This is the canonical list of all CSS custom properties to be used project-wide. Copy and paste into `src/index.css` or your global styles file.

### Complete CSS Variables File

```css
/* ============================================================
   neurox-console Design System – CSS Variables
   Dark-first, purple brand, Fey-inspired
   ============================================================ */

:root {
  /* ─────────────────────────────────────────────────────────
     SURFACES & BACKGROUNDS
     ───────────────────────────────────────────────────────── */
  --surface-0: #0a0a0a;      /* page background */
  --surface-1: #0f0f0f;      /* alt page background */
  --surface-2: #161616;      /* card backgrounds */
  --surface-3: #1a1a1a;      /* hover state, secondary cards */
  --surface-4: #1e1e1e;      /* tab active, button hover */
  --surface-5: #222222;      /* deep elevated surfaces */

  /* ─────────────────────────────────────────────────────────
     TEXT COLORS
     ───────────────────────────────────────────────────────── */
  --text-primary: #f5f5f5;        /* body text, primary labels */
  --text-secondary: #888888;      /* secondary labels, description */
  --text-tertiary: #555555;       /* muted text, captions */
  --text-disabled: #404040;       /* disabled form fields */
  --text-inverse: #ffffff;        /* white text on colored backgrounds */

  /* ─────────────────────────────────────────────────────────
     BORDERS
     ───────────────────────────────────────────────────────── */
  --border-subtle: rgba(255, 255, 255, 0.06);    /* default border */
  --border-default: rgba(255, 255, 255, 0.08);   /* focused border */
  --border-strong: rgba(255, 255, 255, 0.12);    /* strong border */

  /* ─────────────────────────────────────────────────────────
     BRAND & ACCENT
     ───────────────────────────────────────────────────────── */
  --brand-500: #7c6af7;                     /* primary CTA */
  --brand-600: #6d5ae3;                     /* brand hover */
  --brand-400: #9984ff;                     /* brand text variant */
  --brand-light: rgba(124, 106, 247, 0.12); /* brand background */

  /* ─────────────────────────────────────────────────────────
     SEMANTIC – SUCCESS
     ───────────────────────────────────────────────────────── */
  --success-500: #22c55e;                  /* positive action */
  --success-400: #4ade80;                  /* success text */
  --success-light: rgba(34, 197, 94, 0.12); /* badge background */

  /* ─────────────────────────────────────────────────────────
     SEMANTIC – DANGER
     ───────────────────────────────────────────────────────── */
  --danger-500: #ef4444;                    /* error state */
  --danger-400: #f87171;                    /* error text */
  --danger-light: rgba(239, 68, 68, 0.12);  /* badge background */

  /* ─────────────────────────────────────────────────────────
     SEMANTIC – WARNING
     ───────────────────────────────────────────────────────── */
  --warning-500: #f59e0b;                    /* warning action */
  --warning-400: #fbbf24;                    /* warning text */
  --warning-light: rgba(245, 158, 11, 0.12); /* badge background */

  /* ─────────────────────────────────────────────────────────
     SEMANTIC – INFO
     ───────────────────────────────────────────────────────── */
  --info-500: #3b82f6;                     /* info action */
  --info-400: #60a5fa;                     /* info text */
  --info-light: rgba(59, 130, 246, 0.12);  /* badge background */

  /* ─────────────────────────────────────────────────────────
     OVERLAY & TRANSPARENCY
     ───────────────────────────────────────────────────────── */
  --overlay-light: rgba(0, 0, 0, 0.3);  /* light dimming */
  --overlay-dark: rgba(0, 0, 0, 0.6);   /* strong dimming */

  /* ─────────────────────────────────────────────────────────
     SPACING SCALE (4px grid)
     ───────────────────────────────────────────────────────── */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 12px;
  --spacing-lg: 16px;
  --spacing-xl: 20px;
  --spacing-2xl: 24px;
  --spacing-3xl: 28px;
  --spacing-4xl: 32px;
  --spacing-5xl: 40px;
  --spacing-6xl: 48px;
  --spacing-7xl: 64px;

  /* ─────────────────────────────────────────────────────────
     BORDER RADIUS
     ───────────────────────────────────────────────────────── */
  --radius-xs: 4px;
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-pill: 9999px;

  /* ─────────────────────────────────────────────────────────
     TYPOGRAPHY
     ───────────────────────────────────────────────────────── */

  /* Font family stack */
  --font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
    'Helvetica Neue', Arial, sans-serif;
  --font-mono: 'Menlo', 'Monaco', 'Courier New', monospace;

  /* Font sizes */
  --text-display: 3rem;      /* 48px */
  --text-h1: 2rem;           /* 32px */
  --text-h2: 1.5rem;         /* 24px */
  --text-h3: 1.25rem;        /* 20px */
  --text-h4: 1rem;           /* 16px */
  --text-metric-xl: 2.5rem;  /* 40px */
  --text-metric-l: 2rem;     /* 32px */
  --text-metric-m: 1.5rem;   /* 24px */
  --text-metric-s: 1.25rem;  /* 20px */
  --text-body-l: 1rem;       /* 16px */
  --text-body-m: 0.875rem;   /* 14px */
  --text-body-s: 0.8125rem;  /* 13px */
  --text-label: 0.75rem;     /* 12px */
  --text-caption: 0.6875rem; /* 11px */
  --text-overline: 0.625rem; /* 10px */

  /* ─────────────────────────────────────────────────────────
     TRANSITIONS
     ───────────────────────────────────────────────────────── */
  --transition-fast: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-normal: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slow: all 500ms cubic-bezier(0.4, 0, 0.2, 1);
}

/* ============================================================
   DARK MODE (DEFAULT)
   In this design system, dark mode is the default and primary.
   Light mode would be optional, defined below or in separate file.
   ============================================================ */

@media (prefers-color-scheme: dark) {
  :root {
    /* All variables above are already dark-optimized */
    color-scheme: dark;
  }
}

/* ============================================================
   LIGHT MODE (OPTIONAL, FUTURE)
   Define if supporting light mode. Not required for v1.
   ============================================================ */

/* @media (prefers-color-scheme: light) {
  :root {
    --surface-0: #ffffff;
    --surface-1: #f9f9f9;
    --surface-2: #f5f5f5;
    --surface-3: #efefef;
    --surface-4: #e9e9e9;
    --surface-5: #e3e3e3;

    --text-primary: #0a0a0a;
    --text-secondary: #555555;
    --text-tertiary: #888888;
    --text-disabled: #cccccc;
    --text-inverse: #ffffff;

    --border-subtle: rgba(0, 0, 0, 0.06);
    --border-default: rgba(0, 0, 0, 0.08);
    --border-strong: rgba(0, 0, 0, 0.12);

    color-scheme: light;
  }
} */

/* ============================================================
   GLOBAL STYLES (APPLIES TO BOTH LIGHT & DARK)
   ============================================================ */

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  font-size: 16px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  background-color: var(--surface-0);
  color: var(--text-primary);
  font-family: var(--font-sans);
  font-size: 0.875rem; /* Body-M */
  line-height: 1.6;
  letter-spacing: 0;
}

/* ─────────────────────────────────────────────────────────
   HEADINGS
   ───────────────────────────────────────────────────────── */

h1 {
  font-size: var(--text-h1);
  font-weight: 700;
  line-height: 1.3;
  letter-spacing: -0.01em;
  margin-bottom: var(--spacing-lg);
}

h2 {
  font-size: var(--text-h2);
  font-weight: 700;
  line-height: 1.3;
  margin-bottom: var(--spacing-lg);
}

h3 {
  font-size: var(--text-h3);
  font-weight: 600;
  line-height: 1.4;
  margin-bottom: var(--spacing-md);
}

h4 {
  font-size: var(--text-h4);
  font-weight: 600;
  line-height: 1.5;
  margin-bottom: var(--spacing-md);
}

/* ─────────────────────────────────────────────────────────
   LINKS
   ───────────────────────────────────────────────────────── */

a {
  color: var(--brand-500);
  text-decoration: none;
  transition: var(--transition-fast);
}

a:hover {
  color: var(--brand-400);
  text-decoration: underline;
}

a:focus-visible {
  outline: 2px solid var(--brand-400);
  outline-offset: 2px;
  border-radius: var(--radius-xs);
}

/* ─────────────────────────────────────────────────────────
   FOCUS VISIBLE (Keyboard Navigation)
   ───────────────────────────────────────────────────────── */

button:focus-visible,
input:focus-visible,
select:focus-visible,
textarea:focus-visible,
[tabindex]:focus-visible {
  outline: 2px solid var(--brand-400);
  outline-offset: 2px;
}

/* ─────────────────────────────────────────────────────────
   REDUCED MOTION PREFERENCE
   ───────────────────────────────────────────────────────── */

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

/* ─────────────────────────────────────────────────────────
   SCROLLBAR STYLING (Optional, advanced)
   ───────────────────────────────────────────────────────── */

::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: var(--surface-2);
}

::-webkit-scrollbar-thumb {
  background: var(--surface-4);
  border-radius: var(--radius-sm);
}

::-webkit-scrollbar-thumb:hover {
  background: var(--surface-5);
}
```

---

## Migration Guide

### Step 1: Update CSS Variables

**File**: `src/index.css`

1. Back up the current `index.css`
2. Replace the `:root` color definitions with the new variables from the [CSS Variables Reference](#css-variables-reference) section above
3. Test in the browser using DevTools to inspect computed colors

**Key changes**:

- `--brand-500` changes from `#3b82f6` (blue) → `#7c6af7` (purple)
- `--bg-page` → `--surface-0` (and update from light to dark)
- `--bg-card` → `--surface-2`
- Remove `--bg-sidebar` (no more sidebar)
- Add `--text-inverse`, `--border-subtle`, `--border-default`, etc.

### Step 2: Update Layout Components

**Files affected**: `src/components/Layout.tsx`, `src/pages/*.tsx`

#### Remove Sidebar

- Delete or hide `<Sidebar>` component
- Remove sidebar column from grid layout
- Update main content to stretch full width (with max-width container)

#### Add Floating Dock Navigation

- Create `src/components/FloatingDock.tsx` component
- Position: `position: fixed`, `bottom: 24px`, `left: 50%`, `transform: translateX(-50%)`
- Style with new CSS variables: `--surface-3`, `--border-subtle`
- Icons: 24px, tap targets 40px+
- Active indicator: dot or circle background using `--brand-500`

**Example structure**:

```tsx
export function FloatingDock() {
  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-1000
                    bg-surface-3 border border-border-subtle
                    rounded-full px-md py-sm
                    flex gap-md shadow-lg">
      {/* Dock items */}
      <NavItem to="/dashboard" icon={<HomeIcon />} label="Home" />
      <NavItem to="/namespaces" icon={<FolderIcon />} label="Namespaces" />
      {/* ... */}
    </nav>
  );
}
```

### Step 3: Update Component Styling

**Component updates** (in order of priority):

1. **Buttons** (`src/components/Button.tsx`)
   - Change primary button background: `#3b82f6` → `var(--brand-500)`
   - Update hover: `#2563eb` → `var(--brand-600)`
   - Verify secondary/ghost variants use new variables

2. **Badges** (`src/components/Badge.tsx`)
   - Replace hardcoded colors with variables: `--brand-light`, `--success-light`, etc.
   - Ensure `--text-inverse` is used for text on colored backgrounds

3. **Cards** (`src/components/Card.tsx`)
   - Background: `#ffffff` → `var(--surface-2)`
   - Border: add `1px solid var(--border-subtle)`

4. **Input** (`src/components/Input.tsx`, `src/components/Select.tsx`)
   - Background: `#ffffff` → `var(--surface-2)`
   - Border: add or update to `var(--border-subtle)`, focus → `var(--border-default)`

5. **Tables** (`src/components/Table.tsx`)
   - Background: `#ffffff` → `var(--surface-2)`
   - Header: background `var(--surface-3)`, text `var(--text-secondary)`
   - Row borders: `var(--border-subtle)`

6. **Header** (`src/components/Header.tsx`)
   - Background: `#ffffff` → `var(--surface-0)`
   - Border-bottom: `1px solid var(--border-subtle)`

### Step 4: Update Page Layouts

**All pages** in `src/pages/`

1. Remove sidebar references
2. Update page wrapper padding to `var(--spacing-2xl)` (24px)
3. Change any hardcoded colors to variables
4. Update title font-size to `var(--text-h1)` and weight to `700`

**Example**:

```tsx
// Before
<div className="bg-white p-8 rounded-lg border border-gray-200">
  <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
  {/* ... */}
</div>

// After
<div className="bg-surface-2 p-2xl rounded-md border border-border-subtle">
  <h1 className="text-h1 font-bold text-text-primary">Dashboard</h1>
  {/* ... */}
</div>
```

### Step 5: Update Tailwind Configuration

**File**: `tailwind.config.ts` (or `tailwind.config.js`)

Ensure your Tailwind config **does not override** CSS variables. Tailwind v4 respects `:root` variables natively.

**Example Tailwind v4 config**:

```ts
import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Let Tailwind use CSS variables where possible
        // Or define color mappings to variables
      },
      spacing: {
        xs: 'var(--spacing-xs)',
        sm: 'var(--spacing-sm)',
        md: 'var(--spacing-md)',
        lg: 'var(--spacing-lg)',
        xl: 'var(--spacing-xl)',
        '2xl': 'var(--spacing-2xl)',
        // ... etc
      },
      borderRadius: {
        xs: 'var(--radius-xs)',
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        pill: 'var(--radius-pill)',
      },
      transitionDuration: {
        fast: '150ms',
        normal: '300ms',
        slow: '500ms',
      },
    },
  },
  plugins: [],
} satisfies Config;
```

### Step 6: Test & Verify

1. **Visual regression testing**:
   - Compare all pages side-by-side (old vs. new)
   - Check all states: hover, focus, active, disabled, error
   - Verify contrast ratios (WebAIM Contrast Checker)

2. **Responsive testing**:
   - Desktop (1920px, 1440px)
   - Tablet (768px)
   - Mobile (375px)
   - Especially test floating dock positioning

3. **Browser testing**:
   - Chrome/Edge, Firefox, Safari
   - Check vendor prefixes (especially backdrop-filter)

4. **Accessibility testing**:
   - Keyboard navigation (Tab through all interactive elements)
   - Screen reader (NVDA, JAWS, VoiceOver)
   - Color contrast (no text below 4.5:1)

### Step 7: Deprecate Old Variables

Once migration is complete, remove old color variables from Tailwind config and any custom CSS:

```diff
- --primary-blue: #3b82f6;
- --bg-light: #f8fafc;
- --bg-dark: #0f172a;
```

---

## Appendix: Font Stack & System Fonts

The design system uses the **system font stack** for optimal performance and familiarity:

```css
--font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
  'Helvetica Neue', Arial, sans-serif;
```

This resolves to:

- **macOS / iOS**: San Francisco (SF Pro Display, SF Pro Text)
- **Windows**: Segoe UI
- **Android**: Roboto
- **Generic**: Helvetica Neue, Arial

For code or monospace content, use:

```css
--font-mono: 'Menlo', 'Monaco', 'Courier New', monospace;
```

---

## Appendix: Color Hex Reference (Quick Lookup)

```
SURFACES
  #0a0a0a  - surface-0 (page bg)
  #0f0f0f  - surface-1
  #161616  - surface-2 (cards)
  #1a1a1a  - surface-3 (hover)
  #1e1e1e  - surface-4 (tab active)
  #222222  - surface-5 (panels)

TEXT
  #f5f5f5  - text-primary
  #888888  - text-secondary
  #555555  - text-tertiary
  #404040  - text-disabled
  #ffffff  - text-inverse

BRAND
  #7c6af7  - brand-500 (primary)
  #6d5ae3  - brand-600 (hover)
  #9984ff  - brand-400 (text)

SEMANTIC
  #22c55e  - success-500
  #ef4444  - danger-500
  #f59e0b  - warning-500
  #3b82f6  - info-500
```

---

---

## Tailwind v4 Bridge (`@theme` block)

This project uses **Tailwind CSS v4** which uses `@theme` in CSS (not `tailwind.config.ts`). Append this block to `src/index.css` — it maps all design tokens to Tailwind utility classes.

```css
/* ============================================================
   TAILWIND v4 THEME BRIDGE
   Maps CSS variables → Tailwind utility classes
   e.g. bg-surface-2, text-text-secondary, border-border-subtle
   ============================================================ */

@theme {
  /* Surfaces → bg-surface-0, bg-surface-2, etc. */
  --color-surface-0: var(--surface-0);
  --color-surface-1: var(--surface-1);
  --color-surface-2: var(--surface-2);
  --color-surface-3: var(--surface-3);
  --color-surface-4: var(--surface-4);
  --color-surface-5: var(--surface-5);

  /* Text → text-text-primary, text-text-secondary, etc. */
  --color-text-primary:   var(--text-primary);
  --color-text-secondary: var(--text-secondary);
  --color-text-tertiary:  var(--text-tertiary);
  --color-text-disabled:  var(--text-disabled);
  --color-text-inverse:   var(--text-inverse);

  /* Borders → border-border-subtle, border-border-default, etc. */
  --color-border-subtle:  var(--border-subtle);
  --color-border-default: var(--border-default);
  --color-border-strong:  var(--border-strong);

  /* Brand → bg-brand-500, text-brand-400, etc. */
  --color-brand-400: var(--brand-400);
  --color-brand-500: var(--brand-500);
  --color-brand-600: var(--brand-600);
  --color-brand-light: var(--brand-light);

  /* Semantic */
  --color-success-400: var(--success-400);
  --color-success-500: var(--success-500);
  --color-success-light: var(--success-light);
  --color-danger-400:  var(--danger-400);
  --color-danger-500:  var(--danger-500);
  --color-danger-light: var(--danger-light);
  --color-warning-400: var(--warning-400);
  --color-warning-500: var(--warning-500);
  --color-warning-light: var(--warning-light);
  --color-info-400:    var(--info-400);
  --color-info-500:    var(--info-500);
  --color-info-light:  var(--info-light);

  /* shadcn/ui token bridge (keeps shadcn components working) */
  --color-background:           var(--surface-0);
  --color-foreground:           var(--text-primary);
  --color-card:                 var(--surface-2);
  --color-card-foreground:      var(--text-primary);
  --color-popover:              var(--surface-2);
  --color-popover-foreground:   var(--text-primary);
  --color-primary:              var(--brand-500);
  --color-primary-foreground:   var(--text-inverse);
  --color-secondary:            var(--surface-3);
  --color-secondary-foreground: var(--text-primary);
  --color-muted:                var(--surface-3);
  --color-muted-foreground:     var(--text-tertiary);
  --color-accent:               var(--surface-4);
  --color-accent-foreground:    var(--text-primary);
  --color-destructive:          var(--danger-500);
  --color-destructive-foreground: var(--text-inverse);
  --color-border:               var(--border-subtle);
  --color-input:                var(--surface-2);
  --color-ring:                 var(--brand-400);

  /* Radius */
  --radius: var(--radius-sm); /* shadcn default radius */

  /* Font family */
  --font-sans: var(--font-sans);
  --font-mono: var(--font-mono);
}
```

### Usage Examples (with Tailwind v4 bridge)

```tsx
// ✅ CORRECT — uses Tailwind classes mapped to tokens
<div className="bg-surface-2 border border-border-subtle rounded-md p-6">
  <span className="text-text-secondary text-xs uppercase tracking-widest">Users</span>
  <p className="text-text-primary text-2xl font-bold">1,234</p>
</div>

// ❌ WRONG — inline style with raw CSS vars (violates CONVENTIONS.md)
<div style={{ background: 'var(--surface-2)', color: 'var(--text-secondary)' }}>
```

---

## Complete `src/index.css` (Drop-in Replacement)

This is the **complete file** that replaces the current `src/index.css`. It integrates both the CSS variables and the Tailwind v4 bridge in one place.

```css
@import "tailwindcss";

/* ============================================================
   neurox-console — DESIGN TOKENS
   Dark-first, purple brand, Fey-inspired
   Version: 1.0 | 2026-04-17
   ============================================================ */

:root {
  /* ── SURFACES ─────────────────────────────────────────── */
  --surface-0: #0a0a0a;
  --surface-1: #0f0f0f;
  --surface-2: #161616;
  --surface-3: #1a1a1a;
  --surface-4: #1e1e1e;
  --surface-5: #222222;

  /* ── TEXT ─────────────────────────────────────────────── */
  --text-primary:   #f5f5f5;
  --text-secondary: #888888;
  --text-tertiary:  #555555;
  --text-disabled:  #404040;
  --text-inverse:   #ffffff;

  /* ── BORDERS ──────────────────────────────────────────── */
  --border-subtle:  rgba(255, 255, 255, 0.06);
  --border-default: rgba(255, 255, 255, 0.08);
  --border-strong:  rgba(255, 255, 255, 0.12);

  /* ── BRAND ────────────────────────────────────────────── */
  --brand-400: #9984ff;
  --brand-500: #7c6af7;
  --brand-600: #6d5ae3;
  --brand-light: rgba(124, 106, 247, 0.12);

  /* ── SEMANTIC ─────────────────────────────────────────── */
  --success-400: #4ade80;
  --success-500: #22c55e;
  --success-light: rgba(34, 197, 94, 0.12);

  --danger-400: #f87171;
  --danger-500: #ef4444;
  --danger-light: rgba(239, 68, 68, 0.12);

  --warning-400: #fbbf24;
  --warning-500: #f59e0b;
  --warning-light: rgba(245, 158, 11, 0.12);

  --info-400: #60a5fa;
  --info-500: #3b82f6;
  --info-light: rgba(59, 130, 246, 0.12);

  /* ── OVERLAY ──────────────────────────────────────────── */
  --overlay-light: rgba(0, 0, 0, 0.3);
  --overlay-dark:  rgba(0, 0, 0, 0.6);

  /* ── TYPOGRAPHY ───────────────────────────────────────── */
  --font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
    'Helvetica Neue', Arial, sans-serif;
  --font-mono: 'Menlo', 'Monaco', 'Courier New', monospace;

  /* ── RADIUS ───────────────────────────────────────────── */
  --radius-xs:   4px;
  --radius-sm:   8px;
  --radius-md:   12px;
  --radius-lg:   16px;
  --radius-pill: 9999px;

  /* ── TRANSITIONS ──────────────────────────────────────── */
  --transition-fast:   all 150ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-normal: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slow:   all 500ms cubic-bezier(0.4, 0, 0.2, 1);

  /* ── SHADOWS ──────────────────────────────────────────── */
  --shadow-dock:    0 8px 32px rgba(0, 0, 0, 0.6);
  --shadow-modal:   0 20px 60px rgba(0, 0, 0, 0.4);
  --shadow-tooltip: 0 4px 12px rgba(0, 0, 0, 0.3);
}

/* Tailwind v4 theme bridge */
@theme {
  --color-surface-0: var(--surface-0);
  --color-surface-1: var(--surface-1);
  --color-surface-2: var(--surface-2);
  --color-surface-3: var(--surface-3);
  --color-surface-4: var(--surface-4);
  --color-surface-5: var(--surface-5);

  --color-text-primary:   var(--text-primary);
  --color-text-secondary: var(--text-secondary);
  --color-text-tertiary:  var(--text-tertiary);
  --color-text-disabled:  var(--text-disabled);
  --color-text-inverse:   var(--text-inverse);

  --color-border-subtle:  var(--border-subtle);
  --color-border-default: var(--border-default);
  --color-border-strong:  var(--border-strong);

  --color-brand-400:  var(--brand-400);
  --color-brand-500:  var(--brand-500);
  --color-brand-600:  var(--brand-600);
  --color-brand-light: var(--brand-light);

  --color-success-400: var(--success-400);
  --color-success-500: var(--success-500);
  --color-success-light: var(--success-light);
  --color-danger-400:  var(--danger-400);
  --color-danger-500:  var(--danger-500);
  --color-danger-light: var(--danger-light);
  --color-warning-400: var(--warning-400);
  --color-warning-500: var(--warning-500);
  --color-warning-light: var(--warning-light);
  --color-info-400:    var(--info-400);
  --color-info-500:    var(--info-500);
  --color-info-light:  var(--info-light);

  /* shadcn/ui bridge */
  --color-background:             var(--surface-0);
  --color-foreground:             var(--text-primary);
  --color-card:                   var(--surface-2);
  --color-card-foreground:        var(--text-primary);
  --color-popover:                var(--surface-2);
  --color-popover-foreground:     var(--text-primary);
  --color-primary:                var(--brand-500);
  --color-primary-foreground:     var(--text-inverse);
  --color-secondary:              var(--surface-3);
  --color-secondary-foreground:   var(--text-primary);
  --color-muted:                  var(--surface-3);
  --color-muted-foreground:       var(--text-tertiary);
  --color-accent:                 var(--surface-4);
  --color-accent-foreground:      var(--text-primary);
  --color-destructive:            var(--danger-500);
  --color-destructive-foreground: var(--text-inverse);
  --color-border:                 var(--border-subtle);
  --color-input:                  var(--surface-2);
  --color-ring:                   var(--brand-400);
  --radius:                       var(--radius-sm);
}

/* Global reset */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  font-size: 16px;
  color-scheme: dark;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  background-color: var(--surface-0);
  color: var(--text-primary);
  font-family: var(--font-sans);
  font-size: 0.875rem;
  line-height: 1.6;
}

#root {
  min-height: 100svh;
  /* Reserve space for floating dock */
  padding-bottom: 96px;
}

/* Focus visible */
:focus-visible {
  outline: 2px solid var(--brand-400);
  outline-offset: 2px;
  border-radius: var(--radius-xs);
}

/* Scrollbar */
::-webkit-scrollbar        { width: 6px; height: 6px; }
::-webkit-scrollbar-track  { background: var(--surface-1); }
::-webkit-scrollbar-thumb  { background: var(--surface-4); border-radius: var(--radius-pill); }
::-webkit-scrollbar-thumb:hover { background: var(--surface-5); }

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Floating Dock — Complete React Component

Full implementation of the primary navigation, ready to drop into `src/components/layout/FloatingDock.tsx`:

```tsx
import { NavLink, useLocation } from 'react-router-dom'
import {
  Home, Database, Users, Key, CheckSquare,
  Boxes, Brain, Plug, User
} from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { to: '/dashboard',     icon: Home,        label: 'Dashboard',   adminOnly: true  },
  { to: '/namespaces',    icon: Boxes,       label: 'Namespaces',  adminOnly: true  },
  { to: '/memories',      icon: Brain,       label: 'Memories',    adminOnly: true  },
  { to: '/users',         icon: Users,       label: 'Users',       adminOnly: true  },
  { to: '/api-keys',      icon: Key,         label: 'API Keys',    adminOnly: true  },
  { to: '/approvals',     icon: CheckSquare, label: 'Approvals',   adminOnly: true  },
  { to: '/connect-claude',icon: Plug,        label: 'Claude',      adminOnly: false },
  { to: '/portal',        icon: User,        label: 'My Portal',   adminOnly: false },
] as const

interface FloatingDockProps {
  isAdmin?: boolean
}

export function FloatingDock({ isAdmin = false }: FloatingDockProps) {
  const items = NAV_ITEMS.filter(item => !item.adminOnly || isAdmin)

  return (
    <nav
      aria-label="Main navigation"
      className={cn(
        'fixed bottom-6 left-1/2 -translate-x-1/2 z-50',
        'flex items-center gap-1 px-3 py-2',
        'bg-surface-3 border border-border-subtle rounded-full',
        'shadow-[0_8px_32px_rgba(0,0,0,0.6)]',
        'backdrop-blur-sm'
      )}
    >
      {items.map(({ to, icon: Icon, label }) => (
        <DockItem key={to} to={to} icon={Icon} label={label} />
      ))}
    </nav>
  )
}

function DockItem({
  to,
  icon: Icon,
  label,
}: {
  to: string
  icon: React.ElementType
  label: string
}) {
  return (
    <NavLink
      to={to}
      title={label}
      aria-label={label}
      className={({ isActive }) =>
        cn(
          'flex items-center justify-center w-10 h-10 rounded-full',
          'text-text-tertiary transition-all duration-150',
          'hover:text-text-primary hover:bg-surface-4',
          isActive && 'text-brand-400 bg-surface-4'
        )
      }
    >
      <Icon size={20} strokeWidth={1.5} />
    </NavLink>
  )
}
```

---

## Page Layout — Complete React Component

`src/components/layout/PageLayout.tsx` — replaces the current sidebar+header layout:

```tsx
import { ReactNode } from 'react'
import { FloatingDock } from './FloatingDock'
import { cn } from '@/lib/utils'

interface PageLayoutProps {
  children: ReactNode
  /** Optional right-side contextual panel (30% width on desktop) */
  panel?: ReactNode
  /** Shows full-width layout (no panel split) */
  fullWidth?: boolean
  isAdmin?: boolean
}

export function PageLayout({
  children,
  panel,
  fullWidth = false,
  isAdmin = false,
}: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-surface-0">
      {/* Minimal top header */}
      <TopBar />

      {/* Main content area */}
      <main
        className={cn(
          'mx-auto px-6 py-8',
          'max-w-[1400px]',
          // Two-column layout when panel is provided
          panel && !fullWidth && 'flex gap-6 items-start'
        )}
      >
        <div className={cn('flex-1 min-w-0', panel && !fullWidth && 'flex-[0.7]')}>
          {children}
        </div>
        {panel && !fullWidth && (
          <aside className="flex-[0.3] min-w-[280px] sticky top-8">
            {panel}
          </aside>
        )}
      </main>

      {/* Floating bottom navigation dock */}
      <FloatingDock isAdmin={isAdmin} />
    </div>
  )
}

function TopBar() {
  return (
    <header className="h-16 border-b border-border-subtle bg-surface-0 px-6 flex items-center justify-between sticky top-0 z-40">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <span className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">N</span>
        <span className="text-text-primary font-semibold text-sm">Neurox</span>
      </div>
      {/* Right side: theme toggle + user */}
      <div className="flex items-center gap-2">
        {/* ThemeToggle, UserMenu components go here */}
      </div>
    </header>
  )
}
```

---

## Fey-Specific Patterns Captured from Images

These are specific design patterns observed directly in the provided screenshots:

### 1. Stats Bar (horizontal KPI strip)
The strip of metrics (Mkt cap, EV/Sales, P/E ratio, etc.) at the bottom of stock pages:

```tsx
// Pattern: horizontal scrollable strip of KPI columns
// bg: slightly lighter than page (--surface-2)
// Each column: border-right: 1px solid --border-subtle
// Label: 11px uppercase muted | Value: 14px semibold white

function StatsBar({ stats }: { stats: { label: string; value: string }[] }) {
  return (
    <div className="flex overflow-x-auto bg-surface-2 border border-border-subtle rounded-md">
      {stats.map((stat, i) => (
        <div
          key={i}
          className={cn(
            'flex flex-col gap-1 px-5 py-4 min-w-[100px] flex-1',
            i < stats.length - 1 && 'border-r border-border-subtle'
          )}
        >
          <span className="text-[11px] text-text-tertiary uppercase tracking-widest">{stat.label}</span>
          <span className="text-sm font-semibold text-text-primary">{stat.value}</span>
        </div>
      ))}
    </div>
  )
}
```

### 2. Time Range Pill Selector
The "1D 1W 1M 3M YTD 1Y 5Y All" selector seen in stock charts:

```tsx
const ranges = ['1D','1W','1M','3M','YTD','1Y','5Y','All'] as const

function TimeRangeSelector({
  value, onChange
}: {
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="flex items-center gap-0.5">
      {ranges.map(r => (
        <button
          key={r}
          onClick={() => onChange(r)}
          className={cn(
            'px-2.5 py-1 text-xs rounded-md transition-all duration-150',
            value === r
              ? 'bg-surface-4 text-text-primary font-medium'
              : 'text-text-tertiary hover:text-text-secondary hover:bg-surface-3'
          )}
        >
          {r}
        </button>
      ))}
    </div>
  )
}
```

### 3. Contextual Right Panel
The info panel (About, News, KPIs tabs) on the right side of Fey detail pages:

```tsx
// Pattern: slightly darker than main cards, fixed aspect, scrollable
function ContextPanel({ children }: { children: ReactNode }) {
  return (
    <div className="bg-surface-1 border border-border-subtle rounded-2xl overflow-hidden">
      {/* Tab bar */}
      <div className="flex border-b border-border-subtle px-4 pt-4 gap-1">
        {['News', 'Details', 'About'].map(tab => (
          <TabPill key={tab} label={tab} />
        ))}
      </div>
      {/* Scrollable content */}
      <div className="p-6 overflow-y-auto max-h-[600px]">
        {children}
      </div>
    </div>
  )
}

function TabPill({ label, active }: { label: string; active?: boolean }) {
  return (
    <button className={cn(
      'px-3 py-1.5 text-sm rounded-md transition-all duration-150 mb-3',
      active
        ? 'bg-surface-4 text-text-primary font-medium'
        : 'text-text-tertiary hover:text-text-secondary'
    )}>
      {label}
    </button>
  )
}
```

### 4. Score/Miss/Beat Badges (Earnings style)
Used for approvals, memory confidence, status:

```tsx
type Verdict = 'beat' | 'miss' | 'pending'

const VERDICT_STYLES: Record<Verdict, string> = {
  beat:    'bg-success-light text-success-500',
  miss:    'bg-danger-light  text-danger-500',
  pending: 'bg-surface-4    text-text-secondary border border-border-subtle',
}

function VerdictBadge({ verdict }: { verdict: Verdict }) {
  return (
    <span className={cn(
      'px-2 py-0.5 rounded text-xs font-semibold capitalize',
      VERDICT_STYLES[verdict]
    )}>
      {verdict}
    </span>
  )
}
```

### 5. Entity Header (like Fey's TSLA header)
Used on detail pages — logo square + name + subtitle:

```tsx
function EntityHeader({ icon, name, subtitle }: {
  icon?: ReactNode
  name: string
  subtitle?: string
}) {
  return (
    <div className="flex items-center gap-3">
      {icon && (
        <div className="w-10 h-10 rounded-xl bg-surface-3 border border-border-subtle flex items-center justify-center text-lg font-bold">
          {icon}
        </div>
      )}
      <div>
        <h1 className="text-lg font-bold text-text-primary leading-tight">{name}</h1>
        {subtitle && <p className="text-xs text-text-tertiary">{subtitle}</p>}
      </div>
    </div>
  )
}
```

### 6. Search / Command Input (Fey's bottom search pill)
The rounded search bar at the bottom of the dock:

```tsx
function CommandSearch() {
  return (
    <div className={cn(
      'flex items-center gap-2 w-10 h-10 rounded-full',
      'bg-surface-4 border border-border-subtle',
      'transition-all duration-300 cursor-pointer',
      'hover:w-64 hover:px-4', // expands on hover
    )}>
      <Search size={16} className="text-text-tertiary shrink-0" />
      <input
        placeholder="Search..."
        className="bg-transparent border-none outline-none text-sm text-text-primary placeholder:text-text-tertiary w-full"
      />
    </div>
  )
}
```

---

## Component Class Vocabulary (Quick Reference)

Use these class patterns consistently across all components:

```
SURFACES
  bg-surface-0          ← page background
  bg-surface-2          ← card / elevated
  bg-surface-3          ← hover / secondary card
  bg-surface-4          ← active / tab selected

BORDERS
  border-border-subtle  ← default (most elements)
  border-border-default ← focused / emphasized

TEXT
  text-text-primary     ← body, values, headings
  text-text-secondary   ← labels, descriptions
  text-text-tertiary    ← muted, captions, placeholders

BRAND
  bg-brand-500         ← CTA button, active state
  text-brand-400       ← brand text on dark
  bg-brand-light       ← brand tinted background

SEMANTIC
  text-success-500 / bg-success-light
  text-danger-500  / bg-danger-light
  text-warning-500 / bg-warning-light

TYPOGRAPHY PATTERNS
  text-[11px] uppercase tracking-widest text-text-tertiary  ← column labels
  text-sm font-semibold text-text-primary                   ← values
  text-2xl font-bold tracking-tight text-text-primary       ← metrics
  text-xs text-text-secondary                               ← captions

SPACING PATTERNS
  p-6             ← card padding (24px)
  p-4             ← compact card (16px)
  gap-3           ← component internal gap (12px)
  gap-6           ← section gap (24px)
  gap-8           ← major section (32px)
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.1 | 2026-04-17 | Added Tailwind v4 @theme bridge, drop-in index.css, FloatingDock + PageLayout components, Fey-specific pattern library, component class vocabulary |
| 1.0 | 2026-04-17 | Initial design system: dark-first theme, purple brand, floating dock navigation, Fey-inspired aesthetic |

---

## Questions & Feedback

For questions, clarifications, or design system updates:

1. Reference this document as the source of truth
2. Update this file when patterns emerge or refinements are needed
3. Keep all changes documented in the Version History
4. Communicate changes to the development team via PR review
