# @rosem/xml-parser

## Hooks

- _startTagParsed(startTag: StartTag): void_ - start tag was found and parsed
- _endTagParsed(endTag: EndTag): void_ - end tag was found and parsed
- - _matchingStartTagFound(startTag: StartTag): void_ - end tag has matching start tag
- - _matchingStartTagMissed(endTag: EndTag): void_ - end tag has no matching start tag
