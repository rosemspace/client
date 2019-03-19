import ManipulatorInterface from '@rosem/virtual-dom/ManipulatorInterface'

export default class Manipulator
  implements
    ManipulatorInterface<
      Node,
      Node & ParentNode,
      DocumentFragment,
      Element,
      Text,
      Comment,
      CDATASection
    > {
  createDocumentFragment(): DocumentFragment {
    return document.createDocumentFragment()
  }

  createElement(tagName: string): Element {
    return document.createElement(tagName)
  }

  createElementNS(namespace: string, qualifiedName: string): Element {
    return document.createElementNS(namespace, qualifiedName)
  }

  createText(text: string | number | boolean): Text {
    return document.createTextNode(String(text))
  }

  createComment(comment: string | number | boolean): Comment {
    return document.createComment(String(comment))
  }

  createCDATASection(data: string | number | boolean): CDATASection {
    return document.createCDATASection(String(data))
  }

  setAttribute<T extends Element>(
    element: T,
    qualifiedName: string,
    value: any
  ): void {
    element.setAttribute(qualifiedName, value)
  }

  setAttributeNS<T extends Element>(
    element: T,
    namespaceURI: string,
    qualifiedName: string,
    value: any
  ): void {
    element.setAttributeNS(namespaceURI, qualifiedName, value)
  }

  setTextContent(node: Node, text: string): void {
    node.textContent = text
  }

  insertBefore<T extends Node & ParentNode, U extends Node>(
    parentNode: T,
    newNode: U,
    referenceNode: Node
  ): U {
    return parentNode.insertBefore(newNode, referenceNode)
  }

  appendChild<T extends Node & ParentNode, U extends Node>(
    node: T,
    childNode: U
  ): U {
    return node.appendChild(childNode)
  }

  removeChild<T extends Node & ParentNode, U extends Node>(
    node: T,
    childNode: U
  ): U {
    return node.removeChild(childNode)
  }

  parent(node: Node): Node & ParentNode | null {
    return node.parentNode
  }

  nextSibling(node: Node): Node | null {
    return node.nextSibling
  }

  tagName<T extends Element>(node: T): string {
    return node.tagName
  }
}
