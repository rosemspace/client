export default interface OperationListInterface<
  Node,
  Element extends Node = Node,
  Text extends Node = Node,
  Comment extends Node = Node,
  CDATASection extends Node = Node
> {
  createElement(qualifiedName: any): Element

  createElementNS(namespaceURI: string, qualifiedName: string): Element

  createText(text: string): Text

  createComment(comment: string): Comment

  createCDATASection(cdata: string): CDATASection

  setAttribute(element: Element, qualifiedName: string, value: any): void

  setAttributeNS(
    element: Element,
    namespaceURI: string,
    qualifiedName: string,
    value: any
  ): void

  setTextContent(node: Node, text: string): void

  insertBefore(parentNode: Node, childNode: Node, referenceNode: Node): void

  appendChild(parentNode: Node, childNode: Node): void

  removeChild(parentNode: Node, childNode: Node): void

  parentNode(node: Node): Node | null

  nextSibling(node: Node): Node | null

  tagName(node: Element): string
}
