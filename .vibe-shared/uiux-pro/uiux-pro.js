import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parse } from 'csv-parse/sync';
import bm25 from 'wink-bm25-text-search';

// =================== CONFIG =================== //

// Resolve directory of this file, even in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Always point to the data/ folder next to uiux-skill.js
const DATA_DIR = path.join(__dirname, 'data');

// Map category -> tên file csv (khớp list bạn đang có)
const CATEGORY_FILES = {
  ui_styles: 'ui_styles.csv',
  color_palettes: 'color_palettes.csv',
  products: 'products.csv',
  font_pairings: 'font_pairings.csv',
  chart_types: 'chart_types.csv',
  button_styles: 'button_styles.csv',
  cta_components: 'cta_components.csv',
  tech_stacks: 'tech_stacks.csv',
  animations: 'animations.csv',
  icon_styles: 'icon_styles.csv',
  layout_templates: 'layout_templates.csv'
};

// =================== TEXT UTILS =================== //

// Tokenizer/normalizer đơn giản, đủ dùng cho BM25
function normalizeText(text) {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    // giữ chữ cái, số, kí tự tiếng Việt có dấu và khoảng trắng
    .replace(/[^a-z0-9\u00C0-\u1EF9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .join(' ');
}

// Ghép toàn bộ cột trong 1 row thành 1 string
function combineRowText(rowObj) {
  return Object.values(rowObj)
    .map((v) => (v == null ? '' : String(v)))
    .join(' ');
}

// =================== KNOWLEDGE BASE =================== //

class UIUXKnowledgeBase {
  constructor(dataDir = DATA_DIR) {
    this.dataDir = dataDir;
    this.rawData = {};     // { category: [rows] }
    this.engine = bm25();  // wink-bm25 engine
    this.docIdToMeta = {}; // docId -> { category, rowIndex, data }
  }

  // Load tất cả CSV và build index
  loadAll() {
    for (const [category, fileName] of Object.entries(CATEGORY_FILES)) {
      const filePath = path.join(this.dataDir, fileName);
      if (!fs.existsSync(filePath)) {
        console.warn(`[WARN] CSV not found for category "${category}": ${filePath}`);
        continue;
      }

      const content = fs.readFileSync(filePath, 'utf8');
      const records = parse(content, {
        columns: true,
        skip_empty_lines: true
      });

      this.rawData[category] = records;
    }

    this.buildIndex();
  }

  buildIndex() {
    // Chỉ có 1 field text
    this.engine.defineConfig({
      fldWeights: { text: 1 }
    });

    // Pipeline xử lý text:
    // 1) normalize string
    // 2) tách thành tokens
    this.engine.definePrepTasks([
      function toNormalized(text) {
        return normalizeText(text);
      },
      function toTokens(normalizedText) {
        return normalizedText.split(/\s+/);
      }
    ]);

    let docCounter = 0;

    for (const [category, records] of Object.entries(this.rawData)) {
      records.forEach((row, rowIndex) => {
        const text = combineRowText(row);
        const doc = { text };
        const docId = docCounter;

        this.engine.addDoc(doc, docId);

        this.docIdToMeta[docId] = {
          category,
          rowIndex,
          data: row
        };

        docCounter += 1;
      });
    }

    this.engine.consolidate();
  }

  // Search chung, có thể filter category
  search(query, categories = null, topK = 5) {
    if (!query || !query.trim()) return [];

    const hits = this.engine.search(query); // engine tự dùng prepTasks

    const results = [];
    for (const [docId, score] of hits) {
      const meta = this.docIdToMeta[docId];
      if (!meta) continue;

      if (categories && !categories.includes(meta.category)) {
        continue;
      }

      results.push({
        category: meta.category,
        score,
        data: meta.data
      });

      if (results.length >= topK) break;
    }

    return results;
  }

    // Hàm high-level cho Claude/Cursor:
  // Nhận query -> trả về gợi ý theo từng category
  smartRecommendation(query) {
    const q = query.toLowerCase();

    const wantCharts =
      q.includes('chart') ||
      q.includes('metric') ||
      q.includes('dashboard') ||
      q.includes('analytics');
    const wantTech =
      q.includes('stack') ||
      q.includes('tech') ||
      q.includes('frontend') ||
      q.includes('backend') ||
      q.includes('react') ||
      q.includes('reactjs') ||
      q.includes('next');
    const wantColors =
      q.includes('color') ||
      q.includes('màu') ||
      q.includes('palette') ||
      q.includes('theme');
    const wantFonts =
      q.includes('font') ||
      q.includes('typography') ||
      q.includes('type');
    const wantProduct =
      q.includes('landing') ||
      q.includes('saas') ||
      q.includes('crm') ||
      q.includes('app') ||
      q.includes('product') ||
      q.includes('education') ||
      q.includes('school') ||
      q.includes('course');
    const wantButtons =
      q.includes('button') ||
      q.includes('cta') ||
      q.includes('call to action');
    const wantAnimation =
      q.includes('animation') ||
      q.includes('motion') ||
      q.includes('transition');
    const wantIcons =
      q.includes('icon') ||
      q.includes('icons');
    const wantLayout =
      q.includes('layout') ||
      q.includes('grid') ||
      q.includes('section') ||
      q.includes('template') ||
      q.includes('cta');

    const categoriesMap = {
      ui_styles: true,
      color_palettes: wantColors || true,
      font_pairings: wantFonts || true,
      products: wantProduct || true,
      chart_types: wantCharts,
      button_styles: wantButtons || true,
      cta_components: true,
      tech_stacks: wantTech || true,
      animations: wantAnimation,
      icon_styles: wantIcons,
      layout_templates: wantLayout || true
    };

    const output = {};

    // 1) Dùng BM25 cho hầu hết category
    for (const [cat, enabled] of Object.entries(categoriesMap)) {
      if (!enabled) continue;

      // Tech stacks sẽ xử lý đặc biệt phía dưới
      if (cat === 'tech_stacks') continue;

      const docs = this.search(query, [cat], 3);

      if (!docs.length && this.rawData[cat] && this.rawData[cat].length) {
        output[cat] = this.rawData[cat].slice(0, 3);
      } else {
        output[cat] = docs.map((d) => d.data);
      }
    }

    // 2) Xử lý riêng cho tech_stacks
    const wantsReact = q.includes('react') || q.includes('reactjs');
    const allStacks = this.rawData.tech_stacks || [];

    if (allStacks.length) {
      let stacks = [...allStacks];

      if (wantsReact) {
        // Ưu tiên React / Next.js
        stacks.sort((a, b) => {
          const techA = (a.technologies || '').toLowerCase();
          const techB = (b.technologies || '').toLowerCase();

          const aHasReact = techA.includes('react');
          const bHasReact = techB.includes('react');
          const aHasNext =
            techA.includes('next.js') ||
            techA.includes('nextjs') ||
            techA.includes('next.js + react') ||
            techA.includes('next.js + react + tailwind');
          const bHasNext =
            techB.includes('next.js') ||
            techB.includes('nextjs') ||
            techB.includes('next.js + react') ||
            techB.includes('next.js + react + tailwind');

          // Score: React + Next > React > Next > others
          const scoreA = (aHasReact ? 2 : 0) + (aHasNext ? 1 : 0);
          const scoreB = (bHasReact ? 2 : 0) + (bHasNext ? 1 : 0);

          return scoreB - scoreA;
        });
      } else {
        // Nếu không yêu cầu React cụ thể, có thể dùng BM25 hoặc logic khác
        const docs = this.search(query, ['tech_stacks'], 3);
        if (docs.length) {
          stacks = docs.map((d) => d.data);
        }
      }

      output.tech_stacks = stacks.slice(0, 3);
    } else {
      output.tech_stacks = [];
    }

    return output;
  }
}

// Helper để dùng từ code khác (Claude/Cursor import)
export function createUIUXKnowledgeBase(dataDir = DATA_DIR) {
  const kb = new UIUXKnowledgeBase(dataDir);
  kb.loadAll();
  return kb;
}

// Hàm tiện cho Claude/Cursor: trả về UI Kit đã gom sẵn
export function generateUiKit(query, kb = null, dataDir = DATA_DIR) {
  const knowledgeBase = kb || createUIUXKnowledgeBase(dataDir);
  const recs = knowledgeBase.smartRecommendation(query);

  const uiStyle   = recs.ui_styles?.[0] || null;
  const palette   = recs.color_palettes?.[0] || null;
  const product   = recs.products?.[0] || null;
  const fonts     = recs.font_pairings?.[0] || null;
  const buttons   = recs.button_styles || [];
  const ctas      = recs.cta_components || [];
  const layout    = recs.layout_templates?.[0] || null;
  const techStack = recs.tech_stacks?.[0] || null;
  const charts    = recs.chart_types || [];
  const animations = recs.animations || [];
  const icons      = recs.icon_styles || [];

  return {
    query,
    product,
    ui_style: uiStyle,
    color_palette: palette,
    font_pairing: fonts,
    layout_template: layout,
    buttons,
    ctas,
    charts,
    animations,
    icons,
    tech_stack: techStack
  };
}

// =================== CLI / ENTRYPOINT =================== //

function printSection(title, items, mainKeys) {
  if (!items || items.length === 0) return;
  console.log(`[${title}]`);
  items.forEach((item, idx) => {
    const summary = mainKeys
      .filter((k) => k in item)
      .map((k) => `${k}: ${item[k]}`)
      .join(' | ');
    console.log(`  ${idx + 1}. ${summary}`);
  });
  console.log();
}

// Nếu chạy trực tiếp: node uiux-skill.js "query"
if (process.argv[1] === new URL(import.meta.url).pathname) {
  const query = process.argv.slice(2).join(' ');
  if (!query) {
    console.log('Usage: node uiux-skill.js "your query here"');
    process.exit(0);
  }

  const kb = createUIUXKnowledgeBase(DATA_DIR);
  const recs = kb.smartRecommendation(query);

  console.log('\n=== UI/UX PRO KIT RECOMMENDATION ===');
  console.log(`Query: ${query}\n`);

  // Tùy vào schema thực tế của CSV, bạn có thể chỉnh lại các key ở đây nếu cần
  printSection('UI Styles', recs.ui_styles, ['style_name', 'description']);
  printSection('Color Palettes', recs.color_palettes, ['palette_name', 'mood']);
  printSection(
    'Products',
    recs.products,
    ['product_name', 'category', 'target_audience', 'typical_style']
  );
  printSection(
    'Font Pairings',
    recs.font_pairings,
    ['pairing_name', 'heading_font', 'body_font']
  );
  printSection('Chart Types', recs.chart_types, ['chart_type', 'best_for']);
  printSection('Button Styles', recs.button_styles, ['name', 'description']);
  printSection('CTA Components', recs.cta_components, ['cta_name', 'cta_type', 'description']);
  // 👉 Tech stack: dùng đúng schema file bạn gửi
  printSection('Tech Stacks', recs.tech_stacks, ['stack_name', 'technologies', 'best_for']);
  printSection('Animations', recs.animations, ['name', 'type', 'description']);
  printSection('Icon Styles', recs.icon_styles, ['name', 'style', 'description']);
  printSection('Layout Templates', recs.layout_templates, ['name', 'description']);
}
