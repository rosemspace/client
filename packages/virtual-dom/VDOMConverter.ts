import { DOMConverter, DOMRenderer, NodeType } from '@rosemlabs/dom-api'
import forEach from 'lodash/forEach'
import {
  VirtualAttr,
  VirtualCharacterData,
  VirtualElement,
  VirtualInstance,
  VirtualNode,
} from './index'

export default class VDOMConverter<OutputNode>
  implements DOMConverter<VirtualNode, OutputNode> {
  public convert<
    DocumentFragment extends OutputNode,
    Element extends OutputNode,
    Text extends OutputNode,
    Comment extends OutputNode = OutputNode,
    CDATASection extends OutputNode = OutputNode
  >(
    inputNode: VirtualInstance,
    renderer: DOMRenderer<
      OutputNode,
      DocumentFragment,
      Element,
      Text,
      Comment,
      CDATASection
    >
  ): OutputNode {
    switch (inputNode.type) {
      case NodeType.DOCUMENT_FRAGMENT_NODE: {
        const documentFragment: DocumentFragment = renderer.createDocumentFragment()

        this.appendVirtualNodeList(
          documentFragment,
          inputNode.childNodes as VirtualInstance[],
          renderer
        )

        return documentFragment
      }
      case NodeType.ELEMENT_NODE: {
        const element: Element = (inputNode as VirtualElement).namespaceURI
          ? renderer.createElementNS(
              (inputNode as VirtualElement).namespaceURI,
              (inputNode as VirtualElement).tagName
            )
          : renderer.createElement((inputNode as VirtualElement).tagName)

        if ((inputNode as VirtualElement).attrs) {
          forEach((inputNode as VirtualElement).attrs, function(
            attr: VirtualAttr,
            key: string
          ) {
            null == attr.namespaceURI
              ? renderer.setAttribute(element, key, attr.value)
              : renderer.setAttributeNS(
                  element,
                  attr.namespaceURI,
                  key,
                  attr.value
                )
          })
        }

        this.appendVirtualNodeList(
          element,
          inputNode.childNodes as VirtualInstance[],
          renderer
        )

        return element
      }
      case NodeType.TEXT_NODE:
        return renderer.createTextNode(
          String((inputNode as VirtualCharacterData).text)
        )
      case NodeType.COMMENT_NODE:
        return renderer.createComment(
          String((inputNode as VirtualCharacterData).text)
        )
      case NodeType.CDATA_SECTION_NODE:
        return renderer.createCDATASection(
          String((inputNode as VirtualCharacterData).text)
        )
    }

    throw new Error('Unknown type of node')
  }

  protected appendVirtualNodeList<
    ParentNode,
    DocumentFragment extends OutputNode & ParentNode,
    Element extends OutputNode & ParentNode,
    Text extends OutputNode,
    Comment extends OutputNode = OutputNode,
    CDATASection extends OutputNode = OutputNode
  >(
    parent: DocumentFragment | Element,
    nodeList: VirtualInstance[],
    renderer: DOMRenderer<
      OutputNode,
      DocumentFragment,
      Element,
      Text,
      Comment,
      CDATASection
    >
  ): void {
    if (nodeList) {
      for (const child of nodeList) {
        if (null != child) {
          renderer.appendChild(parent, this.convert(child, renderer))
        }
      }
    }
  }
}
