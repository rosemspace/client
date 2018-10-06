import {
  getAnimationInfo,
  getTransitionInfo,
  isAnimationMaxTimeout,
  isDefined,
  isTransitionMaxTimeout,
} from './utils'

export default class TransitionDispatcher {
  name
  stages
  stageIndex = 0
  running = false
  CSSInfo = { timeout: 0 }
  resolve = () => {}

  constructor(target, name, stages = [], stageIndex = 0) {
    this.target = target
    this.currentTarget = target
    this.name = name
    this.stages = stages
    this.stageIndex = stageIndex
  }

  get stage() {
    return this.stages[this.stageIndex]
  }

  get stageName() {
    return `${this.stage.name || String(this.stageIndex)}`
  }

  get duration() {
    return this.isExplicitDuration
      ? isDefined(this.stage.duration)
        ? this.stage.duration
        : 0
      : this.CSSInfo.timeout
  }

  get isExplicitDuration() {
    return this.stage.isExplicitDuration
  }

  nextFrame(cb) {
    this.frameId = window.requestAnimationFrame(() => {
      this.frameId = window.requestAnimationFrame(cb)
    })
  }

  cancelNextFrame() {
    if (this.frameId) {
      window.cancelAnimationFrame(this.frameId)
      this.frameId = null
    } else {
      window.clearTimeout(this.timerId)
      this.timerId = null
    }
  }

  addEndEventListener() {
    this.CSSInfo = { timeout: 0 }

    if (!this.isExplicitDuration) {
      const computedStyle = window.getComputedStyle(this.target)
      const transitionInfo = getTransitionInfo(computedStyle)
      const animationInfo = getAnimationInfo(computedStyle)

      if (
        transitionInfo.timeout &&
        transitionInfo.timeout >= animationInfo.timeout
      ) {
        this.CSSInfo = transitionInfo
        this.endEventListener = event => this.onTransitionEnd(event)
      } else if (animationInfo.timeout) {
        this.CSSInfo = animationInfo
        this.endEventListener = event => this.onAnimationEnd(event)
      }

      if (this.CSSInfo.timeout) {
        this.target.addEventListener(
          this.CSSInfo.endEvent,
          this.endEventListener
        )
      }
    }
  }

  removeEndEventListener() {
    if (!this.isExplicitDuration) {
      this.target.removeEventListener(
        this.CSSInfo.names ? 'animationend' : 'transitionend',
        this.endEventListener
      )
    }
  }

  onTransitionEnd(event) {
    if (
      this.running &&
      event.target === this.target &&
      isTransitionMaxTimeout(this.CSSInfo, event.propertyName)
    ) {
      this.afterEnd()
    }
  }

  onAnimationEnd(event) {
    if (
      this.running &&
      event.target === this.target &&
      isAnimationMaxTimeout(this.CSSInfo, event.animationName)
    ) {
      this.afterEnd()
    }
  }

  process(period, details = {}) {
    return this.stage.dispatch(
      period,
      Object.assign(
        {
          name: this.name,
          target: this.target,
          currentTarget: this.currentTarget || this.target,
          stageIndex: this.stageIndex,
          stageName: this.stageName,
          duration: this.duration || 0,
        },
        details
      )
    )
  }

  beforeStart() {
    this.running = true
    this.process('beforeStart')
  }

  start() {
    this.process('start', { done: () => this.afterEnd() })
  }

  afterEnd() {
    this.removeEndEventListener()
    this.running = false
    this.resolve(this.process('afterEnd'))
  }

  cancel() {
    this.removeEndEventListener()
    this.cancelNextFrame()
    this.process('cancelled')
  }

  dispatch(stageIndex) {
    this.running && this.cancel()
    this.stageIndex = stageIndex
    this.beforeStart()
    this.addEndEventListener()
    this.nextFrame(() => {
      this.start()

      if (this.isExplicitDuration) {
        this.timerId = window.setTimeout(() => this.afterEnd(), this.duration)
      } else if (this.CSSInfo.timeout <= 0) {
        // if zero duration end event won't be fired
        this.afterEnd()
      }
    })

    return new Promise(resolve => (this.resolve = resolve))
  }
}
