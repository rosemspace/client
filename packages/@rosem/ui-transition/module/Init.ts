import Module, { Detail } from '../Module'

export default abstract class Init implements Module {
  cleanup(detail: Detail): void {}

  beforeStart(detail: Detail): void {}

  start(detail: Detail): void {}

  afterEnd(detail: Detail): void {}

  cancelled(detail: Detail): void {}

  getDetail(): Partial<Detail> {
    return {}
  }
}
