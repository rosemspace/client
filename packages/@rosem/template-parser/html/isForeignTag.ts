export default function isForeignTag(tag: string): boolean {
  return /^svg|math|xml$/i.test(tag)
}
