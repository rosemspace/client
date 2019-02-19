export default function isForeignTag(tag: string): boolean {
  return /^foreignObject$/i.test(tag)
}
