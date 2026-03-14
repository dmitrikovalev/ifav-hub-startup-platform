export function fmt(n: number | null | undefined): string {
  if (n == null) return '—'
  if (n === 0) return '$0'
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
  return `$${n}`
}
