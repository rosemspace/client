export default function isRawTextElement(tag: string): boolean {
  return /^s(?:cript|tyle)$/i.test(tag)
}
