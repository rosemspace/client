import { NodeName, NodeType } from '@rosemlabs/dom-api'
import { SourceSupportedType, Token } from './index'

export default interface Node extends Token {
  nodeType: NodeType
  // Not transformed
  nodeName: NodeName | string
}

export interface ChildNode extends Node {
  // AST plugin
  parentElement?: Element
  nextSibling?: Element | Text | Comment | CDATASection
  previousSibling?: Element | Text | Comment | CDATASection
}

export interface ParentNode {
  // AST plugin
  childNodes?: (Element | Text | Comment | CDATASection)[]
}

export interface Document extends Node, ChildNode {
  nodeType: NodeType.DOCUMENT_NODE
  nodeName: NodeName.DOCUMENT_NODE
}

export interface DocumentType extends Node, ChildNode {
  nodeType: NodeType.DOCUMENT_TYPE_NODE
  contentType: SourceSupportedType
}

export interface DocumentFragment extends Node, ChildNode {
  nodeType: NodeType.DOCUMENT_FRAGMENT_NODE
  nodeName: NodeName.DOCUMENT_FRAGMENT_NODE
}

export interface Element extends Node, ChildNode, ParentNode {
  nodeType: NodeType.ELEMENT_NODE
  attributes: Attr[]
  // Not transformed
  localName: string
  // Not transformed
  prefix?: string
  // Transformed
  tagName: string
  unarySlash: string
  void: boolean
  // Attributes map plugin
  // attrsMap?: { [name: string]: Primitive }
  // rawAttrsMap?: { [name: string]: Attr }
  // Language plugin
  lang?: string
  // xmlns plugin
  namespaceURI?: string
}

export interface Attr extends Node {
  // Not transformed
  localName: string
  // Transformed
  name: string
  ownerElement: Element
  // Not transformed
  prefix?: string
  value: string
  // xmlns plugin
  namespaceURI?: string
}

export interface CharacterData extends Node, ChildNode {
  data: string
}

export interface Text extends CharacterData {
  nodeType: NodeType.TEXT_NODE
  nodeName: NodeName.TEXT_NODE
  raw: boolean
}

export interface Comment extends CharacterData {
  nodeType: NodeType.COMMENT_NODE
  nodeName: NodeName.COMMENT_NODE
  //todo remove "?"
  conditional?: boolean
}

export interface ProcessingInstruction extends CharacterData {}

export interface CDATASection extends Omit<Text, 'nodeType' | 'nodeName'> {
  nodeType: NodeType.CDATA_SECTION_NODE
  nodeName: NodeName.CDATA_SECTION_NODE
  raw: true
}
