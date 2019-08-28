import HTMLParser from '@rosemlab/html-parser'
import VDOMCodeGen from './codegen/VDOMCodeGen'
import AssetCodeGen from './codegen/AssetCodeGen'

const htmlParser: HTMLParser = new HTMLParser()
const virtualDOMCodeGenerator: VDOMCodeGen = new VDOMCodeGen()

htmlParser.addModule(new AssetCodeGen())
htmlParser.addModule(virtualDOMCodeGenerator)

export default function generateVirtualDOMCode(source: string, prettify?: boolean): string {
  htmlParser.parseFromString(source)

  return virtualDOMCodeGenerator.getCode(prettify)
}
