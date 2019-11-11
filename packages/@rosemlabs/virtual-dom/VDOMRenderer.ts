import { DOMRenderer, NodeName, NodeType } from '@rosemlabs/dom-api'
import concatChildren from './concatChildren'
import {
  VirtualCDATASection,
  VirtualCharacterData,
  VirtualComment,
  VirtualDocumentFragment,
  VirtualElement,
  VirtualNode,
  VirtualText,
} from './index'

let key = 0

export default class VDOMRenderer
  implements
    DOMRenderer<
      VirtualNode,
      VirtualDocumentFragment,
      VirtualElement,
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
      childNodes: [],
    }
  }

  createElement(qualifiedName: string): VirtualElement {
    return this.createElementNS(undefined!, qualifiedName)
  }

  createElementNS(namespaceURI: string, qualifiedName: string): VirtualElement {
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
      childNodes: [],
    }
  }

  createTextNode(text: string): VirtualText {
    return {
      childNodes: [],
      nodeName: NodeName.TEXT_NODE,
      type: NodeType.TEXT_NODE,
      text,
    }
  }

  createComment(comment: string): VirtualComment {
    return {
      childNodes: [],
      nodeName: NodeName.COMMENT_NODE,
      type: NodeType.COMMENT_NODE,
      text: comment,
    }
  }

  createCDATASection(cdata: string): VirtualCDATASection {
    return {
      childNodes: [],
      nodeName: NodeName.CDATA_SECTION_NODE,
      type: NodeType.CDATA_SECTION_NODE,
      text: cdata,
    }
  }

  setAttribute<T extends VirtualElement>(
    element: T,
    qualifiedName: string,
    value: any
  ): void {
    this.setAttributeNS(element, undefined!, qualifiedName, value)
  }

  setAttributeNS<T extends VirtualElement>(
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

  setTextContent(node: VirtualNode | VirtualCharacterData, text: string): void {
    if (
      NodeType.ELEMENT_NODE === node.type ||
      NodeType.DOCUMENT_FRAGMENT_NODE === node.type
    ) {
      node.childNodes = [
        {
          type: NodeType.TEXT_NODE,
          text,
        } as VirtualText,
      ]
    } else {
      ;(node as VirtualCharacterData).text = text
    }
  }

  insertBefore<
    T extends VirtualNode /* & VirtualParentNode*/,
    U extends VirtualNode
  >(parentNode: T, childNode: U, referenceNode?: VirtualNode): U {
    const childNodes = parentNode.childNodes
    //todo to handle referenceNode undefined case
    let referenceNodeIndex = childNodes.indexOf(referenceNode!)

    if (referenceNodeIndex < 0) {
      throw new Error('Virtual reference instance is not a child of a parent')
    }

    if (NodeType.DOCUMENT_FRAGMENT_NODE === childNode.type) {
      const restChildren = childNodes.splice(
        referenceNodeIndex,
        childNodes.length - 1
      )

      concatChildren(
        parentNode,
        childNodes,
        (childNode as VirtualDocumentFragment).childNodes
      )
      childNodes[childNodes.length - 1].nextSibling = restChildren[0]
      parentNode.childNodes = childNodes.concat(restChildren)

      return childNode
    }

    childNode.parent = parentNode
    childNode.nextSibling = referenceNode

    if (referenceNodeIndex >= 1) {
      childNodes[referenceNodeIndex - 1].nextSibling = childNode
    }

    childNodes.splice(referenceNodeIndex, 0, childNode)

    return childNode
  }

  appendChild<
    T extends VirtualNode /* & VirtualParentNode*/,
    U extends VirtualNode
  >(parentNode: T, childNode: U): U {
    const children = parentNode.childNodes

    if (NodeType.DOCUMENT_FRAGMENT_NODE === childNode.type) {
      concatChildren(parentNode, children, childNode.childNodes)

      return childNode
    }

    if (children.length >= 1) {
      children[children.length - 1].nextSibling = childNode
    }

    childNode.parent = parentNode
    children.push(childNode)

    return childNode
  }

  removeChild<
    T extends VirtualNode /* & VirtualParentNode*/,
    U extends VirtualNode
  >(parentNode: T, childNode: U): U {
    const children = parentNode.childNodes
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

  parentNode(node: VirtualNode): VirtualNode | null {
    return node.parent || null
  }

  // nextSibling(node: VirtualNode): VirtualNode | null {
  //   return node.nextSibling || null
  // }

  getTagName<T extends VirtualElement>(element: T): string {
    return element.tagName
  }
}
