import concatChildren from './concatChildren'
import ManipulatorInterface from './ManipulatorInterface'
import {
  VirtualCDATASection,
  VirtualComment,
  VirtualDocumentFragment,
  VirtualElement,
  VirtualElementProps,
  VirtualNodeType,
  VirtualParentNode,
  VirtualText,
  VirtualNode,
  VirtualContentNode,
} from './VirtualInstance'

let key = 0

export default class Manipulator<
  VirtualElementExtendedProps extends VirtualElementProps = VirtualElementProps
>
  implements
    ManipulatorInterface<
      VirtualNode,
      VirtualParentNode,
      VirtualDocumentFragment,
      VirtualElement,
      VirtualText,
      VirtualComment,
      VirtualCDATASection
    > {
  static readonly DOCUMENT_FRAGMENT_NODE =
    VirtualNodeType.DOCUMENT_FRAGMENT_NODE
  static readonly ELEMENT_NODE = VirtualNodeType.ELEMENT_NODE
  static readonly TEXT_NODE = VirtualNodeType.TEXT_NODE
  static readonly COMMENT_NODE = VirtualNodeType.COMMENT_NODE
  static readonly CDATA_SECTION_NODE = VirtualNodeType.CDATA_SECTION_NODE

  createDocumentFragment(): VirtualDocumentFragment {
    return {
      type: VirtualNodeType.DOCUMENT_FRAGMENT_NODE,
      children: [],
    }
  }

  createElement(
    qualifiedName: string
  ): VirtualElement<VirtualElementExtendedProps> {
    return {
      type: VirtualNodeType.ELEMENT_NODE,
      props: {
        tag: qualifiedName,
        key: ++key,
        attrs: {},
      } as VirtualElementExtendedProps,
      children: [],
    }
  }

  createElementNS(
    namespace: string,
    qualifiedName: string
  ): VirtualElement<VirtualElementExtendedProps> {
    const element = this.createElement(qualifiedName)

    element.props.namespace = namespace

    return element
  }

  createText(text: string | number | boolean): VirtualText {
    return {
      type: VirtualNodeType.TEXT_NODE,
      text,
    }
  }

  createComment(comment: string | number | boolean): VirtualComment {
    return {
      type: VirtualNodeType.COMMENT_NODE,
      text: comment,
    }
  }

  createCDATASection(cdata: string | number | boolean): VirtualCDATASection {
    return {
      type: VirtualNodeType.CDATA_SECTION_NODE,
      text: cdata,
    }
  }

  setAttribute<T extends VirtualElement>(
    element: T,
    qualifiedName: string,
    value: any
  ): void {
    element.props.attrs[qualifiedName] = value
  }

  setAttributeNS<T extends VirtualElement>(
    element: T,
    namespace: string,
    qualifiedName: string,
    value: any
  ): void {
    element.props.attrs[qualifiedName] = {
      namespace,
      value,
    }
  }

  setTextContent(
    node: VirtualParentNode | VirtualContentNode,
    text: string
  ): void {
    if (
      VirtualNodeType.ELEMENT_NODE === node.type ||
      VirtualNodeType.DOCUMENT_FRAGMENT_NODE === node.type
    ) {
      ;(node as VirtualParentNode).children = [
        {
          type: VirtualNodeType.TEXT_NODE,
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

    if (VirtualNodeType.DOCUMENT_FRAGMENT_NODE === childNode.type) {
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

    if (VirtualNodeType.DOCUMENT_FRAGMENT_NODE === childNode.type) {
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

  tagName<T extends VirtualElement>(element: T): string {
    return element.props.tag
  }
}
