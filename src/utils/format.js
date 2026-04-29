/**
 * Format a number as Indian Rupees (e.g. ₹1,23,456)
 * @param {number} amount
 * @returns {string}
 */
export const formatCurrency = (amount) =>
  '₹' + Number(amount).toLocaleString('en-IN')

/**
 * Format a number with Indian locale separators
 * @param {number} n
 * @returns {string}
 */
export const formatNumber = (n) => Number(n).toLocaleString('en-IN')

/**
 * Compact currency label: ₹1.2L, ₹45k, ₹999
 * @param {number} n
 * @returns {string}
 */
export const formatCompact = (n) => {
  if (n >= 100000) return '₹' + (n / 100000).toFixed(1) + 'L'
  if (n >= 1000)   return '₹' + (n / 1000).toFixed(0) + 'k'
  return '₹' + n
}

/**
 * Returns current datetime as 'YYYY-MM-DD HH:mm'
 * @returns {string}
 */
export const nowTimestamp = () =>
  new Date().toISOString().slice(0, 16).replace('T', ' ')

/**
 * Returns today's date as 'YYYY-MM-DD'
 * @returns {string}
 */
export const today = () => new Date().toISOString().slice(0, 10)

/**
 * Days between a date string and today (negative = expired)
 * @param {string} dateStr
 * @returns {number|null}
 */
export const daysUntil = (dateStr) => {
  if (!dateStr) return null
  return Math.ceil((new Date(dateStr) - new Date()) / 86400000)
}

/**
 * Auto-incrementing ID generator
 */
let _id = 2000
export const uid = () => ++_id
