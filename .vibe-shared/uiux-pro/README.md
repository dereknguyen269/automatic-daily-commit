# UI/UX Pro - BM25 Search Engine

A Node.js-based BM25 search engine for UI/UX design recommendations using curated CSV knowledge bases.

## Features

- **11 CSV Databases**: Styles, palettes, fonts, products, charts, buttons, CTAs, stacks, animations, icons, layouts
- **BM25 Search**: Intelligent text search using wink-bm25-text-search
- **Smart Recommendations**: Auto-categorization and prioritization
- **Multi-language**: Supports English and Vietnamese keywords
- **Tech Stack Prioritization**: Auto-prioritizes React/Next.js when mentioned

## Installation

```bash
npm install
```

## Usage

### Command Line

```bash
node uiux-pro.js "your search query"
```

### As a Module

```javascript
import { createUIUXKnowledgeBase, generateUiKit } from './uiux-pro.js';

// Create knowledge base
const kb = createUIUXKnowledgeBase();

// Get smart recommendations
const recommendations = kb.smartRecommendation("saas landing page modern");

// Or generate a complete UI kit
const uiKit = generateUiKit("saas landing page modern");
```

## Data Structure

All data is stored in CSV format in the `data/` directory:

```
data/
├── ui_styles.csv          # Design styles and visual approaches
├── color_palettes.csv     # Color schemes by mood and product type
├── font_pairings.csv      # Typography combinations
├── products.csv           # Product type recommendations
├── chart_types.csv        # Data visualization types
├── button_styles.csv      # CTA button designs
├── cta_components.csv     # Call-to-action patterns
├── tech_stacks.csv        # Framework recommendations
├── animations.csv         # Motion and transition patterns
├── icon_styles.csv        # Icon set recommendations
└── layout_templates.csv   # Page structure templates
```

## Search Algorithm

The search engine uses BM25 (Best Matching 25) algorithm for text relevance ranking:

1. **Text Normalization**: Converts to lowercase, removes special characters
2. **Tokenization**: Splits into words
3. **BM25 Scoring**: Ranks documents by relevance
4. **Category Filtering**: Returns top 3 results per category
5. **Smart Fallback**: Returns default items if no matches found

## Smart Recommendation Logic

The `smartRecommendation()` function automatically detects keywords and enables relevant categories:

- **Charts**: Enabled when query contains "chart", "metric", "dashboard", "analytics"
- **Tech Stacks**: Enabled when query contains "stack", "tech", "react", "next"
- **Colors**: Enabled when query contains "color", "màu", "palette", "theme"
- **Fonts**: Enabled when query contains "font", "typography", "type"
- **Products**: Enabled when query contains "landing", "saas", "app", "product"
- **Buttons**: Enabled when query contains "button", "cta"
- **Animations**: Enabled when query contains "animation", "motion", "transition"
- **Icons**: Enabled when query contains "icon", "icons"
- **Layouts**: Enabled when query contains "layout", "grid", "section", "template"

## Tech Stack Prioritization

When "react" or "nextjs" is mentioned in the query, the search engine automatically prioritizes React and Next.js stacks:

```javascript
// Priority scoring:
// React + Next.js = 3 points
// React only = 2 points
// Next.js only = 1 point
// Others = 0 points
```

## Example Output

```javascript
{
  ui_styles: [
    { style_name: 'Glassmorphism', description: '...' }
  ],
  color_palettes: [
    { palette_name: 'Slate Professional', mood: 'professional_trustworthy' }
  ],
  font_pairings: [
    { pairing_name: 'Modern Sans', heading_font: 'Inter', body_font: 'Inter' }
  ],
  products: [
    { product_name: 'SaaS Platform', category: 'Software', ... }
  ],
  chart_types: [...],
  button_styles: [...],
  cta_components: [...],
  tech_stacks: [
    { stack_name: 'Next.js', technologies: 'Next.js + React + Tailwind CSS', ... }
  ],
  animations: [...],
  icon_styles: [...],
  layout_templates: [...]
}
```

## Dependencies

- **csv-parse**: CSV file parsing
- **wink-bm25-text-search**: BM25 search algorithm

## License

MIT
