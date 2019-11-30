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

  dispatch(stageIndex) {
    if (this.options.css) {
      // clear classes of previous stage
      stageIndex === Transition.STAGE_LEAVE_ORDER
        ? this.middleware.enterCSSClasses.clear(this.delegatedTarget)
        : this.middleware.leaveCSSClasses.clear(this.delegatedTarget)
    }

    return super.dispatch(stageIndex)
  }

  forceLeave() {
    return this.forceDispatch(Transition.STAGE_LEAVE_ORDER)
  }

  forceEnter() {
    return this.forceDispatch(Transition.STAGE_ENTER_ORDER)
  }

  forceUpdate() {
    return this.stageIndex !== Transition.STAGE_LEAVE_ORDER
      ? this.forceEnter()
      : this.forceLeave()
  }

  leave() {
    return this.dispatch(Transition.STAGE_LEAVE_ORDER)
  }

  enter() {
    return this.dispatch(Transition.STAGE_ENTER_ORDER)
  }

  toggle(stageIndex) {
    if (!Number.isInteger(stageIndex)) {
      stageIndex = Number(!this.stageIndex)
    }

    return stageIndex !== Transition.STAGE_LEAVE_ORDER
      ? this.enter()
      : this.leave()
  }
}
