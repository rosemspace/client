import DelegateTransitionDispatcher from './DelegateTransitionDispatcher'
import HideAfterEndTransitionMiddleware from './HideAfterEndTransitionMiddleware'
import CSSTransitionMiddleware from './CSSTransitionMiddleware'
import LeaveRectAutoValueTransitionMiddleware from './LeaveRectAutoValueTransitionMiddleware'
import EnterRectAutoValueTransitionMiddleware from './EnterRectAutoValueTransitionMiddleware'
import DispatchEventTransitionMiddleware from './DispatchEventTransitionMiddleware'
import { isDefined } from './utils'

export default class LeaveEnterTransitionGroup__ extends DelegateTransitionDispatcher {
  static STAGE_LEAVE_INDEX = 0
  static STAGE_ENTER_INDEX = 1
  static STAGE_LEAVE_NAME = 'leave'
  static STAGE_ENTER_NAME = 'enter'

  initialStageIndex
  initialDisplay = []

  constructor(
    element,
    name,
    {
      css = true,
      duration = null,
      events = true,
      eventParams = { cancelable: true },
      stageIndex = Transition.STAGE_LEAVE_INDEX,
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
    let leaveDuration
    let enterDuration

    if (isDefined(duration)) {
      leaveDuration = isDefined(duration.leave) ? duration.leave : duration
      enterDuration = isDefined(duration.enter) ? duration.enter : duration
    }

    super(
      element,
      name,
      [
        {
          name: Transition.STAGE_LEAVE_NAME,
          duration: leaveDuration,
          middlewareList: [],
        },
        {
          name: Transition.STAGE_ENTER_NAME,
          duration: enterDuration,
          middlewareList: [],
        },
      ],
      stageIndex
    )
    this.initialStageIndex = stageIndex
    this.css = css
    Array.prototype.forEach.call(
      this.element.children,
      (itemElement, index) => {
        this.initialDisplay[index] = itemElement.style.display
      }
    )
    const leaveStage = this.stages[Transition.STAGE_LEAVE_INDEX]
    const enterStage = this.stages[Transition.STAGE_ENTER_INDEX]

    if (css) {
      this.leaveCSSMiddleware = new CSSTransitionMiddleware(
        `${this.name}-${Transition.STAGE_LEAVE_NAME}`,
        {
          fromClass: leaveClass,
          activeClass: leaveActiveClass,
          toClass: leaveToClass,
          doneClass: leaveDoneClass,
        }
      )
      this.enterCSSMiddleware = new CSSTransitionMiddleware(
        `${this.name}-${Transition.STAGE_ENTER_NAME}`,
        {
          fromClass: enterClass,
          activeClass: enterActiveClass,
          toClass: enterToClass,
          doneClass: enterDoneClass,
        }
      )
      leaveStage.middlewareList.push(this.leaveCSSMiddleware)
      enterStage.middlewareList.push(this.enterCSSMiddleware)

      if (this.initialStageIndex === Transition.STAGE_LEAVE_INDEX) {
        Array.prototype.forEach.call(this.element.children, (itemElement) => {
          itemElement.add(this.leaveCSSMiddleware.doneClass)
        })
      } else if (this.initialStageIndex === Transition.STAGE_ENTER_INDEX) {
        Array.prototype.forEach.call(this.element.children, (itemElement) => {
          itemElement.add(this.enterCSSMiddleware.doneClass)
        })
      }
    }

    if (Array.isArray(auto) && auto.length) {
      leaveStage.middlewareList.push(
        new LeaveRectAutoValueTransitionMiddleware(auto)
      )
      enterStage.middlewareList.push(
        new EnterRectAutoValueTransitionMiddleware(auto)
      )
    }

    if (hideAfterLeave) {
      const hideAfterLeaveMiddleware = new HideAfterEndTransitionMiddleware()
      leaveStage.middlewareList.push(hideAfterLeaveMiddleware)

      if (this.stageIndex === Transition.STAGE_LEAVE_INDEX) {
        hideAfterLeaveMiddleware.hide(this.element)
        Array.prototype.forEach.call(this.element.children, (itemElement) => {
          hideAfterLeaveMiddleware.hide(itemElement)
        })
      }
    }

    if (events) {
      leaveStage.middlewareList.push(
        new DispatchEventTransitionMiddleware(Transition.STAGE_LEAVE_NAME)
      )
      enterStage.middlewareList.push(
        new DispatchEventTransitionMiddleware(Transition.STAGE_ENTER_NAME)
      )
    }
  }

  beforeStart(index) {
    this.element.children[index].style.display = ''
    super.beforeStart(index)
  }

  dispatch(index, stageIndex) {
    if (this.css) {
      // clear classes of previous stage
      stageIndex === Transition.STAGE_LEAVE_INDEX
        ? this.enterCSSMiddleware.clear(this.element.children[index])
        : this.leaveCSSMiddleware.clear(this.element.children[index])
    }

    return super.dispatch(index, stageIndex)
  }

  leave(index) {
    return this.dispatch(index, Transition.STAGE_LEAVE_INDEX)
  }

  enter(index) {
    return this.dispatch(index, Transition.STAGE_ENTER_INDEX)
  }

  toggle(index, stageIndex) {
    return (isDefined(stageIndex)
      ? stageIndex
      : isDefined(this.stageIndex[index])
      ? this.stageIndex[index]
      : (this.stageIndex[index] = this.initialStageIndex)) !==
      Transition.STAGE_LEAVE_INDEX
      ? this.leave(index)
      : this.enter(index)
  }
}
