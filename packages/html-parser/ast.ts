import { NodeName, NodeType } from '@rosemlabs/dom-api'
import { SourceSupportedType } from './index'
import { ElementAttrMap } from './modules'
import Token from './token'

export interface VNode<
  T extends NodeType = NodeType,
  U extends NodeName = NodeName
> extends Token {
  nodeType: T
  // Not transformed
  nodeName: U | string
}

export interface VChildNode<
  T extends NodeType = NodeType,
  U extends NodeName = NodeName
> extends VNode<T, U> {
  parentElement?: VElement
  nextSibling?: VElement | VText | VComment | VCDATASection
  previousSibling?: VElement | VText | VComment | VCDATASection
}

export interface VParentNode {
  childNodes?: (VElement | VText | VComment | VCDATASection)[]
}

export interface VDocument
  extends VNode<NodeType.DOCUMENT_NODE, NodeName.DOCUMENT_NODE>,
    VChildNode<NodeType.DOCUMENT_NODE, NodeName.DOCUMENT_NODE> {}

export interface VDocumentType
  extends VNode<NodeType.DOCUMENT_TYPE_NODE, NodeName.DOCUMENT_TYPE_NODE>,
    VChildNode<NodeType.DOCUMENT_TYPE_NODE, NodeName.DOCUMENT_TYPE_NODE> {
  contentType: SourceSupportedType
}

export interface VDocumentFragment extends VNode, VChildNode {
  nodeType: NodeType.DOCUMENT_FRAGMENT_NODE
  nodeName: NodeName.DOCUMENT_FRAGMENT_NODE
}

export interface VElement
  extends VNode<NodeType.ELEMENT_NODE>,
    VChildNode<NodeType.ELEMENT_NODE>,
    VParentNode,
    ElementAttrMap {
  attributes: VAttr[]
  // Not transformed
  localName: string
  // Not transformed
  prefix?: string
  // Transformed
  tagName: string
  unarySlash: string // selfClosing
  void: boolean
  // Language module
  lang?: string
  // xmlns module
  namespaceURI?: string
}

//todo VCustomElement and VComponent

export interface VAttr extends VNode<NodeType.ATTRIBUTE_NODE> {
  // Not transformed
  localName: string
  // Lowercased
  name: string
  ownerElement: VElement
  // Not transformed
  prefix?: string
  value: string
  // xmlns module
  namespaceURI?: string
}

export interface VCharacterData<
  T extends
    | NodeType.TEXT_NODE
    | NodeType.COMMENT_NODE
    | NodeType.CDATA_SECTION_NODE
    | NodeType.PROCESSING_INSTRUCTION_NODE =
    | NodeType.TEXT_NODE
    | NodeType.COMMENT_NODE
    | NodeType.CDATA_SECTION_NODE
    | NodeType.PROCESSING_INSTRUCTION_NODE,
  U extends
    | NodeName.TEXT_NODE
    | NodeName.COMMENT_NODE
    | NodeName.CDATA_SECTION_NODE
    | NodeName.PROCESSING_INSTRUCTION =
    | NodeName.TEXT_NODE
    | NodeName.COMMENT_NODE
    | NodeName.CDATA_SECTION_NODE
    | NodeName.PROCESSING_INSTRUCTION
> extends VNode<T, U>, VChildNode<T, U> {
  data: string
}

export interface VText<
  T extends
    | NodeType.TEXT_NODE
    | NodeType.CDATA_SECTION_NODE = NodeType.TEXT_NODE,
  U extends
    | NodeName.TEXT_NODE
    | NodeName.CDATA_SECTION_NODE = NodeName.TEXT_NODE
> extends VCharacterData<T, U> {
  raw: boolean
}

export interface VComment
  extends VCharacterData<NodeType.COMMENT_NODE, NodeName.COMMENT_NODE> {
  //todo remove "?"
  conditional?: boolean
}

export type VProcessingInstruction = VCharacterData<
  NodeType.PROCESSING_INSTRUCTION_NODE,
  NodeName.PROCESSING_INSTRUCTION
>

export interface VCDATASection
  extends VText<NodeType.CDATA_SECTION_NODE, NodeName.CDATA_SECTION_NODE> {
  raw: true
}
