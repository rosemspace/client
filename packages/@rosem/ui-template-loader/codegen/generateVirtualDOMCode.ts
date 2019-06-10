import { NodeType } from '@rosem/dom-api'
import HTMLParser from '@rosem/html-parser/HTMLParser'
import BlankModule from '@rosem/xml-parser/BlankModule'
import { Attr, Content, EndTag, StartTag } from '@rosem/xml-parser/nodes'

class VirtualDOMCodeGenerator extends BlankModule {
  protected code: string = ''
  protected depthCode: string = ''
  protected pad: string = ''
  protected depthLevel: number = 0
  protected void: boolean = false

  attribute<T extends Attr, U extends StartTag>(attr: T, startTag: U): void {
    this.code += `${JSON.stringify(attr.name)}: ${JSON.stringify(attr.value)},`
  }

  cDataSection<T extends Content>(cDATASection: T): void {}

  comment<T extends Content>(comment: T): void {}

  end(): void {
    this.code += `\n${this.pad.slice(2)}])`
  }

  endTag<T extends EndTag>(endTag: T): void {
    this.pad = this.pad.slice(2)

    if (this.depthLevel) {
      this.code += `\n${this.pad}]`
    } else {
      this.code += '} }'
    }

    this.code += '),'
    this.depthCode = ''

    if (this.void) {
      this.void = false
    } else {
      --this.depthLevel
    }
  }

  start(type: string): void {
    this.code = `h(${NodeType.DOCUMENT_FRAGMENT_NODE}, [`
    this.pad = '  '
  }

  startTag<T extends StartTag>(startTag: T): void {
    this.code += `${this.depthCode}\n${this.pad}h(${JSON.stringify(
      startTag.nameLowerCased
    )}, { attrs: {`
    this.pad += '  '
    this.depthCode = '} }, ['
    this.void = startTag.void

    if (!startTag.void) {
      ++this.depthLevel
    }
  }

  text<T extends Content>(text: T): void {
    this.code += `${this.depthCode}\n${this.pad}h(${
      NodeType.TEXT_NODE
    }, ${JSON.stringify(text.content)}),`
    this.depthCode = ''
  }

  getCode(): string {
    return this.code
  }
}

const htmlParser: HTMLParser = new HTMLParser()
const virtualDOMCodeGenerator: VirtualDOMCodeGenerator = new VirtualDOMCodeGenerator()

htmlParser.addModule(virtualDOMCodeGenerator)

export default function generateVirtualDOMCode(source: string): string {
  htmlParser.parseFromString(source)

  console.log(virtualDOMCodeGenerator.getCode())

  return virtualDOMCodeGenerator.getCode()
}
