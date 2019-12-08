import { Detail } from '../Module'
import Delegate from './Delegate'

export default class EventDispatcher extends Delegate {
  protected readonly stageName: string
  protected eventInit: CustomEventInit<Detail>

  constructor(
    stageName: string,
    eventInit: CustomEventInit<Detail> = {
      bubbles: false,
      cancelable: false,
      composed: false,
    }
  ) {
    super()
    this.stageName = stageName
    this.eventInit = eventInit
  }

  beforeStart(detail: Detail, next: () => void): void {
    this.eventInit.detail = detail
    detail.currentTarget.dispatchEvent(
      new CustomEvent(`before-${this.stageName}`, this.eventInit)
    )

    super.beforeStart(detail, next)
  }

  start(detail: Detail, next: () => void): void {
    this.eventInit.detail = detail
    detail.currentTarget.dispatchEvent(
      new CustomEvent(this.stageName, this.eventInit)
    )

    super.start(detail, next)
  }

  afterEnd(detail: Detail, next: () => void): void {
    this.eventInit.detail = detail
    detail.currentTarget.dispatchEvent(
      new CustomEvent(`after-${this.stageName}`, this.eventInit)
    )

    super.afterEnd(detail, next)
  }

  cancelled(detail: Detail, next: () => void): void {
    this.eventInit.detail = detail
    detail.currentTarget.dispatchEvent(
      new CustomEvent(`${this.stageName}-cancelled`, this.eventInit)
    )

    super.cancelled(detail, next)
  }

  getDetail(): Partial<Detail> {
    return {
      events: true,
      eventInit: this.eventInit,
    }
  }
}
