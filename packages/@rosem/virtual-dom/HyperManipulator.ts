import isPrimitive from '@rosem-util/common/isPrimitive'
import { isArray, isPlainObject, isString } from 'lodash-es'
import Manipulator from './Manipulator'
import VirtualInstance, {
  Primitive,
  VirtualChildNodeList,
  VirtualElementProps,
  VirtualNode,
  VirtualNodeType,
  VirtualParentNode,
} from './VirtualInstance'

export let key = 0

export default class HyperManipulator<
  VirtualElementExtendedProps extends VirtualElementProps = VirtualElementProps
> extends Manipulator<VirtualElementExtendedProps> {
  createInstance(
    type: VirtualNodeType
  ): VirtualInstance<VirtualElementExtendedProps>

  createInstance(
    type: VirtualNodeType,
    childList: VirtualChildNodeList
  ): VirtualInstance<VirtualElementExtendedProps>

  createInstance(
    type: VirtualNodeType,
    text: Primitive
  ): VirtualInstance<VirtualElementExtendedProps>

  createInstance(
    type: VirtualNodeType,
    props: Partial<VirtualElementExtendedProps>
  ): VirtualInstance<VirtualElementExtendedProps>

  createInstance(
    type: VirtualNodeType,
    props: Partial<VirtualElementExtendedProps>,
    childList: VirtualChildNodeList
  ): VirtualInstance<VirtualElementExtendedProps>

  createInstance(
    type: VirtualNodeType,
    props: Partial<VirtualElementExtendedProps>,
    text: Primitive
  ): VirtualInstance<VirtualElementExtendedProps>

  createInstance(
    childList: VirtualChildNodeList
  ): VirtualInstance<VirtualElementExtendedProps>

  createInstance(name: string): VirtualInstance<VirtualElementExtendedProps>

  createInstance(
    name: string,
    childList: VirtualChildNodeList
  ): VirtualInstance<VirtualElementExtendedProps>

  createInstance(
    name: string,
    text: Primitive
  ): VirtualInstance<VirtualElementExtendedProps>

  createInstance(
    name: string,
    props: Partial<VirtualElementExtendedProps>
  ): VirtualInstance<VirtualElementExtendedProps>

  createInstance(
    name: string,
    props: Partial<VirtualElementExtendedProps>,
    childList: VirtualChildNodeList
  ): VirtualInstance<VirtualElementExtendedProps>

  createInstance(
    name: string,
    props: Partial<VirtualElementExtendedProps>,
    text: Primitive
  ): VirtualInstance<VirtualElementExtendedProps>

  createInstance(
    typeOrChildListOrName: VirtualNodeType | VirtualChildNodeList | string,
    propsOrChildListOrText?:
      | Partial<VirtualElementExtendedProps>
      | VirtualChildNodeList
      | Primitive,
    childListOrText?: VirtualChildNodeList | Primitive
  ): VirtualInstance<VirtualElementExtendedProps> {
    let props: Partial<VirtualElementExtendedProps> = {}

    if (arguments.length > 1) {
      if (childListOrText) {
        props = propsOrChildListOrText as Partial<VirtualElementExtendedProps>

        if (!isArray(childListOrText)) {
          childListOrText = [childListOrText as Primitive]
        }
      } else if (isPlainObject(propsOrChildListOrText)) {
        props = propsOrChildListOrText as Partial<VirtualElementExtendedProps>
        childListOrText = []
      } else if (isArray(propsOrChildListOrText)) {
        childListOrText = propsOrChildListOrText as VirtualChildNodeList
      } else {
        childListOrText = [propsOrChildListOrText as Primitive]
      }
    } else {
      childListOrText = []
    }

    let type: VirtualNodeType

    if (isString(typeOrChildListOrName)) {
      type =
        '' === typeOrChildListOrName
          ? VirtualNodeType.TEXT_NODE
          : VirtualNodeType.ELEMENT_NODE
    } else if (isArray(typeOrChildListOrName)) {
      type = VirtualNodeType.DOCUMENT_FRAGMENT_NODE
      childListOrText = typeOrChildListOrName as VirtualChildNodeList
    } else {
      type = typeOrChildListOrName as VirtualNodeType
    }

    switch (type) {
      case VirtualNodeType.DOCUMENT_FRAGMENT_NODE:
        const documentFragment = this.createDocumentFragment()

        this.appendChildNodeList(documentFragment, childListOrText)

        return documentFragment
      case VirtualNodeType.ELEMENT_NODE:
        typeOrChildListOrName = props.tag || typeOrChildListOrName

        if (
          null == typeOrChildListOrName ||
          !isString(typeOrChildListOrName) ||
          '' === typeOrChildListOrName
        ) {
          throw new TypeError(
            null == typeOrChildListOrName || '' === typeOrChildListOrName
              ? `Missed name of a virtual element`
              : isString(typeOrChildListOrName)
              ? `Invalid name "${(typeOrChildListOrName as string).toString()}" of a virtual element`
              : `"tag" property is required for a virtual element`
          )
        }

        const virtualElement = this.createElement(typeOrChildListOrName)

        Object.assign(virtualElement.props, props)
        this.appendChildNodeList(virtualElement, childListOrText)

        return virtualElement
      case VirtualNodeType.TEXT_NODE:
        return this.createText((childListOrText[0] as Primitive) || '')
      case VirtualNodeType.COMMENT_NODE:
        return this.createComment((childListOrText[0] as Primitive) || '')
      case VirtualNodeType.CDATA_SECTION_NODE:
        return this.createCDATASection((childListOrText[0] as Primitive) || '')
    }

    throw TypeError(`Unsupported virtual node type "${typeOrChildListOrName}"`)
  }

  protected appendChildNodeList(
    parent: VirtualParentNode,
    childNodeList: VirtualChildNodeList
  ) {
    // Convert VirtualChildNodeList to VirtualNodeList
    for (const child of childNodeList) {
      this.appendChild(
        parent,
        isPrimitive(child)
          ? this.createText(child as Primitive)
          : (child as VirtualNode)
      )
    }
  }
}
