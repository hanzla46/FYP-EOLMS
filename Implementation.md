# EOLMS — Implementation Tracker

**Project:** Enterprise Online Livestock Management System  
**Last Updated:** 2026-06-16  
**Current Phase:** Phase 2 — Authentication & RBAC ✅ Complete  
**Current Iteration:** Iteration 2 (Auth & RBAC)

---

## Current Sprint

| Field            | Value                                                    |
| ---------------- | -------------------------------------------------------- |
| **Active Phase** | Phase 3 — Module 1: Animal Identification & Registration |
| **Status**       | 🟢 Ready to start                                       |
| **Started**      | —                                                        |
| **Next Actions** | 1. Create `animalController.js` with CRUD + lineage logic |
|                  | 2. Create `routes/animals.js` with all endpoints          |
|                  | 3. Build animal registration form (Frontend)              |
|                  | 4. Build animal list page with search/filter/pagination   |
|                  | 5. Build animal detail/profile page + QR code display     |

> **Update this section at the start of every iteration.** Move completed actions out, add the next set.

---

## 1. Project Overview

3-tier web application for single-farm livestock lifecycle management: animal registration through veterinary care,
breeding, production tracking, inventory, financials, and automated alerts.

### Tech Stack

| Layer           | Technology                                                      |
| --------------- | --------------------------------------------------------------- |
| Frontend        | React (Vite) + TailwindCSS                                      |
| Backend         | Node.js + Express                                               |
| ORM / DB        | Sequelize (raw SQL only) + MySQL 8.0 InnoDB (via XAMPP MariaDB) |
| Auth            | JWT (JSON Web Token)                                            |
| Background Jobs | node-cron (in-process)                                          |
| File Uploads    | Multer (local disk)                                             |
| RFID            | Simulated (manual + QR fallback)                                |

### Key Decisions

- **Single farm** — no multi-tenant schema
- **Raw SQL only** — Sequelize for connection pooling; all queries via `sequelize.query()`
- **node-cron in-process** — daily notification scan inside Express
- **Local dev only** — no Docker/cloud
- **Full document uploads** — animal photos + medical/lab attachments
- **Realistic seed data** — ~100 animals, full operational history
- **Manual testing** — Postman/browser verification

---

## 2. Phase Overview

| #   | Phase                                             | Status     | Dependencies |
| --- | ------------------------------------------------- | ---------- | ------------ |
| 1   | Project Scaffolding & Database                    | ✅ Complete | —            |
| 2   | Authentication & RBAC                             | ✅ Complete | Phase 1      |
| 3   | Module 1 — Animal Identification & Registration   | ⬜ Pending | Phase 2      |
| 4   | Module 5 — Inventory & Asset Supply               | ⬜ Pending | Phase 2      |
| 5   | Module 2 — Health & Veterinary Surveillance       | ⬜ Pending | Phases 3, 4  |
| 6   | Module 3 — Breeding & Reproduction Lifecycle      | ⬜ Pending | Phase 3      |
| 7   | Module 4 — Production Yield Analytics             | ⬜ Pending | Phase 3      |
| 8   | Module 6 — Financial Ledger & Expense Mapping     | ⬜ Pending | Phase 3      |
| 9   | Module 7 — Automated Notification & Alerts Engine | ⬜ Pending | All modules  |
| 10  | File Upload Support                               | ⬜ Pending | Phases 3, 5  |
| 11  | Seed Data & Final Integration                     | ⬜ Pending | All modules  |

**Status Legend:** ⬜ Pending | 🔄 In Progress | ✅ Complete | ⏸️ Blocked

---

## 3. Detailed Phase Breakdown

### Phase 1 — Project Scaffolding & Database ✅ Complete

**Backend scaffolding:**

- [x] `npm init` + install dependencies (express, sequelize, mysql2, jsonwebtoken, bcryptjs, cors, dotenv, multer,
       node-cron, uuid, qrcode)
- [x] Folder structure: `controllers/`, `routes/`, `middleware/`, `config/`, `uploads/`, `services/`, `scripts/`
- [x] `config/database.js` — Sequelize instance with connection pool
- [x] `.env` — DB credentials, JWT secret, port
- [x] `server.js` — Express entry point with basic middleware stack

**Frontend scaffolding:**

