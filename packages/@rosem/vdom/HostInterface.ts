export default interface HostInterface<
  NativeNode,
  NativeElement extends NativeNode = NativeNode,
  NativeText extends NativeNode = NativeNode,
  NativeComment extends NativeNode = NativeNode,
> {
  createElement(qualifiedName: any): NativeElement

  createElementNS(namespaceURI: string, qualifiedName: string): NativeElement

  createText(text: string): NativeText

  createComment(comment: string): NativeComment

  setAttribute(element: NativeElement, qualifiedName: string, value: any): void

  setAttributeNS(element: NativeElement, namespaceURI: string, qualifiedName: string, value: any): void

  setTextContent(node: NativeNode, text: string | null): void

  insertBefore(
    parentNode: NativeNode,
    childNode: NativeNode,
    referenceNode: NativeNode
  ): void

  appendChild(parentNode: NativeNode, childNode: NativeNode): void

  removeChild(parentNode: NativeNode, childNode: NativeNode): void

  // getChildNodes(element: Element): Iterable<Node>

  // parentNode(node: Node): Node | null
  //
  // getNextSibling(node: Node): Node | null
  //
  // getTagName(element: Element): string

  // getTextContent(node: Node): string | null
  //
  // isElement(node: Node): node is Element
  //
  // isText(node: Node): node is Text
  //
  // isComment(node: Node): node is Comment
}
