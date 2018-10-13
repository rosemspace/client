export default class CSSClassTransitionMiddleware {
  static CLASS_PREFIX_FROM = ''
  static CLASS_PREFIX_ACTIVE = ''
  static CLASS_PREFIX_TO = ''
  static CLASS_PREFIX_DONE = ''
  static CLASS_SUFFIX_FROM = ''
  static CLASS_SUFFIX_ACTIVE = '-active'
  static CLASS_SUFFIX_TO = '-to'
  static CLASS_SUFFIX_DONE = '-done'

  constructor(name, options) {
    this.name = name
    this.options = options
    this.disabled = false
  }

  get fromClass() {
    return (
      this.options.fromClass ||
      CSSClassTransitionMiddleware.CLASS_PREFIX_FROM +
        this.name +
        CSSClassTransitionMiddleware.CLASS_SUFFIX_FROM
    )
  }

  get activeClass() {
    return (
      this.options.activeClass ||
      CSSClassTransitionMiddleware.CLASS_PREFIX_ACTIVE +
        this.name +
        CSSClassTransitionMiddleware.CLASS_SUFFIX_ACTIVE
    )
  }

  get toClass() {
    return (
      this.options.toClass ||
      CSSClassTransitionMiddleware.CLASS_PREFIX_TO +
        this.name +
        CSSClassTransitionMiddleware.CLASS_SUFFIX_TO
    )
  }

  get doneClass() {
    return (
      this.options.doneClass ||
      CSSClassTransitionMiddleware.CLASS_PREFIX_DONE +
        this.name +
        CSSClassTransitionMiddleware.CLASS_SUFFIX_DONE
    )
  }

  clear(target) {
    target.classList.remove(
      this.fromClass,
      this.activeClass,
      this.toClass,
      this.doneClass
    )
  }

  beforeStart({ target }) {
    target.classList.remove(this.toClass, this.doneClass)
    target.classList.add(this.fromClass, this.activeClass)
  }

  start({ target }) {
    target.classList.remove(this.fromClass)
    target.classList.add(this.toClass)
  }

  afterEnd({ target }) {
    target.classList.remove(this.activeClass, this.toClass)
    target.classList.add(this.doneClass)
  }

  getDetails() {
    return {
      css: !this.disabled,
      fromClass: this.fromClass,
      activeClass: this.activeClass,
      toClass: this.toClass,
      doneClass: this.doneClass,
    }
  }
}
