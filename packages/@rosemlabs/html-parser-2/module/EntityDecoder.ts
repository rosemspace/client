import {
  Attr,
  decodeBaseEntities,
  HTMLParserHooks,
  Plugin,
  Text,
} from '../index'

export default class EntityDecoder implements Plugin<HTMLParserHooks> {
  private readonly decode: (value: string) => string

  constructor(decode: (value: string) => string = decodeBaseEntities) {
    this.decode = decode
  }

  onAttribute<T extends Attr>(attr: T): void {
    attr.value = this.decode(attr.value)
  }

  onText<T extends Text>(text: T): void {
    text.data = this.decode(text.data)
  }
}
