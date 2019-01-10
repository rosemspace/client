export default function trimNewlines(str: string): string {
  return str.replace(/^[\r\n]+|[\r\n]+$/, '')
}
