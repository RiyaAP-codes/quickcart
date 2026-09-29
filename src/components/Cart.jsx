import { Minus, Plus, ShoppingCart, Trash2, X } from 'lucide-react'

const inr = new Intl.NumberFormat('en-IN')

function Cart({ items, total, onIncrease, onDecrease, onRemove, onCheckout, onClose }) {
  return (
    <div className="qc-overlay" role="presentation" onClick={onClose}>
      <aside
        className="qc-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="qc-drawer__head">
          <h2 className="qc-drawer__title">
            <ShoppingCart size={18} aria-hidden="true" />
            Your cart
          </h2>
          <button type="button" className="qc-icon-btn" onClick={onClose} aria-label="Close cart">
            <X size={18} aria-hidden="true" />
          </button>
        </header>

        {items.length === 0 ? (
          <div className="qc-drawer__empty">
            <ShoppingCart size={32} aria-hidden="true" />
            <p>Your cart is empty.</p>
            <p className="qc-empty__hint">Add a product to get started.</p>
          </div>
        ) : (
          <>
            <ul className="qc-lines">
              {items.map(({ product, qty }) => (
                <li key={product.id} className="qc-line">
                  <div className="qc-line__info">
                    <p className="qc-line__name">{product.name}</p>
                    <p className="qc-line__meta">
                      {product.brand} · ₹{inr.format(product.price)} each
                    </p>
                  </div>

                  <div className="qc-line__controls">
                    <div className="qc-stepper">
                      <button
                        type="button"
                        className="qc-stepper__btn"
                        onClick={() => onDecrease(product.id)}
                        aria-label={`Decrease quantity of ${product.name}`}
                      >
                        <Minus size={14} aria-hidden="true" />
                      </button>
                      <span className="qc-stepper__value">{qty}</span>
                      <button
                        type="button"
                        className="qc-stepper__btn"
                        onClick={() => onIncrease(product.id)}
                        aria-label={`Increase quantity of ${product.name}`}
                      >
                        <Plus size={14} aria-hidden="true" />
                      </button>
                    </div>
                    <span className="qc-line__total">
                      ₹{inr.format(product.price * qty)}
                    </span>
                    <button
                      type="button"
                      className="qc-icon-btn qc-icon-btn--danger"
                      onClick={() => onRemove(product.id)}
                      aria-label={`Remove ${product.name} from cart`}
                    >
                      <Trash2 size={16} aria-hidden="true" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <footer className="qc-drawer__foot">
              <div className="qc-total">
                <span>Cart total</span>
                <strong>₹{inr.format(total)}</strong>
              </div>
              <p className="qc-drawer__note">Demo checkout only — no real payment is taken.</p>
              <button type="button" className="qc-btn qc-btn--primary qc-drawer__checkout" onClick={onCheckout}>
                Proceed to checkout
              </button>
            </footer>
          </>
        )}
      </aside>
    </div>
  )
}

export default Cart
