export default function trimEndMewlines(str: string): string {
  return str.replace(/[\r\n]+$/, '')
}
