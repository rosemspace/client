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
import { normalizeNewLines } from './preprocess'
import { TokenParser } from './Token'
import Tokenizer, { TokenizerEventMap } from './Tokenizer'

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
  HTMLParserEventMap
> {
  private readonly textParser: TextParser

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
    this.on('start', normalizeNewLines)
  }

  parseFromString(
    source: string
    // hooks: Module<T | HTMLParserEventMap, U> = {
    //   // todo: remove
    //   onStartTag: console.log,
    //   onText: console.log,
    //   onEndTag: console.log,
    //   onError: console.warn,
    // },
    // type: SourceSupportedType = 'text/html'
  ): HTMLParser<T> {
    if (!source) {
      return this
    }

    // this.tokenParsers.push(this.textParser)
    // this.modules.push(hooks)
    this.emit('start', source) //, type)

    for (const node of this.token()) {
      console.log(node)
    }

    this.emit('end', undefined)
    // this.tokenParsers.pop()
    // this.modules.pop()

    return this
  }

  addTokenParser(tokenParser: TokenParser<HTMLParserEventMap>): void {
    this.tokenParsers.unshift(tokenParser)
    this.textParser.addNonTextTokenIdentifier(tokenParser)
  }

  // start(source: string, type: SourceSupportedType = 'text/html'): void {
  //   // todo set type in DoctypePlugin
  //   super.start(source)
  // }
}
