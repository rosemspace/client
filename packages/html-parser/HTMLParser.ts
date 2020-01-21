import { ErrorCode } from './errors'
import {
  AttrMapGenerator,
  AttrMapGeneratorOptions,
  ElementIntegrity,
  EntityDecoder,
} from './modules'
import {
  EndTagParser,
  EndTagParserEventMap,
  StartTagParser,
  StartTagParserEventMap,
  TextParser,
  TextParserEventMap,
} from './parsers'
import TokenParser from './parsers/TokenParser'
import Tokenizer, { TokenizerEventMap } from './Tokenizer'
import { normalizeNewlines } from './utils/infra/strings'

export type HTMLParserEventMap<
  T extends ErrorCode = ErrorCode
> = TextParserEventMap &
  StartTagParserEventMap &
  EndTagParserEventMap &
  TokenizerEventMap<T>

export type HTMLParserOptions = Partial<{
  decode: (value: string) => string
  generateAttributeMap: boolean
}> &
  AttrMapGeneratorOptions

export default class HTMLParser<T extends HTMLParserEventMap> extends Tokenizer<
  T
> {
  private readonly textParser: TextParser
  private tokens: T[keyof T][] = []

  constructor(private readonly options: HTMLParserOptions = {}) {
    super(
      [
        // todo: add other parsers
        new EndTagParser(),
        new StartTagParser(),
      ],
      [new EntityDecoder(options.decode)]
    )

    this.tokenParsers.push(
      (this.textParser = new TextParser(this.tokenParsers.slice()))
    )

    if (options.generateAttributeMap) {
      this.addModule(new AttrMapGenerator(options))
    }

    // Should go last as it copies the whole elements data, which may be added
    // by another modules
    this.addModule(new ElementIntegrity())
    this.on('start', this.reset.bind(this))
    // https://html.spec.whatwg.org/multipage/parsing.html#preprocessing-the-input-stream
    this.on('start', normalizeNewlines)
    this.on('error', console.warn)
  }

  async parseFromString(
    source: string
    // hooks: Module<T | HTMLParserEventMap, U> = {
    //   // todo: remove
    //   onStartTag: console.log,
    //   onText: console.log,
    //   onEndTag: console.log,
    //   onError: console.warn,
    // },
    // type: SourceSupportedType = 'text/html'
  ): Promise<HTMLParser<T>> {
    if (!source) {
      return this
    }

    // this.tokenParsers.push(this.textParser)
    // this.modules.push(hooks)
    this.emit('start', source) //, type)

    for await (const token of this.token()) {
      this.tokens.push(token)
      console.log(token)
    }

    this.emit('end', undefined)
    // this.tokenParsers.pop()
    // this.modules.pop()

    return this
  }

  parseFromStringSync(source: string): HTMLParser<T> {
    if (!source) {
      return this
    }

    this.emit('start', source) //, type)

    for (const token of this.token()) {
      this.tokens.push(token)
    }

    this.emit('end', undefined)

    return this
  }

  addTokenParser(tokenParser: TokenParser<T>): void {
    this.tokenParsers.unshift(tokenParser)
    this.textParser.addNonTextTokenIdentifier(tokenParser)
  }

  reset(source = ''): void {
    super.reset(source)

    this.tokens = []
  }

  // start(source: string, type: SourceSupportedType = 'text/html'): void {
  //   // todo set type in DoctypePlugin
  //   super.start(source)
  // }
}
