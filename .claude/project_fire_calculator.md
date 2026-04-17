Built a full Next.js 16 FIRE (Financial Independence, Retire Early) calculator at `ui/`.

**Stack:** Next.js 16 + TypeScript + Tailwind v4 + Framer Motion + Recharts + Zustand + shadcn/ui (base-ui) + Anthropic SDK

**Architecture:**
- `ui/lib/engine/` — pure TS calculation engine (types.ts, mvp.ts, sensitivity.ts)
- `ui/lib/store.ts` — Zustand store with shared inputs/results state for both modes
- `ui/app/page.tsx` — main page (root); `app/(app)/` reserved for future sub-pages
- `ui/components/features/calculator/` — FormWizard (5 steps) + ResultsDashboard
- `ui/components/features/chat/` — ChatInterface + DataPanel
- `ui/app/api/chat/route.ts` — Claude API route using claude-sonnet-4-6

**Key design choices:**
- Deep dark navy theme (oklch(0.07 0.025 265) background) with indigo primary and amber gold accents
- Both form and chat modes write to the same Zustand inputs store → identical results
- Chat mode uses structured JSON output from Claude to extract field values
- Requires `ANTHROPIC_API_KEY` in `ui/.env.local` for chat mode

## Status

### Done ✓
- Next.js 16 project scaffolded at `ui/`, build passes, dev server at localhost:3000
- Deep dark navy theme (oklch + indigo primary + amber gold accents) via `globals.css`
- 5-step form wizard: You → Income → Portfolio → Advanced → Scenarios
- Core MVP calculation engine: year-by-year loop, real return, education costs, healthcare, SS/pension income, tax gross-up on withdrawals
- Zustand store with shared inputs/results — both form and chat write to the same model
- Results dashboard: animated stat cards (count-up), Recharts area chart, FIRE variants (Lean/Fat/Coast), year-by-year table
- Chat mode: Claude API route, structured JSON field extraction per turn, data panel fills as fields are collected
- Mode toggle (Form ↔ Chat) with Framer Motion pill animation

**Phase 2 — Monthly engine + multi-asset net worth + EMI** ✓ DONE
- [x] Month-by-month engine in `ui/lib/engine/monthly.ts` (per-asset monthly rate: `(1+r)^(1/12)-1`)
- [x] Multi-asset net worth: `AssetClass[]` in `FireInputs`, each with label/value/annualReturn; weighted real return
- [x] `WeightedNetReturn = SUM(asset_value × netMonthlyReturn_i) / totalNetWorth` applied each month
- [x] PV corpus: `pvAnnuity(monthlyRetirementSalary, realMonthlyReturn, retirementMonths)`
- [x] Depletion age (`depletionAge`) in `FireResults` — "money lasts until" stat card in dashboard
- [x] EMI streams (`EmiStream[]`): monthly amount, end date (YYYY-MM), redirect-to-savings toggle
- [x] StepPortfolio rewritten as multi-asset table with presets + allocation bar
- [x] StepAdvanced: EMI section + monthly retirement salary field
- [x] ResultsDashboard: 6-stat grid (adds PV corpus + money-lasts-until), PV vs 4%-rule callout

**Phase 3 — Future investments, future expenses, savings streams** ✓ DONE
- [x] `FutureInvestment` — purchaseDate, investmentValue, annualReturn, downPayment, deductDownPayment, emiAmount, emiStartDate, emiEndDate, deductEmiFromSavings; asset added to effectiveAssets at purchase month
- [x] `FutureExpense` — label, monthlyAmount, startDate, endDate; deducted from monthly cash flow in window
- [x] `SavingsStream` — label, monthlyAmount, annualIncreaseRate, startDate, endDate; additive to base savings
- [x] Kids expanded: monthlyLivingExpenses (deducted per child per month), livingEndAge, oneTimeExpenses[] with date+amount
- [x] `retirementSensitivity` table for ages [40,45,50,55,60,65] — required corpus, projected, gap, monthly savings ref
- [x] `nominalRetirementSalary` — today's target × inflation^(years) shown in results
- [x] StepIncome: savings streams collapsible section
- [x] StepPortfolio: future investments collapsible section (asset purchase with EMI + down payment)
- [x] StepAdvanced: future expenses section + expanded kids (living expenses + one-time)
- [x] SensitivityTable.tsx: new results component (planned age highlighted, surplus/shortfall colored)
- [x] ResultsDashboard: nominal salary callout + SensitivityTable below FIRE variants

