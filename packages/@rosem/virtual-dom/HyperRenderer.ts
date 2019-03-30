import isPrimitive from '@rosem-util/common/isPrimitive'
import { forEach, isArray, isPlainObject, isString } from 'lodash-es'
import VirtualRenderer from '@rosem/virtual-dom/VirtualRenderer'
import VirtualInstance, {
  Primitive,
  VirtualChildNodeList,
  VirtualNode,
  VirtualNodeAttrDescriptor,
  VirtualNodeKey,
  VirtualNodeType,
  VirtualParentNode,
} from './VirtualInstance'

export let key = 0

export type HyperRendererProps<
  VirtualElementProps extends object,
  VirtualCustomElementProps extends object
> = Partial<{
  tagName: string
  attrs: Record<string, { namespaceURI: string; value: Primitive } | Primitive>
  props: VirtualElementProps
  customProps: VirtualCustomElementProps
  namespaceURI: string
  void: boolean
  key: VirtualNodeKey
}>

export default class HyperRenderer<
  VirtualElementProps extends object,
  VirtualCustomElementProps extends object
> extends VirtualRenderer<VirtualElementProps> {
  createInstance(type: VirtualNodeType): VirtualInstance<VirtualElementProps>

  createInstance(
    type: VirtualNodeType,
    childList: VirtualChildNodeList
  ): VirtualInstance<VirtualElementProps>

  createInstance(
    type: VirtualNodeType,
    text: Primitive
  ): VirtualInstance<VirtualElementProps>

  createInstance(
    type: VirtualNodeType,
    props: HyperRendererProps<VirtualElementProps, VirtualCustomElementProps>
  ): VirtualInstance<VirtualElementProps>

  createInstance(
    type: VirtualNodeType,
    props: HyperRendererProps<VirtualElementProps, VirtualCustomElementProps>,
    childList: VirtualChildNodeList
  ): VirtualInstance<VirtualElementProps>

  createInstance(
    type: VirtualNodeType,
    props: HyperRendererProps<VirtualElementProps, VirtualCustomElementProps>,
    text: Primitive
  ): VirtualInstance<VirtualElementProps>

  createInstance(
    childList: VirtualChildNodeList
  ): VirtualInstance<VirtualElementProps>

  createInstance(name: string): VirtualInstance<VirtualElementProps>

  createInstance(
    name: string,
    childList: VirtualChildNodeList
  ): VirtualInstance<VirtualElementProps>

  createInstance(
    name: string,
    text: Primitive
  ): VirtualInstance<VirtualElementProps>

  createInstance(
    name: string,
    props: HyperRendererProps<VirtualElementProps, VirtualCustomElementProps>
  ): VirtualInstance<VirtualElementProps>

  createInstance(
    name: string,
    props: HyperRendererProps<VirtualElementProps, VirtualCustomElementProps>,
    childList: VirtualChildNodeList
  ): VirtualInstance<VirtualElementProps>

  createInstance(
    name: string,
    props: HyperRendererProps<VirtualElementProps, VirtualCustomElementProps>,
    text: Primitive
  ): VirtualInstance<VirtualElementProps>

  createInstance(
    typeOrChildListOrName: VirtualNodeType | VirtualChildNodeList | string,
    propsOrChildListOrText?:
      | HyperRendererProps<VirtualElementProps, VirtualCustomElementProps>
      | VirtualChildNodeList
      | Primitive,
    childListOrText?: VirtualChildNodeList | Primitive
  ): VirtualInstance<VirtualElementProps> {
    let props: HyperRendererProps<
      VirtualElementProps,
      VirtualCustomElementProps
    > = {}

    if (arguments.length > 1) {
      if (childListOrText) {
        props = propsOrChildListOrText as HyperRendererProps<
          VirtualElementProps,
          VirtualCustomElementProps
        >

        if (!isArray(childListOrText)) {
          childListOrText = [childListOrText as Primitive]
        }
      } else if (isPlainObject(propsOrChildListOrText)) {
        props = propsOrChildListOrText as HyperRendererProps<
          VirtualElementProps,
          VirtualCustomElementProps
        >
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
      case VirtualNodeType.DOCUMENT_FRAGMENT_NODE: {
        const documentFragment = this.createDocumentFragment()

        this.appendChildNodeList(documentFragment, childListOrText)

        return documentFragment
      }
      case VirtualNodeType.ELEMENT_NODE: {
        typeOrChildListOrName = props.tagName || typeOrChildListOrName

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
              : `"tagName" property is required for a virtual element`
          )
        }

        const virtualElement = this.createElement(typeOrChildListOrName)

        Object.assign(virtualElement, props)

        forEach(
          virtualElement.attrs,
          (
            attr: VirtualNodeAttrDescriptor | Primitive,
            attrName: string
          ): void => {
            isPrimitive(attr)
              ? this.setAttribute(virtualElement, attrName, attr)
              : (attr as VirtualNodeAttrDescriptor).namespaceURI
              ? this.setAttributeNS(
                  virtualElement,
                  (attr as VirtualNodeAttrDescriptor).namespaceURI,
                  attrName,
                  (attr as VirtualNodeAttrDescriptor).value
                )
              : this.setAttribute(
                  virtualElement,
                  attrName,
                  (attr as VirtualNodeAttrDescriptor).value
                )
          }
        )

        this.appendChildNodeList(virtualElement, childListOrText)

        return virtualElement
      }
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
  ): void {
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
