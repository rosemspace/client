import { TokenMatcher } from './token'

const scheme: TokenMatcher[] = [
  {
    name: 'startTag',
    pattern: /<([a-zA-Z][^\s/>]*)/,
    // patternEnd: /\s*(\/?)(?:>|$)/,
    repeat: true,
  },
  {
    name: 'endTag',
    pattern: /<\/([a-zA-Z][^\s/>]*)/,
    repeat: true,
  },
  {
    scope: ['startTag', 'endTag'],
    name: 'attribute',
    pattern: /[/\s]*?((?:=|[^\s/>])[^\s/>=]*)/,
    repeat: true,
  },
  // {
  //   scope: ['startTag.attribute'],
  //   name: 'value',
  //   pattern: /=\s*(?:"(?:([^"]*)"?)|'(?:([^']*)'?)|([^>][^\s>]*))?/,
  //   composite: true,
  // },
  {
    scope: ['startTag.attribute', 'endTag.attribute'],
    name: 'doubleQuotedValue',
    pattern: /=\s*"/,
  },
  {
    scope: ['startTag.attribute', 'endTag.attribute'],
    name: 'singleQuotedValue',
    pattern: /=\s*'/,
  },
  {
    scope: ['startTag.attribute', 'endTag.attribute'],
    name: 'unquotedValue',
    pattern: /=\s*/,
  },
  // {
  //   scope: ['startTag.attribute.doubleQuotedValue'],
  //   name: 'text',
  //   pattern: /([^"&]+)/,
  // },
  // {
  //   scope: ['startTag.attribute.singleQuotedValue'],
  //   name: 'text',
  //   pattern: /([^'&]+)/,
  // },
  // {
  //   scope: ['startTag.attribute.unquotedValue'],
  //   name: 'text',
  //   pattern: /([^>&][^\s>&]*)/,
  // },
  {
    scope: [
      'startTag.attribute.doubleQuotedValue',
      'endTag.attribute.doubleQuotedValue',
    ],
    name: 'text',
    pattern: /((?:[^"&{])+)/,
  },
  {
    scope: [
      'startTag.attribute.singleQuotedValue',
      'endTag.attribute.singleQuotedValue',
    ],
    name: 'text',
    pattern: /([^'&{]+)/,
  },
  {
    scope: [
      'startTag.attribute.unquotedValue',
      'endTag.attribute.unquotedValue',
    ],
    name: 'text',
    pattern: /([^>&{][^\s>&{]*)/,
  },
  {
    scope: [
      'startTag.attribute.doubleQuotedValue',
      'endTag.attribute.doubleQuotedValue',
    ],
    name: 'end',
    pattern: /"/,
  },
  {
    scope: [
      'startTag.attribute.singleQuotedValue',
      'endTag.attribute.singleQuotedValue',
    ],
    name: 'end',
    pattern: /'/,
  },
  // `<` - eof-before-tag-name parse error
  // `<.` - invalid-first-character-of-tag-name parse error
  {
    name: 'text',
    pattern: /((?:[^<]|<\/?(?:[^a-zA-Z/]|$))+)/,
    loop: true,
  },
  {
    scope: [
      'startTag.attribute.doubleQuotedValue',
      'startTag.attribute.singleQuotedValue',
      'startTag.attribute.unquotedValue',
      'text',
    ],
    name: 'namedCharacterReference',
    pattern: /&([a-zA-Z0-9]+;?|;)/,
    loop: true,
  },
  {
    scope: [
      'startTag.attribute.doubleQuotedValue',
      'startTag.attribute.singleQuotedValue',
      'startTag.attribute.unquotedValue',
      'text',
    ],
    name: 'interpolatedValue',
    pattern: /{{([\s\S]*?)}}/,
    loop: true,
  },
  {
    scope: ['startTag', 'endTag'],
    name: 'end',
    // pattern: /[/\s]*?(\/?)(?:>|$)/,
    pattern: /[/\s]*?(\/?)>|$/,
  },
]

export default scheme
