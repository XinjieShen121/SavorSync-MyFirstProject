# SavorSync Design System

Version 1.2 · October 2026

This is the single source of truth for how SavorSync looks and behaves. Every page, component and CSS file uses the tokens and patterns below. If something you need is not here, add it to this file first, then build it.

---

## 1. Principles

1. **Food first.** Photos lead. Chrome (borders, gradients, shadows) stays quiet so the dish and its story stand out.
2. **Culture with context.** Every recipe carries a short story, and the story is always one tap away, never in the way of cooking.
3. **Hands-busy friendly.** While cooking, people glance at the screen with messy hands. Big text, big targets, one step at a time.
4. **Honest data.** Show only real facts (time, servings, difficulty). If a value is missing, hide it. Never invent a default.
5. **Accessible by default.** WCAG 2.2 AA: 4.5:1 text contrast, 3:1 for UI parts and large text, visible focus, 44px tap targets, reduced motion respected.

---

## 2. Foundations (tokens)

All tokens live in `savorsync-frontend/src/styles/tokens.css` as CSS custom properties on `:root`, and are mirrored in `src/theme.ts` for MUI (section 3). CSS files never contain raw hex values, font names, or pixel spacing outside these tokens.

### 2.1 Color

#### Brand (terracotta)

| Token | Hex | Use |
| --- | --- | --- |
| `--color-brand-50` | `#FFF1E8` | Selected chip background, soft highlight |
| `--color-brand-100` | `#FFE0CC` | Hover background for ghost buttons and chips |
| `--color-brand-500` | `#FF6B35` | **Accent only:** logo, illustrations, progress fill, active tab underline, icons beside text. Never as a background behind white text, never as body text. |
| `--color-brand-600` | `#E55A2B` | Accent hover |
| `--color-brand-700` | `#C2410C` | **Primary action:** button background (white text 5.2:1), focus ring |
| `--color-brand-800` | `#9A3412` | Primary button hover and pressed; text links (7.3:1 on white, 6.1:1 on cream) |

#### Secondary (saffron)

| Token | Hex | Use |
| --- | --- | --- |
| `--color-saffron-100` | `#FEEBC8` | Fun-fact and tip box background |
| `--color-saffron-500` | `#F7931E` | Decorative accent only (badges, illustration), never text |
| `--color-saffron-700` | `#8F5206` | Text and icons on saffron-100 (5.3:1) |

#### Herb (swaps and dietary)

| Token | Hex | Use |
| --- | --- | --- |
| `--color-herb-50` | `#EEF7F1` | Swapped ingredient row background |
| `--color-herb-700` | `#2F7D4F` | Swap icon, "Swapped" label, dietary badges (5.0:1 on white) |

#### Neutrals (warm)

| Token | Hex | Use |
| --- | --- | --- |
| `--color-bg` | `#FFF8F2` | Page background |
| `--color-surface` | `#FFFFFF` | Cards, dialogs, inputs, nav |
| `--color-surface-warm` | `#FBE7D2` | Hero bands and feature sections (the original SavorSync cream) |
| `--color-surface-sunken` | `#F6EDE4` | Skeletons, disabled input background, code |
| `--color-border` | `#EADBCB` | Card and divider lines (decorative) |
| `--color-border-strong` | `#A08670` | Input borders and outlined buttons (3:1 against white) |
| `--color-text` | `#3B2A20` | Headings and body text (13:1) |
| `--color-text-secondary` | `#6B5547` | Supporting text, metadata (6.6:1) |
| `--color-text-muted` | `#7A6354` | Placeholders, captions, timestamps (5.3:1 on bg) |
| `--color-text-inverse` | `#FFFFFF` | Text on brand-700, brand-800, herb-700, overlays |
| `--color-overlay` | `rgba(28, 18, 12, 0.55)` | Photo scrims and modal backdrops |

#### Status

| Token | Hex | Background token | Hex |
| --- | --- | --- | --- |
| `--color-success` | `#15803D` | `--color-success-bg` | `#ECFDF3` |
| `--color-warning` | `#8F5206` | `--color-warning-bg` | `#FFF7E6` |
| `--color-error` | `#B91C1C` | `--color-error-bg` | `#FEF2F2` |
| `--color-info` | `#1D4ED8` | `--color-info-bg` | `#EFF6FF` |

#### Color rules

- One primary action per view uses `brand-700`. Everything else is secondary or ghost.
- No gradients on buttons, text or cards. One soft gradient is allowed on hero photo scrims (`transparent` to `--color-overlay`).
- On `--color-surface-warm`, links and brand text use `brand-800`, not `brand-700`.
- Status colors are for status only (errors, success toasts), never decoration.
- No dark mode in v1. Remove `color-scheme: light dark` so form controls stay light.

### 2.2 Typography

