import DOMContentBox from './DOMContentBox'
import DOMBoundingBox from './DOMBoundingBox'

const style = document.createElement('style')
style.textContent = `
body {margin: 15px}
.box {
  margin: 15px;
  padding: 15px;
  /*border: solid 15px tomato;*/
  width: 200px;
  height: 100px;
  background: orange;
  transition: all .5s;
}
`
const div = document.createElement('div')
const btn = document.createElement('button')

div.classList.add('box')
// div.style.display = 'none'
// @ts-ignore
window.cb = DOMContentBox.from(div)
// @ts-ignore
window.bb = DOMBoundingBox.from(div)
btn.textContent = 'Start'
let btnToggle = false
btn.addEventListener('click', () => {
  btnToggle = !btnToggle

  requestAnimationFrame(() => {
  if (btnToggle) {
    // DOM write
    div.style.display = ''
    div.style.width = 'auto'

    // requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      // DOM read (reflow)
      // console.log('NO REFLOW')
      // @ts-ignore
      const bbWidth = window.bb.width

      // console.log(window.cb.width);
      // console.log(bbWidth);


      // requestAnimationFrame(() => { //no need
      // DOM write
      div.style.width = ''
      requestAnimationFrame(() => {
        // DOM read (reflow)
        // console.log('REFLOW')
        // console.log(window.bb.width);

        div.style.width = `${bbWidth}px`
      })
      // })
    // })
    })
  } else {
    div.style.width = ''
    // console.log(window.cb.width);
    // @ts-ignore
    console.log(window.bb.width);

    setTimeout(() => {
      div.style.display = 'none'
    }, 500)
  }
  })
})
document.body.appendChild(style)
document.body.appendChild(btn)
document.body.appendChild(div)
