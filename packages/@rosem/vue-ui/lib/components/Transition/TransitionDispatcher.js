import {
  getAnimationInfo,
  getTransitionInfo,
  isAnimationMaxTimeout,
  isDefined,
  isTransitionMaxTimeout,
  resolveTarget,
  resolveTargets,
} from './utils'

export default class TransitionDispatcher {
  currentTarget
  target
  delegateTarget
  delegateTargetResolver
  name
  stages
  stageIndex = 0
  running = false
  motionInfo = { timeout: 0 }
  resolve = () => {}

  constructor(target, name, stages = [], stageIndex = 0) {
    this.resolveTarget(target)
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
      : this.motionInfo.timeout
  }

  get isExplicitDuration() {
    return this.stage.isExplicitDuration
  }

  resolveTarget(target) {
    if (target === Object(target)) {
      this.currentTarget = resolveTarget(target.target)
      this.target = this.currentTarget
      this.delegateTargetResolver = target.delegateTarget
        ? target.delegateTarget
        : this.target
    } else {
      this.currentTarget = resolveTarget(target)
      this.target = this.currentTarget
      this.delegateTargetResolver = this.target
    }
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
    this.motionInfo = { timeout: 0 }

    if (!this.isExplicitDuration) {
      const computedStyle = window.getComputedStyle(this.delegateTarget)
      const transitionInfo = getTransitionInfo(computedStyle)
      const animationInfo = getAnimationInfo(computedStyle)

      if (
        transitionInfo.timeout &&
        transitionInfo.timeout >= animationInfo.timeout
      ) {
        this.motionInfo = transitionInfo
        this.endEventListener = event => this.onTransitionEnd(event)
      } else if (animationInfo.timeout) {
        this.motionInfo = animationInfo
        this.endEventListener = event => this.onAnimationEnd(event)
      }

      if (this.motionInfo.timeout) {
        this.delegateTarget.addEventListener(
          this.motionInfo.endEventName,
          this.endEventListener
        )
      }
    }
  }

  removeEndEventListener() {
    if (!this.isExplicitDuration) {
      this.delegateTarget.removeEventListener(
        this.motionInfo.endEventName,
        this.endEventListener
      )
    }
  }

  onTransitionEnd(event) {
    if (
      this.running &&
      event.target === this.delegateTarget &&
      isTransitionMaxTimeout(this.motionInfo, event.propertyName)
    ) {
      this.afterEnd()
    }
  }

  onAnimationEnd(event) {
    if (
      this.running &&
      event.target === this.delegateTarget &&
      isAnimationMaxTimeout(this.motionInfo, event.animationName)
    ) {
      this.afterEnd()
    }
  }

  processMoment(moment, details = {}) {
    return this.stage.dispatch(
      moment,
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
    this.processMoment('beforeStart', details)
  }

  start(details = {}) {
    this.processMoment('start', { ...details, done: () => this.afterEnd() })
  }

  afterEnd(details = {}) {
    this.removeEndEventListener()
    this.running = false
    this.resolve(this.processMoment('afterEnd', details))
  }

  cancel(details = {}) {
    this.removeEndEventListener()
    this.cancelNextFrame()
    this.processMoment('cancelled', details)
  }

  dispatch(stageIndex, delegateTarget = null) {
    this.delegateTarget = resolveTarget(
      isDefined(delegateTarget) && delegateTarget !== ''
        ? delegateTarget
        : this.delegateTargetResolver,
      this.target
    )

    this.running && this.cancel()
    this.stageIndex = stageIndex
    this.beforeStart()
    this.addEndEventListener()
    this.nextFrame(() => {
      this.start()

      if (this.isExplicitDuration) {
        this.timerId = window.setTimeout(() => this.afterEnd(), this.duration)
      } else if (this.motionInfo.timeout <= 0) {
        // if zero duration end event won't be fired
        this.afterEnd()
      }
    })

    return new Promise(resolve => (this.resolve = resolve))
  }
}