Two families only. Load them once in `index.html`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,400;1,600&family=Poppins:wght@400;500;600&display=swap" rel="stylesheet">
```

| Token | Value |
| --- | --- |
| `--font-display` | `'Playfair Display', Georgia, serif` |
| `--font-body` | `'Poppins', system-ui, -apple-system, 'Segoe UI', sans-serif` |

Quicksand, Segoe UI as a primary font, and the Vite `system-ui, Avenir` stack are retired.

#### Type scale (1.25 ratio, 16px base)

| Token | Size / line height | Family, weight | Use |
| --- | --- | --- | --- |
| `--text-display` | 48px / 56px (mobile 36 / 44) | Display 700 | Home hero only |
| `--text-h1` | 40px / 48px (mobile 32 / 40) | Display 700 | Page title, recipe title |
| `--text-h2` | 30px / 38px (mobile 26 / 34) | Display 700 | Section title |
| `--text-h3` | 24px / 32px | Display 600 | Card group title, dialog title |
| `--text-h4` | 20px / 28px | Body 600 | Card title, step title |
| `--text-body-lg` | 18px / 28px | Body 400 | Cook mode secondary text, story card |
| `--text-body` | 16px / 24px | Body 400 | Default |
| `--text-sm` | 14px / 20px | Body 400 or 500 | Metadata, chips, buttons (small) |
| `--text-xs` | 12px / 16px | Body 500 | Badges, captions, overline (uppercase, +0.04em) |
| `--text-step` | 28px / 40px (mobile 24 / 34) | Body 500 | Cook mode step text (section 4.6) |
| Deck | 20px / 30px (`--text-h4`) | Display italic 400, `text-secondary` | The line under a headline, usually the recipe `subtitle` (section 4.11). Italic is for decks, type covers and quoted questions only. |

Weights: `--weight-regular: 400`, `--weight-medium: 500`, `--weight-semibold: 600`, `--weight-bold: 700`.

Rules: body text never below 14px; line length 60 to 75 characters (`max-width: 68ch` on reading blocks); no all-caps headings; no emoji in headings or buttons.

### 2.3 Spacing

4px base, 8px rhythm.

| Token | px |
| --- | --- |
| `--space-1` | 4 |
| `--space-2` | 8 |
| `--space-3` | 12 |
| `--space-4` | 16 |
| `--space-5` | 20 |
| `--space-6` | 24 |
| `--space-8` | 32 |
| `--space-10` | 40 |
| `--space-12` | 48 |
| `--space-16` | 64 |
| `--space-20` | 80 |

Layout: `--container-max: 1200px`; `--container-reading: 720px` (story and article text); page gutter `--space-4` on mobile, `--space-6` on tablet, `--space-8` on desktop. Section gap `--space-12` (mobile `--space-10`). Card padding `--space-4` (mobile) or `--space-5`. Grid gap `--space-6`.

### 2.4 Radius

| Token | px | Use |
| --- | --- | --- |
| `--radius-sm` | 8 | Inputs, small badges, tooltips |
| `--radius-md` | 16 | Cards, dialogs, images, panels (matches MUI `shape.borderRadius`) |
| `--radius-pill` | 999 | Buttons, chips, avatars, toggles |

Nothing else. The 21 current radius values map to these three.

### 2.5 Elevation

| Token | Value | Use |
| --- | --- | --- |
| `--shadow-1` | `0 1px 2px rgba(59, 42, 32, 0.06), 0 1px 3px rgba(59, 42, 32, 0.10)` | Cards at rest, nav |
| `--shadow-2` | `0 4px 12px rgba(59, 42, 32, 0.12)` | Card hover, dropdowns, docked action bar |
| `--shadow-3` | `0 12px 32px rgba(59, 42, 32, 0.18)` | Dialogs, toasts, cook mode sheet |

No colored (orange) shadows.

### 2.6 Motion

| Token | Value |
| --- | --- |
| `--duration-fast` | 120ms (hover, press) |
| `--duration-base` | 200ms (expand, fade, tab change) |
| `--duration-slow` | 320ms (sheet, dialog, page-level) |
| `--ease-standard` | `cubic-bezier(0.2, 0, 0, 1)` |

Rules: animate only `opacity` and `transform`; hover lift on cards is at most `translateY(-2px)`; no typewriter text, floating or rotating decorations, or looping animation except loaders. Wrap all motion in:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
}
```

### 2.7 Breakpoints

| Token | Min width | MUI key |
| --- | --- | --- |
| `--bp-sm` | 600px | `sm` |
| `--bp-md` | 900px | `md` |
| `--bp-lg` | 1200px | `lg` |

Mobile first: base styles target phones, then `@media (min-width: …)`. CSS custom properties cannot be used inside media queries, so write the pixel values but only these three.

### 2.8 Iconography and imagery

- **One icon set:** Bootstrap Icons (already loaded app-wide). Remove `react-icons`, icons8 PNGs and emoji used as icons. Size 16px inline with text, 20px in buttons, 24px standalone. Icon-only buttons need `aria-label`.
- **Recipe photos:** 4:3 on cards, 16:9 on the recipe hero, `object-fit: cover`, `--radius-md`. Always meaningful `alt` text (the dish name). When there is no photo (or it fails to load), show the type cover (4.11), never a random stock photo or an AI image presented as the dish. Free-licensed photos show their credit line (4.11).
- **Focus ring:** `outline: 3px solid var(--color-brand-700); outline-offset: 2px;` on `:focus-visible`. Never `outline: none` without this replacement.

### 2.9 tokens.css reference

