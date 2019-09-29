// import vnode from './hTest'
// console.log(vnode)
import HTMLParser from '@rosemlab/html-parser/HTMLParser'
import { VDOMConverter, VDOMRenderer } from '@rosemlab/virtual-dom'
import TemplateCompiler from '@rosemlab/template-compiler/TemplateCompiler'
import WebRenderer from '@rosemlab/web-ui/WebRenderer'
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
