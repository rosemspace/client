import Module, { Detail, DetailInit } from './Module'

export default abstract class ModuleInit implements Module {
  cleanup(detail: Detail): void {}

  beforeStart(detail: Detail): void {}

  start(detail: Detail): void {}

  afterEnd(detail: Detail): void {}

  cancelled(detail: Detail): void {}

  getDetail(): DetailInit {
    return {}
  }
}
