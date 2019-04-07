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

  addModule(module: Module) {
    this.moduleList.push(module)
  }

  dispatch(phase: Phase, detail: Detail): Detail {
    this.moduleList.forEach((module) => {
      Object.assign(detail, module.getDetail())
      module[phase](detail)
    })

    return detail
  }
}
