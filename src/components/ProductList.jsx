import ProductCard from './ProductCard'

function ProductList({ products, onAdd, emptyMessage }) {
  if (products.length === 0) {
    return (
      <div className="qc-empty">
        <p className="qc-empty__title">{emptyMessage}</p>
        <p className="qc-empty__hint">Try increasing your budget or clearing filters.</p>
      </div>
    )
  }

  return (
    <div className="qc-grid">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} onAdd={onAdd} />
      ))}
    </div>
  )
}

export default ProductList
