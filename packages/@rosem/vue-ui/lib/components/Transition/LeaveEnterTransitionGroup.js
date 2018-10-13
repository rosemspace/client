import LeaveEnterTransition from './LeaveEnterTransition'
import { resolveTarget } from './utils'

export default class LeaveEnterTransitionGroup extends LeaveEnterTransition {
  transitions = []

  constructor(target, name, options) {
    super(target, name, options)
  }

  get running() {
    return this.transitions.some(function(transition) {
      return transition.running
    })
  }

  set running(value) {
    return this.transitions.some(function(transition) {
      transition.running = value
    })
  }

  resolveTarget(target) {
    if (target === Object(target)) {
      this.target = resolveTarget(target.currentTarget || target.target)
      this.delegateTargetResolver = target.delegateTarget
    } else {
      this.target = resolveTarget(target)
      this.delegateTargetResolver = null
    }
  }

  getTransition(index) {
    let transition = this.transitions[index]

    if (!transition) {
      transition = this.transitions[index] = Object.assign(
        Object.create(LeaveEnterTransition.prototype),
        this,
        {
          running: false,
          currentTarget: this.target,
          targetInitialDisplay: this.targetInitialDisplay[index],
        }
      )
    }

    transition.target = this.target.children[index]
    transition.delegateTarget = this.delegateTargetResolver
      ? resolveTarget(
          this.delegateTargetResolver,
          this.transitions[index].target
        )
      : transition.target

    return transition
  }

  forceLeave(index) {
    const targets =
      index != null ? [this.target.children[index]] : this.target.children

    if (this.css || this.hideAfterLeave) {
      this.targetInitialDisplay = []
      Array.prototype.forEach.call(targets, target => {
        const resolvedTarget = resolveTarget(
          this.delegateTargetResolver,
          target
        )

        if (this.css) {
          resolvedTarget.classList.add(this.leaveCSSClassMiddleware.doneClass)
        }

        if (this.hideAfterLeave) {
          this.targetInitialDisplay.push(resolvedTarget.style.display)
          this.hideAfterLeaveMiddleware.hide(resolvedTarget)
        }
      })
    }
  }

  forceEnter(index) {
    const targets =
      index != null ? [this.target.children[index]] : this.target.children

    if (this.css) {
      Array.prototype.forEach.call(targets, target => {
        resolveTarget(this.delegateTarget, target).classList.add(
          this.enterCSSClassMiddleware.doneClass
        )
      })
    }
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
