import { Middleware } from './Middleware'
import Module, { Detail, Phase } from './Module'
import ModuleDispatcher, {
  ModuleDispatcherPhaseOrder,
} from './ModuleDispatcher'

export default class Stage implements ModuleDispatcher {
  public readonly name: string

  public readonly duration: number

  public readonly isExplicitDuration: boolean = false

  private middleware?: Middleware

  private lastMiddleware?: Middleware

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
    this.lastMiddleware = new Middleware(module, this.lastMiddleware)

    if (!this.middleware) {
      this.middleware = this.lastMiddleware
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
