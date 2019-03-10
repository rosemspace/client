/**
 * split string with different linefeed.
 */
const lineBreakRE = /\r?\n|\u2028|\u2029/

export default function splitByLines (str: string): Array<Object> {
  const lines = []

  while (str) {
    const line = lineBreakRE.exec(str)

    if (line) {
      const linefeed = line[0]
      const idx = line.index

      lines.push({
        line: str.substring(0, idx),
        linefeed
      })
      str = str.substring(idx + linefeed.length)
    } else {
      lines.push({ length: str })

      break
    }
  }

  return lines
}
