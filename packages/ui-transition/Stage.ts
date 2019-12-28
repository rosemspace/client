import { Middleware } from './Middleware'
import Module, { Phase } from './Module'
import ModuleDispatcher, {
  ModuleDispatcherPhaseOrder,
} from './ModuleDispatcher'
import StageDispatcher, { StageDispatcherDetail } from './StageDispatcher'

export default class Stage<T extends StageDispatcherDetail>
  implements ModuleDispatcher<T> {
  public readonly name: string

  public readonly duration: number

  public readonly isExplicitDuration: boolean = false

  private middleware?: Middleware<T>

  private lastMiddleware?: Middleware<T>

  constructor(name: string, duration?: number) {
    this.name = name

    if (null != duration) {
      this.duration = duration
      this.isExplicitDuration = true
    } else {
      this.duration = 0
    }
  }

  addModule(module: Module<any, T>, order?: ModuleDispatcherPhaseOrder | number) {
    this.lastMiddleware = new Middleware(module, this.lastMiddleware)

    if (!this.middleware) {
      this.middleware = this.lastMiddleware
    }
  }

  dispatch(stageDispatcher: StageDispatcher<T>, phase: Phase): void {
    if (this.middleware) {
      this.middleware.process(stageDispatcher, phase)
    }
  }
}
