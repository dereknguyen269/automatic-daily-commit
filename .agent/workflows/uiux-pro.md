---
description: UI/UX design intelligence. 11 CSV databases (styles, palettes, fonts, products, charts, buttons, CTAs, stacks, animations, icons, layouts).
---

# UI/UX Pro - Design Intelligence

Searchable database of UI styles, color palettes, font pairings, chart types, product recommendations, and tech stack best practices using BM25 search engine.

## Prerequisites

Check if Node.js is installed:

```bash
node --version
```

If Node.js is not installed, install it based on user's OS:

**macOS:**
```bash
brew install node
```

**Ubuntu/Debian:**
```bash
sudo apt update && sudo apt install nodejs npm
```

**Windows:**
```powershell
winget install OpenJS.NodeJS
```

---

## How to Use This Skill

When user requests UI/UX work (design, build, create, implement, review, fix, improve), follow this workflow:

### Step 1: Analyze User Requirements

Extract key information from user request:
- **Product type**: SaaS, e-commerce, portfolio, dashboard, landing page, etc.
- **Style keywords**: minimal, playful, professional, elegant, dark mode, etc.
- **Industry**: healthcare, fintech, gaming, education, etc.
- **Tech stack**: React, Vue, Next.js, or infer from context

### Step 2: Search the Knowledge Base

Use the BM25 search engine to gather comprehensive design recommendations:

```bash
node .vibe-shared/uiux-pro/uiux-pro.js "<your search query>"
```

**Example queries:**
```bash
# For a SaaS landing page
node .vibe-shared/uiux-pro/uiux-pro.js "saas landing page modern professional clean"

# For an e-commerce site
node .vibe-shared/uiux-pro/uiux-pro.js "ecommerce product showcase vibrant colorful"

# For a healthcare dashboard
node .vibe-shared/uiux-pro/uiux-pro.js "healthcare dashboard analytics charts minimal"

# For a beauty/spa service
node .vibe-shared/uiux-pro/uiux-pro.js "beauty spa wellness elegant soft luxury"
```

The search will return recommendations across all categories:
- **UI Styles** - Design approach, visual style
- **Color Palettes** - Primary, secondary, CTA, background, text, border colors
- **Font Pairings** - Heading and body font combinations with Google Fonts imports
- **Products** - Product type recommendations and best practices
- **Chart Types** - Data visualization recommendations (if applicable)
- **Button Styles** - CTA button designs
- **CTA Components** - Call-to-action patterns
- **Tech Stacks** - Framework and technology recommendations
- **Animations** - Motion and transition patterns
- **Icon Styles** - Icon set recommendations
- **Layout Templates** - Page structure and section layouts

### Step 3: Synthesize and Implement

After gathering search results:
1. **Analyze** the recommendations and select the most appropriate options
2. **Create a design system** based on the selected palette, fonts, and styles
3. **Implement** the UI using the recommended tech stack
4. **Apply** the professional UI rules (see below)
5. **Verify** using the pre-delivery checklist

---

## Available Data Categories

The knowledge base contains 11 CSV databases:

| Category | File | Contains |
|----------|------|----------|
| UI Styles | `ui_styles.csv` | Design styles, visual approaches, effects |
| Color Palettes | `color_palettes.csv` | Color schemes by mood and product type |
| Font Pairings | `font_pairings.csv` | Typography combinations with Google Fonts |
| Products | `products.csv` | Product type recommendations and patterns |
| Chart Types | `chart_types.csv` | Data visualization types and libraries |
| Button Styles | `button_styles.csv` | CTA button designs and patterns |
| CTA Components | `cta_components.csv` | Call-to-action component patterns |
| Tech Stacks | `tech_stacks.csv` | Framework and technology recommendations |
| Animations | `animations.csv` | Motion and transition patterns |
| Icon Styles | `icon_styles.csv` | Icon set recommendations |
| Layout Templates | `layout_templates.csv` | Page structure and section layouts |

---

## Example Workflow

**User request:** "Làm landing page cho dịch vụ chăm sóc da chuyên nghiệp"

**Step 1: Analyze**
- Product: Beauty/spa service landing page
- Style: Elegant, professional, soft, luxury
- Industry: Beauty, wellness
- Stack: HTML + Tailwind (default for landing pages)

**Step 2: Search**
```bash
node .vibe-shared/uiux-pro/uiux-pro.js "beauty spa wellness elegant soft luxury landing page"
```

