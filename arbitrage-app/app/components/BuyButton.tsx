export function BuyButton({ href, label = 'Buy' }: { href?: string; label?: string }) {
  if (!href) return null
  return (
    <a className="btn btn-primary" href={href} target="_blank" rel="noopener noreferrer">
      <span className="material-symbols-outlined" style={{ fontSize: 18 }}>shopping_cart</span>
      {label}
    </a>
  )
}
