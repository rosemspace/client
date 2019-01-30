import ModuleInterface, { Detail, Phase } from './ModuleInterface'

export default interface ModuleDispatcherInterface {
  use(module: ModuleInterface): void

  dispatch(phase: Phase, details: Detail): Detail
}
