import Module, { Detail, Phase } from './Module'
import ModuleDispatcher from './ModuleDispatcher'

export default class Stage implements ModuleDispatcher {
  public readonly name: string
  public readonly duration?: number
  public readonly isExplicitDuration: boolean = false
  private moduleList: Module[] = []

  constructor(name: string, duration?: number) {
    this.name = name

    if (null != duration) {
      this.duration = duration
      this.isExplicitDuration = true
    } else {
      this.duration = 0
    }
  }

  public addModule(middleware: Module) {
    this.moduleList.push(middleware)
  }

  public dispatch(phase: Phase, details: Detail): Detail {
    this.moduleList.forEach((module) => {
      if (null != module.getDetail) {
        Object.assign(details, module.getDetail())
      }

      module[phase](details)
    })

    return details
  }
}
