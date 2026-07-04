# 🍔 QuickBite — Fast, Fresh, Delivered

> **Modern Food Ordering & Live Logistics Tracking Platform** — Elevating the campus culinary delivery experience.

![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)
![Vite](https://img.shields.io/badge/Vite-Fast--Build-646CFF?style=for-the-badge&logo=vite)
![Supabase](https://img.shields.io/badge/Supabase-Database-231F20?style=for-the-badge&logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss)
![Vercel](https://img.shields.io/badge/Vercel-Production--Live-000000?style=for-the-badge&logo=vercel)

---
## 📌 Overview
QuickBite provides an intuitive UI/UX for users to seamlessly browse menus, manage their carts, and track deliveries dynamically. The project bridges the gap between client-side user experience and cloud-hosted data pipelines by managing user authentication, secure relational data mapping, and real-time status flows under professional development constraints.
---

## ✨ Features
* **User Authentication & Session Management:** Secure sign-up and sign-in operations with persistent state tracking across browser reloads.
* **Reactive Cart Management:** A unified global state pattern that handles instant cart additions, removals, and subtotal re-calculations.
* **Live Order Tracking Simulation:** A dynamic multi-stage tracking dashboard that updates a step-by-step interactive timeline mirroring logistical courier milestones.
* **Dynamic Menu & Filtering:** Responsive interfaces allowing users to instantly filter, query, and search items across separate catalog categories.

---
## 📂 Project Structure

The software system implements a decoupled, modern frontend architectural design. It strictly enforces the principle of **Separation of Concerns (SoC)** by modularizing presentation layouts, global routing frameworks, asynchronous state data boundaries, type-safety parameters, and configuration management properties into highly isolated, independent structures:

```text
food-ordering-app/
├── src/                          # System Execution Root (Main Application Source)
│   ├── components/               # Presentation Layer (Modular Component Architecture)
│   │   ├── ui/                   # Shared Atomic Sub-layer (Design System Core Primitives)
│   │   │   ├── button.tsx        # Polymorphic, accessible control buttons handling native click parameters
│   │   │   ├── dialog.tsx        # Radix-driven programmatic structural overlays and context panels
│   │   │   └── input.tsx         # Encapsulated state management inputs managing inline validations
│   │   ├── Cart.tsx              # Transaction control panel coordinating item states & cache updates
│   │   ├── Navbar.tsx            # Global system navigation controller monitoring user identity tokens
│   │   └── ProtectedRoute.tsx    # Higher-Order Component (HOC) guarding state authorization pathways
│   ├── integrations/             # Gateway Communications (Network & External Infrastructure)
│   │   └── supabase/             # Core Cloud Database Integration Sub-system
│   │       ├── client.ts         # Centralized BaaS connection manager hosting operational credentials
│   │       └── types.ts          # Strongly-typed database entity models derived from live schemas
│   ├── pages/                    # High-Level Structural Assemblers (Contextual Views)
│   │   ├── Index.tsx             # Interactive store UI parsing queries, pagination, and sorting
│   │   ├── Auth.tsx              # Identity portal handling registration and login pipeline selections
│   │   └── Tracking.tsx          # Logistics dashboard managing asynchronous milestone timelines
│   ├── routes/                   # Routing Configurations & Declarative Mappings
│   │   └── index.tsx             # System-wide URL coordinate mappings via React Router engine
│   ├── App.tsx                   # Structural Context Root (Bootstraps global providers & query pools)
│   └── main.tsx                  # Strict Virtual DOM initialization target and execution point
├── public/                       # Immutable Assets (Served raw to client runtime root)
│   └── icons/                    # Scalable Vector Graphics (SVG) branding signatures and layout visuals
├── package.json                  # System Manifest defining project binaries, versions, and automation scripts
├── tsconfig.json                 # Hardened parameters restricting TypeScript engine runtime loose evaluations
└── README.md                     # Engineering blueprint, system documentation, and architecture indexes
```
## 🗄️ Database Schema

The persistence layer of the application is powered by a cloud-hosted relational database instance deployed on **Supabase (PostgreSQL Cloud Instance)**. The schema is normalized and designed with explicit data constraints, foreign key relationships, and automated cascade lifecycles to guarantee absolute structural integrity.

### 📊 Relational Entity Mappings

```text
  [auth.users] (Supabase Auth Core)
       │
       ▼ (1:1 Relationship via user_id)
  [public.profiles] (User Metadata)
       │
       ▼ (1:N Relationship via user_id)
  [public.orders] (Transaction Header)
       │
       ▼ (1:N Relationship via order_id)
  [public.order_items] (Transaction Line Items)
       ▲
       │ (N:1 Relationship via product_id)
  [public.products] (Inventory/Catalog Core)
```
## 🎯 API Endpoints (Data Transactions)

The application communicates with the Supabase cloud infrastructure through an optimized set of transactional data queries. The table below outlines how client-side actions map to backend database endpoints and authentication channels:

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **POST** | `/auth/v1/signup` | Registers a new client profile and initiates a private identity record. |
| **POST** | `/auth/v1/token?grant_type=password` | Validates credentials, issues JWT access tokens, and builds session states. |
| **POST** | `/auth/v1/logout` | Terminates active authorization tokens and clears the local session memory. |
| **GET** | `/rest/v1/products` | Fetches the complete menu catalog, supporting dynamic client-side filtering. |
| **GET** | `/rest/v1/products?category=eq.id` | Queries specific food groups (e.g., Burgers, Pizzas, Drinks, Desserts). |
| **POST** | `/rest/v1/orders` | Creates a new parent transaction header, committing checkout subtotals. |
| **GET** | `/rest/v1/orders?user_id=eq.id` | Retrieves the historical order log related entirely to the active customer. |
| **PATCH** | `/rest/v1/orders?id=eq.id` | Mutates logistical progress metrics through multi-stage delivery timelines. |
| **POST** | `/rest/v1/order_items` | Commits individual item breakdowns, quantities, and line costs to the invoice. |
| **GET** | `/rest/v1/profiles?user_id=eq.id` | Pulls custom user metadata including contact names and delivery addresses. |

🛡️ Security Features

1.Row Level Security (RLS): Strict PostgreSQL server-side access constraints are active on all tables, explicitly ensuring that independent user records remain invisible to unauthorized concurrent connections.

2.Persistent Session Token Security: Authentication keys are cryptographically validated using persistent JWT setups managed safely through localStorage with integrated automated token token refresh parameters.

3.Double Opt-In Bypass: To optimize the external examiner valuation workflow, active double email validation checkpoints are intentionally deactivated via cloud admin control channels to facilitate continuous login testing.
