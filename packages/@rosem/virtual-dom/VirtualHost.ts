import isPrimitive from '@rosem-util/common/isPrimitive'
import forEach from 'lodash-es/forEach'
import isArray from 'lodash-es/isArray'
import isNumber from 'lodash-es/isNumber'
import isString from 'lodash-es/isString'
import isPlainObject from 'lodash-es/isPlainObject'
import OperationListInterface from './OperationListInterface'
import VirtualHostInterface from './VirtualHostInterface'
import VirtualInstance, {
  Primitive,
  VirtualChildList,
  VirtualElement,
  VirtualElementProps,
  VirtualInstanceList,
  VirtualNode,
  VirtualNodeAttrDescriptor,
  VirtualNodeType,
  VirtualText,
} from './VirtualInstance'

let key = 0

function validateVirtualElementName(name?: any) {
  if (!name || !isString(name)) {
    throw new TypeError(
      null == name || '' === name
        ? `Missed name of a virtual element`
        : `Invalid name "${name.toString()}" of a virtual element`
    )
  }
}

export default class VirtualHost implements VirtualHostInterface {
  static readonly ELEMENT_NODE = VirtualNodeType.ELEMENT_NODE
  static readonly TEXT_NODE = VirtualNodeType.TEXT_NODE
  static readonly COMMENT_NODE = VirtualNodeType.COMMENT_NODE
  static readonly CDATA_SECTION_NODE = VirtualNodeType.CDATA_SECTION_NODE

  createVirtualInstance(
    typeOrName: VirtualNodeType | string,
    propsOrChildListOrText?:
      | Partial<VirtualElementProps>
      | VirtualChildList
      | Primitive,
    childListOrText?: VirtualChildList | Primitive
  ): VirtualInstance {
    let props: Partial<VirtualElementProps> | undefined
    let index: number

    if (arguments.length > 1) {
      if (childListOrText) {
        props = propsOrChildListOrText as Partial<VirtualElementProps>

        if (!isArray(childListOrText)) {
          childListOrText = [childListOrText as Primitive]
        }
      } else if (isPlainObject(propsOrChildListOrText)) {
        props = propsOrChildListOrText as Partial<VirtualElementProps>
        childListOrText = []
      } else if (isArray(propsOrChildListOrText)) {
        childListOrText = propsOrChildListOrText as VirtualChildList
      } else if (isNumber(typeOrName)) {
        return {
          type: Math.round(typeOrName) as VirtualNodeType,
          text: propsOrChildListOrText as Primitive,
        } as VirtualText
      } else {
        childListOrText = [propsOrChildListOrText as Primitive]
      }

      let childElementIndex = 0

      // Convert VirtualChildList to VirtualInstanceList
      for (
        index = 0;
        index < (childListOrText as VirtualChildList).length;
        ++index
      ) {
        if (isPrimitive((childListOrText as VirtualChildList)[index])) {
          ;(childListOrText as VirtualInstanceList)[index] = {
            type: VirtualNodeType.TEXT_NODE,
            text: (childListOrText as VirtualChildList)[index] as Primitive,
          } as VirtualText
        } else if (
          VirtualNodeType.ELEMENT_NODE ===
          ((childListOrText as VirtualInstanceList)[index] as VirtualElement)
            .type
        ) {
          ;((childListOrText as VirtualInstanceList)[
            index
          ] as VirtualElement).index = childElementIndex
          ++childElementIndex
        }
      }

      if (isNumber(typeOrName)) {
        if (!props || !props.tag) {
          validateVirtualElementName(props && props.tag)
        }

        return {
          type: typeOrName,
          props: {
            key: ++key,
            ...props,
          },
          index: 0,
          children: childListOrText as VirtualInstanceList,
        } as VirtualElement
      } else {
        validateVirtualElementName(typeOrName)
      }

      return {
        type: VirtualNodeType.ELEMENT_NODE,
        props: {
          tag: typeOrName,
          key: ++key,
          ...props,
        },
        index: 0,
        children: childListOrText as VirtualInstanceList,
      } as VirtualElement
    }

    validateVirtualElementName(typeOrName)

    return {
      type: VirtualNodeType.ELEMENT_NODE,
      props: {
        tag: String(typeOrName),
        key: ++key,
      },
      index: 0,
      children: childListOrText as VirtualInstanceList,
    } as VirtualElement
  }

  public renderVirtualInstance<
    Node,
    Element extends Node = Node,
    Text extends Node = Node,
    Comment extends Node = Node,
    CDATASection extends Node = Node
  >(
    virtualInstance: VirtualInstance,
    operationList: OperationListInterface<
      Node,
      Element,
      Text,
      Comment,
      CDATASection
    >
  ): Element | Text | Comment | CDATASection {
    switch (virtualInstance.type) {
      case VirtualNodeType.ELEMENT_NODE:
        const props: VirtualElementProps = virtualInstance.props
        const element: Element = props.namespace
          ? operationList.createElementNS(props.namespace, props.tag)
          : operationList.createElement(props.tag)

        if (props.attrs) {
          forEach(props.attrs, function(
            attr: VirtualNodeAttrDescriptor | string | number | boolean,
            key: string
          ) {
            isPrimitive(attr)
              ? operationList.setAttribute(element, key, attr)
              : operationList.setAttributeNS(
                  element,
                  (attr as VirtualNodeAttrDescriptor).namespace,
                  key,
                  (attr as VirtualNodeAttrDescriptor).value
                )
          })
        }

        if (virtualInstance.children) {
          for (const child of virtualInstance.children) {
            if (null != child) {
              operationList.appendChild(
                element,
                this.renderVirtualInstance(child, operationList)
              )
            }
          }
        }

        return element
      case VirtualNodeType.TEXT_NODE:
        return operationList.createText(
          null != virtualInstance.text ? String(virtualInstance.text) : ''
        )
      case VirtualNodeType.COMMENT_NODE:
        return operationList.createComment(
          null != virtualInstance.text ? String(virtualInstance.text) : ''
        )
      case VirtualNodeType.CDATA_SECTION_NODE:
        return operationList.createCDATASection(
          null != virtualInstance.text ? String(virtualInstance.text) : ''
        )
    }

    throw TypeError(
      `Unsupported virtual node type "${(virtualInstance as VirtualNode).type}"`
    )
  }
}