- [x] Node.js >= 20.19 required (Vite minimum) — verified v24.12.0
- [x] `npm create vite@latest Frontend -- --template react` — scaffold Vite + React project
- [x] `cd Frontend && npm install`
- [x] `npm install tailwindcss @tailwindcss/vite` — Tailwind v4 Vite plugin
- [x] `npm install axios react-router-dom react-chartjs-2 chart.js react-qr-code` — app dependencies
- [x] Configure `vite.config.js` — add `import tailwindcss from '@tailwindcss/vite'` and `tailwindcss()` to plugins
- [x] Add `@import "tailwindcss";` to `src/index.css`
- [x] Folder structure: `components/`, `pages/`, `services/`, `context/`
- [x] Axios instance (`services/api.js`) with backend base URL + JWT interceptor

**Database initialization:**

- [x] Execute updated schema SQL (9 tables: users, animals, health_records, breeding_records, production_logs,
       inventory, financial_ledger, system_alerts, attachments)
- [x] Add `species` ENUM('Cattle','Sheep','Goat') column to `animals`
- [x] Create `system_alerts` table
- [x] Create `attachments` table
- [x] Add `profile_photo_path` column to `animals`
- [x] Verify all foreign keys, indexes, and InnoDB engine

---

### Phase 2 — Authentication & RBAC ✅ Complete

**API Endpoints:**

- [x] `POST /api/v1/auth/register` — Admin-only user creation
- [x] `POST /api/v1/auth/login` — returns JWT with user_id + role
- [x] `GET /api/v1/auth/me` — current user profile

**Middleware:**

- [x] `middleware/auth.js` — JWT verification (extract Bearer token, verify, attach req.user)
- [x] `middleware/authorize.js` — role-check factory (`authorize('Admin','Vet')`)

**Seed:**

- [x] 1 Admin, 2 Vets, 3 Workers

---

### Phase 3 — Module 1: Animal Identification & Registration

**API Endpoints:**

- [ ] `POST /api/v1/animals` — Register animal (RFID validation, auto-gen LIV-YY-XXXXX fallback, lineage validation)
- [ ] `GET /api/v1/animals` — List/search with pagination, filters (status, breed, gender)
- [ ] `GET /api/v1/animals/:id` — Single profile with lineage, health summary, production stats
- [ ] `PUT /api/v1/animals/:id` — Update animal details
- [ ] `PATCH /api/v1/animals/:id/status` — Status transitions

**Business Logic:**

- [ ] RFID duplicate check (pre-flight query)
- [ ] Auto-generate `LIV-YY-XXXXX` when no tag provided
- [ ] Lineage integrity: dam_id must be Female, sire_id must be Male, both must exist
- [ ] Status transition rules

**Frontend Pages:**

- [ ] Animal registration form (RFID/manual toggle)
- [ ] Animal list with search/filter/pagination
- [ ] Animal detail/profile page
- [ ] QR code display per animal (alphanumeric code rendered as QR)

---

### Phase 4 — Module 5: Inventory & Asset Supply

**API Endpoints:**

- [ ] `POST /api/v1/inventory` — Add item
- [ ] `GET /api/v1/inventory` — List all items with stock levels
- [ ] `GET /api/v1/inventory/:id` — Single item detail
- [ ] `PUT /api/v1/inventory/:id` — Update item
- [ ] `PATCH /api/v1/inventory/:id/stock` — Manual stock adjustment with audit note

**Business Logic:**

- [ ] Reorder threshold check on every deduction → create alert if below threshold
- [ ] Stock validation before any dispensing operation

**Frontend Pages:**

- [ ] Inventory dashboard with low-stock badges
- [ ] Add/restock form
- [ ] Item detail with usage history

---

### Phase 5 — Module 2: Health & Veterinary Surveillance

**API Endpoints:**

- [ ] `POST /api/v1/health-records` — Create clinical record (atomic transaction: insert record + deduct inventory)
- [ ] `GET /api/v1/health-records` — List with filters (animal, vet, date range)
- [ ] `GET /api/v1/health-records/:id` — Single record
- [ ] `GET /api/v1/animals/:id/health-history` — Full medical timeline
- [ ] `POST /api/v1/vaccination-schedules` — Create vaccination template
- [ ] `GET /api/v1/vaccination-schedules` — List schedules

**Business Logic:**

- [ ] Atomic medication deduction (SRS snippet adaptation)
- [ ] Withdrawal period → flag animal as Quarantined
- [ ] Block production logging for quarantined animals
- [ ] Vaccination schedule broadcast to notification engine

