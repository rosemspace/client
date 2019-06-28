import DOMScheduler from '@rosemlab/dom-scheduler'
import { Detail } from '../Module'
import Delegate from './Delegate'

export type PhaseClassOptions = {
  fromClass?: string
  activeClass?: string
  toClass?: string
  doneClass?: string
}

export default class PhaseClass extends Delegate {
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
  private task: () => void = () => {}

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
      PhaseClass.CLASS_PREFIX_ACTIVE +
        this.name +
        PhaseClass.CLASS_SUFFIX_ACTIVE
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

  cleanup(detail: Detail, next: () => void): void {
    this.applyClasses(() => {
      detail.target.classList.remove(this.doneClass)
    })

    super.cleanup(detail, next)
  }

  beforeStart({ target }: Detail, next: () => void): void {
    this.applyClasses(() => {
      target.classList.remove(this.toClass, this.doneClass)
      target.classList.add(this.fromClass, this.activeClass)
    })

    super.beforeStart(arguments[0], next)
  }

  start({ target }: Detail, next: () => void): void {
    this.applyClasses(() => {
      target.classList.remove(this.fromClass)
      target.classList.add(this.toClass)
    })

    super.start(arguments[0], next)
  }

  afterEnd({ target }: Detail, next: () => void): void {
    this.applyClasses(() => {
      target.classList.remove(this.activeClass, this.toClass)
      target.classList.add(this.doneClass)
    })

    super.afterEnd(arguments[0], next)
  }

  cancelled(detail: Detail, next: () => void): void {
    DOMScheduler.clear(this.task)
    this.applyClasses(() => {
      detail.target.classList.remove(this.activeClass, this.toClass)
    })

    super.cancelled(detail, next)
  }

  getDetail(): Partial<Detail> {
    return {
      css: true,
      fromClass: this.fromClass,
      activeClass: this.activeClass,
      toClass: this.toClass,
      doneClass: this.doneClass,
    }
  }

  protected applyClasses(callback: () => void): void {
    this.task = DOMScheduler.mutate(callback)
  }
}