**Step 3: Implement**
Based on search results, create:
- Design system with recommended color palette
- Typography using recommended font pairing
- Layout using recommended template structure
- Components following recommended UI style
- Animations and interactions as suggested

---

## Tips for Better Results

1. **Be specific with keywords** - "healthcare SaaS dashboard analytics" > "app"
2. **Include product type** - "landing page", "dashboard", "mobile app"
3. **Mention style preferences** - "minimal", "playful", "professional", "dark mode"
4. **Specify tech if needed** - "react", "nextjs", "vue" (auto-prioritizes in results)
5. **Combine multiple aspects** - Product + Style + Industry = Better matches

---

## Common Rules for Professional UI

These are frequently overlooked issues that make UI look unprofessional:

### Icons & Visual Elements

| Rule | Do | Don't |
|------|----|----- |
| **No emoji icons** | Use SVG icons (Heroicons, Lucide, Simple Icons) | Use emojis like 🎨 🚀 ⚙️ as UI icons |
| **Stable hover states** | Use color/opacity transitions on hover | Use scale transforms that shift layout |
| **Correct brand logos** | Research official SVG from Simple Icons | Guess or use incorrect logo paths |
| **Consistent icon sizing** | Use fixed viewBox (24x24) with w-6 h-6 | Mix different icon sizes randomly |

### Interaction & Cursor

| Rule | Do | Don't |
|------|----|----- |
| **Cursor pointer** | Add `cursor-pointer` to all clickable/hoverable cards | Leave default cursor on interactive elements |
| **Hover feedback** | Provide visual feedback (color, shadow, border) | No indication element is interactive |
| **Smooth transitions** | Use `transition-colors duration-200` | Instant state changes or too slow (>500ms) |

### Light/Dark Mode Contrast

| Rule | Do | Don't |
|------|----|----- |
| **Glass card light mode** | Use `bg-white/80` or higher opacity | Use `bg-white/10` (too transparent) |
| **Text contrast light** | Use `#0F172A` (slate-900) for text | Use `#94A3B8` (slate-400) for body text |
| **Muted text light** | Use `#475569` (slate-600) minimum | Use gray-400 or lighter |
| **Border visibility** | Use `border-gray-200` in light mode | Use `border-white/10` (invisible) |

### Layout & Spacing

| Rule | Do | Don't |
|------|----|----- |
| **Floating navbar** | Add `top-4 left-4 right-4` spacing | Stick navbar to `top-0 left-0 right-0` |
| **Content padding** | Account for fixed navbar height | Let content hide behind fixed elements |
| **Consistent max-width** | Use same `max-w-6xl` or `max-w-7xl` | Mix different container widths |

---

## Pre-Delivery Checklist

Before delivering UI code, verify these items:

### Visual Quality
- [ ] No emojis used as icons (use SVG instead)
- [ ] All icons from consistent icon set (Heroicons/Lucide)
- [ ] Brand logos are correct (verified from Simple Icons)
- [ ] Hover states don't cause layout shift
- [ ] Colors match the recommended palette

### Interaction
- [ ] All clickable elements have `cursor-pointer`
- [ ] Hover states provide clear visual feedback
- [ ] Transitions are smooth (150-300ms)
- [ ] Focus states visible for keyboard navigation

### Light/Dark Mode
- [ ] Light mode text has sufficient contrast (4.5:1 minimum)
- [ ] Glass/transparent elements visible in light mode
- [ ] Borders visible in both modes
- [ ] Test both modes before delivery

### Layout
- [ ] Floating elements have proper spacing from edges
- [ ] No content hidden behind fixed navbars
- [ ] Responsive at 320px, 768px, 1024px, 1440px
- [ ] No horizontal scroll on mobile

### Accessibility
- [ ] All images have alt text
- [ ] Form inputs have labels
- [ ] Color is not the only indicator
- [ ] `prefers-reduced-motion` respected

### Typography
- [ ] Using recommended font pairing from search results
- [ ] Google Fonts properly imported
- [ ] Consistent font sizes and line heights
- [ ] Proper heading hierarchy (h1 → h6)

---

## Technical Notes

- **Search Engine**: Uses wink-bm25-text-search for intelligent matching
- **Data Format**: CSV files in `.vibe-shared/uiux-pro/data/`
- **Language Support**: Supports Vietnamese and English keywords
- **Auto-prioritization**: React/Next.js stacks auto-prioritized when mentioned
- **Fallback**: Returns top 3 items per category if no exact match found