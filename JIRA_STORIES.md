# QuickCart — Jira Agile Backlog

Paste-ready backlog for the QuickCart project. Epic and stories are ordered by
delivery sequence; each story lists acceptance criteria in Jira-ready form and
the commit that satisfies it, so the Jira → Git → CI trail is visible in a demo.

**Project:** QuickCart — AI-Powered E-Commerce Platform
**Type:** Scrum / Kanban board, 1-week sprint
**Epic:** QuickCart E-Commerce Platform

---

## Epic — QuickCart E-Commerce Platform

> As a customer, I want a fast online store with an AI shopping assistant so
> that I can find what I need by describing it in plain English instead of
> filling in filter forms.

**Epic acceptance criteria**
- Shopper can browse, search, filter, add to cart and check out.
- Shopper can describe a requirement in natural language and receive real,
  ranked, explained product matches.
- The assistant never returns a product that is not in the catalogue.
- Every commit passes automated lint and build checks.

---

## US01 — Product browsing

**As a customer, I want to browse products by category so that I can explore
what is available without typing anything.**

**Acceptance criteria**
- Given the home page, when it loads, then all catalogue products are displayed.
- Given a category chip, when I select one, then only that category's products
  are shown and the chip is visually active.
- Given an empty filter result, when the grid has no matches, then an
  explanatory empty state is shown instead of a blank page.
- Product cards show name, brand, price, rating and availability.

**Priority:** High  ·  **Story points:** 3
**Satisfied by:** `feat: add product dataset and catalog ui`

---

## US02 — Product search

**As a customer, I want to search for products by name or brand so that I can
find a specific item quickly.**

**Acceptance criteria**
- Search is case-insensitive.
- Search matches against product name and brand.
- Search also matches category, features and purpose tags.
- An empty or whitespace-only query returns the full catalogue.
- The result count updates as I type.

**Priority:** High  ·  **Story points:** 2
**Satisfied by:** `feat: add product dataset and catalog ui`

---

## US03 — Product filtering

**As a customer, I want to filter by category and maximum price so that I only
see products I can actually consider.**

**Acceptance criteria**
- Category and price filters combine with AND, not OR.
- The price slider shows the live maximum budget in rupees.
- The price ceiling defaults to the most expensive product, so nothing is
  hidden on first load.
- Filters combine with the free-text search.
- The grid reports how many of the total products are currently visible.

**Priority:** High  ·  **Story points:** 3
**Satisfied by:** `feat: add product dataset and catalog ui`

---

## US04 — Shopping cart

**As a customer, I want to add products to a cart and adjust quantities so that
I can buy more than one of an item before paying.**

**Acceptance criteria**
- Given a product, when I press "Add to cart", then it is added and the navbar
  badge increments.
- Adding the same product again increases its quantity rather than duplicating
  the line.
- I can increase and decrease quantity from the cart drawer.
- Decreasing quantity below 1 removes the line.
- I can remove a line entirely.
- The cart total reflects price × quantity across all lines.
- Out-of-stock products cannot be added.

**Priority:** High  ·  **Story points:** 5
**Satisfied by:** `feat: add shopping cart, mock checkout and AI assistant panel`

---

## US05 — Checkout

**As a customer, I want a checkout confirmation so that I know my order was
accepted.**

**Acceptance criteria**
- The checkout summarises every line and the order total.
- Name, phone and address are required; phone must be 10 digits.
- Placing the order shows a confirmation and empties the cart.
- No payment details are collected and no payment is processed — this is
  explicitly a mock checkout.
- The interface states that no real payment is taken.

**Priority:** Medium  ·  **Story points:** 3
**Satisfied by:** `feat: add shopping cart, mock checkout and AI assistant panel`

---

## US06 — Smart AI intent extraction

**As a customer, I want to enter my requirements in natural language so that I
don't have to manually select multiple filters.**

**Acceptance criteria**
- Given a free-text request, when it is submitted, then category, brand, price
  range, purpose and features are extracted where present.
- The extracted intent is displayed as structured JSON.
- Price formats are understood: "under 3000", "below ₹3000", "less than
  3000", "between 1000 and 3000", "max 5000".
