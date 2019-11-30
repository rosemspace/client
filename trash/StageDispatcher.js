import {
  getAnimationInfo,
  getTransitionInfo,
  isAnimationMaxTimeout,
  isDefined,
  isTransitionMaxTimeout,
} from './utils'

export default class StageDispatcher {
  static CLASS_PREFIX_FROM = ''
  static CLASS_PREFIX_ACTIVE = ''
  static CLASS_PREFIX_TO = ''
  static CLASS_PREFIX_DONE = ''
  static CLASS_SUFFIX_FROM = ''
  static CLASS_SUFFIX_ACTIVE = '-active'
  static CLASS_SUFFIX_TO = '-to'
  static CLASS_SUFFIX_DONE = '-done'

  name
  stageIndex = 0
  running = false
  stages

  constructor(element, name, stages = [{}], stageIndex = 0) {
    this.element = element
    this.name = name
    this.stages = stages
    this.stageIndex = stageIndex
    this.CSSinfo = { timeout: 0 }

    if (this.css) {
      element.classList.add(this.doneClass)
    }
  }

  get stage() {
    return this.stages[this.stageIndex]
  }

  get stageName() {
    return `${this.stage.name || String(this.stageIndex)}`
  }

  get css() {
    return isDefined(this.stage.css) ? this.stage.css : true
  }

  get events() {
    return isDefined(this.stage.events) ? this.stage.events : true
  }

  get duration() {
    return this.isExplicitDuration
      ? isDefined(this.stage.duration)
        ? this.stage.duration
        : 0
      : this.CSSinfo.timeout
  }

  get isExplicitDuration() {
    const stage = this.stage

    return typeof stage.duration !== 'object'
      ? isDefined(stage.duration)
      : isDefined(stage.duration[this.stageName])
  }

  get middleClass() {
    return `${this.name}-${this.stageName}`
  }

  get fromClass() {
    return (
      this.stage.fromClass ||
      StageDispatcher.CLASS_PREFIX_FROM +
        this.middleClass +
        StageDispatcher.CLASS_SUFFIX_FROM
    )
  }

  get activeClass() {
    return (
      this.stage.activeClass ||
      StageDispatcher.CLASS_PREFIX_ACTIVE +
        this.middleClass +
        StageDispatcher.CLASS_SUFFIX_ACTIVE
    )
  }

  get toClass() {
    return (
      this.stage.toClass ||
      StageDispatcher.CLASS_PREFIX_TO +
        this.middleClass +
        StageDispatcher.CLASS_SUFFIX_TO
    )
  }

  get doneClass() {
    return (
      this.stage.doneClass ||
      StageDispatcher.CLASS_PREFIX_DONE +
        this.middleClass +
        StageDispatcher.CLASS_SUFFIX_DONE
    )
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
    this.CSSinfo = { timeout: 0 }

    if (!this.isExplicitDuration) {
      const computedStyle = window.getComputedStyle(this.element)
      const transitionInfo = getTransitionInfo(computedStyle)
      const animationInfo = getAnimationInfo(computedStyle)

      if (
        transitionInfo.timeout &&
        transitionInfo.timeout >= animationInfo.timeout
      ) {
        this.CSSinfo = transitionInfo
        this.endEventListener = (event) => this.onTransitionEnd(event)
      } else if (animationInfo.timeout) {
        this.CSSinfo = animationInfo
        this.endEventListener = (event) => this.onAnimationEnd(event)
      }

      if (this.CSSinfo.timeout) {
        this.element.addEventListener(
          this.CSSinfo.endEvent,
          this.endEventListener
        )
      }
    }
  }

  removeEndEventListener() {
    if (!this.isExplicitDuration) {
      this.element.removeEventListener(
        this.CSSinfo.names ? 'animationend' : 'transitionend',
        this.endEventListener
      )
    }
  }

  onTransitionEnd(event) {
    if (
      this.running &&
      event.target === this.element &&
      isTransitionMaxTimeout(this.CSSinfo, event.propertyName)
    ) {
      this.afterEnd()
    }
  }

  onAnimationEnd(el, event) {
    if (
      this.running &&
      event.target === this.element &&
      isAnimationMaxTimeout(this.CSSinfo, event.animationName)
    ) {
      this.afterEnd()
    }
  }

  getDetails(details = {}) {
    return Object.assign(
      {
        name: this.name,
        stageIndex: this.stageIndex,
        stageName: this.stageName,
        css: this.css,
        duration: this.duration || 0,
        fromClass: this.fromClass,
        activeClass: this.activeClass,
        toClass: this.toClass,
        doneClass: this.doneClass,
      },
      details
    )
  }

  beforeStart() {
    this.running = true
    this.stage.beforeStart && this.stage.beforeStart()

    if (this.css) {
      this.element.classList.remove(this.doneClass)
      this.element.classList.add(this.fromClass, this.activeClass)
    }

    if (this.events) {
      this.element.dispatchEvent(
        new CustomEvent(`before-${this.stageName}`, {
          detail: this.getDetails(),
        })
      )
    }
  }

  start() {
    this.stage.start && this.stage.start(() => this.afterEnd())

    if (this.css) {
      this.element.classList.remove(this.fromClass)
      this.element.classList.add(this.toClass)
    }

    if (this.events) {
      this.element.dispatchEvent(
        new CustomEvent(this.stageName, {
          detail: this.getDetails({ done: () => this.afterEnd() }),
        })
      )
    }
  }

  afterEnd() {
    this.removeEndEventListener()
    this.running = false
    this.stage.afterEnd && this.stage.afterEnd()

    if (this.css) {
      this.element.classList.remove(this.activeClass, this.toClass)
      this.element.classList.add(this.doneClass)
    }

    if (this.events) {
      this.element.dispatchEvent(
        new CustomEvent(`after-${this.stageName}`, {
          detail: this.getDetails(),
        })
      )
    }

    this.resolve(this.getDetails())
  }

  cancel() {
    this.removeEndEventListener()
    this.cancelNextFrame()
    this.stage.cancelled && this.stage.cancelled()

    if (this.events) {
      this.element.dispatchEvent(
        new CustomEvent(`${this.stageName}-cancelled`, {
          detail: this.getDetails(),
        })
      )
    }
  }

  dispatch(stageIndex) {
    if (this.css) {
      this.element.classList.remove(
        this.fromClass,
        this.activeClass,
        this.toClass,
        this.doneClass
      )
    }

    this.running && this.cancel()
    this.stageIndex = stageIndex
    this.beforeStart()
    this.addEndEventListener()
    this.nextFrame(() => {
      this.start()

      if (this.isExplicitDuration) {
        this.timerId = window.setTimeout(() => this.afterEnd(), this.duration)
      } else if (this.CSSinfo.timeout <= 0) {
        // if zero duration end event won't be fired
        this.afterEnd()
      }
    })

    return new Promise((resolve) => (this.resolve = resolve))
  }
}
