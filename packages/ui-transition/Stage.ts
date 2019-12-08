import Module, { Detail, Phase } from './Module'
import ModuleDispatcher, {
  ModuleDispatcherPhaseOrder,
} from './ModuleDispatcher'

class Middleware {
  private readonly module: Module
  private successor?: Middleware

  constructor(module: Module, predecessor?: Middleware) {
    this.module = module

    if (predecessor) {
      predecessor.successor = this
    }
  }

  process(phase: Phase, detail: Detail): void {
    this.module[phase](
      Object.assign(detail, this.module.getDetail()),
      this.successor
        ? () => {
            this.successor!.process(phase, detail)
          }
        : () => {}
    )
  }
}

export default class Stage implements ModuleDispatcher {
  public readonly name: string
  public readonly duration?: number
  public readonly isExplicitDuration: boolean = false
  private middleware!: Middleware
  private middlewareCursor!: Middleware

  constructor(name: string, duration?: number) {
    this.name = name

    if (null != duration) {
      this.duration = duration
      this.isExplicitDuration = true
    } else {
      this.duration = 0
    }
  }

  addModule(module: Module, order?: ModuleDispatcherPhaseOrder | number) {
    this.middlewareCursor = new Middleware(module, this.middlewareCursor)

    if (!this.middleware) {
      this.middleware = this.middlewareCursor
    }
  }

  dispatch(phase: Phase, detail: Detail): Detail {
    if (this.middleware) {
      this.middleware.process(phase, detail)
    }

    // this.middlewareList.forEach((module) => {
    //   module[phase](Object.assign(detail, module.getDetail()))
    // })

    return detail
  }
}
