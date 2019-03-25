import HTMLParser from '@rosem/html-parser/HTMLParser'
import Hydrator from '@rosem/virtual-dom/Hydrator'
import VirtualManipulator from '@rosem/virtual-dom/Manipulator'
import TemplateCompiler from '@rosem/template-compiler/TemplateCompiler'
import WebManipulator from '@rosem/ui-patform-web/Manipulator'
import testHTML from './testHTML'

document.querySelector('#app')!.innerHTML = testHTML

const hydrator = new Hydrator<Node>()

export default function() {
  const htmlParser = new HTMLParser()
  const virtualTemplateCompiler = new TemplateCompiler(new VirtualManipulator())
  // const webTemplateCompiler = new TemplateCompiler(new WebManipulator())

  htmlParser.addModule(virtualTemplateCompiler)
  // domParser.addModule(webTemplateCompiler)
  htmlParser.parseFromString(testHTML)

  return hydrator.hydrate(
    virtualTemplateCompiler.getCompiledResult(),
    new WebManipulator()
  )
  // console.log(virtualTemplateCompiler.getCompiledResult());
  // console.log(webTemplateCompiler.getCompiledResult());
  // return
}
