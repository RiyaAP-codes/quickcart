import {
  Backpack,
  Check,
  GraduationCap,
  Headphones,
  Keyboard,
  Laptop,
  Mouse,
  Package,
  ShoppingCart,
  Smartphone,
  Star,
  Watch,
} from 'lucide-react'

// Product photos are demo data we do not control, so each card renders a
// category icon instead. Unknown categories fall back to Package.
const CATEGORY_ICONS = {
  headphones: Headphones,
  laptop: Laptop,
  smartphone: Smartphone,
  keyboard: Keyboard,
  mouse: Mouse,
  backpack: Backpack,
  smartwatch: Watch,
  accessory: GraduationCap,
}

const inr = new Intl.NumberFormat('en-IN')

function formatCount(count) {
  if (count < 1000) {
    return String(count)
  }

  return `${(count / 1000).toFixed(1)}k`
}

function ProductCard({ product, onAdd, match }) {
  const Icon = CATEGORY_ICONS[product.category] ?? Package

  return (
    <article className="qc-card">
      <div className="qc-card__thumb">
        <Icon size={40} aria-hidden="true" />
      </div>

      <div className="qc-card__body">
        {match ? (
          <p className="qc-match">
            <span className="qc-match__score">{match.score}% Match</span>
            <span className="qc-match__label">match score</span>
          </p>
        ) : null}

        <p className="qc-card__brand">{product.brand}</p>
        <h3 className="qc-card__title">{product.name}</h3>
        <p className="qc-card__rating">
          <Star size={14} className="qc-card__star" aria-hidden="true" />
          <span>{product.rating.toFixed(1)}</span>
          <span className="qc-card__reviews">({formatCount(product.reviewCount)})</span>
        </p>

        {match ? (
          <ul className="qc-reasons">
            {match.reasons.map((reason) => (
              <li key={reason} className="qc-reasons__item">
                <Check size={12} aria-hidden="true" />
                {reason}
              </li>
            ))}
            {match.notes.map((note) => (
              <li key={note} className="qc-reasons__item qc-reasons__item--note">
                {note}
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <div className="qc-card__foot">
        <span className="qc-card__price">₹{inr.format(product.price)}</span>
        {product.inStock ? null : <span className="qc-card__oos">Out of stock</span>}
      </div>

      <button
        type="button"
        className="qc-btn qc-btn--primary qc-card__add"
        disabled={!product.inStock}
        onClick={() => onAdd(product)}
      >
        <ShoppingCart size={16} aria-hidden="true" />
        Add to cart
      </button>
    </article>
  )
}

export default ProductCard