**Phase 4 — Sensitivity & what-if** ✓ DONE
- [x] `WhatIfPanel.tsx` — 4 sliders (return rate, retirement age, monthly spending, monthly savings); `useMemo` reruns `calculateFireMonthly` with overrides on every drag; delta summary shows FIRE age / number / depletion age changes with color-coded arrows; Reset button
- [x] `PortfolioChart.tsx` updated — optional `whatIfRows` + `whatIfFireAge` props; second amber dashed `Area` overlaid on chart; tooltip shows both base and what-if values + Δ; legend updated; what-if FIRE age reference line rendered
- [x] `store.ts` — `editInputs()` action sets `hasResults = false` (returns to wizard with inputs preserved)
- [x] `ResultsDashboard.tsx` — "Edit inputs" button top-right; `WhatIfPanel` placed between chart and variants; `whatIfResults` lifted as local state, passed to chart via `onWhatIfChange` callback

**Phase 5 — Savings tracking + goal vs trending** ✓ DONE
- [x] `SavingsCategory` + `MonthlyEntry` types in `ui/lib/tracker/types.ts`
- [x] Zustand persist store at `ui/lib/tracker/store.ts` (localStorage key `"fire-tracker"`); 10 default categories (Stocks, SIP, 401k/EPF, IRA/PPF, HSA, LIC, Gold, FDs, Savings/HYSA, Chits)
- [x] `SavingsLog.tsx` — month navigation, planned/actual inputs per category, deviation badges, totals row, actual-vs-planned progress bar, add/remove categories
- [x] `TrendingDashboard.tsx` — planned NW path vs actual logged path; 24-month projection using 3-month avg; Recharts ComposedChart (Area+Lines); projected FIRE age cards; per-category all-time deviation table
- [x] `TrackerPage.tsx` — container with "Monthly Log" / "Trending" sub-tab pill switcher
- [x] `activeTab: "calculator" | "tracker"` added to Zustand fire store
- [x] Navbar: animated pill tab switcher (Calculator ↔ Track) in center; right side adapts per tab
- [x] `page.tsx`: renders `TrackerPage` when `activeTab === "tracker"`

**Phase 6 — Account sequencing** ✓ DONE
- [x] `accountType?: "taxable" | "roth" | "traditional"` added to `AssetClass`; `rothConversionAnnual?` added to `FireInputs`
- [x] `AccountSequencingResult` type + `accountSequencing` field in `FireResults`
- [x] Monthly engine: sequenced drawdown (taxable → Roth basis → Traditional); 10% early withdrawal penalty before age 59.5; Roth conversion ladder queue with 5-year unlock rule per tranche
- [x] `StepPortfolio`: account type toggle (Taxable / Roth / Traditional) per asset row; presets include Roth IRA, Traditional 401k/IRA, EPF/PPF, HSA
- [x] `StepAdvanced`: Roth conversion ladder section with annual amount + explainer
- [x] `AccountSequencingPanel.tsx`: collapsible results panel — balances at retirement by type, bridge years callout, taxable depletion age, conversion ladder first access age, early penalty warnings, stacked bar chart of annual withdrawal sources by account type

**Phase 7 — Monte Carlo + sequence risk** ✓ DONE
- [x] `ui/lib/engine/monteCarlo.ts` — 1,000-trial Box-Muller normal simulation; volatility inferred from asset labels (stocks 18%, bonds 7%, gold 16%, cash 2%); returns `successRate`, `percentileRows` (p10/p25/p50/p75/p90), `medianFireAge`, `sequenceRiskScore`, `worstCaseDepletionAge`
- [x] `ui/lib/engine/historicalSequences.ts` — 5 preset 30-year sequences (Great Depression 1929, Stagflation 1966, Dot-com 2000, Bull Market 1982, Post-COVID 2020); `runHistoricalSequence` projects to retirement with base return then applies historical sequence in drawdown
- [x] `PortfolioChart.tsx` updated to `ComposedChart`; 4 Area components (p90 outer fill → p10 bg erase → p75 inner fill → p25 bg erase) + dashed Line for median; fan bands sit behind base line
- [x] `MonteCarloPanel.tsx` — animated success rate ring, key percentile stat grid, success/warning/danger callout, sequence risk progress bar + explainer, historical stress table (✓/✗ per scenario + depletion age)
- [x] `ResultsDashboard.tsx` — "Monte Carlo" toggle button (top-right, next to Edit inputs); `useEffect` runs simulation deferred via `setTimeout(0)`; animated success rate badge below FIRE number; `MonteCarloPanel` rendered below WhatIfPanel when enabled

