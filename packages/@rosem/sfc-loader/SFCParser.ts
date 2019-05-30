import HTMLParser from '@rosem/html-parser'
import { qualifiedNameRegExp } from '@rosem/xml-syntax'
import camelCase from 'lodash/camelCase'
import { Module } from '@rosem/xml-parser'
import {
  MatchRange,
  StartTag,
  Attr,
  Content,
  EndTag,
} from '@rosem/xml-parser/nodes'
import LRUCache from 'lru-cache'
import hashSum from 'hash-sum'
import SFCDescriptor from './SFCDescriptor'

const cache = new LRUCache(100);

export default class SFCParser extends Module {
  protected htmlParser: HTMLParser
  protected sfcDescriptor: SFCDescriptor = {}
  protected cursorTag?: StartTag
  protected cursorTagAttrSet: {[name: string]: string} = {}

  constructor() {
    super()

    this.htmlParser = new HTMLParser({
      rawTextElement: new RegExp(qualifiedNameRegExp.source, 'i'),
    })
    this.htmlParser.addModule(this)
  }

  parseFromString(source: string, filename: string = ''): SFCDescriptor {
    const cacheKey = hashSum(filename + source)
    let output: {} | void = cache.get(cacheKey)

    if (output) {
      return output as SFCDescriptor
    }

    this.htmlParser.parseFromString(source)
    output = this.sfcDescriptor

    // if (needMap) {//todo}

    cache.set(cacheKey, output)

    return output
  }

  attribute<T extends Attr>(attr: T): void {
    this.cursorTagAttrSet[camelCase(attr.name)] = attr.value
  }

  endTag<T extends EndTag>(endTag: T): void {
    this.cursorTag = undefined
    this.cursorTagAttrSet = {}
  }

  startTag<T extends StartTag>(startTag: T): void {
    this.cursorTag = startTag
  }

  text<T extends Content>(text: T): void {
    if (this.cursorTag) {
      const nameLowerCased: string = this.cursorTag.nameLowerCased

      if (!this.sfcDescriptor[nameLowerCased]) {
        this.sfcDescriptor[nameLowerCased] = []
      }

      this.sfcDescriptor[nameLowerCased].push(
        Object.assign(this.cursorTag, {
          attrSet: this.cursorTagAttrSet,
          text,
        })
      )
    }
  }

  warn(message: string, matchRange: MatchRange): void {}
}
