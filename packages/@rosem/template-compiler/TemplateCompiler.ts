import { WarningData } from '@rosem/dom-lax-parser/DOMLaxParser'
import ModuleInterface from '@rosem/dom-lax-parser/ModuleInterface'
import ParsedAttribute from '@rosem/dom-lax-parser/ParsedAttribute'
import ParsedEndTag from '@rosem/dom-lax-parser/ParsedEndTag'
import ParsedStartTag from '@rosem/dom-lax-parser/ParsedStartTag'
import ParsedTextContent from '@rosem/dom-lax-parser/ParsedTextContent'
import ManipulatorInterface from '@rosem/virtual-dom/ManipulatorInterface'

export default class TemplateCompiler<
  Node,
  ParentNode extends Node,
  DocumentFragment extends ParentNode,
  Element extends ParentNode,
  Text extends Node,
  Comment extends Node = Node,
  CDATASection extends Node = Node
> implements ModuleInterface {
  protected renderer: ManipulatorInterface<
    Node,
    ParentNode,
    DocumentFragment,
    Element,
    Text,
    Comment,
    CDATASection
  >
  protected rootDocumentFragment: DocumentFragment
  protected cursorElement: ParentNode

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
    this.rootDocumentFragment = this.cursorElement = this.renderer.createDocumentFragment()
  }

  getCompiledResult(): DocumentFragment {
    return this.rootDocumentFragment
  }

  tagStart(parsedTag: ParsedStartTag): void {
    const element: Element = parsedTag.namespace
      ? this.renderer.createElementNS(parsedTag.namespace, parsedTag.name)
      : this.renderer.createElement(parsedTag.name)

    parsedTag.attrs.forEach(
      (attr: ParsedAttribute): void => {
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

    this.renderer.appendChild(this.cursorElement, element)

    if (!parsedTag.void) {
      this.cursorElement = element
    }
  }

  tagEnd(parsedEndTag: ParsedEndTag): void {
    this.cursorElement =
      this.renderer.parent(this.cursorElement) || this.cursorElement
  }

  text(parsedText: ParsedTextContent): void {
    this.renderer.appendChild(
      this.cursorElement,
      this.renderer.createText(parsedText.textContent)
    )
  }

  comment(parsedComment: ParsedTextContent): void {
    this.text(parsedComment)
  }

  cDataSection(parsedCDATASection: ParsedTextContent): void {
    this.text(parsedCDATASection)
  }

  warn(message: string, data: WarningData): void {
    console.warn(message, data)
  }
}
