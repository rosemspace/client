import isPrimitive from '@rosem-util/common/isPrimitive'
import CommutatorInterface from '@rosem/virtual-dom/CommutatorInterface'
import { forEach } from 'lodash-es'
import ManipulatorInterface from './ManipulatorInterface'
import VirtualInstance, {
  VirtualCDATASection,
  VirtualNode,
  VirtualParentNode,
  VirtualComment,
  VirtualDocumentFragment,
  VirtualElement,
  VirtualElementProps,
  VirtualNodeAttrDescriptor,
  VirtualNodeList,
  VirtualNodeType,
  VirtualText,
} from './VirtualInstance'

export default class Commutator implements CommutatorInterface {
  public mutateFromVirtualInstance<
    VirtualElementExtendedProps extends VirtualElementProps,
    Node,
    ParentNode extends Node,
    DocumentFragment extends ParentNode,
    Element extends ParentNode,
    Text extends Node,
    Comment extends Node = Node,
    CDATASection extends Node = Node
  >(
    virtualInstance: VirtualInstance<VirtualElementExtendedProps>,
    manipulator: ManipulatorInterface<
      Node,
      ParentNode,
      DocumentFragment,
      Element,
      Text,
      Comment,
      CDATASection
    >
  ): ParentNode | Text | Comment | CDATASection {
    switch (virtualInstance.type) {
      case VirtualNodeType.DOCUMENT_FRAGMENT_NODE:
        const documentFragment: DocumentFragment = manipulator.createDocumentFragment()

        this.appendVirtualNodeList(
          documentFragment,
          virtualInstance.children,
          manipulator
        )

        return documentFragment
      case VirtualNodeType.ELEMENT_NODE:
        const props: VirtualElementExtendedProps = virtualInstance.props
        const element: Element = props.namespace
          ? manipulator.createElementNS(props.namespace, props.tag)
          : manipulator.createElement(props.tag)

        if (props.attrs) {
          forEach(props.attrs, function(
            attr: VirtualNodeAttrDescriptor | string | number | boolean,
            key: string
          ) {
            isPrimitive(attr)
              ? manipulator.setAttribute(element, key, attr)
              : manipulator.setAttributeNS(
                  element,
                  (attr as VirtualNodeAttrDescriptor).namespace,
                  key,
                  (attr as VirtualNodeAttrDescriptor).value
                )
          })
        }

        this.appendVirtualNodeList(
          element,
          virtualInstance.children,
          manipulator
        )

        return element
      case VirtualNodeType.TEXT_NODE:
        return manipulator.createText(
          null != virtualInstance.text ? String(virtualInstance.text) : ''
        )
      case VirtualNodeType.COMMENT_NODE:
        return manipulator.createComment(
          null != virtualInstance.text ? String(virtualInstance.text) : ''
        )
      case VirtualNodeType.CDATA_SECTION_NODE:
        return manipulator.createCDATASection(
          null != virtualInstance.text ? String(virtualInstance.text) : ''
        )
    }

    throw TypeError(
      `Unsupported virtual node type "${(virtualInstance as VirtualNode).type}"`
    )
  }

  protected appendVirtualNodeList<
    Node,
    ParentNode extends Node,
    DocumentFragment extends ParentNode,
    Element extends ParentNode,
    Text extends Node,
    Comment extends Node = Node,
    CDATASection extends Node = Node
  >(
    parent: DocumentFragment | Element,
    nodeList: VirtualNodeList,
    renderer: ManipulatorInterface<
      Node,
      ParentNode,
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
          renderer.appendChild(
            parent,
            this.mutateFromVirtualInstance(child as VirtualInstance, renderer)
          )
        }
      }
    }
  }

  mutateToVirtualInstance<
    VirtualElementExtendedProps extends VirtualElementProps,
    Node,
    ParentNode extends Node,
    DocumentFragment extends ParentNode,
    Element extends ParentNode,
    Text extends Node,
    Comment extends Node = Node,
    CDATASection extends Node = Node
  >(
    instance: DocumentFragment | Element | Text | Comment | CDATASection,
    virtualManipulator: ManipulatorInterface<
      VirtualNode,
      VirtualParentNode,
      VirtualDocumentFragment,
      VirtualElement<VirtualElementExtendedProps>,
      VirtualText,
      VirtualComment,
      VirtualCDATASection
    >
  ): VirtualInstance {
    return {
      type: VirtualNodeType.TEXT_NODE,
      text: '',
    }
  }
}
