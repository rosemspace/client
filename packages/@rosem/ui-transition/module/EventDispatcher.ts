import { Detail, DetailInit } from '../Module'
import ModuleInit from '../ModuleInit'

export default class EventDispatcher extends ModuleInit {
  private readonly stageName: string

  constructor(stageName: string) {
    super()
    this.stageName = stageName
  }

  beforeStart(details: Detail): void {
    details.currentTarget.dispatchEvent(
      new CustomEvent(`before-${this.stageName}`, {
        detail: details,
      })
    )
  }

  start(detail: Detail): void {
    detail.currentTarget.dispatchEvent(
      new CustomEvent(this.stageName, {
        detail: detail,
      })
    )
  }

  afterEnd(detail: Detail): void {
    detail.currentTarget.dispatchEvent(
      new CustomEvent(`after-${this.stageName}`, {
        detail: detail,
      })
    )
  }

  cancelled(detail: Detail): void {
    detail.currentTarget.dispatchEvent(
      new CustomEvent(`${this.stageName}-cancelled`, {
        detail: detail,
      })
    )
  }

  getDetail(): DetailInit {
    return {
      events: true,
    }
  }
}
