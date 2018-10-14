export default class LeaveRectAutoValueTransitionMiddleware {
  constructor(autoProperties) {
    this.autoProperties = autoProperties
    this.disabled = false
  }

  beforeStart({ target }) {
    if (this.autoProperties.length) {
      target.style.display = ''
      const boundingClientRect = target.getBoundingClientRect()
      this.autoProperties.forEach(property => {
        target.style[property] = boundingClientRect[property] + 'px'
      })
    }
  }

  start({ target }) {
    this.autoProperties.forEach(property => {
      target.style[property] = ''
    })
  }

  cancelled({ target }) {
    this.autoProperties.forEach(property => {
      target.style[property] = ''
    })
  }

  getDetails() {
    return {
      auto: !this.disabled,
      autoProperties: this.autoProperties,
    }
  }
}
