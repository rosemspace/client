import { NodeName, NodeType } from '@rosemlabs/dom-api'

export { default as VDOMConverter } from './VDOMConverter'
export { default as VDOMHyperRenderer } from './VDOMHyperRenderer'
export { default as VDOMRenderer } from './VDOMRenderer'

export type VirtualContent = string

export type VirtualNodeKey = string | number

export interface VirtualNode {
  readonly nodeName: NodeName | string
  readonly type: NodeType
  parent?: VirtualNode/* & VirtualParentNode*/
  nextSibling?: VirtualNode
  childNodes: VirtualNodeList
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

// export interface VirtualParentNode {
//   children: VirtualNodeList
// }

export interface VirtualCharacterData extends VirtualNode {
  text: VirtualContent
}

export interface VirtualDocumentFragment extends VirtualNode/*, VirtualParentNode*/ {
  readonly nodeName: NodeName.DOCUMENT_FRAGMENT_NODE
  readonly type: NodeType.DOCUMENT_FRAGMENT_NODE
}

export interface VirtualText extends VirtualCharacterData {
  readonly nodeName: NodeName.TEXT_NODE
  readonly type: NodeType.TEXT_NODE
}

export interface VirtualComment extends VirtualCharacterData {
  readonly nodeName: NodeName.COMMENT_NODE
  readonly type: NodeType.COMMENT_NODE
}

export interface VirtualCDATASection extends VirtualCharacterData {
  readonly nodeName: NodeName.CDATA_SECTION_NODE
  readonly type: NodeType.CDATA_SECTION_NODE
}

export interface VirtualElement extends VirtualNode/*, VirtualParentNode*/ {
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
