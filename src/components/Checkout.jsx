import { useState } from 'react'
import { CheckCircle2, X } from 'lucide-react'

const inr = new Intl.NumberFormat('en-IN')

const EMPTY_FORM = { name: '', phone: '', address: '' }

function Checkout({ items, total, onPlaceOrder, onClose }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [placed, setPlaced] = useState(false)

  function updateField(field) {
    return (event) => {
      setForm((current) => ({ ...current, [field]: event.target.value }))
    }
  }

  function handleSubmit(event) {
    event.preventDefault()
    onPlaceOrder(form)
    setPlaced(true)
  }

  if (placed) {
    return (
      <div className="qc-overlay" role="presentation" onClick={onClose}>
        <div
          className="qc-modal qc-modal--success"
          role="dialog"
          aria-modal="true"
          aria-label="Order confirmed"
          onClick={(event) => event.stopPropagation()}
        >
          <CheckCircle2 size={40} className="qc-success__icon" aria-hidden="true" />
          <h2 className="qc-modal__title">Order placed</h2>
          <p className="qc-modal__text">
            Thanks, {form.name.trim() || 'shopper'}. This is a simulated order for the QuickCart
            demo — nothing was charged and no payment details were collected.
          </p>
          <p className="qc-modal__ref">Order total ₹{inr.format(total)}</p>
          <button type="button" className="qc-btn qc-btn--primary" onClick={onClose}>
            Continue shopping
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="qc-overlay" role="presentation" onClick={onClose}>
      <div
        className="qc-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Checkout"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="qc-modal__head">
          <h2 className="qc-modal__title">Checkout</h2>
          <button type="button" className="qc-icon-btn" onClick={onClose} aria-label="Close checkout">
            <X size={18} aria-hidden="true" />
          </button>
        </header>

        <ul className="qc-review">
          {items.map(({ product, qty }) => (
            <li key={product.id}>
              <span>
                {product.name} × {qty}
              </span>
              <strong>₹{inr.format(product.price * qty)}</strong>
            </li>
          ))}
        </ul>

        <form className="qc-form" onSubmit={handleSubmit}>
          <label className="qc-field">
            <span>Full name</span>
            <input
              type="text"
              value={form.name}
              onChange={updateField('name')}
              placeholder="Your name"
              required
            />
          </label>

          <label className="qc-field">
            <span>Phone number</span>
            <input
              type="tel"
              value={form.phone}
              onChange={updateField('phone')}
              placeholder="10-digit mobile number"
              pattern="[0-9]{10}"
              required
            />
          </label>

          <label className="qc-field">
            <span>Delivery address</span>
            <input
              type="text"
              value={form.address}
              onChange={updateField('address')}
              placeholder="Flat, street, city"
              required
            />
          </label>

          <div className="qc-total">
            <span>Order total</span>
            <strong>₹{inr.format(total)}</strong>
          </div>

          <button type="submit" className="qc-btn qc-btn--primary">
            Place order
          </button>
        </form>
      </div>
    </div>
  )
}

export default Checkout
