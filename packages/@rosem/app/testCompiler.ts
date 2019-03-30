import vnode from './hTest'
console.log(vnode)
import HTMLParser from '@rosem/html-parser/HTMLParser'
import VirtualHydrator from '@rosem/virtual-dom/VirtualHydrator'
import VirtualManipulator from '@rosem/virtual-dom/VirtualRenderer'
import TemplateCompiler from '@rosem/template-compiler/TemplateCompiler'
import WebManipulator from '@rosem/ui-patform-web/WebRenderer'
import testHTML from './testHTML'

document.querySelector('#app')!.innerHTML = testHTML

const hydrator = new VirtualHydrator<Node>()

export default function() {
  const htmlParser = new HTMLParser()
  const virtualTemplateCompiler = new TemplateCompiler(new VirtualManipulator())
  // const webTemplateCompiler = new TemplateCompiler(new WebManipulator())

  htmlParser.addModule(virtualTemplateCompiler)
  // domParser.addModule(webTemplateCompiler)
  htmlParser.parseFromString(testHTML)

  console.log(virtualTemplateCompiler.getCompiledResult())

  return hydrator.hydrate(
    virtualTemplateCompiler.getCompiledResult(),
    new WebManipulator()
  )
  // console.log(virtualTemplateCompiler.getCompiledResult());
  // console.log(webTemplateCompiler.getCompiledResult());
  // return
}
