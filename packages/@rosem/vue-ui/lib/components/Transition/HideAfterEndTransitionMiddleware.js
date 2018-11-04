export default class HideAfterEndTransitionMiddleware {
  disabled = false
  classList
  style
  styleEntries
  attributeList

  constructor(className = '', style = {}, attributeList = { hidden: true }) {
    this.classList = Array.isArray(className)
      ? className
      : className !== ''
        ? className.split(' ')
        : []
    this.style = style
    this.styleEntries = Object.entries(style || {})
    this.attributeList = attributeList
    this.attributeEntries = Object.entries(attributeList || {})
  }

  hide(target) {
    target.classList.add(...this.classList)

    for (const [property, value] of this.styleEntries) {
      target.style[property] = value
    }

    for (const [property, value] of this.attributeEntries) {
      target.setAttribute(property, value === true ? '' : value)
    }
  }

  afterEnd({ target }) {
    this.hide(target)
  }

  getDetails() {
    return {
      hideAfterEnd: !this.disabled,
      hideClassList: this.classList,
      hideStyle: this.style,
      hideAttributeList: this.attributeList,
    }
  }
}
