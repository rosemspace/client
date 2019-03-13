import ModuleInterface, { Detail, DetailInit } from './ModuleInterface'

export default abstract class AbstractModule implements ModuleInterface {
  cleanup(detail: Detail): void {}

  beforeStart(detail: Detail): void {}

  start(detail: Detail): void {}

  afterEnd(detail: Detail): void {}

  cancelled(detail: Detail): void {}

  public getDetail(): DetailInit {
    return {}
  }
}
