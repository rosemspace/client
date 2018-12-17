export default function trimStartNewlines(str: string): string {
  return str.replace(/^[\r\n]+/, '')
}