**Frontend Pages:**

- [ ] Clinical entry form (mobile-first, large tap targets)
- [ ] Medication deduction UI with live stock check
- [ ] Health history timeline view
- [ ] Vaccination schedule configuration

---

### Phase 6 — Module 3: Breeding & Reproduction Lifecycle

**API Endpoints:**

- [ ] `POST /api/v1/breeding-records` — Log insemination
- [ ] `GET /api/v1/breeding-records` — List with filters
- [ ] `PATCH /api/v1/breeding-records/:id/pregnancy-check` — Update status
- [ ] `GET /api/v1/animals/:id/breeding-history` — Reproductive timeline

**Business Logic:**

- [ ] Block insemination if dam has active pregnancy
- [ ] Auto-compute `estimated_calving_date` on pregnancy confirmation
- [ ] Species gestation constants: Cattle = 283 days, Sheep = 150 days
- [ ] Sire identity can be external (VARCHAR, not FK)

**Frontend Pages:**

- [ ] Breeding calendar
- [ ] Insemination log form
- [ ] Pregnancy check UI
- [ ] Expected calving dashboard

---

### Phase 7 — Module 4: Production Yield Analytics

**API Endpoints:**

- [ ] `POST /api/v1/production-logs` — Log milk/weight
- [ ] `GET /api/v1/production-logs` — List with filters
- [ ] `GET /api/v1/animals/:id/production-stats` — Per-animal trends
- [ ] `GET /api/v1/production/dashboard` — Aggregate stats

**Business Logic:**

- [ ] Reject negative values (frontend + backend)
- [ ] Block quarantined animals from production logging
- [ ] Trailing 3-day average calculation
- [ ] ≥20% drop anomaly detection → create alert

**Frontend Pages:**

- [ ] Production entry forms (mobile-first)
- [ ] Yield dashboards with charts
- [ ] Anomaly alert cards

---

### Phase 8 — Module 6: Financial Ledger & Expense Mapping

**API Endpoints:**

- [ ] `POST /api/v1/finance/transactions` — Record transaction
- [ ] `GET /api/v1/finance/transactions` — List with filters
- [ ] `GET /api/v1/finance/summary` — Aggregated P&L
- [ ] `GET /api/v1/animals/:id/financials` — Cost-per-head

**Business Logic:**

- [ ] PKR currency enforcement on all monetary displays
- [ ] Net cost-per-head = sum(expenses) - sum(revenue) per animal
- [ ] RBAC: only Admin accesses financial endpoints

**Frontend Pages:**

- [ ] Financial dashboard (Admin-only)
- [ ] Transaction entry form
- [ ] Cost-per-head report
- [ ] P&L summary with charts

---

### Phase 9 — Module 7: Automated Notification & Alerts Engine

**Database:**

- [ ] `system_alerts` table (alert_id, alert_type, severity, message, reference_entity_type, reference_entity_id,
      is_read, created_at)

**Service:**

- [ ] `services/alertService.js` — centralized alert creation
- [ ] `services/notificationCron.js` — node-cron daily job (06:00)

**Cron Checks:**

- [ ] Vaccinations due within 7 days
- [ ] Calving dates within 14 days
- [ ] Withdrawal periods ending today → clear quarantine
- [ ] Low-stock items

**API Endpoints:**

- [ ] `GET /api/v1/alerts` — List with filters
- [ ] `PATCH /api/v1/alerts/:id/read` — Mark read
- [ ] `GET /api/v1/alerts/unread-count` — Badge counter

**Frontend:**

- [ ] Notification center (bell icon + badge)
- [ ] Alerts list page
- [ ] Dashboard alert cards

---

### Phase 10 — File Upload Support

**Middleware:**

- [ ] Multer config (local `uploads/`, whitelist jpg/png/webp/pdf, size limits 5MB/10MB)

**API Endpoints:**

- [ ] `POST /api/v1/uploads/animal/:id/photo` — Animal profile photo
- [ ] `POST /api/v1/uploads/health-record/:id/document` — Health record attachment
- [ ] `GET /api/v1/uploads/:filename` — Serve file

**Frontend:**

- [ ] File upload component with preview
- [ ] Document list in health records
- [ ] Profile photo display

---

### Phase 11 — Seed Data & Final Integration

