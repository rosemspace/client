import no from '@rosem-util/common/no'
import { SourceSupportedType } from '@rosem/html-parser/typeMap'
import WarningData from '@rosem/xml-parser/WarningData'
import HookList from '@rosem/xml-parser/HookList'
import ParsedAttr from '@rosem/xml-parser/node/ParsedAttr'
import ParsedEndTag from '@rosem/xml-parser/node/ParsedEndTag'
import ParsedStartTag from '@rosem/xml-parser/node/ParsedStartTag'
import ParsedContent from '@rosem/xml-parser/node/ParsedContent'
import ManipulatorInterface from '@rosem/virtual-dom/ManipulatorInterface'

export default class TemplateCompiler<
  Node,
  ParentNode extends Node,
  DocumentFragment extends ParentNode,
  Element extends ParentNode,
  Text extends Node,
  Comment extends Node = Node,
  CDATASection extends Node = Node
> implements HookList {
  protected renderer: ManipulatorInterface<
    Node,
    ParentNode,
    DocumentFragment,
    Element,
    Text,
    Comment,
    CDATASection
  >
  private type!: SourceSupportedType
  protected rootNode!: DocumentFragment
  protected cursorNode!: ParentNode

  constructor(
    renderer: ManipulatorInterface<
      Node,
      ParentNode,
      DocumentFragment,
      Element,
      Text,
      Comment,
      CDATASection
    >
  ) {
    this.renderer = renderer
  }

  getCompiledResult(): DocumentFragment {
    return this.rootNode
  }

  start(type: SourceSupportedType) {
    this.type = type
    this.rootNode = this.cursorNode = this.renderer.createDocumentFragment()
  }

  end: () => void = no

  processingInstruction: (parsedProcessingInstruction: ParsedContent) => void  = no

  startTag(parsedTag: ParsedStartTag): void {
    const element: Element = parsedTag.namespace
      ? this.renderer.createElementNS(parsedTag.namespace, parsedTag.name)
      : this.renderer.createElement(parsedTag.name)

    parsedTag.attrs.forEach(
      (attr: ParsedAttr): void => {
        attr.namespace
          ? this.renderer.setAttributeNS(
              element,
              attr.namespace,
              attr.name,
              attr.value
            )
          : this.renderer.setAttribute(element, attr.name, attr.value)
      }
    )

    this.renderer.appendChild(this.cursorNode, element)

    if (!parsedTag.void) {
      this.cursorNode = element
    }
  }

  endTag(parsedEndTag: ParsedEndTag): void {
    this.cursorNode = this.renderer.parent(this.cursorNode) || this.cursorNode
  }

  text(parsedText: ParsedContent): void {
    this.renderer.appendChild(
      this.cursorNode,
      this.renderer.createText(parsedText.content)
    )
  }

  comment(parsedComment: ParsedContent): void {
    this.renderer.appendChild(
      this.cursorNode,
      this.renderer.createComment(parsedComment.content)
    )
  }

  cDataSection(parsedCDATASection: ParsedContent): void {
    this.type.includes('html')
      ? this.text(parsedCDATASection)
      : this.renderer.appendChild(
          this.cursorNode,
          this.renderer.createCDATASection(parsedCDATASection.content)
        )
  }

  warn(message: string, data: WarningData): void {
    console.warn(message, data)
  }
}
