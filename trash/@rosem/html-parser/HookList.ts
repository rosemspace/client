import Tokenizer from './Tokenizer'
import Node, {
  Attr,
  CDATASection,
  CharacterData,
  ChildNode,
  Comment,
  DocumentType,
  ParentNode,
  ProcessingInstruction,
  Text,
  Element,
  SourceCodeLocation,
} from './node'

export type StartHook<S extends Tokenizer = Tokenizer> = (
  mimeType: string,
  state: S
) => void
export type DocumentTypeHook<
  T extends DocumentType = DocumentType,
  S extends Tokenizer = Tokenizer
> = (documentType: T, state: S) => void
export type ProcessingInstructionHook<
  T extends ProcessingInstruction = ProcessingInstruction,
  S extends Tokenizer = Tokenizer
> = (processingInstruction: T, state: S) => void
export type ElementHook<
  T extends Element = Element,
  S extends Tokenizer = Tokenizer
> = (element: T, state: S) => void
export type AttrHook<T extends Attr = Attr, S extends Tokenizer = Tokenizer> = (
  attr: T,
  state: S
) => void
export type TextHook<T extends Text = Text, S extends Tokenizer = Tokenizer> = (
  text: T,
  state: S
) => void
export type CommentHook<
  T extends Comment = Comment,
  S extends Tokenizer = Tokenizer
> = (comment: T, state: S) => void
export type CDATASectionHook<
  T extends CDATASection = CDATASection,
  S extends Tokenizer = Tokenizer
> = (cDATASection: T, state: S) => void
export type WarningHook<T extends SourceCodeLocation = SourceCodeLocation> = (
  message: string,
  location: T
) => void
export type EndHook<S extends Tokenizer = Tokenizer> = (state: S) => void

type HookList<
  EState extends Tokenizer = Tokenizer,
  ENode extends Node = Node,
  EChildNode extends ChildNode = ChildNode,
  EParentNode extends ParentNode = ParentNode,
  EElement extends Element & ENode & EChildNode & EParentNode = Element &
    ENode &
    EChildNode &
    EParentNode,
  EAttr extends Attr & ENode = Attr & ENode,
  ECharacterData extends CharacterData & EChildNode = CharacterData &
    EChildNode,
  EText extends Text & ECharacterData = Text & ECharacterData,
  EComment extends Comment & ECharacterData = Comment & ECharacterData,
  ECDATASection extends CDATASection & ECharacterData = CDATASection &
    ECharacterData,
  EProcessingInstruction extends ProcessingInstruction &
    EChildNode = ProcessingInstruction & EChildNode,
  EDocumentType extends DocumentType & EChildNode = DocumentType & EChildNode
> = Partial<{
  start: StartHook<EState>
  xmlDeclaration: TextHook<EText, EState>
  documentType: DocumentTypeHook<EDocumentType, EState>
  declaration: TextHook<EText, EState>
  processingInstruction: ProcessingInstructionHook<
    EProcessingInstruction,
    EState
  >
  startTagOpen: ElementHook<EElement, EState>
  attribute: AttrHook<EAttr, EState>
  startTag: ElementHook<EElement, EState>
  endTag: ElementHook<EElement, EState>
  text: TextHook<EText, EState>
  comment: CommentHook<EComment, EState>
  cDataSection: CDATASectionHook<ECDATASection, EState>
  warn: WarningHook<SourceCodeLocation>
  end: EndHook<EState>
}>

export default HookList
