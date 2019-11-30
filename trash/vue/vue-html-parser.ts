/*!
 * HTML Parser By John Resig (ejohn.org)
 * Modified by Juriy "kangax" Zaytsev
 * Original code by Erik Arvidsson, Mozilla Public License
 * http://erik.eae.net/simplehtmlparser/simplehtmlparser.js
 * Modified by Evan "yyx990803" You and community
 * https://github.com/vuejs/vue/blob/d8285c57a613c42eddf2d4f2b75c1cea6aa4703a/
 * src/compiler/parser/html-parser.js
 * Modified by Roman "roshecode" Shevchenko
 */

import no from '@rosem-util/common/no'
import isNonPhrasingTag from '@rosem-util/html/isNonPhrasingTag'
import decodeAttribute from './decodeAttribute'

const isDev = 'production' !== process.env.NODE_ENV
// Regular Expressions for parsing tags and attributes
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/

// Non-colonized name e.g. "name"
// could use CombiningChar and Extender characters
// (https://www.w3.org/TR/1999/REC-xml-names-19990114/#NT-QName)
// but for ui templates we can enforce a simple charset
const ncNameREPart = '[a-zA-Z_][\\w\\-\\.]*'
// Qualified name e.g. "namespace:name"
const qNameRECapture = `((?:${ncNameREPart}\\:)?${ncNameREPart})`
const startTagOpenRE = new RegExp(`^<${qNameRECapture}`)
const startTagCloseRE = /^\s*(\/?)>/
const endTagRE = new RegExp(`^<\\/${qNameRECapture}[^>]*>`)
const doctype = /^<!DOCTYPE [^>]+>/i
// Used repeating construction to avoid being passed as HTML comment when inlined in a page
const commentStartRE = /^<!-{2}/
const conditionalCommentStartRE = /^<!\[/
// Special Elements (can contain anything)
const plainTextElementRE = /s(?:cript|tyle)|textarea/i
const COMMENT_START_TOKEN = '<!--'
const COMMENT_END_TOKEN = '-->'
const CONDITIONAL_COMMENT_START_TOKEN = '<!['
const CONDITIONAL_COMMENT_END_TOKEN = ']>'
const COMMENT_START_TOKEN_LENGTH = COMMENT_START_TOKEN.length
const COMMENT_END_TOKEN_LENGTH = COMMENT_END_TOKEN.length
const CONDITIONAL_COMMENT_START_TOKEN_LENGTH = CONDITIONAL_COMMENT_START_TOKEN.length
const CONDITIONAL_COMMENT_END_TOKEN_LENGTH = CONDITIONAL_COMMENT_END_TOKEN.length
const reCache = {}

// #5992
const shouldIgnoreFirstNewline = (tag: string, html: string) =>
  tag && /pre|textarea/i.test(tag) && '\n' === html[0]

export function parseHTML(html, options) {
  const stack = []
  const expectHTML = options.expectHTML
  const isUnaryTag = options.isUnaryTag || no
  const isOptionalClosingTag = options.isOptionalClosingTag || no
  let index = 0
  let last, lastTag
  while (html) {
    last = html
    // Make sure we're not in a plaintext content element like script/style
    if (!lastTag || !plainTextElementRE.test(lastTag)) {
      let textEnd = html.indexOf('<')
      if (textEnd === 0) {
        // Comment:
        if (commentStartRE.test(html)) {
          const commentEndIndex = html.indexOf(COMMENT_END_TOKEN)

          if (commentEndIndex >= 0) {
            if (options.shouldKeepComment) {
              options.comment(html.substring(COMMENT_START_TOKEN_LENGTH, commentEndIndex))
            }
            advance(commentEndIndex + COMMENT_END_TOKEN_LENGTH)
            continue
          }
        }

        // http://en.wikipedia.org/wiki/Conditional_comment#Downlevel-revealed_conditional_comment
        if (conditionalCommentStartRE.test(html)) {
          const conditionalEnd = html.indexOf(CONDITIONAL_COMMENT_END_TOKEN)

          if (conditionalEnd >= 0) {
            advance(conditionalEnd + CONDITIONAL_COMMENT_END_TOKEN_LENGTH)
            continue
          }
        }

        // Doctype:
        const doctypeMatch = html.match(doctype)
        if (doctypeMatch) {
          advance(doctypeMatch[0].length)
          continue
        }

        // End tag:
        const endTagMatch = html.match(endTagRE)
        if (endTagMatch) {
          const curIndex = index
          advance(endTagMatch[0].length)
          parseEndTag(endTagMatch[1], curIndex, index)
          continue
        }

        // Start tag:
        const startTagMatch = parseStartTag()
        if (startTagMatch) {
          handleStartTag(startTagMatch)
          if (shouldIgnoreFirstNewline(startTagMatch.tagName, html)) {
            advance(1)
          }
          continue
        }
      }

      let text, rest, next
      if (textEnd >= 0) {
        rest = html.slice(textEnd)
        while (
          !endTagRE.test(rest) &&
          !startTagOpenRE.test(rest) &&
          !commentStartRE.test(rest) &&
          !conditionalCommentStartRE.test(rest)
        ) {
          // < in plain text, be forgiving and treat it as text
          next = rest.indexOf('<', 1)
          if (next < 0) break
          textEnd += next
          rest = html.slice(textEnd)
        }
        text = html.substring(0, textEnd)
        advance(textEnd)
      }

      if (textEnd < 0) {
        text = html
        html = ''
      }

      if (options.chars && text) {
        options.chars(text)
      }
    } else {
      let endTagLength = 0
      const stackedTag = lastTag.toLowerCase()
      const reStackedTag =
        reCache[stackedTag] ||
        (reCache[stackedTag] = new RegExp(
          '([\\s\\S]*?)(</' + stackedTag + '[^>]*>)',
          'i'
        ))
      const rest = html.replace(reStackedTag, function(all, text, endTag) {
        endTagLength = endTag.length
        if (!plainTextElementRE.test(stackedTag) && stackedTag !== 'noscript') {
          text = text
            .replace(/<!-{2}([\s\S]*?)-->/g, '$1') // #7298
            .replace(/<!\[CDATA\[([\s\S]*?)]]>/g, '$1')
        }
        if (shouldIgnoreFirstNewline(stackedTag, text)) {
          text = text.slice(1)
        }
        if (options.chars) {
          options.chars(text)
        }
        return ''
      })
      index += html.length - rest.length
      html = rest
      parseEndTag(stackedTag, index - endTagLength, index)
    }

    if (html === last) {
      options.chars && options.chars(html)
      if (isDev && !stack.length && options.warn) {
        options.warn(`Mal-formatted tag at end of template: "${html}"`)
      }
      break
    }
  }

  // Clean up any remaining tags
  parseEndTag()

  function advance(n) {
    index += n
    html = html.substring(n)
  }

  function parseStartTag() {
    const start = html.match(startTagOpenRE)
    if (start) {
      const match = {
        tagName: start[1],
        attrs: [],
        start: index,
      }
      advance(start[0].length)
      let end, attr
      while (
        !(end = html.match(startTagCloseRE)) &&
        (attr = html.match(attribute))
      ) {
        advance(attr[0].length)
        match.attrs.push(attr)
      }
      if (end) {
        match.unarySlash = end[1]
        advance(end[0].length)
        match.end = index
        return match
      }
    }
  }

  function handleStartTag(match) {
    const tagName = match.tagName
    const unarySlash = match.unarySlash

    if (expectHTML) {
      if (lastTag === 'p' && isNonPhrasingTag(tagName)) {
        parseEndTag(lastTag)
      }
      if (isOptionalClosingTag(tagName) && lastTag === tagName) {
        parseEndTag(tagName)
      }
    }

    const unary = isUnaryTag(tagName) || !!unarySlash

    const l = match.attrs.length
    const attrs = new Array(l)
    for (let i = 0; i < l; i++) {
      const args = match.attrs[i]
      const value = args[3] || args[4] || args[5] || ''
      const shouldDecodeNewlines =
        tagName === 'a' && args[1] === 'href'
          ? options.shouldDecodeNewlinesForHref
          : options.shouldDecodeNewlines
      attrs[i] = {
        name: args[1],
        value: decodeAttribute(value, shouldDecodeNewlines),
      }
    }

    if (!unary) {
      stack.push({
        tag: tagName,
        lowerCasedTag: tagName.toLowerCase(),
        attrs: attrs,
      })
      lastTag = tagName
    }

    if (options.start) {
      options.start(tagName, attrs, unary, match.start, match.end)
    }
  }

  function parseEndTag(tagName, start, end) {
    let pos, lowerCasedTagName
    if (start == null) start = index
    if (end == null) end = index

    // Find the closest opened tag of the same type
    if (tagName) {
      lowerCasedTagName = tagName.toLowerCase()
      for (pos = stack.length - 1; pos >= 0; --pos) {
        if (stack[pos].lowerCasedTag === lowerCasedTagName) {
          break
        }
      }
    } else {
      // If no tag name is provided, clean shop
      pos = 0
    }

    if (pos >= 0) {
      // Close all the open elements, up the stack
      for (let i = stack.length - 1; i >= pos; --i) {
        if (isDev && (i > pos || !tagName) && options.warn) {
          options.warn(`tag <${stack[i].tag}> has no matching end tag.`)
        }
        if (options.end) {
          options.end(stack[i].tag, start, end)
        }
      }

      // Remove the open elements from the stack
      stack.length = pos
      lastTag = pos && stack[pos - 1].tag
    } else if (lowerCasedTagName === 'br') {
      if (options.start) {
        options.start(tagName, [], true, start, end)
      }
    } else if (lowerCasedTagName === 'p') {
      if (options.start) {
        options.start(tagName, [], false, start, end)
      }
      if (options.end) {
        options.end(tagName, start, end)
      }
    }
  }
}
