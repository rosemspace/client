import { TEXT_HTML_MIME_TYPE } from '@rosemlabs/w3-util'
import TokenStream from '@rosemlabs/xml-parsera/TokenStream'

export default class XMLParser {
  constructor(options: any) {
    const stream = new TokenStream('source', options)

    // stream.addProcessor(TEXT_HTML_MIME_TYPE, new HTMLReader(stream))
  }
}
