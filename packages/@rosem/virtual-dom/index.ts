import { NodeName, NodeType } from '@rosem/dom-api'

export { default as Hydrator } from './Hydrator'
export { default as HyperRenderer } from './HyperRenderer'
export { default as Renderer } from './Renderer'

export interface VirtualNode {
  readonly nodeName: NodeName | string,
  readonly type: NodeType
  parent?: VirtualParentNode
  nextSibling?: VirtualNode
}

export type Primitive = string | number | boolean

export type VirtualNodeKey = Primitive

export type VirtualNodeAttrDescriptor = {
  prefix?: string
  localName: string
  namespaceURI?: string
  value: Primitive
}

export type VirtualNodeAttrMap = Record<string, VirtualNodeAttrDescriptor>

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
  type: NodeType.DOCUMENT_FRAGMENT_NODE
}

export interface VirtualText extends VirtualContentNode {
  readonly nodeName: NodeName.TEXT_NODE
  type: NodeType.TEXT_NODE
}

export interface VirtualComment extends VirtualContentNode {
  readonly nodeName: NodeName.COMMENT_NODE
  type: NodeType.COMMENT_NODE
}

export interface VirtualCDATASection extends VirtualContentNode {
  readonly nodeName: NodeName.CDATA_SECTION_NODE
  type: NodeType.CDATA_SECTION_NODE
}

export interface VirtualElement<VirtualElementProps extends object = {}>
  extends VirtualParentNode {
  type: NodeType.ELEMENT_NODE
  tagName: string
  prefix?: string
  localName: string
  attrs: VirtualNodeAttrMap
  props: VirtualElementProps
  namespaceURI: string
  key: VirtualNodeKey
}

export interface VirtualCustomElement<
  VirtualElementProps extends object,
  VirtualCustomElementProps extends object
  > extends VirtualElement<VirtualElementProps> {
  customProps: VirtualCustomElementProps
}
