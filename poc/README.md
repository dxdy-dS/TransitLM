# TransitLM Interactive Dashboard (Proof of Concept)

An interactive Next.js 16 dashboard for visualizing TransitLM benchmark evaluation results.

## Features

- **Hero Section**: Project overview with links to paper, datasets, and license info
- **Architecture Overview**: Four benchmark scenarios as interactive cards
- **Funnel Visualization**: SVG-based funnel showing the 4-round evaluation pipeline
- **Benchmark Dashboard**: Tabbed results with recharts bar/pie charts
- **Route Visualization**: Sample transit route with station timeline
- **Technical Details**: CSV input contract, thresholds, scoring formula

## Tech Stack

- Next.js 16 + TypeScript 5
- Tailwind CSS 4 + shadcn/ui
- Framer Motion for animations
- Recharts for data visualization
- Dark theme with emerald/teal/cyan palette

## Run Locally

```bash
cd poc
npm install
npm run dev
```

Open http://localhost:3000 to view the dashboard.

## API Route

POST `/api/evaluate` — Run Python evaluation scripts and return results.

```json
{ "benchmark": 1, "inputField": "generate_results" }
```
