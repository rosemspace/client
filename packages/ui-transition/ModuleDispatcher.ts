import Module, { Detail, Phase, PhaseEnum } from './Module'

export type ModuleDispatcherPhaseOrder = {
  [PhaseEnum.BeforeStart]: number
  [PhaseEnum.Start]: number
  [PhaseEnum.AfterEnd]: number
}

export default interface ModuleDispatcher {
  addModule(module: Module, order?: ModuleDispatcherPhaseOrder | number): void

  dispatch(phase: Phase, details: Detail): Detail
}
