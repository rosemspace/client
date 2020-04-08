//https://dev.w3.org/html5/html-author/
import {
  asciiAlphanumericSeq,
  asciiDigitSeq,
  asciiHexDigitSeq
} from '../infra/codePoints'

export * from './element'
export * from './attr'
export * from './mimeTypes'

// <foreignObject>
export const foreignElementRegExp = /^foreignObject$/i

export const charRefRegExp = new RegExp(
  `&(?:[${asciiAlphanumericSeq}]+|#(?:[${asciiDigitSeq}]+|[xX][${asciiHexDigitSeq}]+))`
)