```css
:root {
  /* Brand */
  --color-brand-50: #FFF1E8;
  --color-brand-100: #FFE0CC;
  --color-brand-500: #FF6B35;
  --color-brand-600: #E55A2B;
  --color-brand-700: #C2410C;
  --color-brand-800: #9A3412;
  --color-saffron-100: #FEEBC8;
  --color-saffron-500: #F7931E;
  --color-saffron-700: #8F5206;
  --color-herb-50: #EEF7F1;
  --color-herb-700: #2F7D4F;

  /* Neutrals */
  --color-bg: #FFF8F2;
  --color-surface: #FFFFFF;
  --color-surface-warm: #FBE7D2;
  --color-surface-sunken: #F6EDE4;
  --color-border: #EADBCB;
  --color-border-strong: #A08670;
  --color-text: #3B2A20;
  --color-text-secondary: #6B5547;
  --color-text-muted: #7A6354;
  --color-text-inverse: #FFFFFF;
  --color-overlay: rgba(28, 18, 12, 0.55);

  /* Status */
  --color-success: #15803D;
  --color-success-bg: #ECFDF3;
  --color-warning: #8F5206;
  --color-warning-bg: #FFF7E6;
  --color-error: #B91C1C;
  --color-error-bg: #FEF2F2;
  --color-info: #1D4ED8;
  --color-info-bg: #EFF6FF;

  /* Type */
  --font-display: 'Playfair Display', Georgia, serif;
  --font-body: 'Poppins', system-ui, -apple-system, 'Segoe UI', sans-serif;
  --text-display: 3rem;
  --text-h1: 2.5rem;
  --text-h2: 1.875rem;
  --text-h3: 1.5rem;
  --text-h4: 1.25rem;
  --text-body-lg: 1.125rem;
  --text-body: 1rem;
  --text-sm: 0.875rem;
  --text-xs: 0.75rem;
  --text-step: 1.75rem;
  --weight-regular: 400;
  --weight-medium: 500;
  --weight-semibold: 600;
  --weight-bold: 700;

  /* Space */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;
  --space-20: 80px;
  --container-max: 1200px;
  --container-reading: 720px;

  /* Shape */
  --radius-sm: 8px;
  --radius-md: 16px;
  --radius-pill: 999px;
  --shadow-1: 0 1px 2px rgba(59, 42, 32, 0.06), 0 1px 3px rgba(59, 42, 32, 0.10);
  --shadow-2: 0 4px 12px rgba(59, 42, 32, 0.12);
  --shadow-3: 0 12px 32px rgba(59, 42, 32, 0.18);

  /* Motion */
  --duration-fast: 120ms;
  --duration-base: 200ms;
  --duration-slow: 320ms;
  --ease-standard: cubic-bezier(0.2, 0, 0, 1);

  /* Layers */
  --z-nav: 100;
  --z-dock: 200;
  --z-overlay: 300;
  --z-toast: 400;
}

@media (max-width: 599px) {
  :root {
    --text-display: 2.25rem;
    --text-h1: 2rem;
    --text-h2: 1.625rem;
    --text-step: 1.5rem;
  }
}
```

`index.css` keeps only a reset that uses these tokens: `body { margin: 0; background: var(--color-bg); color: var(--color-text); font: var(--weight-regular) var(--text-body)/1.5 var(--font-body); }`. The Vite starter rules (dark `#242424` background, `#646cff` links, global `button` styles, `body { display: flex; place-items: center; }`) are removed, and `App.css` no longer centers `body` with flexbox.

---

## 3. MUI theme mapping

`src/theme.ts` mirrors the tokens so MUI components and custom CSS match.

| MUI key | Token |
| --- | --- |
| `palette.primary.main` | `--color-brand-700` `#C2410C` |
| `palette.primary.dark` | `--color-brand-800` `#9A3412` |
| `palette.primary.light` | `--color-brand-500` `#FF6B35` |
| `palette.primary.contrastText` | `#FFFFFF` |
| `palette.secondary.main` | `--color-herb-700` `#2F7D4F` |
| `palette.secondary.contrastText` | `#FFFFFF` |
| `palette.error.main` | `--color-error` |
| `palette.warning.main` | `--color-warning` |
| `palette.success.main` | `--color-success` |
| `palette.info.main` | `--color-info` |
| `palette.background.default` | `--color-bg` |
| `palette.background.paper` | `--color-surface` |
| `palette.text.primary` | `--color-text` |
| `palette.text.secondary` | `--color-text-secondary` |
| `palette.divider` | `--color-border` |
| `typography.fontFamily` | `--font-body` |
| `typography.h1` to `h3` | `--font-display`, weights per 2.2 |
| `typography.h4` to `h6` | `--font-body`, 600 |
| `typography.button` | `textTransform: 'none'`, 600 |
| `shape.borderRadius` | 16 (`--radius-md`) |
| `breakpoints.values` | `{ xs: 0, sm: 600, md: 900, lg: 1200, xl: 1536 }` |
| `MuiButton.root` | `borderRadius: 999`, `minHeight: 44`, `boxShadow: 'none'` (all variants), `paddingInline: 20` |
| `MuiButton.outlined` | `borderWidth: 1.5`, `borderColor: #A08670` |
| `MuiCard.root` | `boxShadow: --shadow-1`, `border: 1px solid --color-border` |
| `MuiDialog.paper` | `borderRadius: 16`, `boxShadow: --shadow-3` |
| `MuiChip.root` | `borderRadius: 999`, `fontWeight: 500` |
| `MuiTextField` | `size: 'medium'`, outline `--color-border-strong`, focus `--color-brand-700` |

