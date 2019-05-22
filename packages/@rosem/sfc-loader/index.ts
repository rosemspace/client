import HTMLParser from '@rosem/html-parser/HTMLParser'
import TemplateCompiler from '@rosem/template-compiler/TemplateCompiler'
import VirtualRenderer from '@rosem/virtual-dom/VirtualRenderer'

const htmlParser = new HTMLParser()
const templateCompiler = new TemplateCompiler(new VirtualRenderer())

htmlParser.addModule(templateCompiler)

export default function(source: string) {
  htmlParser.parseFromString(source)

  const ast = templateCompiler.getCompiledResult()

  // return `window.ast = ${ JSON.stringify(ast) }`;
  return "export default function() {return 'TEST'}"
}
// module.exports = function (source) {
// export default function (source: string) {
//   return "var TEST = 'TEST';"
// }
