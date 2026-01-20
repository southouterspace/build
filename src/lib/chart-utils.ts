/**
 * Calculate a tight Y-axis domain for chart data
 * Returns [min, max] values that closely fit the data with minimal padding
 */
export function calculateYAxisDomain(
  rows: Record<string, string | number>[],
  valueColumns: string[],
  padding = 0.05
): [number, number] {
  // Extract all numeric values from the specified columns
  const values: number[] = []
  for (const row of rows) {
    for (const col of valueColumns) {
      const val = row[col]
      if (typeof val === 'number' && !isNaN(val)) {
        values.push(val)
      }
    }
  }

  if (values.length === 0) {
    return [0, 100]
  }

  const dataMin = Math.min(...values)
  const dataMax = Math.max(...values)

  // Handle edge case where all values are the same
  if (dataMin === dataMax) {
    if (dataMin === 0) {
      return [0, 100]
    }
    const magnitude = Math.abs(dataMin)
    return [dataMin - magnitude * 0.5, dataMax + magnitude * 0.5]
  }

  const range = dataMax - dataMin
  const paddingAmount = range * padding

  // Calculate raw bounds with padding
  let rawMin = dataMin - paddingAmount
  let rawMax = dataMax + paddingAmount

  // If data is all positive and min is close to zero, anchor at 0
  if (dataMin >= 0 && dataMin < range * 0.3) {
    rawMin = 0
  }

  // If data is all negative and max is close to zero, anchor at 0
  if (dataMax <= 0 && Math.abs(dataMax) < range * 0.3) {
    rawMax = 0
  }

  // Round to nice values
  const niceMin = niceFloor(rawMin)
  const niceMax = niceCeil(rawMax)

  return [niceMin, niceMax]
}

/**
 * Round down to a "nice" number (for axis minimum)
 */
function niceFloor(value: number): number {
  if (value === 0) return 0

  const isNegative = value < 0
  const absValue = Math.abs(value)

  // Find the order of magnitude
  const magnitude = Math.pow(10, Math.floor(Math.log10(absValue)))

  // Nice intervals within a magnitude
  const niceIntervals = [1, 2, 2.5, 5, 10]

  // Find the largest nice number <= absValue
  let niceValue = magnitude
  for (const interval of niceIntervals) {
    const candidate = magnitude * interval
    if (candidate <= absValue) {
      niceValue = candidate
    }
  }

  // For very small values, just round to reasonable precision
  if (absValue < 1) {
    niceValue = Math.floor(absValue * 100) / 100
  }

  return isNegative ? -niceCeil(absValue) : niceValue
}

/**
 * Round up to a "nice" number (for axis maximum)
 */
function niceCeil(value: number): number {
  if (value === 0) return 0

  const isNegative = value < 0
  const absValue = Math.abs(value)

  // Find the order of magnitude
  const magnitude = Math.pow(10, Math.floor(Math.log10(absValue)))

  // Nice intervals within a magnitude
  const niceIntervals = [1, 2, 2.5, 5, 10]

  // Find the smallest nice number >= absValue
  let niceValue = magnitude * 10
  for (let i = niceIntervals.length - 1; i >= 0; i--) {
    const candidate = magnitude * niceIntervals[i]
    if (candidate >= absValue) {
      niceValue = candidate
    }
  }

  // For very small values, just round to reasonable precision
  if (absValue < 1) {
    niceValue = Math.ceil(absValue * 100) / 100
  }

  return isNegative ? -niceFloor(absValue) : niceValue
}
