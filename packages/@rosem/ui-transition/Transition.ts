import isPlainObject from 'lodash/isPlainObject'
import Stage from './Stage'
import StageDispatcher, { StageDispatcherOptions } from './StageDispatcher'
import { Detail } from './ModuleInterface'
import CSSClass from './module/CSSClass'
import EventDispatcher from './module/EventDispatcher'
// import HideAfterEndTransitionMiddleware from './HideAfterEndTransitionMiddleware'
// import CSSClassesTransitionMiddleware from './CSSClassesTransitionMiddleware'
// import LeaveRectAutoValueTransitionMiddleware from './LeaveRectAutoValueTransitionMiddleware'
// import EnterRectAutoValueTransitionMiddleware from './EnterRectAutoValueTransitionMiddleware'
// import DispatchEventTransitionMiddleware from './DispatchEventTransitionMiddleware'
// import ShowBeforeStartTransitionMiddleware from './ShowBeforeStartTransitionMiddleware'

export type TransitionDuration = {
  leave: number
  enter: number
}

export type TransitionOptions = {
  css?: boolean
  leaveClass?: string
  leaveActiveClass?: string
  leaveToClass?: string
  leaveDoneClass?: string
  enterClass?: string
  enterActiveClass?: string
  enterToClass?: string
  enterDoneClass?: string
  duration?: number | TransitionDuration
  hideAfterLeave?: boolean
  auto?: boolean | string | string[]
  events?: boolean
  forceUpdate?: boolean
} & StageDispatcherOptions

export default class Transition extends StageDispatcher {
  public static STAGE_LEAVE_ORDER: number = 0
  public static STAGE_ENTER_ORDER: number = 1

  protected options: TransitionOptions = {
    name: 'transition',
    stageIndex: 0,
    forceUpdate: true,
    css: true,
    events: true,
    auto: false,
    hideAfterLeave: true,
  }

  constructor(element: Element, options?: TransitionOptions) {
    super(element, [], options)
    this.options = Object.assign(this.options, options)
    const duration: undefined | number | TransitionDuration = this.options
      .duration
    let leaveDuration = <number>duration
    let enterDuration = <number>duration

    if (isPlainObject(duration)) {
      leaveDuration = (<TransitionDuration>duration).leave
      enterDuration = (<TransitionDuration>duration).enter
    }

    const leaveStage = new Stage('leave', leaveDuration)
    const enterStage = new Stage('enter', enterDuration)

    if (this.options.css) {
      leaveStage.use(
        new CSSClass(`${this.options.name}-${leaveStage.name}`, {
          fromClass: this.options.leaveClass,
          activeClass: this.options.leaveActiveClass,
          toClass: this.options.leaveToClass,
          doneClass: this.options.leaveDoneClass,
        })
      )
      enterStage.use(
        new CSSClass(`${this.options.name}-${enterStage.name}`, {
          fromClass: this.options.enterClass,
          activeClass: this.options.enterActiveClass,
          toClass: this.options.enterToClass,
          doneClass: this.options.enterDoneClass,
        })
      )
    }

    // if (this.options.hideAfterLeave) {
    //   const hideAfterLeaveMiddleware = new HideAfterEndTransitionMiddleware()
    //   const showBeforeEnterMiddleware = new ShowBeforeStartTransitionMiddleware()
    //   leaveStage.use(hideAfterLeaveMiddleware)
    //   enterStage.use(showBeforeEnterMiddleware)
    //   this.middleware.hideAfterLeave = hideAfterLeaveMiddleware
    //   this.middleware.showBeforeEnter = showBeforeEnterMiddleware
    // }

    // if (this.options.auto) {
    //   let auto = this.options.auto
    //
    //   if (!Array.isArray(auto)) {
    //     auto = [auto]
    //   }
    //
    //   if (auto.length) {
    //     leaveStage.use(new LeaveRectAutoValueTransitionMiddleware(auto))
    //     enterStage.use(new EnterRectAutoValueTransitionMiddleware(auto))
    //   }
    // }

    if (this.options.events) {
      leaveStage.use(new EventDispatcher(leaveStage.name))
      enterStage.use(new EventDispatcher(enterStage.name))
    }

    this.stages.push(leaveStage)
    this.stages.push(enterStage)

    if (this.options.forceUpdate) {
      this.forceUpdate()
    }
  }

  dispatchByIndex(stageIndex: number = 0): Promise<Detail> {
    // if (this.options.css) {
    //   // clear classes of previous stage
    //   stageIndex === Transition.STAGE_LEAVE_ORDER
    //     ? this.middleware.enterCSSClasses.clear(this.delegatedTarget)
    //     : this.middleware.leaveCSSClasses.clear(this.delegatedTarget)
    // }

    return super.dispatchByIndex(stageIndex)
  }

  forceLeave(): void {
    this.forceDispatchByIndex(Transition.STAGE_LEAVE_ORDER)
  }

  forceEnter(): void {
    this.forceDispatchByIndex(Transition.STAGE_ENTER_ORDER)
  }

  forceUpdate(): void {
    this.stageIndex !== Transition.STAGE_LEAVE_ORDER
      ? this.forceEnter()
      : this.forceLeave()
  }

  leave(): Promise<Detail> {
    return this.dispatchByIndex(Transition.STAGE_LEAVE_ORDER)
  }

  enter(): Promise<Detail> {
    return this.dispatchByIndex(Transition.STAGE_ENTER_ORDER)
  }

  toggle(stageIndex: number = 0): Promise<Detail> {
    if (!Number.isInteger(stageIndex)) {
      stageIndex = Number(!this.stageIndex)
    }

    return stageIndex !== Transition.STAGE_LEAVE_ORDER
      ? this.enter()
      : this.leave()
  }
}
