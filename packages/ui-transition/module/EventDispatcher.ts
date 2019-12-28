import Module from '../Module'
import StageDispatcher, { StageDispatcherDetail } from '../StageDispatcher'

export type EventDispatcherDetail = {}

export default class EventDispatcher implements Module<EventDispatcherDetail> {
  protected readonly stageName: string
  protected eventInit: CustomEventInit

  constructor(stageName: string, eventInit?: CustomEventInit) {
    this.stageName = stageName
    this.eventInit = {
      ...{
        bubbles: false,
        cancelable: false,
        composed: false,
      },
      ...(eventInit || {}),
    }
  }

  beforeStart(
    stageDispatcher: StageDispatcher<
      StageDispatcherDetail & EventDispatcherDetail
    >,
    next: () => void
  ): void {
    this.eventInit.detail = stageDispatcher.detail
    stageDispatcher.currentTarget.dispatchEvent(
      new CustomEvent(`before-${this.stageName}`, this.eventInit)
    )
    next()
  }

  start(
    stageDispatcher: StageDispatcher<
      StageDispatcherDetail & EventDispatcherDetail
    >,
    next: () => void
  ): void {
    this.eventInit.detail = stageDispatcher.detail
    stageDispatcher.currentTarget.dispatchEvent(
      new CustomEvent(this.stageName, this.eventInit)
    )
    next()
  }

  afterEnd(
    stageDispatcher: StageDispatcher<
      StageDispatcherDetail & EventDispatcherDetail
    >,
    next: () => void
  ): void {
    this.eventInit.detail = stageDispatcher.detail
    stageDispatcher.currentTarget.dispatchEvent(
      new CustomEvent(`after-${this.stageName}`, this.eventInit)
    )
    next()
  }

  cancelled(
    stageDispatcher: StageDispatcher<
      StageDispatcherDetail & EventDispatcherDetail
    >,
    next: () => void
  ): void {
    this.eventInit.detail = stageDispatcher.detail
    stageDispatcher.currentTarget.dispatchEvent(
      new CustomEvent(`${this.stageName}-cancelled`, this.eventInit)
    )
    next()
  }

  getDetail(): EventDispatcherDetail {
    return {}
  }
}
