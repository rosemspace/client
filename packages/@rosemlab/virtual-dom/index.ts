import { NodeName, NodeType } from '@rosemlab/dom-api'

export { default as VDOMHydrator } from './VDOMHydrator'
export { default as VDOMHyperRenderer } from './VDOMHyperRenderer'
export { default as VDOMRenderer } from './VDOMRenderer'

export type VirtualContent = string | number | boolean

export type VirtualNodeKey = VirtualContent

export interface VirtualNode {
  readonly nodeName: NodeName | string
  readonly type: NodeType
  parent?: VirtualParentNode
  nextSibling?: VirtualNode
}

export type VirtualAttr = {
  readonly prefix?: string
  readonly localName: string
  readonly namespaceURI?: string
  readonly ownerElement: VirtualElement
  value: VirtualContent
}

export type VirtualNodeAttrMap = Record<string, VirtualAttr>

export type VirtualInstance =
  | VirtualDocumentFragment
  | VirtualElement
  | VirtualText
  | VirtualComment
  | VirtualCDATASection

export type VirtualNodeList = VirtualNode[]

export type VirtualChildNodeList = Array<VirtualNode | VirtualContent>

export interface VirtualParentNode extends VirtualNode {
  children: VirtualNodeList
}

export interface VirtualContentNode extends VirtualNode {
  text: VirtualContent
}

export interface VirtualDocumentFragment extends VirtualParentNode {
  readonly nodeName: NodeName.DOCUMENT_FRAGMENT_NODE
  readonly type: NodeType.DOCUMENT_FRAGMENT_NODE
}

export interface VirtualText extends VirtualContentNode {
  readonly nodeName: NodeName.TEXT_NODE
  readonly type: NodeType.TEXT_NODE
}

export interface VirtualComment extends VirtualContentNode {
  readonly nodeName: NodeName.COMMENT_NODE
  readonly type: NodeType.COMMENT_NODE
}

export interface VirtualCDATASection extends VirtualContentNode {
  readonly nodeName: NodeName.CDATA_SECTION_NODE
  readonly type: NodeType.CDATA_SECTION_NODE
}

export interface VirtualElement extends VirtualParentNode {
  readonly type: NodeType.ELEMENT_NODE
  readonly tagName: string
  readonly prefix?: string
  readonly localName: string
  attrs: VirtualNodeAttrMap
  readonly namespaceURI: string
  readonly key: VirtualNodeKey
}

export interface VirtualCustomElement extends VirtualElement {
  props: unknown[]
  shadowRoot: VirtualDocumentFragment
}
