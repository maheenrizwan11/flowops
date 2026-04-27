export function timeAgo(iso: string): string {
  const date = new Date(iso)
  const diff = (Date.now() - date.getTime()) / 1000
  const fmt = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' })
  if (diff < 60) return fmt.format(-Math.floor(diff), 'second')
  if (diff < 3600) return fmt.format(-Math.floor(diff / 60), 'minute')
  if (diff < 86400) return fmt.format(-Math.floor(diff / 3600), 'hour')
  if (diff < 86400 * 30) return fmt.format(-Math.floor(diff / 86400), 'day')
  return date.toLocaleDateString()
}