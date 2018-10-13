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
    options
  ) {
    const leaveStage = new TransitionStage('leave', options.duration)
    const enterStage = new TransitionStage('enter', options.duration)
    super(target, name, [leaveStage, enterStage], options.stageIndex)
    this.options = Object.assign({
      css: true,
      duration: null,
      events: true,
      stageIndex: 0,
      auto: [],
      hideAfterLeave: true
    }, options)
    this.targetInitialDisplay = this.target.style.display

    if (this.options.css) {
      const leaveCSSMiddleware = new CSSClassTransitionMiddleware(
        `${this.name}-${leaveStage.name}`,
        {
          fromClass: this.options.leaveClass,
          activeClass: this.options.leaveActiveClass,
          toClass: this.options.leaveToClass,
          doneClass: this.options.leaveDoneClass,
        }
      )
      const enterCSSMiddleware = new CSSClassTransitionMiddleware(
        `${this.name}-${enterStage.name}`,
        {
          fromClass: this.options.enterClass,
          activeClass: this.options.enterActiveClass,
          toClass: this.options.enterToClass,
          doneClass: this.options.enterDoneClass,
        }
      )
      leaveStage.use(leaveCSSMiddleware)
      enterStage.use(enterCSSMiddleware)
      this.leaveCSSClassMiddleware = leaveCSSMiddleware
      this.enterCSSClassMiddleware = enterCSSMiddleware
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
      this.hideAfterLeaveMiddleware = hideAfterLeaveMiddleware
    } else {
      leaveStage.use({
        afterEnd: ({ target }) => {
          target.style.display = this.targetInitialDisplay
        },
      })
    }

    if (this.options.events) {
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
    if (this.options.css) {
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
    if (this.options.css) {
      this.target.classList.add(
        this.leaveCSSClassMiddleware.doneClass
      )
    }

    if (this.options.hideAfterLeave) {
      this.hideAfterLeaveMiddleware.hide(this.target)
    }
  }

  forceEnter() {
    if (this.options.css) {
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
