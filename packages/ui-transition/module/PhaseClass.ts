import { AbstractModule, Detail } from '../Module'

export type PhaseClassOptions = Partial<{
  fromClass: string
  activeClass: string
  toClass: string
  doneClass: string
}>

export type PhaseClassDetail = Required<PhaseClassOptions>

export default class PhaseClass extends AbstractModule {
  static CLASS_PREFIX_FROM = ''
  static CLASS_PREFIX_ACTIVE = ''
  static CLASS_PREFIX_TO = ''
  static CLASS_PREFIX_DONE = ''
  static CLASS_SUFFIX_FROM = ''
  static CLASS_SUFFIX_ACTIVE = '-active'
  static CLASS_SUFFIX_TO = '-to'
  static CLASS_SUFFIX_DONE = '-done'

  private readonly name: string
  private readonly options: PhaseClassOptions

  constructor(name: string, options: PhaseClassOptions) {
    super()
    this.name = name
    this.options = { ...options }
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
    this.mutate(() => {
      detail.target.classList.remove(this.doneClass)
    })
    next()
  }

  beforeStart({ target }: Detail, next: () => void): void {
    this.mutate(() => {
      target.classList.remove(this.toClass, this.doneClass)
      target.classList.add(this.fromClass, this.activeClass)
    })
    next()
  }

  start({ target }: Detail, next: () => void): void {
    this.mutate(() => {
      target.classList.remove(this.fromClass)
      target.classList.add(this.toClass)
    })
    next()
  }

  afterEnd({ target }: Detail, next: () => void): void {
    this.mutate(() => {
      target.classList.remove(this.activeClass, this.toClass)
      target.classList.add(this.doneClass)
    })
    next()
  }

  cancelled(detail: Detail, next: () => void): void {
    super.clearTasks()
    this.mutate(() => {
      console.log(this.fromClass, this.activeClass, this.toClass)
      detail.target.classList.remove(
        this.fromClass,
        this.activeClass,
        this.toClass
      )
    })
    next()
  }

  getDetail(): PhaseClassDetail {
    return {
      fromClass: this.fromClass,
      activeClass: this.activeClass,
      toClass: this.toClass,
      doneClass: this.doneClass,
    }
  }
}
