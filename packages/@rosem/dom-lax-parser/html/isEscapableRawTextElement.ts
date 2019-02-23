export default function isEscapableRawTextElement(tag: string): boolean {
  return /^t(?:extarea|itle)$/i.test(tag)
}
