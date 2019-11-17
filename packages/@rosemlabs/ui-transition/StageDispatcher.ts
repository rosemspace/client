import {
  getComputedTransition,
  getComputedAnimation,
  isTransitionMaxTimeout,
  isAnimationMaxTimeout,
} from '@rosemlabs/dom-easing'
import {
  cancelAnimationFrame,
  requestNextAnimationFrame,
} from '@rosemlabs/std'
import CSSTransitionDeclaration from '@rosemlabs/dom-easing/CSSTransitionDeclaration'
import CSSAnimationDeclaration from '@rosemlabs/dom-easing/CSSAnimationDeclaration'
import { Detail, Phase, PhaseEnum } from './Module'
import Stage from './Stage'

const { setTimeout, clearTimeout, getComputedStyle } = globalThis

export type StageDispatcherOptions = {
  target?: string
  name: string
  stageIndex?: number
}

export default class StageDispatcher {
  protected static defaultEasing: CSSTransitionDeclaration = {
    endEventName: 'transitionend',
    properties: [],
    delays: [],
    durations: [],
    timeout: 0,
  }

  protected element: HTMLElement | SVGSVGElement
  protected target: HTMLElement | SVGSVGElement
  protected options: StageDispatcherOptions = {
    name: 'transition',
    stageIndex: 0,
  }
  // name: string
  protected stages: Stage[]
  protected detail!: Detail
  protected stageIndex: number
  protected running: boolean = false
  protected easing: CSSTransitionDeclaration | CSSAnimationDeclaration =
    StageDispatcher.defaultEasing
  protected easingEndEventListener?: EventListener
  protected easingEndTimerId?: number
  protected frameId?: number
  protected timerId?: number
  protected resolve?: (value?: Detail | PromiseLike<Detail>) => void

  constructor(
    element: HTMLElement | SVGSVGElement,
    stages = [],
    options?: StageDispatcherOptions
  ) {
    this.element = element
    this.target = this.element
    this.stages = stages
    this.options = Object.assign(this.options, options || {})
    this.stageIndex = this.options.stageIndex || 0
  }

