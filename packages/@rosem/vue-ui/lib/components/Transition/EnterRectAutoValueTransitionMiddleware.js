export default class EnterRectAutoValueTransitionMiddleware {
  constructor(autoProperties) {
    this.autoProperties = autoProperties
    this.disabled = false
  }

  beforeStart(details) {
    if (this.autoProperties.length) {
      details.autoValues = {}
      const target = details.target
      target.style.display = ''
      let boundingClientRect = target.getBoundingClientRect()
      const values = []
      this.autoProperties.forEach(property => {
        values.push(boundingClientRect[property])
        target.style[property] = 'auto'
      })
      boundingClientRect = target.getBoundingClientRect()
      this.autoProperties.forEach((property, index) => {
        details.autoValues[property] = target.getBoundingClientRect()[property]
        target.style[property] = `${values[index]}px`
      })
    }
  }

  start({ target, autoValues }) {
    this.autoProperties.forEach(property => {
      target.style[property] = `${autoValues[property]}px`
    })
  }

  afterEnd({ target }) {
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
