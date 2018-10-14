import TransitionStage from './TransitionStage'
import TransitionDispatcher from './TransitionDispatcher'
import HideAfterEndTransitionMiddleware from './HideAfterEndTransitionMiddleware'
import CSSClassTransitionMiddleware from './CSSClassTransitionMiddleware'
import LeaveRectAutoValueTransitionMiddleware from './LeaveRectAutoValueTransitionMiddleware'
import EnterRectAutoValueTransitionMiddleware from './EnterRectAutoValueTransitionMiddleware'
import DispatchEventTransitionMiddleware from './DispatchEventTransitionMiddleware'
import { isDefined } from './utils'

export default class Transition extends TransitionDispatcher {
  static STAGE_LEAVE_ORDER = 0
  static STAGE_ENTER_ORDER = 1

  css
  hideAfterLeave
  middlewareReferences = {}

  constructor(options) {
    const leaveStage = new TransitionStage('leave', options.duration)
    const enterStage = new TransitionStage('enter', options.duration)
    super([leaveStage, enterStage], options)
    this.options = Object.assign(
      {
        css: true,
        duration: null,
        events: true,
        auto: [],
        hideAfterLeave: true,
      },
      this.options
    )

    if (this.options.css) {
      const leaveCSSMiddleware = new CSSClassTransitionMiddleware(
        `${this.options.name}-${leaveStage.name}`,
        {
          fromClass: this.options.leaveClass,
          activeClass: this.options.leaveActiveClass,
          toClass: this.options.leaveToClass,
          doneClass: this.options.leaveDoneClass,
        }
      )
      const enterCSSMiddleware = new CSSClassTransitionMiddleware(
        `${this.options.name}-${enterStage.name}`,
        {
          fromClass: this.options.enterClass,
          activeClass: this.options.enterActiveClass,
          toClass: this.options.enterToClass,
          doneClass: this.options.enterDoneClass,
        }
      )
      leaveStage.use(leaveCSSMiddleware)
      enterStage.use(enterCSSMiddleware)
      this.middlewareReferences.leaveCSSClassMiddleware = leaveCSSMiddleware
      this.middlewareReferences.enterCSSClassMiddleware = enterCSSMiddleware
    }

    if (isDefined(this.options.auto)) {
      let auto = this.options.auto

      if (!Array.isArray(auto)) {
        auto = [auto]
      }

      if (auto.length) {
        leaveStage.use(new LeaveRectAutoValueTransitionMiddleware(auto))
        enterStage.use(new EnterRectAutoValueTransitionMiddleware(auto))
      }
    }

    if (this.options.hideAfterLeave) {
      const hideAfterLeaveMiddleware = new HideAfterEndTransitionMiddleware()
      leaveStage.use(hideAfterLeaveMiddleware)
      this.middlewareReferences.hideAfterLeaveMiddleware = hideAfterLeaveMiddleware
    }

    if (this.options.events) {
      leaveStage.use(new DispatchEventTransitionMiddleware(leaveStage.name))
      enterStage.use(new DispatchEventTransitionMiddleware(enterStage.name))
    }

    if (this.stageIndex === Transition.STAGE_LEAVE_ORDER) {
      this.forceLeave()
    } else if (this.stageIndex === Transition.STAGE_ENTER_ORDER) {
      this.forceEnter()
    }
  }

  dispatch(stageIndex, delegateTarget = null) {
    if (this.options.css) {
      // clear classes of previous stage
      stageIndex === Transition.STAGE_LEAVE_ORDER
        ? this.middlewareReferences.enterCSSClassMiddleware.clear(
            this.delegateTarget
          )
        : this.middlewareReferences.leaveCSSClassMiddleware.clear(
            this.delegateTarget
          )
    }

    return super.dispatch(stageIndex, delegateTarget)
  }

  forceLeave() {
    if (this.options.css) {
      this.target.classList.add(
        this.middlewareReferences.leaveCSSClassMiddleware.doneClass
      )
    }

    if (this.options.hideAfterLeave) {
      this.middlewareReferences.hideAfterLeaveMiddleware.hide(this.target)
    }
  }

  forceEnter() {
    if (this.options.css) {
      this.target.classList.add(
        this.middlewareReferences.enterCSSClassMiddleware.doneClass
      )
    }
  }

  leave(delegateTarget = null) {
    return this.dispatch(Transition.STAGE_LEAVE_ORDER, delegateTarget)
  }

  enter(delegateTarget = null) {
    return this.dispatch(Transition.STAGE_ENTER_ORDER, delegateTarget)
  }

  toggle(stageIndex, delegateTarget = null) {
    if (!Number.isInteger(stageIndex)) {
      delegateTarget = stageIndex
      stageIndex = Number(!this.stageIndex)
    }

    return stageIndex !== Transition.STAGE_LEAVE_ORDER
      ? this.enter(delegateTarget)
      : this.leave(delegateTarget)
  }
}
