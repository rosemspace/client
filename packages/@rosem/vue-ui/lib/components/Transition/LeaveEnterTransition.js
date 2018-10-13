import TransitionStage from './TransitionStage'
import TransitionDispatcher from './TransitionDispatcher'
import HideAfterEndTransitionMiddleware from './HideAfterEndTransitionMiddleware'
import CSSClassTransitionMiddleware from './CSSClassTransitionMiddleware'
import LeaveRectAutoValueTransitionMiddleware from './LeaveRectAutoValueTransitionMiddleware'
import EnterRectAutoValueTransitionMiddleware from './EnterRectAutoValueTransitionMiddleware'
import DispatchEventTransitionMiddleware from './DispatchEventTransitionMiddleware'
import { isDefined } from './utils'

export default class LeaveEnterTransition extends TransitionDispatcher {
  static STAGE_LEAVE_ORDER = 0
  static STAGE_ENTER_ORDER = 1

  css
  hideAfterLeave
  targetInitialDisplay

  constructor(
    target,
    name,
    {
      css = true,
      duration = null,
      events = true,
      eventParams = { cancelable: true },
      stageIndex = 0,
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
    const leaveStage = new TransitionStage('leave', duration)
    const enterStage = new TransitionStage('enter', duration)
    super(target, name, [leaveStage, enterStage], stageIndex)
    this.css = css
    this.hideAfterLeave = hideAfterLeave
    this.targetInitialDisplay = this.target.style.display

    if (css) {
      const leaveCSSMiddleware = new CSSClassTransitionMiddleware(
        `${this.name}-${leaveStage.name}`,
        {
          fromClass: leaveClass,
          activeClass: leaveActiveClass,
          toClass: leaveToClass,
          doneClass: leaveDoneClass,
        }
      )
      const enterCSSMiddleware = new CSSClassTransitionMiddleware(
        `${this.name}-${enterStage.name}`,
        {
          fromClass: enterClass,
          activeClass: enterActiveClass,
          toClass: enterToClass,
          doneClass: enterDoneClass,
        }
      )
      leaveStage.use(leaveCSSMiddleware)
      enterStage.use(enterCSSMiddleware)
      this.leaveCSSClassMiddleware = leaveCSSMiddleware
      this.enterCSSClassMiddleware = enterCSSMiddleware
    }

    if (isDefined(auto)) {
      if (!Array.isArray(auto)) {
        auto = [auto]
      }

      if (auto.length) {
        leaveStage.use(new LeaveRectAutoValueTransitionMiddleware(auto))
        enterStage.use(new EnterRectAutoValueTransitionMiddleware(auto))
      }
    }

    if (hideAfterLeave) {
      const hideAfterLeaveMiddleware = new HideAfterEndTransitionMiddleware()
      leaveStage.use(hideAfterLeaveMiddleware)
      this.hideAfterLeaveMiddleware = hideAfterLeaveMiddleware
    } else {
      leaveStage.use({
        afterEnd: ({ target }) => {
          target.style.display = this.targetInitialDisplay
        },
      })
    }

    if (events) {
      leaveStage.use(new DispatchEventTransitionMiddleware(leaveStage.name))
      enterStage.use(new DispatchEventTransitionMiddleware(enterStage.name))
    }

    if (this.stageIndex === LeaveEnterTransition.STAGE_LEAVE_ORDER) {
      this.forceLeave()
    } else if (this.stageIndex === LeaveEnterTransition.STAGE_ENTER_ORDER) {
      this.forceEnter()
    }
  }

  beforeStart(details = {}) {
    this.target.style.display = ''
    super.beforeStart(details)
  }

  dispatch(stageIndex, delegateTarget = null) {
    if (this.css) {
      // clear classes of previous stage
      stageIndex === LeaveEnterTransition.STAGE_LEAVE_ORDER
        ? this.enterCSSClassMiddleware.clear(
            this.delegateTarget
          )
        : this.leaveCSSClassMiddleware.clear(
            this.delegateTarget
          )
    }

    return super.dispatch(stageIndex, delegateTarget)
  }

  forceLeave() {
    if (this.css) {
      this.target.classList.add(
        this.leaveCSSClassMiddleware.doneClass
      )
    }

    if (this.hideAfterLeave) {
      this.hideAfterLeaveMiddleware.hide(this.target)
    }
  }

  forceEnter() {
    if (this.css) {
      this.target.classList.add(
        this.enterCSSClassMiddleware.doneClass
      )
    }
  }

  leave(delegateTarget = null) {
    return this.dispatch(LeaveEnterTransition.STAGE_LEAVE_ORDER, delegateTarget)
  }

  enter(delegateTarget = null) {
    return this.dispatch(LeaveEnterTransition.STAGE_ENTER_ORDER, delegateTarget)
  }

  toggle(stageIndex, delegateTarget = null) {
    if (!Number.isInteger(stageIndex)) {
      delegateTarget = stageIndex
      stageIndex = this.stageIndex
    }

    return stageIndex !== LeaveEnterTransition.STAGE_LEAVE_ORDER
      ? this.leave(delegateTarget)
      : this.enter(delegateTarget)
  }
}
