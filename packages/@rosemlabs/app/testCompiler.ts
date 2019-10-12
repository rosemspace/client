// import vnode from './hTest'
// console.log(vnode)
import HTMLParser from '@rosemlabs/html-parser/HTMLParser'
import { VDOMConverter, VDOMRenderer } from '@rosemlabs/virtual-dom'
import TemplateCompiler from '@rosemlabs/template-compiler/TemplateCompiler'
import WebRenderer from '@rosemlabs/web-ui/WebRenderer'
import testHTML from './testHTML'

document.querySelector('#app')!.innerHTML = testHTML

const vDOMConverter = new VDOMConverter<Node>()

export default function() {
  const htmlParser = new HTMLParser()
  const virtualTemplateCompiler = new TemplateCompiler(new VDOMRenderer())
  // const webTemplateCompiler = new TemplateCompiler(new WebRenderer())

  htmlParser.addModule(virtualTemplateCompiler)
  // domParser.addModule(webTemplateCompiler)
  htmlParser.parseFromString(testHTML)

  console.log(virtualTemplateCompiler.getCompiledResult())

  return vDOMConverter.convert(
    virtualTemplateCompiler.getCompiledResult(),
    new WebRenderer()
  )
  // console.log(virtualTemplateCompiler.getCompiledResult());
  // console.log(webTemplateCompiler.getCompiledResult());
  // return
}
