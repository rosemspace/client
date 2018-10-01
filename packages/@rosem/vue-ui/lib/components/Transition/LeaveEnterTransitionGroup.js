// element
// stageIndex
// running
// CSSinfo
// frameId
// timerId
// endEventListener

import LeaveEnterTransition from './LeaveEnterTransition'

class CapturedLeaveEnterTransition extends LeaveEnterTransition {
  static THREAD_BEFORE_START = 0
  static THREAD_START = 1
  static THREAD_AFTER_END = 2

  captures = [
    [],
    [],
    [],
  ]

  capture(thread) {
    this.captures[thread].push({
      element: this.element,
      stageIndex: this.stageIndex,
      running: this.running,
      CSSinfo: this.CSSinfo,
      frameId: this.frameId,
      timerId: this.timerId,
      endEventListener: this.endEventListener,
    })
  }

  apply(thread) {
    const previousThread = (thread + this.captures.length - 1) % this.captures.length

    if (this.captures[previousThread].length) {
      const capture = this.captures[previousThread].shift();
      this.element = capture.element
      this.stageIndex = capture.stageIndex
      this.running = capture.running
      this.CSSinfo = capture.CSSinfo
      this.frameId = capture.frameId
      this.timerId = capture.timerId
      thread < 2 && this.captures[thread].push(capture)
    }
  }

  beforeStart() {
    this.apply(CapturedLeaveEnterTransition.THREAD_BEFORE_START)
    super.beforeStart()
  }

  start() {
    this.apply(CapturedLeaveEnterTransition.THREAD_START)
    super.start()
  }

  afterEnd() {
    this.apply(CapturedLeaveEnterTransition.THREAD_AFTER_END)
    super.afterEnd()
  }
}

export default class LeaveEnterTransitionGroup {
  element
  transitions = []

  constructor(element, name, options) {
    this.element = element
    this.transitions.push(new LeaveEnterTransition(element, name, options))

    if (this.transition.css) {
      element.classList.add(this.doneClass)
    }

    if (!this.transition.stageIndex && this.transition.hideAfterLeave) {
      element.style.display = ''
    }
  }

  get transition() {
    return this.transitions
  }

  enter(index) {
    this.element = this.rootElement.children[index]

    return this.dispatch(1)
  }

  leave(index) {
    this.element = this.rootElement.children[index]
    // debugger

    return this.dispatch(0)
  }

  toggle(index) {
    return this.stageIndex ? this.leave(index) : this.enter(index)
  }
}
