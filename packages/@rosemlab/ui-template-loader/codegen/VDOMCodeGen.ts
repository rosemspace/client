import { NodeType } from '@rosemlab/dom-api'
import { encodeAttrEntities } from '@rosemlab/xml-parser'
import BlankModule from '@rosemlab/xml-parser/BlankModule'
import { Attr, Content, EndTag, StartTag } from '@rosemlab/xml-parser/nodes'
import { isSyntaxAttr } from '../index'

const stringify = JSON.stringify

export default class VDOMCodeGen extends BlankModule {
  protected code: string = ''
  protected depthCode: string = ''
  protected pad: string = ''
  protected depthLevel: number = 0
  protected void: boolean = false
  protected variables: string[] = []

  attribute<T extends Attr>(attr: T): void {
    this.code += isSyntaxAttr(attr, 'bind')
      ? `${stringify(attr.localName)}: ${attr.value},`
      : `${stringify(attr.name)}: ${stringify(encodeAttrEntities(attr.value))},`
  }

  cDataSection<T extends Content>(cDATASection: T): void {}

  comment<T extends Content>(comment: T): void {
    this.code += `${this.depthCode}\n${this.pad}h(${
      NodeType.COMMENT_NODE
    }, ${stringify(comment.content)}),`
    this.depthCode = ''
  }

  end(): void {
    this.code += `\n${this.pad.slice(2)}])`
  }

  endTag<T extends EndTag>(endTag: T): void {
    this.pad = this.pad.slice(2)

    if (this.depthLevel) {
      this.code += `${this.depthCode}\n${this.pad}]`
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
    this.code += `${this.depthCode}\n${this.pad}h(${stringify(
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
    let content = ''
    //todo
    const expressionToken = '{{'
    if (text.content.startsWith(expressionToken)) {
      content = text.content.slice(
        expressionToken.length,
        -expressionToken.length
      )
    } else {
      content = stringify(text.content)
    }

    this.code += `${this.depthCode}\n${this.pad}h(${NodeType.TEXT_NODE}, ${content}),`
    this.depthCode = ''
  }

  getCode(): string {
    return this.code
  }
}
