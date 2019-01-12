export default interface HostInterface<
  Node,
  Comment extends Node,
  Text extends Node,
  Element extends Node,
  NativeComponent extends Element = Element
> {
  createElement(tagName: any): NativeComponent

  createElementNS(namespaceURI: string, qualifiedName: string): Element

  createTextNode(text: string): Text

  createComment(text: string): Comment

  getChildNodes(element: Element): Iterable<Node>

  insertBefore(
    parentNode: Node,
    newNode: Node,
    referenceNode: Node | null
  ): void

  removeChild(node: Node, child: Node): void

  appendChild(node: Node, child: Node): void

  parentNode(node: Node): Node | null

  getNextSibling(node: Node): Node | null

  getTagName(element: Element): string

  setTextContent(node: Node, text: string | null): void

  getTextContent(node: Node): string | null

  isElement(node: Node): node is Element

  isText(node: Node): node is Text

  isComment(node: Node): node is Comment
}
