import ModuleInterface, { Detail, Phase } from './ModuleInterface'

export default interface ModuleDispatcherInterface {
  addModule(module: ModuleInterface): void

  dispatch(phase: Phase, details: Detail): Detail
}
