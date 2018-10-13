export default class HideAfterEndTransitionMiddleware {
  constructor(className = '', style = { display: 'none' }) {
    this.className = className
    this.style = style
    this.disabled = false
  }

  hide(target) {
    this.className !== '' && target.classList.add(...this.className.split(' '))

    for (const [property, value] of Object.entries(this.style)) {
      target.style[property] = value
    }
  }

  afterEnd({ target }) {
    this.hide(target)
  }

  getDetails() {
    return {
      hideAfterEnd: !this.disabled,
      hideCSS: {
        className: this.className,
        style: this.style,
      },
    }
  }
}
