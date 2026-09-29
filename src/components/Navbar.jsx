import { ShoppingCart } from 'lucide-react'
import SearchBar from './SearchBar'

function Navbar({ cartCount, query, onQueryChange }) {
  return (
    <header className="qc-navbar">
      <div className="qc-navbar__inner">
        <a className="qc-brand" href="#top">
          <span className="qc-brand__mark">
            <ShoppingCart size={18} aria-hidden="true" />
          </span>
          <span className="qc-brand__name">QuickCart</span>
        </a>

        <div className="qc-navbar__search">
          <SearchBar value={query} onChange={onQueryChange} />
        </div>

        <button type="button" className="qc-cart-btn" aria-label={`Cart with ${cartCount} items`}>
          <ShoppingCart size={19} aria-hidden="true" />
          <span className="qc-cart-btn__label">Cart</span>
          <span className="qc-cart-btn__count">{cartCount}</span>
        </button>
      </div>
    </header>
  )
}

export default Navbar
