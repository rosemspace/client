import vnode from './hTest'
console.log(vnode)
import HTMLParser from '@rosem/html-parser/HTMLParser'
import VirtualDOMHydrator from '@rosem/virtual-dom/Hydrator'
import VirtualDOMRenderer from '@rosem/virtual-dom/Renderer'
import TemplateCompiler from '@rosem/template-compiler/TemplateCompiler'
import WebRenderer from '@rosem/ui-patform-web/WebRenderer'
import testHTML from './testHTML'

document.querySelector('#app')!.innerHTML = testHTML

const hydrator = new VirtualDOMHydrator<Node>()

export default function() {
  const htmlParser = new HTMLParser()
  const virtualTemplateCompiler = new TemplateCompiler(new VirtualDOMRenderer())
  // const webTemplateCompiler = new TemplateCompiler(new WebRenderer())

  htmlParser.addModule(virtualTemplateCompiler)
  // domParser.addModule(webTemplateCompiler)
  htmlParser.parseFromString(testHTML)

  console.log(virtualTemplateCompiler.getCompiledResult())

  return hydrator.hydrate(
    virtualTemplateCompiler.getCompiledResult(),
    new WebRenderer()
  )
  // console.log(virtualTemplateCompiler.getCompiledResult());
  // console.log(webTemplateCompiler.getCompiledResult());
  // return
}
