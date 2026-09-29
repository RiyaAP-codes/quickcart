# QuickCart — AI-Powered E-Commerce Platform

A college DevOps/Agile mini-project: a React storefront with a natural-language
shopping assistant that turns a plain-English request into structured
requirements, filters a real product catalogue, and explains every
recommendation it makes.

The differentiator is that the assistant **cannot invent products**. Intent
extraction and product search are deliberately separate concerns, and every
result is a row that already exists in `src/data/products.js`.

## Features

| Area | What it does |
| --- | --- |
| Catalogue | 20 products across 8 categories, local dataset |
| Browsing | Responsive product grid, category chips, max-price slider, text search |
| Search | Case-insensitive match across name, brand, category, features and purpose |
| Cart | Add, remove, increase/decrease quantity, live cart total |
| Checkout | Mock order form with an order-confirmation screen (no real payments) |
| AI assistant | Natural-language query → structured intent → ranked, explained results |
| Match score | Weighted 0–100% score, normalised over the criteria actually requested |
| Guardrails | No dataset match means "no matching products found", never a fabricated item |

## Tech stack

- React 19 + Vite 8 (JavaScript, no TypeScript)
- `lucide-react` for icons
- ESLint 9 flat config with the React Hooks plugin
- GitHub Actions for CI

No backend, no database, no authentication, no payment gateway.

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
```

Other scripts:

```bash
npm run lint     # eslint . — must exit 0
npm run build    # production build into dist/
npm run preview  # serve the production build locally
```

## Project structure

```text
quickcart/
├── .github/workflows/ci.yml   # install -> lint -> build
├── src/
│   ├── components/
│   │   ├── AIShoppingAssistant.jsx  # chat panel: intent + results
│   │   ├── Cart.jsx                 # slide-in cart drawer
│   │   ├── CategoryFilter.jsx
│   │   ├── Checkout.jsx             # mock checkout
│   │   ├── Navbar.jsx
│   │   ├── PriceFilter.jsx
│   │   ├── ProductCard.jsx          # also renders match score + reasons
│   │   ├── ProductList.jsx
│   │   └── SearchBar.jsx
│   ├── data/
│   │   └── products.js        # the 20-product dataset (stands in for a DB)
│   ├── utils/
│   │   ├── intentExtractor.js # natural language -> structured intent
│   │   └── recommendProducts.js # filtering, match score, explanations
│   ├── App.jsx                # all app state lives here
│   ├── App.css
│   ├── index.css              # design tokens + reset
│   └── main.jsx
├── index.html
└── package.json
```

## Architecture

The request flow is the whole point of the project:

```text
user query
    -> extractIntent()      utils/intentExtractor.js   (understands language)
    -> Intent object        { category, maxPrice, purpose, features, brand }
    -> recommendProducts()  utils/recommendProducts.js (searches the dataset)
    -> ranked results       [{ product, score, reasons, notes }]
    -> ProductCard          renders "94% Match" + the reasons why
```

`extractIntent()` only ever reads the user's sentence. It has no access to the
product list, so it cannot produce or alter a product. `recommendProducts()` only
ever returns objects that were passed into it from `PRODUCTS`. Hallucination is
prevented by architecture, not by prompt wording.

### Swapping in a real LLM

`extractIntent(query)` is the single integration point. Replace its body with a
call to an LLM that returns the same shape (`category`, `brand`, `minPrice`,
`maxPrice`, `purpose`, `features`) and nothing else in the app needs to change —
`recommendProducts()` and the UI already consume that shape. Keep API keys in a
server-side proxy or environment variable; never in frontend code.

## Match score

The score is a weighted sum, normalised over the criteria the shopper actually
asked about, so "just show me headphones" is not penalised for a budget they
never mentioned.

| Criterion | Weight |
| --- | --- |
| Category match | 30 |
| Within budget | 30 |
| Purpose match | 20 |
| Feature match | 10 |
| Rating | 10 |

Criteria with no counterpart in the query are dropped from the denominator. The
UI labels this a **Match Score**, not a "best product" — it is a ranking signal,
not a judgement.

Products that fail an explicit constraint (wrong category, over budget) are
excluded before scoring, which is what makes the guardrail exact: nothing within
budget means no results, not a low-scoring substitute.

## Demo script

1. Browse the catalogue; filter by category and drag the price slider.
2. Open **AI Assistant** and run: `wireless headphones under 3000 for studying`
   — the extracted intent is displayed as JSON, followed by ranked products with
   a match score and a per-product explanation.
3. Try `laptop for coding under 60000 with good battery life`.
4. Try `iphone under 500` — the guardrail: "No matching products found", plus the
   closest items actually stocked.
5. Add a product to the cart, change quantities, and complete the mock checkout.

## CI/CD

`.github/workflows/ci.yml` runs on every push and pull request to `main`:

```text
push -> checkout -> setup Node 20 -> npm ci -> npm run lint -> npm run build
```

The job passes only when the app installs, lints and builds cleanly. The build
output in `dist/` is a static bundle, so it can be deployed to any static host.
