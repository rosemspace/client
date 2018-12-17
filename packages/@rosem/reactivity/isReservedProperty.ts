/**
 * Check if a string starts with $ or _
 */
export default function isReservedProperty(property: string): boolean {
  return /^[$_]/.test(property)
}
