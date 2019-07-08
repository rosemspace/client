import HTMLParser from '@rosemlab/html-parser'
import VDOMCodeGen from './VDOMCodeGen'
import AssetCodeGen from './AssetCodeGen'

const htmlParser: HTMLParser = new HTMLParser()
const virtualDOMCodeGenerator: VDOMCodeGen = new VDOMCodeGen()

htmlParser.addModule(new AssetCodeGen())
htmlParser.addModule(virtualDOMCodeGenerator)

export default function generateVirtualDOMCode(source: string): string {
  htmlParser.parseFromString(source)

  return virtualDOMCodeGenerator.getCode()
}
