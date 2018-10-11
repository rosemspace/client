import LeaveEnterTransition from './LeaveEnterTransition'
import { resolveTarget } from './utils'

export default class LeaveEnterTransitionGroup extends LeaveEnterTransition {
  transitions = []

  constructor(target, name, options) {
    super(target, name, options)
  }

  get running() {
    return this.transitions.some(transition => transition.running)
  }

  resolveDelegateTarget(delegateTarget) {
    return delegateTarget
  }

  setLeaveDoneClass() {
    Array.prototype.forEach.call(this.currentTarget.children, target => {
      resolveTarget(this.delegateTarget, target).classList.add(
        this.stages[LeaveEnterTransition.STAGE_LEAVE_ORDER].middlewareList[
          LeaveEnterTransition.CSS_LEAVE_MIDDLEWARE_ORDER
        ].doneClass
      )
    })
  }

  setEnterDoneClass() {
    Array.prototype.forEach.call(this.currentTarget.children, target => {
      resolveTarget(this.delegateTarget, target).classList.add(
        this.stages[LeaveEnterTransition.STAGE_ENTER_ORDER].middlewareList[
          LeaveEnterTransition.CSS_ENTER_MIDDLEWARE_ORDER
        ].doneClass
      )
    })
  }

  hide() {
    this.targetInitialDisplay = []
    Array.prototype.forEach.call(this.currentTarget.children, target => {
      const delegateTarget = resolveTarget(this.delegateTarget, target)
      this.targetInitialDisplay.push(delegateTarget.style.display)
      this.stages[LeaveEnterTransition.STAGE_LEAVE_ORDER].middlewareList[
        LeaveEnterTransition.HIDE_AFTER_LEAVE_MIDDLEWARE_ORDER
      ].hide(delegateTarget)
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
    this.transitions[index].delegateTarget = resolveTarget(
      this.delegateTarget,
      this.transitions[index].target
    )

    return this.transitions[index]
  }

  leave(index, delegateTarget = null) {
    return this.getTransition(index).leave(delegateTarget)
  }

  enter(index, delegateTarget = null) {
    return this.getTransition(index).enter(delegateTarget)
  }

  toggle(index, stageIndex, delegateTarget = null) {
    const transition = this.getTransition(index)

    if (!Number.isInteger(stageIndex)) {
      delegateTarget = stageIndex
      stageIndex = transition.stageIndex
    }

    return stageIndex !== LeaveEnterTransition.STAGE_LEAVE_ORDER
      ? transition.leave(delegateTarget)
      : transition.enter(delegateTarget)
  }
}
