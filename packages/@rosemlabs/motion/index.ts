import Motion from './Motion'
import Plot from './Plot'

document.body.setAttribute(
  'style',
  'color: #e0d390; background: #373d44; background: linear-gradient(to right bottom, #55324c, #373d44)'
)

const info = document.getElementById('info')!
const plot = new Plot('#canvas', {
  xAxisColor: 'lightslategray',
  yAxisColor: 'lightslategray',
  gridColor: '#4f5761',
  curveColor: 'hotpink',
})
const motion = new Motion({
  duration: 1000,
  process(data) {
    info.textContent = JSON.stringify(data, null, 2)
    plot.draw(data.progress, data.oscillation[data.oscillation.length - 1])
  },
  start() {
    // console.log(performance.now())
    plot.clear()
  },
})
//@ts-ignore
window.motion = motion
const button = document.getElementById('play')!
// remove event listeners
const newButton = button.cloneNode(true)
button.replaceWith(newButton)

motion.from(0)
let count = 0
newButton.addEventListener('click', () => {
  // console.log(performance.now())
  motion.to(++count)
})
// setInterval(() => {motion.to(++count)}, 4800)
