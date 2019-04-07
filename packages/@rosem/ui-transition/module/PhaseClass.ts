import { Detail, DetailInit } from '../Module'
import Init from './Init'

export type PhaseClassOptions = {
  fromClass?: string
  activeClass?: string
  toClass?: string
  doneClass?: string
}

export default class PhaseClass extends Init {
  static CLASS_PREFIX_FROM: string = ''
  static CLASS_PREFIX_ACTIVE: string = ''
  static CLASS_PREFIX_TO: string = ''
  static CLASS_PREFIX_DONE: string = ''
  static CLASS_SUFFIX_FROM: string = ''
  static CLASS_SUFFIX_ACTIVE: string = '-active'
  static CLASS_SUFFIX_TO: string = '-to'
  static CLASS_SUFFIX_DONE: string = '-done'

  private readonly name: string
  private readonly options: PhaseClassOptions

  constructor(name: string, options: PhaseClassOptions) {
    super()
    this.name = name
    this.options = options
  }

  get fromClass(): string {
    return (
      this.options.fromClass ||
      PhaseClass.CLASS_PREFIX_FROM + this.name + PhaseClass.CLASS_SUFFIX_FROM
    )
  }

  get activeClass(): string {
    return (
      this.options.activeClass ||
      PhaseClass.CLASS_PREFIX_ACTIVE + this.name + PhaseClass.CLASS_SUFFIX_ACTIVE
    )
  }

  get toClass(): string {
    return (
      this.options.toClass ||
      PhaseClass.CLASS_PREFIX_TO + this.name + PhaseClass.CLASS_SUFFIX_TO
    )
  }

  get doneClass(): string {
    return (
      this.options.doneClass ||
      PhaseClass.CLASS_PREFIX_DONE + this.name + PhaseClass.CLASS_SUFFIX_DONE
    )
  }

  cleanup(detail: Detail): void {
    detail.target.classList.remove(
      this.doneClass,
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

  cancelled(detail: Detail): void {
    detail.target.classList.remove(
      this.activeClass,
      this.toClass,
    )
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
