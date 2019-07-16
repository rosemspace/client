import { NodeName, NodeType, DOMRenderer } from '@rosemlab/dom-api'
import concatChildren from './concatChildren'
import {
  VirtualCDATASection,
  VirtualComment,
  VirtualContentNode,
  VirtualDocumentFragment,
  VirtualElement,
  VirtualNode,
  VirtualParentNode,
  VirtualText,
} from '.'

let key = 0

export default class VDOMRenderer<VirtualElementProps extends object>
  implements
    DOMRenderer<
      VirtualNode,
      VirtualParentNode,
      VirtualDocumentFragment,
      VirtualElement<VirtualElementProps>,
      VirtualText,
      VirtualComment,
      VirtualCDATASection
    > {
  static readonly DOCUMENT_FRAGMENT_NODE = NodeType.DOCUMENT_FRAGMENT_NODE
  static readonly ELEMENT_NODE = NodeType.ELEMENT_NODE
  static readonly TEXT_NODE = NodeType.TEXT_NODE
  static readonly COMMENT_NODE = NodeType.COMMENT_NODE
  static readonly CDATA_SECTION_NODE = NodeType.CDATA_SECTION_NODE

  createDocumentFragment(): VirtualDocumentFragment {
    return {
      nodeName: NodeName.DOCUMENT_FRAGMENT_NODE,
      type: NodeType.DOCUMENT_FRAGMENT_NODE,
      children: [],
    }
  }

  createElement(qualifiedName: string): VirtualElement<VirtualElementProps> {
    return this.createElementNS(undefined!, qualifiedName)
  }

  createElementNS(
    namespaceURI: string,
    qualifiedName: string
  ): VirtualElement<VirtualElementProps> {
    let [prefix, localName] = qualifiedName.split(':', 2)

    if (null == localName) {
      localName = prefix
      prefix = undefined!
    }

    return {
      nodeName: qualifiedName,
      type: NodeType.ELEMENT_NODE,
      prefix,
      localName,
      tagName: qualifiedName,
      namespaceURI: namespaceURI,
      key: ++key,
      attrs: {},
      props: {} as VirtualElementProps,
      children: [],
    }
  }

  createText(text: string | number | boolean): VirtualText {
    return {
      nodeName: NodeName.TEXT_NODE,
      type: NodeType.TEXT_NODE,
      text,
    }
  }

  createComment(comment: string | number | boolean): VirtualComment {
    return {
      nodeName: NodeName.COMMENT_NODE,
      type: NodeType.COMMENT_NODE,
      text: comment,
    }
  }

  createCDATASection(cdata: string | number | boolean): VirtualCDATASection {
    return {
      nodeName: NodeName.CDATA_SECTION_NODE,
      type: NodeType.CDATA_SECTION_NODE,
      text: cdata,
    }
  }

  setAttribute<T extends VirtualElement<VirtualElementProps>>(
    element: T,
    qualifiedName: string,
    value: any
  ): void {
    this.setAttributeNS(element, undefined!, qualifiedName, value)
  }

  setAttributeNS<T extends VirtualElement<VirtualElementProps>>(
    element: T,
    namespaceURI: string,
    qualifiedName: string,
    value: any
  ): void {
    let [prefix, localName] = qualifiedName.split(':', 2)

    if (null == localName) {
      localName = prefix
      prefix = undefined!
    }

    element.attrs[qualifiedName] = {
      prefix,
      localName,
      namespaceURI,
      ownerElement: element,
      value,
    }
  }

  setTextContent(
    node: VirtualParentNode | VirtualContentNode,
    text: string
  ): void {
    if (
      NodeType.ELEMENT_NODE === node.type ||
      NodeType.DOCUMENT_FRAGMENT_NODE === node.type
    ) {
      ;(node as VirtualParentNode).children = [
        {
          type: NodeType.TEXT_NODE,
          text,
        } as VirtualText,
      ]
    } else {
      ;(node as VirtualContentNode).text = text
    }
  }

  insertBefore<
    T extends VirtualParentNode,
    U extends VirtualParentNode | VirtualNode
  >(parentNode: T, childNode: U, referenceNode: VirtualNode): U {
    const children = parentNode.children
    let referenceNodeIndex = children.indexOf(referenceNode)

    if (referenceNodeIndex < 0) {
      throw new Error('Virtual reference instance is not a child of a parent')
    }

    if (NodeType.DOCUMENT_FRAGMENT_NODE === childNode.type) {
      const restChildren = children.splice(
        referenceNodeIndex,
        children.length - 1
      )

      concatChildren(
        parentNode,
        children,
        (childNode as VirtualDocumentFragment).children
      )
      children[children.length - 1].nextSibling = restChildren[0]
      parentNode.children = children.concat(restChildren)

      return childNode
    }

    childNode.parent = parentNode
    childNode.nextSibling = referenceNode

    if (referenceNodeIndex >= 1) {
      children[referenceNodeIndex - 1].nextSibling = childNode
    }

    children.splice(referenceNodeIndex, 0, childNode)

    return childNode
  }

  appendChild<
    T extends VirtualParentNode,
    U extends VirtualParentNode | VirtualNode
  >(parentNode: T, childNode: U): U {
    const children = parentNode.children

    if (NodeType.DOCUMENT_FRAGMENT_NODE === childNode.type) {
      concatChildren(
        parentNode,
        children,
        (childNode as VirtualDocumentFragment).children
      )

      return childNode
    }

    if (children.length >= 1) {
      children[children.length - 1].nextSibling = childNode
    }

    childNode.parent = parentNode
    children.push(childNode)

    return childNode
  }

  removeChild<T extends VirtualParentNode, U extends VirtualNode>(
    parentNode: T,
    childNode: U
  ): U {
    const children = parentNode.children
    let childInstanceIndex = children.indexOf(childNode)

    if (childInstanceIndex < 0) {
      throw new Error('Virtual instance is not a child of a parent')
    }

    children.splice(childInstanceIndex, 1)

    const childrenLength = children.length

    if (childInstanceIndex >= 1 && childrenLength >= 2) {
      children[childInstanceIndex - 1].nextSibling =
        children[childInstanceIndex]
    }

    return childNode
  }

  parent(node: VirtualNode): VirtualParentNode | null {
    return node.parent || null
  }

  nextSibling(node: VirtualNode): VirtualNode | null {
    return node.nextSibling || null
  }

  tagName<T extends VirtualElement<VirtualElementProps>>(element: T): string {
    return element.tagName
  }
}
