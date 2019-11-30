import { startsWith } from 'lodash-es'

export default class ReadableStream {
  protected source: string
  protected cursor: number = 0

  constructor(source: string) {
    this.source = source
  }

  // match(regExp: RegExp): boolean {
  //   return this.source.test(regExp)
  // }
}