**Phase 8 — FIRE variants + polish + mobile** ✓ DONE
- [x] `FireVariants.tsx` rewritten: 2×2 grid (mobile) / 4-column row (sm+) with Lean/Standard/Fat/Barista cards; Barista explainer callout; Coast FIRE improved — progress bar toward coast number, "X years away" label, `coastProgress` pct badge
- [x] `YearlyTable.tsx` mobile-responsive: sticky `Age` column, `Year` hidden on `<sm`, `Spending` hidden on `<md`, `min-w-[480px]` table with horizontal scroll
- [x] `FireCelebration.tsx` — 18 emoji particles (🔥💰✨⭐🎉💎🚀🏄🥂) burst outward via Framer Motion with random angles/distances, radial ring flash; auto-dismisses after 2s; renders only when `fireAge != null`
- [x] `ShareButton.tsx` — tries `navigator.share()` (mobile), falls back to `navigator.clipboard.writeText`; generates formatted plain-text FIRE summary with all key numbers; "Copied!" feedback
- [x] `ResultsDashboard.tsx`: `FireCelebration` mounted at top; header buttons stacked on mobile / row on sm+; `Share` + `Edit` + `Monte Carlo` buttons; `realAnnualReturn` computed and passed to `FireVariants`
- [x] `MonteCarloPanel` historical table: responsive column widths + `min-w-[340px]` scroll; `AccountSequencingPanel` chart height reduced to 180px

**Phase 9 — Chat improvements**
- [ ] Streaming responses (currently waits for full reply before rendering)
- [ ] Results shown inline in chat after calculating
- [ ] Revise flow — tweak one number without restarting the conversation

---

## Backend (Phases 10–12)

### Monorepo structure
```
FIRECalculator/
  ui/           ← Next.js 16 (frontend only — pages, components, thin fetch calls)
  api/          ← Hono API server (business logic, auth, routes)
  db/           ← Drizzle ORM (schema, migrations, Supabase client)
  package.json  ← monorepo root (workspaces)
```

**Separation rationale:**
- `ui/` has zero direct DB access — all data goes through `api/`
- `db/` is single source of truth for schema and generated types; both `api/` and future services import from it
- `api/` is independently deployable (Railway / Fly.io / Vercel Functions)
- Clean boundary makes it easy to add a mobile app or another frontend later

### Tech choices

| Layer | Choice | Reason |
|---|---|---|
| API server | **Hono** | TypeScript-native, runs on Node/Bun/Edge, no boilerplate |
| ORM | **Drizzle** | TypeScript schema-as-code, lightweight, Postgres-first |
| Database | **Supabase Postgres** | Managed Postgres + Auth + Row Level Security |
| Auth | **Supabase Auth** | Email + Google OAuth, JWT tokens, free tier |
| Gateway | **Next.js Middleware** | Domain-based routing (public vs internal), no extra infra |

### Domain / gateway strategy

`middleware.ts` in `ui/` inspects the incoming hostname:
```
app.firecalc.com      → public domain — requires auth JWT on protected routes
internal.firecalc.com → internal domain — service-to-service, bypasses auth
```
Not rate limiting — purely routing/auth bypass based on domain. No external API gateway needed.

### Database schema

```sql
-- managed by Supabase Auth
users (id uuid PK, email, created_at)

-- saved FIRE plans
plans (
  id          uuid PK default gen_random_uuid(),
  user_id     uuid FK → users.id,
  name        text NOT NULL,
  inputs      jsonb NOT NULL,   -- FireInputs snapshot
  is_public   boolean default false,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
)

-- savings tracker entries
tracker_entries (
  id          uuid PK default gen_random_uuid(),
  user_id     uuid FK → users.id,
  month       varchar(7) NOT NULL,  -- "YYYY-MM"
  category_id text NOT NULL,
  planned     numeric,
  actual      numeric,
  UNIQUE (user_id, month, category_id)
)

-- custom tracker categories per user
tracker_categories (
  id        uuid PK default gen_random_uuid(),
  user_id   uuid FK → users.id,
  label     text NOT NULL,
  color     text NOT NULL,
  sort_order int default 0
)

-- chat sessions (Phase 12, optional)
chat_sessions (
  id         uuid PK default gen_random_uuid(),
  user_id    uuid FK → users.id,
  created_at timestamptz default now()
)
chat_messages (
  id                uuid PK default gen_random_uuid(),
  session_id        uuid FK → chat_sessions.id,
  role              text CHECK (role IN ('user', 'assistant')),
  content           text NOT NULL,
  extracted_inputs  jsonb,
  created_at        timestamptz default now()
)
```

Row Level Security on all tables: `user_id = auth.uid()`.
`plans` with `is_public = true` also readable without auth.

### API routes

