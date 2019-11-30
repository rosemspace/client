export function isExisty(value) {
  return value != null;
}

export function isNotExisty(value) {
  return value === null || value === undefined;
}

/**
 * Check if value is primitive.
 */
export function isPrimitive(value) {
  return (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'symbol' ||
    typeof value === 'boolean'
  )
}
