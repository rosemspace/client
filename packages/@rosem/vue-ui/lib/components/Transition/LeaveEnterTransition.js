import StageDispatcher from './StageDispatcher'
import { isDefined } from './utils'

export default class LeaveEnterTransition extends StageDispatcher {
  constructor(
    element,
    name,
    {
      css = true,
      duration = null,
      stageIndex = 0,
      events = true,
      eventParams = {cancelable: true},
      auto = [],
      hideAfterLeave = true,
      enterClass,
      enterActiveClass,
      enterToClass,
      enterDoneClass,
      leaveClass,
      leaveActiveClass,
      leaveToClass,
      leaveDoneClass,
    }
  ) {
    let leaveDuration
    let enterDuration

    if (isDefined(duration)) {
      leaveDuration = isDefined(duration.leave) ? duration.leave : duration
      enterDuration = isDefined(duration.enter) ? duration.enter : duration
    }

    super(
      element,
      name,
      [
        {
          name: 'leave',
          css: css,
          duration: leaveDuration,
          fromClass: enterClass,
          activeClass: enterActiveClass,
          toClass: enterToClass,
          doneClass: enterDoneClass,
          beforeStart: () => this.beforeLeaveStart(),
          start: done => this.leaveStart(done),
          afterEnd: () => this.afterLeaveEnd(),
        },
        {
          name: 'enter',
          css: css,
          duration: enterDuration,
          fromClass: leaveClass,
          activeClass: leaveActiveClass,
          toClass: leaveToClass,
          doneClass: leaveDoneClass,
          beforeStart: () => this.beforeEnterStart(),
          start: done => this.enterStart(done),
          afterEnd: () => this.afterEnterEnd(),
        },
      ],
      stageIndex
    )
    this.hideAfterLeave = hideAfterLeave
    this.autoPropertiesRect = auto
    this.autoValues = {}
    this.initialDisplay = element.style.display

    if (!this.stageIndex && this.hideAfterLeave) {
      element.style.display = 'none'
    }
  }

  beforeStart() {
    this.element.style.display = ''
    super.beforeStart()
  }

  beforeLeaveStart() {
    if (this.autoPropertiesRect.length) {
      const boundingClientRect = this.element.getBoundingClientRect()
      this.autoPropertiesRect.forEach(property => {
        this.element.style[property] = boundingClientRect[property] + 'px'
      })
    }
  }

  leaveStart() {
    this.autoPropertiesRect.forEach(property => {
      this.element.style[property] = ''
    })
  }

  afterLeaveEnd() {
    this.hideAfterLeave
      ? (this.element.style.display = 'none')
      : (this.element.style.display = this.initialDisplay)
  }

  beforeEnterStart() {
    if (this.autoPropertiesRect.length) {
      this.element.style.display = ''
      let boundingClientRect = this.element.getBoundingClientRect()
      const values = []
      this.autoPropertiesRect.forEach(property => {
        values.push(boundingClientRect[property])
        this.element.style[property] = 'auto'
      })
      boundingClientRect = this.element.getBoundingClientRect()
      this.autoPropertiesRect.forEach((property, index) => {
        this.autoValues[property] = this.element.getBoundingClientRect()[
          property
        ]
        this.element.style[property] = values[index] + 'px'
      })
    }
  }

  enterStart() {
    this.autoPropertiesRect.forEach(property => {
      this.element.style[property] = this.autoValues[property] + 'px'
    })
  }

  afterEnterEnd() {
    this.autoPropertiesRect.forEach(property => {
      this.element.style[property] = ''
    })
  }

  enter() {
    return this.dispatch(1)
  }

  leave() {
    return this.dispatch(0)
  }

  toggle() {
    return this.stageIndex ? this.leave() : this.enter()
  }
}
