import LeaveEnterTransition from './LeaveEnterTransition'
import { isDefined } from './utils'

export default class LeaveEnterTransitionGroup extends LeaveEnterTransition {
  transitions = []

  constructor(target, name, options) {
    super(target, name, options)
  }

  get running() {
    return this.transitions.some(transition => transition.running)
  }

  setLeaveDoneClass() {
    Array.prototype.forEach.call(this.currentTarget.children, target => {
      target.classList.add(
        this.stages[LeaveEnterTransition.STAGE_LEAVE_ORDER].middlewareList[
          LeaveEnterTransition.CSS_LEAVE_MIDDLEWARE_ORDER
        ].doneClass
      )
    })
  }

  setEnterDoneClass() {
    Array.prototype.forEach.call(this.currentTarget.children, target => {
      target.classList.add(
        this.stages[LeaveEnterTransition.STAGE_ENTER_ORDER].middlewareList[
          LeaveEnterTransition.CSS_ENTER_MIDDLEWARE_ORDER
        ].doneClass
      )
    })
  }

  hide() {
    this.targetInitialDisplay = []
    Array.prototype.forEach.call(this.currentTarget.children, target => {
      this.targetInitialDisplay.push(target.style.display)
      this.stages[LeaveEnterTransition.STAGE_LEAVE_ORDER].middlewareList[
        LeaveEnterTransition.HIDE_AFTER_LEAVE_MIDDLEWARE_ORDER
      ].hide(target)
    })
  }

  getTransition(index) {
    if (!this.transitions[index]) {
      this.transitions[index] = Object.assign(
        Object.create(LeaveEnterTransition.prototype),
        this,
        {
          running: false,
          currentTarget: this.currentTarget,
          targetInitialDisplay: this.targetInitialDisplay[index],
        }
      )
    }

    this.transitions[index].target = this.currentTarget.children[index]

    return this.transitions[index]
  }

  leave(index) {
    return this.getTransition(index).dispatch(
      LeaveEnterTransition.STAGE_LEAVE_ORDER
    )
  }

  enter(index) {
    return this.getTransition(index).dispatch(
      LeaveEnterTransition.STAGE_ENTER_ORDER
    )
  }

  toggle(index, stageIndex) {
    const transition = this.getTransition(index)

    return (isDefined(stageIndex) ? stageIndex : transition.stageIndex) !==
      LeaveEnterTransition.STAGE_LEAVE_ORDER
      ? transition.leave()
      : transition.enter()
  }
}
