# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Tauri v2 desktop application with a React frontend using TypeScript, Vite, and TailwindCSS. The app features a
stock market data visualization using D3.js and integrates with the TwelveData API for real-time stock quotes and time
/series data.

## Development Commands

### Frontend Development

- `pnpm dev` - Start Vite dev server (port 1420)
- `pnpm build` - Build frontend (runs TypeScript compiler + Vite build)
- `pnpm preview` - Preview production build

### Tauri Commands

- `pnpm tauri dev` - Run Tauri app in development mode (starts both Vite and Rust backend)
- `pnpm tauri build` - Build production Tauri application
- `pnpm tauri` - Access Tauri CLI directly

### Package Manager

This project uses **pnpm** (version 10.18.1+). Do not use npm or yarn.

## Architecture

### Frontend Structure

**Routing**: React Router v7 with a Layout/Outlet pattern

- Routes defined in `src/main.tsx`
- Persistent sidebar navigation via `src/components/Layout.tsx`
- Main routes: Home (`/`), About (`/about`), Stocks (`/stocks`), Stock Chart (`/stock-chart`)

**State Management**:

- **SWR** for data fetching and caching (stock quotes and time series)
- **Zustand** for global state (installed but usage patterns TBD)
- Custom hooks in `src/hooks/`:
    - `useStockQuote.ts` - Fetch real-time stock quotes with auto-refresh
    - `useStockTimeSeries.ts` - Fetch historical stock data

**Data Flow**:

1. React components use custom hooks (e.g., `useStockQuote`)
2. Hooks leverage SWR for caching/revalidation
3. API calls go to TwelveData REST API
4. Responses validated with Zod schemas in `src/types/stock.ts`
5. Data transformed to internal types before use

**D3.js Integration** (`src/components/StockLineChart.tsx`):

- D3 chart renders in `useEffect` hook with ref-based SVG manipulation
- Chart features: line graph, area fill, interactive crosshair, tooltip on hover
- Direct DOM manipulation via D3 selections (not React-controlled)
- Cleanup of D3 selections on unmount to prevent memory leaks

### Backend Structure (Rust)

- Entry point: `src-tauri/src/lib.rs`
- Tauri commands defined with `#[tauri::command]` macro
- Currently implements single `greet` command as template
- Commands registered in `invoke_handler` via `tauri::generate_handler![]`

### Type Safety

**Zod Schemas** (`src/types/stock.ts`):

- Define schemas for external API responses (TwelveData, Alpha Vantage)
- Runtime validation of API data
- Transform functions convert API responses to internal TypeScript types
- Pattern: Define schema → Parse response → Transform to internal type
- Separate schemas for different APIs ensure proper validation and type safety

## API Configuration

**TwelveData API** (Stock Quotes & Time Series):

- Requires API key in `.env` file: `VITE_TWELVE_DATA_API_KEY`
- Example file: `.env.example`
- Free tier available at https://twelvedata.com/pricing
- API key accessed via `import.meta.env.VITE_TWELVE_DATA_API_KEY`
- Used for: Real-time stock quotes, historical time series data, candlestick charts

**Alpha Vantage API** (Market Movers):

- Requires API key in `.env` file: `VITE_ALPHA_VANTAGE_API_KEY`
- Example file: `.env.example`
- Free tier: 25 API requests per day
- Get free API key at https://www.alphavantage.co/support/#api-key
- API key accessed via `import.meta.env.VITE_ALPHA_VANTAGE_API_KEY`
- Used for: Top gainers/losers (market movers heatmap)
- Endpoint: `TOP_GAINERS_LOSERS` returns top 20 gainers and losers

## Tauri-Specific Patterns

**Invoking Rust Commands from React**:

```typescript
import {invoke} from "@tauri-apps/api/core";

const result = await invoke("command_name", {param: value});
```

**Adding New Tauri Commands**:

1. Define function with `#[tauri::command]` in `src-tauri/src/lib.rs`
2. Add to `invoke_handler` via `generate_handler![existing_commands, new_command]`
3. Call from frontend using `invoke("new_command", {})`

## Styling

- **TailwindCSS v4** with PostCSS
- Utility-first approach
- Custom configuration in `tailwind.config.js`

## TypeScript Configuration

- Strict mode enabled
- React 19 types
- D3 types included (`@types/d3`)
- Separate configs: `tsconfig.json` (app), `tsconfig.node.json` (build tools)


