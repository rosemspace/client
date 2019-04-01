import { SourceSupportedType } from '@rosem/html-parser/HTMLParser'
import HookList from '@rosem/xml-parser/HookList'
import MatchRange from '@rosem/xml-parser/node/MatchRange'
import ParsedAttr from '@rosem/xml-parser/node/ParsedAttr'
import ParsedEndTag from '@rosem/xml-parser/node/ParsedEndTag'
import ParsedStartTag from '@rosem/xml-parser/node/ParsedStartTag'
import ParsedContent from '@rosem/xml-parser/node/ParsedContent'
import Renderer from '@rosem/virtual-dom/Renderer'

export default class TemplateRenderer<
  Node,
  ParentNode extends Node,
  DocumentFragment extends ParentNode,
  Element extends ParentNode,
  Text extends Node,
  Comment extends Node = Node,
  CDATASection extends Node = Node
> implements HookList {
  protected renderer: Renderer<
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
    renderer: Renderer<
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

  end(): void {}

  processingInstruction(parsedProcessingInstruction: ParsedContent): void {}

  declaration(declaration: ParsedContent): void {
    this.comment(declaration)
  }

  startTag(parsedTag: ParsedStartTag): void {
    const element: Element = parsedTag.namespaceURI
      ? this.renderer.createElementNS(parsedTag.namespaceURI, parsedTag.name)
      : this.renderer.createElement(parsedTag.name)

    parsedTag.attrs.forEach(
      (attr: ParsedAttr): void => {
        attr.namespaceURI
          ? this.renderer.setAttributeNS(
              element,
              attr.namespaceURI,
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
    this.renderer.appendChild(
      this.cursorNode,
      this.renderer.createCDATASection(parsedCDATASection.content)
    )
  }

  warn(message: string, matchRange: MatchRange): void {
    console.warn(message, matchRange)
  }
}
