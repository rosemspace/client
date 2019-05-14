import vnode from './hTest'
console.log(vnode)
import HTMLParser from '@rosem/html-parser/HTMLParser'
import VirtualHydrator from '@rosem/virtual-dom/VirtualHydrator'
import VirtualRenderer from '@rosem/virtual-dom/VirtualRenderer'
import TemplateRenderer from '@rosem/template-renderer/TemplateRenderer'
import WebRenderer from '@rosem/ui-patform-web/WebRenderer'
import testHTML from './testHTML'

document.querySelector('#app')!.innerHTML = testHTML

const hydrator = new VirtualHydrator<Node>()

export default function() {
  const htmlParser = new HTMLParser()
  const virtualTemplateCompiler = new TemplateRenderer(new VirtualRenderer())
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
