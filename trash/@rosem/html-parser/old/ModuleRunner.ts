import {
  Attr,
  CDATASection,
  Comment,
  DocumentType,
  Element,
  ProcessingInstruction,
  Text,
  SourceCodeLocation,
} from './Node'
import Tokenizer from './Tokenizer'
import HookList from './TokenHooks'

export default class ModuleRunner implements Required<HookList> {
  private readonly modules: HookList[] = []

  constructor(modules: HookList[] = []) {
    this.modules = modules
  }

  start(mimeType: string, tokenizer: Tokenizer): void {
    for (const module of this.modules) {
      module.start && module.start(mimeType, tokenizer)
    }
  }

  xmlDeclaration(xmlDeclaration: Text, tokenizer: Tokenizer): void {
    for (const module of this.modules) {
      module.xmlDeclaration && module.xmlDeclaration(xmlDeclaration, tokenizer)
    }
  }

  documentType(documentType: DocumentType, tokenizer: Tokenizer): void {
    for (const module of this.modules) {
      module.documentType && module.documentType(documentType, tokenizer)
    }
  }

  declaration(declaration: Text, tokenizer: Tokenizer): void {
    for (const module of this.modules) {
      module.declaration && module.declaration(declaration, tokenizer)
    }
  }

  processingInstruction(
    processingInstruction: ProcessingInstruction,
    tokenizer: Tokenizer
  ): void {
    for (const module of this.modules) {
      module.processingInstruction &&
        module.processingInstruction(processingInstruction, tokenizer)
    }
  }

  startTagOpen(element: Element, tokenizer: Tokenizer): void {
    for (const module of this.modules) {
      module.startTagOpen && module.startTagOpen(element, tokenizer)
    }
  }

  attribute(attr: Attr, tokenizer: Tokenizer): void {
    for (const module of this.modules) {
      module.attribute && module.attribute(attr, tokenizer)
    }
  }

  startTag(element: Element, tokenizer: Tokenizer): void {
    for (const module of this.modules) {
      module.startTag && module.startTag(element, tokenizer)
    }
  }

  endTag(element: Element, tokenizer: Tokenizer): void {
    for (const module of this.modules) {
      module.endTag && module.endTag(element, tokenizer)
    }
  }

  text(text: Text, tokenizer: Tokenizer): void {
    for (const module of this.modules) {
      module.text && module.text(text, tokenizer)
    }
  }

  comment(comment: Comment, tokenizer: Tokenizer): void {
    for (const module of this.modules) {
      module.comment && module.comment(comment, tokenizer)
    }
  }

  cDataSection(cDataSection: CDATASection, tokenizer: Tokenizer): void {
    for (const module of this.modules) {
      module.cDataSection && module.cDataSection(cDataSection, tokenizer)
    }
  }

  warn(message: string, sourceCodeLocation: SourceCodeLocation): void {
    for (const module of this.modules) {
      module.warn && module.warn(message, sourceCodeLocation)
    }
  }

  end(tokenizer: Tokenizer) {
    for (const module of this.modules) {
      module.end && module.end(tokenizer)
    }
  }
}
