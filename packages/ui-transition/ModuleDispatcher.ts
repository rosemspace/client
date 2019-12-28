import Module, { Phase, PhaseEnum } from './Module'
import StageDispatcher, { StageDispatcherDetail } from './StageDispatcher'

export type ModuleDispatcherPhaseOrder = {
  [PhaseEnum.BeforeStart]: number
  [PhaseEnum.Start]: number
  [PhaseEnum.AfterEnd]: number
}

export default interface ModuleDispatcher<T extends StageDispatcherDetail> {
  addModule(
    module: Module<any, T>,
    order?: ModuleDispatcherPhaseOrder | number
  ): void

  dispatch(stageDispatcher: StageDispatcher<T>, phase: Phase): void
}
