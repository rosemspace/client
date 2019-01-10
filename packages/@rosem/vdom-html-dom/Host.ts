import HostInterface from '@rosem/vdom/HostInterface'

export default class Host implements HostInterface<
  Node,
  Comment,
  Text,
  Element,
  HTMLElement
> {
  createElement(tagName: any): HTMLElement {
    return document.createElement(tagName)
  }

  createElementNS(namespaceURI: string, qualifiedName: string): Element {
    return document.createElementNS(namespaceURI, qualifiedName)
  }

  createTextNode(text: string): Text {
    return document.createTextNode(text)
  }

  createComment(text: string): Comment {
    return document.createComment(text)
  }

  childNodes(element: Element): Iterable<Node> {
    return element.childNodes
  }

  insertBefore(
    parentNode: Node,
    newNode: Node,
    referenceNode: Node | null
  ): void {
    parentNode.insertBefore(newNode, referenceNode)
  }

  removeChild(node: Node, child: Node): void {
    node.removeChild(child)
  }

  appendChild(node: Node, child: Node): void {
    node.appendChild(child)
  }

  parentNode(node: Node): Node | null {
    return node.parentNode
  }

  nextSibling(node: Node): Node | null {
    return node.nextSibling
  }

  tagName(elm: Element): string {
    return elm.tagName
  }

  setTextContent(node: Node, text: string | null): void {
    node.textContent = text
  }

  getTextContent(node: Node): string | null {
    return node.textContent
  }

  isElement(node: Node): node is Element {
    return node.nodeType === Node.ELEMENT_NODE
  }

  isText(node: Node): node is Text {
    return node.nodeType === Node.TEXT_NODE
  }

  isComment(node: Node): node is Comment {
    return node.nodeType === Node.COMMENT_NODE
  }
}