```ts
import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: { main: '#C2410C', dark: '#9A3412', light: '#FF6B35', contrastText: '#FFFFFF' },
    secondary: { main: '#2F7D4F', contrastText: '#FFFFFF' },
    error: { main: '#B91C1C' },
    warning: { main: '#8F5206' },
    success: { main: '#15803D' },
    info: { main: '#1D4ED8' },
    background: { default: '#FFF8F2', paper: '#FFFFFF' },
    text: { primary: '#3B2A20', secondary: '#6B5547' },
    divider: '#EADBCB',
  },
  typography: {
    fontFamily: "'Poppins', system-ui, -apple-system, 'Segoe UI', sans-serif",
    h1: { fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 700 },
    h2: { fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 700 },
    h3: { fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: { borderRadius: 16 },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 999, minHeight: 44, paddingInline: 20 },
        outlined: { borderWidth: 1.5, borderColor: '#A08670', '&:hover': { borderWidth: 1.5 } },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 2px rgba(59, 42, 32, 0.06), 0 1px 3px rgba(59, 42, 32, 0.10)',
          border: '1px solid #EADBCB',
        },
      },
    },
    MuiDialog: {
      styleOverrides: { paper: { borderRadius: 16, boxShadow: '0 12px 32px rgba(59, 42, 32, 0.18)' } },
    },
    MuiChip: { styleOverrides: { root: { borderRadius: 999, fontWeight: 500 } } },
  },
});
```

---

## 4. Components

Each component lists anatomy, variants, states and rules. Shared components live in `src/components/ui/`.

### 4.1 Buttons

| Variant | Background | Text | Border | Use |
| --- | --- | --- | --- | --- |
| Primary | `brand-700`, hover and pressed `brand-800` | `text-inverse` | none | The one main action per view (Start Cooking, Post, Sign in) |
| Secondary | `surface` | `text`, hover bg `brand-50` | 1.5px `border-strong` | Other actions (Share, Save, Cancel) |
| Ghost | transparent, hover `brand-100` | `brand-800` | none | Low-emphasis and inline actions (Back, View all, Revert) |
| Danger | `error` | `text-inverse` | none | Destructive confirms only (Delete post) |
| Icon | transparent, hover `brand-100` | `text-secondary` | none | Heart, share, close; 44px circle; `aria-label` required |

Sizes: **Medium** 44px high, `--text-body` 600, padding `0 var(--space-5)`. **Small** 36px high (with an invisible 44px hit area), `--text-sm` 600, padding `0 var(--space-4)`. **Large** 56px high, `--text-body-lg` 600, used only for the docked Start Cooking button and cook mode controls.

Shape `--radius-pill`. Icon left of the label, `--space-2` gap. States: hover, `:focus-visible` ring (2.8), pressed (`scale(0.98)`), disabled (`opacity: 0.5`, `cursor: not-allowed`), loading (label stays, spinner replaces the icon, `aria-busy="true"`, width does not change).

Rules: labels are verbs in sentence case ("Start cooking", "Save recipe"); no emoji or text arrows in labels (use `bi-arrow-left`); a Back control is always the Ghost variant with `bi-arrow-left` and the destination name ("Recipes"). CSS class names: `.btn`, `.btn--primary`, `.btn--secondary`, `.btn--ghost`, `.btn--danger`, `.btn--icon`, `.btn--sm`, `.btn--lg`. All 69 current button classes map to these.

### 4.2 Chips and filters

- **Filter chip:** 36px high, `--radius-pill`, `--text-sm` 500. Rest: `surface` bg, 1px `border`, `text`. Selected: `brand-50` bg, 1.5px `brand-700` border, `brand-800` text, leading `bi-check` icon. Uses `aria-pressed`.
- **Filter bar:** a single horizontally scrolling row on mobile (no wrap, fade at the right edge), wrapping on desktop. "All" is always first. A chip only appears if it has at least one result.
- **Badge:** 24px high, `--radius-pill`, `--text-xs` 500. Cuisine badge: `surface` at 92% opacity on photos with `text`. Diet badge: `herb-50` bg, `herb-700` text.

### 4.3 Recipe card

Anatomy (top to bottom): photo 4:3 with cuisine badge top-left and heart icon button top-right; title (`--text-h4`, 2 lines max, ellipsis); one metadata line (`--text-sm`, `text-secondary`) with up to two facts, such as `bi-clock 35 min · Easy`.

- The whole card is one `<a>` (React Router `Link`) to `/recipe/:id`. The heart is a separate button that stops propagation.
- Rest `--shadow-1`, hover `--shadow-2` and `translateY(-2px)`, focus ring on the card.
- Facts come only from data (`totalTime`, `difficulty`). If missing, omit them; never estimate.
- No tags or subtitles on the card. Grid: 1 column under 600px, 2 at 600, 3 at 900, 4 at 1200; gap `--space-6`.
- Loading: skeleton card (4.7).

### 4.4 Cultural story card

A compact teaser of the dish's story, shown above the ingredients on the recipe page.

- Container: no card. A 1px `--color-border` top rule with `--space-6` above the label (4.11 section rule).
- Label: "The story" as a 4.11 kicker (`--text-xs` 600 uppercase, +0.08em, `brand-800`).
- Body: an excerpt in `--font-display` 400, `--text-h4` on 32px leading, `text`, clamped to **3 lines**.
- Actions row: Ghost button "Read the story" (expands in place to full text, max `--container-reading`, `aria-expanded`), and, if a video exists, Ghost button `bi-play-circle` "Watch (2 min)" that opens the video in a dialog.
- AI insight: inside the expanded story, Secondary button `bi-stars` "Ask about this dish" opens preset questions as chips ("What's the story behind it?", "Why this ingredient?", "How is it served at home?"). The AI answer appears below with an "AI-generated" `--text-xs` label in `text-muted`.
- If no story exists, the card is not shown (no placeholder text).