- [ ] `scripts/seed.js` — generate realistic mock data
- [ ] Walk through all 4 SRS verification test cases
- [ ] Full end-to-end manual workflow test
- [ ] Final frontend polish (responsive QA, loading states, error handling)

---

## 4. Database Schema

### SRS Core Tables (from specification)

| Table              | Status         |
| ------------------ | -------------- |
| `users`            | ✅ Created |
| `animals`          | ✅ Created | Includes `species` ENUM('Cattle','Sheep','Goat') — added per Q1 |
| `health_records`   | ✅ Created |
| `breeding_records` | ✅ Created |
| `production_logs`  | ✅ Created |
| `inventory`        | ✅ Created |
| `financial_ledger` | ✅ Created |

### Additional Tables (project needs)

| Table           | Status         | Purpose                           |
| --------------- | -------------- | --------------------------------- |
| `system_alerts` | ✅ Created | Notification engine alert storage |
| `attachments`   | ✅ Created | File upload metadata              |

---

## 5. API Route Map

```
/api/v1/
├── auth/
│   ├── POST   /register
│   ├── POST   /login
│   └── GET    /me
├── animals/
│   ├── POST   /                          — Register
│   ├── GET    /                          — List/Search
│   ├── GET    /:id                       — Profile
│   ├── PUT    /:id                       — Update
│   ├── PATCH  /:id/status                — Status transition
│   ├── GET    /:id/health-history        — Medical timeline
│   ├── GET    /:id/breeding-history      — Reproductive timeline
│   ├── GET    /:id/production-stats      — Yield trends
│   └── GET    /:id/financials            — Cost-per-head
├── health-records/
│   ├── POST   /                          — Create record
│   ├── GET    /                          — List
│   └── GET    /:id                       — Detail
├── vaccination-schedules/
│   ├── POST   /                          — Create schedule
│   └── GET    /                          — List
├── breeding-records/
│   ├── POST   /                          — Log insemination
│   ├── GET    /                          — List
│   └── PATCH  /:id/pregnancy-check       — Update status
├── production-logs/
│   ├── POST   /                          — Log yield
│   ├── GET    /                          — List
│   └── GET    /dashboard                 — Aggregate stats
├── inventory/
│   ├── POST   /                          — Add item
│   ├── GET    /                          — List
│   ├── GET    /:id                       — Detail
│   ├── PUT    /:id                       — Update
│   └── PATCH  /:id/stock                 — Adjust stock
├── finance/
│   ├── POST   /transactions              — Record transaction
│   ├── GET    /transactions              — List
│   └── GET    /summary                   — P&L report
├── alerts/
│   ├── GET    /                          — List
│   ├── PATCH  /:id/read                  — Mark read
│   └── GET    /unread-count              — Badge counter
└── uploads/
    ├── POST   /animal/:id/photo          — Animal photo
    ├── POST   /health-record/:id/document— Health attachment
    └── GET    /:filename                 — Serve file
```

---

## 6. Verification Matrix (from SRS Section 9)

| Test ID    | Description                                           | Status      |
| ---------- | ----------------------------------------------------- | ----------- |
| TC-SEC-001 | Worker cannot access financial endpoints (expect 403) | ✅ Verified |
| TC-VAL-002 | Negative production values blocked (expect 400)       | ⬜ Not run  |
| TC-TXN-003 | Medication exceeding stock rolls back cleanly         | ⬜ Not run  |
| TC-FIN-004 | Financial summary uses PKR symbol exclusively         | ⬜ Not run  |

---

## 7. Iteration Log

| Date       | Phase    | Summary                                                                                                                                                          |
| ---------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | --- | ---------- | -------- | ------------------------------------------------------------------------------------------------------------------- |
| 2026-06-16 | Planning | Implementation.md created. Planning complete.                                                                                                                    |
| 2026-06-16 | Planning | All 4 open questions resolved: species column, Chart.js, real QR codes, VARCHAR sire_identity.                                                                   |
| 2026-06-16 | Planning | Database: XAMPP (MariaDB) confirmed. Compatible with all MySQL 8.0 syntax — InnoDB, FKs, ENUMs, indexes. Same `mysql2` driver, same dialect.                     |
| 2026-06-16 | Planning | Updated Frontend scaffolding for Tailwind CSS v4 + Vite plugin setup (no PostCSS, no tailwind.config.js). Verified against latest official docs (Tailwind v4.3). |
| 2026-06-16 | Planning | Added Current Sprint section and Conventions section (§9). Established API response format, HTTP codes, file naming patterns, SQL patterns, and currency rules.  |     | 2026-06-16 | Planning | Currency changed from £ (GBP) to PKR (Pakistani Rupee). All monetary displays, test cases, and conventions updated. |
| 2026-06-16 | Phase 1  | Project scaffolding complete. Backend: Node.js + Express + Sequelize + MySQL connectivity verified. 9 tables created. Frontend: Vite + React + TailwindCSS v4 + Axios with JWT interceptor, proxy configured. |
| 2026-06-16 | Phase 2  | Authentication & RBAC complete. JWT middleware, role-based authorize factory. 3 endpoints tested (login, register, me). Seed: 1 Admin, 2 Vets, 3 Workers. TC-SEC-001 verified (Worker blocked from /register). |

