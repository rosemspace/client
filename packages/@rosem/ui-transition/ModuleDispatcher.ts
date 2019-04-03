import Module, { Detail, Phase } from './Module'

export default interface ModuleDispatcher {
  addModule(module: Module): void

  dispatch(phase: Phase, details: Detail): Detail
}
