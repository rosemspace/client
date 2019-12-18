import DOMScheduler from '@rosemlabs/dom-scheduler'
import { EventDispatcherDetail } from './module/EventDispatcher'
import { HideAfterEndDetail } from './module/HideAfterEnd'
import { PhaseClassDetail } from './module/PhaseClass'
import { ShowBeforeStartDetail } from './module/ShowBeforeStart'

export enum PhaseEnum {
  Cleanup = 'cleanup',
  BeforeStart = 'beforeStart',
  Start = 'start',
  AfterEnd = 'afterEnd',
  Cancelled = 'cancelled',
}

export type Phase =
  | PhaseEnum.Cleanup
  | PhaseEnum.BeforeStart
  | PhaseEnum.Start
  | PhaseEnum.AfterEnd
  | PhaseEnum.Cancelled

export type Detail = {
  name: string
  currentTarget: HTMLElement | SVGSVGElement
  target: HTMLElement | SVGSVGElement
  delegateTarget: HTMLElement | SVGSVGElement
  stageIndex: number
  stageName: string
  duration: number
  done?: () => Detail
  computedStyle: CSSStyleDeclaration
  scheduleAnimationFrame: () => void
} & Partial<EventDispatcherDetail> &
  Partial<HideAfterEndDetail> &
  Partial<PhaseClassDetail> &
  Partial<ShowBeforeStartDetail> &
  Record<string, any>

export type PhaseHook = (detail: Detail, next: () => void) => void

export default interface Module {
  cleanup?: PhaseHook
  beforeStart?: PhaseHook
  start?: PhaseHook
  afterEnd?: PhaseHook
  cancelled?: PhaseHook
  getDetail(): Partial<Detail>
}

export abstract class AbstractModule implements Module {
  private mutateTask: () => void = () => void 0

  private measureTask: () => void = () => void 0

  abstract getDetail(): Partial<Detail>

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  cancelled(detail: Detail, next: () => void): void {
    this.clearTasks()
    next()
  }

  protected mutate(callback: () => void): void {
    DOMScheduler.mutate((this.mutateTask = callback))
  }

  protected measure(callback: () => void): void {
    DOMScheduler.measure((this.measureTask = callback))
  }

  protected clearTasks(): void {
    DOMScheduler.clear(this.mutateTask)
    DOMScheduler.clear(this.measureTask)
  }
}