---

## 8. Resolved Decisions

| #   | Question              | Decision                                                                              | Rationale                                                                                                                                    |
| --- | --------------------- | ------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Q1  | Species column?       | **Add explicit `species` field** — `ENUM('Cattle','Sheep','Goat')`                    | Needed for gestation math, breed filtering. Cannot reliably infer from breed_type strings.                                                   |
| Q2  | Chart library?        | **Chart.js** (via `react-chartjs-2`)                                                  | Familiar API, canvas-based, good for dashboards.                                                                                             |
| Q3  | QR codes?             | **Generate actual QR images** (via `qrcode` on backend + `react-qr-code` on frontend) | Printable tags for field workers. The `LIV-YY-XXXXX` code is encoded in the QR.                                                              |
| Q4  | `sire_identity` type? | **Keep as VARCHAR(64)** (not FK)                                                      | Sires are frequently off-farm (external bulls, AI straw batches). VARCHAR accommodates both registered animal tags and external identifiers. |

---

## 9. Conventions

_Established patterns and rules. Update as conventions are set during development._

### API Response Format

```json
// Success
{ "message": "...", "data": { ... } }
// Success with ID
{ "message": "...", "id": 42, "data": { ... } }
// Error
{ "error": "Human-readable error message." }
```

### HTTP Status Codes

| Code | Usage                                    |
| ---- | ---------------------------------------- |
| 200  | Successful GET, PUT, PATCH               |
| 201  | Successful POST (resource created)       |
| 400  | Validation error / bad input / duplicate |
| 401  | Missing or invalid JWT                   |
| 403  | Valid JWT but insufficient role          |
| 404  | Resource not found                       |
| 500  | Internal server / database error         |

### Backend File Naming

| Layer       | Pattern                 | Example                                    |
| ----------- | ----------------------- | ------------------------------------------ |
| Controllers | `{domain}Controller.js` | `animalController.js`, `authController.js` |
| Routes      | `{domain}.js`           | `animals.js`, `inventory.js`               |
| Middleware  | `{purpose}.js`          | `auth.js`, `authorize.js`, `upload.js`     |
| Services    | `{purpose}Service.js`   | `alertService.js`                          |
| Config      | `{purpose}.js`          | `database.js`                              |

### Frontend File Naming

| Layer      | Pattern               | Example                                  |
| ---------- | --------------------- | ---------------------------------------- |
| Pages      | `{Domain}Page.jsx`    | `AnimalsPage.jsx`, `DashboardPage.jsx`   |
| Components | `{Purpose}.jsx`       | `AnimalForm.jsx`, `NotificationBell.jsx` |
| Services   | `{domain}Service.js`  | `animalService.js`, `authService.js`     |
| Context    | `{Domain}Context.jsx` | `AuthContext.jsx`                        |

### SQL Query Patterns

- All queries use `sequelize.query()` with named `:replacements` (never string interpolation).
- Write operations use `await sequelize.transaction()` with explicit `commit()` / `rollback()`.
- Row-locking (`FOR UPDATE`) used in inventory deduction paths to prevent race conditions.
- Timestamps passed as ISO strings from JS, formatted to MySQL DATETIME with `.slice(0, 19).replace('T', ' ')`.

### Currency

- All monetary values stored as `DECIMAL(10,2)`.
- All financial displays rendered with **PKR** prefix. No other currency symbol permitted.
- Backend: format in response `{ amount: "PKR 1,234.56", amount_raw: 1234.56 }`.

---

_This file is the living project management document. Update after every development iteration._
