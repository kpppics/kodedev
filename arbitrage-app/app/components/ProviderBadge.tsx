export function ProviderBadge({ provider }: { provider: string }) {
  const p = provider.toLowerCase()
  const color =
    p.includes('amazon') ? '#ff9900' :
    p.includes('ebay')   ? '#0064d2' :
    p.includes('mercari') ? '#ff5b49' :
    p.includes('vinted') ? '#09b1ba' :
    p.includes('poshmark') ? '#7a1b3c' :
    p.includes('depop')  ? '#ff1f41' :
    p.includes('walmart') ? '#0071ce' :
    p.includes('target') ? '#cc0000' :
    p.includes('argos')  ? '#e60019' :
    p.includes('tesco')  ? '#005eb8' :
    p.includes('boots')  ? '#003780' :
    p.includes('best buy') ? '#0046be' :
    p.includes('home depot') ? '#f96302' :
    '#475569'
  return (
    <span className="chip" style={{ background: `${color}20`, color }}>
      {provider}
    </span>
  )
}
