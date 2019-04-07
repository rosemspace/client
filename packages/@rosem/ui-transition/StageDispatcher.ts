import global from '@rosem-util/env/global'
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
import { Detail, Phase, PhaseEnum } from './Module'
import Stage from './Stage'

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
  protected frameId?: number
  protected timerId?: number
  protected resolve?: (value?: Detail | PromiseLike<Detail>) => void
  protected defferFrame: boolean = false

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

  public get delegatedTarget(): HTMLElement | SVGSVGElement | null {
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
      // Auto duration used
      cancelAnimationFrame(this.frameId)
      this.frameId = undefined
    } else {
      // Custom duration used
      global.clearTimeout(this.timerId)
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
    const delegatedTarget = this.delegatedTarget as HTMLElement | SVGSVGElement

    return {
      ...this.detail,
      name: this.options.name,
      currentTarget: this.element,
      target: delegatedTarget,
      computedStyle: global.getComputedStyle(delegatedTarget),
      delegateTarget: this.target,
      stageIndex: this.stageIndex,
      stageName: this.stageName,
      duration: this.duration || 0,
      defferFrame: (): void => {
        this.defferFrame = true
      },
    }
  }

  public forceDispatchByIndex(stageIndex: number = 0): Detail {
    const detail = this.getDetail()

    // if (this.running) {
    //   this.cancelled(detail)
    // }
    //
    this.stageIndex = detail.stageIndex = stageIndex
    // this.afterEnd(detail)

    return this.dispatchPhase(PhaseEnum.AfterEnd, detail)
  }

  public dispatchByIndex(stageIndex: number = 0): Promise<Detail> {
    cancelAnimationFrame(this.frameId as number)
    this.frameId = requestAnimationFrame(() => {
      if (this.running) {
        this.cancelled(this.detail)
      }

      if (this.stageIndex !== stageIndex) {
        const oldStageIndex = this.stageIndex
        // const oldDetail = this.detail || this.getDetail()

        this.stageIndex = stageIndex
        this.stages[oldStageIndex].dispatch(
          PhaseEnum.Cleanup,
          (this.detail = this.getDetail())
        )
      }

      this.beforeStart(this.detail)

      if (this.defferFrame) {
        this.defferFrame = false

        return this.dispatchByIndex(stageIndex)
      }

      this.frameId = requestAnimationFrame(() => {
        this.addEasingEndEventListener(this.detail)
        this.start(this.detail)

        if (this.isExplicitDuration) {
          if ((this.stage.duration as number) > 0) {
            this.timerId = global.setTimeout(() => {
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
      })
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

    return this.dispatchByIndex(startStageIndex).then((detail) => {
      return ++startStageIndex < (null != endStageIndex ? endStageIndex : 0)
        ? this.play(startStageIndex, endStageIndex)
        : detail
    })
  }
}