### 4.5 Ingredient swap pattern

Lets cooks replace an ingredient for a diet without leaving the list.

**Ingredient row (rest):**
- Layout: 44px checkbox (custom, `--radius-sm`, checked fill `brand-700`) · quantity (`--weight-semibold`, `text`, fixed width 5ch, right aligned) · name (`text`) · swap button on the right if a swap exists.
- Checking strikes through the name in `text-muted` (for "I have it" or "added").
- Swap button: Icon button size small, `bi-arrow-left-right`, `aria-label="Swap {ingredient}"`, color `herb-700`.

**Diet selector (above the list):** filter chips "Original", "Vegetarian", "Gluten-free", "Low-sodium" (4.2). Choosing a diet applies every available swap at once and shows a count: "3 swaps applied" with a Ghost "Undo" button.

**Swap popover (single ingredient):** opens under the row (bottom sheet on mobile), `--shadow-2`, `--radius-md`, padding `--space-4`. Lists up to 3 options, each with name, the diet badge, and one line on how it changes the dish ("Slightly nuttier; holds shape when fried"). Primary small button "Use this". Close on Esc or outside click; focus returns to the swap button.

**Swapped row:** `herb-50` background, `--radius-sm`; the new ingredient in `text`, followed by "instead of {original}" in `--text-sm` `text-secondary`; a `herb-700` "Swapped" badge; the swap button becomes Ghost "Revert" (`bi-arrow-counterclockwise`).

**Authenticity note:** if a swap changes the dish's traditional character, show a `saffron-100` note under the row with `bi-info-circle` in `saffron-700`: "Traditionally made with pork; jackfruit keeps the texture."

**States:** loading swaps shows a 3-line skeleton in the popover; no swap available hides the button; error shows "Couldn't load swaps. Try again" with a Ghost retry (4.7).

Rules: the original list is always restorable in one tap; swaps never change step text silently, and steps that mention a swapped ingredient show it in `herb-700` with the original on hover or long press.

### 4.6 Cook mode step pattern

A full-screen, distraction-free view for cooking one step at a time.

**Entry:** the docked Start Cooking button (5.1) or a step number. Opens as a full-screen layer (`--z-overlay`), `surface` background, slide up over `--duration-slow`. Requests a screen Wake Lock (`navigator.wakeLock.request('screen')`) and releases it on exit.

**Layout (top to bottom):**
1. **Top bar** (56px): Icon button `bi-x-lg` "Exit cook mode" left; recipe title center (`--text-sm` 600, 1 line); Icon button `bi-list-check` "Ingredients" right (opens the ingredient list as a sheet, with the 4.5 checkboxes).
2. **Progress:** segmented bar, one segment per step, 4px high, `--radius-pill`; done segments `brand-500`, current `brand-700`, upcoming `border`. Below it "Step 3 of 8" in `--text-sm` `text-secondary`, with `aria-live="polite"`.
3. **Step body** (centered, max width `--container-reading`, padding `--space-6`): step text in `--text-step`, `text`. Ingredients named in the step are bolded with their quantity ("**2 tbsp** soy sauce"). Swapped ingredients use the 4.5 style.
4. **Timer chip** (when the step contains a duration like "10 minutes"): Secondary button `bi-stopwatch` "Start 10:00 timer". Running: `brand-50` background, live countdown, pause and reset icons. At zero: a sound plus vibration, and the chip turns `success` with "Done". Timers keep running when moving between steps and show as small chips in the top bar.
5. **Tip or fun fact** (when present for the step): `saffron-100` box, `--radius-md`, `bi-lightbulb` in `saffron-700`, `--text-body`. One per step at most.
6. **Bottom controls** (docked, 88px including safe-area inset, `--shadow-2`): Secondary large "Back" (`bi-arrow-left`) on the left, Primary large "Next step" (`bi-arrow-right`) filling the remaining width. On the last step the primary becomes "Finish".

**Interaction:** swipe left or right, keyboard arrows, and Space for next; tapping the step text also advances. Step text changes with a 200ms cross-fade (none if reduced motion). Exiting mid-recipe asks nothing; the current step is remembered per recipe in `localStorage` and offered as "Resume at step 3" next time.

**Finish screen:** `bi-check-circle-fill` in `success`, "Enjoy your {dish}!", and three actions: Primary "Share a photo" (to Create Post with the recipe linked), Secondary "Rate this recipe", Ghost "Back to recipe".

**Accessibility:** each step is a heading for screen readers ("Step 3 of 8"); all controls are at least 56px high; contrast meets AA at arm's length (text never lighter than `text`).

### 4.7 Loading, empty and error states

Every view that loads data shows exactly one of four states: **loading**, **empty**, **error**, or **content**. A failed request is never shown as empty. Shared components: `<Skeleton />`, `<EmptyState />`, `<ErrorState />`, `<InlineSpinner />`.

**Loading**
- Under 300ms: show nothing (avoid flashes).
- After 300ms: skeletons shaped like the content (recipe grid: 8 skeleton cards; recipe page: hero block + 2 text lines + 6 ingredient rows; post: avatar circle + 3 lines + image block; profile: avatar + 2 lines + grid).
- Skeleton style: `surface-sunken` blocks with `--radius-sm` (text) or `--radius-md` (images), a soft shimmer (1.4s, disabled under reduced motion). Container has `aria-busy="true"` and a visually hidden "Loading recipes".
- Button actions use the loading button state (4.1), never a full-page spinner.
- After 8 seconds, add a line under the skeleton: "Still loading. The server may be waking up." (`--text-sm`, `text-muted`).

