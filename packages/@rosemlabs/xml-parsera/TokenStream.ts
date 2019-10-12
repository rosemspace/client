import {
  APPLICATION_XML_MIME_TYPE,
  XML_NAMESPACE,
  XMLNS_NAMESPACE,
} from '@rosemlabs/w3-util'
import Reader from './Reader'
import XMLReader from './XMLReader'
import { Content, MatchRange, Element } from './nodes'
import { NamespaceMap, TypeMap } from './index'

type ReaderMap = { [mimeType: string]: Reader }

export type TokenStreamOptions = {
  suppressWarnings: boolean
}

export default class TokenStream {
  originalSource: string
  source: string
  options: TokenStreamOptions
  cursorPosition: number = 0
  nodeParserIndex: number = 0
  defaultNamespaceURI: string = XML_NAMESPACE
  typeMap: TypeMap = {
    xml: APPLICATION_XML_MIME_TYPE,
  }
  namespaceMap: NamespaceMap = {
    xml: XML_NAMESPACE,
    xmlns: XMLNS_NAMESPACE,
  }
  namespaceURI: string = XML_NAMESPACE
  readerMap: ReaderMap = {}
  activeReader: Reader
  warnings: Content[] = []

  readonly rootTagStack: Element[] = []
  readonly tagStack: Element[] = []

  constructor(
    source: string,
    options: TokenStreamOptions = { suppressWarnings: false },
    mimeType: string = APPLICATION_XML_MIME_TYPE,
    processorMap?: ReaderMap
  ) {
    this.originalSource = source
    this.source = source
    this.options = options

    if (processorMap) {
      this.readerMap = processorMap
    } else {
      this.readerMap[APPLICATION_XML_MIME_TYPE] = new XMLReader(this)
    }

    this.activeReader = this.readerMap[mimeType]
  }

  addType(tagName: string, mimeType: string): void {
    this.typeMap[tagName] = mimeType
  }

  addReader(associatedType: string, reader: Reader) {
    this.readerMap[associatedType] = reader
  }

  useReader(associatedType: string) {
    if (!(this.activeReader = this.readerMap[associatedType])) {
      throw new TypeError(
        `Cannot process foreign element of ${
          associatedType ? '"' + associatedType + '"' : 'unknown'
        } MIME type`
      )
    }
  }

  addNamespace(prefix: string, namespaceURI: string) {
    this.namespaceMap[prefix] = namespaceURI
  }

  warn(message: string, range: MatchRange) {
    if (!this.options.suppressWarnings) {
      this.warnings.push({
        content: message,
        start: this.cursorPosition,
        end: this.cursorPosition,
        ...range,
      })
    }
  }

  get rootNamespaceURI(): string {
    if (this.rootTagStack.length) {
      const rootTagNamespaceURI = this.rootTagStack[
      this.rootTagStack.length - 1
        ].namespaceURI

      if (null != rootTagNamespaceURI) {
        return rootTagNamespaceURI
      }
    }

    return this.defaultNamespaceURI
  }

  moveCursorPosition(n: number): number {
    this.source = this.source.slice(n)

    return (this.cursorPosition += n)
  }

  resetNodeParserPointer() {
    this.nodeParserIndex = -1
  }
}
