import { Detail, Phase } from '../ModuleInterface'
import AbstractModule from '../AbstractModule'

export type CSSClassOptions = {
  fromClass?: string
  activeClass?: string
  toClass?: string
  doneClass?: string
}

export default class CSSClass extends AbstractModule {
  public static CLASS_PREFIX_FROM: string = ''
  public static CLASS_PREFIX_ACTIVE: string = ''
  public static CLASS_PREFIX_TO: string = ''
  public static CLASS_PREFIX_DONE: string = ''
  public static CLASS_SUFFIX_FROM: string = ''
  public static CLASS_SUFFIX_ACTIVE: string = '-active'
  public static CLASS_SUFFIX_TO: string = '-to'
  public static CLASS_SUFFIX_DONE: string = '-done'

  private readonly name: string
  private readonly options: CSSClassOptions

  constructor(name: string, options: CSSClassOptions) {
    super(Phase.length)
    this.name = name
    this.options = options
  }

  public get fromClass(): string {
    return (
      this.options.fromClass ||
      CSSClass.CLASS_PREFIX_FROM + this.name + CSSClass.CLASS_SUFFIX_FROM
    )
  }

  public get activeClass(): string {
    return (
      this.options.activeClass ||
      CSSClass.CLASS_PREFIX_ACTIVE + this.name + CSSClass.CLASS_SUFFIX_ACTIVE
    )
  }

  public get toClass(): string {
    return (
      this.options.toClass ||
      CSSClass.CLASS_PREFIX_TO + this.name + CSSClass.CLASS_SUFFIX_TO
    )
  }

  public get doneClass(): string {
    return (
      this.options.doneClass ||
      CSSClass.CLASS_PREFIX_DONE + this.name + CSSClass.CLASS_SUFFIX_DONE
    )
  }

  public [Phase.Cleanup]({ target }: Detail): void {
    target.classList.remove(
      this.fromClass,
      this.activeClass,
      this.toClass,
      this.doneClass
    )
  }

  public [Phase.BeforeStart]({ target }: Detail): void {
    target.classList.remove(this.toClass, this.doneClass)
    target.classList.add(this.fromClass, this.activeClass)
  }

  public [Phase.Start]({ target }: Detail): void {
    target.classList.remove(this.fromClass)
    target.classList.add(this.toClass)
  }

  public [Phase.AfterEnd]({ target }: Detail): void {
    target.classList.remove(this.activeClass, this.toClass)
    target.classList.add(this.doneClass)
  }

  public getDetail(): Detail {
    return {
      css: true,
      fromClass: this.fromClass,
      activeClass: this.activeClass,
      toClass: this.toClass,
      doneClass: this.doneClass,
    }
  }
}
