import Transition from './Transition'

export default {
  init() {
    let style = document.createElement('style')
    style.textContent = `*{box-sizing: border-box;} body {margin: 0}
      .box {
        width: 200px;
        height: 200px;;
        background: blue;
        transition: all 1s;
      }
      .list {padding: 15px 30px;margin: 10px;/*width: 100px;height: 20px;*/background: red;}
      .list > li {padding: 10px 20px;}
      .square {width: 50px; height: 50px; background: orange;}

      .fade-enter-active, .fade-leave-active {
        transition: all .5s;
      }
      .fade-enter, .fade-leave-to, .fade-leave-done {
        opacity: 0;
        height: 0;
      }
      .fade-enter-to {
        /*height: auto;*/
      }
      .fade-enter-done {
        /*height: auto;*/
      }

      .morph-enter-active, .morph-leave-active {
        transition: all 1.5s;
      }
      .morph-enter, .morph-leave-to, .morph-leave-done {
        /*width: 100px;*/
        border-radius: 50%;
        height: 100px;
        background-color: green;
      }
    `
    document.body.appendChild(style)
  },

  test() {
    // this.init()

    const div = document.createElement('div')

    div.classList.add('box')
    document.body.appendChild(div)
  },

  test2() {
    // this.init()
    const el: HTMLElement | SVGSVGElement | null = document.querySelector(
      '#app'
    )

    if (!el) {
      return
    }

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
      name: 'morph',
      forceUpdate: true,
      // css: false,
      autoSize: true,
      hideAfterLeave: false,
    })

    btn.addEventListener('click', async () => {
      await transition.toggle()
    })

    // @ts-ignore
    window.transition = transition
    console.log(transition)
  },
}
