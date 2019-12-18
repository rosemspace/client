import Module, { Detail } from '../Module'

export type EventDispatcherDetail = {
  eventInit: CustomEventInit<Detail>
}

const eventDispatcherDefaultOptions: CustomEventInit<Detail> = {
  bubbles: false,
  cancelable: false,
  composed: false,
}

export default class EventDispatcher implements Module {
  protected readonly stageName: string
  protected eventInit: CustomEventInit<Detail>

  constructor(stageName: string, eventInit: CustomEventInit<Detail> = {}) {
    this.stageName = stageName
    this.eventInit = { ...eventDispatcherDefaultOptions, ...eventInit }
  }

  beforeStart(detail: Detail, next: () => void): void {
    this.eventInit.detail = detail
    detail.currentTarget.dispatchEvent(
      new CustomEvent(`before-${this.stageName}`, this.eventInit)
    )
    next()
  }

  start(detail: Detail, next: () => void): void {
    this.eventInit.detail = detail
    detail.currentTarget.dispatchEvent(
      new CustomEvent(this.stageName, this.eventInit)
    )
    next()
  }

  afterEnd(detail: Detail, next: () => void): void {
    this.eventInit.detail = detail
    detail.currentTarget.dispatchEvent(
      new CustomEvent(`after-${this.stageName}`, this.eventInit)
    )
    next()
  }

  cancelled(detail: Detail, next: () => void): void {
    this.eventInit.detail = detail
    detail.currentTarget.dispatchEvent(
      new CustomEvent(`${this.stageName}-cancelled`, this.eventInit)
    )
    next()
  }

  getDetail(): EventDispatcherDetail {
    return {
      eventInit: this.eventInit,
    }
  }
}
