import { NodeName, NodeType } from '@rosemlabs/dom-api'
import { Except } from 'type-fest'
import { SourceSupportedType } from './index'
import { ElementAttrMap } from './modules'
import Token from './token'

export interface VNode extends Token {
  nodeType: NodeType
  // Not transformed
  nodeName: NodeName | string
}

export interface VChildNode extends VNode {
  parentElement?: VElement
  nextSibling?: VElement | VText | VComment | VCDATASection
  previousSibling?: VElement | VText | VComment | VCDATASection
}

export interface VParentNode {
  childNodes?: (VElement | VText | VComment | VCDATASection)[]
}

export interface VDocument extends VNode, VChildNode {
  nodeType: NodeType.DOCUMENT_NODE
  nodeName: NodeName.DOCUMENT_NODE
}

export interface VDocumentType extends VNode, VChildNode {
  nodeType: NodeType.DOCUMENT_TYPE_NODE
  contentType: SourceSupportedType
}

export interface VDocumentFragment extends VNode, VChildNode {
  nodeType: NodeType.DOCUMENT_FRAGMENT_NODE
  nodeName: NodeName.DOCUMENT_FRAGMENT_NODE
}

export interface VElement
  extends VNode,
    VChildNode,
    VParentNode,
    ElementAttrMap {
  nodeType: NodeType.ELEMENT_NODE
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

export interface VAttr extends VNode {
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

export interface VCharacterData extends VNode, VChildNode {
  data: string
}

export interface VText extends VCharacterData {
  nodeType: NodeType.TEXT_NODE
  nodeName: NodeName.TEXT_NODE
  raw: boolean
}

export interface VComment extends VCharacterData {
  nodeType: NodeType.COMMENT_NODE
  nodeName: NodeName.COMMENT_NODE
  //todo remove "?"
  conditional?: boolean
}

export type VProcessingInstruction = VCharacterData

export interface VCDATASection extends Except<VText, 'nodeType' | 'nodeName'> {
  nodeType: NodeType.CDATA_SECTION_NODE
  nodeName: NodeName.CDATA_SECTION_NODE
  raw: true
}
