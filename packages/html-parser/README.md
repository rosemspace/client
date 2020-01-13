# @rosemlabs/html-parser

## Tokens

- start tag (including attributes)
- end tag
- comment
- CDATA (via option)
- doctype
- character / text
- eof

## Hooks

- _startTagParsed(startTag: StartTag): void_ - start tag was found and parsed
- _endTagParsed(endTag: EndTag): void_ - end tag was found and parsed
- - _matchingStartTagFound(startTag: StartTag): void_ - end tag has matching start tag
- - _matchingStartTagMissed(endTag: EndTag): void_ - end tag has no matching start tag

## Parsing

### Preprocessing

https://html.spec.whatwg.org/multipage/parsing.html#preprocessing-the-input-stream

1. Check for illegal code points
1. Replace line feeds such as `\r\n` and `\r` by `\n`
