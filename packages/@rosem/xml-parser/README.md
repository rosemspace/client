# @rosem/xml-parser

## Hooks

- _startTagParsed(startTag: ParsedStartTag): void_ - start tag was found and parsed
- _endTagParsed(endTag: ParsedEndTag): void_ - end tag was found and parsed
- - _matchingStartTagFound(startTag: ParsedStartTag): void_ - end tag has matching start tag
- - _matchingStartTagMissed(endTag: ParsedEndTag): void_ - end tag has no matching start tag
