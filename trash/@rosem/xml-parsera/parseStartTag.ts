import {
  attributeRegExp,
  startTagCloseRegExp,
  startTagOpenRegExp,
} from '@rosemlabs/xml-syntax'
import TokenStream from '@rosemlabs/xml-parsera/TokenStream'
import { Attr, AttrList, Element } from './nodes'
import { decodeBaseEntities } from './baseEntities'

export default function parseStartTag(
  stream: TokenStream,
  options: Record<string, any> = {}
): Element | void {
  const startTagOpenMatch: RegExpMatchArray | null = stream.source.match(
    startTagOpenRegExp
  )

  if (!startTagOpenMatch) {
    return
  }

  let tagName: string = startTagOpenMatch[1]

  if (!tagName) {
    return
  }

  const tagNameLowerCased: string = tagName.toLowerCase()
  const tagPrefix: string | undefined = startTagOpenMatch[2]
  const tagLocalName: string = startTagOpenMatch[3].toLowerCase()
  const attrs: AttrList = [] as any
  const startTag: Element = {
    name: tagName,
    prefix: tagPrefix && tagPrefix.toLowerCase(),
    localName: tagLocalName,
    nameLowerCased: tagNameLowerCased,
    namespaceURI: stream.namespaceURI,
    attrs,
    unarySlash: '',
    void: false,
    start: stream.cursorPosition,
    end: stream.cursorPosition,
  }

  stream.moveCursorPosition(startTagOpenMatch[0].length)

  let startTagCloseTagMatch: RegExpMatchArray | null
  let attrMatch: RegExpMatchArray | null

  // Parse attributes while tag is open
  while (
    !(startTagCloseTagMatch = stream.source.match(startTagCloseRegExp)) &&
    (attrMatch = stream.source.match(attributeRegExp))
  ) {
    // Qualified name of an attribute, i. e. "xlink:href"
    const attrNameLowerCased = attrMatch[1].toLowerCase()
    // Local name of an attribute, i. e. "xlink" (before ":")
    const [attrPrefix, attrLocalName] = attrNameLowerCased.split(':', 2)
    const attr: Attr = {
      localName: attrLocalName,
      name: attrMatch[1],
      nameLowerCased: attrNameLowerCased,
      namespaceURI: undefined,
      ownerElement: startTag,
      prefix: attrPrefix,
      value: decodeBaseEntities(
        attrMatch[3] || attrMatch[4] || attrMatch[5] || '',
        'a' === tagNameLowerCased && 'href' === attrNameLowerCased
          ? options.decodeNewlinesForHref
          : options.decodeNewlines
      ),
      start:
        stream.cursorPosition +
        (attrMatch[0].match(/^\s*/) as RegExpMatchArray).length,
      end: stream.moveCursorPosition(attrMatch[0].length),
    }

    // Add namespace
    if ('xmlns' === attrPrefix) {
      // if (attr.value) {
      if (attrLocalName) {
        stream.addNamespace(attrLocalName, attr.value)
        // this.namespaceURI = startTag.namespaceURI = this.rootNamespaceURI
      } else {
        stream.addNamespace(
          tagNameLowerCased,
          (stream.namespaceURI = startTag.namespaceURI = attr.value)
        )
      } // else {
      //   this.namespaceURI = startTag.namespaceURI = this.rootNamespaceURI
      // }
      // }
    } else if (attrLocalName) {
      // Add namespace of attribute
      if (null == (attr.namespaceURI = stream.namespaceMap[attrPrefix])) {
        stream.warn(`Namespace not found for attribute prefix: ${attrPrefix}`, {
          start: attr.start,
          end: attr.start + attrPrefix.length,
        })
      } else {
        // this.namespaceURI = startTag.namespaceURI = this.rootNamespaceURI
      }
    }

    if (!attrLocalName) {
      attr.localName = attrPrefix
      attr.prefix = undefined
    }

    attrs.push(attr)
  }

  // If tag is closed
  if (startTagCloseTagMatch) {
    startTag.unarySlash = startTagCloseTagMatch[1]
    startTag.void = Boolean(startTag.unarySlash)
    startTag.end = stream.moveCursorPosition(startTagCloseTagMatch[0].length)

    if (tagPrefix) {
      const namespaceURI: string = stream.namespaceMap[tagPrefix]

      if (null != namespaceURI) {
        stream.namespaceURI = startTag.namespaceURI = namespaceURI
      } else {
        stream.warn(`Namespace not found for tag prefix: ${tagPrefix}`, {
          start: stream.cursorPosition,
          end: stream.cursorPosition + tagPrefix.length,
        })
      }
    }

    ///////////////////////////////TODO START
    // We don't have namespace from closest foreign element
    if (
      null == stream.namespaceURI &&
      stream.rootTagStack.length &&
      !stream.rootTagStack[stream.rootTagStack.length - 1].namespaceURI
    ) {
      stream.warn(
        `<${startTag.name}> element is not allowed in context of <${stream.rootTagStack[stream.rootTagStack.length - 1].name}> element without namespace.`,
        {
          start: startTag.start,
          end: startTag.end,
        }
      )

      stream.useReader((stream.namespaceURI = stream.defaultNamespaceURI))
    }

    stream.activeReader.startTagFound(startTag)

    if (!startTag.void) {
      // Add start tag to the stack of opened tags
      stream.tagStack.push(startTag)
    }
    ///////////////////////////////TODO END

    return startTag
  } else {
    // When a tag starts with "<abc<" (just the example)
    stream.warn(
      `Mal-formatted tag${
        stream.tagStack.length ? '' : ' at end of template'
      }: <${startTag.name}`,
      {
        start: startTag.start,
        end: stream.cursorPosition,
      }
    )
    stream.resetNodeParserPointer()
  }
}
