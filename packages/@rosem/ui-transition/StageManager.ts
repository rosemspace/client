import Stage from './Stage'
import { Phase, Details } from './MiddlewareInterface'
import CSSTransitionDeclaration from '@rosem/util-dom/CSSTransitionDeclaration'
import CSSAnimationDeclaration from '@rosem/util-dom/CSSAnimationDeclaration'
import getComputedTransition from '@rosem/util-dom/getComputedTransition'
import getComputedAnimation from '@rosem/util-dom/getComputedAnimation'
import isTransitionMaxTimeout from '@rosem/util-dom/isTransitionMaxTimeout'
import isAnimationMaxTimeout from '@rosem/util-dom/isAnimationMaxTimeout'

export type StageManagerOptions = {
  target?: string
  name: string
  stageIndex: number
  [name: string]: any
}

export default class StageManager {
  protected static defaultEasing: CSSTransitionDeclaration = {
    endEventName: 'transitionend',
    properties: [],
    delays: [],
    durations: [],
    timeout: 0,
  }

  protected element: HTMLElement
  protected target: HTMLElement
  protected options: StageManagerOptions = {
    name: 'transition',
    stageIndex: 0,
  }
  // name: string
  protected stages: Stage[]
  protected stageIndex: number
  protected running: boolean = false
  protected easing: CSSTransitionDeclaration | CSSAnimationDeclaration =
    StageManager.defaultEasing
  protected easingEndEventListener?: EventListener
  protected frameId?: number
  protected timerId?: number
  protected resolve?: (value?: Details | PromiseLike<Details>) => void

  constructor(
    element: HTMLElement,
    stages = [],
    options?: StageManagerOptions
  ) {
    this.element = element
    this.target = this.element
    this.stages = stages
    this.options = Object.assign(this.options, options || {})
    this.stageIndex = this.options.stageIndex
  }

  public get delegatedTarget(): HTMLElement | null {
    // todo remove ternary or maybe just make it as computed?
    return null != this.options.target
      ? this.target.querySelector(this.options.target)
      : this.target
  }

  public get stage(): Stage {
    return this.stages[this.stageIndex]
  }

  public get stageName(): string {
    return `${this.stage.name || String(this.stageIndex)}`
  }

  public get duration(): number {
    return this.isExplicitDuration
      ? null != this.stage.duration
        ? this.stage.duration
        : 0
      : this.easing.timeout
  }

  public get isExplicitDuration(): boolean {
    return this.stage.isExplicitDuration
  }

  protected nextFrame(callback: FrameRequestCallback): void {
    // todo: need more tests
    // this.frameId = window.requestAnimationFrame(cb)
    this.frameId = self.requestAnimationFrame(() => {
      this.frameId = self.requestAnimationFrame(callback)
    })
  }

  protected cancelNextFrame(): void {
    if (this.frameId) {
      self.cancelAnimationFrame(this.frameId)
      this.frameId = undefined
    } else {
      self.clearTimeout(this.timerId)
      this.timerId = undefined
    }
  }

  protected addEasingEndEventListener(details: Details): void {
    this.easing = StageManager.defaultEasing

    if (!this.isExplicitDuration) {
      const delegatedTarget = this.delegatedTarget

      if (null != delegatedTarget) {
        const computedStyle = window.getComputedStyle(delegatedTarget)
        const transitionInfo = getComputedTransition(computedStyle)
        const animationInfo = getComputedAnimation(computedStyle)

        if (
          transitionInfo.timeout &&
          transitionInfo.timeout >= animationInfo.timeout
        ) {
          this.easing = transitionInfo
          this.easingEndEventListener = this.onTransitionEnd.bind(
            this,
            details
          ) as EventListener
        } else if (animationInfo.timeout) {
          this.easing = animationInfo
          this.easingEndEventListener = this.onAnimationEnd.bind(
            this,
            details
          ) as EventListener
        }

        if (null != this.easingEndEventListener && this.easing.timeout > 0) {
          delegatedTarget.addEventListener(
            this.easing.endEventName,
            this.easingEndEventListener
          )
        }
      }
    } else {
      this.easingEndEventListener = undefined
    }
  }

