export const enum VirtualNodeType {
  DOCUMENT_FRAGMENT_NODE,
  ELEMENT_NODE,
  TEXT_NODE,
  COMMENT_NODE,
  CDATA_SECTION_NODE,
}

export interface VirtualNode {
  type: VirtualNodeType
  parent?: VirtualParentNode
  nextSibling?: VirtualNode
}

export type Primitive = string | number | boolean

export type VirtualNodeKey = Primitive

export type VirtualNodeAttrDescriptor = {
  prefix: string
  localName: string
  namespaceURI: string
  value: Primitive
}

export type VirtualNodeAttrMap = Record<string, VirtualNodeAttrDescriptor>

type VirtualInstance<VirtualElementProps extends object = {}> =
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
  type: VirtualNodeType.DOCUMENT_FRAGMENT_NODE
}

export interface VirtualElement<VirtualElementProps extends object = {}>
  extends VirtualParentNode {
  type: VirtualNodeType.ELEMENT_NODE
  tagName: string
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

export interface VirtualText extends VirtualContentNode {
  type: VirtualNodeType.TEXT_NODE
}

export interface VirtualComment extends VirtualContentNode {
  type: VirtualNodeType.COMMENT_NODE
}

export interface VirtualCDATASection extends VirtualContentNode {
  type: VirtualNodeType.CDATA_SECTION_NODE
}

export default VirtualInstance
