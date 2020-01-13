function internalEscape(source: string, regExp: RegExp): string {
  const str = String(source)
  const match = regExp.exec(str)

  if (!match) {
    return str
  }

  let charRef: string
  let html = ''
  let index
  let lastIndex = 0

  for (index = match.index; index < str.length; ++index) {
    switch (str.charCodeAt(index)) {
      case 34: // "
        charRef = '&quot;'

        break
      case 38: // &
        charRef = '&amp;'

        break
      case 39: // '
        charRef = '&#39;'

        break
      case 60: // <
        charRef = '&lt;'

        break
      case 62: // >
        charRef = '&gt;'

        break
      case 160: // \u00A0
        charRef = '&nbsp;'

        break
      default:
        continue
    }

    if (lastIndex !== index) {
      html += str.substring(lastIndex, index)
    }

    lastIndex = index + 1
    html += charRef
  }

  return lastIndex !== index ? html + str.substring(lastIndex, index) : html
}

export default function escape(source: string): string {
  return internalEscape(source, /["'&<>\u00A0]/)
}

export function escapeText(source: string): string {
  return internalEscape(source, /[&<>\u00A0]/)
}

export function escapeAttributeValue(source: string): string {
  return internalEscape(source, /['"&\u00A0]/)
}
