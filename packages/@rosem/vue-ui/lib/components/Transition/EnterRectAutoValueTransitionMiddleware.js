export default class EnterRectAutoValueTransitionMiddleware {
  constructor(autoProperties) {
    this.autoProperties = autoProperties
    this.autoValues = {}
    this.disabled = false
  }

  beforeStart({ target }) {
    if (this.autoProperties.length) {
      target.style.display = ''
      let boundingClientRect = target.getBoundingClientRect()
      const values = []
      this.autoProperties.forEach(property => {
        values.push(boundingClientRect[property])
        target.style[property] = 'auto'
      })
      boundingClientRect = target.getBoundingClientRect()
      this.autoProperties.forEach((property, index) => {
        this.autoValues[property] = target.getBoundingClientRect()[property]
        target.style[property] = `${values[index]}px`
      })
    }
  }

  start({ target }) {
    this.autoProperties.forEach(property => {
      target.style[property] = `${this.autoValues[property]}px`
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
      autoValues: this.autoValues,
    }
  }
}