```
-- Plans
GET    /plans             list all plans for authed user
POST   /plans             create plan  { name, inputs }
GET    /plans/:id         get single plan (public plans accessible without auth)
PUT    /plans/:id         update plan  { name?, inputs? }
DELETE /plans/:id         delete plan

-- Tracker
GET    /tracker/entries?month=YYYY-MM    get entries for a month
PUT    /tracker/entries                  upsert entries (batch)
GET    /tracker/categories               list user's categories
POST   /tracker/categories               add category  { label, color }
DELETE /tracker/categories/:id           remove category

-- Chat (Phase 12)
POST   /chat/sessions              start a new session
GET    /chat/sessions              list recent sessions
GET    /chat/sessions/:id/messages get messages for a session
POST   /chat/sessions/:id/message  send a message → streaming response

-- Internal (no auth, internal domain only)
GET    /internal/health
GET    /internal/metrics
```

### Folder layout

```
db/
  src/
    schema.ts       ← Drizzle table definitions
    client.ts       ← Drizzle + Supabase client setup
    migrations/     ← generated SQL migration files
  drizzle.config.ts
  package.json

api/
  src/
    index.ts
    middleware/
      auth.ts             ← JWT verify via Supabase
      internal.ts         ← internal domain bypass
    routes/
      plans.ts
      tracker.ts
      chat.ts
      internal.ts
    lib/
      supabase.ts         ← Supabase admin client
  package.json
  tsconfig.json

ui/ (additions only)
  middleware.ts           ← domain gateway (public vs internal)
  lib/
    api/
      client.ts           ← typed fetch wrapper for api/ endpoints
      plans.ts            ← plan CRUD hooks
      tracker.ts          ← tracker sync hooks
  app/
    auth/
      login/page.tsx
      signup/page.tsx
      callback/page.tsx   ← OAuth redirect handler
    plan/
      [id]/page.tsx       ← public shareable read-only plan view
```

### Environment variables

**`api/.env`**
```
DATABASE_URL=postgresql://...
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=...   ← server-only, never in browser
ANTHROPIC_API_KEY=...           ← moves here in Phase 12
```

**`ui/.env.local`**
```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...   ← safe to expose (RLS enforced)
NEXT_PUBLIC_API_URL=http://localhost:4000
ANTHROPIC_API_KEY=...               ← only until Phase 12
```

### Phase 10 — Auth + Saved Plans ✓ DONE
- [x] Scaffold monorepo root `package.json` (workspaces: ui, api, db) + `.gitignore`
- [x] `db/`: Drizzle schema (`plans`, `tracker_entries`, `tracker_categories`, `chat_sessions`, `chat_messages`), `client.ts`, `drizzle.config.ts`
- [x] `api/`: Hono server (port 4000), `cors` + `logger` middleware, auth middleware (JWT via Supabase service role), internal domain middleware, `/plans` CRUD, `/tracker/entries` + `/tracker/categories`, `/internal/health`
- [x] `ui/lib/supabase/`: browser client, server client (RSC/API routes), middleware session refresh helper
- [x] `ui/middleware.ts`: session refresh + redirect unauthenticated users; `/`, `/auth/*`, `/plan/*` are public
- [x] `ui/app/auth/login/page.tsx`: Google OAuth + email magic link (OTP)
- [x] `ui/app/auth/callback/route.ts`: PKCE code exchange → redirect to `/`
- [x] `ui/components/layout/AuthButton.tsx`: shows user email + sign-out; "Sign in" if logged out
- [x] `ui/components/features/plans/SavePlanButton.tsx`: inline name input → POST /plans
- [x] `ui/components/features/plans/PlansDrawer.tsx`: slide-in drawer, load/delete/toggle-public/copy-link per plan
- [x] `ui/app/plan/[id]/page.tsx`: server-rendered public shareable plan page (stats grid + FIRE variants)
- [x] `ui/lib/api/client.ts` + `plans.ts`: typed fetch wrapper with auto auth header

**To activate:**
1. Create Supabase project → copy URL + anon key + service role key
2. Fill `ui/.env.local` and `api/.env` (see `.env.example` in each)
3. Run `npm run db:migrate` from root to push schema
4. Enable Google provider in Supabase dashboard → Auth → Providers

### Phase 11 — Tracker Persistence
- [ ] `api/`: `/tracker` routes already built — wire `ui/lib/tracker/store.ts` to sync with API on tab focus
- [ ] Keep localStorage as offline cache — merge on reconnect

### Phase 12 — Chat History (optional)
- [ ] `db/`: schema for `chat_sessions` + `chat_messages` (already in schema.ts)
- [ ] `api/`: `/chat` routes with streaming support via Hono streaming helper
- [ ] Move Claude call from `ui/app/api/chat/route.ts` into `api/src/routes/chat.ts`
- [ ] `ui/`: "Resume session" — load past messages on login
