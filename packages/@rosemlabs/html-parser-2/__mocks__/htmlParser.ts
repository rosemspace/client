import { ErrorCodes } from '../error'
import HTMLParser from '../HTMLParser'
import { ParseError } from '../Tokenizer'

const htmlParser = new HTMLParser()

export default htmlParser

export const data = (source: string): Iterable<number> =>
  Array.from(source, (char: string): number => char.charCodeAt(0))

export const parse = htmlParser.parseFromString.bind(htmlParser)

export const parseError = (source: string): ErrorCodes | undefined => {
  let result: ErrorCodes | undefined

  htmlParser.parseFromString(source, {
    error: (error: ParseError): void => {
      result = error.code
    },
  })

  return result
}
