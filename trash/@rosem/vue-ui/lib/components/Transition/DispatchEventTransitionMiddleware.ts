export default class DispatchEventTransitionMiddleware {
  constructor(stageName) {
    this.stageName = stageName
    this.disabled = false
  }

  beforeStart(details) {
    details.currentTarget.dispatchEvent(
      new CustomEvent(`before-${this.stageName}`, {
        detail: details,
      })
    )
  }

  start(details) {
    details.currentTarget.dispatchEvent(
      new CustomEvent(this.stageName, {
        detail: details,
      })
    )
  }

  afterEnd(details) {
    details.currentTarget.dispatchEvent(
      new CustomEvent(`after-${this.stageName}`, {
        detail: details,
      })
    )
  }

  cancelled(details) {
    details.currentTarget.dispatchEvent(
      new CustomEvent(`${this.stageName}-cancelled`, {
        detail: details,
      })
    )
  }

  getDetails() {
    return {
      events: !this.disabled,
    }
  }
}
