import { basename, dirname } from 'path'
import forEach from 'lodash/forEach'
import LRUCache from 'lru-cache'
import hashSum from 'hash-sum'
import { isProduction } from '@rosemlab/env'
import HTMLParser from '@rosemlab/html-parser'
import { qualifiedNameRegExp } from '@rosemlab/xml-syntax'
import { MatchRange, StartTag, Content } from '@rosemlab/xml-parser/nodes'
import AttrMapModule from '@rosemlab/xml-parser/modules/AttrMapModule'
import SFCDescriptor from './SFCDescriptor'
import SFCBlock from './SFCBlock'
import generateSourceMap from './codegen/generateSourceMap'

const cache = new LRUCache<string, SFCDescriptor>(100)

export type SFCParserOptions = {
  sourceMap?: boolean
  noPad?: boolean
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
    file: string = '',
    options: SFCParserOptions = {}
  ): SFCDescriptor {
    options = { ...defaultOptions, ...options }

    const filename: string = isProduction ? basename(file) : file
    const sourceRoot: string = dirname(file)
    const cacheKey: string = hashSum(filename + source)
    let output: SFCDescriptor | undefined = cache.get(cacheKey)

    if (output) {
      return output
    }

    super.parseFromString(source)

    output = this.descriptor

    if (options.sourceMap) {
      forEach(
        output,
        (blocks: SFCBlock[]): void => {
          blocks.forEach(
            (block: SFCBlock): void => {
              block.scopeId = cacheKey

              // Pad content so that linters and pre-processors can output
              // correct line numbers in errors and warnings
              if (!options.noPad) {
                const contentBefore: string = this.originalSource.substr(
                  0,
                  block.start
                )
                const offset: number = (contentBefore.match(/\r?\n/g) || [])
                  .length

                block.content = ''.padStart(offset, '\n') + block.content
              }

              if (!block.attrMap!.src) {
                block.map = generateSourceMap(
                  filename,
                  source,
                  block.content,
                  sourceRoot,
                  !options.noPad
                )
              }
            }
          )
        }
      )
    }

    cache.set(cacheKey, output)

    return output
  }

  startTag<T extends StartTag>(startTag: T): void {
    super.startTag(startTag)

    const nameLowerCased: string = startTag.nameLowerCased

    if (!this.descriptor[nameLowerCased]) {
      this.descriptor[nameLowerCased] = []
    }

    this.descriptor[nameLowerCased].push(
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

      Object.assign(blockList[blockList.length - 1], text)
    }
  }

  warn(message: string, matchRange: MatchRange): void {}
}
