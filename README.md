# 🔍 Website Structure Analyzer

A powerful browser-based tool for analyzing website SEO structure. Analyze individual pages or compare multiple competitor sites to discover patterns and get actionable recommendations.

## ✨ Features

### Single Page Analysis
- **URL Analysis** — Enter any URL to fetch and analyze its structure
- **HTML Analysis** — Paste raw HTML source code directly (more reliable)
- **Meta Tag Scoring** — Get effectiveness scores for title and description length
- **Header Hierarchy** — Visualize H1–H4 structure with indentation and color coding
- **Per-Element Scoring** — Each header scored for optimal length

### Niche / Competitor Analysis
- **Multi-Site Comparison** — Analyze 2–10 competitor websites at once
- **Mixed Input Modes** — Use URLs and raw HTML inputs in the same analysis
- **Common Keyword Detection** — Find frequently used keywords across competitors
- **Structural Similarity Scoring** — See how consistent competitors' page structures are
- **Smart Recommendations** — Get data-driven suggestions for meta tags and header structure

### Website Structure Generator
- **One-Click Generation** — Generate a recommended website structure from niche analysis data
- **Hierarchical Output** — H1 → H2 → H3 → H4 with parent-child relationships
- **Keyword-Driven Suggestions** — H2 suggestions based on top competitor keywords
- **Copy & Export** — Copy individual sections or the entire structure to clipboard

### Export Options
- **Copy to Clipboard** — Copy any section or full analysis
- **Download Reports** — Export as TXT or JSON
- **Text Reports** — Clean, formatted text reports for sharing

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- npm, yarn, or pnpm

### Installation

```bash
# Clone the repo
git clone https://github.com/Alex-Denz/Website_Analyzer.git
cd Website_Analyzer

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
npm run preview  # Preview the production build locally
```

The built files will be in the `dist/` directory.

## 🛠️ Tech Stack

- **React 18** — UI framework
- **TypeScript** — Type safety
- **Vite** — Build tool and dev server
- **Tailwind CSS** — Styling
- **Lucide React** — Icons

## 📖 How to Use

### Analyzing a Single Page

1. Go to the **Analyze URL** tab
2. Enter a website URL (e.g., `https://example.com`)
3. Click **Analyze Website**
4. View your results with effectiveness scores

> **Tip:** If URL analysis fails due to CORS restrictions, switch to the **Analyze HTML** tab. Visit the site in your browser, right-click → "View Page Source" (Ctrl+U), copy the HTML, and paste it there.

### Niche Analysis

1. Go to the **Niche Analysis** tab
2. Add 2–10 competitor URLs (or paste their HTML)
3. Click **Analyze Niche**
4. Review the comparison results and recommendations
5. Click **Generate Website Structure** for a suggested page layout
6. Download reports as TXT or JSON

## 📁 Project Structure

```
src/
├── components/
│   ├── ErrorMessage.tsx      # Reusable error display
│   ├── NicheAnalysis.tsx     # Multi-site niche analysis
│   ├── SingleAnalysis.tsx    # Single URL/HTML analysis
│   ├── StatusIcon.tsx        # Score status indicators
│   ├── StructureModal.tsx    # Website structure generator modal
│   └── TabNavigation.tsx     # Tab switching component
├── types/
│   └── index.ts              # TypeScript interfaces
├── utils/
│   ├── clipboard.ts          # Copy/download utilities
│   ├── fetcher.ts            # CORS proxy URL fetching
│   ├── niche.ts              # Niche analysis logic
│   ├── parser.ts             # HTML parsing (DOMParser)
│   └── scoring.ts            # Effectiveness scoring functions
├── App.tsx                   # Root component
├── index.css                 # Global styles + Tailwind
├── main.tsx                  # Entry point
└── vite-env.d.ts             # Vite type declarations
```

## ⚠️ CORS Limitations

This tool runs entirely in the browser. Some websites block cross-origin requests, which prevents URL-based analysis. The tool tries multiple CORS proxies automatically, but if all fail:

1. Use the **HTML tab** instead — it's actually more reliable
2. Visit the target site → View Source → Copy → Paste

## 📄 License

MIT

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
