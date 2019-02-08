import ModuleInterface, { Detail, Phase } from './ModuleInterface'
import ModuleDispatcherInterface from './ModuleDispatcherInterface'

export default class Stage implements ModuleDispatcherInterface {
  public readonly name: string
  public readonly duration?: number
  public readonly isExplicitDuration: boolean = false
  private moduleList: Array<ModuleInterface> = []

  constructor(name: string, duration?: number) {
    this.name = name

    if (null != duration) {
      this.duration = duration
      this.isExplicitDuration = true
    } else {
      this.duration = 0
    }
  }

  public addModule(middleware: ModuleInterface) {
    this.moduleList.push(middleware)
  }

  public dispatch(phase: Phase, details: Detail = {}): Detail {
    this.moduleList.forEach((module) => {
      if (null != module.getDetail) {
        Object.assign(details, module.getDetail())
      }

      module[phase](details)
    })

    return details
  }
}
