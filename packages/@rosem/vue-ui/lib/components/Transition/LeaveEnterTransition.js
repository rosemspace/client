import TransitionStage from './TransitionStage'
import TransitionDispatcher from './TransitionDispatcher'
import HideAfterEndTransitionMiddleware from './HideAfterEndTransitionMiddleware'
import CSSTransitionMiddleware from './CSSTransitionMiddleware'
import LeaveRectAutoValueTransitionMiddleware from './LeaveRectAutoValueTransitionMiddleware'
import EnterRectAutoValueTransitionMiddleware from './EnterRectAutoValueTransitionMiddleware'
import DispatchEventTransitionMiddleware from './DispatchEventTransitionMiddleware'
import { isDefined } from './utils'

export default class LeaveEnterTransition extends TransitionDispatcher {
  static STAGE_LEAVE_ORDER = 0
  static STAGE_ENTER_ORDER = 1
  static CSS_LEAVE_MIDDLEWARE_ORDER = 0
  static CSS_ENTER_MIDDLEWARE_ORDER = 0
  static RECT_AUTO_VALUE_LEAVE_MIDDLEWARE_ORDER = 1
  static RECT_AUTO_VALUE_ENTER_MIDDLEWARE_ORDER = 1
  static HIDE_AFTER_LEAVE_MIDDLEWARE_ORDER = 2
  static EVENT_LEAVE_MIDDLEWARE_ORDER = 3
  static EVENT_ENTER_MIDDLEWARE_ORDER = 2

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
    this.targetInitialDisplay = target.style.display

    if (css) {
      const leaveCSSMiddleware = new CSSTransitionMiddleware(
        `${this.name}-${leaveStage.name}`,
        {
          fromClass: leaveClass,
          activeClass: leaveActiveClass,
          toClass: leaveToClass,
          doneClass: leaveDoneClass,
        }
      )
      const enterCSSMiddleware = new CSSTransitionMiddleware(
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

      if (this.stageIndex === LeaveEnterTransition.STAGE_LEAVE_ORDER) {
        this.setLeaveDoneClass()
      } else if (this.stageIndex === LeaveEnterTransition.STAGE_ENTER_ORDER) {
        this.setEnterDoneClass()
      }
    }

    if (Array.isArray(auto) && auto.length) {
      leaveStage.use(new LeaveRectAutoValueTransitionMiddleware(auto))
      enterStage.use(new EnterRectAutoValueTransitionMiddleware(auto))
    }

    if (hideAfterLeave) {
      const hideAfterLeaveMiddleware = new HideAfterEndTransitionMiddleware()
      leaveStage.use(hideAfterLeaveMiddleware)

      if (this.stageIndex === LeaveEnterTransition.STAGE_LEAVE_ORDER) {
        this.hide()
      }
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
  }

  setLeaveDoneClass() {
    this.target.classList.add(
      this.stages[LeaveEnterTransition.STAGE_LEAVE_ORDER].middlewareList[
        LeaveEnterTransition.CSS_LEAVE_MIDDLEWARE_ORDER
      ].doneClass
    )
  }

  setEnterDoneClass() {
    this.target.classList.add(
      this.stages[LeaveEnterTransition.STAGE_ENTER_ORDER].middlewareList[
        LeaveEnterTransition.CSS_ENTER_MIDDLEWARE_ORDER
      ].doneClass
    )
  }

  hide() {
    this.stages[LeaveEnterTransition.STAGE_LEAVE_ORDER].middlewareList[
      LeaveEnterTransition.HIDE_AFTER_LEAVE_MIDDLEWARE_ORDER
    ].hide(this.target)
  }

  beforeStart() {
    this.target.style.display = ''
    super.beforeStart()
  }

  dispatch(stageIndex) {
    if (this.css) {
      // clear classes of previous stage
      stageIndex === LeaveEnterTransition.STAGE_LEAVE_ORDER
        ? this.stage.middlewareList[
            LeaveEnterTransition.CSS_ENTER_MIDDLEWARE_ORDER
          ].clear(this.target)
        : this.stage.middlewareList[
            LeaveEnterTransition.CSS_LEAVE_MIDDLEWARE_ORDER
          ].clear(this.target)
    }

    return super.dispatch(stageIndex)
  }

  leave() {
    return this.dispatch(LeaveEnterTransition.STAGE_LEAVE_ORDER)
  }

  enter() {
    return this.dispatch(LeaveEnterTransition.STAGE_ENTER_ORDER)
  }

  toggle(stageIndex) {
    return (isDefined(stageIndex) ? stageIndex : this.stageIndex) !==
      LeaveEnterTransition.STAGE_LEAVE_ORDER
      ? this.leave()
      : this.enter()
  }
}
