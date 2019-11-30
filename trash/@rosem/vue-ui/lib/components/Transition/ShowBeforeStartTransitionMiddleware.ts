export default class ShowBeforeStartTransitionMiddleware {
  disabled = false
  classList
  stylePropertyList
  attributeList

  constructor(
    className = '',
    stylePropertyList = [],
    attributeList = ['hidden']
  ) {
    this.classList = Array.isArray(className)
      ? className
      : className !== ''
        ? className.split(' ')
        : []
    this.stylePropertyList = stylePropertyList || []
    this.attributeList = attributeList || []
  }

  show(target) {
    target.classList.remove(...this.classList)

    for (const property of this.stylePropertyList) {
      target.style[property] = ''
    }

    for (const property of this.attributeList) {
      target.removeAttribute(property)
    }
  }

  beforeStart({ target }) {
    this.show(target)
  }

  getDetails() {
    return {
      showBeforeStart: !this.disabled,
      showClassList: this.classList,
      showStylePropertyList: this.stylePropertyList,
      showAttributeList: this.attributeList,
    }
  }
}
