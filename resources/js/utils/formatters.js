/**
 * Format a number as Philippine Peso currency
 * @param {number|string} amount
 * @returns {string}
 */
export function formatCurrency(amount) {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  if (isNaN(num) || num === null || num === undefined) return '-'

  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
  }).format(num)
}

/**
 * Format a number with commas
 * @param {number|string} num
 * @returns {string}
 */
export function formatNumber(num) {
  const n = typeof num === 'string' ? parseFloat(num) : num
  if (isNaN(n) || n === null || n === undefined) return '-'
  return new Intl.NumberFormat('en-PH').format(n)
}

/**
 * Truncate text with ellipsis
 * @param {string} text
 * @param {number} maxLength
 * @returns {string}
 */
export function truncate(text, maxLength = 50) {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - 3) + '...'
}

/**
 * Get initials from a name
 * @param {string} name
 * @param {number} maxInitials
 * @returns {string}
 */
export function getInitials(name, maxInitials = 2) {
  if (!name) return '?'
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, maxInitials)
    .map((p) => p[0]?.toUpperCase())
    .join('')
}
