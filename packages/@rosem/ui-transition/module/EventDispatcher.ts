import { Detail, DetailInit } from '../Module'
import Init from './Init'

export default class EventDispatcher extends Init {
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

  beforeStart(detail: Detail): void {
    this.eventInit.detail = detail
    detail.currentTarget.dispatchEvent(
      new CustomEvent(`before-${this.stageName}`, this.eventInit)
    )
  }

  start(detail: Detail): void {
    this.eventInit.detail = detail
    detail.currentTarget.dispatchEvent(
      new CustomEvent(this.stageName, this.eventInit)
    )
  }

  afterEnd(detail: Detail): void {
    this.eventInit.detail = detail
    detail.currentTarget.dispatchEvent(
      new CustomEvent(`after-${this.stageName}`, this.eventInit)
    )
  }

  cancelled(detail: Detail): void {
    this.eventInit.detail = detail
    detail.currentTarget.dispatchEvent(
      new CustomEvent(`${this.stageName}-cancelled`, this.eventInit)
    )
  }

  getDetail(): DetailInit {
    return {
      events: true,
      eventInit: this.eventInit,
    }
  }
}
