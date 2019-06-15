import { NodeType } from '@rosem/dom-api'

export interface VirtualNode {
  nodeName: string,
  type: NodeType
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
  nodeName: '#document-fragment'
  type: NodeType.DOCUMENT_FRAGMENT_NODE
}

export interface VirtualText extends VirtualContentNode {
  nodeName: '#text'
  type: NodeType.TEXT_NODE
}

export interface VirtualComment extends VirtualContentNode {
  nodeName: '#comment'
  type: NodeType.COMMENT_NODE
}

export interface VirtualCDATASection extends VirtualContentNode {
  nodeName: '#cdata-section'
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

export default VirtualInstance
