import { VAttr, VText } from '../ast'
import { decodeBaseEntities } from '../baseEntities'
import { HTMLParserEventMap } from '../HTMLParser'
import Tokenizer, { Module } from '../Tokenizer'

export default class EntityDecoder implements Module<HTMLParserEventMap> {
  private readonly decode: (value: string) => string

  constructor(decode: (value: string) => string = decodeBaseEntities) {
    this.decode = decode
  }

  register(tokenizer: Tokenizer<HTMLParserEventMap>): void {
    tokenizer.on('attribute', this.onAttribute.bind(this))
    tokenizer.on('text', this.onText.bind(this))
  }

  onAttribute<T extends VAttr>(attr: T): void {
    attr.value = this.decode(attr.value)
  }

  onText<T extends VText>(text: T): void {
    text.data = this.decode(text.data)
  }
}
