import VNode from './VNode'

export default interface RendererInterface<
  VNodeData,
  Node,
  Comment extends Node,
  Text extends Node,
  Element extends Node,
  NativeComponent extends Element = Element
> {
  createVNode(
    selector?: string,
    data?: VNodeData,
    children?: Array<VNode<VNodeData, Node> | string>,
    text?: string | null,
    realNode?: Element | Text | Comment | Node
  ): VNode<VNodeData, Node>

  elementToVNode(element: Element): VNode<VNodeData, Node>

  textToVNode(text: Text): VNode<VNodeData, Node>

  commentToVNode(comment: Comment): VNode<VNodeData, Node>

  nodeToVNode(node: Node): VNode<VNodeData, Node>

  toVNode(node: Node): VNode<VNodeData, Node>

  createElement(tagName: any): NativeComponent

  createElementNS(namespaceURI: string, qualifiedName: string): Element

  createTextNode(text: string): Text

  createComment(text: string): Comment

  insertBefore(
    parentNode: Node,
    newNode: Node,
    referenceNode: Node | null
  ): void

  removeChild(node: Node, child: Node): void

  appendChild(node: Node, child: Node): void

  parentNode(node: Node): Node | null

  nextSibling(node: Node): Node | null

  tagName(element: Element): string

  setTextContent(node: Node, text: string | null): void

  getTextContent(node: Node): string | null

  isElement(node: Node): node is Element

  isText(node: Node): node is Text

  isComment(node: Node): node is Comment
}
