export default function isForeignTag(tag: string): boolean {
  return /^math|svg|xml$/i.test(tag)
}
