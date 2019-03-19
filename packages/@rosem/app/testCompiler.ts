import DOMParser from '@rosem/dom-lax-parser'
import Hydrator from '@rosem/virtual-dom/Hydrator'
import VirtualManipulator from '@rosem/virtual-dom/Manipulator'
import TemplateCompiler from '@rosem/template-compiler/TemplateCompiler'
import WebManipulator from '@rosem/ui-patform-web/Manipulator'
import testHTML from './testHTML'

const hydrator = new Hydrator<Node>()

export default function() {
  const domParser = new DOMParser()
  const templateCompiler = new TemplateCompiler(new VirtualManipulator())

  domParser.addModule(templateCompiler)
  domParser.parseFromString(testHTML)

  return hydrator.hydrate(
    templateCompiler.getCompiledResult(),
    new WebManipulator()
  )
}
