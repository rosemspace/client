// https://infra.spec.whatwg.org/#strings

import {
  asciiWhitespaceRegExp,
  endsWithASCIIWhitespaceRegExp,
  startsWithASCIIWhitespaceRegExp,
} from './codePoints'

// https://infra.spec.whatwg.org/#strip-newlines
export function stripNewlines(source: string): string {
  return source.replace(/[\n\r]+/, '')
}

// Normalize from CRLF or CR to LF
// https://infra.spec.whatwg.org/#normalize-newlines
export function normalizeNewlines(source: string): string {
  // \r\r\n\r\n\n\r\r\n\r -> \r\n\n\n\r\n\r -> \n\n\n\n\n\n\n
  return source.replace(/\r\n?/, `\n`)
}

// https://infra.spec.whatwg.org/#strip-leading-and-trailing-ascii-whitespace
export function stripLeadingAndTrailingASCIIWhitespace(source: string): string {
  return source
    .replace(startsWithASCIIWhitespaceRegExp, '')
    .replace(endsWithASCIIWhitespaceRegExp, '')
}

// https://infra.spec.whatwg.org/#strip-and-collapse-ascii-whitespace
export function stripAndCollapseASCIIWhitespace(source: string): string {
  return stripLeadingAndTrailingASCIIWhitespace(
    source.replace(asciiWhitespaceRegExp, ' ')
  )
}
