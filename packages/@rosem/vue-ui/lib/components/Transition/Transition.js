import TransitionStage from './TransitionStage'
import TransitionDispatcher from './TransitionDispatcher'
import HideAfterEndTransitionMiddleware from './HideAfterEndTransitionMiddleware'
import CSSClassesTransitionMiddleware from './CSSClassesTransitionMiddleware'
import LeaveRectAutoValueTransitionMiddleware from './LeaveRectAutoValueTransitionMiddleware'
import EnterRectAutoValueTransitionMiddleware from './EnterRectAutoValueTransitionMiddleware'
import DispatchEventTransitionMiddleware from './DispatchEventTransitionMiddleware'
import { isDefined } from './utils'
import ShowBeforeStartTransitionMiddleware from './ShowBeforeStartTransitionMiddleware'

export default class Transition extends TransitionDispatcher {
  static STAGE_LEAVE_ORDER = 0
  static STAGE_ENTER_ORDER = 1

  css
  hideAfterLeave
  middleware = {}

  constructor(element, options) {
    const leaveStage = new TransitionStage('leave', options.duration)
    const enterStage = new TransitionStage('enter', options.duration)
    super(element, [leaveStage, enterStage], options)
    this.options = Object.assign(
      {
        forceUpdate: true,
        duration: null,
        css: true,
        events: true,
        auto: [],
        hideAfterLeave: true,
      },
      this.options
    )

    if (this.options.css) {
      const leaveCSSClassesMiddleware = new CSSClassesTransitionMiddleware(
        `${this.options.name}-${leaveStage.name}`,
        {
          fromClass: this.options.leaveClass,
          activeClass: this.options.leaveActiveClass,
          toClass: this.options.leaveToClass,
          doneClass: this.options.leaveDoneClass,
        }
      )
      const enterCSSClassesMiddleware = new CSSClassesTransitionMiddleware(
        `${this.options.name}-${enterStage.name}`,
        {
          fromClass: this.options.enterClass,
          activeClass: this.options.enterActiveClass,
          toClass: this.options.enterToClass,
          doneClass: this.options.enterDoneClass,
        }
      )
      leaveStage.use(leaveCSSClassesMiddleware)
      enterStage.use(enterCSSClassesMiddleware)
      this.middleware.leaveCSSClasses = leaveCSSClassesMiddleware
      this.middleware.enterCSSClasses = enterCSSClassesMiddleware
    }

    if (this.options.hideAfterLeave) {
      const hideAfterLeaveMiddleware = new HideAfterEndTransitionMiddleware()
      const showBeforeEnterMiddleware = new ShowBeforeStartTransitionMiddleware()
      leaveStage.use(hideAfterLeaveMiddleware)
      enterStage.use(showBeforeEnterMiddleware)
      this.middleware.hideAfterLeave = hideAfterLeaveMiddleware
      this.middleware.showBeforeEnter = showBeforeEnterMiddleware
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

    if (this.options.events) {
      leaveStage.use(new DispatchEventTransitionMiddleware(leaveStage.name))
      enterStage.use(new DispatchEventTransitionMiddleware(enterStage.name))
    }

    if (this.options.forceUpdate) {
      this.forceUpdate()
    }
  }

  dispatch(stageIndex, delegateTarget = null) {
    if (this.options.css) {
      // clear classes of previous stage
      stageIndex === Transition.STAGE_LEAVE_ORDER
        ? this.middleware.enterCSSClasses.clear(
            this.delegateTarget || this.target
          )
        : this.middleware.leaveCSSClasses.clear(
            this.delegateTarget || this.target
          )
    }

    return super.dispatch(stageIndex, delegateTarget)
  }

  forceUpdate() {
    if (this.stageIndex === Transition.STAGE_LEAVE_ORDER) {
      if (this.options.css) {
        this.target.classList.add(
          this.middleware.leaveCSSClasses.doneClass
        )
      }

      if (this.options.hideAfterLeave) {
        this.middleware.hideAfterLeave.hide(this.target)
      }
    } else if (this.stageIndex === Transition.STAGE_ENTER_ORDER) {
      if (this.options.css) {
        this.target.classList.add(
          this.middleware.enterCSSClasses.doneClass
        )
      }

      if (this.options.hideAfterLeave) {
        this.middleware.showBeforeEnter.show(this.target)
      }
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
