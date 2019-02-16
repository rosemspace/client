import HostInterface from '@rosem/vdom/HostInterface'

export default class Host implements HostInterface<Node> {
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

  setAttribute(element: Element, qualifiedName: string, value: any): void {
    element.setAttribute(qualifiedName, value)
  }

  setAttributeNS(element: Element, namespaceURI: string, qualifiedName: string, value: any): void {
    element.setAttributeNS(namespaceURI, qualifiedName, value)
  }

  setTextContent(node: Node, text: string | null): void {
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
}
