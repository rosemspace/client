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

const { setTimeout, clearTimeout, getComputedStyle } = globalThis

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
  protected static defaultEasing: CSSTransitionDeclaration = {
    endEventName: 'transitionend',
    properties: [],
    delays: [],
    durations: [],
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
  running = false
  protected easing: CSSTransitionDeclaration | CSSAnimationDeclaration =
    StageDispatcher.defaultEasing
  protected easingEndEventListener?: EventListener
  protected easingEndTimerId?: NodeJS.Timeout | number
  // protected frameId?: number
  protected tasks: (() => void)[] = []
  protected timerId?: NodeJS.Timeout | number
  protected resolve?: (value?: T | PromiseLike<T>) => void

  constructor(
    element: HTMLElement | SVGSVGElement,
    stages = [],
    options?: StageDispatcherOptions
  ) {
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
  }

  public get stage(): Stage<T> {
    return this.stages[this.stageIndex]
  }

  public get stageName(): string {
    return `${this.stage.name || String(this.stageIndex)}`
  }

  public get duration(): number {
    return this.isExplicitDuration
      ? this.stage.duration || 0
      : this.easing.timeout
  }

  public get isExplicitDuration(): boolean {
    return this.stage.isExplicitDuration
  }

  protected addEasingEndEventListener(): void {
    this.easing = StageDispatcher.defaultEasing

    if (!this.isExplicitDuration) {
      const { target, transitionInfo, animationInfo } = this.detail

      if (
        transitionInfo.timeout &&
        transitionInfo.timeout >= animationInfo.timeout
      ) {
        this.easing = transitionInfo
        this.easingEndEventListener = this.onTransitionEnd.bind(
          this
        ) as EventListener
      } else if (animationInfo.timeout) {
        this.easing = animationInfo
        this.easingEndEventListener = this.onAnimationEnd.bind(
          this
        ) as EventListener
      }

      if (null != this.easingEndEventListener && this.easing.timeout > 0) {
        target.addEventListener(
          this.easing.endEventName,
          this.easingEndEventListener,
          { passive: true }
        )
        // Failsafe
        this.easingEndTimerId = setTimeout(
          this.easingEndEventListener,
          this.easing.timeout + 50,
          { target }
        )
      }
    } else {
      this.easingEndEventListener = undefined
    }
  }

  protected removeEasingEndEventListener(): void {
    if (
      null != this.easingEndEventListener &&
      null != this.target &&
      !this.isExplicitDuration
    ) {
      this.target.removeEventListener(
        this.easing.endEventName,
        this.easingEndEventListener
      )
      // Clear failsafe
      clearTimeout(this.easingEndTimerId as NodeJS.Timeout)
    }
  }

  protected onTransitionEnd(event: TransitionEvent): void {
    if (
      this.running &&
      event.target === this.target &&
      isTransitionMaxTimeout(
        this.easing as CSSTransitionDeclaration,
        event.propertyName
      )
    ) {
      this.done()
    }
  }

  protected onAnimationEnd(event: AnimationEvent): void {
    if (
      this.running &&
      event.target === this.target &&
      isAnimationMaxTimeout(
        this.easing as CSSAnimationDeclaration,
        event.animationName
      )
    ) {
      this.done()
    }
  }

  protected dispatchPhase(phase: Phase): void {
    this.stage.dispatch(this, phase)
  }

  queueMeasureTask(comment: string, task: () => void): void {
    this.tasks.push(task)
    DOMScheduler.measure(task)
    console.log(comment)
  }

  queueMutationTask(comment: string, task: () => void): void {
    const newTask = (): void => {
      task()
      console.log(comment)
    }
    this.tasks.push(newTask)
    DOMScheduler.mutate(newTask)
  }

  protected clearTasks(): void {
    for (const task of this.tasks) {
      DOMScheduler.clear(task)
    }

    this.tasks.length = 0

    if (this.timerId) {
      // Custom duration used
      clearTimeout(this.timerId as NodeJS.Timeout)
      this.timerId = undefined
    }
    // else {
    //   // Auto duration used
    //   cancelAnimationFrame(this.frameId)
    //   this.frameId = undefined
    // }
  }

  protected done(): void {
    this.removeEasingEndEventListener()
    delete this.detail.done
    this.queueMutationTask('done before AfterEnd', (): void => {
      this.running = false
      this.tasks.length = 0
    })
    this.dispatchPhase(PhaseEnum.AfterEnd)

    if (null != this.resolve) {
      this.resolve(this.detail)
    }
  }

  protected cancelled(): void {
    this.clearTasks()
    this.removeEasingEndEventListener()
    this.dispatchPhase(PhaseEnum.Cancelled)
  }

  assignDetail(detail: Record<string, unknown>): void {
    Object.assign(this.detail, detail)
  }

  computeDetail(): void {
    this.queueMeasureTask('1. compute detail basic', (): void => {
      const target = this.target

      this.detail = {
        ...this.detail,
        name: this.options.name,
        currentTarget: this.element,
        target,
        delegateTarget: this.currentTarget,
        stageIndex: this.stageIndex,
        stageName: this.stageName,
        duration: this.duration || 0,
        running: this.running,
      }

      this.queueMeasureTask('3. compute detail transition', (): void => {
        const computedStyle = getComputedStyle(target)

        this.detail.transitionInfo = getComputedTransition(computedStyle)
        this.detail.animationInfo = getComputedAnimation(computedStyle)
      })
    })
  }

  public forceDispatchByIndex(stageIndex = 0): Promise<T> {
    this.running = false
    this.computeDetail()
    this.queueMeasureTask(
      'force change stage index and clear tasks',
      (): void => {
        this.stageIndex = this.detail.stageIndex = stageIndex
        this.clearTasks()
      }
    )
    this.dispatchPhase(PhaseEnum.AfterEnd)

    return new Promise((resolve) => {
      this.resolve = resolve
    })
  }

  public dispatchByIndex(stageIndex = 0): Promise<T> {
    if (this.tasks.length) {
      this.cancelled()
    }

    if (this.stageIndex !== stageIndex) {
      const oldStageIndex = this.stageIndex

      this.computeDetail()
      // this.queueMeasureTask('2. change stage index', (): void => {
      //   // Should be inside the task!
      // })
      this.stageIndex = stageIndex
      this.stages[oldStageIndex].dispatch(this, PhaseEnum.BeforeStageChange)
    }

    this.dispatchPhase(PhaseEnum.BeforeStart)
    this.queueMutationTask('after BeforeStart', (): void => {
      // Request a new animation frame (alongside with the existed one in the
      // DOM scheduler) to run the code in a next frame
      this.queueMutationTask('after BeforeStart next frame', (): void => {
        this.running = true
        this.addEasingEndEventListener()
        this.detail.done = this.done.bind(this)
      })
      this.dispatchPhase(PhaseEnum.Start)
      this.queueMutationTask('after Start', (): void => {
        if (this.isExplicitDuration) {
          if ((this.stage.duration as number) > 0) {
            this.timerId = setTimeout(() => {
              this.done()
            }, this.stage.duration)
          } else {
            // No need to run on next macrotask if zero duration
            this.done()
          }
        } else if (this.easing.timeout <= 0) {
          // If zero duration then end event won't be fired
          this.done()
        }
      })
    })

    return new Promise((resolve) => {
      this.resolve = resolve
    })
  }

  public play(startStageIndex = 0, endStageIndex?: number | null): Promise<T> {
    endStageIndex = null != endStageIndex ? endStageIndex : this.stages.length

    return this.dispatchByIndex(startStageIndex).then((detail) => {
      return ++startStageIndex < (null != endStageIndex ? endStageIndex : 0)
        ? this.play(startStageIndex, endStageIndex)
        : detail
    })
  }
}
