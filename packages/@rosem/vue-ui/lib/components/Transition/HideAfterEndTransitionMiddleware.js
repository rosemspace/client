export default class HideAfterEndTransitionMiddleware {
  constructor(css = { display: 'none' }) {
    this.css = css
    this.disabled = false
  }

  hide(target) {
    for (const [property, value] of Object.entries(this.css)) {
      target.style[property] = value
    }
  }

  afterEnd({ target }) {
    this.hide(target)
  }

  getDetails() {
    return {
      hideAfterEnd: !this.disabled,
      hideCSS: this.css,
    }
  }
}