  protected removeEasingEndEventListener(): void {
    if (
      null != this.easingEndEventListener &&
      null != this.delegatedTarget &&
      !this.isExplicitDuration
    ) {
      this.delegatedTarget.removeEventListener(
        this.easing.endEventName,
        this.easingEndEventListener
      )
    }
  }

  protected onTransitionEnd(details: Details, event: TransitionEvent): void {
    if (
      this.running &&
      event.target === this.delegatedTarget &&
      isTransitionMaxTimeout(
        this.easing as CSSTransitionDeclaration,
        event.propertyName
      )
    ) {
      this[Phase.afterEnd](details)
    }
  }

  protected onAnimationEnd(details: Details, event: AnimationEvent): void {
    if (
      this.running &&
      event.target === this.delegatedTarget &&
      isAnimationMaxTimeout(
        this.easing as CSSAnimationDeclaration,
        event.animationName
      )
    ) {
      this[Phase.afterEnd](details)
    }
  }

  protected runPhase(phase: Phase, details: Details = {}): Details {
    return this.stage.run(phase, details)
  }

  protected [Phase.beforeStart](details: Details = {}): Details {
    this.running = true

    if (null != this.delegatedTarget) {
      this.delegatedTarget.style.display = ''
    }

    return this.runPhase(Phase.beforeStart, details)
  }

  protected [Phase.start](details: Details = {}): Details {
    details.done = () => this[Phase.afterEnd]()

    return this.runPhase(Phase.start, details)
  }

  protected [Phase.afterEnd](details: Details = {}): Details {
    this.removeEasingEndEventListener()
    delete details.done
    this.running = false
    const finalDetails = this.runPhase(Phase.afterEnd, details)

    if (null != this.resolve) {
      this.resolve(finalDetails)
    }

    return finalDetails
  }

  protected [Phase.cancelled](details: Details = {}): Details {
    this.removeEasingEndEventListener()
    this.cancelNextFrame()

    return this.runPhase(Phase.cancelled, details)
  }

  public cancel(): Details {
    return this.runPhase(Phase.cancelled, this.getDetails())
  }

  public getDetails(): Details {
    return {
      name: this.options.name,
      currentTarget: this.element,
      target: this.delegatedTarget,
      delegateTarget: this.target,
      stageIndex: this.stageIndex,
      stageName: this.stageName,
      duration: this.duration || 0,
    }
  }

  public forceRun(stageIndex: number = 0): void {
    const details = this.getDetails()
    this.running && this[Phase.cancelled](details)
    this.stageIndex = details.stageIndex = stageIndex
    this[Phase.afterEnd](details)
  }

  public run(stageIndex: number = 0): Promise<Details> {
    const details = this.getDetails()
    this.running && this[Phase.cancelled](details)
    this.stageIndex = details.stageIndex = stageIndex
    this[Phase.beforeStart](details)
    this.addEasingEndEventListener(details)
    this.nextFrame(() => {
      this[Phase.start](details)

      if (this.isExplicitDuration) {
        this.timerId = window.setTimeout(
          () => this[Phase.afterEnd](details),
          this.duration
        )
      } else if (this.easing.timeout <= 0) {
        // if zero duration end event won't be fired
        this[Phase.afterEnd](details)
      }
    })

    return new Promise((resolve) => {
      this.resolve = resolve
    })
  }

  public play(
    startStageIndex: number = 0,
    endStageIndex?: number | null
  ): Promise<Details> {
    endStageIndex = null != endStageIndex ? endStageIndex : this.stages.length

    return this.run(startStageIndex).then((details) => {
      return ++startStageIndex < (null != endStageIndex ? endStageIndex : 0)
        ? this.play(startStageIndex, endStageIndex)
        : details
    })
  }
}
