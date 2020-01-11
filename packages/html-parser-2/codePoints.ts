import { Opaque } from 'type-fest'

export type CharSequence = Opaque<string>

export function startsWithCharSequence(
  charSequence: CharSequence,
  source: string
): boolean {
  return new RegExp(`^[${charSequence}]+`, 'u').test(source)
}

// HTML Entity (decimal) - &#65533;
// HTML Entity (hex)     - &#xfffd;
// UTF-8 (hex)           - \xEF\xBF\xBD
// UTF-16 (hex)          - \uFFFD
export const replacementChar = '\uFFFD'

// https://infra.spec.whatwg.org/#code-points
// Legend:
// seq - sequence
// exc - exclude
export const startsWithSurrogateSeqRegExp = /^[\uD800-\uDFFF]+/u

export const startsWithScalarValueSeqRegExp = /^[^\uD800-\uDFFF]+/u

export const startsWithNonCharSeqRegExp = /^[\uFDD0-\uFDEF\uFFFE\uFFFF\u{1FFFE}\u{1FFFF}\u{2FFFE}\u{2FFFF}\u{3FFFE}\u{3FFFF}\u{4FFFE}\u{4FFFF}\u{5FFFE}\u{5FFFF}\u{6FFFE}\u{6FFFF}\u{7FFFE}\u{7FFFF}\u{8FFFE}\u{8FFFF}\u{9FFFE}\u{9FFFF}\u{AFFFE}\u{AFFFF}\u{BFFFE}\u{BFFFF}\u{CFFFE}\u{CFFFF}\u{DFFFE}\u{DFFFF}\u{EFFFE}\u{EFFFF}\u{FFFFE}\u{FFFFF}\u{10FFFE}\u{10FFFF}]+/u

// Newline can be one of
// - Carriage Return (CR, \r, on older Macs)
// - Line Feed (LF, \n, on Unices incl. Linux)
// - CR followed by LF (\r\n, on WinDOS)
export const asciiNewLineSeq = `\\r?\\n|\\r` as CharSequence

export const asciiTabOrNewLineSeq = `\\t|${asciiNewLineSeq}` as CharSequence

// eslint-disable-next-line no-control-regex
export const startsWithControlCharExcSpaceAndNullSeqRegExp = /^[\x01-\x08\x0B\x0E-\x1F\x7F-\x9F]+/u
