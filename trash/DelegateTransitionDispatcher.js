import {
  getAnimationInfo,
  getTransitionInfo,
  isAnimationMaxTimeout,
  isDefined,
  isTransitionMaxTimeout,
} from './utils'

export default class TransitionDispatcher {
  name
  running = false
  stages
  stageIndex = 0
  threads = []

  constructor(element, name, stages = [], stageIndex = 0) {
    this.element = element
    this.name = name
    this.stages = stages
    this.stageIndex = stageIndex
  }

  thread(index) {
    return (
      this.threads[index] ||
      (this.threads[index] = {
        name: this.name,
        target: this.element,
        stageIndex: this.stageIndex,
        stageName: this.stageName(this.stageIndex),
        duration: this.duration(index),
        running: false,
        CSSInfo: { timeout: 0 },
        details: {},
        resolve: () => {},
      })
    )
  }

  stage(index) {
    return this.stages[this.thread(index).stageIndex]
  }

  stageName(index) {
    const stage = this.stage(index)

    return `${stage.name || String(stage.stageIndex)}`
  }

  duration(index) {
    if (this.isExplicitDuration(index)) {
      const stage = this.stage(index)

      return isDefined(stage.duration) ? stage.duration : 0
    }

    const CSSInfo = this.thread(index).CSSInfo

    return CSSInfo ? CSSInfo.timeout : 0
  }

  isExplicitDuration(index) {
    const stage = this.stage(index)

    return typeof stage.duration !== 'object'
      ? isDefined(stage.duration)
      : isDefined(stage.duration[this.stageName(index)])
  }

  nextFrame(index, cb) {
    this.thread(index).frameId = window.requestAnimationFrame(() => {
      this.thread(index).frameId = window.requestAnimationFrame(cb)
    })
  }

  cancelNextFrame(index) {
    const thread = this.thread(index)

    if (thread.frameId) {
      window.cancelAnimationFrame(thread.frameId)
      thread.frameId = null
    } else if (thread.timerId) {
      window.clearTimeout(thread.timerId)
      thread.timerId = null
    }
  }

  addEndEventListener(index) {
    const thread = this.thread(index)
    thread.CSSInfo = { timeout: 0 }

    if (!this.isExplicitDuration(index)) {
      const computedStyle = window.getComputedStyle(thread.target)
      const transitionInfo = getTransitionInfo(computedStyle)
      const animationInfo = getAnimationInfo(computedStyle)

      if (
        transitionInfo.timeout &&
        transitionInfo.timeout >= animationInfo.timeout
      ) {
        thread.CSSInfo = transitionInfo
        thread.endEventListener = (event) => this.onTransitionEnd(index, event)
      } else if (animationInfo.timeout) {
        thread.CSSInfo = animationInfo
        thread.endEventListener = (event) => this.onAnimationEnd(index, event)
      }

      if (thread.CSSInfo.timeout) {
        thread.target.addEventListener(
          thread.CSSInfo.endEvent,
          thread.endEventListener
        )
      }
    }
  }

  removeEndEventListener(index) {
    if (!this.isExplicitDuration(index)) {
      const thread = this.thread(index)
      thread.target.removeEventListener(
        thread.CSSInfo.names ? 'animationend' : 'transitionend',
        thread.endEventListener
      )
    }
  }

  onTransitionEnd(index, event) {
    const thread = this.thread(index)

    if (
      thread.running &&
      event.target === thread.target &&
      isTransitionMaxTimeout(thread.CSSInfo, event.propertyName)
    ) {
      this.afterEnd(index)
    }
  }

  onAnimationEnd(index, event) {
    const thread = this.thread(index)

    if (
      thread.running &&
      event.target === thread.element &&
      isAnimationMaxTimeout(thread.CSSInfo, event.animationName)
    ) {
      this.afterEnd(index)
    }
  }

  processPeriod(index, period, details = {}) {
    this.details = Object.assign(
      {
        name: this.name,
        target: this.element,
        stageIndex: this.stageIndex,
        stageName: this.stageName,
        duration: this.duration || 0,
      },
      details
    )
    this.stage.middlewareList.forEach((middleware) => {
      middleware.getDetails &&
        Object.assign(this.details, middleware.getDetails(this.details))
      middleware[period] && middleware[period](this.details)
    })
  }

  beforeStart() {
    this.running = true
    this.processPeriod('beforeStart')
  }

  start() {
    this.processPeriod('start', { done: () => this.afterEnd() })
  }

  afterEnd() {
    this.removeEndEventListener()
    this.running = false
    this.processPeriod('afterEnd')
    this.resolve(this.details)
  }

  cancel() {
    this.removeEndEventListener()
    this.cancelNextFrame()
    this.processPeriod('cancelled')
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

    return new Promise((resolve) => (this.resolve = resolve))
  }
}
