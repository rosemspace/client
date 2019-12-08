import {
  EndTagParser,
  HTMLParserHooks,
  Module,
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
    // this.addMarkupParser(this.textParser)

    if (options.generateAttributeMap) {
      this.addModule(new AttrMapGenerator(options))
    }

    // this.options = options
    this.addModule(new ElementIntegrity(this))
  }

  parseFromString(
    source: string,
    hooks: Module<T | HTMLParserHooks> = {
      // todo: remove
      onStartTag: console.log,
      onText: console.log,
      onEndTag: console.log,
      error: console.warn,
    },
    type: SourceSupportedType = 'text/html'
  ): HTMLParser<T> {
    if (!source) {
      return this
    }

    this.tokenParsers.push(this.textParser)
    this.modules.push(hooks)
    this.start(source, type)

    for (const node of this.token()) {
      // console.log(node)
    }

    this.end()
    this.tokenParsers.pop()
    this.modules.pop()

    return this
  }

  addMarkupParser(tokenParser: TokenParser<Token, T>): void {
    this.tokenParsers.unshift(tokenParser)
    this.textParser.addNonTextTokenIdentifier(tokenParser)
  }

  addModule(module: Module<T | HTMLParserHooks>): void {
    this.modules.push(module)
  }

  start(source: string, type: SourceSupportedType = 'text/html'): void {
    // todo set type in DoctypePlugin
    super.start(source)
  }
}
