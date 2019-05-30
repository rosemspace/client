import HTMLParser from '@rosem/html-parser'
import { qualifiedNameRegExp } from '@rosem/xml-syntax'
import { MatchRange, StartTag, Content } from '@rosem/xml-parser/nodes'
import AttrSet from '@rosem/xml-parser/modules/AttrSet'
import LRUCache from 'lru-cache'
import hashSum from 'hash-sum'
import SFCDescriptor from './SFCDescriptor'
import SFCBlock from './SFCBlock'

const cache = new LRUCache(100)

export default class SFCParser extends HTMLParser {
  protected descriptor: SFCDescriptor = {}

  constructor() {
    super({
      rawTextElement: new RegExp(qualifiedNameRegExp.source, 'i'),
    })

    this.addModule(new AttrSet())
  }

  parseFromString(source: string, filename: string = ''): SFCDescriptor {
    const cacheKey = hashSum(filename + source)
    let output: {} | void = cache.get(cacheKey)

    if (output) {
      return output as SFCDescriptor
    }

    super.parseFromString(source)

    output = this.descriptor

    // if (needMap) {//todo}

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
        content: '',
        matchEnd: startTag.matchEnd,
        matchStart: startTag.matchEnd,
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
