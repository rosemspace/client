import { basename, dirname } from 'path'
import forEach from 'lodash/forEach'
import LRUCache from 'lru-cache'
import hashSum from 'hash-sum'
import { isProduction } from '@rosemlabs/env-util'
import { getLineIndex, unifyPath } from '@rosemlabs/common-util'
import HTMLParser from '@rosemlabs/html-parser'
import { qualifiedNameRegExp } from '@rosemlabs/xml-util'
import { MatchRange, StartTag, Content } from '@rosemlabs/xml-parser/nodes'
import AttrMapModule from '@rosemlabs/xml-parser/modules/AttrMapModule'
import SFCDescriptor from './SFCDescriptor'
import SFCBlock from './SFCBlock'
import generateSourceMap from './generateSourceMap'

const cache = new LRUCache<string, SFCDescriptor>(100)

export type SFCParserOptions = {
  sourceMap?: boolean
  noPad?: boolean
  noCache?: boolean
}

const defaultDescriptor: SFCDescriptor = { id: '', file: '', blocks: {} }
const defaultOptions: SFCParserOptions = {
  sourceMap: false,
  noPad: false,
}

export default class SFCParser extends HTMLParser {
  protected descriptor: SFCDescriptor = { ...defaultDescriptor }

  constructor() {
    super({
      rawTextElement: new RegExp(qualifiedNameRegExp.source, 'i'),
    })

    this.addModule(new AttrMapModule())
  }

  parseFromString(
    source: string,
    filepathWithQuery: string = '',
    options: SFCParserOptions = {}
  ): SFCDescriptor {
    options = { ...defaultOptions, ...options }

    const [filepath, query] = filepathWithQuery.split('?', 2)
    const filename: string = basename(filepath)
    const cacheKey: string = hashSum(filename + source)

    if (!options.noCache) {
      const sfcDescriptor: SFCDescriptor | undefined = cache.get(cacheKey)

      if (sfcDescriptor) {
        return sfcDescriptor
      }
    }

    const sourceRoot: string = dirname(filepath)
    const rawShortFilePath: string = filepath.replace(/^(\.\.[/\\])+/, '')
    const shortFilePathWithQuery: string =
      unifyPath(rawShortFilePath) + `?${query}`

    // Important to reinitialize the descriptor here to avoid memory leak
    this.descriptor = {
      id: hashSum(
        isProduction
          ? `${shortFilePathWithQuery}\n${source}`
          : shortFilePathWithQuery
      ),
      file: isProduction ? filename : unifyPath(rawShortFilePath),
      blocks: {},
    }
    super.parseFromString(source)

    const sfcDescriptor = this.descriptor

    if (options.sourceMap) {
      forEach(sfcDescriptor.blocks, (blocks: SFCBlock[]): void => {
        blocks.forEach((block: SFCBlock): void => {
          // Use this offset to generate correct source map
          let offsetLineIndex: number = getLineIndex(source, block.start)

          // Pad content so that linters and pre-processors can output
          // correct line numbers in errors and warnings
          if (!options.noPad) {
            block.output = ''.padStart(offsetLineIndex, '\n') + block.output
            // Don't add offset in source map of padded content
            offsetLineIndex = 0
          }

          if (!block.attrs.src) {
            block.map = generateSourceMap(
              filename,
              source,
              block.output,
              sourceRoot,
              offsetLineIndex
            )
          }
        })
      })
    }

    if (!options.noCache) {
      cache.set(cacheKey, sfcDescriptor)
    }

    return sfcDescriptor
  }

  startTag<T extends StartTag>(startTag: T): void {
    super.startTag(startTag)

    const nameLowerCased: string = startTag.nameLowerCased
    const blocks: { [block: string]: SFCBlock[] } = this.descriptor.blocks

    if (!blocks[nameLowerCased]) {
      blocks[nameLowerCased] = []
    }

    blocks[nameLowerCased].push(
      Object.assign(startTag, {
        id: '',
        output: undefined,
        end: startTag.end,
        start: startTag.end,
      })
    )
  }

  text<T extends Content>(text: T): void {
    super.text(text)

    if (this.tagStack.length) {
      const lastTag: StartTag = this.tagStack[this.tagStack.length - 1]
      const blocks: SFCBlock[] = this.descriptor.blocks[lastTag.nameLowerCased]
      const lastBlock: SFCBlock = blocks[blocks.length - 1]

      lastBlock.id = hashSum(
        `${this.descriptor.id}\n${lastBlock.nameLowerCased}\n${blocks.length -
          1}${isProduction ? '\n' + text.content : ''}`
      )
      lastBlock.output = text.content
      lastBlock.start = text.start
      lastBlock.end = text.end
    }
  }

  warn(message: string, matchRange: MatchRange): void {}
}
