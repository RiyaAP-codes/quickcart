/**
 * QuickCart - Smart Intent Extractor.
 *
 * Turns a free-text shopping request into a structured intent object. This is
 * the "AI" layer of the project and it is deliberately rule-based: the extractor
 * only ever reads the user's sentence, it never sees or invents products. That
 * separation is what makes hallucinated products impossible.
 *
 * To upgrade to a real LLM later, implement the same signature:
 *
 *   async function extractIntent(query) -> Intent
 *
 * and swap the body of `extractIntent` for an API call. Every caller in this
 * app already awaits it, so no other file needs to change.
 */

/** Canonical category keys, matching src/data/products.js. */
export const CATEGORIES = [
  'headphones',
  'laptop',
  'smartphone',
  'keyboard',
  'mouse',
  'backpack',
  'smartwatch',
  'accessory',
]

const CATEGORY_TERMS = {
  headphones: [
    'headphone',
    'headphones',
    'headset',
    'headsets',
    'earphone',
    'earphones',
    'earbud',
    'earbuds',
    'ear piece',
    'earpieces',
  ],
  laptop: ['laptop', 'laptops', 'notebook', 'notebooks', 'macbook', 'ultrabook'],
  smartphone: [
    'smartphone',
    'smartphones',
    'phone',
    'phones',
    'mobile',
    'mobiles',
    'iphone',
    'android phone',
  ],
  keyboard: ['keyboard', 'keyboards', 'keypad', 'keypads'],
  mouse: ['mouse', 'mice', 'mousepad'],
  backpack: ['backpack', 'backpacks', 'back pack', 'bag', 'bags', 'rucksack', 'school bag'],
  smartwatch: [
    'smartwatch',
    'smartwatchs',
    'smart watch',
    'watch',
    'watches',
    'fitness band',
    'fitness tracker',
    'smart band',
  ],
  accessory: [
    'accessory',
    'accessories',
    'charger',
    'chargers',
    'power bank',
    'powerbank',
    'adapter',
    'study material',
  ],
}

/** Maps user wording to the `purpose` tokens stored on each product. */
const PURPOSE_TERMS = {
  study: ['study', 'studying', 'studies', 'college', 'school', 'exam', 'homework', 'revision'],
  coding: ['coding', 'code', 'coding', 'programming', 'developer', 'development', 'software'],
  gaming: ['gaming', 'game', 'games', 'gamer'],
  music: ['music', 'audio', 'listening', 'songs', 'podcast'],
  work: ['work', 'working', 'office', 'professional', 'business', 'meetings'],
  fitness: ['fitness', 'gym', 'workout', 'running', 'sports', 'exercise'],
  travel: ['travel', 'travelling', 'traveling', 'trip', 'commute'],
  photography: ['photography', 'photo', 'photos', 'camera', 'pictures'],
  'content-creation': [
    'content creation',
    'content-creation',
    'video editing',
    'editing',
    'youtube',
    'vlogging',
    'streaming',
  ],
  everyday: ['everyday', 'daily', 'daily use', 'general use', 'normal use'],
}

/** Maps user wording to the `features` tokens stored on each product. */
const FEATURE_TERMS = {
  wireless: ['wireless', 'bluetooth', 'bt'],
  'noise cancelling': ['noise cancelling', 'noise cancellation', 'anc', 'active noise'],
  'long battery life': [
    'long battery life',
    'good battery life',
    'battery life',
    'long battery',
    'best battery',
  ],
  'fast charging': ['fast charging', 'fast charge', 'quick charge'],
  'anti-glare': ['anti-glare', 'antiglare', 'matte display'],
  'amoled display': ['amoled', 'oled', 'super amoled'],
  'water resistant': ['water resistant', 'waterproof', 'ip68', 'splash proof'],
  'mechanical keys': ['mechanical', 'mechanical keys', 'mech keys'],
  'rgb lighting': ['rgb', 'rgb lighting', 'backlight'],
  ergonomic: ['ergonomic', 'comfortable'],
  'noise isolating mic': ['noise isolating', 'clear calls', 'hd mic'],
  'dedicated gpu': ['dedicated gpu', 'gpu', 'graphics card'],
  'high refresh rate': ['high refresh rate', 'refresh rate'],
  'fast cooling': ['fast cooling', 'cooling'],
  'spill resistant': ['spill resistant', 'spill proof'],
  'usb-c': ['usb c', 'usb-c', 'type c', 'type-c'],
  'usb charging port': ['usb charging', 'charging port'],
  'dpi adjustable': ['dpi', 'adjustable dpi'],
  compact: ['compact', 'small', 'tiny'],
  'low latency': ['low latency'],
  lightweight: ['lightweight', 'light weight', 'light'],
  portable: ['portable', 'travel friendly'],
  wired: ['wired', 'with cable'],
  'swivel ear cups': ['swivel', 'swivel ear cups'],
}

