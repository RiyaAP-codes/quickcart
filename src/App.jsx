import { useMemo, useState } from 'react'
import AIShoppingAssistant from './components/AIShoppingAssistant'
import Cart from './components/Cart'
import CategoryFilter from './components/CategoryFilter'
import Checkout from './components/Checkout'
import Navbar from './components/Navbar'
import PriceFilter from './components/PriceFilter'
import ProductList from './components/ProductList'
import { CATEGORIES, PRODUCTS } from './data/products'
import './App.css'

// Rounded up so the slider's step (1000) lands exactly on the ceiling and every
// product is visible at the default position.
const PRICE_CEILING =
  Math.ceil(Math.max(...PRODUCTS.map((product) => product.price)) / 1000) * 1000

function matchesQuery(product, query) {
  const needle = query.trim().toLowerCase()

  if (needle === '') {
    return true
  }

  return (
    product.name.toLowerCase().includes(needle) ||
    product.brand.toLowerCase().includes(needle) ||
    product.category.includes(needle) ||
    product.features.some((feature) => feature.includes(needle)) ||
    product.purpose.some((purpose) => purpose.includes(needle))
  )
}

function App() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [maxPrice, setMaxPrice] = useState(PRICE_CEILING)
  const [cart, setCart] = useState([])
  const [cartOpen, setCartOpen] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [assistantOpen, setAssistantOpen] = useState(false)

  const visibleProducts = useMemo(
    () =>
      PRODUCTS.filter(
        (product) =>
          (category === 'all' || product.category === category) &&
          product.price <= maxPrice &&
          matchesQuery(product, query),
      ),
    [query, category, maxPrice],
  )

  // Resolves stored {id, qty} pairs back into real catalogue products.
  const cartItems = useMemo(
    () =>
      cart
        .map((item) => ({
          product: PRODUCTS.find((product) => product.id === item.id),
          qty: item.qty,
        }))
        .filter((item) => item.product !== undefined),
    [cart],
  )

  const cartCount = cartItems.reduce((sum, item) => sum + item.qty, 0)
  const cartTotal = cartItems.reduce((sum, item) => sum + item.product.price * item.qty, 0)

  function addToCart(product) {
    setCart((items) => {
      const alreadyInCart = items.find((item) => item.id === product.id)

      if (alreadyInCart) {
        return items.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item,
        )
      }

      return [...items, { id: product.id, qty: 1 }]
    })
  }

  function increaseQty(id) {
    setCart((items) =>
      items.map((item) => (item.id === id ? { ...item, qty: item.qty + 1 } : item)),
    )
  }

  function decreaseQty(id) {
    setCart((items) =>
      items
        .map((item) => (item.id === id ? { ...item, qty: item.qty - 1 } : item))
        .filter((item) => item.qty > 0),
    )
  }

  function removeFromCart(id) {
    setCart((items) => items.filter((item) => item.id !== id))
  }

  return (
    <div className="qc-app" id="top">
      <Navbar
        cartCount={cartCount}
        query={query}
        onQueryChange={setQuery}
        onCartClick={() => setCartOpen(true)}
        onOpenAssistant={() => setAssistantOpen((open) => !open)}
      />

      <main className="qc-main">
        <section className="qc-toolbar">
          <CategoryFilter
            categories={CATEGORIES}
            active={category}
            onChange={setCategory}
          />
          <PriceFilter
            value={maxPrice}
            onChange={setMaxPrice}
            min={0}
            max={PRICE_CEILING}
          />
        </section>

        <p className="qc-result-count">
          {visibleProducts.length} of {PRODUCTS.length} products
        </p>

        <ProductList
          products={visibleProducts}
          onAdd={addToCart}
          emptyMessage="No products match your filters."
        />
      </main>

      <footer className="qc-footer">
        <p>
          QuickCart — college mini-project demo. Products are demo data; no real payments are
          processed.
        </p>
      </footer>

      {cartOpen ? (
        <Cart
          items={cartItems}
          total={cartTotal}
          onIncrease={increaseQty}
          onDecrease={decreaseQty}
          onRemove={removeFromCart}
          onCheckout={() => {
            setCartOpen(false)
            setCheckoutOpen(true)
          }}
          onClose={() => setCartOpen(false)}
        />
      ) : null}

      {checkoutOpen ? (
        <Checkout
          items={cartItems}
          total={cartTotal}
          onPlaceOrder={() => setCart([])}
          onClose={() => setCheckoutOpen(false)}
        />
      ) : null}

      {assistantOpen ? (
        <AIShoppingAssistant
          onAddToCart={addToCart}
          onClose={() => setAssistantOpen(false)}
        />
      ) : null}
    </div>
  )
}

export default App
