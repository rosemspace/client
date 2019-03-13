import CSSTransitionDeclaration from '@rosem-util/dom-easing/CSSTransitionDeclaration'
import CSSAnimationDeclaration from '@rosem-util/dom-easing/CSSAnimationDeclaration'
import getComputedTransition from '@rosem-util/dom-easing/getComputedTransition'
import getComputedAnimation from '@rosem-util/dom-easing/getComputedAnimation'
import isTransitionMaxTimeout from '@rosem-util/dom-easing/isTransitionMaxTimeout'
import isAnimationMaxTimeout from '@rosem-util/dom-easing/isAnimationMaxTimeout'
import {
  requestAnimationFrame,
  cancelAnimationFrame,
} from '@rosem-util/dom-easing/animationFrame'
import setStyle from '@rosem-util/dom/setStyle'
import { Detail, Phase, PhaseEnum } from './ModuleInterface'
import Stage from './Stage'

export type StageDispatcherOptions = {
  target?: string
  name: string
  stageIndex: number
}

export default class StageDispatcher {
  protected static defaultEasing: CSSTransitionDeclaration = {
    endEventName: 'transitionend',
    properties: [],
    delays: [],
    durations: [],
    timeout: 0,
  }

  protected element: HTMLElement | SVGElement
  protected target: HTMLElement | SVGElement
  protected options: StageDispatcherOptions = {
    name: 'transition',
    stageIndex: 0,
  }
  // name: string
  protected stages: Stage[]
  protected stageIndex: number
  protected running: boolean = false
  protected easing: CSSTransitionDeclaration | CSSAnimationDeclaration =
    StageDispatcher.defaultEasing
  protected easingEndEventListener?: EventListener
  protected frameId?: number
  protected timerId?: number
  protected resolve?: (value?: Detail | PromiseLike<Detail>) => void

  constructor(
    element: HTMLElement | SVGElement,
    stages = [],
    options?: StageDispatcherOptions
  ) {
    this.element = element
    this.target = this.element
    this.stages = stages
    this.options = Object.assign(this.options, options || {})
    this.stageIndex = this.options.stageIndex
  }

  public get delegatedTarget(): Element | null {
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
      ? this.stage.duration || 0
      : this.easing.timeout
  }

  public get isExplicitDuration(): boolean {
    return this.stage.isExplicitDuration
  }

  protected nextFrame(callback: FrameRequestCallback): void {
    // Any rAFs queued in a rAF will be executed in the next frame​.
    this.frameId = requestAnimationFrame(() => {
      this.frameId = requestAnimationFrame(callback)
    })
  }

  protected cancelNextFrame(): void {
    if (this.frameId) {
      cancelAnimationFrame(this.frameId)
      this.frameId = undefined
    } else {
      self.clearTimeout(this.timerId)
      this.timerId = undefined
    }
  }

  protected addEasingEndEventListener(details: Detail): void {
    this.easing = StageDispatcher.defaultEasing

    if (!this.isExplicitDuration) {
      const delegatedTarget = this.delegatedTarget

      if (null != delegatedTarget) {
        const computedStyle = self.getComputedStyle(delegatedTarget)
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

  protected onTransitionEnd(details: Detail, event: TransitionEvent): void {
    if (
      this.running &&
      event.target === this.delegatedTarget &&
      isTransitionMaxTimeout(
        this.easing as CSSTransitionDeclaration,
        event.propertyName
      )
    ) {
      this.afterEnd(details)
    }
  }

  protected onAnimationEnd(details: Detail, event: AnimationEvent): void {
    if (
      this.running &&
      event.target === this.delegatedTarget &&
      isAnimationMaxTimeout(
        this.easing as CSSAnimationDeclaration,
        event.animationName
      )
    ) {
      this.afterEnd(details)
    }
  }

  protected dispatchPhase(phase: Phase, details: Detail): Detail {
    return this.stage.dispatch(phase, details)
  }

  protected cleanup(details: Detail): Detail {
    return this.dispatchPhase(PhaseEnum.Cleanup, details)
  }

  protected beforeStart(details: Detail): Detail {
    this.running = true
    const target = this.delegatedTarget

    if (null != target) {
      setStyle(target, 'display', '')
    }

    return this.dispatchPhase(PhaseEnum.BeforeStart, details)
  }

  protected start(details: Detail): Detail {
    details.done = () => this.afterEnd(details)

    return this.dispatchPhase(PhaseEnum.Start, details)
  }

  protected afterEnd(details: Detail): Detail {
    this.removeEasingEndEventListener()
    delete details.done
    this.running = false
    const finalDetails = this.dispatchPhase(PhaseEnum.AfterEnd, details)

    if (null != this.resolve) {
      this.resolve(finalDetails)
    }

    return finalDetails
  }

  protected cancelled(details: Detail): Detail {
    this.removeEasingEndEventListener()
    this.cancelNextFrame()

    return this.dispatchPhase(PhaseEnum.Cancelled, details)
  }

  public cancel(): Detail {
    return this.dispatchPhase(PhaseEnum.Cancelled, this.getDetails())
  }

  public getDetails(): Detail {
    return {
      name: this.options.name,
      currentTarget: this.element,
      target: this.delegatedTarget as Element,
      delegateTarget: this.target,
      stageIndex: this.stageIndex,
      stageName: this.stageName,
      duration: this.duration || 0,
    }
  }

  public forceDispatchByIndex(stageIndex: number = 0): void {
    const details = this.getDetails()
    this.running && this.cancelled(details)
    this.stageIndex = details.stageIndex = stageIndex
    this.afterEnd(details)
  }

  public dispatchByIndex(stageIndex: number = 0): Promise<Detail> {
    const details = this.getDetails()

    this.cleanup(details)
    this.running && this.cancelled(details)
    this.stageIndex = details.stageIndex = stageIndex
    this.beforeStart(details)
    this.addEasingEndEventListener(details)
    this.nextFrame(() => {
      this.start(details)

      if (this.isExplicitDuration) {
        this.timerId = self.setTimeout(
          () => this.afterEnd(details),
          this.duration
        )
      } else if (this.easing.timeout <= 0) {
        // if zero duration then end event won't be fired
        this.afterEnd(details)
      }
    })

    return new Promise((resolve) => {
      this.resolve = resolve
    })
  }

  public play(
    startStageIndex: number = 0,
    endStageIndex?: number | null
  ): Promise<Detail> {
    endStageIndex = null != endStageIndex ? endStageIndex : this.stages.length

    return this.dispatchByIndex(startStageIndex).then((details) => {
      return ++startStageIndex < (null != endStageIndex ? endStageIndex : 0)
        ? this.play(startStageIndex, endStageIndex)
        : details
    })
  }
}
