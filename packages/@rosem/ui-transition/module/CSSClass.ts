import { Detail, DetailInit } from '../ModuleInterface'
import AbstractModule from '../AbstractModule'

export type CSSClassOptions = {
  fromClass?: string
  activeClass?: string
  toClass?: string
  doneClass?: string
}

export default class CSSClass extends AbstractModule {
  static CLASS_PREFIX_FROM: string = ''
  static CLASS_PREFIX_ACTIVE: string = ''
  static CLASS_PREFIX_TO: string = ''
  static CLASS_PREFIX_DONE: string = ''
  static CLASS_SUFFIX_FROM: string = ''
  static CLASS_SUFFIX_ACTIVE: string = '-active'
  static CLASS_SUFFIX_TO: string = '-to'
  static CLASS_SUFFIX_DONE: string = '-done'

  private readonly name: string
  private readonly options: CSSClassOptions

  constructor(name: string, options: CSSClassOptions) {
    super()
    this.name = name
    this.options = options
  }

  get fromClass(): string {
    return (
      this.options.fromClass ||
      CSSClass.CLASS_PREFIX_FROM + this.name + CSSClass.CLASS_SUFFIX_FROM
    )
  }

  get activeClass(): string {
    return (
      this.options.activeClass ||
      CSSClass.CLASS_PREFIX_ACTIVE + this.name + CSSClass.CLASS_SUFFIX_ACTIVE
    )
  }

  get toClass(): string {
    return (
      this.options.toClass ||
      CSSClass.CLASS_PREFIX_TO + this.name + CSSClass.CLASS_SUFFIX_TO
    )
  }

  get doneClass(): string {
    return (
      this.options.doneClass ||
      CSSClass.CLASS_PREFIX_DONE + this.name + CSSClass.CLASS_SUFFIX_DONE
    )
  }

  cleanup({ target }: Detail): void {
    target.classList.remove(
      this.fromClass,
      this.activeClass,
      this.toClass,
      this.doneClass
    )
  }

  beforeStart({ target }: Detail): void {
    target.classList.remove(this.toClass, this.doneClass)
    target.classList.add(this.fromClass, this.activeClass)
  }

  start({ target }: Detail): void {
    target.classList.remove(this.fromClass)
    target.classList.add(this.toClass)
  }

  afterEnd({ target }: Detail): void {
    target.classList.remove(this.activeClass, this.toClass)
    target.classList.add(this.doneClass)
  }

  getDetail(): DetailInit {
    return {
      css: true,
      fromClass: this.fromClass,
      activeClass: this.activeClass,
      toClass: this.toClass,
      doneClass: this.doneClass,
    }
  }
}
