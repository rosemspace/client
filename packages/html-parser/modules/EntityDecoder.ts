import { VAttr, VText } from '../ast'
import { HTMLParserEventMap } from '../HTMLParser'
import Tokenizer, { Module } from '../Tokenizer'
import { decodeBaseEntities } from '../utils/xml/baseEntities'

export default class EntityDecoder<T extends HTMLParserEventMap>
  implements Module<T> {
  private readonly decode: (value: string) => string

  constructor(decode: (value: string) => string = decodeBaseEntities) {
    this.decode = decode
  }

  register(tokenizer: Tokenizer<T>): void {
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
