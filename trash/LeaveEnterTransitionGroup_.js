import LeaveEnterTransition from './LeaveEnterTransition'

export default class LeaveEnterTransitionGroup_ {
  element
  name
  options
  transitions = []

  constructor(
    element,
    name,
    { events = true, childrenEvents = false, ...options }
  ) {
    this.element = element
    this.name = name
    this.options = options
    this.events = events
    this.options.events = childrenEvents
  }

  getTransition(index) {
    if (!this.transitions[index]) {
      this.transitions[index] = new LeaveEnterTransition(
        this.element.children[index],
        this.name,
        this.options
      )
      const transition = this.transitions[index]
      transition.elementIndex = index
      let leaveStage = transition.stages[LeaveEnterTransition.STAGE_LEAVE_INDEX]
      let enterStage = transition.stages[LeaveEnterTransition.STAGE_ENTER_INDEX]
      const { beforeLeaveStart, beforeLeave, afterLeaveEnd } = leaveStage
      const { beforeEnterStart, beforeEnter, afterEnterEnd } = enterStage
      leaveStage = Object.assign(leaveStage, {
        beforeLeaveStart: () =>
          this.beforeLeaveStart(transition, beforeLeaveStart),
      })
      enterStage = Object.assign(leaveStage, {})
    }

    return this.transitions[index]
  }

  beforeLeaveStart(transition, next) {
    if (this.events) {
      this.element.dispatchEvent(
        new CustomEvent(`before-${transition.stageName}`, {
          detail: transition.getDetails({
            delegateTarget: transition.element,
            delegateTargetIndex: transition.elementIndex,
          }),
        })
      )
    }
  }

  enter(index) {
    return this.getTransition(index).enter()
  }

  leave(index) {
    return this.getTransition(index).leave()
  }

  toggle(index) {
    return this.getTransition(index).toggle()
  }
}
