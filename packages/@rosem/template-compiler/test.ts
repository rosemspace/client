import DOMLaxParser from '@rosem/dom-lax-parser'
import Manipulator from '@rosem/virtual-dom/Manipulator'
import TemplateCompiler from './TemplateCompiler'
import testHTML from './testHTML'

export default function () {
  const domParser = new DOMLaxParser()
  const renderer = new Manipulator()
  const templateCompiler = new TemplateCompiler(renderer)

  domParser.addModule(templateCompiler)
  domParser.parseFromString(testHTML)

  return templateCompiler.getCompiledResult()
}
