import { isPlainObject } from 'lodash'
import { AutoSizeDetail, Size } from './module/AutoSize'
import AutoSizeEnter from './module/AutoSizeEnter'
import AutoSizeLeave from './module/AutoSizeLeave'
import EventDispatcher, {
  EventDispatcherDetail,
} from './module/EventDispatcher'
import HideAfterEnd, { HideAfterEndDetail } from './module/HideAfterEnd'
import PhaseClass, { PhaseClassDetail } from './module/PhaseClass'
import ShowBeforeStart, {
  ShowBeforeStartDetail,
} from './module/ShowBeforeStart'
import Stage from './Stage'
import StageDispatcher, {
  StageDispatcherDetail,
  StageDispatcherOptions,
} from './StageDispatcher'

// ENTER stage
// - ShowBeforeStart::beforeStart
// - PhaseClass::beforeStart
// - AutoSizeEnter::start
// - PhaseClass::start - should go after AutoSizeEnter to do not trigger too early transitionend event
// - AutoSizeEnter::afterEnd
// - PhaseClass::afterEnd
// - EventDispatcher

// LEAVE stage
// - AutoSizeLeave::beforeStart
// - PhaseClass::beforeStart
// - AutoSizeLeave::start
// - PhaseClass::start
// - PhaseClass::afterEnd
// - HideAfterEnd::afterEnd
// - EventDispatcher

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
  forceUpdate?: boolean
  hideAfterLeave?: boolean
  events?: boolean
  autoSize?: boolean | Size | Size[]
} & StageDispatcherOptions

export type TransitionDetail = StageDispatcherDetail &
  Partial<
    AutoSizeDetail &
      EventDispatcherDetail &
      HideAfterEndDetail &
      PhaseClassDetail &
      ShowBeforeStartDetail
  >

export const STAGE_LEAVE_ORDER = 0

export const STAGE_ENTER_ORDER = 1

export const defaultOptions: TransitionOptions = {
  name: '-',
  stageIndex: STAGE_LEAVE_ORDER,
  forceUpdate: false,
  css: true,
  hideAfterLeave: true,
  events: true,
  autoSize: false,
}

export default class Transition extends StageDispatcher<TransitionDetail> {
  static STAGE_LEAVE_ORDER: number = STAGE_LEAVE_ORDER

  static STAGE_ENTER_ORDER: number = STAGE_ENTER_ORDER

  protected options: TransitionOptions

  constructor(
    element: HTMLElement | SVGSVGElement,
    options?: TransitionOptions
  ) {
    super(element, [], options)

    this.options = {
      ...defaultOptions,
      ...options,
    }

    const duration: undefined | number | TransitionDuration = this.options
      .duration
    let leaveDuration = duration as number
    let enterDuration = duration as number

    if (isPlainObject(duration)) {
      leaveDuration = (duration as TransitionDuration).leave
      enterDuration = (duration as TransitionDuration).enter
    }

    const leaveStage = new Stage('leave', leaveDuration)
    const enterStage = new Stage('enter', enterDuration)

    if (this.options.hideAfterLeave) {
      leaveStage.addModule(new HideAfterEnd())
      enterStage.addModule(new ShowBeforeStart())
    }

    // Should ge before PhaseClass as there are measure tasks
    if (this.options.autoSize) {
      let autoSize: boolean | Size | Size[] = this.options.autoSize

      if (!Array.isArray(autoSize)) {
        autoSize = autoSize === true ? ['width', 'height'] : [autoSize]
      }

      // if (autoSize.length) {
      //   leaveStage.addModule(new AutoSizeLeave())
      //   enterStage.addModule(new AutoSizeEnter())
      // }
    }

    if (this.options.css) {
      leaveStage.addModule(
        new PhaseClass(`${this.options.name}-${leaveStage.name}`, {
          fromClass: this.options.leaveClass,
          activeClass: this.options.leaveActiveClass,
          toClass: this.options.leaveToClass,
          doneClass: this.options.leaveDoneClass,
        })
      )
    }

    if (this.options.css) {
      enterStage.addModule(
        new PhaseClass(`${this.options.name}-${enterStage.name}`, {
          fromClass: this.options.enterClass,
          activeClass: this.options.enterActiveClass,
          toClass: this.options.enterToClass,
          doneClass: this.options.enterDoneClass,
        })
      )
    }

    if (this.options.events) {
      leaveStage.addModule(new EventDispatcher(leaveStage.name))
      enterStage.addModule(new EventDispatcher(enterStage.name))
    }

    this.stages.push(leaveStage)
    this.stages.push(enterStage)

    if (this.options.forceUpdate) {
      this.forceUpdate()
    }
  }

  forceLeave(): Promise<TransitionDetail> {
    return this.forceDispatchByIndex(STAGE_LEAVE_ORDER)
  }

  forceEnter(): Promise<TransitionDetail> {
    return this.forceDispatchByIndex(STAGE_ENTER_ORDER)
  }

  forceUpdate(): Promise<TransitionDetail> {
    return this.stageIndex !== STAGE_LEAVE_ORDER
      ? this.forceEnter()
      : this.forceLeave()
  }

  leave(): Promise<TransitionDetail> {
    return this.dispatchByIndex(STAGE_LEAVE_ORDER)
  }

  enter(): Promise<TransitionDetail> {
    return this.dispatchByIndex(STAGE_ENTER_ORDER)
  }

  toggle(stageIndex?: number): Promise<TransitionDetail> {
    if (null == stageIndex) {
      stageIndex = Number(!this.stageIndex)
    }

    return stageIndex === STAGE_ENTER_ORDER ? this.enter() : this.leave()
  }
}