const CURRENCY = '(?:rs\\.?|inr|₹)?'
const AMOUNT = '([\\d,]+)'
const UPPER_BOUND =
  '(?:under|below|less than|lesser than|within|upto|up to|max|maximum|not more than|cheaper than|budget of|budget is|below or at)\\s*'
const RANGE_PRICE = new RegExp(
  `between\\s*${CURRENCY}\\s*${AMOUNT}\\s*(?:and|to|-)\\s*${CURRENCY}\\s*([\\d,]+)`,
  'i',
)
const UPPER_PRICE = new RegExp(
  `${UPPER_BOUND}${CURRENCY}\\s*${AMOUNT}`,
  'i',
)
const BARE_PRICE = new RegExp(`${CURRENCY}\\s*${AMOUNT}`, 'i')
const BRAND_TERMS = {
  Apple: ['iphone', 'apple'],
  Sony: ['sony'],
  Dell: ['dell', 'inspiron'],
  Lenovo: ['lenovo', 'ideapad'],
  ASUS: ['asus', 'rog'],
  Samsung: ['samsung', 'galaxy'],
  Redmi: ['redmi', 'note 14'],
  HP: ['hp'],
}

function normalise(text) {
  return text.toLowerCase().replace(/\s+/g, ' ').trim()
}

function toNumber(raw) {
  return Number.parseInt(raw.replace(/,/g, ''), 10)
}

function findFirstMatch(text, dictionary) {
  for (const [canonical, terms] of Object.entries(dictionary)) {
    for (const term of terms) {
      if (text.includes(term)) {
        return canonical
      }
    }
  }

  return null
}

function findAllMatches(text, dictionary) {
  return Object.keys(dictionary).filter((canonical) =>
    dictionary[canonical].some((term) => text.includes(term)),
  )
}

// Brand aliases are short ('hp', 'rog'), so they need word boundaries: a plain
// substring check would read "programming" as the brand ROG.
function hasWord(text, term) {
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return new RegExp(`\\b${escaped}\\b`, 'i').test(text)
}

function extractPrice(text) {
  const range = text.match(RANGE_PRICE)
  if (range) {
    return { minPrice: toNumber(range[1]), maxPrice: toNumber(range[2]) }
  }

  const upper = text.match(UPPER_PRICE)
  if (upper) {
    return { minPrice: null, maxPrice: toNumber(upper[1]) }
  }

  const bare = text.match(BARE_PRICE)
  if (bare) {
    return { minPrice: null, maxPrice: toNumber(bare[1]) }
  }

  return { minPrice: null, maxPrice: null }
}

function extractBrand(text) {
  for (const [brand, terms] of Object.entries(BRAND_TERMS)) {
    if (terms.some((term) => hasWord(text, term))) {
      return brand
    }
  }

  return null
}

function extractCategory(text) {
  const found = findFirstMatch(text, CATEGORY_TERMS)
  return found && CATEGORIES.includes(found) ? found : null
}

/**
 * Extracts a structured shopping intent from natural language.
 *
 * @param {string} query Raw user sentence, e.g. "wireless headphones under 3000 for studying".
 * @returns {object} Structured intent. Always safe to pass to recommendProducts().
 */
export function extractIntent(query) {
  const text = normalise(query ?? '')
  const { minPrice, maxPrice } = extractPrice(text)
  const purpose = findAllMatches(text, PURPOSE_TERMS)
  const features = findAllMatches(text, FEATURE_TERMS)

  const intent = {
    query,
    source: 'rules',
    category: extractCategory(text),
    brand: extractBrand(text),
    minPrice,
    maxPrice,
    purpose,
    features,
  }

  const signals = [
    intent.category !== null,
    intent.brand !== null,
    intent.maxPrice !== null,
    intent.minPrice !== null,
    purpose.length > 0,
    features.length > 0,
  ].filter(Boolean).length

  return {
    ...intent,
    // No signals at all means we understood nothing; callers should say so
    // rather than silently returning the whole catalogue.
    understood: signals > 0,
    confidence: Math.round((signals / 4) * 100),
  }
}

export default extractIntent
