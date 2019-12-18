import Module, { Detail, Phase, PhaseHook } from './Module'

interface MiddlewareInterface {
  process(phase: Phase, detail: Detail): void
}

export class Middleware implements MiddlewareInterface {
  private readonly module: Module

  private successor: MiddlewareInterface = { process: () => void 0 }

  constructor(module: Module, predecessor?: Middleware) {
    this.module = module

    if (predecessor) {
      predecessor.successor = this
    }
  }

  process(phase: Phase, detail: Detail): void {
    if (null != this.module[phase]) {
      ;(this.module[phase] as PhaseHook)(
        Object.assign(detail, this.module.getDetail()),
        () => {
          this.successor.process(phase, detail)
        }
      )
    } else {
      this.successor.process(phase, detail)
    }
  }
}
