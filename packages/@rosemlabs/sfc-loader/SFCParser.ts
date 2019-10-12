import { basename, dirname } from 'path'
import forEach from 'lodash/forEach'
import LRUCache from 'lru-cache'
import hashSum from 'hash-sum'
import { isProduction } from '@rosemlabs/env'
import HTMLParser from '@rosemlabs/html-parser'
import { qualifiedNameRegExp } from '@rosemlabs/xml-syntax'
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

const defaultOptions: SFCParserOptions = {
  sourceMap: false,
  noPad: false,
}

export default class SFCParser extends HTMLParser {
  protected descriptor: SFCDescriptor = {}

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
    const sourceRoot: string = dirname(filepath)
    const cacheKey: string = hashSum(filename + source)
    const rawShortFilePath: string = filepath.replace(/^(\.\.[/\\])+/, '')
    const shortFilePathWithQuery: string =
      rawShortFilePath.replace(/\\/g, '/') + `?${query}`
    const id: string = hashSum(
      isProduction
        ? `${shortFilePathWithQuery}\n${source}`
        : shortFilePathWithQuery
    )
    //todo expose on descriptor
    const file: string = JSON.stringify(
      isProduction ? filename : rawShortFilePath.replace(/\\/g, '/')
    )

    if (!options.noCache) {
      const sfcDescriptor: SFCDescriptor | undefined = cache.get(cacheKey)

      if (sfcDescriptor) {
        return sfcDescriptor
      }
    }

    super.parseFromString(source)

    const sfcDescriptor = this.descriptor

    if (options.sourceMap) {
      forEach(sfcDescriptor, (blocks: SFCBlock[]): void => {
        blocks.forEach((block: SFCBlock): void => {
          //todo expose on descriptor
          block.scopeId = id

          let offset: number = 0

          // Pad content so that linters and pre-processors can output
          // correct line numbers in errors and warnings
          if (!options.noPad) {
            const contentBefore: string = this.originalSource.substr(
              0,
              block.start
            )

            offset = (contentBefore.match(/\r?\n/g) || []).length
            block.output = ''.padStart(offset, '\n') + block.output
          }

          if (!block.attrs.src) {
            block.map = generateSourceMap(
              filename,
              source,
              block.output,
              sourceRoot,
              offset
            )
          }
        })
      })
    } else {
      forEach(sfcDescriptor, (blocks: SFCBlock[]): void => {
        blocks.forEach((block: SFCBlock): void => {
          block.scopeId = id
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
    const descriptor: SFCDescriptor = this.descriptor

    if (!descriptor[nameLowerCased]) {
      descriptor[nameLowerCased] = []
    }

    descriptor[nameLowerCased].push(
      Object.assign(startTag, {
        scopeId: '',
        output: undefined,
        end: startTag.end,
        start: startTag.end,
      })
    )
  }

  text<T extends Content>(text: T): void {
    super.text(text)

    if (this.tagStack.length) {
      const blockList: SFCBlock[] = this.descriptor[
        this.tagStack[this.tagStack.length - 1].nameLowerCased
      ]
      const lastBlock: SFCBlock = blockList[blockList.length - 1]

      lastBlock.output = text.content
      lastBlock.start = text.start
      lastBlock.end = text.end
    }
  }

  warn(message: string, matchRange: MatchRange): void {}
}
