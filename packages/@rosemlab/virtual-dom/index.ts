import { NodeName, NodeType } from '@rosemlab/dom-api'

export { default as VDOMHydrator } from './VDOMHydrator'
export { default as VDOMHyperRenderer } from './VDOMHyperRenderer'
export { default as VDOMRenderer } from './VDOMRenderer'

export interface VirtualNode {
  readonly nodeName: NodeName | string
  readonly type: NodeType
  parent?: VirtualParentNode
  nextSibling?: VirtualNode
}

export type VirtualNodeKey = Primitive

export type VirtualAttr = {
  readonly prefix?: string
  readonly localName: string
  readonly namespaceURI?: string
  readonly ownerElement: VirtualElement
  value: Primitive
}

export type VirtualNodeAttrMap = Record<string, VirtualAttr>

export type VirtualInstance<VirtualElementProps extends object = {}> =
  | VirtualDocumentFragment
  | VirtualElement<VirtualElementProps>
  | VirtualText
  | VirtualComment
  | VirtualCDATASection

export type VirtualNodeList = VirtualNode[]

export type VirtualChildNodeList = Array<VirtualNode | Primitive>

export interface VirtualParentNode extends VirtualNode {
  children: VirtualNodeList
}

export interface VirtualContentNode extends VirtualNode {
  text: Primitive
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

export interface VirtualElement<VirtualElementProps extends object = {}>
  extends VirtualParentNode {
  readonly type: NodeType.ELEMENT_NODE
  readonly tagName: string
  readonly prefix?: string
  readonly localName: string
  attrs: VirtualNodeAttrMap
  props: VirtualElementProps
  readonly namespaceURI: string
  readonly key: VirtualNodeKey
}

export interface VirtualCustomElement<
  VirtualCustomElementProps extends object = {}
> extends VirtualElement {
  customProps: VirtualCustomElementProps
}
