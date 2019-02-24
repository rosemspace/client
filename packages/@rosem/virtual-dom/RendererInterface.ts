export default interface RendererInterface<
  Node,
  Element extends Node = Node,
  Text extends Node = Node,
  Comment extends Node = Node,
  CDATASection extends Node = Node,
  Instance = Node | Element | Comment | CDATASection
> {
  createElement(qualifiedName: any): Element

  createElementNS(namespace: string, qualifiedName: string): Element

  createText(text: string): Text

  createComment(comment: string): Comment

  createCDATASection(cdata: string): CDATASection

  setAttribute(element: Element, qualifiedName: string, value: any): void

  setAttributeNS(
    element: Element,
    namespace: string,
    qualifiedName: string,
    value: any
  ): void

  setTextContent(instance: Instance, text: string): void

  insertBefore(
    parentElement: Element,
    childInstance: Instance,
    referenceInstance: Instance
  ): void

  appendChild(parentElement: Element, childInstance: Instance): void

  removeChild(parentElement: Element, childInstance: Instance): void

  parentElement(node: Node): Element | null

  nextSibling(node: Node): Instance | null

  tagName(element: Element): string
}
