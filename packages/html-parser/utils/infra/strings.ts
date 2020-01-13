// https://infra.spec.whatwg.org/#strings

import {
  asciiWhitespaceRegExp,
  endsWithASCIIWhitespaceRegExp,
  startsWithASCIIWhitespaceRegExp,
} from './codePoints'

// https://infra.spec.whatwg.org/#strip-newlines
export function stripNewlines(source: string): string {
  return source.replace(/[\n\r]/, '')
}

// https://infra.spec.whatwg.org/#normalize-newlines
export function normalizeNewlines(source: string): string {
  return source.replace(/\r\n?/, `\n`)
}

// https://infra.spec.whatwg.org/#strip-leading-and-trailing-ascii-whitespace
export function trimASCIIWhitespace(source: string): string {
  return source
    .replace(startsWithASCIIWhitespaceRegExp, '')
    .replace(endsWithASCIIWhitespaceRegExp, '')
}

// https://infra.spec.whatwg.org/#strip-and-collapse-ascii-whitespace
export function collapseASCIIWhitespace(source: string): string {
  return trimASCIIWhitespace(source.replace(asciiWhitespaceRegExp, ' '))
}
