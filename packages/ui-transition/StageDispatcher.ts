import {
  getComputedAnimation,
  getComputedTransition,
  isAnimationMaxTimeout,
  isTransitionMaxTimeout,
} from '@rosemlabs/dom-easing'
import CSSAnimationDeclaration from '@rosemlabs/dom-easing/CSSAnimationDeclaration'
import CSSTransitionDeclaration from '@rosemlabs/dom-easing/CSSTransitionDeclaration'
import DOMScheduler from '@rosemlabs/dom-scheduler'
import { Phase, PhaseEnum } from './Module'
import Stage from './Stage'

export type StageDispatcherOptions = {
  name: string
  target?: string
  stageIndex?: number
}

export type StageDispatcherDetail = {
  name: string
  currentTarget: HTMLElement | SVGSVGElement
  target: HTMLElement | SVGSVGElement
  delegateTarget: HTMLElement | SVGSVGElement
  computedStyle: CSSStyleDeclaration
  transitionInfo: CSSTransitionDeclaration
  animationInfo: CSSAnimationDeclaration
  stageIndex: number
  stageName: string
  duration: number
  running: boolean
  done?: () => void
}

export default class StageDispatcher<
  T extends StageDispatcherDetail = StageDispatcherDetail
> {
  domScheduler: typeof DOMScheduler
  protected static defaultEasing: CSSTransitionDeclaration = {
    endEventName: 'transitionend',
    properties: [],
    delays: [],
    durations: [],
    maxDelay: 0,
    maxDuration: 0,
    timeout: 0,
  }

  readonly element: HTMLElement | SVGSVGElement
  readonly currentTarget: HTMLElement | SVGSVGElement
  readonly target: HTMLElement | SVGSVGElement
  protected options: StageDispatcherOptions = {
    name: 'transition',
    stageIndex: 0,
  }
  // name: string
  protected stages: Stage<T>[]
  detail!: T
  stageIndex: number
  runningStageIndex: number
  startTime = 0
  timePassed = 0
  intentToRun = false
  running = false
  protected easing: CSSTransitionDeclaration | CSSAnimationDeclaration =
    StageDispatcher.defaultEasing
  protected easingEndEventListener?: EventListener
  protected frameId?: number
  protected timerId?: NodeJS.Timeout | number
  protected easingEndTimerId?: NodeJS.Timeout | number
  // protected frameId?: number
  protected tasks: (() => void)[] = []
  protected resolve?: (value?: T | PromiseLike<T>) => void
  protected dispatchPerFrameCount = 0

  constructor(
    element: HTMLElement | SVGSVGElement,
    stages = [],
    options?: StageDispatcherOptions
  ) {
    this.domScheduler = DOMScheduler
    this.element = element
    this.currentTarget = this.element
    this.target =
      null != this.options.target
        ? this.currentTarget.querySelector(this.options.target) ||
          this.currentTarget
        : this.currentTarget
    this.stages = stages
    this.options = Object.assign(this.options, options || {})
    this.stageIndex = this.options.stageIndex || 0
    this.runningStageIndex = this.stageIndex
  }

  get stage(): Stage<T> {
    return this.stages[this.stageIndex]
  }

  get stageName(): string {
    return `${this.stage.name || String(this.stageIndex)}`
  }

  get duration(): number {
    return (
      (this.isExplicitDuration ? this.stage.duration : this.easing.timeout) || 0
    )
  }

  get isExplicitDuration(): boolean {
    return this.stage.isExplicitDuration
  }

  assignDetail(detail: Record<string, unknown>): void {
    Object.assign(this.detail, detail)
  }

  protected computeDetail(): void {
    // this.queueMeasureTask((): void => {
    const target = this.target

    this.detail = {
      ...this.detail,
      name: this.options.name,
      currentTarget: this.element,
      target,
      delegateTarget: this.currentTarget,
      stageIndex: this.stageIndex,
      stageName: this.stageName,
      duration: this.duration,
      running: this.running,
    }
  }

  protected computeEasing() {
    this.easing = StageDispatcher.defaultEasing

    if (!this.isExplicitDuration) {
      const computedStyle = globalThis.getComputedStyle(this.target)
      const transitionInfo = getComputedTransition(computedStyle)
      const animationInfo = getComputedAnimation(computedStyle)

      if (
        transitionInfo.timeout > 0 &&
        transitionInfo.timeout >= animationInfo.timeout
      ) {
        this.easing = transitionInfo
        this.easingEndEventListener = this.onTransitionEnd.bind(
          this
        ) as EventListener
      } else if (animationInfo.timeout > 0) {
        this.easing = animationInfo
        this.easingEndEventListener = this.onAnimationEnd.bind(
          this
        ) as EventListener
      }
    }
  }

  protected addEasingEndEventListener(): void {
    if (this.isExplicitDuration) {
      // this.easingEndEventListener = undefined

      return
    }

    this.computeDetail()
    this.computeEasing()

    if (null != this.easingEndEventListener && this.easing.timeout > 0) {
      this.detail.target.addEventListener(
        this.easing.endEventName,
        this.easingEndEventListener,
        { passive: true }
      )
      // Failsafe
      this.easingEndTimerId = globalThis.setTimeout(
        this.easingEndEventListener,
        this.easing.timeout + 1,
        // Empty event object
        {}
      )
    }
  }

  protected removeEasingEndEventListener(): void {
    // if (
    //   null != this.easingEndEventListener &&
    //   null != this.target &&
    //   !this.isExplicitDuration
    // ) {
    this.target.removeEventListener(
      this.easing.endEventName,
      this.easingEndEventListener!
    )
    // Clear failsafe
    globalThis.clearTimeout(this.easingEndTimerId as NodeJS.Timeout)
    // }
    this.easingEndEventListener = undefined
  }

  protected onTransitionEnd(event: TransitionEvent): void {
    // debugger
    if (
      (this.running &&
        event.target === this.target &&
        // event.elapsedTime * 1000 === this.easing.maxDuration &&
        isTransitionMaxTimeout(
          this.easing as CSSTransitionDeclaration,
          event.propertyName
        )) ||
      // Failsafe
      !event.target
    ) {
      this.done()
    }
  }

  protected onAnimationEnd(event: AnimationEvent): void {
    if (
      (this.running &&
        event.target === this.target &&
        // event.elapsedTime * 1000 === this.easing.maxDuration &&
        isAnimationMaxTimeout(
          this.easing as CSSAnimationDeclaration,
          event.animationName
        )) ||
      // Failsafe
      !event.target
    ) {
      this.done()
    }
  }

  protected dispatchPhase(phase: Phase): void {
    this.stage.dispatch(this, phase)
  }

  queueMeasureTask(task: (time: number) => void): void {
    //@ts-ignore
    this.tasks.push(DOMScheduler.measure(task))
  }

  queueMutationTask(task: (time: number) => void): void {
    //@ts-ignore
    this.tasks.push(DOMScheduler.mutate(task))
  }

  queueNextTask(task: (time: number) => void): void {
    this.queueMutationTask(() => {
      this.queueMeasureTask(task)
    })
  }

  protected clearQueue(): void {
    // Clear tasks
    for (const task of this.tasks) {
      DOMScheduler.clear(task)
    }
    // DOMScheduler.cancel()

    this.tasks.length = 0

    // timerId should be checked first as frameId will be presented even if
    // explicit duration is provided
    if (this.timerId) {
      // Explicit duration used
      globalThis.clearTimeout(this.timerId as NodeJS.Timeout)
      this.timerId = undefined
    } else if (this.frameId) {
      // CSS transition duration used
      globalThis.cancelAnimationFrame(this.frameId)
      this.frameId = undefined
    }
  }

  protected done(): void {
    console.log('DONE')
    // debugger
    this.removeEasingEndEventListener()
    // this.easingEndEventListener = undefined
    // this.clearQueue()
    delete this.detail.done
    // this.queueMutationTask((): void => {
    this.running = false
    // this.tasks.length = 0
    // })
    // queueMicrotask(() => {
    this.dispatchPhase(PhaseEnum.AfterEnd)

    if (null != this.resolve) {
      this.resolve(this.detail)
    }
    // })
  }

  protected cancelled(): void {
    this.removeEasingEndEventListener()
    // this.clearQueue()
    // this.queueNextTask(() => {
    this.dispatchPhase(PhaseEnum.Cancelled)
    // })
  }

  public forceDispatchByIndex(stageIndex = 0): Promise<T> {
    this.running = false
    this.queueMeasureTask((): void => {
      this.computeDetail()
      this.stageIndex = this.detail.stageIndex = stageIndex
      // this.queueMeasureTask((): void => {
      // this.clearQueue()
    })
    // this.queueMutationTask(() => {
    this.dispatchPhase(PhaseEnum.AfterEnd)
    // })
    // })

    return new Promise((resolve) => {
      this.resolve = resolve
    })
  }

  public dispatchByIndex(stageIndex = 0): Promise<T> {
    return new Promise((resolve) => {
      this.resolve = resolve
      // ++this.dispatchPerFrameCount
      console.log('__TIME RUN', this.dispatchPerFrameCount, performance.now())

      // globalThis.cancelAnimationFrame(this.frameId as number)
      this.frameId = globalThis.requestAnimationFrame((time): void => {
        ++this.dispatchPerFrameCount
      })
      if (this.intentToRun) {
        // this.clearQueue()
        // debugger
        this.dispatchPhase(PhaseEnum.Skipped)
        this.intentToRun = false
      }
      this.queueMeasureTask((time) => {
        // this.frameId = globalThis.requestAnimationFrame((time): void => {
        if (this.running) {
          //todo skipped
        this.startTime = time
          //FPS = 1000 / (newTime - oldTime)
          console.log('__TIME CANCEL/RUN', this.dispatchPerFrameCount, performance.now(), time)
          // this.cancelled()
        }
        this.intentToRun = true
        // this.running = true

        if (this.stageIndex !== stageIndex) {
          this.dispatchPhase(PhaseEnum.BeforeStageChange)
          this.stageIndex = stageIndex
        }

        this.dispatchPhase(PhaseEnum.BeforeStart)
        // this.running = true
        // this.tasks.length = 0
        // this.clearQueue()
        // Request a new animation frame to run the code in a next frame
        // this.frameId = globalThis.requestAnimationFrame((time): void => {
        //   console.log('2', time)
        this.queueNextTask((time): void => {
          console.log('__TIME START', this.dispatchPerFrameCount, performance.now(), time)
          if (time - this.startTime < 16.6) {
            console.error('BUG', time - this.startTime)
            this.startTime = 0
          }
          if (this.running) {
            //todo cancelled
            this.cancelled()
          }
          // this.startTime = time
          // this.intentToRun = false
          this.running = true
          // this.frameId = globalThis.requestAnimationFrame((time): void => {
          //   this.dispatchPerFrameCount = 0
          // })
          this.detail.done = this.done.bind(this)
          this.dispatchPhase(PhaseEnum.Start)

          if (this.isExplicitDuration) {
            if (this.stage.duration > 0) {
              this.timerId = globalThis.setTimeout((): void => {
                this.done()
              }, this.stage.duration)
            } else {
              // No need to run on the next macrotask if the explicit duration is
              // zero. Queue as a microtask to preserve execution order
              // globalThis.queueMicrotask((): void => {
              this.done()
              // })
            }
          } else {
            // this.queueNextTask(() => {
            // this.queueMutationTask(() => {
            this.addEasingEndEventListener()

            if (this.easing.timeout <= 0) {
              debugger
              // If the duration is zero then the end event won't be fired.
              // Queue as a microtask to preserve execution order
              // globalThis.queueMicrotask((): void => {
              this.done()
              // })
            } else {
            }
            // })
          }
        })
      })
    })
  }

  play(startStageIndex = 0, endStageIndex?: number | null): Promise<T> {
    endStageIndex = null != endStageIndex ? endStageIndex : this.stages.length

    return this.dispatchByIndex(startStageIndex).then((detail) => {
      return ++startStageIndex < (null != endStageIndex ? endStageIndex : 0)
        ? this.play(startStageIndex, endStageIndex)
        : detail
    })
  }
}
