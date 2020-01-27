import Module, { Phase, PhaseHook } from './Module'
import StageDispatcher, { StageDispatcherDetail } from './StageDispatcher'

interface MiddlewareInterface<T extends StageDispatcherDetail> {
  process(stageDispatcher: StageDispatcher<T>, phase: Phase): void
}

export class Middleware<T extends StageDispatcherDetail>
  implements MiddlewareInterface<T> {
  private readonly module: Module<any, T>

  private successor: MiddlewareInterface<T> = { process: () => undefined }

  constructor(module: Module<any, T>, predecessor?: Middleware<T>) {
    this.module = module

    if (predecessor) {
      predecessor.successor = this
    }
  }

  process(stageDispatcher: StageDispatcher<T>, phase: Phase): void {
    if (null != this.module[phase]) {
      stageDispatcher.queueMeasureTask(
        `middleware measure get detail`,
        (): void => {
          stageDispatcher.assignDetail(this.module.getDetail())
        }
      )
      ;(this.module[phase] as PhaseHook<T>)(stageDispatcher, () => {
        this.successor.process(stageDispatcher, phase)
      })
    } else {
      this.successor.process(stageDispatcher, phase)
    }
  }
}
