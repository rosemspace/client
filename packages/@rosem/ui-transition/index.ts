import Transition from './Transition'

export default new class {
  public test() {
    const el: HTMLElement | SVGElement | null = document.querySelector('#app')

    if (!el) {
      return
    }

    let style = document.createElement('style')
    style.textContent = `.list {/*padding: 30px;*/width: 100px;background: red;}
      .fade-enter-active, .fade-leave-active {
        transition: opacity .5s, height .5s;
      }
      .fade-enter, .fade-leave-to {
        opacity: 0;
        height: 0;
      }
    `
    document.body.appendChild(style)
    let ul = document.createElement('ul')
    ul.classList.add('list')
    let li1 = document.createElement('li')
    let li2 = li1.cloneNode()
    let li3 = li1.cloneNode()
    li1.textContent = 'List item 1'
    li2.textContent = 'List item 2'
    li3.textContent = 'List item 3'
    ul.appendChild(li1)
    ul.appendChild(li2)
    ul.appendChild(li3)
    el.appendChild(ul)
    let btn = document.createElement('button')
    btn.textContent = 'toggle'
    el.prepend(btn)

    const transition = new Transition(ul, {
      name: 'fade',
      stageIndex: 0,
      forceUpdate: true,
      autoSize: 'height',
    });

    btn.addEventListener('click', () => {
      transition.toggle()
    })

    // @ts-ignore
    window.transition = transition
    console.log(transition);
  }
}
