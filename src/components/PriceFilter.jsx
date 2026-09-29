import { SlidersHorizontal } from 'lucide-react'

const inr = new Intl.NumberFormat('en-IN')

function PriceFilter({ value, onChange, min, max }) {
  return (
    <div className="qc-price">
      <label className="qc-price__label" htmlFor="qc-price-range">
        <SlidersHorizontal size={15} aria-hidden="true" />
        <span>Max price</span>
        <strong>₹{inr.format(value)}</strong>
      </label>
      <input
        id="qc-price-range"
        className="qc-price__range"
        type="range"
        min={min}
        max={max}
        step={1000}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </div>
  )
}

export default PriceFilter