  public get delegatedTarget(): HTMLElement | SVGSVGElement {
    // todo remove ternary or maybe just make it as computed?
    return null != this.options.target
      ? this.target.querySelector(this.options.target) || this.target
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

  protected cancelNextFrame(): void {
    if (this.frameId) {
      // Auto duration used
      cancelAnimationFrame(this.frameId)
      this.frameId = undefined
    } else {
      // Custom duration used
      clearTimeout(this.timerId)
      this.timerId = undefined
    }
  }

  protected addEasingEndEventListener(detail: Detail): void {
    this.easing = StageDispatcher.defaultEasing

    if (!this.isExplicitDuration) {
      const computedStyle = this.detail.computedStyle
      const transitionInfo = getComputedTransition(computedStyle)
      const animationInfo = getComputedAnimation(computedStyle)

      if (
        transitionInfo.timeout &&
        transitionInfo.timeout >= animationInfo.timeout
      ) {
        this.easing = transitionInfo
        this.easingEndEventListener = this.onTransitionEnd.bind(
          this,
          detail
        ) as EventListener
      } else if (animationInfo.timeout) {
        this.easing = animationInfo
        this.easingEndEventListener = this.onAnimationEnd.bind(
          this,
          detail
        ) as EventListener
      }

      if (null != this.easingEndEventListener && this.easing.timeout > 0) {
        this.detail.target.addEventListener(
          this.easing.endEventName,
          this.easingEndEventListener,
          { passive: true }
        )
        // Failsafe
        this.easingEndTimerId = setTimeout(
          this.easingEndEventListener,
          this.easing.timeout + 50,
          {
            target: this.detail.target,
          }
        )
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
      // Clear failsafe
      clearTimeout(this.easingEndTimerId)
    }
  }

  protected onTransitionEnd(detail: Detail, event: TransitionEvent): void {
    if (
      this.running &&
      event.target === this.delegatedTarget &&
      isTransitionMaxTimeout(
        this.easing as CSSTransitionDeclaration,
        event.propertyName
      )
    ) {
      this.afterEnd(detail)
    }
  }

  protected onAnimationEnd(detail: Detail, event: AnimationEvent): void {
    if (
      this.running &&
      event.target === this.delegatedTarget &&
      isAnimationMaxTimeout(
        this.easing as CSSAnimationDeclaration,
        event.animationName
      )
    ) {
      this.afterEnd(detail)
    }
  }

  protected dispatchPhase(phase: Phase, detail: Detail): Detail {
    return this.stage.dispatch(phase, detail)
  }

  protected beforeStart(detail: Detail): Detail {
    this.running = true

    return this.dispatchPhase(PhaseEnum.BeforeStart, detail)
  }

  protected start(detail: Detail): Detail {
    detail.done = () => this.afterEnd(detail)

    return this.dispatchPhase(PhaseEnum.Start, detail)
  }

  protected afterEnd(detail: Detail): Detail {
    this.removeEasingEndEventListener()
    delete detail.done
    this.running = false
    const finalDetail = this.dispatchPhase(PhaseEnum.AfterEnd, detail)

    if (null != this.resolve) {
      this.resolve(finalDetail)
    }

    return finalDetail
  }

  protected cancelled(detail: Detail): Detail {
    this.cancelNextFrame()
    this.removeEasingEndEventListener()

    return this.dispatchPhase(PhaseEnum.Cancelled, detail)
  }

  public cancel(): Detail {
    return this.dispatchPhase(PhaseEnum.Cancelled, this.getDetail())
  }

  public getDetail(): Detail {
    const delegatedTarget = this.delegatedTarget

    return {
      ...this.detail,
      name: this.options.name,
      currentTarget: this.element,
      target: delegatedTarget,
      computedStyle: getComputedStyle(delegatedTarget),
      delegateTarget: this.target,
      stageIndex: this.stageIndex,
      stageName: this.stageName,
      duration: this.duration || 0,
    }
  }

  public forceDispatchByIndex(stageIndex: number = 0): Detail {
    const detail = this.getDetail()

    this.stageIndex = detail.stageIndex = stageIndex

    return this.dispatchPhase(PhaseEnum.AfterEnd, detail)
  }

  public dispatchByIndex(stageIndex: number = 0): Promise<Detail> {
    cancelAnimationFrame(this.frameId as number)

    if (this.running) {
      this.cancelled(this.detail)
    }

    if (this.stageIndex !== stageIndex) {
      const oldStageIndex = this.stageIndex

      this.stageIndex = stageIndex
      this.stages[oldStageIndex].dispatch(
        PhaseEnum.Cleanup,
        (this.detail = this.getDetail())
      )
    }

    this.beforeStart(this.detail)

    this.frameId = requestAnimationFrame(
      // requestNextAnimationFrame(
      () => {
        this.addEasingEndEventListener(this.detail)
        this.start(this.detail)

        if (this.isExplicitDuration) {
          if ((this.stage.duration as number) > 0) {
            this.timerId = setTimeout(() => {
              this.afterEnd(this.detail)
            }, this.stage.duration)
          } else {
            // No need to run on next macrotask if zero duration
            this.afterEnd(this.detail)
          }
        } else if (this.easing.timeout <= 0) {
          // If zero duration then end event won't be fired
          this.afterEnd(this.detail)
        }
      }
      // (id) => (this.frameId = id)
    )

    return new Promise((resolve) => {
      this.resolve = resolve
    })
  }

  public play(
    startStageIndex: number = 0,
    endStageIndex?: number | null
  ): Promise<Detail> {
    endStageIndex = null != endStageIndex ? endStageIndex : this.stages.length

    return this.dispatchByIndex(startStageIndex).then((detail) => {
      return ++startStageIndex < (null != endStageIndex ? endStageIndex : 0)
        ? this.play(startStageIndex, endStageIndex)
        : detail
    })
  }
}
