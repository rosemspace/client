export { default as DOMRenderer } from './DOMRenderer'
export { default as DOMConverter } from './DOMConverter'

export enum NodeType {
  ELEMENT_NODE = 1,
  ATTRIBUTE_NODE = 2,
  TEXT_NODE = 3,
  CDATA_SECTION_NODE = 4,
  ENTITY_REFERENCE_NODE = 5,
  ENTITY_NODE = 6,
  PROCESSING_INSTRUCTION_NODE = 7,
  COMMENT_NODE = 8,
  DOCUMENT_NODE = 9,
  DOCUMENT_TYPE_NODE = 10,
  DOCUMENT_FRAGMENT_NODE = 11,
  XML_DECLARATION_NODE = 17,
}

export enum NodeName {
  TEXT_NODE = '#text',
  CDATA_SECTION_NODE = '#cdata-section',
  COMMENT_NODE = '#comment',
  DOCUMENT_NODE = '#document',
  DOCUMENT_TYPE_NODE = '#document-type',
  DOCUMENT_FRAGMENT_NODE = '#document-fragment',
  XML_DECLARATION_NODE = '#xml-declaration',
  PROCESSING_INSTRUCTION = '#processing-instruction',
}
