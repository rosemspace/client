export default interface Renderer<
  Node,
  ParentNode extends Node,
  DocumentFragment extends ParentNode,
  Element extends ParentNode,
  Text extends Node,
  Comment extends Node = Node,
  CDATASection extends Node = Node
> {
  createDocumentFragment(): DocumentFragment

  createElement(qualifiedName: string): Element

  createElementNS(namespaceURI: string, qualifiedName: string): Element

  createText(text: string | number | boolean): Text

  createComment(comment: string | number | boolean): Comment

  createCDATASection(cdata: string | number | boolean): CDATASection

  setAttribute<T extends Element>(element: T, qualifiedName: string, value: any): void

  setAttributeNS<T extends Element>(
    element: T,
    namespaceURI: string,
    qualifiedName: string,
    value: any
  ): void

  setTextContent<T extends ParentNode | Text | Comment | CDATASection>(
    node: T,
    text: string
  ): void

  insertBefore<T extends ParentNode, U extends Node>(
    parentNode: T,
    childNode: U,
    referenceNode: Node
  ): U

  //append

  appendChild<T extends ParentNode, U extends Node>(
    parentNode: T,
    childNode: U
  ): U

  //prepend

  removeChild<T extends ParentNode, U extends Node>(
    parentNode: T,
    childNode: U
  ): U

  //replaceWith

  parent(node: Node): ParentNode | null

  nextSibling(node: Node): Node | null

  // nextElementSibling(node: Node): Element | null

  // cloneNode(deep?: boolean): Node

  tagName<T extends Element>(element: T): string
}
