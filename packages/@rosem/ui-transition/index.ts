import Transition from './Transition'

export default new class {
  public test() {
    const el: HTMLElement | SVGSVGElement | null = document.querySelector('#app')

    if (!el) {
      return
    }

    let style = document.createElement('style')
    style.textContent = `*{box-sizing: border-box;} body {margin: 0}
      .list {padding: 15px 30px;margin: 10px;/*width: 100px;*/background: red;}
      .list > li {padding: 10px 20px;}
      .square {width: 50px; height: 50px; background: orange;}
      
      .fade-enter-active, .fade-leave-active {
        transition: all .5s;
      }
      .fade-enter, .fade-leave-to {
        /*opacity: 0;*/
        margin-top: 0;
        margin-bottom: 0;
        padding-top: 0;
        padding-bottom: 0;
        height: 0;
        border-top-width: 0;
        border-bottom-width: 0;
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
    let square = document.createElement('div')
    square.classList.add('square')
    el.appendChild(square)
    let btn = document.createElement('button')
    btn.textContent = 'toggle'
    el.prepend(btn)

    const transition = new Transition(ul, {
      name: 'fade',
      stageIndex: 0,
      forceUpdate: true,
      autoSize: true,
    });

    btn.addEventListener('click', () => {
      transition.toggle()
    })

    // @ts-ignore
    window.transition = transition
    console.log(transition);
  }
}
