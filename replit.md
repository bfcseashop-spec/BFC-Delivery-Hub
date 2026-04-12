# Workspace

## Overview

pnpm workspace monorepo using TypeScript. This project is **BFC Fast Delivery** — a Foodpanda-style food delivery platform for Cambodia with free delivery and 24-hour service.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite + Tailwind CSS v4 + shadcn/ui

## Artifacts

- **bfc-delivery** (`/`): Main React frontend — homepage, restaurant browse, restaurant detail, checkout, order tracking
- **api-server** (`/api`): Express 5 backend REST API

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally
- `pnpm --filter @workspace/scripts run seed` — seed the database

## Database Schema

- **categories** — food categories (Khmer Food, Fast Food, Noodles, Seafood, Desserts, Drinks, BBQ, Vegetarian)
- **restaurants** — shop listings with ratings, delivery times, minimum orders
- **menu_items** — menu items per restaurant with prices, categories, availability
- **orders** — customer orders with JSONB items array, status tracking

## API Routes

- `GET /api/categories` — list all categories
- `GET /api/restaurants` — list restaurants (filter by categoryId, search, limit)
- `GET /api/restaurants/featured` — featured restaurants for homepage
- `GET /api/restaurants/:id` — single restaurant
- `GET /api/restaurants/:id/menu` — menu grouped by category
- `POST /api/orders` — place order
- `GET /api/orders` — list orders
- `GET /api/orders/:id` — get order
- `GET /api/stats/overview` — platform stats

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
