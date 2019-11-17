import Motion from './Motion'
import Plot from './Plot'

const info = document.getElementById('info')!
const plot = new Plot('#canvas', {
  reflectY: true,
})
const motion = new Motion({
  duration: 1000,
  process(data) {
    info.textContent = JSON.stringify(data, null, 2)
    plot.draw(data.progress, data.oscillation[0])
  },
  start() {
    plot.clear()
  },
})
const button = document.getElementById('play')!
// remove event listeners
const newButton = button.cloneNode(true)
button.replaceWith(newButton)

motion.from(0)
let count = 0
newButton.addEventListener('click', () => {
  motion.to(++count)
})
