export enum VirtualNodeType {
  ELEMENT_NODE,
  TEXT_NODE,
  COMMENT_NODE,
  CDATA_SECTION_NODE,
}

export interface VirtualNode {
  type: VirtualNodeType
  parentElement?: VirtualElement
  nextSibling?: VirtualInstance
}

export type Primitive = string | number | boolean

export type VirtualNodeKey = Primitive

export type VirtualNodeAttrDescriptor = {
  namespace: string
  value: Primitive
}

export type VirtualNodeAttrMap = Record<string, VirtualNodeAttrDescriptor | Primitive>

export type VirtualElementProps = {
  tag: string,
  key: VirtualNodeKey
  namespace?: string
  attrs: VirtualNodeAttrMap
}// & Record<string, Primitive>

type VirtualInstance = VirtualElement | VirtualText | VirtualComment | VirtualCDATASection

export type VirtualInstanceList = VirtualInstance[]

export type VirtualChildList = Array<VirtualInstance | Primitive>

export interface VirtualElement extends VirtualNode {
  type: VirtualNodeType.ELEMENT_NODE
  props: VirtualElementProps
  index: number
  children: VirtualInstanceList
}

export interface VirtualText extends VirtualNode {
  type: VirtualNodeType.TEXT_NODE
  text: Primitive
}

export interface VirtualComment extends VirtualNode {
  type: VirtualNodeType.COMMENT_NODE
  text: Primitive
}

export interface VirtualCDATASection extends VirtualNode {
  type: VirtualNodeType.CDATA_SECTION_NODE
  text: Primitive
}

export default VirtualInstance
