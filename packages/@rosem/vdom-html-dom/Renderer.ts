import VNode, { DefaultVNodeData } from '@rosem/vdom/VNode'
import AbstractRenderer from '@rosem/vdom/AbstractRenderer'
import { AttrMap } from '@rosem/vdom/module/Attribute'

export type ComposedVNodeData =
  | {
      attributes?: AttrMap
    }
  | DefaultVNodeData

export default class Renderer<
  VNodeData extends ComposedVNodeData
> extends AbstractRenderer<
  VNodeData,
  Node,
  Comment,
  Text,
  Element,
  HTMLElement
> {
  elementToVNode(element: Element): VNode<VNodeData, Node> {
    const id = element.id ? '#' + element.id : ''
    const className = element.getAttribute('class')
    const classNameSelector = className
      ? '.' + className.split(' ').join('.')
      : ''
    const selector =
      this.tagName(element).toLowerCase() + id + classNameSelector
    let name: string
    let index: number
    let length: number
    const attributes: AttrMap = {}
    const elementAttributes = element.attributes

    for (
      index = 0, length = elementAttributes.length;
      index < length;
      ++index
    ) {
      name = elementAttributes[index].nodeName
      if (name !== 'id' && name !== 'class') {
        attributes[name] = elementAttributes[index].nodeValue as string
      }
    }

    const children: Array<VNode<VNodeData, Node>> = []
    const elementChildNodes = element.childNodes

    for (
      index = 0, length = elementChildNodes.length;
      index < length;
      ++index
    ) {
      children.push(this.toVNode(elementChildNodes[index]))
    }

    return this.createVNode(
      selector,
      { attributes } as VNodeData,
      children,
      undefined,
      element
    )
  }

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
