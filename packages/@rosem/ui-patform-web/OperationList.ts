import OperationListInterface from '@rosem/virtual-dom/OperationListInterface'

export default class OperationList
  implements
    OperationListInterface<Node, Element, Text, Comment, CDATASection> {
  createElement(tagName: any): Element {
    return document.createElement(tagName)
  }

  createElementNS(namespaceURI: string, qualifiedName: string): Element {
    return document.createElementNS(namespaceURI, qualifiedName)
  }

  createText(text: string): Text {
    return document.createTextNode(text)
  }

  createComment(comment: string): Comment {
    return document.createComment(comment)
  }

  createCDATASection(data: string): CDATASection {
    return document.createCDATASection(data)
  }

  setAttribute(element: Element, qualifiedName: string, value: any): void {
    element.setAttribute(qualifiedName, value)
  }

  setAttributeNS(
    element: Element,
    namespaceURI: string,
    qualifiedName: string,
    value: any
  ): void {
    element.setAttributeNS(namespaceURI, qualifiedName, value)
  }

  setTextContent(node: Node, text: string): void {
    node.textContent = text
  }

  insertBefore(
    parentNode: Node,
    newNode: Node,
    referenceNode: Node | null
  ): void {
    parentNode.insertBefore(newNode, referenceNode)
  }

  appendChild(node: Node, child: Node): void {
    node.appendChild(child)
  }

  removeChild(node: Node, child: Node): void {
    node.removeChild(child)
  }

  parentNode(node: Node): Node | null {
    return node.parentNode
  }

  nextSibling(node: Node): Node | null {
    return node.nextSibling
  }

  tagName(node: Element): string {
    return node.tagName
  }
}
