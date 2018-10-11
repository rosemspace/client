import {
  getAnimationInfo,
  getTransitionInfo,
  isAnimationMaxTimeout,
  isDefined,
  resolveTarget,
  isTransitionMaxTimeout,
} from './utils'

export default class TransitionDispatcher {
  currentTarget
  target
  delegateTarget
  name
  stages
  stageIndex = 0
  running = false
  CSSInfo = { timeout: 0 }
  resolve = () => {}

  constructor(target, name, stages = [], stageIndex = 0) {
    this.targets = target; // TODO

    if (target === Object(target)) {
      this.currentTarget = resolveTarget(target.currentTarget || target.target)
      this.target = this.currentTarget
      this.delegateTarget = this.resolveDelegateTarget(target.delegateTarget)
    } else {
      this.currentTarget = resolveTarget(target)
      this.target = this.currentTarget
      this.delegateTarget = this.target
    }

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

  resolveDelegateTarget(delegateTarget) {
    return delegateTarget ? resolveTarget(delegateTarget) : this.target
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
      const computedStyle = window.getComputedStyle(this.delegateTarget)
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
        this.delegateTarget.addEventListener(
          this.CSSInfo.endEvent,
          this.endEventListener
        )
      }
    }
  }

  removeEndEventListener() {
    if (!this.isExplicitDuration) {
      this.delegateTarget.removeEventListener(
        this.CSSInfo.names ? 'animationend' : 'transitionend',
        this.endEventListener
      )
    }
  }

  onTransitionEnd(event) {
    if (
      this.running &&
      event.target === this.delegateTarget &&
      isTransitionMaxTimeout(this.CSSInfo, event.propertyName)
    ) {
      this.afterEnd()
    }
  }

  onAnimationEnd(event) {
    if (
      this.running &&
      event.target === this.delegateTarget &&
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
          currentTarget: this.currentTarget,
          target: this.delegateTarget,
          delegateTarget: this.target,
          stageIndex: this.stageIndex,
          stageName: this.stageName,
          duration: this.duration || 0,
        },
        details
      )
    )
  }

  beforeStart(details = {}) {
    this.running = true
    this.process('beforeStart', details)
  }

  start(details = {}) {
    this.process('start', { ...details, done: () => this.afterEnd() })
  }

  afterEnd(details = {}) {
    this.removeEndEventListener()
    this.running = false
    this.resolve(this.process('afterEnd', details))
  }

  cancel(details = {}) {
    this.removeEndEventListener()
    this.cancelNextFrame()
    this.process('cancelled', details)
  }

  dispatch(stageIndex, delegateTarget = null) {
    if (isDefined(delegateTarget) && delegateTarget !== '') {
      this.delegateTarget = resolveTarget(delegateTarget, this.target)
    }

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
