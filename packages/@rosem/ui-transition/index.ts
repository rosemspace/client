import Transition from './Transition'

export default new class {
  public test() {
    const el: HTMLElement | SVGElement | null = document.querySelector('#app')

    if (!el) {
      return
    }

    const transition = new Transition(el);
    // @ts-ignore
    window.transition = transition
    console.log(transition);
  }
}
