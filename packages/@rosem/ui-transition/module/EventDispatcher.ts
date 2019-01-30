import { Detail, Phase } from '../ModuleInterface'
import AbstractModule from '../AbstractModule'

export default class EventDispatcher extends AbstractModule {
  private readonly stageName: string

  constructor(stageName: string) {
    super(Phase.length)
    this.stageName = stageName
  }

  public [Phase.BeforeStart](details: Detail): void {
    details.currentTarget.dispatchEvent(
      new CustomEvent(`before-${this.stageName}`, {
        detail: details,
      })
    )
  }

  public [Phase.Start](detail: Detail): void {
    detail.currentTarget.dispatchEvent(
      new CustomEvent(this.stageName, {
        detail: detail,
      })
    )
  }

  public [Phase.AfterEnd](detail: Detail): void {
    detail.currentTarget.dispatchEvent(
      new CustomEvent(`after-${this.stageName}`, {
        detail: detail,
      })
    )
  }

  public [Phase.Cancelled](detail: Detail): void {
    detail.currentTarget.dispatchEvent(
      new CustomEvent(`${this.stageName}-cancelled`, {
        detail: detail,
      })
    )
  }

  public getDetail(): Detail {
    return {
      events: true,
    }
  }
}
