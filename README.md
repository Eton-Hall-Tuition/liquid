# Liquid Leviyathan — Shop Management System

A full-featured shop management system built with **React 18 + Vite**.

---

## Quick Start

```bash
npm install
npm run dev        # → http://localhost:5173
npm run build      # production build → dist/
npm run preview    # preview the production build
```

---

## Tech Stack

| Layer       | Choice                        |
|-------------|-------------------------------|
| UI          | React 18 (hooks, Context API) |
| Build tool  | Vite 5                        |
| Charts      | Recharts                      |
| Styling     | Pure CSS custom properties (no Tailwind, no UI lib) |
| State       | React Context + `useState`    |
| Persistence | `localStorage` (theme / sidebar prefs) |

---

## Project Structure

```
liquid-leviyathan/
├── index.html
├── vite.config.js
├── eslint.config.js
├── package.json
└── src/
    ├── main.jsx                    ← app entry point
    │
    ├── app/
    │   ├── App.jsx                 ← shell: sidebar + active feature
    │   └── providers.jsx           ← wraps app with all context providers
    │
    ├── components/
    │   ├── Sidebar.jsx             ← collapsible sidebar (uses AppContext + ThemeContext)
    │   └── ui/
    │       └── index.jsx           ← shared primitives: Modal, AuditLog, Avatar, Empty, PageWrapper…
    │
    ├── context/
    │   ├── ThemeContext.jsx         ← color theme (5 palettes) + dark/light + font — persisted
    │   └── AppContext.jsx           ← active section, sidebar collapsed state — persisted
    │
    ├── features/                   ← feature-based architecture (bulletproof-react pattern)
    │   ├── billing/
    │   │   ├── index.jsx           ← feature root: composes sub-components
    │   │   └── components/
    │   │       ├── POSTerminal.jsx ← item grid + live bill panel + payment + change calc
    │   │       ├── Receipt.jsx     ← post-payment receipt modal
    │   │       ├── BillHistory.jsx ← paginated bill table + summary stats
    │   │       └── BillingAnalytics.jsx ← payment mode split + top items chart
    │   │
    │   ├── dashboard/
    │   │   ├── index.jsx           ← revenue/profit trends, period switcher, compare mode
    │   │   └── components/
    │   │       └── PeriodSelector.jsx
    │   │
    │   ├── items/
    │   │   ├── index.jsx           ← product catalogue with audit log + revert
    │   │   └── components/
    │   │       ├── ItemModal.jsx   ← add/edit modal with gain/margin calculator
    │   │       └── ItemsTable.jsx  ← catalogue table with status badges
    │   │
    │   ├── purchases/
    │   │   └── index.jsx           ← supplier purchases, invoice tracking
    │   │
    │   ├── storage/
    │   │   ├── index.jsx           ← stock ledger + expiry tracking + recommendations
    │   │   └── components/
    │   │       └── StockModal.jsx  ← add/edit stock entry
    │   │
    │   ├── expenses/
    │   │   └── index.jsx           ← operating expenses by category with breakdown bars
    │   │
    │   ├── members/
    │   │   ├── index.jsx           ← team members with group filter
    │   │   └── components/
    │   │       ├── MemberModal.jsx ← add/edit with share% for owners/partners
    │   │       ├── MemberCard.jsx  ← expandable card with bio, contact, docs
    │   │       └── ShareBar.jsx    ← visual profit share allocation bar
    │   │
    │   ├── maintenance/
    │   │   ├── index.jsx           ← asset list with lifecycle expand
    │   │   └── components/
    │   │       ├── AssetModal.jsx  ← add/edit asset
    │   │       ├── EventModal.jsx  ← log damage/repair/replacement event
    │   │       └── AssetLifecycle.jsx ← vertical timeline + repair cost chart
    │   │
    │   └── settings/
    │       ├── index.jsx           ← dark/light toggle, theme picker, font picker
    │       └── components/
    │           ├── ColorThemePicker.jsx ← 5 color palettes with live swatches
    │           └── FontPicker.jsx       ← 4 font variants with live preview
    │
    ├── store/
    │   └── useStore.js             ← all global state: seed data + every mutation
    │
    ├── styles/
    │   ├── globals.css             ← CSS custom properties, reset, utility classes
    │   └── themes.js               ← 5 palettes × dark+light mode token sets
    │
    └── utils/
        └── format.js               ← formatCurrency, formatCompact, daysUntil, uid
```

---

## Key Features

### Sections
| Section | Description |
|---|---|
| **Dashboard** | Revenue · Expenses · Profit trends. Day/Week/Month/Year view. A vs B comparison mode. |
| **POS / Billing** | Full point-of-sale terminal. Item tiles, live bill, payment modes, cash change calculator, receipt. Auto-deducts stock. |
| **Products** | Admin-controlled catalogue. Every price change is logged with who changed what. One-click revert. |
| **Purchases** | Supplier invoices, purchase history, cost tracking. |
| **Storage** | Stock ledger with expiry countdown badges. Admin-approved restock/offer recommendations. |
| **Expenses** | Operating costs (rent, utilities, marketing…) with category breakdown bars. |
| **Members** | Employees, owners, cashiers, partners. Salary + profit share %. Visual share allocation bar. |
| **Maintenance** | Asset lifecycle tracking. Log damage → repair → replacement. Visual timeline + cost chart per asset. |
| **Settings** | 5 color themes (Ocean, Midnight, Ember, Slate, Forest) × dark + light mode. 4 font variants. All saved to localStorage. |

### Architecture decisions
- **Context API** (not Redux) — ThemeContext + AppContext cover all cross-cutting concerns cleanly
- **Feature-based folders** — each domain owns its files; easy to find, extend, or hand off
- **CSS Custom Properties** — all colors/fonts are CSS vars; theme switching is instant with zero re-renders
- **Audit log** — every mutation logs a timestamped entry; price edits in Items are revertable
- **localStorage persistence** — theme, dark/light mode, sidebar state all survive page refresh

---

## Adding a New Feature

1. Create `src/features/my-feature/` folder
2. Add `src/features/my-feature/index.jsx` as the root component
3. Add sub-components to `src/features/my-feature/components/`
4. Register in `src/app/App.jsx` → `SECTION_MAP`
5. Add nav entry in `src/components/Sidebar.jsx` → `NAV_ITEMS`

---

## Environment
- Node.js ≥ 18
- npm ≥ 9