- Informal wording is understood: "for studying" → purpose `study`, "good
  battery life" → feature `long battery life`.
- Brand names are matched on whole words, so "programming" is not read as a
  brand.
- If nothing can be understood, the assistant says so and asks for a category,
  budget or purpose rather than guessing.
- Extraction lives in one replaceable function so a hosted LLM can be
  substituted later without touching the UI.

**Priority:** High  ·  **Story points:** 8
**Satisfied by:** `feat: add smart intent extraction, recommendation engine and match score`

---

## US07 — AI product recommendations

**As a customer, I want matching products ranked for me so that I can see the
best options for my request without browsing manually.**

**Acceptance criteria**
- Recommendations are ranked highest match score first.
- Results are drawn only from the real product catalogue.
- The score is a weighted combination: category 30, budget 30, purpose 20,
  features 10, rating 10.
- The score is normalised over the criteria the customer actually asked about,
  so an unmentioned budget does not penalise a product.
- Explicit constraints (category, budget, brand) are applied before scoring.
- I can add a recommended product to my cart directly from the assistant.

**Priority:** High  ·  **Story points:** 8
**Satisfied by:** `feat: add smart intent extraction, recommendation engine and match score`

---

## US08 — Explainable recommendation / match score

**As a customer, I want to see why a product was recommended so that I can
judge the recommendation myself instead of trusting it blindly.**

**Acceptance criteria**
- Each recommended product shows a percentage labelled "Match Score".
- The label is "Match Score", not "best product" — it is a ranking signal.
- Every contributing reason is listed, e.g. "Within your budget of ₹3,000",
  "Suitable for Study", "Wireless", "4.3★ rating".
- Reasons that did not match are called out explicitly, e.g. "Not aimed at
  Study".
- The weight of each criterion is documented in the README.

**Priority:** Medium  ·  **Story points:** 5
**Satisfied by:** `feat: add smart intent extraction, recommendation engine and match score`

---

## US09 — AI guardrails

**As a customer, I want the assistant to admit when it has no answer so that I
am never shown a product that does not exist.**

**Acceptance criteria**
- Given a request with no catalogue match, the assistant responds "No matching
  products found" and suggests increasing the budget or changing requirements.
- The assistant never generates a product name, price or specification that is
  not present in the dataset.
- Hallucination is prevented structurally: the intent extractor has no access to
  the product list, and the recommender only ever returns objects it was given.
- When a request cannot be parsed at all, no products are recommended.
- Where nothing matched, the assistant offers the closest items that are
  actually stocked, clearly labelled with why they did not match.

**Priority:** High  ·  **Story points:** 5
**Satisfied by:** `feat: add smart intent extraction, recommendation engine and match score`

---

## US10 — CI/CD deployment

**As a developer, I want every push verified and the app deployed
automatically so that broken code never reaches the demo.**

**Acceptance criteria**
- A GitHub Actions workflow runs on every push and pull request to `main`.
- The pipeline checks out the repository, sets up Node.js and caches npm.
- Dependencies install with `npm ci` for reproducible builds.
- `npm run lint` and `npm run build` both run and must exit 0.
- The build produces a static bundle in `dist/`, deployable to a static host.
- A failing lint or build fails the pipeline.
- The workflow file itself is committed and version controlled.

**Priority:** High  ·  **Story points:** 3
**Satisfied by:** `ci: add github actions workflow`

---

## Traceability

| Story | Commit | CI run |
| --- | --- | --- |
| US01, US02, US03 | `fa93261 feat: add product dataset and catalog ui` | ✅ |
| US04, US05 | `f50bbe8 feat: add shopping cart, mock checkout and AI assistant panel` | ✅ |
| US06, US07, US08, US09 | `0b232f2 feat: add smart intent extraction, recommendation engine and match score` | ✅ |
| US10 | workflow file in `.github/workflows/ci.yml` | pending first push |

## Demo walkthrough for the DevOps narrative

```text
Jira story (e.g. US06)
    -> code change (git commit)
    -> GitHub (push)
    -> GitHub Actions (checkout -> install -> lint -> build)
    -> green check
    -> live QuickCart
```
