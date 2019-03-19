import { forEach } from 'lodash-es'
import isPrimitive from '@rosem-util/common/isPrimitive'
import HydratorInterface from './HydratorInterface'
import ManipulatorInterface from './ManipulatorInterface'
import VirtualInstance, {
  VirtualNode,
  VirtualElementProps,
  VirtualNodeAttrDescriptor,
  VirtualNodeList,
  VirtualNodeType,
} from './VirtualInstance'

export default class Hydrator<
  OutputNode,
  VirtualElementExtendedProps extends VirtualElementProps = VirtualElementProps
> implements HydratorInterface<VirtualNode, OutputNode> {
  public hydrate<
    ParentNode extends OutputNode,
    DocumentFragment extends ParentNode,
    Element extends ParentNode,
    Text extends OutputNode,
    Comment extends OutputNode = OutputNode,
    CDATASection extends OutputNode = OutputNode
  >(
    inputNode: VirtualInstance<VirtualElementExtendedProps>,
    manipulator: ManipulatorInterface<
      OutputNode,
      ParentNode,
      DocumentFragment,
      Element,
      Text,
      Comment,
      CDATASection
    >
  ): OutputNode {
    switch (inputNode.type) {
      case VirtualNodeType.DOCUMENT_FRAGMENT_NODE:
        const documentFragment: DocumentFragment = manipulator.createDocumentFragment()

        this.appendVirtualNodeList(
          documentFragment,
          inputNode.children,
          manipulator
        )

        return documentFragment
      case VirtualNodeType.ELEMENT_NODE:
        const props: VirtualElementExtendedProps = inputNode.props
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

        this.appendVirtualNodeList(element, inputNode.children, manipulator)

        return element
      case VirtualNodeType.TEXT_NODE:
        return manipulator.createText(
          null != inputNode.text ? String(inputNode.text) : ''
        )
      case VirtualNodeType.COMMENT_NODE:
        return manipulator.createComment(
          null != inputNode.text ? String(inputNode.text) : ''
        )
      case VirtualNodeType.CDATA_SECTION_NODE:
        return manipulator.createCDATASection(
          null != inputNode.text ? String(inputNode.text) : ''
        )
    }

    throw TypeError(
      `Unsupported virtual node type "${(inputNode as VirtualNode).type}"`
    )
  }

  protected appendVirtualNodeList<
    ParentNode extends OutputNode,
    DocumentFragment extends ParentNode,
    Element extends ParentNode,
    Text extends OutputNode,
    Comment extends OutputNode = OutputNode,
    CDATASection extends OutputNode = OutputNode
  >(
    parent: DocumentFragment | Element,
    nodeList: VirtualNodeList,
    renderer: ManipulatorInterface<
      OutputNode,
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
            this.hydrate(
              child as VirtualInstance<VirtualElementExtendedProps>,
              renderer
            )
          )
        }
      }
    }
  }
}
