import { endTagRegExp } from '@rosemlabs/xml-syntax'
import TokenStream from '@rosemlabs/xml-parsera/TokenStream'
import { Element } from './nodes'

export default function parseEndTag(
  stream: TokenStream,
  options: Record<string, any> = {}
): Element | void {
  const endTagMatch: RegExpMatchArray | null = stream.source.match(endTagRegExp)

  if (!endTagMatch) {
    return
  }

  const tagName: string = endTagMatch[1]

  if (!tagName) {
    stream.moveCursorPosition(endTagMatch[0].length)
    stream.resetNodeParserPointer()

    return
  }

  const tagNameLowerCased: string = tagName.toLowerCase()
  let [tagPrefix, tagLocalName] = tagNameLowerCased.split(':', 2)
  let lastIndex

  if (!tagLocalName) {
    tagLocalName = tagPrefix
    tagPrefix = undefined!
  }

  // Find the closest opened tag of the same type
  for (lastIndex = stream.tagStack.length - 1; lastIndex >= 0; --lastIndex) {
    if (tagNameLowerCased === stream.tagStack[lastIndex].nameLowerCased) {
      // Switch processor back before foreign tag
      if (
        stream.rootTagStack.length &&
        stream.tagStack[lastIndex].nameLowerCased ===
          stream.rootTagStack[stream.rootTagStack.length - 1].nameLowerCased
      ) {
        stream.rootTagStack.pop()

        if (null != (stream.namespaceURI = stream.rootNamespaceURI)) {
          stream.useReader(stream.namespaceURI)
        }
      }

      break
    }
  }

  if (lastIndex >= 0) {
    // Close all the open elements, up the stack
    for (let index = stream.tagStack.length - 1; index > lastIndex; --index) {
      stream.activeReader.matchingEndTagMissed(stream.tagStack[index])
    }

    const endTag: Element = {
      ...stream.tagStack[lastIndex],
      start: stream.cursorPosition,
      end: stream.cursorPosition + endTagMatch[0].length,
    }

    // Remove the open elements from the stack
    stream.tagStack.length = lastIndex
    stream.moveCursorPosition(endTagMatch[0].length)

    return endTag
  } else {
    return stream.activeReader.matchingStartTagMissed({
      namespaceURI: stream.namespaceURI,
      attrs: [] as any,
      void: false,
      unarySlash: '',
      name: tagName,
      prefix: tagPrefix,
      localName: tagLocalName,
      nameLowerCased: tagNameLowerCased,
      start: stream.cursorPosition,
      end: stream.cursorPosition + endTagMatch[0].length,
    })
  }
}
