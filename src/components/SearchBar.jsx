import { Search } from 'lucide-react'

function SearchBar({ value, onChange }) {
  return (
    <div className="qc-search">
      <Search size={16} className="qc-search__icon" aria-hidden="true" />
      <input
        type="search"
        className="qc-search__input"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search products, brands or features"
        aria-label="Search products"
      />
    </div>
  )
}

export default SearchBar
