import MiddlewareRunnerInterface from './MiddlewareRunnerInterface'
import MiddlewareInterface, { Details, Phase } from './MiddlewareInterface'

export type StageDurationList = { [stageName: string]: number }

export default class Stage implements MiddlewareRunnerInterface {
  public readonly name: string
  public readonly duration?: number
  public readonly isExplicitDuration: boolean = false
  private middlewareList: MiddlewareInterface[] = []

  constructor(name: string, duration?: number | StageDurationList) {
    this.name = name

    if (null != duration) {
      // todo is plain object
      this.duration = typeof duration === 'object' ? duration[name] : duration
      this.isExplicitDuration = true
    } else {
      this.duration = 0
    }
  }

  public use(middleware: MiddlewareInterface) {
    this.middlewareList.push(middleware)
  }

  public run(phase: Phase, details: Details = {}): Details {
    this.middlewareList.forEach((middleware) => {
      if (null != middleware.getDetails) {
        Object.assign(details, middleware.getDetails(details))
      }

      const middlewarePhase = middleware[phase]

      if (null != middlewarePhase) {
        middlewarePhase(details)
      }
    })

    return details
  }
}
