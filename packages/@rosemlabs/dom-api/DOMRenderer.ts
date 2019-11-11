// const d: DOMRenderer<
//   Node,
//   ParentNode,
//   DocumentFragment,
//   Element,
//   Text,
//   Comment
// > = document

export interface DOMInstantiator<
  DocumentFragment,
  Element,
  Text,
  Comment,
  CDATASection = Text
> {
  // createAttribute(localName: string): Attr

  // createAttributeNS(namespace: string | null, qualifiedName: string): Attr

  createCDATASection(cdata: string): CDATASection

  createComment(comment: string): Comment

  createDocumentFragment(): DocumentFragment

  createElement(qualifiedName: string): Element

  createElementNS(namespaceURI: string, qualifiedName: string): Element

  createTextNode(text: string): Text
}

export interface DOMTreeWalker<
  Node
  // DocumentFragment extends Node & ParentNode,
  // Element extends Node & ParentNode
> {
  // childNodeAt<T extends (Node & ParentNode) | DocumentFragment, U extends Node>(
  //   parentNode: T,
  //   childNodeIndex: number
  // ): U

  // childElementAt<
  //   T extends (Node & ParentNode) | DocumentFragment,
  //   U extends Element
  // >(
  //   parentNode: T,
  //   childElementIndex: number
  // ): U

  // nextSibling(node: Node): Node | null

  // nextElementSibling(node: Node): Element | null

  parentNode(node: Node): Node | null
}

export default interface DOMRenderer<
  Node,
  DocumentFragment extends Node,
  Element extends Node,
  Text extends Node,
  Comment extends Node = Node,
  CDATASection extends Node = Node
>
  extends DOMInstantiator<
      DocumentFragment,
      Element,
      Text,
      Comment,
      CDATASection
    >,
    DOMTreeWalker<Node /*, DocumentFragment, Element*/> {
  // append<T extends Node & ParentNode, U extends Node>(
  //   parentNode: T,
  //   ...nodes: (U | string)[]
  // ): void

  appendChild<T extends Node, U extends Node>(parentNode: T, childNode: U): U

  // prepend<T extends Node & ParentNode, U extends Node>(
  //   parentNode: T,
  //   ...nodes: (U | string)[]
  // ): void

  insertBefore<T extends Node, U extends Node>(
    parentNode: T,
    childNode: U,
    referenceNode?: Node
  ): U

  // cloneNode<T extends Node>(node: T, deep?: boolean): T

  //replaceWith

  removeChild<T extends Node, U extends Node>(parentNode: T, childNode: U): U

  // getChildNodeCount<T extends Node & ParentNode>(parentNode: T): number

  // getChildElementCount<T extends Node & ParentNode>(parentNode: T): number

  getTagName<T extends Element>(element: T): string

  // hasChildNodes<T extends Node>(node: T): boolean

  setAttribute<T extends Element>(
    element: T,
    qualifiedName: string,
    value: any
  ): void

  setAttributeNS<T extends Element>(
    element: T,
    namespaceURI: string,
    qualifiedName: string,
    value: any
  ): void

  setTextContent<T extends Node | Text | Comment | CDATASection>(
    node: T,
    text: string
  ): void
}