**Empty**
- Centered in the content area, max width 420px, padding `--space-12` top and bottom.
- Anatomy: 48px Bootstrap icon in `brand-500` inside a 96px `brand-50` circle · title (`--text-h4`) · one-sentence body (`text-secondary`) · one action button.
- Copy per case:

| Where | Icon | Title | Body | Action |
| --- | --- | --- | --- | --- |
| Recipe list, no filter match | `bi-search` | No recipes match | Try another cuisine or clear the filters. | Ghost "Clear filters" |
| Cuisine with no recipes | `bi-globe2` | No {cuisine} recipes yet | We're adding more dishes soon. | Secondary "Browse all recipes" |
| Community feed | `bi-chat-heart` | No posts yet | Share what you cooked to start the conversation. | Primary "Create a post" |
| Post comments | `bi-chat` | No comments yet | Be the first to say something. | (focus the comment field) |
| Favorites | `bi-heart` | No saved recipes | Tap the heart on any recipe to save it here. | Secondary "Find recipes" |
| User profile posts | `bi-camera` | No posts yet | (own profile) Share your first dish. (other) {Name} hasn't posted yet. | Primary "Create a post" on own profile only |
| Search | `bi-search` | Nothing found for "{query}" | Check the spelling or try a dish name. | Ghost "Clear search" |

**Error**
- Same layout as Empty, icon `bi-exclamation-circle` in `error` inside an `error-bg` circle.
- Title says what failed in plain words; body says what to do. Never show stack traces, IDs, status codes or raw API messages.
- Always a Primary "Try again" that re-runs the request, plus a Ghost way out ("Back to recipes").
- Copy:

| Case | Title | Body |
| --- | --- | --- |
| Network or server error | We couldn't load this | Check your connection and try again. |
| Not found (404) | This recipe isn't here | It may have been removed. Browse other dishes instead. (no Try again) |
| Signed out (401) | Sign in to continue | You need an account to {action}. Primary "Sign in" |
| AI feature failed | The story is taking a break | Our AI couldn't answer right now. Try again in a moment. |

- **Inline errors** (one part of a page failed, like music or AI insight): a compact row inside that section with `bi-exclamation-circle`, one sentence, and a Ghost "Try again"; the rest of the page stays usable.
- **Action errors** (like, delete, upload failed): a toast (`--z-toast`, `--shadow-3`, bottom center on mobile, bottom left on desktop, 5s, `role="status"`), never `alert()`.
- **Form errors:** under the field in `error`, `--text-sm`, with `bi-exclamation-circle`, linked by `aria-describedby`; the field border turns `error`. A summary at the top only when there are three or more.

### 4.8 Forms and inputs

