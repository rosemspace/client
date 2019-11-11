import { DOMRenderer } from '@rosemlabs/dom-api'

const createDocumentFragment = document.createDocumentFragment.bind(document)
const createElement = document.createElement.bind(document)
const createElementNS = document.createElementNS.bind(document)
const createTextNode = document.createTextNode.bind(document)
const createComment = document.createComment.bind(document)

export default class WebRenderer // extends Document
  implements
    DOMRenderer<Node, DocumentFragment, Element, Text, Comment, CDATASection> {
  createDocumentFragment = createDocumentFragment

  createElement = createElement

  createElementNS = createElementNS

  createTextNode(text: string): Text {
    return createTextNode(String(text))
  }

  createComment(comment: string): Comment {
    return createComment(comment)
  }

  createCDATASection(data: string): CDATASection {
    return createTextNode(data)
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

  insertBefore<T extends Node, U extends Node>(
    parentNode: T,
    newNode: U,
    referenceNode?: Node
  ): U {
    return parentNode.insertBefore(newNode, referenceNode || null)
  }

  appendChild<T extends Node, U extends Node>(node: T, childNode: U): U {
    return node.appendChild(childNode)
  }

  removeChild<T extends Node, U extends Node>(node: T, childNode: U): U {
    return node.removeChild(childNode)
  }

  parentNode(node: Node): Node | null {
    return node.parentNode
  }

  // nextSibling(node: Node): Node | null {
  //   return node.nextSibling
  // }

  getTagName<T extends Element>(element: T): string {
    return element.tagName
  }
}
