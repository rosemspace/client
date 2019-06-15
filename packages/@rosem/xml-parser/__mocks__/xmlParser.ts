import TemplateCompiler from '@rosem/template-compiler/TemplateCompiler'
import VirtualDOMRenderer from '@rosem/virtual-dom/Renderer'
import {
  VirtualCDATASection,
  VirtualComment,
  VirtualDocumentFragment,
  VirtualElement,
  VirtualNode,
  VirtualParentNode,
  VirtualText,
} from '@rosem/virtual-dom/VirtualInstance'
import XMLParser from '../XMLParser'

export default new (class {
  private readonly parser: XMLParser
  private readonly compiler: TemplateCompiler<
    VirtualNode,
    VirtualParentNode,
    VirtualDocumentFragment,
    VirtualElement,
    VirtualText,
    VirtualComment,
    VirtualCDATASection
  >

  constructor() {
    this.parser = new XMLParser()
    this.compiler = new TemplateCompiler(new VirtualDOMRenderer())
    this.parser.addModule(this.compiler)
  }

  parseFromString(source: string): VirtualDocumentFragment {
    this.parser.parseFromString(source)

    return this.compiler.getCompiledResult()
  }
})()
