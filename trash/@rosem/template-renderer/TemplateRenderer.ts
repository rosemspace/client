import { HookList } from '@rosem/xml-parser'
import {
  MatchRange,
  Attr,
  EndTag,
  StartTag,
  Content,
} from '@rosem/xml-parser/node'
import { RendererAPI } from '@rosem/dom-api'

export default class TemplateRenderer<
  Node,
  ParentNode extends Node,
  DocumentFragment extends ParentNode,
  Element extends ParentNode,
  Text extends Node,
  Comment extends Node = Node,
  CDATASection extends Node = Node
> implements HookList {
  protected renderer: RendererAPI<
    Node,
    ParentNode,
    DocumentFragment,
    Element,
    Text,
    Comment,
    CDATASection
  >
  private type!: string
  protected rootNode: DocumentFragment
  protected cursorNode!: ParentNode
  protected element!: Element

  constructor(
    renderer: RendererAPI<
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
    this.rootNode = this.renderer.createDocumentFragment()
  }

  getCompiledResult(): DocumentFragment {
    return this.rootNode
  }

  start(type: string) {
    this.type = type
    this.cursorNode = this.rootNode = this.renderer.createDocumentFragment()
  }

  end(): void {}

  processingInstruction(parsedProcessingInstruction: Content): void {
    // Ignore
  }

  declaration(declaration: Content): void {
    this.comment(declaration)
  }

  startTag(parsedTag: StartTag): void {
    this.element = null != parsedTag.namespaceURI
      ? this.renderer.createElementNS(parsedTag.namespaceURI, parsedTag.name)
      : this.renderer.createElement(parsedTag.name)

    this.renderer.appendChild(this.cursorNode, this.element)

    if (!parsedTag.void) {
      this.cursorNode = this.element
    }
  }

  attribute<T extends Attr>(attr: T): void {
    null != attr.namespaceURI
      ? this.renderer.setAttributeNS(
          this.element,
          attr.namespaceURI,
          attr.name,
          attr.value
        )
      : this.renderer.setAttribute(this.element, attr.name, attr.value)
  }

  endTag(parsedEndTag: EndTag): void {
    this.cursorNode = this.renderer.parent(this.cursorNode) || this.cursorNode
  }

  text(parsedText: Content): void {
    this.renderer.appendChild(
      this.cursorNode,
      this.renderer.createText(parsedText.content)
    )
  }

  comment(parsedComment: Content): void {
    this.renderer.appendChild(
      this.cursorNode,
      this.renderer.createComment(parsedComment.content)
    )
  }

  cDataSection(parsedCDATASection: Content): void {
    this.renderer.appendChild(
      this.cursorNode,
      this.renderer.createCDATASection(parsedCDATASection.content)
    )
  }

  warn(message: string, matchRange: MatchRange): void {
    console.warn(message, matchRange)
  }
}
