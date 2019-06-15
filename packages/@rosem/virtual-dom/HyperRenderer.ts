import forEach from 'lodash/forEach'
import isArray from 'lodash/isArray'
import isPlainObject from 'lodash/isPlainObject'
import isString from 'lodash/isString'
import isPrimitive from '@rosem/common-util/isPrimitive'
import { NodeType } from '@rosem/dom-api'
import Renderer from './Renderer'
import VirtualInstance, {
  Primitive,
  VirtualChildNodeList,
  VirtualNode,
  VirtualNodeAttrDescriptor,
  VirtualNodeKey,
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
  key: VirtualNodeKey
}>

export default class HyperRenderer<
  VirtualElementProps extends object,
  VirtualCustomElementProps extends object
> extends Renderer<VirtualElementProps> {
  constructor() {
    super()
    this.createInstance = this.createInstance.bind(this)
  }

  createInstance(type: NodeType): VirtualInstance<VirtualElementProps>

  createInstance(
    type: NodeType,
    childList: VirtualChildNodeList
  ): VirtualInstance<VirtualElementProps>

  createInstance(
    type: NodeType,
    text: Primitive
  ): VirtualInstance<VirtualElementProps>

  createInstance(
    type: NodeType,
    props: HyperRendererProps<VirtualElementProps, VirtualCustomElementProps>
  ): VirtualInstance<VirtualElementProps>

  createInstance(
    type: NodeType,
    props: HyperRendererProps<VirtualElementProps, VirtualCustomElementProps>,
    childList: VirtualChildNodeList
  ): VirtualInstance<VirtualElementProps>

  createInstance(
    type: NodeType,
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
    typeOrChildListOrName: NodeType | VirtualChildNodeList | string,
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

    let type: NodeType

    if (isString(typeOrChildListOrName)) {
      type =
        '' === typeOrChildListOrName
          ? NodeType.TEXT_NODE
          : NodeType.ELEMENT_NODE
    } else if (isArray(typeOrChildListOrName)) {
      type = NodeType.DOCUMENT_FRAGMENT_NODE
      childListOrText = typeOrChildListOrName as VirtualChildNodeList
    } else {
      type = typeOrChildListOrName as NodeType
    }

    switch (type) {
      case NodeType.DOCUMENT_FRAGMENT_NODE: {
        const documentFragment = this.createDocumentFragment()

        this.appendChildNodeList(documentFragment, childListOrText)

        return documentFragment
      }
      case NodeType.ELEMENT_NODE: {
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
              : `"name" property is required for a virtual element`
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
              : null == (attr as VirtualNodeAttrDescriptor).namespaceURI
              ? this.setAttribute(
                  virtualElement,
                  attrName,
                  (attr as VirtualNodeAttrDescriptor).value
                )
              : this.setAttributeNS(
                  virtualElement,
                  (attr as VirtualNodeAttrDescriptor).namespaceURI as string,
                  attrName,
                  (attr as VirtualNodeAttrDescriptor).value
                )
          }
        )

        this.appendChildNodeList(virtualElement, childListOrText)

        return virtualElement
      }
      case NodeType.TEXT_NODE:
        return this.createText((childListOrText[0] as Primitive) || '')
      case NodeType.COMMENT_NODE:
        return this.createComment((childListOrText[0] as Primitive) || '')
      case NodeType.CDATA_SECTION_NODE:
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
