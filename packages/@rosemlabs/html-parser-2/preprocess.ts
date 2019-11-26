// seq - sequence
// RE - RegExp
export const startsWithSurrogateCharSeqRE: RegExp = /^[\uD800-\uDFFF]+/u

export const startsWithNonCharSeqRE: RegExp = /^[\uFDD0-\uFDEF\uFFFE\uFFFF\u{1FFFE}\u{1FFFF}\u{2FFFE}\u{2FFFF}\u{3FFFE}\u{3FFFF}\u{4FFFE}\u{4FFFF}\u{5FFFE}\u{5FFFF}\u{6FFFE}\u{6FFFF}\u{7FFFE}\u{7FFFF}\u{8FFFE}\u{8FFFF}\u{9FFFE}\u{9FFFF}\u{AFFFE}\u{AFFFF}\u{BFFFE}\u{BFFFF}\u{CFFFE}\u{CFFFF}\u{DFFFE}\u{DFFFF}\u{EFFFE}\u{EFFFF}\u{FFFFE}\u{FFFFF}\u{10FFFE}\u{10FFFF}]+/u

export const startsWithControlCharExcSpaceAndNullSeqRE: RegExp = /^[\x01-\x08\x0B\x0E-\x1F\x7F-\x9F]+/u
