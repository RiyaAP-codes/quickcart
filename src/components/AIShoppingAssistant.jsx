import { useRef, useState } from 'react'
import { Bot, Send, Sparkles, X } from 'lucide-react'
import { PRODUCTS } from '../data/products'
import { extractIntent } from '../utils/intentExtractor'
import { recommendProducts, suggestAlternatives } from '../utils/recommendProducts'
import ProductCard from './ProductCard'

const SAMPLES = [
  'wireless headphones under 3000 for studying',
  'laptop for coding under 60000 with good battery life',
  'gaming mouse under 1000',
  'iphone under 500',
]

/** Drops empty fields so the displayed JSON shows only what was understood. */
function readableIntent(intent) {
  const view = {
    category: intent.category,
    brand: intent.brand,
    minPrice: intent.minPrice,
    maxPrice: intent.maxPrice,
    purpose: intent.purpose,
    features: intent.features,
    source: intent.source,
    confidence: `${intent.confidence}%`,
  }

  return Object.fromEntries(
    Object.entries(view).filter(
      ([, value]) => value !== null && !(Array.isArray(value) && value.length === 0),
    ),
  )
}

function AIShoppingAssistant({ onAddToCart, onClose }) {
  const [messages, setMessages] = useState([])
  const [draft, setDraft] = useState('')
  const lastId = useRef(0)

  function push(message) {
    lastId.current += 1
    setMessages((current) => [...current, { id: lastId.current, ...message }])
  }

  // The only place the user's sentence turns into results. Note that the
  // assistant never generates a product: it filters the real dataset.
  function runQuery(rawQuery) {
    const query = rawQuery.trim()

    if (query === '') {
      return
    }

    setDraft('')
    push({ role: 'user', text: query })

    const intent = extractIntent(query)

    if (!intent.understood) {
      push({
        role: 'assistant',
        kind: 'unclear',
        text: 'I could not find a product type, budget or purpose in that. Try naming a category (for example "headphones"), a budget ("under 3000") or a purpose ("for studying").',
      })
      return
    }

    const results = recommendProducts(PRODUCTS, intent, { limit: 4 })

    if (results.length === 0) {
      push({
        role: 'assistant',
        kind: 'no-match',
        intent,
        results,
        alternatives: suggestAlternatives(PRODUCTS, intent, { limit: 3 }),
      })
      return
    }

    push({ role: 'assistant', kind: 'results', intent, results })
  }

  function handleSubmit(event) {
    event.preventDefault()
    runQuery(draft)
  }

  return (
    <aside className="qc-assistant" aria-label="AI shopping assistant">
      <header className="qc-assistant__head">
        <span className="qc-assistant__avatar">
          <Bot size={18} aria-hidden="true" />
        </span>
        <div>
          <h2 className="qc-assistant__title">AI Shopping Assistant</h2>
          <p className="qc-assistant__sub">Describe what you need in plain English</p>
        </div>
        <button type="button" className="qc-icon-btn" onClick={onClose} aria-label="Close assistant">
          <X size={18} aria-hidden="true" />
        </button>
      </header>

      <div className="qc-assistant__log">
        {messages.length === 0 ? (
          <div className="qc-assistant__intro">
            <Sparkles size={22} aria-hidden="true" />
            <p>
              Tell me what you are looking for. I will extract the requirements, then search the
              real QuickCart catalogue.
            </p>
            <div className="qc-samples">
              {SAMPLES.map((sample) => (
                <button
                  key={sample}
                  type="button"
                  className="qc-sample"
                  onClick={() => runQuery(sample)}
                >
                  {sample}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {messages.map((message) => {
          if (message.role === 'user') {
            return (
              <div key={message.id} className="qc-msg qc-msg--user">
                {message.text}
              </div>
            )
          }

          return (
            <div key={message.id} className="qc-msg qc-msg--bot">
              {message.kind === 'unclear' ? <p>{message.text}</p> : null}

              {message.kind === 'results' ? (
                <>
                  <pre className="qc-intent">{JSON.stringify(readableIntent(message.intent), null, 2)}</pre>
                  <p className="qc-msg__lead">
                    {message.results.length} matching{' '}
                    {message.results.length === 1 ? 'product' : 'products'} found in the
                    catalogue.
                  </p>
                  <div className="qc-assistant__grid">
                    {message.results.map((result) => (
                      <ProductCard
                        key={result.product.id}
                        product={result.product}
                        match={result}
                        onAdd={onAddToCart}
                      />
                    ))}
                  </div>
                </>
              ) : null}

              {message.kind === 'no-match' ? (
                <>
                  <p className="qc-msg__headline">No matching products found.</p>
                  <p className="qc-msg__text">
                    Try increasing your budget or changing your requirements.
                  </p>
                  <pre className="qc-intent">{JSON.stringify(readableIntent(message.intent), null, 2)}</pre>
                  {message.alternatives.length > 0 ? (
                    <div className="qc-alts">
                      <p className="qc-alts__head">Closest items we actually stock:</p>
                      {message.alternatives.map((alternative) => (
                        <div key={alternative.product.id} className="qc-alt">
                          <div>
                            <p className="qc-alt__name">{alternative.product.name}</p>
                            <p className="qc-alt__note">{alternative.note}</p>
                          </div>
                          <button
                            type="button"
                            className="qc-btn qc-btn--ghost"
                            disabled={!alternative.product.inStock}
                            onClick={() => onAddToCart(alternative.product)}
                          >
                            Add
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </>
              ) : null}
            </div>
          )
        })}
      </div>

      <form className="qc-assistant__input" onSubmit={handleSubmit}>
        <input
          type="text"
          className="qc-assistant__field"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="e.g. wireless headphones under 3000 for studying"
          aria-label="Describe what you want to buy"
        />
        <button type="submit" className="qc-btn qc-btn--primary qc-assistant__send" aria-label="Send">
          <Send size={16} aria-hidden="true" />
        </button>
      </form>

      <p className="qc-assistant__disclaimer">
        Recommendations come only from the {PRODUCTS.length} products in the QuickCart catalogue.
        All prices are demo data.
      </p>
    </aside>
  )
}

export default AIShoppingAssistant
