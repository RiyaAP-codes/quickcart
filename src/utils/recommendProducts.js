/**
 * QuickCart - recommendation engine.
 *
 * Every product returned here comes straight from the dataset passed in. The
 * engine can only rank and explain existing products, which is the guardrail
 * that stops the assistant from inventing items.
 */

const inr = new Intl.NumberFormat('en-IN')

export const WEIGHTS = {
  category: 30,
  price: 30,
  purpose: 20,
  features: 10,
  rating: 10,
}

function formatPrice(value) {
  return `₹${inr.format(value)}`
}

function titleCase(value) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

/**
 * Hard constraints: things the shopper was explicit about. A product that
 * fails any of these is not a candidate at all.
 */
function meetsConstraints(product, intent) {
  if (intent.category && product.category !== intent.category) {
    return false
  }

  if (intent.brand && product.brand.toLowerCase() !== intent.brand.toLowerCase()) {
    return false
  }

  if (intent.maxPrice !== null && product.price > intent.maxPrice) {
    return false
  }

  if (intent.minPrice !== null && product.price < intent.minPrice) {
    return false
  }

  return true
}

/**
 * Scores one product against one intent.
 *
 * The score is normalised over the dimensions the shopper actually asked about,
 * so "just show me headphones" is not penalised for missing a budget they never
 * mentioned. Returns the raw reason strings used by the UI.
 *
 * @param {object} product A product from the dataset.
 * @param {object} intent Output of extractIntent().
 * @returns {{score: number, reasons: string[], notes: string[]}}
 */
export function scoreProduct(product, intent) {
  const reasons = []
  const notes = []
  let earned = 0
  let possible = 0

  if (intent.category) {
    possible += WEIGHTS.category
    if (product.category === intent.category) {
      earned += WEIGHTS.category
      reasons.push(`Category matches: ${titleCase(product.category)}`)
    }
  }

  if (intent.maxPrice !== null || intent.minPrice !== null) {
    possible += WEIGHTS.price
    earned += WEIGHTS.price
    reasons.push(`Within your budget of ${formatPrice(intent.maxPrice)}`)
  }

  if (intent.purpose.length > 0) {
    possible += WEIGHTS.purpose
    const matched = intent.purpose.filter((purpose) => product.purpose.includes(purpose))
    if (matched.length > 0) {
      earned += (matched.length / intent.purpose.length) * WEIGHTS.purpose
      reasons.push(`Suitable for ${matched.map(titleCase).join(', ')}`)
    } else {
      notes.push(`Not aimed at ${intent.purpose.map(titleCase).join(' or ')}`)
    }
  }

  if (intent.features.length > 0) {
    possible += WEIGHTS.features
    const matched = intent.features.filter((feature) => product.features.includes(feature))
    if (matched.length > 0) {
      earned += (matched.length / intent.features.length) * WEIGHTS.features
      matched.forEach((feature) => reasons.push(titleCase(feature)))
    } else {
      notes.push(`Missing: ${intent.features.map(titleCase).join(', ')}`)
    }
  }

  possible += WEIGHTS.rating
  earned += (product.rating / 5) * WEIGHTS.rating
  if (product.rating >= 4) {
    reasons.push(`${product.rating.toFixed(1)}★ rating`)
  }

  return {
    score: possible === 0 ? 0 : Math.round((earned / possible) * 100),
    reasons,
    notes,
  }
}

/**
 * Ranks the dataset against an intent.
 *
 * @param {object[]} products The full dataset. Only these products can be returned.
 * @param {object} intent Output of extractIntent().
 * @param {{limit?: number}} [options]
 * @returns {Array<{product: object, score: number, reasons: string[], notes: string[]}>}
 */
export function recommendProducts(products, intent, options = {}) {
  const { limit = 6 } = options

  // Nothing was understood, so nothing is recommended. Without this, an
  // unparsed query would fall through every constraint and return the
  // highest-rated items with a misleadingly high score.
  if (!intent.understood) {
    return []
  }

  return products
    .filter((product) => meetsConstraints(product, intent))
    .map((product) => ({ product, ...scoreProduct(product, intent) }))
    .sort((a, b) => b.score - a.score || a.product.price - b.product.price)
    .slice(0, limit)
}

/**
 * Nearest-miss suggestions for when nothing matched, so the guardrail message
 * is helpful instead of a dead end. These are still real dataset products.
 *
 * @returns {Array<{product: object, note: string}>}
 */
export function suggestAlternatives(products, intent, options = {}) {
  const { limit = 3 } = options

  return products
    .filter((product) => {
      if (intent.category && product.category !== intent.category) {
        return false
      }
      return !(
        intent.brand &&
        product.brand.toLowerCase() !== intent.brand.toLowerCase()
      )
    })
    .sort((a, b) => {
      const aOverBudget = intent.maxPrice !== null && a.price > intent.maxPrice
      const bOverBudget = intent.maxPrice !== null && b.price > intent.maxPrice

      if (aOverBudget !== bOverBudget) {
        return aOverBudget ? 1 : -1
      }
      return a.price - b.price
    })
    .slice(0, limit)
    .map((product) => {
      const overBudget = intent.maxPrice !== null && product.price > intent.maxPrice

      return {
        product,
        note: overBudget
          ? `${formatPrice(product.price)} — above your budget of ${formatPrice(intent.maxPrice)}`
          : `${formatPrice(product.price)} — matches, but your other filters ruled it out`,
      }
    })
}

export default recommendProducts
