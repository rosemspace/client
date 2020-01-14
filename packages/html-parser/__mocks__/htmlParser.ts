import { ErrorCode } from '../errors'
import HTMLParser from '../HTMLParser'
import { ParseError } from '../Tokenizer'

const htmlParser = new HTMLParser()

export default htmlParser

export const data = (source: string): Iterable<number> =>
  Array.from(source, (char: string): number => char.charCodeAt(0))

export const parse = htmlParser.parseFromString.bind(htmlParser)

export function parseError(source: string): ErrorCode | undefined {
  let errorCode: ErrorCode | undefined = undefined

  htmlParser.on('error', (error: ParseError): void => {
    // console.log('ERRRRORRR' + error.code)
    errorCode = error.code
  })
  htmlParser.parseFromStringSync(source)

  return errorCode
}
