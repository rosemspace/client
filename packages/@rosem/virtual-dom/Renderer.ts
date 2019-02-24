import RendererInterface from './RendererInterface'
import VirtualInstance, {
  VirtualCDATASection,
  VirtualComment,
  VirtualElement,
  VirtualNode,
  VirtualNodeType,
  VirtualText,
} from './VirtualInstance'

let key = 0

export default class Renderer
  implements
    RendererInterface<
      VirtualNode,
      VirtualElement,
      VirtualText,
      VirtualComment,
      VirtualCDATASection
    > {
  createElement(qualifiedName: any): VirtualElement {
    return {
      type: VirtualNodeType.ELEMENT_NODE,
      props: {
        tag: qualifiedName,
        key: ++key,
        attrs: {},
      },
      index: 0,
      children: [],
    }
  }

  createElementNS(namespace: string, qualifiedName: string): VirtualElement {
    const element = this.createElement(qualifiedName)

    element.props.namespace = namespace

    return element
  }

  createText(text: string): VirtualText {
    return {
      type: VirtualNodeType.TEXT_NODE,
      text,
    }
  }

  createComment(comment: string): VirtualComment {
    return {
      type: VirtualNodeType.COMMENT_NODE,
      text: comment,
    }
  }

  createCDATASection(cdata: string): VirtualCDATASection {
    return {
      type: VirtualNodeType.CDATA_SECTION_NODE,
      text: cdata,
    }
  }

  setAttribute(
    element: VirtualElement,
    qualifiedName: string,
    value: any
  ): void {
    element.props.attrs[qualifiedName] = value
  }

  setAttributeNS(
    element: VirtualElement,
    namespace: string,
    qualifiedName: string,
    value: any
  ): void {
    element.props.attrs[qualifiedName] = {
      namespace,
      value,
    }
  }

  setTextContent(node: VirtualInstance, text: string): void {
    if (VirtualNodeType.ELEMENT_NODE === node.type) {
      node.children = [
        {
          type: VirtualNodeType.TEXT_NODE,
          text,
        },
      ]
    } else {
      node.text = text
    }
  }

  insertBefore(
    parentElement: VirtualElement,
    childInstance: VirtualInstance,
    referenceInstance: VirtualInstance
  ): void {
    const children = parentElement.children
    let childInstanceIndex = children.indexOf(referenceInstance)

    if (childInstanceIndex < 0) {
      throw new Error('Virtual reference instance is not a child of parent')
    }

    if (childInstanceIndex >= 1) {
      children[childInstanceIndex - 1].nextSibling = childInstance
    }

    childInstance.parentElement = parentElement
    childInstance.nextSibling = referenceInstance
    children.splice(childInstanceIndex, 0, childInstance)

    const childrenLength = children.length

    while (childInstanceIndex < childrenLength) {
      if (VirtualNodeType.ELEMENT_NODE === children[childInstanceIndex].type) {
        ;(children[
          childInstanceIndex
        ] as VirtualElement).index = childInstanceIndex
        ++childInstanceIndex
      }
    }
  }

  appendChild(
    parentElement: VirtualElement,
    childInstance: VirtualInstance
  ): void {
    const children = parentElement.children
    const childrenLength = children.length

    if (VirtualNodeType.ELEMENT_NODE === childInstance.type) {
      childInstance.index = childrenLength
    }

    if (childrenLength >= 1) {
      children[childrenLength - 1].nextSibling = childInstance
    }

    childInstance.parentElement = parentElement
    children.push(childInstance)
  }

  removeChild(
    parentElement: VirtualElement,
    childInstance: VirtualInstance
  ): void {
    const children = parentElement.children
    let childInstanceIndex = children.indexOf(childInstance)

    if (childInstanceIndex < 0) {
      throw new Error('Virtual instance is not a child of parent')
    }

    children.splice(childInstanceIndex, 1)

    const childrenLength = children.length

    if (childInstanceIndex >= 1 && childrenLength >= 2) {
      children[childInstanceIndex - 1].nextSibling = children[childInstanceIndex]
    }

    while (childInstanceIndex < childrenLength) {
      if (VirtualNodeType.ELEMENT_NODE === children[childInstanceIndex].type) {
        ;(children[
          childInstanceIndex
        ] as VirtualElement).index = childInstanceIndex
        ++childInstanceIndex
      }
    }
  }

  nextSibling(node: VirtualNode): VirtualInstance | null {
    return node.nextSibling || null
  }

  parentElement(node: VirtualNode): VirtualElement | null {
    return node.parentElement || null
  }

  tagName(element: VirtualElement): string {
    return element.props.tag
  }
}
