const decodingMap: { [code: string]: string } = {
  '&apos;': "'", // &39;
  '&amp;': '&', // &38;
  '&lt;': '<', // &#60;
  '&gt;': '>', // &#62;
  '&quot;': '"', // &34;
  '&#9;': '\t',
  '&#10;': '\n',
  '&#34;': '"', // &quot;
  '&#38;': '&', // &amp;
  '&#39;': "'", // &apos;
  '&#60;': '<', // &lt;
  '&#62;': '>', // &gt;
}
const encodedAttr = /&(?:a(?:pos|mp)|(?:[lg]|quo)?t|#(?:3[489]|6[02]));/g
const encodedAttrWithNewLines = /&(?:a(?:pos|mp)|(?:[lg]|quo)?t|#(?:9|10|3[489]|6[02]));/g

export default function decodeAttribute(
  value: string,
  shouldDecodeNewlines: boolean = false
): string {
  return value.replace(
    shouldDecodeNewlines ? encodedAttrWithNewLines : encodedAttr,
    (match) => decodingMap[match]
  )
}