48px high, `surface` background, 1px `border-strong`, `--radius-sm`, padding `0 var(--space-4)`, `--text-body` (16px minimum so iOS doesn't zoom). Label above (`--text-sm` 600), helper text below (`--text-sm`, `text-secondary`). Focus: 2px `brand-700` border plus focus ring. Disabled: `surface-sunken`. Password fields have a show/hide icon button.

### 4.9 Navigation

- **Top nav** (from PR #1 `SiteNav`): 64px, `surface` with `--shadow-1`, sticky, `--z-nav`. Logo in `--font-display` 700, `brand-800`. Links `--text-sm` 600 `text-secondary`; active link `text` with a 2px `brand-500` underline. Right side: search icon button, then avatar or a Secondary small "Sign in".
- **Mobile (under 900px):** links move into a menu sheet opened by `bi-list`; the search field expands full width.
- **Footer:** `surface-warm`, links to Recipes, Community, About, and the copyright in `--text-sm` `text-secondary`.
- No per-page "Back to Home" buttons; use the nav. Detail pages may show one Ghost back link to their parent list.

### 4.10 Toasts and dialogs

- Toast: see 4.7. Variants success, error, info: left 4px bar in the status color, `surface` background, `text`.
- Dialog: `surface`, `--radius-md`, `--shadow-3`, max width 560px, padding `--space-6`, title `--text-h3`. Actions bottom right, Primary on the right. Backdrop `--color-overlay`. Esc and backdrop click close it; focus is trapped and returned.

### 4.11 Editorial patterns

Used on the home page and any page that reads like a magazine feature. Components: `src/components/TypeCover.tsx`; home page styles in `HomePage.css`.

- **Kicker, headline, deck.** Kicker: `--text-xs` 600, uppercase, +0.08em, `brand-800`, for context such as "Dish of the day · Thai · Asian". Headline: `--font-display` 700. Deck: the 2.2 Deck style, max width about 34ch. Use real data only (cuisine, region, `subtitle`); never invent a headline.
- **Section rule.** Sections open with a 1px `--color-border` top rule and `--space-6` above the kicker, instead of sitting inside a card. Cards stay for things that are one tappable object (recipe card, post). One section per page may sit on a `surface-warm` band (on the home page, the AI section).
- **Type cover.** Stands in for a missing recipe photo in the same frame (4:3 on cards). A tinted block with the region as a kicker and a `--font-display` italic 600 title. Next to a visible dish title the cover shows the cuisine, otherwise the dish name. The tint is fixed per region, using only AA pairs from 2.1:

| Region | Background | Text |
| --- | --- | --- |
| Mediterranean (and default) | `surface-warm` | `brand-800` |
| European | `surface-sunken` | `text` |
| Asian | `saffron-100` | `saffron-700` |
| Middle Eastern, African | `herb-50` | `herb-700` |
| Latin, American | `brand-50` | `brand-800` |

  The cover is `aria-hidden`; the dish name is always in real text nearby. Large covers show a small "Photo coming soon" note.
- **Photo credit.** When a recipe has `image_credit` (`{ author, license, license_url, source_url, source }`, filled by `npm run add-photos` from Wikimedia Commons), show "Photo: {author}, {license} via {source}" under the photo in `--text-xs`, `text-muted`, with the author linked to `source_url` and the license to `license_url`. Show it only when the photo itself is shown.
- **Numbered lists** (collection shelves) use a `brand-700` display numeral (`brand-500` is only 2.7:1) only when the list is a real sequence or count; the cuisine index uses dotted leaders and counts instead of numbers.

---

## 5. Page patterns

### 5.1 Recipe detail

Top to bottom on mobile; two columns from 900px.

1. **Hero (4.11):** from 900px, a split hero with the media at 7fr beside the header at 5fr; on phones the media comes first, full-bleed. The media is a 4:3 photo (`--radius-md` from 600px) with its photo credit, or the type cover (hero size) when there's no photo.
2. **Header:** kicker (cuisine · region), title (`--font-display` 700, clamp 36 to 56px), the subtitle as a Deck (2.2), then a facts row under a hairline rule: total time first ("25 min total", 600, `text`), then "Prep 10 min · Cook 15 min", servings, difficulty and rating, from data only. Actions row below: from 900px a Primary "Start cooking" (or "Continue at step N" / "Resume at step N"), then heart, share, print as Icon buttons.
3. **Cultural story card** (4.4).
4. **Ingredients and steps:** from 900px two columns under a hairline rule, ingredients (40%) sticky under the nav, steps (60%). Under 900px a sticky "Ingredients · 3/6 | Steps · 2/6" switch shows one list at a time, with a thin herb progress line.
   - **Ingredients:** heading with "N of M ready", one tool row (servings stepper, Metric/US segmented control), then "Make it" diet chips (4.5) with "N ingredients swapped. The steps are updated too. Undo all". Rows sit on hairlines: checkbox, quantity, name, and a "Swap" pill (`bi-arrow-left-right` + text) when a swap exists. A swapped row shows "Vegetarian swap, instead of X · Undo" in `herb-700` under the name. Swaps that fail to load are simply not offered; no error box.
   - **Steps:** heading with Reset (shown once anything is ticked), a progress bar and "N of M steps done". Each step is a real checkbox drawn as a 28px circle (`herb-700` filled when done), a "Step N" kicker and `--text-body-lg` text; done steps turn `text-muted`. The first unticked step, once any is ticked, is "Step N · now": a `surface` panel with a 1.5px `brand-700` ring and `--text-h4` text. Ticks are saved per recipe in this browser. After the steps, the "Good to know" aside (fun facts).
5. **More sections** as anchors, not tabs: "Cook with music" (Spotify embed), "Video" (if present), "From the community" (posts linked to this recipe).
6. **Docked Start Cooking button (phones and tablets only, under 900px; desktop uses the header button):** a bar fixed to the bottom of the viewport (`--z-dock`), `surface` at 96% opacity with backdrop blur, `--shadow-2`, padding `--space-3 var(--space-4)` plus safe-area inset. Contains a full-width Primary large button `bi-play-fill` "Start cooking" that opens cook mode (4.6); on desktop the bar is centered with max width 480px and `--radius-pill`. It hides while the footer is visible and while cook mode is open. Page content gets bottom padding equal to the bar height so nothing is covered.

### 5.2 Home

Editorial layout (4.11). One visually hidden `h1`; each section is an `h2`. Top to bottom:

1. **Dish of the day hero:** photo or type cover (4:3, 7 columns) beside kicker, headline (clamp up to 56px), deck, two sentences of `culturalBackground`, a facts row (time, difficulty, servings, from data only), Primary "Cook this dish" and the heart. Photo credit under the photo. On phones the photo comes first, full bleed.
2. **Search band** (`surface`, rules above and below): labeled field, Primary "Search", quick-route chips with counts (Under 30 min, Vegetarian, Easy; shown only with matches) and a Ghost "Help me pick" for Quick Start.
3. **Collections:** up to three shelves (Under 30 minutes, Meat-free tables, Weekend projects), each a numbered list of up to 4 dishes linking to the matching All Recipes filter.
4. **Browse by cuisine:** a typographic index grouped by region with real counts.
5. **Ask the kitchen:** the one `surface-warm` band. Introduces Cook with AI and Ask about this dish, shows example questions as plain text (not buttons), and says AI answers can be wrong.
6. **Trending:** recipe cards (4.3), 4 / 3 / 2 across, a sideways scroller on phones.
7. **Stories behind the dish:** one lead story with media and two shorter ones, text from the recipe's own `culturalBackground`.
8. **From the community** (3 posts), then the footer.

Sections without data are hidden; loading and errors follow 4.7.

### 5.3 List pages (All recipes, Cuisine, Trending)

Page title (`--text-h1`) and a one-line description, search, then the filter bar (4.2). On All recipes the bar shows only the cuisine row; diet, difficulty and time sit behind a Secondary small "Filters (n)" button (n = how many of those are on), which opens a popover on desktop and a bottom sheet under 600px, with "Clear" and "Show N recipes" at the bottom. Filters that are on show next to the button as pressed chips that remove themselves when tapped. Then the result count (`--text-sm`, `text-secondary`, `aria-live="polite"`), the card grid (4.3), then "Load more" as a Secondary button (or infinite scroll with a visible fallback button). States per 4.7.

### 5.4 Community, post and profile

Feed column max width 680px. Post card: avatar 40px, name (`--weight-semibold`), time (`text-muted`), photo 4:3, text clamped to 4 lines, actions row (like, comment, share as Icon buttons with counts). Profile header: avatar 96px, name `--text-h2`, stats row, Primary "Follow" or Secondary "Edit profile". States per 4.7.

### 5.5 Auth

Single centered card max width 420px on `surface-warm` background; logo, `--text-h2` title, fields (4.8), Primary full-width submit, Ghost link to the other form.

---

## 6. Accessibility checklist

- [ ] Text contrast at least 4.5:1, large text and UI borders at least 3:1 (use only the pairs in 2.1).
- [ ] Every interactive element reachable by keyboard, in visual order, with a visible `:focus-visible` ring.
- [ ] Clickable cards are links; icon-only buttons have `aria-label`.
- [ ] Tap targets at least 44 by 44px (56px in cook mode).
- [ ] Images have meaningful `alt`; decorative images use `alt=""`.
- [ ] Dynamic updates (result counts, step changes, toasts) announced with `aria-live="polite"`.
- [ ] `prefers-reduced-motion` respected.
- [ ] Page has one `h1`; headings in order.
- [ ] Forms have visible labels and linked error text.
- [ ] Language of non-English greetings marked with `lang` attributes.

---

## 7. Migration map

Use this when replacing hardcoded values (stage 2).

| Old value | New token |
| --- | --- |
| `#FF6B35` as button or text background with white text | `--color-brand-700` |
| `#FF6B35` as accent, icon, border highlight | `--color-brand-500` |
| `#e55a2b`, `#ff8a5c` | `--color-brand-600` |
| `#f7931e`, `#ffb74d`, `#e67e22` | `--color-saffron-500` (decorative) or `--color-brand-700` (actions) |
| `linear-gradient(… #FF6B35 … #f7931e …)` | solid `--color-brand-700` (buttons) or `--color-brand-500` (accents) |
| `#FBE7D2`, `#fdf4ec`, `#fff8f3` | `--color-surface-warm` (bands) or `--color-bg` (page) |
| `#2c3e50`, `#2d3748`, `#333`, `#5D4037`, `#213547` | `--color-text` |
| `#666`, `#4a5568`, `#555`, `#495057`, `#6c757d` | `--color-text-secondary` |
| `#999`, `#ccc` used as text | `--color-text-muted` |
| `#e0e0e0`, `#ddd`, `#f0f0f0`, `#e2e8f0`, `#e9ecef` | `--color-border` |
| `#f8f9fa`, `#f5f5f5`, `#f8f8f8`, `#f3f3f3`, `#f5f7fa` | `--color-surface-sunken` |
| `#fff`, `white` | `--color-surface` (backgrounds) or `--color-text-inverse` (text) |
| `#28a745`, `#22c55e`, `#4caf50` | `--color-success` or `--color-herb-700` (diet, swaps) |
| `#dc3545`, `#e74c3c`, `#c82333` | `--color-error` |
| `#fff3cd`, `#856404` | `--color-warning-bg`, `--color-warning` |
| `#3498db`, `#3b82f6` | `--color-info` |
| `'Quicksand', sans-serif`, `'Segoe UI', …` | `var(--font-body)` |
| `'Poppins', sans-serif` | `var(--font-body)` |
| `'Playfair Display', serif` | `var(--font-display)` |
| `border-radius` 3, 4, 6, 8, 10px | `--radius-sm` |
| `border-radius` 12, 14, 15, 16, 20px | `--radius-md` |
| `border-radius` 25, 30, 50px, `50%` on pills and avatars | `--radius-pill` |
| Orange `box-shadow` (`rgba(255, 107, 53, …)`) | `--shadow-1` or `--shadow-2` |
| Any other `box-shadow` | nearest of `--shadow-1`, `--shadow-2`, `--shadow-3` |
| Paddings and margins | nearest `--space-*` value |

---

## 8. Changelog

| Version | Date | Change |
| --- | --- | --- |
| 1.0 | 2026-10-20 | First version, based on the existing SavorSync brand (`#FF6B35`, `#FBE7D2`, Playfair Display, Poppins) with accessible action colors, one body font, and the component patterns above. |
| 1.1 | 2026-10-29 | Editorial additions from the home page redesign (PR #8): Deck type style and Playfair italic (2.2), type cover and photo credit replacing the grey photo fallback (2.8, 4.11), section rules (4.11), and the new home page structure (5.2). |
| 1.2 | 2026-10-29 | Recipe page in the 4.11 style: split hero with type cover, kicker and deck, total time first, story as a ruled excerpt (4.4, 5.1), fun facts in one "Good to know" aside. All recipes: cuisine row visible, other filters behind a "Filters (n)" button (5.3). Recipe page cooking flow: step and ingredient checkboxes with progress, "Step N · now", clear Swap pills, phone Ingredients/Steps switch, header cook button on desktop (5.1). |
