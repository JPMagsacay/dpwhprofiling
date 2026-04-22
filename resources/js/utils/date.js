/**
 * Format a date value for HTML date input (YYYY-MM-DD)
 * @param {string|Date|null} val
 * @returns {string}
 */
export function toInputDate(val) {
  if (!val) return ''
  return String(val).slice(0, 10)
}

/**
 * Calculate working days between two dates (excluding weekends)
 * @param {string|Date} start
 * @param {string|Date} end
 * @returns {number}
 */
export function calculateWorkingDays(start, end) {
  const startDate = new Date(start)
  const endDate = new Date(end)
  let workingDays = 0

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dayOfWeek = d.getDay()
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      // 0 = Sunday, 6 = Saturday
      workingDays++
    }
  }

  return workingDays
}

/**
 * Format a date for display
 * @param {string|Date|null} date
 * @param {object} options
 * @returns {string}
 */
export function formatDate(date, options = {}) {
  if (!date) return '-'
  const d = new Date(date)
  if (isNaN(d.getTime())) return '-'

  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  }
  return d.toLocaleDateString('en-US', defaultOptions)
}

/**
 * Get relative time (e.g., "2 days ago")
 * @param {string|Date} date
 * @returns {string}
 */
export function getRelativeTime(date) {
  const d = new Date(date)
  const now = new Date()
  const diffInDays = Math.floor((now - d) / (1000 * 60 * 60 * 24))

  if (diffInDays === 0) return 'Today'
  if (diffInDays === 1) return 'Yesterday'
  if (diffInDays < 7) return `${diffInDays} days ago`
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`
  return formatDate(date)
}
