import {
  getAnimationInfo,
  getTransitionInfo,
  isAnimationMaxTimeout,
  isDefined,
  isTransitionMaxTimeout,
  resolveTarget,
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
  resolve

  constructor(stages = [], options = {}) {
    this.stages = stages
    this.options = Object.assign(
      {
        name: 'transition',
        stageIndex: 0,
      },
      options
    )
    this.stageIndex = this.options.stageIndex
    this.resolveTarget()
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

  resolveTarget() {
    this.currentTarget = resolveTarget(
      this.options.currentTarget || this.options.target
    )
    this.target = this.currentTarget
    this.delegateTargetResolver = this.options.delegateTarget
      ? this.options.delegateTarget
      : this.target
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

  addEndEventListener(details) {
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
        this.endEventListener = this.onTransitionEnd.bind(this, details)
      } else if (animationInfo.timeout) {
        this.motionInfo = animationInfo
        this.endEventListener = this.onAnimationEnd.bind(this, details)
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

  onTransitionEnd(details, event) {
    if (
      this.running &&
      event.target === this.delegateTarget &&
      isTransitionMaxTimeout(this.motionInfo, event.propertyName)
    ) {
      this.afterEnd(details)
    }
  }

  onAnimationEnd(details, event) {
    if (
      this.running &&
      event.target === this.delegateTarget &&
      isAnimationMaxTimeout(this.motionInfo, event.animationName)
    ) {
      this.afterEnd(details)
    }
  }

  processMoment(moment, details = {}) {
    return this.stage.dispatch(moment, details)
  }

  beforeStart(details = {}) {
    this.running = true
    this.delegateTarget.style.display = ''
    this.processMoment('beforeStart', details)
  }

  start(details = {}) {
    this.processMoment(
      'start',
      Object.assign(details, { done: () => this.afterEnd() })
    )
  }

  afterEnd(details = {}) {
    this.removeEndEventListener()
    delete details.done
    this.resolve(this.processMoment('afterEnd', details))
    this.running = false
  }

  cancel(details = {}) {
    this.removeEndEventListener()
    this.cancelNextFrame()
    this.processMoment('cancelled', details)
  }

  dispatch(stageIndex = 0, delegateTarget = null) {
    this.delegateTarget = resolveTarget(
      isDefined(delegateTarget) && delegateTarget !== ''
        ? delegateTarget
        : this.delegateTargetResolver,
      this.target
    )
    const details = {
      name: this.options.name,
      currentTarget: this.currentTarget,
      target: this.delegateTarget,
      delegateTarget: this.target,
      stageIndex: this.stageIndex,
      stageName: this.stageName,
      duration: this.duration || 0,
    }
    this.running && this.cancel(details)
    this.stageIndex = details.stageIndex = stageIndex
    this.beforeStart(details)
    this.addEndEventListener(details)
    this.nextFrame(() => {
      this.start(details)

      if (this.isExplicitDuration) {
        this.timerId = window.setTimeout(
          () => this.afterEnd(details),
          this.duration
        )
      } else if (this.motionInfo.timeout <= 0) {
        // if zero duration end event won't be fired
        this.afterEnd(details)
      }
    })

    return new Promise(resolve => {
      this.resolve = resolve
    })
  }

  playFromStage(stageIndex = 0) {
    return this.dispatch(stageIndex).then(details => {
      return ++stageIndex < this.stages.length
        ? this.playFromStage(stageIndex)
        : details
    })
  }
}
