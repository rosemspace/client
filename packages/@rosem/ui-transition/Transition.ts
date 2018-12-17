import Stage from './Stage'
import StageManager, { StageManagerOptions } from './StageManager'
import MiddlewareInterface, { Details } from './MiddlewareInterface'
// import HideAfterEndTransitionMiddleware from './HideAfterEndTransitionMiddleware'
// import CSSClassesTransitionMiddleware from './CSSClassesTransitionMiddleware'
// import LeaveRectAutoValueTransitionMiddleware from './LeaveRectAutoValueTransitionMiddleware'
// import EnterRectAutoValueTransitionMiddleware from './EnterRectAutoValueTransitionMiddleware'
// import DispatchEventTransitionMiddleware from './DispatchEventTransitionMiddleware'
// import ShowBeforeStartTransitionMiddleware from './ShowBeforeStartTransitionMiddleware'

export type TransitionOptions = {
  css?: boolean
  duration?: number
  hideAfterLeave?: boolean
  auto?: string | string[]
  events?: boolean
  forceUpdate?: boolean
} & StageManagerOptions

export default class Transition extends StageManager {
  public static STAGE_LEAVE_ORDER: number = 0
  public static STAGE_ENTER_ORDER: number = 1

  protected middleware: { [name: string]: MiddlewareInterface } = {}

  constructor(element: HTMLElement, options?: TransitionOptions) {
    super(element, [], options)
    this.options = Object.assign(
      {
        forceUpdate: true,
        css: true,
        events: true,
        auto: [],
        hideAfterLeave: true,
      },
      this.options
    )
    const leaveStage = new Stage('leave', this.options.duration)
    const enterStage = new Stage('enter', this.options.duration)

    // if (this.options.css) {
    //   const leaveCSSClassesMiddleware = new CSSClassesTransitionMiddleware(
    //     `${this.options.name}-${leaveStage.name}`,
    //     {
    //       fromClass: this.options.leaveClass,
    //       activeClass: this.options.leaveActiveClass,
    //       toClass: this.options.leaveToClass,
    //       doneClass: this.options.leaveDoneClass,
    //     }
    //   )
    //   const enterCSSClassesMiddleware = new CSSClassesTransitionMiddleware(
    //     `${this.options.name}-${enterStage.name}`,
    //     {
    //       fromClass: this.options.enterClass,
    //       activeClass: this.options.enterActiveClass,
    //       toClass: this.options.enterToClass,
    //       doneClass: this.options.enterDoneClass,
    //     }
    //   )
    //   leaveStage.use(leaveCSSClassesMiddleware)
    //   enterStage.use(enterCSSClassesMiddleware)
    //   this.middleware.leaveCSSClasses = leaveCSSClassesMiddleware
    //   this.middleware.enterCSSClasses = enterCSSClassesMiddleware
    // }

    // if (this.options.hideAfterLeave) {
    //   const hideAfterLeaveMiddleware = new HideAfterEndTransitionMiddleware()
    //   const showBeforeEnterMiddleware = new ShowBeforeStartTransitionMiddleware()
    //   leaveStage.use(hideAfterLeaveMiddleware)
    //   enterStage.use(showBeforeEnterMiddleware)
    //   this.middleware.hideAfterLeave = hideAfterLeaveMiddleware
    //   this.middleware.showBeforeEnter = showBeforeEnterMiddleware
    // }

    // if (null != this.options.auto) {
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
    //
    // if (this.options.events) {
    //   leaveStage.use(new DispatchEventTransitionMiddleware(leaveStage.name))
    //   enterStage.use(new DispatchEventTransitionMiddleware(enterStage.name))
    // }

    this.stages.push(leaveStage)
    this.stages.push(enterStage)

    if (this.options.forceUpdate) {
      this.forceUpdate()
    }
  }

  run(stageIndex: number = 0): Promise<Details> {
    // if (this.options.css) {
    //   // clear classes of previous stage
    //   stageIndex === Transition.STAGE_LEAVE_ORDER
    //     ? this.middleware.enterCSSClasses.clear(this.delegatedTarget)
    //     : this.middleware.leaveCSSClasses.clear(this.delegatedTarget)
    // }

    return super.run(stageIndex)
  }

  forceLeave(): void {
    this.forceRun(Transition.STAGE_LEAVE_ORDER)
  }

  forceEnter(): void {
    this.forceRun(Transition.STAGE_ENTER_ORDER)
  }

  forceUpdate(): void {
    this.stageIndex !== Transition.STAGE_LEAVE_ORDER
      ? this.forceEnter()
      : this.forceLeave()
  }

  leave(): Promise<Details> {
    return this.run(Transition.STAGE_LEAVE_ORDER)
  }

  enter(): Promise<Details> {
    return this.run(Transition.STAGE_ENTER_ORDER)
  }

  toggle(stageIndex: number = 0): Promise<Details> {
    if (!Number.isInteger(stageIndex)) {
      stageIndex = Number(!this.stageIndex)
    }

    return stageIndex !== Transition.STAGE_LEAVE_ORDER
      ? this.enter()
      : this.leave()
  }
}
