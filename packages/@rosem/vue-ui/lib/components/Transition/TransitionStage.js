import { isDefined } from './utils'

export default class TransitionStage {
  name
  duration = 0
  isExplicitDuration = false
  middlewareList = []

  constructor(name, duration) {
    this.name = name

    if (isDefined(duration)) {
      this.duration = isDefined(duration[name]) ? duration[name] : duration
      this.isExplicitDuration = true
    }
  }

  use(middleware) {
    this.middlewareList.push(middleware)
  }

  dispatch(period, details = {}) {
    this.middlewareList.forEach(middleware => {
      middleware.getDetails &&
        Object.assign(details, middleware.getDetails(details))
      middleware[period] && middleware[period](details)
    })

    return details
  }
}
