function CategoryFilter({ categories, active, onChange }) {
  return (
    <nav className="qc-chips" aria-label="Product categories">
      {categories.map((category) => {
        const isActive = category.key === active

        return (
          <button
            key={category.key}
            type="button"
            className={`qc-chip${isActive ? ' qc-chip--active' : ''}`}
            aria-pressed={isActive}
            onClick={() => onChange(category.key)}
          >
            {category.label}
          </button>
        )
      })}
    </nav>
  )
}

export default CategoryFilter
