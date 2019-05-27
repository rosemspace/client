import { camelCase } from 'lodash-es'
import { Module } from '@rosem/xml-parser'
import {
  MatchRange,
  StartTag,
  Attr,
  Content,
  EndTag,
} from '@rosem/xml-parser/node'
import SFCDescriptor from './SFCDescriptor'

export default class Compiler extends Module {
  protected sfcDescriptor: SFCDescriptor = {}
  protected cursorTag?: StartTag
  protected cursorTagAttrMap: {[name: string]: Attr} = {}

  attribute<T extends Attr>(attr: T): void {
    this.cursorTagAttrMap[camelCase(attr.name)] = attr
  }

  endTag<T extends EndTag>(endTag: T): void {
    this.cursorTag = undefined
    this.cursorTagAttrMap = {}
  }

  startTag<T extends StartTag>(startTag: T): void {
    this.cursorTag = startTag
  }

  text<T extends Content>(text: T): void {
    if (this.cursorTag) {
      const nameLowerCased: string = camelCase(this.cursorTag.nameLowerCased)

      if (!this.sfcDescriptor[nameLowerCased]) {
        this.sfcDescriptor[nameLowerCased] = []
      }

      delete this.cursorTag.nameLowerCased
      delete this.cursorTag.attrs

      this.sfcDescriptor[nameLowerCased].push(
        Object.assign(this.cursorTag, {
          attrMap: this.cursorTagAttrMap,
          text,
        })
      )
    }
  }

  warn(message: string, matchRange: MatchRange): void {}

  getSFCDescriptor(): SFCDescriptor {
    return this.sfcDescriptor
  }
}
