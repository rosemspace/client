import {
  getAnimationInfo,
  getTransitionInfo,
  isAnimationMaxTimeout,
  isDefined,
  isTransitionMaxTimeout,
} from './utils'
import TransitionStageSwitcher from './TransitionStageSwitcher'

export default class TransitionStageDispatcher extends TransitionStageSwitcher {
  running = 0

  constructor(element, name, stages = [{}], currentStage = 0) {
    super(name, stages, currentStage)
    this.element = element
    this.info = {}
  }

  get duration() {
    return isDefined(this.stages[this.currentStage].duration)
      ? this.stages[this.currentStage].duration
      : isDefined(this.stages.duration)
        ? this.stages.duration
        : this.info.timeout
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
    if (!this.isExplicitDuration) {
      let computedStyle = window.getComputedStyle(this.element)
      let transitionInfo = getTransitionInfo(computedStyle)
      let animationInfo = getAnimationInfo(computedStyle)

      if (
        transitionInfo.timeout &&
        transitionInfo.timeout >= animationInfo.timeout
      ) {
        this.info = transitionInfo
        this.element.addEventListener(
          'transitionend',
          (this.endEventListener = event => this.onTransitionEnd(event))
        )
      } else if (animationInfo.timeout) {
        this.info = animationInfo
        this.element.addEventListener(
          'animationend',
          (this.endEventListener = event => this.onAnimationEnd(event))
        )
      }
    }
  }

  removeEndEventListener() {
    if (!this.isExplicitDuration) {
      this.element.removeEventListener(
        this.info.names ? 'animationend' : 'transitionend',
        this.endEventListener
      )
    }
  }

  onTransitionEnd(event) {
    if (
      this.running &&
      event.target === this.element &&
      isTransitionMaxTimeout(this.info, event.propertyName)
    ) {
      this.afterDone()
    }
  }

  onAnimationEnd(el, event) {
    if (
      this.running &&
      event.target === this.element &&
      isAnimationMaxTimeout(this.info, event.animationName)
    ) {
      this.afterDone()
    }
  }

  beforeStart() {
    if (this.css) {
      this.element.classList.remove(this.doneClass)
      this.element.classList.add(this.fromClass, this.activeClass)
    }

    super.beforeStart()
  }

  start(stage) {
    if (this.css) {
      this.element.style.display = 'none'
      this.element.classList.remove(
        this.fromClass,
        this.activeClass,
        this.toClass,
        this.doneClass
      )
    }

    this.running ? this.cancel() : (this.running = true)
    this.currentStage = stage
    this.beforeStart()
    this.addEndEventListener()
    this.element.style.display = ''
    this.nextFrame(() => {
      if (this.css) {
        this.element.classList.remove(this.fromClass)
        this.element.classList.add(this.toClass)
      }

      super.start(this.element, () => this.done())
    })
  }

  done() {
    if (this.isExplicitDuration) {
      this.timerId = window.setTimeout(() => this.afterDone(), this.duration)
    } else if (!this.info.timeout) {
      // if non zero duration "transitionend" event will be fired
      this.afterDone()
    }
  }

  afterDone() {
    this.removeEndEventListener()

    if (this.css) {
      this.element.classList.remove(this.activeClass, this.toClass)
      this.element.classList.add(this.doneClass)
    }

    this.running = false
    super.afterDone()
  }

  cancel() {
    this.removeEndEventListener()
    this.cancelNextFrame()
    super.cancel()
  }
}
