export default function isForeignElement(tag: string): boolean {
  return /^math|svg$/i.test(tag)
}
