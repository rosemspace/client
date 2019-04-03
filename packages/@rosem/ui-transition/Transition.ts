import AutoSizeEnter from '@rosem/ui-transition/module/AutoSizeEnter'
import AutoSizeLeave from '@rosem/ui-transition/module/AutoSizeLeave'
import { isEmpty, isPlainObject } from 'lodash-es'
import { Detail } from './Module'
import Stage from './Stage'
import StageDispatcher, { StageDispatcherOptions } from './StageDispatcher'
import PhaseClass from './module/PhaseClass'
import EventDispatcher from './module/EventDispatcher'
import RemoveBeforeStart from './module/RemoveBeforeStart'
import SetAfterEnd, { AttrMap, StyleMap } from './module/SetAfterEnd'

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
  afterLeaveClassList?: string[] | string
  afterLeaveStyleMap?: StyleMap
  afterLeaveAttributeMap?: AttrMap
  autoSize?: boolean | ('width' | 'height') | ('width' | 'height')[]
  events?: boolean
  forceUpdate?: boolean
} & StageDispatcherOptions

export const defaultOptions: TransitionOptions = {
  name: '-',
  stageIndex: 0,
  forceUpdate: false,
  css: true,
  events: true,
  autoSize: false,
  afterLeaveClassList: [],
  afterLeaveStyleMap: { display: 'none' },
  afterLeaveAttributeMap: {},
}

export default class Transition extends StageDispatcher {
  public static STAGE_LEAVE_ORDER: number = 0
  public static STAGE_ENTER_ORDER: number = 1

  protected options: TransitionOptions

  constructor(element: Element, options?: TransitionOptions) {
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

    if (this.options.css) {
      leaveStage.addModule(
        new PhaseClass(`${this.options.name}-${leaveStage.name}`, {
          fromClass: this.options.leaveClass,
          activeClass: this.options.leaveActiveClass,
          toClass: this.options.leaveToClass,
          doneClass: this.options.leaveDoneClass,
        })
      )
      enterStage.addModule(
        new PhaseClass(`${this.options.name}-${enterStage.name}`, {
          fromClass: this.options.enterClass,
          activeClass: this.options.enterActiveClass,
          toClass: this.options.enterToClass,
          doneClass: this.options.enterDoneClass,
        })
      )
    }

    if (this.hideAfterLeave) {
      leaveStage.addModule(
        new SetAfterEnd(
          this.options.afterLeaveClassList || [],
          this.options.afterLeaveStyleMap || {},
          this.options.afterLeaveAttributeMap || {}
        )
      )
      enterStage.addModule(
        new RemoveBeforeStart(
          this.options.afterLeaveClassList || [],
          Object.keys(this.options.afterLeaveStyleMap || []),
          Object.keys(this.options.afterLeaveAttributeMap || [])
        )
      )
    }

    if (this.options.autoSize) {
      let autoSize:
        | boolean
        | ('width' | 'height')
        | ('width' | 'height')[] = this.options.autoSize

      if (!Array.isArray(autoSize)) {
        autoSize = autoSize === true ? ['width', 'height'] : [autoSize]
      }

      if (autoSize.length) {
        leaveStage.addModule(new AutoSizeLeave(autoSize))
        enterStage.addModule(new AutoSizeEnter(autoSize))
      }
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

  get hideAfterLeave(): boolean {
    const {
      afterLeaveClassList,
      afterLeaveStyleMap,
      afterLeaveAttributeMap,
    } = this.options

    return Boolean(
      (afterLeaveClassList && afterLeaveClassList.length) ||
        (afterLeaveStyleMap && !isEmpty(afterLeaveStyleMap)) ||
        (afterLeaveAttributeMap && !isEmpty(afterLeaveAttributeMap))
    )
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

  toggle(stageIndex?: number): Promise<Detail> {
    if (null == stageIndex) {
      stageIndex = Number(!this.stageIndex)
    }

    return stageIndex !== Transition.STAGE_LEAVE_ORDER
      ? this.enter()
      : this.leave()
  }
}
