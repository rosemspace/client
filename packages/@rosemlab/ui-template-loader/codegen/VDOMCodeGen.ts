import { NodeType } from '@rosemlab/dom-api'
import { encodeAttrEntities } from '@rosemlab/xml-parser'
import BlankModule from '@rosemlab/xml-parser/BlankModule'
import { Attr, Content, EndTag, StartTag } from '@rosemlab/xml-parser/nodes'
import { isSyntaxAttr } from '../index'

const stringify = JSON.stringify

export default class VDOMCodeGen extends BlankModule {
  protected code: string = 'const ns = "namespaceURI";return '
  protected namespaces: string[] = []
  protected depthCode: string = ''
  protected depthLevel: number = 0
  protected void: boolean = false
  protected variables: string[] = []

  attribute<T extends Attr>(attr: T): void {
    this.code += isSyntaxAttr(attr, 'bind')
      ? `${stringify(attr.localName)}:${attr.value},`
      : `${stringify(attr.name)}:${stringify(encodeAttrEntities(attr.value))},`
  }

  cDataSection<T extends Content>(cDATASection: T): void {}

  comment<T extends Content>(comment: T): void {
    this.code += `${this.depthCode}h(${NodeType.COMMENT_NODE}, ${stringify(
      comment.content
    )}),`
    this.depthCode = ''
  }

  end(): void {
    this.code += `]);`
  }

  endTag<T extends EndTag>(endTag: T): void {
    if (this.depthLevel) {
      this.code += `${this.depthCode}]`
    } else {
      this.code += '}}'
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
    this.code += `h(${NodeType.DOCUMENT_FRAGMENT_NODE},[`
  }

  startTag<T extends StartTag>(startTag: T): void {
    const namespaceURI: string | undefined = startTag.namespaceURI

    this.code += `${this.depthCode}h(${stringify(startTag.nameLowerCased)},{`

    if (namespaceURI) {
      const nsIndex = this.namespaces.indexOf(namespaceURI)

      if (-1 === nsIndex) {
        this.namespaces.push(namespaceURI)

        const nsVarName: string = `ns_${this.namespaces.length}`

        this.code = `const ${nsVarName}=${stringify(namespaceURI)};${this.code}`
        this.code += `[ns]:${nsVarName},`
      } else {
        this.code += `[ns]:ns_${nsIndex + 1},`
      }
    }

    this.code += `attrs:{`
    this.depthCode = '}},['
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

    this.code += `${this.depthCode}h(${NodeType.TEXT_NODE},${content}),`
    this.depthCode = ''
  }

  getCode(prettify: boolean = false): string {
    try {
      return prettify ? require('prettier').format(this.code) : this.code
    } catch {
      throw new Error(
        'You need "prettier" module to be installed to prettify generated ' +
          'javascript code of virtual DOM'
      )
    }
  }
}
