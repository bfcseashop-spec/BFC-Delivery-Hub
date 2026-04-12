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
- **Auth**: express-session + connect-pg-simple + bcrypt

## Artifacts

- **bfc-delivery** (`/`): Main React frontend
- **api-server** (`/api`): Express 5 backend REST API

## Frontend Pages

### Customer
- `/` — Homepage with featured restaurants and categories
- `/restaurants` — Browse all restaurants with search/filter
- `/restaurant/:id` — Restaurant detail with menu and cart
- `/checkout` — Order checkout with customer details
- `/order/:id` — Order status tracking
- `/my-orders` — Customer order history (requires login)
- `/login` — Sign in page
- `/signup` — Sign up page

### Admin Panel (admin role only)
- `/admin` — Dashboard with stats overview
- `/admin/orders` — All orders management with status updates
- `/admin/restaurants` — Restaurant CRUD management
- `/admin/menu-items` — Menu item CRUD management

## Default Accounts

- **Admin**: admin@bfc.com / admin123
- **Customer**: customer@bfc.com / customer123

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally
- `pnpm --filter @workspace/scripts run seed` — seed restaurants and menu items

## Database Schema

- **users** — platform users with role (customer/admin), email, bcrypt password
- **session** — express-session storage table
- **categories** — food categories (Khmer Food, Fast Food, Noodles, Seafood, etc.)
- **restaurants** — shop listings with ratings, delivery times, minimum orders
- **menu_items** — menu items per restaurant with prices, categories, availability
- **orders** — customer orders with JSONB items array, status tracking

## API Routes

### Auth
- `POST /api/auth/signup` — register
- `POST /api/auth/login` — login
- `POST /api/auth/logout` — logout
- `GET /api/auth/me` — current user

### Public
- `GET /api/categories`
- `GET /api/restaurants` — filter by categoryId, search, limit
- `GET /api/restaurants/featured`
- `GET /api/restaurants/:id`
- `GET /api/restaurants/:id/menu`
- `GET /api/stats/overview`
- `POST /api/orders`
- `GET /api/orders`
- `GET /api/orders/:id`

### Admin (requires admin role)
- `GET /api/admin/orders` — filter by status
- `PATCH /api/admin/orders/:id/status`
- `POST /api/admin/restaurants`
- `PATCH /api/admin/restaurants/:id`
- `DELETE /api/admin/restaurants/:id`
- `POST /api/admin/menu-items`
- `PATCH /api/admin/menu-items/:id`
- `DELETE /api/admin/menu-items/:id`
- `GET /api/admin/stats`
