import {
  EndTagParser,
  HTMLParserHooks,
  Plugin,
  SourceSupportedType,
  StartTagParser,
  TextParser,
  Token,
  TokenParser,
} from './index'
import Tokenizer from './Tokenizer'
import {
  AttrMapGenerator,
  AttrMapGeneratorOptions,
  ElementIntegrity,
  EntityDecoder,
} from './module'

export type HTMLParserOptions = Partial<{
  decode: (value: string) => string
  generateAttributeMap: boolean
}> &
  AttrMapGeneratorOptions

export default class HTMLParser<T extends HTMLParserHooks> extends Tokenizer<
  T | HTMLParserHooks
> {
  private readonly textParser: TextParser
  // private readonly options: HTMLParserOptions

  constructor(options: HTMLParserOptions = {}) {
    super(
      [
        // todo: add other parsers
        new EndTagParser(),
        new StartTagParser(),
      ],
      [new EntityDecoder(options.decode)]
    )

    this.textParser = new TextParser(undefined, this.tokenParsers.slice())
    // this.addTokenParser(this.textParser)

    if (options.generateAttributeMap) {
      this.addPlugin(new AttrMapGenerator(options))
    }

    // this.options = options
    this.addPlugin(new ElementIntegrity(this))
  }

  parseFromString(
    source: string,
    hooks: Plugin<T | HTMLParserHooks> = {
      // todo: remove
      onStartTag: console.log,
      onText: console.log,
      onEndTag: console.log,
      warn: console.warn,
    },
    type: SourceSupportedType = 'text/html'
  ): HTMLParser<T> {
    if (!source) {
      return this
    }

    this.tokenParsers.push(this.textParser)
    this.plugins.push(hooks)
    this.start(source, type)

    for (const node of this.token()) {
      // console.log(node)
    }

    this.end()
    this.tokenParsers.pop()
    this.plugins.pop()

    return this
  }

  addTokenParser(tokenParser: TokenParser<Token, T>): void {
    this.tokenParsers.unshift(tokenParser)
    this.textParser.addNonTextTokenIdentifier(tokenParser)
  }

  addPlugin(plugin: Plugin<T | HTMLParserHooks>): void {
    this.plugins.push(plugin)
  }

  start(source: string, type: SourceSupportedType = 'text/html'): void {
    // todo set type in DoctypePlugin
    super.start(source)
  }
}
