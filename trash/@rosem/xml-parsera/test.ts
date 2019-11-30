import TokenStream from '@rosemlabs/xml-parsera/TokenStream'
import parseStartTag from './parseStartTag'
import parseEndTag from './parseEndTag'

const stream = new TokenStream('<div class="red"></div>text')

console.log(parseStartTag(stream))
console.log(parseEndTag(stream))
console.log(stream)
