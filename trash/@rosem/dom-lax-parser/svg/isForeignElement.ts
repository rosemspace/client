export default function isForeignElement(tag: string): boolean {
  return /^foreignObject$/i.test(tag)
}
