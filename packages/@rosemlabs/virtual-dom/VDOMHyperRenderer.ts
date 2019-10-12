import forEach from 'lodash/forEach'
import isArray from 'lodash/isArray'
import isPlainObject from 'lodash/isPlainObject'
import isString from 'lodash/isString'
import isPrimitive from '@rosemlabs/common-util/isPrimitive'
import { NodeType } from '@rosemlabs/dom-api'
import VDOMRenderer from './VDOMRenderer'
import {
  VirtualInstance,
  VirtualChildNodeList,
  VirtualNode,
  VirtualAttr,
  VirtualNodeKey,
  VirtualParentNode,
  VirtualContent,
} from '.'

export let key = 0

export type HyperRendererProps = Partial<{
  tagName: string
  attrs: Record<
    string,
    { namespaceURI: string; value: VirtualContent } | VirtualContent
  >
  props: any[]
  namespaceURI: string
  key: VirtualNodeKey
}>

export default class VDOMHyperRenderer extends VDOMRenderer {
  constructor() {
    super()
    this.createInstance = this.createInstance.bind(this)
  }

  // createInstance(type: NodeType): VirtualInstance
  //
  // createInstance(
  //   type: NodeType,
  //   childList: VirtualChildNodeList
  // ): VirtualInstance
  //
  // createInstance(type: NodeType, text: VirtualContent): VirtualInstance
  //
  // createInstance(type: NodeType, props: HyperRendererProps): VirtualInstance
  //
  // createInstance(
  //   type: NodeType,
  //   props: HyperRendererProps,
  //   childList: VirtualChildNodeList
  // ): VirtualInstance
  //
  // createInstance(
  //   type: NodeType,
  //   props: HyperRendererProps,
  //   text: VirtualContent
  // ): VirtualInstance
  //
  // createInstance(childList: VirtualChildNodeList): VirtualInstance
  //
  // createInstance(name: string): VirtualInstance
  //
  // createInstance(name: string, childList: VirtualChildNodeList): VirtualInstance
  //
  // createInstance(name: string, text: VirtualContent): VirtualInstance
  //
  // createInstance(name: string, props: HyperRendererProps): VirtualInstance
  //
  // createInstance(
  //   name: string,
  //   props: HyperRendererProps,
  //   childList: VirtualChildNodeList
  // ): VirtualInstance
  //
  // createInstance(
  //   name: string,
  //   props: HyperRendererProps,
  //   text: VirtualContent
  // ): VirtualInstance

  createInstance(
    typeOrChildListOrName: NodeType | VirtualChildNodeList | string,
    propsOrChildListOrText?:
      | HyperRendererProps
      | VirtualChildNodeList
      | VirtualContent,
    childListOrText?: VirtualChildNodeList | VirtualContent
  ): VirtualInstance {
    let props: HyperRendererProps = {}

    if (arguments.length > 1) {
      if (childListOrText) {
        props = propsOrChildListOrText as HyperRendererProps

        if (!isArray(childListOrText)) {
          childListOrText = [childListOrText as VirtualContent]
        }
      } else if (isPlainObject(propsOrChildListOrText)) {
        props = propsOrChildListOrText as HyperRendererProps
        childListOrText = []
      } else if (isArray(propsOrChildListOrText)) {
        childListOrText = propsOrChildListOrText as VirtualChildNodeList
      } else {
        childListOrText = [propsOrChildListOrText as VirtualContent]
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
          (attr: VirtualAttr | VirtualContent, attrName: string): void => {
            isPrimitive(attr)
              ? this.setAttribute(virtualElement, attrName, attr)
              : null == (attr as VirtualAttr).namespaceURI
              ? this.setAttribute(
                  virtualElement,
                  attrName,
                  (attr as VirtualAttr).value
                )
              : this.setAttributeNS(
                  virtualElement,
                  (attr as VirtualAttr).namespaceURI as string,
                  attrName,
                  (attr as VirtualAttr).value
                )
          }
        )

        this.appendChildNodeList(virtualElement, childListOrText)

        return virtualElement
      }
      case NodeType.TEXT_NODE:
        return this.createText((childListOrText[0] as VirtualContent) || '')
      case NodeType.COMMENT_NODE:
        return this.createComment((childListOrText[0] as VirtualContent) || '')
      case NodeType.CDATA_SECTION_NODE:
        return this.createCDATASection(
          (childListOrText[0] as VirtualContent) || ''
        )
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
          ? this.createText(child as VirtualContent)
          : (child as VirtualNode)
      )
    }
  }
}
