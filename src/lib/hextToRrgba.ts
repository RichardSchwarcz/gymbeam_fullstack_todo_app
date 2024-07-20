export function hexToRgba(hex: string, theme: string) {
  const alpha = theme === 'dark' ? 0.5 : 0.2
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)

  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}
