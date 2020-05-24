import Module from '../Module'
import StageDispatcher, { StageDispatcherDetail } from '../StageDispatcher'

export type PhaseClassOptions = Partial<{
  fromClass: string
  activeClass: string
  toClass: string
  doneClass: string
}>

export type PhaseClassDetail = Required<PhaseClassOptions>

export default class PhaseClass<
  T extends StageDispatcherDetail & PhaseClassDetail
> implements Module<PhaseClassDetail> {
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
    this.name = name
    this.options = { ...options }
  }

  get fromClass(): string {
    return (
      this.options.fromClass ||
      (this.options.fromClass =
        PhaseClass.CLASS_PREFIX_FROM + this.name + PhaseClass.CLASS_SUFFIX_FROM)
    )
  }

  get activeClass(): string {
    return (
      this.options.activeClass ||
      (this.options.activeClass =
        PhaseClass.CLASS_PREFIX_ACTIVE +
        this.name +
        PhaseClass.CLASS_SUFFIX_ACTIVE)
    )
  }

  get toClass(): string {
    return (
      this.options.toClass ||
      (this.options.toClass =
        PhaseClass.CLASS_PREFIX_TO + this.name + PhaseClass.CLASS_SUFFIX_TO)
    )
  }

  get doneClass(): string {
    return (
      this.options.doneClass ||
      (this.options.doneClass =
        PhaseClass.CLASS_PREFIX_DONE + this.name + PhaseClass.CLASS_SUFFIX_DONE)
    )
  }

  beforeStageChange(
    stageDispatcher: StageDispatcher<StageDispatcherDetail & PhaseClassDetail>,
    next: () => void
  ): void {
    // console.log('beforeStageChange')
    stageDispatcher.queueMutationTask((): void => {
      stageDispatcher.target.classList.remove(this.doneClass)
      // console.log('beforeStageChange scheduled')
    })
    next()
  }

  beforeStart(
    stageDispatcher: StageDispatcher<StageDispatcherDetail & PhaseClassDetail>,
    next: () => void
  ): void {
    // console.log('beforeStart')
    stageDispatcher.queueMutationTask((): void => {
      stageDispatcher.target.classList.remove(this.toClass, this.doneClass)
      stageDispatcher.target.classList.add(this.fromClass, this.activeClass)
      // console.log('beforeStart scheduled')
    })
    next()
  }

  //todo skipped() hook (cancel for beforeStart)
  skipped(
    stageDispatcher: StageDispatcher<StageDispatcherDetail & PhaseClassDetail>,
    next: () => void
  ): void {
    console.log('skipped', performance.now())
    stageDispatcher.queueMutationTask((): void => {
      stageDispatcher.target.classList.remove(this.fromClass, this.activeClass)
      console.log('skipped scheduled', performance.now())
    })
    next()
  }

  start(
    stageDispatcher: StageDispatcher<StageDispatcherDetail & PhaseClassDetail>,
    next: () => void
  ): void {
    console.log('start', performance.now())
    stageDispatcher.queueMutationTask((): void => {
      stageDispatcher.target.classList.remove(this.fromClass)
      stageDispatcher.target.classList.add(this.toClass)
      console.log('start scheduled', performance.now())
    })
    next()
  }

  afterEnd(
    stageDispatcher: StageDispatcher<StageDispatcherDetail & PhaseClassDetail>,
    next: () => void
  ): void {
    console.log('afterEnd', performance.now())
    stageDispatcher.queueMutationTask((): void => {
      stageDispatcher.target.classList.remove(this.activeClass, this.toClass)
      stageDispatcher.target.classList.add(this.doneClass)
      console.log('afterEnd scheduled', performance.now())
    })
    next()
  }

  cancelled(
    stageDispatcher: StageDispatcher<StageDispatcherDetail & PhaseClassDetail>,
    next: () => void
  ): void {
    console.log('cancelled', performance.now())
    stageDispatcher.queueMutationTask((): void => {
      stageDispatcher.target.classList.remove(
        // this.fromClass,
        this.activeClass,
        this.toClass
      )
      console.log('cancelled scheduled', performance.now())
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
